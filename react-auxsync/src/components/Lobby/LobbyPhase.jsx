import { Searching } from "./Searching/Searching";
import { Choosing } from "./Choosing/Choosing";
import { Voting } from "./Voting/Voting";
import { Listening } from "./Listening/Listening";
import { Results } from "./Results/Results";
import { Tiebreaker } from "./Tiebreaker/Tiebreaker";
import { GameOver } from "./GameOver/GameOver";
import { GifMedia } from "../shared/GifMedia/GifMedia";

function Waiting({ children }) {
  return (
    <div className="lobby__waiting">
      <h2>{children}</h2>
    </div>
  );
}

function ChoosingPhase({ gifs, gameState, isChooser, chooserPlayer, shuffleSlot }) {
  if (!isChooser) {
    return <Waiting>{chooserPlayer?.name || "A player"} is choosing a GIF...</Waiting>;
  }

  return (
    <Choosing
      gifs={gifs}
      player={chooserPlayer}
      settings={gameState?.settings}
      shuffleSlot={shuffleSlot}
    />
  );
}

function SearchingPhase({
  gameState,
  isChooser,
  timeLeft,
  handleSongSearchChange,
  searchResults,
  playVideo,
  playerReady,
  duration,
  isPaused,
  seekTo,
  pauseVideo,
  resumeVideo,
  getCurrentTime,
}) {
  if (isChooser) {
    return (
      <div className="lobby__waiting">
        <h2>Players are picking songs for your GIF!</h2>
        <GifMedia gif={gameState.chosenGif} className="lobby__search-gif" />
        <p className="lobby__timer">
          {timeLeft}s | {gameState.submissionCount || 0}/
          {gameState.expectedSubmissions || 0} submitted
        </p>
      </div>
    );
  }

  return (
    <Searching
      chosenGif={gameState.chosenGif}
      handleSongSearchChange={handleSongSearchChange}
      searchResults={searchResults}
      playVideo={playVideo}
      playerReady={playerReady}
      timeLeft={timeLeft}
      songLength={gameState.settings?.songLength || 30}
      duration={duration}
      isPaused={isPaused}
      seekTo={seekTo}
      pauseVideo={pauseVideo}
      resumeVideo={resumeVideo}
      getCurrentTime={getCurrentTime}
      submissionCount={gameState.submissionCount}
      expectedSubmissions={gameState.expectedSubmissions}
      initialSubmitted={gameState.youSubmitted}
    />
  );
}

function ListeningPhase({ gameState, players, playVideo, playerReady }) {
  return (
    <Listening
      chosenGif={gameState.chosenGif}
      currentSong={gameState.currentSong}
      songIndex={gameState.songIndex ?? 0}
      totalSongs={gameState.totalSongs ?? 0}
      skipVoteCount={gameState.skipVoteCount ?? 0}
      skipVotesNeeded={gameState.skipVotesNeeded ?? 0}
      duration={gameState.duration}
      playVideo={playVideo}
      playerReady={playerReady}
      initialSkipVoted={gameState.youSkipVoted}
      players={players}
    />
  );
}

function VotingPhase({ gameState, players, myPlayerId, timeLeft }) {
  return (
    <Voting
      chosenGif={gameState.chosenGif}
      submissions={gameState.submissions || []}
      timeLeft={timeLeft}
      voteCount={gameState.voteCount}
      expectedVotes={gameState.expectedVotes}
      votes={gameState.votes}
      players={players}
      myPlayerId={myPlayerId}
      initialVoted={gameState.youVoted}
    />
  );
}

function ResultsPhase({
  gameState,
  players,
  timeLeft,
  playVideo,
  pauseVideo,
  playerReady,
}) {
  return (
    <Results
      gameState={gameState}
      players={players}
      timeLeft={timeLeft}
      playVideo={playVideo}
      pauseVideo={pauseVideo}
      playerReady={playerReady}
    />
  );
}

function TiebreakerPhase({ gameState, players, myPlayerId }) {
  return (
    <Tiebreaker
      gameState={gameState}
      players={players}
      myPlayerId={myPlayerId}
    />
  );
}

function GameOverPhase({ gameState, players }) {
  return <GameOver gameState={gameState} players={players} />;
}

const PHASE_VIEWS = {
  choosing: ChoosingPhase,
  searching: SearchingPhase,
  listening: ListeningPhase,
  voting: VotingPhase,
  results: ResultsPhase,
  tiebreaker: TiebreakerPhase,
  "game-over": GameOverPhase,
};

export function LobbyPhase(props) {
  if (props.isWaiting) {
    return <Waiting>Grab a snack till next round starts.</Waiting>;
  }

  const View = PHASE_VIEWS[props.phase];
  if (!View) return <p>Grab a snack till next round starts.</p>;

  return <View {...props} />;
}
