import math
import secrets
from config.constants import PHASES, RPS_CHOICES, RPS_WINS_NEEDED

class GameState:
    def __init__(self, settings: dict, player_ids: list):
        self.total_rounds: int = settings["rounds"]
        self.current_round: int = 1
        self.phase: str = PHASES["CHOOSING"]
        self.song_selection_time: int = settings["songSelectionTime"]
        self.song_length: int = settings["songLength"]
        self.voting_time: int = settings["votingTime"]
        self.gif_option: str = settings["gifOption"]
        self.gif_sub_option: str = settings["gifSubOption"]
        self.search_enabled: bool = settings["searchEnabled"]

        self.player_order: list = list(player_ids)
        self.chooser_index: int = (
            secrets.randbelow(len(self.player_order)) if self.player_order else 0
        )
        self.phase_key: int = 0

        self.chosen_gif = None
        self.submissions: dict = {}
        self.votes: dict = {}
        self.round_results = None

        self.listening_index: int = 0
        self.listening_order: list = []
        self.skip_votes: set = set()

        self.rps_participants: list = []
        self.rps_wins: dict = {}
        self.rps_round: int = 0
        self.rps_choices: dict = {}
        self.rps_last_result: dict | None = None

    def next_phase_key(self) -> int:
        """Stamps each newly started phase timer so the client can tell one
        countdown from the next even when phase and duration are unchanged."""
        self.phase_key += 1
        return self.phase_key

    def get_chooser_id(self) -> str:
        return self.player_order[self.chooser_index % len(self.player_order)]

    def add_player(self, player_id: str) -> None:
        """Fold a waiting player into the match (called at round start)."""
        if player_id not in self.player_order:
            self.player_order.append(player_id)

    def get_next_chooser_id(self) -> str:
        return self.player_order[(self.chooser_index + 1) % len(self.player_order)]

    def set_gif(self, gif: dict) -> None:
        self.chosen_gif = gif
        self.phase = PHASES["SEARCHING"]

    def submit_song(self, player_id: str, song: dict) -> bool:
        if player_id == self.get_chooser_id():
            return False
        if player_id in self.submissions:
            return False
        self.submissions[player_id] = song
        return True

    def all_submitted(self) -> bool:
        non_choosers = [
            sid for sid in self.player_order if sid != self.get_chooser_id()
        ]
        return all(sid in self.submissions for sid in non_choosers)

    def start_voting(self) -> None:
        self.phase = PHASES["VOTING"]

    # Listening phase

    def start_listening(self) -> None:
        self.phase = PHASES["LISTENING"]
        self.listening_index = 0
        self.listening_order = list(self.submissions.keys())
        self.skip_votes = set()

    def get_current_listening_song(self):
        if self.listening_index >= len(self.listening_order):
            return None
        player_id = self.listening_order[self.listening_index]
        return {"player_id": player_id, "song": self.submissions[player_id]}

    def vote_skip(self, player_id: str) -> bool:
        if player_id in self.skip_votes:
            return False
        self.skip_votes.add(player_id)
        return True

    def should_skip(self) -> bool:
        majority = math.ceil(len(self.player_order) / 2)
        return len(self.skip_votes) >= majority

    def advance_listening(self) -> bool:
        self.listening_index += 1
        self.skip_votes = set()
        return self.listening_index < len(self.listening_order)

    def is_listening_complete(self) -> bool:
        return self.listening_index >= len(self.listening_order)

    # Voting

    def cast_vote(self, voter_id: str, voted_for_id: str) -> bool:
        if voter_id == voted_for_id:
            return False
        if voter_id in self.votes:
            return False
        if voted_for_id not in self.submissions:
            return False
        self.votes[voter_id] = voted_for_id
        return True

    def eligible_voters(self) -> list:
        """Players who can cast a valid vote: at least one submission exists
        that isn't their own. A player whose only possible target is
        themselves (e.g. the sole non-chooser in a 2-player game) is
        excluded, since cast_vote() forbids self-votes and they could never
        satisfy an "everyone voted" check otherwise."""
        return [
            pid
            for pid in self.player_order
            if any(target != pid for target in self.submissions)
        ]

    def all_voted(self) -> bool:
        return all(sid in self.votes for sid in self.eligible_voters())

    def tally_votes(self) -> dict:
        vote_counts: dict = {}
        for voted_for in self.votes.values():
            vote_counts[voted_for] = vote_counts.get(voted_for, 0) + 1

        max_votes = 0
        winners = []
        for player_id, count in vote_counts.items():
            if count > max_votes:
                max_votes = count
                winners = [player_id]
            elif count == max_votes:
                winners.append(player_id)

        self.round_results = {
            "voteCounts": vote_counts,
            "winners": winners,
            "submissions": dict(self.submissions),
        }
        self.phase = PHASES["RESULTS"]

        return {
            "winners": winners,
            "points_awarded": 1 if max_votes > 0 else 0,
            "vote_counts": vote_counts,
        }

    def next_round(self) -> None:
        self.current_round += 1
        self.chooser_index += 1
        self.chosen_gif = None
        self.submissions = {}
        self.votes = {}
        self.round_results = None
        self.listening_index = 0
        self.listening_order = []
        self.skip_votes = set()
        self.phase = PHASES["CHOOSING"]

    def is_game_over(self) -> bool:
        return self.current_round > self.total_rounds

    # Tiebreaker

    def start_tiebreaker(self, tied_player_ids: list) -> None:
        self.phase = PHASES["TIEBREAKER"]
        self.rps_participants = list(tied_player_ids)
        self.rps_wins = {pid: 0 for pid in tied_player_ids}
        self.rps_round = 1
        self.rps_choices = {}
        self.rps_last_result = None

    def rps_choose(self, player_id: str, choice: str) -> bool:
        if player_id not in self.rps_participants:
            return False
        if player_id in self.rps_choices:
            return False
        if choice not in RPS_CHOICES:
            return False
        self.rps_choices[player_id] = choice
        return True

    def rps_all_chosen(self) -> bool:
        return all(pid in self.rps_choices for pid in self.rps_participants)

    def resolve_rps_round(self) -> dict:
        """Resolve the current rps round. With exactly two distinct gestures
        the standard relation applies and every holder of the winning gesture
        takes the round; all-same or all-three-present is a draw (replayed)."""
        beats = {"rock": "scissors", "paper": "rock", "scissors": "paper"}
        gestures = set(self.rps_choices.values())
        winners = []
        if len(gestures) == 2:
            first, second = gestures
            winning = first if beats[first] == second else second
            winners = [
                pid for pid, choice in self.rps_choices.items() if choice == winning
            ]
            for pid in winners:
                self.rps_wins[pid] = self.rps_wins.get(pid, 0) + 1

        self.rps_last_result = {
            "round": self.rps_round,
            "choices": dict(self.rps_choices),
            "winners": winners,
            "draw": not winners,
        }
        return self.rps_last_result

    def rps_overall_winner(self) -> str | None:
        """The single participant strictly ahead with enough round wins."""
        leaders = self.rps_leaders()
        if len(leaders) == 1 and self.rps_wins[leaders[0]] >= RPS_WINS_NEEDED:
            return leaders[0]
        return None

    def rps_leaders(self) -> list:
        if not self.rps_wins:
            return []
        top = max(self.rps_wins.values())
        return [pid for pid, wins in self.rps_wins.items() if wins == top]

    def next_rps_round(self) -> None:
        self.rps_round += 1
        self.rps_choices = {}
        self.rps_last_result = None

    def remove_player(self, player_id: str) -> dict:
        """Remove a player mid-game. Returns flags describing what changed so
        the caller can re-announce state and re-check phase progression."""
        result = {
            "removed": False,
            "chooser_reassigned": False,
            "current_song_removed": False,
            "rps_participant_removed": False,
        }
        if player_id not in self.player_order:
            return result

        chooser_pos = self.chooser_index % len(self.player_order)
        removed_index = self.player_order.index(player_id)
        was_chooser = removed_index == chooser_pos

        self.player_order.remove(player_id)
        self.submissions.pop(player_id, None)
        self.votes.pop(player_id, None)
        self.votes = {
            voter: target
            for voter, target in self.votes.items()
            if target != player_id
        }
        self.skip_votes.discard(player_id)

        if player_id in self.rps_participants:
            self.rps_participants.remove(player_id)
            self.rps_wins.pop(player_id, None)
            self.rps_choices.pop(player_id, None)
            result["rps_participant_removed"] = True

        result["removed"] = True
        if not self.player_order:
            return result

        if was_chooser:
            self.chooser_index = chooser_pos % len(self.player_order)
            result["chooser_reassigned"] = True
        elif removed_index < chooser_pos:
            self.chooser_index = chooser_pos - 1
        else:
            self.chooser_index = chooser_pos

        if player_id in self.listening_order:
            removed_pos = self.listening_order.index(player_id)
            self.listening_order.remove(player_id)
            if removed_pos < self.listening_index:
                self.listening_index -= 1
            elif removed_pos == self.listening_index:
                self.skip_votes = set()
                result["current_song_removed"] = True

        return result

    def get_serializable(self) -> dict:
        return {
            "currentRound": self.current_round,
            "totalRounds": self.total_rounds,
            "phase": self.phase,
            "phaseKey": self.phase_key,
            "chooserPlayerId": self.get_chooser_id(),
            "nextChooserPlayerId": self.get_next_chooser_id(),
            "chosenGif": self.chosen_gif,
            "submissionCount": len(self.submissions),
            "voteCount": len(self.votes),
            "expectedSubmissions": len(self.player_order) - 1,
            "roundResults": self.round_results,
            "settings": {
                "songSelectionTime": self.song_selection_time,
                "songLength": self.song_length,
                "votingTime": self.voting_time,
                "gifOption": self.gif_option,
                "gifSubOption": self.gif_sub_option,
                "searchEnabled": self.search_enabled,
            },
        }
