import { gestures } from "../../../utils/constants";

export function TiebreakerHand({ myChoice, hasChosen, onThrow }) {
  return (
    <>
      <div className="tiebreaker__hand">
        {gestures.map(gesture => (
          <button
            key={gesture.id}
            type="button"
            className={`tiebreaker__gesture-btn ${myChoice === gesture.id ? "tiebreaker__gesture-btn--chosen" : ""}`}
            onClick={() => onThrow(gesture.id)}
            disabled={hasChosen && myChoice !== gesture.id}
            aria-label={gesture.label}
            title={gesture.label}
          >
            <img
              src={gesture.emoji}
              alt=""
              className="tiebreaker__gesture-btn-img"
            />
          </button>
        ))}
      </div>
      <p className="tiebreaker__hint">
        {hasChosen ? "Locked in! Waiting for the others..." : "Pick your throw!"}
      </p>
    </>
  );
}

export function TiebreakerResult({ isDraw, roundWinnerNames }) {
  if (isDraw) return <p className="tiebreaker__result">Draw - throw again!</p>;

  const verb = roundWinnerNames.length > 1 ? "take" : "takes";

  return (
    <p className="tiebreaker__result">
      {roundWinnerNames.join(" & ")} {verb} the round!
    </p>
  );
}
