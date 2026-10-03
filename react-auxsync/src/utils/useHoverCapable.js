import { useSyncExternalStore } from "react";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange) {
  const query = window.matchMedia(HOVER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(HOVER_QUERY).matches;
}

export function useHoverCapable() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
