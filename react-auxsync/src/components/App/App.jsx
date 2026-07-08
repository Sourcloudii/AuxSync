import "./App.css";
import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

//components
import { MatchSettingsProvidor } from "../../contexts/MatchSettingsProvidor";
import { Header } from "../Header/Header";
import { Main } from "../Main/Main";
import { Room } from "../Room/Room";
import { Lobby } from "../Lobby/Lobby";
import { JoinModal } from "../JoinModal/JoinModal";

const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY;
import { getTrendingGifs } from "../../utils/giphyApi";
import { refreshAccessToken } from "../../utils/spotifyAuth";
import { searchTracks } from "../../utils/spotifyApi";

function App() {
  const [user, setUser] = useState("");
  const [gifs, setGifs] = useState([]);
  const [positionedGifs, setPositionedGifs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [host, setHost] = useState(null);
  const [players, setPlayers] = useState(["Ken", "Jack", "Eli"]);
  const [lobbyCode, setLobbyCode] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const searchControllerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    refreshAccessToken()
      .then(token => {
        setAccessToken(token);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    getTrendingGifs({ apiKey: giphyApiKey }).then(e => {
      setGifs(e.data);
      const positioned = e.data.map(gif => ({
        ...gif,
        positionLeft: Math.random() * 100,
        positionTop: Math.random() * 20 + 10,
        duration: Math.random() * 10 + 9,
        opacity: Math.random() * 0.5 + 0.2,
      }));
      setPositionedGifs(positioned);
    });
  }, []);

  const handleUserChange = e => setUser(e.target.value);
  const preventDefault = e => e.preventDefault();
  const openModal = () => setModalState(true);
  const closeModal = () => setModalState(false);
  const handleSongSearchChange = e => {
    const query = e.target.value;

    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
    }

    if (query) {
      const controller = new AbortController();
      searchControllerRef.current = controller;

      searchTracks(accessToken, query, controller.signal)
        .then(data => {
          console.log("Search results:", data);
          setSearchResults(data.tracks.items);
        })
        .catch(error => {
          if (error.name === "AbortError") return;
          console.error("Error searching tracks:", error);
        });
    } else {
      searchControllerRef.current = null;
      setSearchResults([]);
    }
  };

  return (
    <MatchSettingsProvidor>
      <div className="page">
        <div className="page__content">
          <div className="falling-gifs">
            {positionedGifs.slice(0, 24).map(gif => (
              <img
                key={gif.id}
                src={gif.images.downsized.url}
                alt={gif.title}
                className="falling-gifs_imgs"
                style={{
                  left: `${gif.positionLeft}%`,
                  top: `-${gif.positionTop}%`,
                  animationDuration: `${gif.duration}s`,
                  "--initial-opacity": gif.opacity,
                }}
              />
            ))}
          </div>
          <Header location={location.pathname} />
          <Routes>
            <Route
              path="/"
              element={
                <Main
                  user={user}
                  handleUserChange={handleUserChange}
                  preventDefault={preventDefault}
                  openJoinModal={openModal}
                  setLobbyCode={setLobbyCode}
                  setHost={setHost}
                />
              }
            />
            <Route
              path="/room"
              element={
                <Room lobbyCode={lobbyCode} host={host} players={players} />
              }
            />
            <Route
              path="/lobby"
              element={
                <Lobby
                  gifs={gifs}
                  handleSongSearchChange={handleSongSearchChange}
                  searchResults={searchResults}
                />
              }
            />
            <Route path="" /*element={ }*/ />
          </Routes>
          <JoinModal
            preventDefault={preventDefault}
            closeModal={closeModal}
            modalState={modalState}
          />
        </div>
      </div>
    </MatchSettingsProvidor>
  );
}

export default App;
