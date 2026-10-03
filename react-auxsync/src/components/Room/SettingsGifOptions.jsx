const SUB_OPTIONS = [
  { id: "three", digit: "3", label: "Three GIFs" },
  { id: "four", digit: "4", label: "Four GIFs" },
  { id: "six", digit: "6", label: "Six GIFs" },
];

export function SettingsGifOptions({
  subOptionsState,
  selectedSubOption,
  setSelectedSubOption,
  selectedGifOption,
  setSelectedGifOption,
  setSubOptionsState,
  searchState,
  setSearchState,
}) {
  const pickSingle = () => {
    setSubOptionsState(false);
    setSelectedGifOption("single");
    setSelectedSubOption("one");
  };

  const pickMultiple = () => {
    setSubOptionsState(true);
    setSelectedGifOption("multiple");
    setSelectedSubOption("three");
  };

  return (
    <div
      className="settings_options-wrapper settings_options__gif-options-wrapper"
      role="group"
      aria-labelledby="gif-options-label"
    >
      <div className="settings_options__gif-options-header">
        <span
          id="gif-options-label"
          className="settings_options-label settings_options__gif-options text-shadow"
        >
          GIF Options
        </span>
        <div
          className="settings_options__gif-options-sub-btns-wrapper"
          data-open={subOptionsState || undefined}
        >
          {SUB_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              className={`settings_options__gif-options-sub-btn ${option.id}-option`}
              onClick={() => setSelectedSubOption(option.id)}
              aria-pressed={selectedSubOption === option.id}
              aria-label={option.label}
              title={option.label}
            >
              {option.digit}
            </button>
          ))}
        </div>
      </div>
      <div className="settings_options__gif-options-btns-wrapper">
        <button
          type="button"
          className="settings_options__gif-options-btn single-option"
          onClick={pickSingle}
          aria-pressed={selectedGifOption === "single"}
          aria-label="Single GIF"
        >
          Single
        </button>
        <button
          type="button"
          className="settings_options__gif-options-btn multiple-option"
          onClick={pickMultiple}
          aria-pressed={selectedGifOption === "multiple"}
          aria-label="Multiple GIFs"
        >
          Multiple
        </button>
        <button
          type="button"
          className="settings_options__gif-options-btn lens-option"
          onClick={() => setSearchState(!searchState)}
          aria-pressed={searchState}
          aria-label="Toggle GIF Search"
          title="Toggle GIF Search"
        />
      </div>
    </div>
  );
}
