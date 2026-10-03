import secrets
from config.constants import ROOM_CODE_LENGTH

_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

def generate_room_code(existing_codes: set) -> str:
    max_attempts = 100
    for _ in range(max_attempts):
        code = "".join(secrets.choice(_CHARS) for _ in range(ROOM_CODE_LENGTH))
        if code not in existing_codes:
            return code
    raise RuntimeError("Failed to generate unique room code")
