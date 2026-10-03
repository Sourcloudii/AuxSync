import { useMemo, useState } from "react";
import { MatchSettingsContext } from "./MatchSettingsContext";

export function MatchSettingsProvidor({ children }) {
  const [rounds, setRounds] = useState(2);
  const [votingTime, setVotingTime] = useState(30);
  const [songSelectionTime, setSongSelectionTime] = useState(60);
  const [songLength, setSongLength] = useState(30);
  const [subOptionsState, setSubOptionsState] = useState(false);
  const [selectedSubOption, setSelectedSubOption] = useState("one");
  const [selectedGifOption, setSelectedGifOption] = useState("single");
  const [searchState, setSearchState] = useState(true);

  const value = useMemo(
    () => ({
      rounds,
      setRounds,
      votingTime,
      setVotingTime,
      songSelectionTime,
      setSongSelectionTime,
      songLength,
      setSongLength,
      subOptionsState,
      setSubOptionsState,
      selectedSubOption,
      setSelectedSubOption,
      selectedGifOption,
      setSelectedGifOption,
      searchState,
      setSearchState,
    }),
    [
      rounds,
      votingTime,
      songSelectionTime,
      songLength,
      subOptionsState,
      selectedSubOption,
      selectedGifOption,
      searchState,
    ],
  );

  return (
    <MatchSettingsContext.Provider value={value}>
      {children}
    </MatchSettingsContext.Provider>
  );
}
