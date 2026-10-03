import "./App.css";
import { useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  useMatch,
} from "react-router-dom";

import { MatchSettingsProvidor } from "../../contexts/MatchSettingsProvidor";
import { Header } from "../shared/Header/Header";
import { Main } from "../Home/Main/Main";
import { Room } from "../Room/Room";
import { Lobby } from "../Lobby/Lobby";
import { JoinModal } from "../Home/JoinModal/JoinModal";
import { FallingGifs } from "./FallingGifs";

import { useTrendingGifs } from "../../utils/gifFunctions/useTrendingGifs";
import { useSongSearch } from "../../utils/youtubeFunctions/useSongSearch";
import { useRoomConnection } from "../../utils/socketFunctions/useRoomConnection";
import { useYouTubePlayer } from "../../utils/youtubeFunctions/useYouTubePlayer";

const preventDefault = e => e.preventDefault();

function App() {
  const [user, setUser] = useState("");
  const [manualModal, setManualModal] = useState(false);
  const [shake, setShake] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const invite = useMatch("/join/:roomCode");
  const inviteCode = (invite?.params.roomCode ?? "").toUpperCase().slice(0, 4);
  const modalState = manualModal || Boolean(invite);

  const { gifs, positionedGifs } = useTrendingGifs();

  const {
    players,
    isHost,
    lobbyCode,
    maxPlayers,
    gameState,
    hostError,
    rejoinInfo,
    myPlayerId,
    isWaiting,
    hostRoom,
    joinRoom,
    rejoinRoom,
    dismissRejoin,
    startGame,
    leaveRoom,
  } = useRoomConnection(setUser);

  const { searchResults, handleSongSearchChange, resetSearch } =
    useSongSearch(lobbyCode);

  const {
    isReady: playerReady,
    playVideo,
    duration,
    isPaused,
    pauseVideo,
    resumeVideo,
    seekTo,
    setVolume,
    getCurrentTime,
  } = useYouTubePlayer();

  const requireNickname = () => {
    if (user.trim()) return true;
    setShake(true);
    setTimeout(() => setShake(false), 500);
    return false;
  };

  const handleHostRoom = () => {
    if (!requireNickname()) return;
    hostRoom(user.trim());
  };

  const handleJoinRoom = roomCode => {
    if (!requireNickname()) return;
    return joinRoom(user.trim(), roomCode);
  };

  const handleUserChange = e => setUser(e.target.value);
  const openModal = () => setManualModal(true);

  const closeModal = () => {
    setManualModal(false);
    const { hash, pathname } = window.location;
    if (hash.startsWith("#/join/") || pathname.startsWith("/join/")) {
      navigate("/", { replace: true });
    }
  };

  const homeView = (
    <Main
      user={user}
      handleUserChange={handleUserChange}
      preventDefault={preventDefault}
      openJoinModal={openModal}
      handleHostRoom={handleHostRoom}
      shake={shake}
      hostError={hostError}
      rejoinInfo={rejoinInfo}
      handleRejoinRoom={rejoinRoom}
      dismissRejoin={dismissRejoin}
    />
  );

  return (
    <MatchSettingsProvidor>
      <div className="page">
        <div className="falling-gifs">
          <FallingGifs gifs={positionedGifs} />
          <div className="page__content">
            <Header location={location.pathname} />
            <div className="page__view">
              <Routes>
                <Route path="/" element={homeView} />
                <Route path="/join/:roomCode" element={homeView} />
                <Route
                  path="/room"
                  element={
                    <Room
                      lobbyCode={lobbyCode}
                      isHost={isHost}
                      players={players}
                      maxPlayers={maxPlayers}
                      startGame={startGame}
                      leaveRoom={leaveRoom}
                    />
                  }
                />
                <Route
                  path="/lobby"
                  element={
                    <Lobby
                      gifs={gifs}
                      handleSongSearchChange={handleSongSearchChange}
                      searchResults={searchResults}
                      resetSearch={resetSearch}
                      players={players}
                      myPlayerId={myPlayerId}
                      isWaiting={isWaiting}
                      playVideo={playVideo}
                      playerReady={playerReady}
                      duration={duration}
                      isPaused={isPaused}
                      seekTo={seekTo}
                      pauseVideo={pauseVideo}
                      resumeVideo={resumeVideo}
                      setVolume={setVolume}
                      getCurrentTime={getCurrentTime}
                      gameState={gameState}
                      leaveRoom={leaveRoom}
                      isHost={isHost}
                      startGame={startGame}
                    />
                  }
                />
              </Routes>
            </div>
            <JoinModal
              preventDefault={preventDefault}
              closeModal={closeModal}
              modalState={modalState}
              handleJoinRoom={handleJoinRoom}
              handleUserChange={handleUserChange}
              user={user}
              inviteCode={inviteCode}
            />
          </div>
        </div>
      </div>
    </MatchSettingsProvidor>
  );
}

export default App;
