import math
import random
from state.game_state import GameState
from state import room_manager
from utils.timers import create_phase_timer, clear_phase_timer, get_time_remaining
from config.constants import (
    PHASES,
    RESULTS_DISPLAY_TIME,
    RPS_CHOICES,
    RPS_WINS_NEEDED,
    RPS_CHOICE_TIME,
    RPS_REVEAL_TIME,
    RPS_MAX_ROUNDS,
)

SONG_TIMEOUT_ENABLED = True

async def start_game(sio, room: dict) -> None:
    player_ids = list(room["players"].keys())

    room["last_game_over"] = None
    for player in room["players"].values():
        player["points"] = 0

    room["game_state"] = GameState(room["settings"], player_ids)
    await sio.emit("game-started", room["game_state"].get_serializable(), room=room["code"])
    await start_choosing_phase(sio, room)

async def start_choosing_phase(sio, room: dict) -> None:
    gs: GameState = room["game_state"]
    gs.phase = PHASES["CHOOSING"]

    admitted = [pid for pid, p in room["players"].items() if p["waiting"]]
    if admitted:
        for pid in admitted:
            room["players"][pid]["waiting"] = False
            gs.add_player(pid)
        await sio.emit(
            "players-updated",
            {"players": room_manager.get_player_list(room)},
            room=room["code"],
        )

    await sio.emit(
        "phase-changed",
        {
            "phase": PHASES["CHOOSING"],
            "chooserPlayerId": gs.get_chooser_id(),
            "nextChooserPlayerId": gs.get_next_chooser_id(),
            "currentRound": gs.current_round,
            "totalRounds": gs.total_rounds,
        },
        room=room["code"],
    )

async def start_searching_phase(sio, room: dict) -> None:
    gs: GameState = room["game_state"]
    gs.phase = PHASES["SEARCHING"]

    duration = gs.song_selection_time * 1000

    await sio.emit(
        "phase-changed",
        {
            "phase": PHASES["SEARCHING"],
            "chosenGif": gs.chosen_gif,
            "duration": duration,
            "phaseKey": gs.next_phase_key(),
            "chooserPlayerId": gs.get_chooser_id(),
        },
        room=room["code"],
    )
    async def on_search_timeout():
        await start_listening_phase(sio, room)
    create_phase_timer(room["code"], duration, on_search_timeout)

def _player_name(room: dict, player_id: str) -> str:
    player = room["players"].get(player_id)
    return player["name"] if player else "Unknown"

def _submissions_list(room: dict, gs: GameState) -> list:
    return [
        {
            "playerId": pid,
            "playerName": _player_name(room, pid),
            **song,
        }
        for pid, song in gs.submissions.items()
    ]

def votes_by_target(gs: GameState) -> dict:
    """Live vote attribution for the current voting phase:
    votedForPlayerId -> [voterPlayerId, ...]. Resets with the round."""
    by_target: dict = {}
    for voter, target in gs.votes.items():
        by_target.setdefault(target, []).append(voter)
    return by_target

def _current_song_payload(room: dict, gs: GameState) -> dict | None:
    current_entry = gs.get_current_listening_song()
    if not current_entry:
        return None
    return {
        "playerId": current_entry["player_id"],
        "playerName": _player_name(room, current_entry["player_id"]),
        **current_entry["song"],
    }

async def start_listening_phase(sio, room: dict) -> None:
    gs: GameState = room["game_state"]
    clear_phase_timer(room["code"])

    if len(gs.submissions) == 0:
        gs.next_round()
        if gs.is_game_over():
            await end_game(sio, room)
        else:
            await start_choosing_phase(sio, room)
        return

    gs.start_listening()

    await sio.emit(
        "phase-changed",
        {
            "phase": PHASES["LISTENING"],
            "chosenGif": gs.chosen_gif,
            "submissions": _submissions_list(room, gs),
            "currentSong": _current_song_payload(room, gs),
            "songIndex": gs.listening_index,
            "totalSongs": len(gs.listening_order),
            "skipVoteCount": 0,
            "skipVotesNeeded": math.ceil(len(gs.player_order) / 2),
            "duration": gs.song_length * 1000,
            "phaseKey": gs.next_phase_key(),
        },
        room=room["code"],
    )

    _create_song_timer(sio, room)

def _create_song_timer(sio, room: dict) -> None:
    if not SONG_TIMEOUT_ENABLED:
        return

    gs: GameState = room["game_state"]

    async def on_song_timeout():
        await advance_to_next_song(sio, room)

    create_phase_timer(room["code"], gs.song_length * 1000, on_song_timeout)

