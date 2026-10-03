import { useEffect } from "react";
import { useMatchSettings } from "../contexts/MatchSettingsContext";
import { getSocket } from "../utils/socketFunctions/socket";

export function useSettingsSync() {
  const {
    rounds,
    votingTime,
    songSelectionTime,
    songLength,
    selectedGifOption,
    selectedSubOption,
    searchState,
  } = useMatchSettings();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("update-settings", {
      rounds,
      votingTime,
      songSelectionTime,
      songLength,
      gifOption: selectedGifOption,
      gifSubOption: selectedSubOption,
      searchEnabled: searchState,
    });
  }, [
    rounds,
    votingTime,
    songSelectionTime,
    songLength,
    selectedGifOption,
    selectedSubOption,
    searchState,
  ]);
}
