import "./Choosing.css";
import refreshIcon from "../../images/refresh-icon.svg";
import { useState, useCallback } from "react";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function Choosing({ gifs, setChosenGif, setIsGifChosen, max, player }) {
  const [displayedGifs, setDisplayedGifs] = useState(() =>
    shuffle(gifs).slice(0, max),
  );
  const handleReshuffle = useCallback(() => {
    setDisplayedGifs(shuffle(gifs).slice(0, max));
  }, [gifs, max]);

  return (
    <div className="lobby__choosing-wrapper">
      <button className="lobby__choosing-btn" onClick={handleReshuffle}>
        <img
          src={refreshIcon}
          alt="Reshuffle"
          className="lobby__choosing-img"
        />
      </button>
      <h2 className="lobby__choosing-title">{player} is currently choosing</h2>
      <div className="lobby__choosing-gifs">
        {displayedGifs.map(gif => (
          <img
            key={gif.id}
            src={gif.images.medium.url}
            alt={gif.title}
            className="lobby__choosing-gif"
            onClick={() => {
              setChosenGif(gif);
              setIsGifChosen(true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
