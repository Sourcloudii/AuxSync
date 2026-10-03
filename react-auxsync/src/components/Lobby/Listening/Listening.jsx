import "./Listening.css";
import { GifMedia } from "../../shared/GifMedia/GifMedia";
import { useState, useEffect } from "react";
import { getSocket } from "../../../utils/socketFunctions/socket";

export function Listening({
  chosenGif,
  currentSong,
  songIndex,
  totalSongs,
  skipVoteCount,
  skipVotesNeeded,
  duration,
  playVideo,
  playerReady,
  initialSkipVoted,
}) {
  // initialSkipVoted restores a mid-song skip vote after a reconnect
  const [votedSkipForIndex, setVotedSkipForIndex] = useState(initialSkipVoted ? songIndex : -1);
  const [timeLeft, setTimeLeft] = useState(() => Math.ceil((duration || 0) / 1000));
  const hasVotedSkip = votedSkipForIndex === songIndex;

  const timerKey = `${songIndex}-${duration}`;
  const [trackedTimerKey, setTrackedTimerKey] = useState(null);
  if (trackedTimerKey !== timerKey && duration) {
    setTrackedTimerKey(timerKey);
    setTimeLeft(Math.ceil(duration / 1000));
  }

  useEffect(() => {
    if (currentSong?.trackUri && playerReady) {
      playVideo(currentSong.trackUri, currentSong.startTime ?? 0);
    }
  }, [currentSong?.trackUri, currentSong?.startTime, playerReady, playVideo]);

  useEffect(() => {
    if (!duration) return;

    const endTime = Date.now() + duration;

    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [duration, songIndex]);

  const handleSkipVote = () => {
    if (hasVotedSkip) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("vote-skip", response => {
      if (response?.error) {
        console.error("Skip vote error:", response.error);
        return;
      }
      setVotedSkipForIndex(songIndex);
    });
  };

  return (
    <div className="listening">
      <p className="listening__progress">
        Song {songIndex + 1} of {totalSongs}
      </p>
      <GifMedia gif={chosenGif} className="listening__gif" />
      {currentSong && (
        <div className="listening__song-info">
          {currentSong.albumArt && (
            <img
              src={currentSong.albumArt}
              alt={`Album art for ${currentSong.trackName}`}
              className="listening__album-art"
            />
          )}
          <div className="listening__song-info-wrapper">
            <p className="listening__track-name">{currentSong.trackName} - {currentSong.artist}</p>
            <p className="listening__submitter">Submitted by: {currentSong.playerName}</p>
          </div>
        </div>
      )}
      <div className="listening__player-wrapper">
        <div id="yt-player-container" className="listening__player" />
      </div>
      <p className="listening__timer">{timeLeft}s</p>
      <div className="listening__skip-wrapper">
        <button
          type="button"
          className={`listening__skip-btn ${hasVotedSkip ? "listening__skip-btn--voted" : ""}`}
          onClick={handleSkipVote}
          disabled={hasVotedSkip}
        >
          {hasVotedSkip ? "Voted to Skip" : "Vote to Skip"}
        </button>
        <p className="listening__skip-count">
          {skipVoteCount}/{skipVotesNeeded} votes to skip
        </p>
      </div>
    </div>
  );
}