async def _emit_current_song(sio, room: dict) -> None:
    gs: GameState = room["game_state"]

    await sio.emit(
        "listening-next-song",
        {
            "currentSong": _current_song_payload(room, gs),
            "songIndex": gs.listening_index,
            "totalSongs": len(gs.listening_order),
            "skipVoteCount": 0,
            "skipVotesNeeded": math.ceil(len(gs.player_order) / 2),
            "duration": gs.song_length * 1000,
            "phaseKey": gs.next_phase_key(),
        },
        room=room["code"],
    )

    _create_song_timer(sio, room)

async def advance_to_next_song(sio, room: dict) -> None:
    gs: GameState = room["game_state"]
    clear_phase_timer(room["code"])

    has_more = gs.advance_listening()

    if not has_more:
        await start_voting_phase(sio, room)
        return

    await _emit_current_song(sio, room)

async def start_voting_phase(sio, room: dict) -> None:
    gs: GameState = room["game_state"]
    clear_phase_timer(room["code"])

    if len(gs.submissions) == 0:
        gs.next_round()
        if gs.is_game_over():
            await end_game(sio, room)
        else:
            await start_choosing_phase(sio, room)
        return

    gs.start_voting()
    duration = gs.voting_time * 1000

    await sio.emit(
        "phase-changed",
        {
            "phase": PHASES["VOTING"],
            "chosenGif": gs.chosen_gif,
            "submissions": _submissions_list(room, gs),
            "duration": duration,
            "phaseKey": gs.next_phase_key(),
        },
        room=room["code"],
    )

    async def on_vote_timeout():
        await end_voting_phase(sio, room)

    create_phase_timer(room["code"], duration, on_vote_timeout)

async def end_voting_phase(sio, room: dict) -> None:
    gs: GameState = room["game_state"]
    if not gs or gs.phase != PHASES["VOTING"]:
        return
    clear_phase_timer(room["code"])

    tally = gs.tally_votes()
    winners = tally["winners"]
    points_awarded = tally["points_awarded"]

    for winner_id in winners:
        player = room["players"].get(winner_id)
        if player:
            player["points"] += points_awarded

    scoreboard = room_manager.get_player_list(room)

    await sio.emit(
        "round-results",
        {
            "roundResults": gs.round_results,
            "winners": [
                room["players"][wid]["name"]
                for wid in winners
                if wid in room["players"]
            ],
            "scoreboard": scoreboard,
            "currentRound": gs.current_round,
            "totalRounds": gs.total_rounds,
            "duration": RESULTS_DISPLAY_TIME,
            "phaseKey": gs.next_phase_key(),
        },
        room=room["code"],
    )

    async def on_results_timeout():
        gs.next_round()
        if gs.is_game_over():
            await end_game(sio, room)
        else:
            await start_choosing_phase(sio, room)

    create_phase_timer(room["code"], RESULTS_DISPLAY_TIME, on_results_timeout)

async def end_game(sio, room: dict) -> None:
    """All rounds are done: play a rock-paper-scissors tiebreaker if the top
    score is shared, otherwise finish immediately."""
    clear_phase_timer(room["code"])
    gs: GameState = room["game_state"]

    active = [p for p in room["players"].values() if not p["waiting"]]
    top_points = max((p["points"] for p in active), default=0)
    tied = [
        pid
        for pid, p in room["players"].items()
        if not p["waiting"] and p["points"] == top_points
    ]

    if gs and len(tied) > 1:
        await start_tiebreaker(sio, room, tied)
        return

    await finish_game(sio, room)

async def finish_game(sio, room: dict, tiebreak_winner_id: str | None = None) -> None:
    clear_phase_timer(room["code"])

    tiebreak_payload = None
    if tiebreak_winner_id:
        winner = room["players"].get(tiebreak_winner_id)
        if winner:
            winner["points"] += 1
            tiebreak_payload = {
                "playerId": tiebreak_winner_id,
                "playerName": winner["name"],
            }

    scoreboard = sorted(
        room_manager.get_player_list(room),
        key=lambda p: p["points"],
        reverse=True,
    )

    result = {
        "scoreboard": scoreboard,
        "winner": scoreboard[0] if scoreboard else None,
        "tiebreakerWinner": tiebreak_payload,
    }

    await sio.emit("game-over", result, room=room["code"])

    room["game_state"] = None
    # Kept so anyone who joins or reconnects while the podium is up is shown the
    # result instead of an empty waiting room. Cleared when the next game starts.
    room["last_game_over"] = result

    # Points deliberately survive until the rematch: zeroing them here made every
    # later players-updated broadcast carry an all-zero scoreboard and blank the
    # podium out from under everyone still looking at it.
    for player in room["players"].values():
        player["waiting"] = False

