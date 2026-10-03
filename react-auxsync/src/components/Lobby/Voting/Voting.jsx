import "./Voting.css";
import { useState } from "react";
import { GifMedia } from "../../shared/GifMedia/GifMedia";
import { getSocket } from "../../../utils/socketFunctions/socket";
import { getPfpForPlayer } from "../../../utils/constants";
import checkedVote from "../../../images/checked-vote.svg";

const STICKER_SPOTS = [
  { top: "-16px", right: "-14px", "--sticker-rot": "-6deg" },
  { top: "-16px", left: "12%", "--sticker-rot": "-19deg" },
  { bottom: "-16px", left: "38%", "--sticker-rot": "12deg" },
  { top: "-16px", left: "58%", "--sticker-rot": "7deg" },
  { bottom: "-16px", left: "8%", "--sticker-rot": "38deg" },
  { bottom: "-16px", right: "-14px", "--sticker-rot": "-10deg" },
  { top: "-16px", left: "-14px", "--sticker-rot": "13deg" },
  { top: "24px", left: "-16px", "--sticker-rot": "-2deg" },
  { top: "24px", right: "-16px", "--sticker-rot": "16deg" },
  { bottom: "-16px", left: "62%", "--sticker-rot": "-8deg" },
  { top: "-16px", left: "35%", "--sticker-rot": "11deg" },
  { bottom: "-16px", left: "20%", "--sticker-rot": "-14deg" },
];

export function Voting({
  chosenGif,
  submissions,
  votes,
  timeLeft,
  expectedVotes,
  voteCount,
  players,
  myPlayerId,
  initialVoted,
}) {
  const [hasVotedLocally, setHasVotedLocally] = useState(initialVoted ?? false);
  const [selected, setSelected] = useState(null);
  // custom confirm-cursor that follows the mouse over the selected card
  const [cursor, setCursor] = useState({ x: 0, y: 0, shown: false });
  const voteMap = votes || {};

  const myVoteTarget = Object.keys(voteMap).find(target => voteMap[target].includes(myPlayerId));
  const hasVoted = hasVotedLocally || myVoteTarget != null;

  const pfpFor = playerId => {
    const player = players?.find(p => p.playerId === playerId);
    return player?.profile || getPfpForPlayer(player, playerId);
  };

  const nameFor = playerId =>
    players?.find(p => p.playerId === playerId)?.name || "A player";

  const castVote = playerId => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("vote-cast", playerId, response => {
      if (response?.error) {
        console.error("Vote error:", response.error);
        return;
      }
      setHasVotedLocally(true);
      setSelected(null);
      setCursor(c => ({ ...c, shown: false }));
    });
  };

  const handleCardClick = (submission, e) => {
    if (hasVoted || submission.playerId === myPlayerId) return;
    if (selected === submission.playerId) {
      castVote(submission.playerId);
    } else {
      setSelected(submission.playerId);
      setCursor({ x: e.clientX, y: e.clientY, shown: true });
    }
  };

  const handleCardKeyDown = (submission, e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (hasVoted || submission.playerId === myPlayerId) return;
    if (selected === submission.playerId) {
      castVote(submission.playerId);
    } else {
      setSelected(submission.playerId);
    }
  };

  const trackCursor = e => setCursor({ x: e.clientX, y: e.clientY, shown: true });
  const hideCursor = () => setCursor(c => ({ ...c, shown: false }));

  return (
    <div className="voting">
      <GifMedia gif={chosenGif} className="voting__gif" />
      <p className="voting__timer">
        {timeLeft}s | {voteCount || 0}/{expectedVotes || 0} voted
      </p>
      <div className="voting__song-submissions">
        {submissions.map(submission => {
          const isOwn = submission.playerId === myPlayerId;
          const isSelected = selected === submission.playerId;
          const isMyVote = myVoteTarget === submission.playerId;
          const voters = voteMap[submission.playerId] || [];
          const classes = [
            "voting__song-submission",
            !hasVoted && !isOwn && "voting__song-submission--votable",
            isOwn && "voting__song-submission--own",
            isSelected && "voting__song-submission--selected",
            isMyVote && "voting__song-submission--voted",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={submission.playerId}
              className={classes}
              role="button"
              tabIndex={0}
              aria-disabled={hasVoted || isOwn}
              onClick={e => handleCardClick(submission, e)}
              onKeyDown={e => handleCardKeyDown(submission, e)}
              onMouseMove={isSelected ? trackCursor : undefined}
              onMouseLeave={isSelected ? hideCursor : undefined}
              title={isSelected ? "Click again to confirm your vote" : undefined}
            >
              {submission.albumArt && (
                <img
                  src={submission.albumArt}
                  alt={`Album art for ${submission.trackName}`}
                  className="voting__song-art"
                />
              )}
              <div className="voting__song-text">
                <p className="voting__song-info">
                  {submission.trackName} - {submission.artist}
                </p>
                <p className="voting__song-player">{submission.playerName}</p>
              </div>
              {isSelected && <span className="voting__confirm-hint">Tap again to confirm</span>}
              {voters.map((voterId, index) => (
                <img
                  key={voterId}
                  src={pfpFor(voterId)}
                  alt={`Vote from ${nameFor(voterId)}`}
                  className="voting__vote-sticker"
                  style={STICKER_SPOTS[index % STICKER_SPOTS.length]}
                />
              ))}
            </div>
          );
        })}
      </div>

      {selected && cursor.shown && (
        <div
          className="voting__cursor"
          style={{ left: cursor.x, top: cursor.y }}
          aria-hidden="true"
        >
          <img src={checkedVote} alt="Confirm Vote" className="voting__cursor-img" />
        </div>
      )}
    </div>
  );
}
