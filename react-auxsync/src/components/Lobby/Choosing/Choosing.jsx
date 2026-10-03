import "./Choosing.css";

import { searchGifs } from "../../../utils/apis/giphyApi";
import { useState, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { getSocket } from "../../../utils/socketFunctions/socket";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const maxMap = { one: 1, three: 3, four: 4, six: 6 };

function handleGifChosen(gif) {
  const socket = getSocket();
  if (!socket) return;
  socket.emit("gif-chosen", gif);
}

export function Choosing({ gifs, player, settings, shuffleSlot }) {
  const maxNum = maxMap[settings?.gifSubOption] ?? 6;
  const searchState = settings?.searchEnabled ?? true;
  const initialGifs = useMemo(
    () => shuffle(gifs).slice(0, maxNum),
    [gifs, maxNum],
  );

  const [displayedGifs, setDisplayedGifs] = useState(initialGifs);
  const [searchResults, setSearchResults] = useState([]);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [searchCount, setSearchCount] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [isVisualDisabled, setIsVisualDisabled] = useState(false);
  const [isSearchDisabled, setIsSearchDisabled] = useState(false);
  const [prevPlayer, setPrevPlayer] = useState(player?.name);

  const searchQueryRef = useRef("");
  const shuffleDisabled = shuffleCount >= 3;
  const searchDisabled = searchCount >= 3;

  if (prevPlayer !== player?.name) {
    setPrevPlayer(player?.name);
    setShuffleCount(0);
    setSearchCount(0);
    setIsVisualDisabled(false);
    setIsSearchDisabled(false);
    setSearchResults([]);
    setDisplayedGifs(initialGifs);
  }

  if (displayedGifs.length === 0 && initialGifs.length > 0) {
    setDisplayedGifs(initialGifs);
  }

  const handleReshuffle = useCallback(() => {
    if (shuffleDisabled) return;
    setShuffleCount((prev) => prev + 1);
    setSpinning(true);
    if (searchResults.length > 0) {
      setDisplayedGifs(shuffle(searchResults).slice(0, maxNum));
    } else {
      setDisplayedGifs(shuffle(gifs).slice(0, maxNum));
    }
  }, [gifs, maxNum, searchResults, shuffleDisabled]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchDisabled) return;
    const query = searchQueryRef.current;
    if (query.trim() === "") {
      setDisplayedGifs(initialGifs);
      setSearchResults([]);
      return;
    }
    setSearchCount((prev) => prev + 1);
    searchGifs({ query }).then((results) => {
      setDisplayedGifs(results.data.slice(0, maxNum));
      setSearchResults(results.data);
    });
  };

  return (
    <div className="lobby__choosing-wrapper">
      <h2 className="lobby__choosing-player">
        {player?.name}'s Turn to Choose
      </h2>
      <div className="lobby__choosing-counts-wrapper">
        <p className="lobby__choosing-counts lobby__choosing-shuffle-count">
          Reshuffle Attempts: {3 - shuffleCount}
        </p>
        {searchState && (
          <p className="lobby__choosing-counts lobby__choosing-search-count">
            Search Attempts: {3 - searchCount}
          </p>
        )}
      </div>
      {shuffleSlot &&
        createPortal(
          <button
            type="button"
            className={`lobby__choosing-shuffle-btn ${isVisualDisabled ? "shuffle-disabled" : ""} ${spinning ? "spinning" : ""}`}
            onClick={handleReshuffle}
            onAnimationEnd={() => {
              setSpinning(false);
              if (shuffleCount >= 3) {
                setIsVisualDisabled(true);
              }
            }}
            disabled={isVisualDisabled}
            aria-label="Reshuffle GIFs"
            title={
              shuffleDisabled ? "No reshuffles remaining" : "Reshuffle GIFs"
            }
          ></button>,
          shuffleSlot,
        )}
      {searchState && (
        <form className="lobby__choosing-search-form" onSubmit={handleSearch}>
          <label
            htmlFor="lobby__choosing-search-input"
            className="visually-hidden"
          >
            Search GIFs
          </label>
          <input
            autoComplete="off"
            type="text"
            id="lobby__choosing-search-input"
            className="lobby__choosing-search-input"
            placeholder="Search GIFs..."
            disabled={isSearchDisabled}
            onChange={(e) => (searchQueryRef.current = e.target.value)}
          />
          <button
            className="lobby__choosing-search-btn"
            type="submit"
            disabled={isSearchDisabled}
            aria-label="Search GIFs"
            title={
              searchDisabled ? "No search attempts remaining" : "Search GIFs"
            }
          >
            Go
          </button>
        </form>
      )}
      <div className="lobby__choosing-gifs">
        {displayedGifs.map((gif) => (
          <button
            key={gif.id}
            type="button"
            className="lobby__choosing-gif-btn"
            onClick={() => handleGifChosen(gif)}
            aria-label={`Choose GIF: ${gif.title || "untitled"}`}
          >
            <video
              src={gif.images.original.mp4}
              className="lobby__choosing-gif"
              autoPlay
              loop
              muted
              playsInline
            />
          </button>
        ))}
      </div>
    </div>
  );
}
