export function LobbyTopbar({
  phaseTitle,
  roundInfo,
  isChoosingGif,
  setShuffleSlot,
  isGameOver,
  leaveRoom,
  isHost,
  startGame,
  players,
}) {
  return (
    <div className="lobby__topbar">
      {phaseTitle && <h2 className="lobby__phase-title">{phaseTitle}</h2>}
      {roundInfo && <p className="lobby__round-info">{roundInfo}</p>}
      {isChoosingGif && (
        <div className="lobby__topbar-shuffle" ref={setShuffleSlot} />
      )}
      {isGameOver && (
        <button type="button" className="lobby__leave-btn" onClick={leaveRoom}>
          Back to Home
        </button>
      )}
      {isGameOver && isHost && players.length > 1 && (
        <button
          type="button"
          className="lobby__rematch-btn"
          onClick={startGame}
        >
          Rematch
        </button>
      )}
    </div>
  );
}
