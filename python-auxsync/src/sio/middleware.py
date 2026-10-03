import time
from utils.seat_cookie import read_seat_token_from_environ
from validators.room_validators import (
    validate_nickname,
    validate_room_code,
    validate_player_id,
)

_timestamps: dict[str, list] = {}
_EVENT_LIMIT = 30
_WINDOW_MS = 10_000

async def socket_auth(sid, environ, auth):
    """
    Validate nickname, roomCode and playerId from socket handshake auth, and
    read the seat token from the HttpOnly cookie the browser sends with the
    handshake. Raises ConnectionRefusedError to reject the connection.
    """
    auth = auth or {}
    nickname = auth.get("nickname")
    room_code = auth.get("roomCode")
    player_id = auth.get("playerId")

    name_result = validate_nickname(nickname)
    if not name_result["valid"]:
        raise ConnectionRefusedError(f"Auth error: {name_result['error']}")

    code_result = validate_room_code(room_code)
    if not code_result["valid"]:
        raise ConnectionRefusedError(f"Auth error: {code_result['error']}")

    pid_result = validate_player_id(player_id)
    if not pid_result["valid"]:
        raise ConnectionRefusedError(f"Auth error: {pid_result['error']}")

    token = read_seat_token_from_environ(environ or {}, code_result["value"])

    return name_result["value"], code_result["value"], pid_result["value"], token

async def check_rate_limit(sio, sid: str) -> bool:
    now = time.monotonic() * 1000
    timestamps = _timestamps.get(sid, [])
    timestamps = [t for t in timestamps if now - t <= _WINDOW_MS]

    if len(timestamps) >= _EVENT_LIMIT:
        await sio.emit("error-message", {"error": "Rate limit exceeded"}, to=sid)
        await sio.disconnect(sid)
        return False

    timestamps.append(now)
    _timestamps[sid] = timestamps
    return True

def clear_rate_limit(sid: str) -> None:
    _timestamps.pop(sid, None)
