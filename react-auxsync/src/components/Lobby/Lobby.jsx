import "./Lobby.css";
import { LobbyRail } from "./LobbyRail";
import { LobbyPhase } from "./LobbyPhase";
import { LobbyTopbar } from "./LobbyTopbar";
import { useState, useEffect } from "react";
import { usePhaseCountdown } from "../../hooks/usePhaseCountdown";
import { usePageSEO, PAGE_SEO } from "../../hooks/usePageSEO";

const PHASE_TITLES = {
  choosing: "Choosing a GIF",
  searching: "Picking a Song",
  listening: "Listening",
  voting: "Voting",
  results: "Round Results",
  tiebreaker: "Tiebreaker",
  "game-over": "Game Over",
};

export function Lobby({
  gifs,
  handleSongSearchChange,
  searchResults,
  resetSearch,
  players,
  myPlayerId,
  isWaiting,
  playVideo,
  playerReady,
  duration,
  isPaused,
  seekTo,
  pauseVideo,
  resumeVideo,
  setVolume,
  getCurrentTime,
  gameState,
  leaveRoom,
  isHost,
  startGame,
}) {
  const phase = gameState?.phase;
  const [shuffleSlot, setShuffleSlot] = useState(null);
  const timeLeft = usePhaseCountdown(
    gameState?.duration,
    gameState?.phaseKey ?? phase,
  );

  useEffect(() => {
    if (phase !== "searching") resetSearch?.();
  }, [phase, resetSearch]);

  const chooserPlayerId = gameState?.chooserPlayerId;
  const isChooser = myPlayerId === chooserPlayerId;
  const chooserPlayer = players.find(p => p.playerId === chooserPlayerId);
  const isGameOver = phase === "game-over";

  const currentRound = gameState?.currentRound;
  const totalRounds = gameState?.totalRounds;
  const hasRound = Boolean(currentRound && totalRounds);
  const roundLabel = hasRound ? ` - Round ${currentRound}/${totalRounds}` : "";
  const phaseTitle = PHASE_TITLES[phase] || PAGE_SEO.lobby.title;

  usePageSEO({ ...PAGE_SEO.lobby, title: `${phaseTitle}${roundLabel}` });

  const mainContentClasses = [
    "lobby__main-content",
    isGameOver && "lobby__main-content--game-over",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="lobby">
      <h1 className="visually-hidden">
        AuxSync match - {phaseTitle}
        {roundLabel}
      </h1>
      <div className="lobby__content">
        <section className={mainContentClasses}>
          <LobbyRail
            players={players}
            chooserPlayerId={chooserPlayerId}
            nextChooserPlayerId={gameState?.nextChooserPlayerId}
            setVolume={setVolume}
          />
          <LobbyTopbar
            phaseTitle={PHASE_TITLES[phase]}
            roundInfo={hasRound ? `Round ${currentRound} / ${totalRounds}` : ""}
            isChoosingGif={!isWaiting && phase === "choosing" && isChooser}
            setShuffleSlot={setShuffleSlot}
            isGameOver={isGameOver}
            leaveRoom={leaveRoom}
            isHost={isHost}
            startGame={startGame}
            players={players}
          />
          {gameState?.chooserReassigned && isChooser && (
            <p className="lobby__chooser-banner">
              The previous chooser left - you're the new chooser!
            </p>
          )}
          <LobbyPhase
            phase={phase}
            isWaiting={isWaiting}
            isChooser={isChooser}
            chooserPlayer={chooserPlayer}
            gameState={gameState}
            gifs={gifs}
            players={players}
            myPlayerId={myPlayerId}
            timeLeft={timeLeft}
            shuffleSlot={shuffleSlot}
            handleSongSearchChange={handleSongSearchChange}
            searchResults={searchResults}
            playVideo={playVideo}
            playerReady={playerReady}
            duration={duration}
            isPaused={isPaused}
            seekTo={seekTo}
            pauseVideo={pauseVideo}
            resumeVideo={resumeVideo}
            getCurrentTime={getCurrentTime}
          />
        </section>
      </div>
    </main>
  );
}