def _rps_participants_payload(room: dict, gs: GameState) -> list:
    return [
        {"playerId": pid, "playerName": _player_name(room, pid)}
        for pid in gs.rps_participants
    ]

def _create_rps_choice_timer(sio, room: dict) -> None:
    async def on_choice_timeout():
        await resolve_rps_round(sio, room)

    create_phase_timer(room["code"], RPS_CHOICE_TIME, on_choice_timeout)

async def start_tiebreaker(sio, room: dict, tied_player_ids: list) -> None:
    gs: GameState = room["game_state"]
    gs.start_tiebreaker(tied_player_ids)

    await sio.emit(
        "phase-changed",
        {
            "phase": PHASES["TIEBREAKER"],
            "rpsParticipants": _rps_participants_payload(room, gs),
            "rpsWins": dict(gs.rps_wins),
            "rpsRound": gs.rps_round,
            "rpsWinsNeeded": RPS_WINS_NEEDED,
            "rpsChosenCount": 0,
            "duration": RPS_CHOICE_TIME,
            "phaseKey": gs.next_phase_key(),
        },
        room=room["code"],
    )

    _create_rps_choice_timer(sio, room)

async def resolve_rps_round(sio, room: dict) -> None:
    gs: GameState = room["game_state"]
    if not gs or gs.phase != PHASES["TIEBREAKER"] or gs.rps_last_result:
        return
    clear_phase_timer(room["code"])

    for pid in gs.rps_participants:
        if pid not in gs.rps_choices:
            gs.rps_choose(pid, random.choice(RPS_CHOICES))

    result = gs.resolve_rps_round()

    await sio.emit(
        "rps-round-result",
        {
            "rpsRound": result["round"],
            "rpsChoices": result["choices"],
            "rpsRoundWinnerIds": result["winners"],
            "rpsRoundWinnerNames": [
                _player_name(room, pid) for pid in result["winners"]
            ],
            "rpsDraw": result["draw"],
            "rpsWins": dict(gs.rps_wins),
            "rpsParticipants": _rps_participants_payload(room, gs),
            "duration": RPS_REVEAL_TIME,
            "phaseKey": gs.next_phase_key(),
        },
        room=room["code"],
    )

    winner_id = gs.rps_overall_winner()
    if winner_id is None and gs.rps_round >= RPS_MAX_ROUNDS:
        leaders = gs.rps_leaders() or gs.rps_participants
        winner_id = random.choice(leaders) if leaders else None

    async def after_reveal():
        current: GameState = room.get("game_state")
        if not current or current.phase != PHASES["TIEBREAKER"]:
            return
        if winner_id:
            await finish_game(sio, room, tiebreak_winner_id=winner_id)
            return
        current.next_rps_round()
        await sio.emit(
            "rps-next-round",
            {
                "rpsRound": current.rps_round,
                "rpsWins": dict(current.rps_wins),
                "rpsParticipants": _rps_participants_payload(room, current),
                "rpsChosenCount": 0,
                "duration": RPS_CHOICE_TIME,
                "phaseKey": current.next_phase_key(),
            },
            room=room["code"],
        )
        _create_rps_choice_timer(sio, room)

    create_phase_timer(room["code"], RPS_REVEAL_TIME, after_reveal)

