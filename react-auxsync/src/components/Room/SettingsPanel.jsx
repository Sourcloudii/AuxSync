import closeButton from "../../images/close-btn.svg";
import { useMatchSettings } from "../../contexts/MatchSettingsContext";
import { SettingsDropdown } from "./SettingsDropdown";
import { SettingsCounter } from "./SettingsCounter";
import { SettingsGifOptions } from "./SettingsGifOptions";

const SONG_SELECTION_TIMES = [60, 120, 180, 240, 300];
const SONG_LENGTHS = [15, 30, 60, 90];

export function SettingsPanel({ startGame, players, closeMenu }) {
  const {
    rounds,
    setRounds,
    votingTime,
    setVotingTime,
    songSelectionTime,
    setSongSelectionTime,
    songLength,
    setSongLength,
    subOptionsState,
    setSubOptionsState,
    selectedSubOption,
    setSelectedSubOption,
    selectedGifOption,
    setSelectedGifOption,
    searchState,
    setSearchState,
  } = useMatchSettings();

  return (
    <div className="settings_options">
      <div className="settings_options__header">
        <h2
          id="matchSettingsTitle"
          className="settings_options__title text-shadow"
        >
          Match Settings
        </h2>
        <button
          type="button"
          className="settings_options__close-btn"
          onClick={closeMenu}
          aria-label="Close Match Settings"
        >
          <img src={closeButton} alt="" />
        </button>
      </div>
      <div className="settings_options__text-wrapper">
        <div
          className="settings_options-wrapper settings_options__song-selection-time-wrapper"
          role="group"
          aria-labelledby="song-selection-time-label"
        >
          <span
            id="song-selection-time-label"
            className="settings_options-label settings_options__song-selection-time text-shadow"
          >
            Song Selection Time
          </span>
          <SettingsDropdown
            value={songSelectionTime}
            options={SONG_SELECTION_TIMES}
            format={time => `${time / 60} Minute${time > 60 ? "s" : ""}`}
            onSelect={setSongSelectionTime}
          />
        </div>
        <div
          className="settings_options-wrapper settings_options__song-length-wrapper"
          role="group"
          aria-labelledby="song-length-label"
        >
          <span
            id="song-length-label"
            className="settings_options-label settings_options__song-length text-shadow"
          >
            Song Length
          </span>
          <SettingsDropdown
            value={songLength}
            options={SONG_LENGTHS}
            format={time => `${time} Seconds`}
            onSelect={setSongLength}
          />
        </div>
        <SettingsGifOptions
          subOptionsState={subOptionsState}
          selectedSubOption={selectedSubOption}
          setSelectedSubOption={setSelectedSubOption}
          selectedGifOption={selectedGifOption}
          setSelectedGifOption={setSelectedGifOption}
          setSubOptionsState={setSubOptionsState}
          searchState={searchState}
          setSearchState={setSearchState}
        />
        <SettingsCounter
          name="rounds"
          label="Rounds"
          value={rounds}
          display={rounds}
          min={1}
          max={10}
          step={1}
          onChange={setRounds}
          decreaseLabel="Decrease Rounds"
          increaseLabel="Increase Rounds"
        />
        <SettingsCounter
          name="voting-time"
          label="Voting Time"
          value={votingTime}
          display={`${votingTime}s`}
          min={15}
          max={90}
          step={15}
          onChange={setVotingTime}
          decreaseLabel="Decrease Voting Time"
          increaseLabel="Increase Voting Time"
        />
      </div>
      <button
        type="button"
        className="room__start-btn"
        onClick={startGame}
        disabled={players.length < 2}
        aria-label="Start Game"
      >
        Start Game
      </button>
    </div>
  );
}
