import math
from state import room_manager, match_manager
from config.constants import MIN_PLAYERS_TO_START, PHASES
from validators.game_validators import validate_song_submission, validate_vote, validate_gif
from sio.middleware import check_rate_limit

async def _game_context(sio, sid):
    """Resolve (room, player_id) for an in-game event, or an error dict."""
    session = await sio.get_session(sid)
    code = session["room_code"]
    player_id = session["player_id"]
    room = room_manager.get_room(code)
    if not room or not room["game_state"]:
        return None, None, {"error": "No active game"}

    player = room["players"].get(player_id)
    if not player or player["sid"] != sid:
        return None, None, {"error": "You are not in this room"}
    if player["waiting"]:
        return None, None, {"error": "You join at the next round"}

    return room, player_id, None

def register_game_events(sio):

    @sio.on("start-game")
    async def on_start_game(sid, *_):
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
            return {"error": "Only the host can start the game"}
        if room["game_state"]:
            return {"error": "Game already in progress"}
        if len(room["players"]) < MIN_PLAYERS_TO_START:
            return {"error": f"Need at least {MIN_PLAYERS_TO_START} players to start"}

        room_manager.touch_room(code)
        await match_manager.start_game(sio, room)
        return {"success": True}

    @sio.on("gif-chosen")
    async def on_gif_chosen(sid, gif):
        if not await check_rate_limit(sio, sid):
            return

        room, player_id, error = await _game_context(sio, sid)
        if error:
            return error

        gs = room["game_state"]
        if gs.phase != PHASES["CHOOSING"]:
            return {"error": "Not in choosing phase"}
        if gs.get_chooser_id() != player_id:
            return {"error": "You are not the chooser"}

        validation = validate_gif(gif)
        if not validation["valid"]:
            return {"error": validation["error"]}

        room_manager.touch_room(room["code"])
        gs.set_gif(validation["value"])

        await match_manager.start_searching_phase(sio, room)
        return {"success": True}

    @sio.on("song-submitted")
    async def on_song_submitted(sid, data):
        if not await check_rate_limit(sio, sid):
            return

        room, player_id, error = await _game_context(sio, sid)
        if error:
            return error

        gs = room["game_state"]
        if gs.phase != PHASES["SEARCHING"]:
            return {"error": "Not in searching phase"}

        validation = validate_song_submission(data or {})
        if not validation["valid"]:
            return {"error": validation["error"]}

        room_manager.touch_room(room["code"])
        success = gs.submit_song(player_id, validation["value"])

        if not success:
            return {"error": "Cannot submit (already submitted or you are the chooser)"}

        await sio.emit(
            "submission-update",
            {
                "submissionCount": len(gs.submissions),
                "expectedSubmissions": len(gs.player_order) - 1,
            },
            room=room["code"],
        )

        if gs.all_submitted():
            await match_manager.start_listening_phase(sio, room)

        return {"success": True}

    @sio.on("vote-skip")
    async def on_vote_skip(sid, *_):
        if not await check_rate_limit(sio, sid):
            return

        room, player_id, error = await _game_context(sio, sid)
        if error:
            return error

        gs = room["game_state"]
        if gs.phase != PHASES["LISTENING"]:
            return {"error": "Not in listening phase"}

        success = gs.vote_skip(player_id)
        if not success:
            return {"error": "Already voted to skip"}

        room_manager.touch_room(room["code"])
        await sio.emit(
            "skip-vote-update",
            {
                "skipVoteCount": len(gs.skip_votes),
                "skipVotesNeeded": math.ceil(len(gs.player_order) / 2),
            },
            room=room["code"],
        )

        if gs.should_skip():
            await match_manager.advance_to_next_song(sio, room)

        return {"success": True}

    @sio.on("vote-cast")
    async def on_vote_cast(sid, voted_for_player_id):
        if not await check_rate_limit(sio, sid):
            return

        if not isinstance(voted_for_player_id, str):
            return {"error": "Invalid vote target"}

        room, player_id, error = await _game_context(sio, sid)
        if error:
            return error

        gs = room["game_state"]
        if gs.phase != PHASES["VOTING"]:
            return {"error": "Not in voting phase"}

        validation = validate_vote(player_id, voted_for_player_id, gs.submissions)
        if not validation["valid"]:
            return {"error": validation["error"]}

        success = gs.cast_vote(player_id, voted_for_player_id)
        if not success:
            return {"error": "Vote failed (already voted or invalid target)"}

        room_manager.touch_room(room["code"])

        await sio.emit(
            "vote-update",
            {
                "voteCount": len(gs.votes),
                "expectedVotes": len(gs.eligible_voters()),
                "votes": match_manager.votes_by_target(gs),
            },
            room=room["code"],
        )

        if gs.all_voted():
            await match_manager.end_voting_phase(sio, room)

        return {"success": True}

    @sio.on("rps-choice")
    async def on_rps_choice(sid, choice):
        if not await check_rate_limit(sio, sid):
            return

        if not isinstance(choice, str):
            return {"error": "Invalid choice"}

        room, player_id, error = await _game_context(sio, sid)
        if error:
            return error

        gs = room["game_state"]
        if gs.phase != PHASES["TIEBREAKER"]:
            return {"error": "Not in the tiebreaker"}
        if gs.rps_last_result is not None:
            return {"error": "Round already resolved"}

        if not gs.rps_choose(player_id, choice):
            return {
                "error": "Cannot choose (not a participant, already chose, or invalid gesture)"
            }

        room_manager.touch_room(room["code"])

        await sio.emit(
            "rps-choice-update",
            {"rpsChosenCount": len(gs.rps_choices)},
            room=room["code"],
        )

        if gs.rps_all_chosen():
            await match_manager.resolve_rps_round(sio, room)

        return {"success": True}
