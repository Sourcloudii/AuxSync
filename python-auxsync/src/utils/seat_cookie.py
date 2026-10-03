from http.cookies import SimpleCookie
from config.constants import SEAT_COOKIE_NAME, SEAT_COOKIE_MAX_AGE
from config.environment import env

_MAX_TOKEN_LENGTH = 128


def _token_from_value(value: str | None, code: str) -> str | None:
    """Cookie value is "<roomCode>.<token>", so a cookie left over from another
    room is ignored rather than compared against this room's seat."""
    if not value or "." not in value:
        return None

    room_code, _, token = value.partition(".")
    if room_code != code or not token:
        return None
    if not token.isascii() or len(token) > _MAX_TOKEN_LENGTH:
        return None

    return token


def read_seat_token(request, code: str) -> str | None:
    """The seat token from an HTTP request's cookies."""
    return _token_from_value(request.cookies.get(SEAT_COOKIE_NAME), code)


def read_seat_token_from_environ(environ: dict, code: str) -> str | None:
    """The seat token from a socket.io handshake, which exposes the raw header."""
    header = environ.get("HTTP_COOKIE")
    if not header:
        return None

    try:
        jar = SimpleCookie()
        jar.load(header)
    except Exception:
        return None

    morsel = jar.get(SEAT_COOKIE_NAME)
    return _token_from_value(morsel.value if morsel else None, code)


def set_seat_cookie(response, code: str, token: str) -> None:
    response.set_cookie(
        SEAT_COOKIE_NAME,
        f"{code}.{token}",
        max_age=SEAT_COOKIE_MAX_AGE,
        httponly=True,
        secure=env["COOKIE_SECURE"],
        samesite="lax",
        path="/",
    )


def clear_seat_cookie(response) -> None:
    response.delete_cookie(SEAT_COOKIE_NAME, path="/")
