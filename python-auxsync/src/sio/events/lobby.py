import asyncio
from state import room_manager
from state import match_manager
from config.constants import RECONNECT_GRACE_MS, MAX_PLAYERS
from validators.game_validators import validate_settings
from sio.middleware import check_rate_limit

def register_lobby_events(sio):

    @sio.on("join-room")
    async def on_join_room(sid, *_):
        if not await check_rate_limit(sio, sid):
            return

        session = await sio.get_session(sid)
        code = session["room_code"]
        player_id = session["player_id"]

        room = room_manager.get_room(code)
        if not room:
            return {"error": "Room not found"}

        existing = room["players"].get(player_id)
        if not existing:
            return {"error": "Could not reconnect to your seat"}

        stale_sid = None
        if existing["connected"] and existing["sid"] and existing["sid"] != sid:
            stale_sid = existing["sid"]

        result = room_manager.bind_seat(code, player_id, sid)
        player = result["player"]
        first_bind = result["first_bind"]

        if stale_sid:
            await sio.disconnect(stale_sid)

        await sio.enter_room(sid, code)

        if first_bind:
            await sio.emit(
                "player-joined",
                {
                    "name": player["name"],
                    "pfpIndex": player["pfp_index"],
                    "players": room_manager.get_player_list(room),
                },
                room=code,
                skip_sid=sid,
            )
        else:
            await sio.emit(
                "players-updated",
                {"players": room_manager.get_player_list(room)},
                room=code,
                skip_sid=sid,
            )

        return _join_ack(room, player_id, player, reconnected=not first_bind)

    @sio.on("leave-room")
    async def on_leave_room(sid):
        if not await check_rate_limit(sio, sid):
            return
        await handle_leave(sio, sid)

    @sio.on("update-settings")
    async def on_update_settings(sid, settings):
        if not await check_rate_limit(sio, sid):
            return

        session = await sio.get_session(sid)
        code = session["room_code"]
        player_id = session["player_id"]
        room = room_manager.get_room(code)
        if not room:
            return {"error": "Room not found"}
        if not room_manager.owns_seat(room, player_id, sid):
            return {"error": "You are not in this room"}
        if room["host_id"] != player_id:
            return {"error": "Only the host can update settings"}
        if room["game_state"]:
            return {"error": "Cannot change settings during a game"}

        result = validate_settings(settings or {})
        if not result["valid"]:
            return {"error": result["error"]}

        room["settings"] = {
            "rounds": settings["rounds"],
            "votingTime": settings["votingTime"],
            "songSelectionTime": settings["songSelectionTime"],
            "songLength": settings["songLength"],
            "gifOption": settings["gifOption"],
            "gifSubOption": settings["gifSubOption"],
            "searchEnabled": settings["searchEnabled"],
        }
        await sio.emit("settings-updated", room["settings"], room=code, skip_sid=sid)
        return {"success": True}

    @sio.on("kick-player")
    async def on_kick_player(sid, target_player_id):
        if not await check_rate_limit(sio, sid):
            return

        session = await sio.get_session(sid)
        code = session["room_code"]
        player_id = session["player_id"]
        room = room_manager.get_room(code)
        if not room:
            return {"error": "Room not found"}
        if not room_manager.owns_seat(room, player_id, sid):
            return {"error": "You are not in this room"}
        if room["host_id"] != player_id:
            return {"error": "Only the host can kick players"}
        if not isinstance(target_player_id, str):
            return {"error": "Invalid target"}
        if target_player_id == player_id:
            return {"error": "Cannot kick yourself"}
        if target_player_id not in room["players"]:
            return {"error": "Player not in room"}

        kicked_player = room["players"][target_player_id]
        kicked_name = kicked_player["name"]
        kicked_sid = kicked_player["sid"]
        room_manager.leave_room(code, target_player_id)

        removal = None
        if room.get("game_state"):
            removal = room["game_state"].remove_player(target_player_id)

        if kicked_sid:
            await sio.emit("kicked", {}, to=kicked_sid)
            await sio.leave_room(kicked_sid, code)

        players = room_manager.get_player_list(room)
        await sio.emit(
            "player-left",
            {"name": kicked_name, "kicked": True, "players": players},
            room=code,
        )

        if removal:
            await match_manager.handle_player_removed(sio, room, removal)

        if kicked_sid:
            await sio.disconnect(kicked_sid)

        return {"success": True}

def _join_ack(room: dict, player_id: str, player: dict, reconnected: bool) -> dict:
    host_player = room["players"].get(room["host_id"])
    return {
        "success": True,
        "reconnected": reconnected,
        "playerId": player_id,
        "myName": player["name"],
        "isHost": player["is_host"],
        "waiting": player["waiting"],
        "players": room_manager.get_player_list(room),
        "maxPlayers": MAX_PLAYERS,
        "settings": room["settings"],
        "hostName": host_player["name"] if host_player else None,
        "game": match_manager.build_snapshot(room, player_id),
    }

async def remove_player_fully(sio, room: dict, player_id: str) -> None:
    """Definitive removal: from the room, the socket.io room, and the game."""
    code = room["code"]
    player = room["players"].get(player_id)
    if not player:
        return

    player_sid = player["sid"]
    result = room_manager.leave_room(code, player_id)
    if player_sid:
        await sio.leave_room(player_sid, code)

    if result is None or result.get("empty"):
        return

    removal = None
    if room.get("game_state"):
        removal = room["game_state"].remove_player(player_id)

    players = room_manager.get_player_list(room)
    payload = {"name": player["name"], "players": players}

    if result.get("new_host_id"):
        payload["newHost"] = result["new_host_name"]
        payload["newHostId"] = result["new_host_id"]

    await sio.emit("player-left", payload, room=code)

    if removal:
        await match_manager.handle_player_removed(sio, room, removal)

def schedule_grace_removal(sio, code: str, player_id: str) -> None:
    """Hold a disconnected player's seat; remove them when the grace expires."""
    room = room_manager.get_room(code)
    if not room:
        return

    existing = room["grace_tasks"].pop(player_id, None)
    if existing:
        existing.cancel()

    async def _expire():
        await asyncio.sleep(RECONNECT_GRACE_MS / 1000)
        current = room_manager.get_room(code)
        if not current:
            return
        player = current["players"].get(player_id)
        if not player or player["connected"]:
            return
        current["grace_tasks"].pop(player_id, None)
        await remove_player_fully(sio, current, player_id)

    room["grace_tasks"][player_id] = asyncio.create_task(_expire())

async def handle_leave(sio, sid: str) -> None:
    try:
        session = await sio.get_session(sid)
    except Exception:
        return

    code = session.get("room_code")
    player_id = session.get("player_id")
    if not code or not player_id:
        return

    room = room_manager.get_room(code)
    if not room:
        return

    if not room_manager.owns_seat(room, player_id, sid):
        return

    await remove_player_fully(sio, room, player_id)
