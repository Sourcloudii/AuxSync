import { useState } from "react";
import { MatchSettingsContext } from "./MatchSettingsContext";

export function MatchSettingsProvidor({ children }) {
  const [rounds, setRounds] = useState(2);
  const [votingTime, setVotingTime] = useState(30);
  const [isSongSelectionTimeOpen, setIsSongSelectionTimeOpen] = useState(false);
  const [isSongTimeOpen, setIsSongTimeOpen] = useState(false);
  const [subOptionsState, setSubOptionsState] = useState(false);
  const [selectedSubOption, setSelectedSubOption] = useState("three");
  const [selectedGifOption, setSelectedGifOption] = useState("single");
  const [searchState, setSearchState] = useState(false);

  return (
    <MatchSettingsContext.Provider
      value={{
        rounds,
        setRounds,
        votingTime,
        setVotingTime,
        isSongSelectionTimeOpen,
        setIsSongSelectionTimeOpen,
        isSongTimeOpen,
        setIsSongTimeOpen,
        subOptionsState,
        setSubOptionsState,
        selectedSubOption,
        setSelectedSubOption,
        selectedGifOption,
        setSelectedGifOption,
        searchState,
        setSearchState,
      }}
    >
      {children}
    </MatchSettingsContext.Provider>
  );
}
