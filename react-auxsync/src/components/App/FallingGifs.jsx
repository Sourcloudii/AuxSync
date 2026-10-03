export function FallingGifs({ gifs }) {
  return gifs.slice(0, 24).map(gif => (
    <img
      key={gif.id}
      src={gif.images.downsized.url}
      alt={gif.title || "Falling GIF"}
      aria-hidden="true"
      className="falling-gifs_imgs"
      loading="lazy"
      style={{
        left: `${gif.positionLeft}%`,
        top: `-${gif.positionTop}%`,
        animationDuration: `${gif.duration}s`,
        "--initial-opacity": gif.opacity,
      }}
    />
  ));
}
