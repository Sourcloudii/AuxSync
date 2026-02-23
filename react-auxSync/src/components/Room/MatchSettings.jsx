import "./MatchSettings.css";
import arrowUp from "../../images/arrow-up.svg";
import arrowDown from "../../images/arrow-down.svg";
import { useState } from "react";

export function MatchSettings() {
  const [isSongSelectionTimeOpen, setIsSongSelectionTimeOpen] = useState(false);
  const [isSongTimeOpen, setIsSongTimeOpen] = useState(false);

  const toggleSongSelectionTimeDropdown = () => {
    setIsSongSelectionTimeOpen(!isSongSelectionTimeOpen);
  };

  const toggleSongTimeDropdown = () => {
    setIsSongTimeOpen(!isSongTimeOpen);
  }

  return (
    <div className="settings_options">
      <h2 className="settings_options__title text_shadow">Match Settings</h2>
      <div className="settings_options__text-wrapper">
        <div className="settings_options-wrapper settings_options__song-selection-time-wrapper">
          <label
            className="settings_options-label settings_options__song-selection-time text_shadow"
          >
            Song Selection Time
          </label>
          <select className="settings_options-select settings_options__song-selection-time-select" 
            onClick={toggleSongSelectionTimeDropdown}
            style={{
              backgroundImage: isSongSelectionTimeOpen ? `url(${arrowDown})` : `url(${arrowUp})`,
            }}>
            {[1, 2, 3, 4, 5].map((time) => (
              <option
                value={`${time} Minute${time > 1 ? "s" : ""}`}
                className="settings_options__song-selection-time-option"
              >
                {time} Minute{time > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="settings_options-wrapper settings_options__song-length-wrapper">
          <label className="settings_options-label settings_options__song-length text_shadow">
            Song Length
          </label>
          <select className="settings_options-select settings_options__song-length-select" 
            onClick={toggleSongTimeDropdown}
            style={{
              backgroundImage: isSongTimeOpen ? `url(${arrowDown})` : `url(${arrowUp})`,
            }}>
            {[30, 60, 90].map((time) => (
              <option
                value={`${time} Second${time > 1 ? "s" : ""}`}
                className="settings_options__song-length-option"
              >
                {time} Seconds
              </option>
            ))}
          </select>
        </div>
        <div className="settings_options-wrapper settings_options__gif-options-wrapper">
          <label className="settings_options-label settings_options__gif-options text_shadow">
            GIF Options
          </label>
        </div>
        <div className="settings_options-wrapper settings_options__rounds-wrapper">
          <label className="settings_options-label settings_options__rounds text_shadow">
            Rounds
          </label>
        </div>
        <div className="settings_options-wrapper settings_options__voting-time-wrapper">
          <label className="settings_options-label settings_options__voting-time text_shadow">
            Voting Time
          </label>
        </div>
      </div>
    </div>
  );
}
