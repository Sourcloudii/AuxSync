import "./MatchSettings.css";

export function MatchSettings() {
  return (
    <div className="settings_options">
      <h2 className="settings_options__title">Match Settings</h2>
      <button className="settings_options__lobby-size">Lobby Size</button>
      <button className="settings_options__song-selection-time">
        Song Selection Time
      </button>
      <button className="settings_options__song-length">Song Length</button>
      <button className="settings_options__gif-options">GIF Options</button>
      <button className="settings_options__rounds">Rounds</button>
      <button className="settings_options__voting-time">Voting Time</button>
    </div>
  );
}
