import secrets
from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel
from state import room_manager
from config.limiter import limiter
from config.constants import MAX_ROOMS, UNCLAIMED_SEAT_TIMEOUT_MS
from utils.seat_cookie import read_seat_token, set_seat_cookie
from validators.room_validators import (
    validate_nickname,
    validate_room_code,
    validate_player_id,
)

router = APIRouter()

class CreateRoomBody(BaseModel):
    nickname: str

class ClaimSeatBody(BaseModel):
    nickname: str
    playerId: str

@router.post("/", status_code=201)
@limiter.limit("30/minute")
async def create_room(request: Request, body: CreateRoomBody):
    name_result = validate_nickname(body.nickname)
    if not name_result["valid"]:
        raise HTTPException(status_code=400, detail=name_result["error"])

    if room_manager.get_room_count() >= MAX_ROOMS:
        raise HTTPException(status_code=503, detail="Server is at capacity, try again later")

    room = room_manager.create_room()
    return {"roomCode": room["code"], "hostName": name_result["value"]}

@router.post("/{code}/seat")
@limiter.limit("30/minute")
async def claim_seat(
    request: Request, response: Response, code: str, body: ClaimSeatBody
):
    """Take a seat in a room and receive its credential as an HttpOnly cookie.

    The token is never returned in the body: browser JavaScript must not be able
    to read it, or any XSS on the page could lift it and steal the seat. Taking
    a free seat needs nothing but the room code, exactly as before; returning to
    a seat that already exists requires the cookie from when it was claimed.
    """
    code_result = validate_room_code(code)
    if not code_result["valid"]:
        raise HTTPException(status_code=400, detail=code_result["error"])

    name_result = validate_nickname(body.nickname)
    if not name_result["valid"]:
        raise HTTPException(status_code=400, detail=name_result["error"])

    pid_result = validate_player_id(body.playerId)
    if not pid_result["valid"]:
        raise HTTPException(status_code=400, detail=pid_result["error"])

    room_code = code_result["value"]
    player_id = pid_result["value"]

    room = room_manager.get_room(room_code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    existing = room["players"].get(player_id)

    if existing:
        supplied = read_seat_token(request, room_code)
        if not supplied or not secrets.compare_digest(
            supplied, existing["reconnect_token"]
        ):
            raise HTTPException(status_code=403, detail="That seat is not yours")
        token = room_manager.rotate_seat_token(room_code, player_id)
        set_seat_cookie(response, room_code, token)
        return {"roomCode": room_code, "reconnected": True}

    result = room_manager.join_room(
        room_code, player_id, None, name_result["value"]
    )
    if "error" in result:
        raise HTTPException(status_code=409, detail=result["error"])

    room_manager.schedule_unclaimed_cleanup(
        room_code, player_id, UNCLAIMED_SEAT_TIMEOUT_MS
    )

    token = room["players"][player_id]["reconnect_token"]
    set_seat_cookie(response, room_code, token)
    return {"roomCode": room_code, "reconnected": False}

@router.get("/{code}")
@limiter.limit("30/minute")
async def get_room(request: Request, code: str):
    code_result = validate_room_code(code)
    if not code_result["valid"]:
        raise HTTPException(status_code=400, detail=code_result["error"])

    room = room_manager.get_room(code_result["value"])
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    return {
        "roomCode": room["code"],
        "playerCount": len(room["players"]),
        "inGame": room["game_state"] is not None,
    }
