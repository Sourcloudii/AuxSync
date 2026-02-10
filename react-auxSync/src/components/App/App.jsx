import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

//components
import { Header } from "../Header/Header";
import { Main } from "../Main/Main";

import { apiKey } from "../../utils/constants";
import { getTrendingGifs } from "../../utils/giphyApi";

function App() {
  const [user, setUser] = useState("");
  const [gifs, setGifs] = useState([]);
  const [positionedGifs, setPositionedGifs] = useState([]);

  useEffect(() => {
    getTrendingGifs({ apiKey }).then((e) => {
      setGifs(e.data);
      console.log(e.data);
      const positioned = e.data.map((gif) => ({
        ...gif,
        positionLeft: Math.random() * 100,
        positionTop: Math.random() * 20 + 10,
        duration: Math.random() * 10 + 9,
        opacity: Math.random() * 0.5 + 0.25,
      }));
      setPositionedGifs(positioned);
    });
  }, []);

  const location = useLocation();

  const handleUserChange = (e) => {
    e.preventDefault();
    setUser(e.target.value);
  };

  return (
    <div className="page">
      <div className="page__content">
        <div className="falling-gifs">
          {positionedGifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.images.downsized_medium.url}
              alt={gif.title}
              className="falling-gifs_imgs"
              style={{
                left: `${gif.positionLeft}%`,
                top: `-${gif.positionTop}%`,
                animationDuration: `${gif.duration}s`,
                opacity: gif.opacity,
              }}
            />
          ))}
        </div>
        <Header location={location} />
        <Routes>
          <Route path="/" element={<Main handleUserChange={handleUserChange} user={user} />} />
          <Route path="/host-page" /*element={<HostPage gifs={gifs} />}*/ />
          <Route path="/join-page" /*element={ }*/ />
        </Routes>
      </div>
    </div>
  );
}

export default App;
