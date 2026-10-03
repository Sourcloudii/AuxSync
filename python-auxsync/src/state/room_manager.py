import asyncio
import secrets
from utils.room_code import generate_room_code
from utils.timers import clear_phase_timer
from config.constants import (
    MAX_PLAYERS,
    PFP_COUNT,
    DEFAULT_ROUNDS,
    DEFAULT_VOTING_TIME,
    DEFAULT_SONG_SELECTION_TIME,
    DEFAULT_SONG_LENGTH,
    ROOM_IDLE_TIMEOUT,
)

_rooms: dict = {}
_idle_timers: dict[str, asyncio.Task] = {}

def _default_settings() -> dict:
    return {
        "rounds": DEFAULT_ROUNDS,
        "votingTime": DEFAULT_VOTING_TIME,
        "songSelectionTime": DEFAULT_SONG_SELECTION_TIME,
        "songLength": DEFAULT_SONG_LENGTH,
        "gifOption": "single",
        "gifSubOption": "one",
        "searchEnabled": True,
    }

async def _idle_task(code: str) -> None:
    await asyncio.sleep(ROOM_IDLE_TIMEOUT / 1000)
    delete_room(code)

def _reset_idle_timer(code: str) -> None:
    existing = _idle_timers.pop(code, None)
    if existing:
        existing.cancel()
    task = asyncio.create_task(_idle_task(code))
    _idle_timers[code] = task

def create_room() -> dict:
    code = generate_room_code(set(_rooms.keys()))
    room = {
        "code": code,
        "host_id": None,
        "players": {},
        "settings": _default_settings(),
        "game_state": None,
        "last_game_over": None,
        "search_cache": {},
        "grace_tasks": {},
    }
    _rooms[code] = room
    _reset_idle_timer(code)
    return room

def _assign_pfp_index(room: dict) -> int:
    taken = {p["pfp_index"] for p in room["players"].values()}
    free = [i for i in range(PFP_COUNT) if i not in taken]
    return secrets.choice(free) if free else secrets.randbelow(PFP_COUNT)

def join_room(code: str, player_id: str, socket_id: str, player_name: str) -> dict:
    room = _rooms.get(code)
    if not room:
        return {"error": "Room not found"}
    if len(room["players"]) >= MAX_PLAYERS:
        return {"error": "Room is full"}

    for player in room["players"].values():
        if player["name"] == player_name:
            return {"error": "Nickname already taken in this room"}

    is_host = room["host_id"] is None
    if is_host:
        room["host_id"] = player_id

    waiting = room["game_state"] is not None

    room["players"][player_id] = {
        "name": player_name,
        "pfp_index": _assign_pfp_index(room),
        "points": 0,
        "is_host": is_host,
        "sid": socket_id,
        "connected": socket_id is not None,
        "waiting": waiting,
        "announced": False,
        "reconnect_token": secrets.token_urlsafe(32),
    }
    _reset_idle_timer(code)
    return {"room": room, "waiting": waiting}

def rotate_seat_token(code: str, player_id: str) -> str | None:
    """A fresh token on every claim, so one that leaks is only good until the
    owner next comes back. It is only ever sent as an HttpOnly cookie."""
    room = _rooms.get(code)
    player = room["players"].get(player_id) if room else None
    if not player:
        return None

    player["reconnect_token"] = secrets.token_urlsafe(32)
    return player["reconnect_token"]

def bind_seat(code: str, player_id: str, socket_id: str) -> dict | None:
    """Attach a claimed seat to the socket that is now holding it."""
    room = _rooms.get(code)
    if not room:
        return None
    player = room["players"].get(player_id)
    if not player:
        return None

    task = room["grace_tasks"].pop(player_id, None)
    if task:
        task.cancel()

    was_announced = player["announced"]
    player["sid"] = socket_id
    player["connected"] = True
    player["announced"] = True
    _reset_idle_timer(code)
    return {"room": room, "player": player, "first_bind": not was_announced}

def schedule_unclaimed_cleanup(code: str, player_id: str, timeout_ms: int) -> None:
    """Drop a seat that was claimed over HTTP but never bound a socket. Nothing
    was broadcast for it yet, so it can go without telling the room."""
    room = _rooms.get(code)
    if not room:
        return

    existing = room["grace_tasks"].pop(player_id, None)
    if existing:
        existing.cancel()

    async def _expire():
        await asyncio.sleep(timeout_ms / 1000)
        current = _rooms.get(code)
        if not current:
            return
        player = current["players"].get(player_id)
        if not player or player["announced"]:
            return
        current["grace_tasks"].pop(player_id, None)
        leave_room(code, player_id)

    room["grace_tasks"][player_id] = asyncio.create_task(_expire())

def mark_disconnected(code: str, player_id: str) -> bool:
    room = _rooms.get(code)
    player = room["players"].get(player_id) if room else None
    if not player:
        return False
    player["connected"] = False
    player["sid"] = None
    return True

def leave_room(code: str, player_id: str) -> dict | None:
    room = _rooms.get(code)
    if not room:
        return None

    task = room["grace_tasks"].pop(player_id, None)
    if task:
        task.cancel()

    room["players"].pop(player_id, None)

    if len(room["players"]) == 0:
        delete_room(code)
        return {"empty": True}

    if room["host_id"] == player_id:
        candidates = [
            pid for pid, p in room["players"].items() if p["connected"]
        ] or list(room["players"])
        new_host_id = secrets.choice(candidates)
        room["host_id"] = new_host_id
        room["players"][new_host_id]["is_host"] = True
        _reset_idle_timer(code)
        return {"new_host_id": new_host_id, "new_host_name": room["players"][new_host_id]["name"]}

    _reset_idle_timer(code)
    return {}

def owns_seat(room: dict, player_id: str, socket_id: str) -> bool:
    """True when player_id occupies a live seat bound to this exact socket.
    Privileged actions must gate on this, not just on a session's player_id -
    playerId is public, so a ghost socket can present someone else's id."""
    player = room["players"].get(player_id)
    return bool(player and player["sid"] == socket_id)

def get_room(code: str) -> dict | None:
    return _rooms.get(code)

def delete_room(code: str) -> None:
    room = _rooms.pop(code, None)
    clear_phase_timer(code)
    if room:
        for task in room["grace_tasks"].values():
            task.cancel()
        room["grace_tasks"] = {}
    task = _idle_timers.pop(code, None)
    if task:
        task.cancel()

def touch_room(code: str) -> None:
    if code in _rooms:
        _reset_idle_timer(code)

def get_player_list(room: dict) -> list:
    return [
        {
            "playerId": pid,
            "name": p["name"],
            "pfpIndex": p["pfp_index"],
            "points": p["points"],
            "isHost": p["is_host"],
            "connected": p["connected"],
            "waiting": p["waiting"],
        }
        for pid, p in room["players"].items()
    ]

def get_room_count() -> int:
    return len(_rooms)
