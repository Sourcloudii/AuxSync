import "./MatchSettings.css";
import arrowUp from "../../images/arrow-up.svg";
import arrowDown from "../../images/arrow-down.svg";

import { useMatchSettings } from "../../contexts/MatchSettingsContext";

export function MatchSettings() {
  const {
    rounds,
    setRounds,
    votingTime,
    setVotingTime,
    isSongSelectionTimeOpen,
    setIsSongSelectionTimeOpen,
    isSongTimeOpen,
    setIsSongTimeOpen,
    subOptionsState,
    setSubOptionsState,
    selectedSubOption,
    setSelectedSubOption,
    selectedGifOption,
    setSelectedGifOption,
    searchState,
    setSearchState,
  } = useMatchSettings();

  const toggleSongSelectionTimeDropdown = () =>
    setIsSongSelectionTimeOpen(!isSongSelectionTimeOpen);
  const toggleSongTimeDropdown = () => setIsSongTimeOpen(!isSongTimeOpen);
  const toggleSearchState = () => setSearchState(!searchState);
  const showSubOptions = () => setSubOptionsState(true);
  const hideSubOptions = () => setSubOptionsState(false);
  const incrementRounds = () => setRounds(prev => prev + 1);
  const decrementRounds = () => setRounds(prev => Math.max(1, prev - 1));
  const incrementVotingTime = () => setVotingTime(prev => prev + 15);
  const decrementVotingTime = () =>
    setVotingTime(prev => Math.max(15, prev - 15));

  return (
    <div className="settings_options">
      <h2 className="settings_options__title text_shadow">Match Settings</h2>
      <div className="settings_options__text-wrapper">
        <div className="settings_options-wrapper settings_options__song-selection-time-wrapper">
          <label className="settings_options-label settings_options__song-selection-time text_shadow">
            Song Selection Time
          </label>
          <select
            className="settings_options-select settings_options__song-selection-time-select"
            onClick={toggleSongSelectionTimeDropdown}
            style={{
              backgroundImage: isSongSelectionTimeOpen
                ? `url(${arrowDown})`
                : `url(${arrowUp})`,
            }}
          >
            {[1, 2, 3, 4, 5].map(time => (
              <option
                value={`${time} Minute${time > 1 ? "s" : ""}`}
                className="dropdown_options settings_options__song-selection-time-option"
                key={time}
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
          <select
            className="settings_options-select settings_options__song-length-select"
            onClick={toggleSongTimeDropdown}
            style={{
              backgroundImage: isSongTimeOpen
                ? `url(${arrowDown})`
                : `url(${arrowUp})`,
            }}
          >
            {[30, 60, 90].map(time => (
              <option
                value={`${time} Second${time > 1 ? "s" : ""}`}
                className="dropdown_options settings_options__song-length-option"
                key={time}
              >
                {time} Seconds
              </option>
            ))}
          </select>
        </div>
        <div className="settings_options-wrapper settings_options__gif-options-wrapper">
          <div className="settings_options__gif-options-header">
            <label className="settings_options-label settings_options__gif-options text_shadow">
              GIF Options
            </label>
            <div
              className={`settings_options__gif-options-sub-btns-wrapper ${subOptionsState ? "show-sub-options" : "hide-sub-options"}`}
            >
              <button
                className={`settings_options__gif-options-sub-btn three-option ${selectedSubOption === "three" ? "selected" : ""}`}
                onClick={() => setSelectedSubOption("three")}
              >
                3
              </button>
              <button
                className={`settings_options__gif-options-sub-btn four-option ${selectedSubOption === "four" ? "selected" : ""}`}
                onClick={() => setSelectedSubOption("four")}
              >
                4
              </button>
              <button
                className={`settings_options__gif-options-sub-btn six-option ${selectedSubOption === "six" ? "selected" : ""}`}
                onClick={() => setSelectedSubOption("six")}
              >
                6
              </button>
            </div>
          </div>
          <div className="settings_options__gif-options-btns-wrapper">
            <button
              className={`settings_options__gif-options-btn single-option ${selectedGifOption === "single" ? "selected" : ""}`}
              onClick={() => {
                hideSubOptions();
                setSelectedGifOption("single");
              }}
            >
              Single
            </button>
            <button
              className={`settings_options__gif-options-btn multiple-option ${selectedGifOption === "multiple" ? "selected" : ""}`}
              onClick={() => {
                showSubOptions();
                setSelectedGifOption("multiple");
              }}
            >
              Multiple
            </button>
            <button
              className={`settings_options__gif-options-btn lens-option ${searchState ? "lens-enabled" : "lens-disabled"}`}
              onClick={toggleSearchState}
            ></button>
          </div>
        </div>
        <div className="settings_options-wrapper settings_options__rounds-wrapper">
          <label className="settings_options-label settings_options__rounds text_shadow">
            Rounds
          </label>
          <div className="settings_options__rounds-counter">
            <button
              className="settings_options__rounds-btn rounds-decrement"
              onClick={decrementRounds}
              disabled={rounds <= 1}
            >
              &minus;
            </button>
            <span className="settings_options__rounds-value">{rounds}</span>
            <button
              className="settings_options__rounds-btn rounds-increment"
              onClick={incrementRounds}
              disabled={rounds >= 10}
            >
              +
            </button>
          </div>
        </div>
        <div className="settings_options-wrapper settings_options__voting-time-wrapper">
          <label className="settings_options-label settings_options__voting-time text_shadow">
            Voting Time
          </label>
          <div className="settings_options__voting-time-counter">
            <button
              className="settings_options__voting-time-btn voting-time-decrement"
              onClick={decrementVotingTime}
              disabled={votingTime <= 15}
            >
              &minus;
            </button>
            <span className="settings_options__voting-time-value">
              {votingTime}s
            </span>
            <button
              className="settings_options__voting-time-btn voting-time-increment"
              onClick={incrementVotingTime}
              disabled={votingTime >= 90}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
