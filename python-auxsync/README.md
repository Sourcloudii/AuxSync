# python-auxsync

## Setup

```bash
# 1. Create and activate virtualenv
py -m venv .venv
.venv/Scripts/activate     # Windows
# source .venv/bin/activate  # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy env file and fill in your key
copy .env.example .env
```

## Running

```bash
# From the python-auxsync directory
.venv/Scripts/python.exe src/main.py
```

## Project structure

```
src/
  main.py              # App entry point (FastAPI + socketio ASGI app)
  config/
    constants.py       # Shared game constants
    environment.py     # Env var loading + validation
  routes/
    health.py          # GET /api/health
    rooms.py           # POST/GET /api/rooms
    music.py           # GET /api/youtube/search  (ytmusicapi)
    gifs.py            # GET /api/gifs/trending|search
  state/
    game_state.py      # Per-room game state (rounds, phases, votes)
    room_manager.py    # In-memory room store
    match_manager.py   # Phase transition orchestration
  sio/
    middleware.py      # Socket auth + rate limiting
    handlers.py        # Registers all socket event handlers
    events/
      lobby.py         # join-room, leave-room, update-settings, kick-player
      game.py          # start-game, gif-chosen, song-submitted, vote-skip, vote-cast
  utils/
    room_code.py       # Cryptographically secure room code generator
    timers.py          # Async phase timers
  validators/
    room_validators.py
    game_validators.py
```
