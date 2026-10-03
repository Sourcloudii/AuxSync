import { VolumeSlider } from "./VolumeSlider/VolumeSlider";
import { getPfpForPlayer } from "../../utils/constants";

function LeaderboardEntry({ player, isChooser, isNextChooser }) {
  const profileClasses = [
    "lobby__leaderboard-profile",
    isChooser && "lobby__leaderboard-profile--chooser",
    isNextChooser && "lobby__leaderboard-profile--next-chooser",
  ]
    .filter(Boolean)
    .join(" ");

  const playerClasses = [
    "lobby__leaderboard-player",
    player.isHost && "lobby__leaderboard-player--host",
    player.connected === false && "lobby__leaderboard-player--disconnected",
    player.waiting && "lobby__leaderboard-player--waiting",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li className={playerClasses}>
      <img
        src={player.profile || getPfpForPlayer(player)}
        alt={`${player.name}'s profile`}
        className={profileClasses}
      />
      <div className="lobby__leaderboard-text-wrapper">
        <p className="lobby__leaderboard-name">{player.name}</p>
        <p className="lobby__leaderboard-points">Points: {player.points}</p>
      </div>
    </li>
  );
}

export function LobbyRail({
  players,
  chooserPlayerId,
  nextChooserPlayerId,
  setVolume,
}) {
  const ranked = players.slice().sort((a, b) => b.points - a.points);

  return (
    <div className="lobby__rail">
      <h2 className="visually-hidden">Leaderboard</h2>
      <ul className="lobby__leaderboard-wrapper">
        {ranked.map(player => (
          <LeaderboardEntry
            key={player.playerId}
            player={player}
            isChooser={player.playerId === chooserPlayerId}
            isNextChooser={player.playerId === nextChooserPlayerId}
          />
        ))}
      </ul>
      <VolumeSlider setVolume={setVolume} className="lobby__volume" />
    </div>
  );
}