async def handle_player_removed(sio, room: dict, removal: dict) -> None:
    """Keep a running game consistent after a player leaves or is kicked."""
    gs: GameState = room["game_state"]
    if not gs or not removal.get("removed") or not gs.player_order:
        return

    phase = gs.phase

    if removal.get("chooser_reassigned") and phase in (
        PHASES["CHOOSING"],
        PHASES["SEARCHING"],
    ):
        await sio.emit(
            "phase-changed",
            {
                "phase": phase,
                "chooserPlayerId": gs.get_chooser_id(),
                "nextChooserPlayerId": gs.get_next_chooser_id(),
                "chooserReassigned": True,
            },
            room=room["code"],
        )

    if phase == PHASES["SEARCHING"]:
        await sio.emit(
            "submission-update",
            {
                "submissionCount": len(gs.submissions),
                "expectedSubmissions": max(len(gs.player_order) - 1, 0),
            },
            room=room["code"],
        )
        if gs.all_submitted():
            await start_listening_phase(sio, room)
        return

    if phase == PHASES["LISTENING"]:
        if removal.get("current_song_removed"):
            clear_phase_timer(room["code"])
            if gs.is_listening_complete():
                await start_voting_phase(sio, room)
            else:
                await _emit_current_song(sio, room)
            return
        await sio.emit(
            "skip-vote-update",
            {
                "skipVoteCount": len(gs.skip_votes),
                "skipVotesNeeded": math.ceil(len(gs.player_order) / 2),
            },
            room=room["code"],
        )
        if gs.should_skip():
            await advance_to_next_song(sio, room)
        return

    if phase == PHASES["VOTING"]:
        await sio.emit(
            "vote-update",
            {
                "voteCount": len(gs.votes),
                "expectedVotes": len(gs.eligible_voters()),
                "votes": votes_by_target(gs),
            },
            room=room["code"],
        )
        if gs.all_voted():
            await end_voting_phase(sio, room)
        return

    if phase == PHASES["TIEBREAKER"]:
        if not removal.get("rps_participant_removed"):
            return
        if len(gs.rps_participants) == 1:
            await finish_game(sio, room, tiebreak_winner_id=gs.rps_participants[0])
            return
        if not gs.rps_participants:
            await finish_game(sio, room)
            return
        await sio.emit(
            "rps-choice-update",
            {
                "rpsChosenCount": len(gs.rps_choices),
                "rpsParticipants": _rps_participants_payload(room, gs),
                "rpsWins": dict(gs.rps_wins),
            },
            room=room["code"],
        )
        if gs.rps_last_result is None and gs.rps_all_chosen():
            await resolve_rps_round(sio, room)

def build_snapshot(room: dict, player_id: str) -> dict | None:
    """Full game snapshot for a (re)joining client to hydrate its UI from."""
    gs: GameState = room["game_state"]
    if not gs:
        last = room.get("last_game_over")
        return {**last, "phase": PHASES["GAME_OVER"]} if last else None

    snap = gs.get_serializable()
    snap["expectedVotes"] = len(gs.eligible_voters())
    remaining = get_time_remaining(room["code"])
    phase = gs.phase

    if phase in (PHASES["SEARCHING"], PHASES["VOTING"]):
        snap["duration"] = remaining

    if phase in (PHASES["LISTENING"], PHASES["VOTING"]):
        snap["submissions"] = _submissions_list(room, gs)

    if phase == PHASES["VOTING"]:
        snap["votes"] = votes_by_target(gs)

    if phase == PHASES["LISTENING"]:
        snap["currentSong"] = _current_song_payload(room, gs)
        snap["songIndex"] = gs.listening_index
        snap["totalSongs"] = len(gs.listening_order)
        snap["skipVoteCount"] = len(gs.skip_votes)
        snap["skipVotesNeeded"] = math.ceil(len(gs.player_order) / 2)
        snap["duration"] = remaining or gs.song_length * 1000

    if phase == PHASES["RESULTS"] and gs.round_results:
        snap["winners"] = [
            _player_name(room, wid)
            for wid in gs.round_results["winners"]
            if wid in room["players"]
        ]
        snap["duration"] = remaining or RESULTS_DISPLAY_TIME

    if phase == PHASES["TIEBREAKER"]:
        snap["rpsParticipants"] = _rps_participants_payload(room, gs)
        snap["rpsWins"] = dict(gs.rps_wins)
        snap["rpsRound"] = gs.rps_round
        snap["rpsWinsNeeded"] = RPS_WINS_NEEDED
        snap["rpsChosenCount"] = len(gs.rps_choices)
        snap["youRpsChose"] = player_id in gs.rps_choices
        snap["duration"] = remaining or RPS_CHOICE_TIME
        if gs.rps_last_result:
            snap["rpsChoices"] = dict(gs.rps_last_result["choices"])
            snap["rpsRoundWinnerIds"] = list(gs.rps_last_result["winners"])
            snap["rpsRoundWinnerNames"] = [
                _player_name(room, pid) for pid in gs.rps_last_result["winners"]
            ]
            snap["rpsDraw"] = gs.rps_last_result["draw"]

    snap["youSubmitted"] = player_id in gs.submissions
    snap["youVoted"] = player_id in gs.votes
    snap["youSkipVoted"] = player_id in gs.skip_votes

    return snap
