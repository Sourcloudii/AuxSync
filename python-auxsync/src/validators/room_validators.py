import re
from config.constants import MAX_NICKNAME_LENGTH, MIN_NICKNAME_LENGTH, ROOM_CODE_LENGTH

_NICKNAME_PATTERN = re.compile(r"^[a-zA-Z0-9 _-]+$")
_PLAYER_ID_PATTERN = re.compile(r"^[a-zA-Z0-9-]{8,64}$")

def validate_player_id(player_id) -> dict:
    if not isinstance(player_id, str) or not _PLAYER_ID_PATTERN.match(player_id):
        return {"valid": False, "error": "Invalid player id"}
    return {"valid": True, "value": player_id}

def validate_nickname(name) -> dict:
    if not isinstance(name, str):
        return {"valid": False, "error": "Nickname must be a string"}

    trimmed = name.strip()

    if len(trimmed) < MIN_NICKNAME_LENGTH or len(trimmed) > MAX_NICKNAME_LENGTH:
        return {
            "valid": False,
            "error": f"Nickname must be {MIN_NICKNAME_LENGTH}-{MAX_NICKNAME_LENGTH} characters",
        }

    if not _NICKNAME_PATTERN.match(trimmed):
        return {
            "valid": False,
            "error": "Nickname can only contain letters, numbers, spaces, hyphens, and underscores",
        }

    return {"valid": True, "value": trimmed}

def validate_room_code(code) -> dict:
    if not isinstance(code, str):
        return {"valid": False, "error": "Room code must be a string"}

    upper = code.strip().upper()

    if len(upper) != ROOM_CODE_LENGTH:
        return {
            "valid": False,
            "error": f"Room code must be exactly {ROOM_CODE_LENGTH} characters",
        }

    if not re.match(r"^[A-Z0-9]+$", upper):
        return {
            "valid": False,
            "error": "Room code can only contain letters and numbers",
        }

    return {"valid": True, "value": upper}
