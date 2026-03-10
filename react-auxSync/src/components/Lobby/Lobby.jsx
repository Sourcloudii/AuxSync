import "./Lobby.css";
import RefreshIcon from "../../images/refresh-icon.svg";
import { Searching } from "./Searching";
import { Choosing } from "./Choosing";
import { useState } from "react";
import { useMatchSettings } from "../../contexts/MatchSettingsContext";

export function Lobby({ gifs, handleSongSearchChange, searchResults }) {
  const { selectedSubOption } = useMatchSettings();
  const [isGifChosen, setIsGifChosen] = useState(false);
  const [chooser, setChooser] = useState(null);
  const [chosenGif, setChosenGif] = useState(null);

  return (
    <main className="lobby">
      <div className="lobby__content">
        <div className="lobby__players-wrapper">
          <img src={RefreshIcon} alt="Player" className="lobby__player" />
          <img src={RefreshIcon} alt="Player" className="lobby__player" />
          <img src={RefreshIcon} alt="Player" className="lobby__player" />
          <img src={RefreshIcon} alt="Player" className="lobby__player" />
        </div>
        <main className="lobby__main-content">
          <div className="lobby__leaderboard-wrapper"></div>
          {isGifChosen ? (
            <Searching
              chosenGif={chosenGif}
              handleSongSearchChange={handleSongSearchChange}
              searchResults={searchResults}
            />
          ) : (
            <Choosing
              gifs={gifs}
              setChosenGif={setChosenGif}
              setIsGifChosen={setIsGifChosen}
              max={selectedSubOption}
              player={chooser}
            />
          )}
        </main>
      </div>
    </main>
  );
}
