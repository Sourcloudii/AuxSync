import { useState, useEffect } from "react";

export function usePhaseCountdown(duration, phaseKey) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [trackedKey, setTrackedKey] = useState(null);

  if (trackedKey !== phaseKey && duration) {
    setTrackedKey(phaseKey);
    setTimeLeft(Math.ceil(duration / 1000));
  }

  useEffect(() => {
    if (!duration) return;

    const endTime = Date.now() + duration;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [duration, phaseKey]);

  return timeLeft;
}
