import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from config.environment import env
from config.limiter import limiter
from routes.rooms import router as rooms_router
from routes.music import router as music_router
from routes.gifs import router as gifs_router
from sio.handlers import register_all_handlers

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=env["ALLOWED_ORIGINS"],
)

fastapi_app = FastAPI(title="AuxSync")

fastapi_app.state.limiter = limiter
fastapi_app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=env["ALLOWED_ORIGINS"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    allow_credentials=True,
)

fastapi_app.include_router(rooms_router, prefix="/api/rooms")
fastapi_app.include_router(music_router, prefix="/api/youtube")
fastapi_app.include_router(gifs_router, prefix="/api/gifs")

register_all_handlers(sio)

app = socketio.ASGIApp(sio, fastapi_app)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=env["HOST"],
        port=env["PORT"],
        reload=env["DEV_RELOAD"],
    )
