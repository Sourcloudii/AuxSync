import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

//components
import { Header } from "../Header/Header";
import { Main } from "../Main/Main";

import { apiKey } from "../../utils/constants";
import { getGifs } from "../../utils/giphyApi";

function App() {
  const [user, setUser] = useState("");
  const [gifs, setGifs] = useState([]);

  useEffect(() => {
    getGifs({ apiKey }).then((e) => {
      setGifs(e.data);
      console.log(e.data);
    });
  }, []);

  const handleUserChange = (e) => {
    e.preventDefault();
    setUser(e.target.value);
  };

  return (
    <div className="page">
      <div className="page__content">
        <div className="falling-gifs">
          {gifs.map((gifs) => {
          <img src={gifs.images.original.url} alt={`${gifs.title}`} className="falling-gifs_imgs" />
          })}
          <Header />
          <Routes>
            <Route path="/" element={<Main handleUserChange={handleUserChange} user={user} />} />
            <Route path="/host-page" /*element={ }*/ />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
