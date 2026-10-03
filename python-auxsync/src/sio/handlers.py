import logging
import secrets
from state import room_manager
from sio.middleware import socket_auth, clear_rate_limit
from sio.events.lobby import (
    register_lobby_events,
    remove_player_fully,
    schedule_grace_removal,
)
from sio.events.game import register_game_events

log = logging.getLogger(__name__)


def register_all_handlers(sio) -> None:

    @sio.event
    async def connect(sid, environ, auth):
        nickname, room_code, player_id, reconnect_token = await socket_auth(
            sid, environ, auth
        )

        room = room_manager.get_room(room_code)
        if not room:
            raise ConnectionRefusedError("Auth error: Room not found")

        existing = room["players"].get(player_id)
        if not existing:
            raise ConnectionRefusedError("Auth error: No seat claimed")
        if not reconnect_token or not secrets.compare_digest(
            reconnect_token, existing["reconnect_token"]
        ):
            raise ConnectionRefusedError("Auth error: That seat is not yours")

        await sio.save_session(
            sid,
            {"nickname": nickname, "room_code": room_code, "player_id": player_id},
        )
        log.info("Connected: %s (%s)", nickname, sid)

    @sio.event
    async def disconnect(sid):
        clear_rate_limit(sid)

        try:
            session = await sio.get_session(sid)
        except Exception:
            return

        code = session.get("room_code")
        player_id = session.get("player_id")
        room = room_manager.get_room(code) if code else None
        if not room or not player_id:
            return

        player = room["players"].get(player_id)
        if not player or player["sid"] != sid:
            log.debug("Disconnected (stale): %s", sid)
            return

        if room["game_state"]:
            room_manager.mark_disconnected(code, player_id)
            await sio.emit(
                "players-updated",
                {"players": room_manager.get_player_list(room)},
                room=code,
            )
            schedule_grace_removal(sio, code, player_id)
        else:
            await remove_player_fully(sio, room, player_id)

        log.info("Disconnected: %s", sid)

    register_lobby_events(sio)
    register_game_events(sio)
