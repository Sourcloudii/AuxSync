import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

//components
import { Header } from "../Header/Header";
import { Main } from "../Main/Main";
import { JoinModal } from "../JoinModal/JoinModal";

import { apiKey } from "../../utils/constants";
import { getTrendingGifs } from "../../utils/giphyApi";

function App() {
  const [user, setUser] = useState("");
  const [gifs, setGifs] = useState([]);
  const [positionedGifs, setPositionedGifs] = useState([]);
  const [modalState, setModalState] = useState(false);
  // const [host, setHost] = useState("");
  // const [roomCode, setRoomCode] = useState("");

  const location = useLocation();

  useEffect(() => {
    getTrendingGifs({ apiKey }).then(e => {
      setGifs(e.data);
      console.log(e.data);
      const positioned = e.data.map(gif => ({
        ...gif,
        positionLeft: Math.random() * 100,
        positionTop: Math.random() * 20 + 10,
        duration: Math.random() * 10 + 9,
        opacity: Math.random() * 0.5 + 0.3,
      }));
      setPositionedGifs(positioned);
    });
  }, []);

  const handleUserChange = e => setUser(e.target.value);
  const preventDefault = e => e.preventDefault();
  const openModal = () => setModalState(true);
  const closeModal = () => setModalState(false);

  return (
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
                handleUserChange={handleUserChange}
                user={user}
                preventDefault={preventDefault}
                openJoinModal={openModal}
              />
            }
          />
          <Route path="/host-page" /*element={<HostPage />}*/ />
          <Route path="/join-page" /*element={<JoinPage />}*/ />
          <Route path="/lobby" /*element={<Lobby gifs={gifs} />}*/ />
          <Route path="" /*element={ }*/ />
        </Routes>
        <JoinModal
          preventDefault={preventDefault}
          closeModal={closeModal}
          modalState={modalState}
        />
      </div>
    </div>
  );
}

export default App;
