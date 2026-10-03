import "./Tiebreaker.css";
import { useState, useEffect } from "react";
import { getSocket } from "../../../utils/socketFunctions/socket";
import { TiebreakerPlayers } from "./TiebreakerPlayers";
import { TiebreakerHand, TiebreakerResult } from "./TiebreakerHand";

function useRpsRound(gameState) {
  const round = gameState?.rpsRound ?? 1;
  const duration = gameState?.duration;
  const revealed = (gameState?.rpsChoices ?? null) != null;

  const [myChoice, setMyChoice] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [trackedRound, setTrackedRound] = useState(round);
  if (trackedRound !== round) {
    setTrackedRound(round);
    setMyChoice(null);
  }

  const timerKey = `${round}-${revealed}-${duration}`;
  const [trackedTimerKey, setTrackedTimerKey] = useState(null);
  if (trackedTimerKey !== timerKey && duration) {
    setTrackedTimerKey(timerKey);
    setTimeLeft(Math.ceil(duration / 1000));
  }

  useEffect(() => {
    if (!duration) return;
    const endTime = Date.now() + duration;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [duration, round, revealed]);

  return { round, revealed, timeLeft, myChoice, setMyChoice };
}

export function Tiebreaker({ gameState, players, myPlayerId }) {
  const participants = gameState?.rpsParticipants || [];
  const winsNeeded = gameState?.rpsWinsNeeded ?? 2;
  const chosenCount = gameState?.rpsChosenCount ?? 0;
  const { round, revealed, timeLeft, myChoice, setMyChoice } =
    useRpsRound(gameState);

  const isParticipant = participants.some(p => p.playerId === myPlayerId);
  const hasChosen = myChoice != null || (gameState?.youRpsChose ?? false);

  const throwGesture = gesture => {
    if (!isParticipant || hasChosen || revealed) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("rps-choice", gesture, response => {
      if (response?.error) {
        console.error("RPS error:", response.error);
        return;
      }
      setMyChoice(gesture);
    });
  };

  return (
    <div className="tiebreaker">
      <h2 className="tiebreaker__title">It's a Tie!</h2>
      <p className="tiebreaker__subtitle">
        Rock · Paper · Scissors - first to {winsNeeded} round wins takes an
        extra point!
      </p>
      <p className="tiebreaker__status">
        Round {round}
        {!revealed && (
          <>
            {" "}
            · {timeLeft}s · {chosenCount}/{participants.length} locked in
          </>
        )}
      </p>

      <TiebreakerPlayers
        participants={participants}
        players={players}
        wins={gameState?.rpsWins || {}}
        winsNeeded={winsNeeded}
        choices={gameState?.rpsChoices || null}
        roundWinnerIds={gameState?.rpsRoundWinnerIds || []}
      />

      <TiebreakerFooter
        revealed={revealed}
        isDraw={gameState?.rpsDraw ?? false}
        roundWinnerNames={gameState?.rpsRoundWinnerNames || []}
        isParticipant={isParticipant}
        myChoice={myChoice}
        hasChosen={hasChosen}
        onThrow={throwGesture}
      />
    </div>
  );
}

function TiebreakerFooter({
  revealed,
  isDraw,
  roundWinnerNames,
  isParticipant,
  myChoice,
  hasChosen,
  onThrow,
}) {
  if (revealed) {
    return (
      <TiebreakerResult isDraw={isDraw} roundWinnerNames={roundWinnerNames} />
    );
  }

  if (!isParticipant) {
    return (
      <p className="tiebreaker__hint">
        Waiting for the tied players to throw...
      </p>
    );
  }

  return (
    <TiebreakerHand
      myChoice={myChoice}
      hasChosen={hasChosen}
      onThrow={onThrow}
    />
  );
}
