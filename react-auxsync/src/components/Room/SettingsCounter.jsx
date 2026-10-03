export function SettingsCounter({
  name,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  decreaseLabel,
  increaseLabel,
}) {
  const labelId = `${name}-label`;

  return (
    <div
      className={`settings_options-wrapper settings_options__${name}-wrapper`}
      role="group"
      aria-labelledby={labelId}
    >
      <span
        id={labelId}
        className={`settings_options-label settings_options__${name} text-shadow`}
      >
        {label}
      </span>
      <div className={`settings_options__${name}-counter`}>
        <button
          type="button"
          className={`settings_options__${name}-btn ${name}-decrement`}
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          aria-label={decreaseLabel}
        >
          &minus;
        </button>
        <span className={`settings_options__${name}-value`}>{display}</span>
        <button
          type="button"
          className={`settings_options__${name}-btn ${name}-increment`}
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          aria-label={increaseLabel}
        >
          +
        </button>
      </div>
    </div>
  );
}
