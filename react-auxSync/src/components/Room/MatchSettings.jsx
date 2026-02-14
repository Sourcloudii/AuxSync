import "./MatchSettings.css";

export function MatchSettings() {
  return (
    <div className="settings_options">
      <h2 className="settings_options__title text_shadow">Match Settings</h2>
      <div className="settings_options-btn__wrapper">
        <button className="settings_options-btn settings_options__lobby-size text_shadow">
          Lobby Size
        </button>
        <button className="settings_options-btn settings_options__song-selection-time text_shadow">
          Song Selection Time
        </button>
        <button className="settings_options-btn settings_options__song-length text_shadow">
          Song Length
        </button>
        <button className="settings_options-btn settings_options__gif-options text_shadow">
          GIF Options
        </button>
        <button className="settings_options-btn settings_options__rounds text_shadow">
          Rounds
        </button>
        <button className="settings_options-btn settings_options__voting-time text_shadow">
          Voting Time
        </button>
      </div>
    </div>
  );
}
