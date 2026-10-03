import "./Searching.css";
import { SongPlayer } from "./SongPlayer";
import { GifMedia } from "../../shared/GifMedia/GifMedia";
import { useState } from "react";
import { getSocket } from "../../../utils/socketFunctions/socket";

export function Searching({
  chosenGif,
  handleSongSearchChange,
  searchResults,
  playVideo,
  playerReady,
  timeLeft,
  songLength,
  duration,
  isPaused,
  seekTo,
  pauseVideo,
  resumeVideo,
  getCurrentTime,
  initialSubmitted,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submitted, setSubmitted] = useState(initialSubmitted ?? false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [regionStart, setRegionStart] = useState(0);

  const handleSearchChange = e => {
    e.preventDefault();
    setSearchTerm(e.target.value);
    handleSongSearchChange(e);
  };

  const handleSongClick = track => {
    if (!playerReady || submitted) return;
    setSelectedTrack(track);
    setRegionStart(0);
    playVideo(track.videoId);
  };

  const handleSongSubmit = () => {
    if (!selectedTrack || submitted) return;
    const socket = getSocket();
    if (!socket) return;
    const maxStart = Math.max(0, (duration || 0) - songLength);
    socket.emit(
      "song-submitted",
      {
        trackUri: selectedTrack.videoId,
        trackName: selectedTrack.title,
        artist: selectedTrack.channelTitle,
        albumArt: selectedTrack.thumbnail || "",
        startTime: Math.round(Math.max(0, Math.min(maxStart, regionStart))),
      },
      response => {
        if (response?.error) {
          console.error("Song submission error:", response.error);
          return;
        }
        setSubmitted(true);
      },
    );
  };

  return (
    <div className="lobby__search-wrapper">
      <GifMedia gif={chosenGif} className="lobby__search-gif" />
      <p className="lobby__timer">{timeLeft}s</p>
      {submitted ? (
        <p className="lobby__search-submitted">Song submitted! Waiting for others...</p>
      ) : (
        <>
          {selectedTrack ? (
            <>
              <SongPlayer
                trackName={selectedTrack.title}
                artist={selectedTrack.channelTitle}
                songLength={songLength}
                duration={duration}
                isPaused={isPaused}
                seekTo={seekTo}
                pauseVideo={pauseVideo}
                resumeVideo={resumeVideo}
                getCurrentTime={getCurrentTime}
                regionStart={regionStart}
                setRegionStart={setRegionStart}
              />
              <div className="lobby__search-actions">
                <button
                  type="button"
                  className="lobby__search-submit-btn"
                  onClick={handleSongSubmit}
                >
                  Submit Song
                </button>
                <button
                  type="button"
                  className="lobby__search-back-btn"
                  onClick={() => {
                    setSelectedTrack(null);
                    setRegionStart(0);
                    pauseVideo();
                  }}
                  aria-label="Pick Another Song"
                >
                  Pick Another
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="lobby__search-query">
                <label htmlFor="songSearch" className="visually-hidden">
                  Search Song
                </label>
                <input
                  autoComplete="off"
                  id="songSearch"
                  name="songSearch"
                  className="lobby__search-input"
                  type="text"
                  placeholder="Search Song"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <ul className="lobby__search-results">
                {searchResults.map(track => (
                  <li
                    key={track.videoId}
                    className={`lobby__search-item ${!playerReady ? "lobby__search-item--disabled" : ""}`}
                  >
                    <button
                      type="button"
                      className="lobby__search-item-btn"
                      onClick={() => handleSongClick(track)}
                      disabled={!playerReady}
                    >
                      {track.thumbnail && (
                        <img
                          src={track.thumbnail}
                          alt={`Album art for ${track.title}`}
                          className="lobby__search-item-art"
                        />
                      )}
                      <span className="lobby__search-item-info">
                        {track.title} - {track.channelTitle}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
