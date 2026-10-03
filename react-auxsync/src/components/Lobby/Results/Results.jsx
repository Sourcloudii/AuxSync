import "./Results.css";
import { useEffect } from "react";
import { getPfpForPlayer } from "../../../utils/constants";

export function Results({
  gameState,
  players,
  timeLeft,
  playVideo,
  pauseVideo,
  playerReady,
}) {
  const {
    winners: winnerIds = [],
    voteCounts = {},
    submissions = {},
  } = gameState.roundResults || {};

  const roster = players || [];

  const winners = winnerIds
    .map(playerId => {
      const player = roster.find(p => p.playerId === playerId);
      if (!player) return null;
      return {
        playerId,
        name: player.name,
        pfp: player.profile || getPfpForPlayer(player, playerId),
        votes: voteCounts[playerId] || 0,
        song: submissions[playerId],
      };
    })
    .filter(Boolean);

  const hasSong = winners.some(winner => winner.song?.trackUri);

  useEffect(() => () => pauseVideo?.(), [pauseVideo]);

  const previewSong = winner => {
    if (!playerReady || !winner.song?.trackUri) return;
    playVideo(winner.song.trackUri, winner.song.startTime ?? 0);
  };

  const isFinalRound = gameState.currentRound >= gameState.totalRounds;
  const active = roster.filter(p => !p.waiting);
  const topPoints = active.reduce((max, p) => Math.max(max, p.points || 0), 0);
  const tiedAtTop = active.filter(p => (p.points || 0) === topPoints).length > 1;

  const nextLabel = !isFinalRound
    ? "Next round starting in"
    : tiedAtTop
      ? "Tiebreaker in"
      : "Final results in";

  return (
    <div className="lobby__results">
      <h2 className="lobby__results-title">
        Round {gameState.currentRound} Results!
      </h2>
      <div className="lobby__results-wrapper">
        {winners.length > 0 ? (
          <>
            <p className="lobby__results-label">
              Winner{winners.length > 1 ? "s" : ""}
            </p>
            {hasSong && (
              <p className="lobby__results-hint">
                Hover a card to hear the song
              </p>
            )}
            <ul className="lobby__results-winners">
              {winners.map(winner => (
                <li
                  className="lobby__results-winner"
                  key={winner.playerId}
                  onMouseEnter={() => previewSong(winner)}
                  onMouseLeave={() => pauseVideo?.()}
                >
                  <img
                    className="lobby__results-winner-pfp"
                    src={winner.pfp}
                    alt={`${winner.name}'s profile`}
                  />
                  <div className="lobby__results-winner-text">
                    <p className="lobby__results-winner-name">{winner.name}</p>
                    <p className="lobby__results-winner-votes">
                      {winner.votes} vote{winner.votes === 1 ? "" : "s"}
                    </p>
                  </div>
                  {winner.song && (
                    <div className="lobby__results-song">
                      {winner.song.albumArt && (
                        <img
                          className="lobby__results-song-art"
                          src={winner.song.albumArt}
                          alt={`Album art for ${winner.song.trackName}`}
                        />
                      )}
                      <div className="lobby__results-song-text">
                        <p className="lobby__results-song-title">
                          {winner.song.trackName}
                        </p>
                        <p className="lobby__results-song-artist">
                          {winner.song.artist}
                        </p>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="lobby__results-none">No winner this round.</p>
        )}
        <h3 className="lobby__results-next-round">
          {nextLabel}: {timeLeft} second{timeLeft === 1 ? "" : "s"}
        </h3>
      </div>
      {hasSong && (
        <div id="yt-player-container" className="lobby__results-player" />
      )}
    </div>
  );
}
