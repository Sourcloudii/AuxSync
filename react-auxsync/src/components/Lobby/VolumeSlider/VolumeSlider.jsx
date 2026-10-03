import "./VolumeSlider.css";
import { useState } from "react";

export function VolumeSlider({ setVolume, className }) {
  const [volume, setVolumeState] = useState(
    () => Number(localStorage.getItem("auxsync-volume") ?? 50),
  );

  const handleVolumeChange = e => {
    const val = Number(e.target.value);
    setVolumeState(val);
    setVolume(val);
    localStorage.setItem("auxsync-volume", val);
  };

  const volumeClass =
    volume === 0
      ? "volume-slider__icon--mute"
      : volume < 50
        ? "volume-slider__icon--low"
        : "volume-slider__icon--high";

  return (
    <div className={`volume-slider ${className || ""}`}>
      <input
        type="range"
        className="volume-slider__input"
        aria-label="Volume"
        min="0"
        max="100"
        value={volume}
        onChange={handleVolumeChange}
        style={{ "--volume-fill": `${volume}%` }}
      />
      <div className={`volume-slider__icon ${volumeClass}`} />
    </div>
  );
}
