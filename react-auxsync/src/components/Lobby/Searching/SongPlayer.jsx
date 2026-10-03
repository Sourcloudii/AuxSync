import "./SongPlayer.css";
import { useState, useRef, useEffect, useEffectEvent } from "react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SongPlayer({
  trackName,
  artist,
  songLength,
  duration,
  isPaused,
  seekTo,
  pauseVideo,
  resumeVideo,
  getCurrentTime,
  regionStart,
  setRegionStart,
}) {
  const [dragging, setDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const trackRef = useRef(null);
  const dragStartX = useRef(0);
  const dragStartVal = useRef(0);
  const wasPausedBeforeDrag = useRef(false);

  const maxTime = duration || 0;

  // Derived, not written back to state: regionStart is owned by the parent so it
  // can be submitted with the song, and a child may not set a parent's state
  // during render. Every path that moves it already clamps.
  const clampedRegionStart =
    maxTime > 0 && regionStart + songLength > maxTime
      ? Math.max(0, maxTime - songLength)
      : regionStart;

  const regionEnd = clampedRegionStart + songLength;

  useEffect(() => {
    const id = setInterval(() => {
      if (!dragging && getCurrentTime) {
        const t = getCurrentTime();
        setCurrentTime(t);

        if (t >= clampedRegionStart + songLength && !isPaused) {
          seekTo(clampedRegionStart);
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [dragging, getCurrentTime, clampedRegionStart, songLength, seekTo, isPaused]);

  const handleDragStart = e => {
    e.preventDefault();
    setDragging(true);
    wasPausedBeforeDrag.current = isPaused;
    pauseVideo();
    dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    dragStartVal.current = clampedRegionStart;
  };

  const onDragMove = useEffectEvent(e => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = trackRef.current.getBoundingClientRect();
    const deltaRatio = (clientX - dragStartX.current) / rect.width;
    const deltaTime = deltaRatio * maxTime;
    const newStart = dragStartVal.current + deltaTime;
    setRegionStart(Math.max(0, Math.min(maxTime - songLength, newStart)));
  });

  const onDragEnd = useEffectEvent(() => {
    setDragging(false);
    if (!wasPausedBeforeDrag.current) {
      seekTo(clampedRegionStart);
      resumeVideo();
    }
  });

  useEffect(() => {
    if (!dragging) return;

    const handleMove = e => onDragMove(e);
    const handleUp = () => onDragEnd();

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging]);

  const maxStart = Math.max(0, maxTime - songLength);

  const handleRegionKeyDown = e => {
    const delta = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : null;
    if (delta === null) return;
    e.preventDefault();
    setRegionStart(prev => Math.max(0, Math.min(maxStart, prev + delta)));
  };

  const regionLeftPct = maxTime > 0 ? (clampedRegionStart / maxTime) * 100 : 0;
  const regionWidthPct = maxTime > 0 ? (songLength / maxTime) * 100 : 0;

  const regionProgress =
    songLength > 0
      ? Math.max(
          0,
          Math.min(100, ((currentTime - clampedRegionStart) / songLength) * 100),
        )
      : 0;

  return (
    <div className="song-player">
      <p className="song-player__track-info">
        {trackName || "*Song Title*"} - {artist || "*Artist*"}
      </p>
      <div className="song-player__seekbar-wrapper">
        <div className="song-player__region-label">
          {formatTime(clampedRegionStart)} - {formatTime(regionEnd)}
        </div>
        <div className="song-player__seekbar-row">
          <span className="song-player__time">0:00</span>
          <div className="song-player__track" ref={trackRef}>
            <div
              className={`song-player__region ${dragging ? "song-player__region--dragging" : ""}`}
              style={{
                left: `${regionLeftPct}%`,
                width: `${regionWidthPct}%`,
              }}
              role="slider"
              tabIndex={0}
              aria-label="Song clip start time"
              aria-valuemin={0}
              aria-valuemax={Math.round(maxStart)}
              aria-valuenow={Math.round(clampedRegionStart)}
              aria-valuetext={`${formatTime(clampedRegionStart)} to ${formatTime(regionEnd)}`}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              onKeyDown={handleRegionKeyDown}
            >
              <div className="song-player__handle song-player__handle--left" />
              <div className="song-player__handle song-player__handle--right" />
              <div
                className="song-player__playbar-fill"
                style={{ width: `${regionProgress}%` }}
              />
            </div>
          </div>
          <span className="song-player__time">
            {maxTime > 0 ? formatTime(maxTime) : "*max*"}
          </span>
        </div>
      </div>
      <div
        className={"song-player__video-container"}
      >
        <div id="yt-player-container" className="song-player__video" />
      </div>
    </div>
  );
}
