import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

def _origins() -> list:
    """Browser origins allowed to reach the API and the socket. Accepts a
    comma-separated list so a deployment can serve apex and www, or a staging
    host alongside production. DEV_ORIGIN stays supported as the local default."""
    raw = os.getenv("ALLOWED_ORIGINS") or os.getenv(
        "DEV_ORIGIN", "http://localhost:3000"
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]

env = {
    "PORT": int(os.getenv("PORT", 3001)),
    "HOST": os.getenv("HOST", "127.0.0.1"),
    "GIPHY_API_KEY": os.getenv("GIPHY_API_KEY"),
    "ALLOWED_ORIGINS": _origins(),
    "COOKIE_SECURE": os.getenv("COOKIE_SECURE", "true").lower()
    not in ("0", "false"),
    "DEV_RELOAD": os.getenv("DEV_RELOAD", "").lower() in ("1", "true"),
}

required = ["GIPHY_API_KEY"]
for key in required:
    if not env[key]:
        raise RuntimeError(f"Missing required environment variable: {key}")
