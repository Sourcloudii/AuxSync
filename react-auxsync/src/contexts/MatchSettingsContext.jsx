import { createContext, useContext } from "react";

export const MatchSettingsContext = createContext();

export function useMatchSettings() {
  return useContext(MatchSettingsContext);
}
