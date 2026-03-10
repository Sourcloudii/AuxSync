import "./Searching.css";
import { useState } from "react";

export function Searching({
  chosenGif,
  handleSongSearchChange,
  searchResults,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = e => {
    e.preventDefault();
    setSearchTerm(e.target.value);
    handleSongSearchChange(e);
  };
  return (
    <div className="lobby__search-wrapper">
      <div className="lobby__search-query">
        <img
          src={chosenGif.images.medium.url}
          alt={chosenGif.name}
          className="lobby__search-gif"
        />
        <input
          className="lobby__search-input"
          type="text"
          placeholder="Search Song"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <ul className="lobby__search-results">
        {searchResults.map(track => (
          <li key={track.id} className="lobby__search-item">
            {track.name} - {track.artists.map(artist => artist.name)}
          </li>
        ))}
      </ul>
    </div>
  );
}
