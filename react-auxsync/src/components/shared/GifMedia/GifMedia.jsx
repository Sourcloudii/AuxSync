export function GifMedia({ gif, className }) {
  const mp4 = gif?.images?.original?.mp4;
  const webp = gif?.images?.original?.webp;

  if (mp4) {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        src={mp4}
        className={className}
        aria-label={gif.title || "Chosen GIF"}
      />
    );
  }
  if (webp) {
    return <img src={webp} alt={gif.title || "Chosen GIF"} className={className} />;
  }
  return null;
}
