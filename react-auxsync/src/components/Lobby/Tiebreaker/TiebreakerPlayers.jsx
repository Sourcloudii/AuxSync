import { gestures, getPfpForPlayer } from "../../../utils/constants";

const GESTURES_BY_ID = Object.fromEntries(gestures.map(g => [g.id, g]));

function Pips({ winCount, winsNeeded }) {
  const total = Math.max(winsNeeded, winCount);

  return (
    <div className="tiebreaker__pips">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`tiebreaker__pip ${i < winCount ? "tiebreaker__pip--filled" : ""}`}
        />
      ))}
    </div>
  );
}

function Thrown({ gesture }) {
  if (!gesture) return <span className="tiebreaker__gesture">❔</span>;

  return (
    <span className="tiebreaker__gesture">
      <img
        className="tiebreaker__gesture-img"
        src={gesture.emoji}
        alt={gesture.label}
      />
    </span>
  );
}

function PlayerCard({ participant, pfp, winCount, winsNeeded, gesture, isWinner }) {
  const cardClasses = ["tiebreaker__player", isWinner && "tiebreaker__player--winner"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses}>
      <img
        className="tiebreaker__player-pfp"
        src={pfp}
        alt={`${participant.playerName}'s profile`}
      />
      <p className="tiebreaker__player-name">{participant.playerName}</p>
      <Pips winCount={winCount} winsNeeded={winsNeeded} />
      <Thrown gesture={gesture} />
    </div>
  );
}

export function TiebreakerPlayers({
  participants,
  players,
  wins,
  winsNeeded,
  choices,
  roundWinnerIds,
}) {
  const winnerIds = new Set(roundWinnerIds);

  const pfpFor = playerId => {
    const player = players?.find(p => p.playerId === playerId);
    return player?.profile || getPfpForPlayer(player, playerId);
  };

  return (
    <div className="tiebreaker__players">
      {participants.map(participant => (
        <PlayerCard
          key={participant.playerId}
          participant={participant}
          pfp={pfpFor(participant.playerId)}
          winCount={wins[participant.playerId] ?? 0}
          winsNeeded={winsNeeded}
          gesture={choices ? GESTURES_BY_ID[choices[participant.playerId]] : null}
          isWinner={Boolean(choices) && winnerIds.has(participant.playerId)}
        />
      ))}
    </div>
  );
}
