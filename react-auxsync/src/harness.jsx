import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import "./index.css";
import "./components/App/App.css";
import { Header } from "./components/shared/Header/Header";
import { Room } from "./components/Room/Room";
import { Lobby } from "./components/Lobby/Lobby";
import { MatchSettingsProvidor } from "./contexts/MatchSettingsProvidor";
import { setSocketForTesting } from "./utils/socketFunctions/socket";

const gif = {
  id: "g1",
  title: "dancing cat",
  images: {
    original: { mp4: "", webp: "https://placehold.co/300x180/png" },
    downsized: { url: "https://placehold.co/120x90/png" },
  },
};

const gifs = Array.from({ length: 8 }, (_, i) => ({
  ...gif,
  id: `g${i}`,
  title: `gif ${i}`,
}));

const players = [
  { playerId: "me", name: "mmmmmmmmm", points: 10, isHost: true },
  { playerId: "aaa", name: "Kenzington", points: 7 },
  { playerId: "bbb", name: "Marisol", points: 5 },
  { playerId: "ccc", name: "Tunde", points: 4 },
  { playerId: "ddd", name: "Bea", points: 2, connected: false },
  { playerId: "eee", name: "Xiaoming", points: 1 },
  { playerId: "fff", name: "Liam", points: 0, waiting: true },
  { playerId: "ggg", name: "Avery", points: 0, waiting: true },
  { playerId: "hhh", name: "Sofia", points: 0 },
  { playerId: "iii", name: "Jordan", points: 10 },
  { playerId: "jjj", name: "Kenzington", points: 7 },
  { playerId: "kkk", name: "Marisol", points: 5 },
  { playerId: "lll", name: "Tunde", points: 4 },
  { playerId: "mmm", name: "Bea", points: 2, connected: false },
  { playerId: "nnn", name: "Xiaoming", points: 1 },
];

const winningSongs = {
  bbb: {
    trackUri: "dQw4w9WgXcQ",
    trackName: "Midnight City",
    artist: "M83",
    albumArt: "https://placehold.co/80x80/png",
    startTime: 43,
  },
  ccc: {
    trackUri: "kJQP7kiw5Fk",
    trackName: "A Very Long Song Title That Has To Truncate With An Ellipsis",
    artist: "An Artist With An Equally Unreasonable Channel Name",
    albumArt: "https://placehold.co/80x80/png",
  },
};

const submissions = players.map((p, i) => ({
  playerId: p.playerId,
  playerName: p.name,
  trackName: `A Very Long Song Title Number ${i}`,
  artist: "Some Artist With A Long Name",
  albumArt: "https://placehold.co/50x50/png",
}));

const MOCK_TRACKS = [
  { title: "Midnight City", channelTitle: "M83" },
  { title: "Blue Monday", channelTitle: "New Order" },
  {
    title: "A Very Long Song Title That Has To Truncate With An Ellipsis",
    channelTitle: "An Artist With An Equally Unreasonable Channel Name",
  },
  { title: "Bad Habit", channelTitle: "Steve Lacy" },
  { title: "웃음꽃", channelTitle: "十二月" },
  { title: "Redbone", channelTitle: "Childish Gambino" },
  { title: "Nights", channelTitle: "Frank Ocean" },
  { title: "Flashing Lights", channelTitle: "Kanye West" },
];

const mockSearch = term =>
  MOCK_TRACKS.map((track, i) => ({
    videoId: `mock-${i}`,
    title: i === 0 ? `${term} - ${track.title}` : track.title,
    channelTitle: track.channelTitle,
    thumbnail: i === 3 ? "" : "https://placehold.co/30x30/png",
  }));

const base = {
  currentRound: 2,
  totalRounds: 5,
  chooserPlayerId: "bbb",
  nextChooserPlayerId: "ccc",
  chosenGif: gif,
  duration: 30000,
  phaseKey: "k",
  settings: { songLength: 30, gifSubOption: "six", searchEnabled: true },
};

const rpsBase = {
  ...base,
  phase: "tiebreaker",
  duration: 10000,
  rpsParticipants: [
    { playerId: "me", playerName: "Me" },
    { playerId: "aaa", playerName: "Kenzington" },
  ],
  rpsWinsNeeded: 2,
  rpsRound: 1,
  rpsWins: { me: 0, aaa: 0 },
  rpsChosenCount: 0,
  rpsChoices: null,
  rpsRoundWinnerIds: [],
  rpsRoundWinnerNames: [],
  rpsDraw: false,
  youRpsChose: false,
};

const phases = {
  choosing: { ...base, phase: "choosing", chooserPlayerId: "me" },
  searching: {
    ...base,
    phase: "searching",
    submissionCount: 2,
    expectedSubmissions: 4,
  },
  listening: {
    ...base,
    phase: "listening",
    songIndex: 1,
    totalSongs: 4,
    skipVoteCount: 1,
    skipVotesNeeded: 3,
    currentSong: {
      trackUri: "x",
      trackName: "Midnight City",
      artist: "M83",
      playerName: "Marisol",
      albumArt: "https://placehold.co/80x80/png",
      startTime: 42,
    },
  },
  voting: {
    ...base,
    phase: "voting",
    submissions,
    votes: { bbb: ["aaa", "ccc"], ccc: ["ddd"] },
    voteCount: 3,
    expectedVotes: 5,
  },
  results: {
    ...base,
    phase: "results",
    winners: ["Marisol", "Tunde"],
    roundResults: {
      winners: ["bbb", "ccc"],
      voteCounts: { bbb: 4, ccc: 4, ddd: 1 },
      submissions: winningSongs,
    },
    duration: 8000,
  },
  "results-final": {
    ...base,
    phase: "results",
    currentRound: 5,
    winners: ["Marisol", "Tunde"],
    roundResults: {
      winners: ["bbb", "ccc"],
      voteCounts: { bbb: 6, ccc: 2 },
      submissions: winningSongs,
    },
    duration: 8000,
  },
  tiebreaker: rpsBase,
  "tiebreaker-locked": { ...rpsBase, youRpsChose: true, rpsChosenCount: 1 },
  "tiebreaker-reveal": {
    ...rpsBase,
    rpsRound: 2,
    rpsWins: { me: 0, aaa: 1 },
    rpsChosenCount: 2,
    rpsChoices: { me: "scissors", aaa: "rock" },
    rpsRoundWinnerIds: ["aaa"],
    rpsRoundWinnerNames: ["Kenzington"],
  },
  "tiebreaker-draw": {
    ...rpsBase,
    rpsChosenCount: 2,
    rpsChoices: { me: "paper", aaa: "paper" },
    rpsDraw: true,
  },
  "game-over": {
    ...base,
    phase: "game-over",
    winner: { name: "Marisol" },
    tiebreakerWinner: { playerName: "Marisol" },
  },
};

const noop = () => {};

const VIEWS = [
  "room",
  "room-filling",
  "choosing",
  "searching",
  "listening",
  "voting",
  "results",
  "results-final",
  "tiebreaker",
  "tiebreaker-locked",
  "tiebreaker-reveal",
  "tiebreaker-draw",
  "game-over",
];

const switcherStyle = {
  position: "fixed",
  right: "8px",
  bottom: "8px",
  zIndex: 9999,
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: "4px",
  maxWidth: "min(420px, 60vw)",
  padding: "6px",
  borderRadius: "10px",
  background: "#000000cc",
  font: "12px/1 system-ui, sans-serif",
};

const linkStyle = {
  padding: "4px 7px",
  borderRadius: "6px",
  background: "#ffffff26",
  color: "#fff",
  textDecoration: "none",
};

const activeLinkStyle = { background: "#f0a07d", color: "#000" };

function ViewSwitcher({ current }) {
  return (
    <nav style={switcherStyle} aria-label="Harness views">
      {VIEWS.map(name => (
        <a
          key={name}
          href={`?v=${name}`}
          style={
            name === current ? { ...linkStyle, ...activeLinkStyle } : linkStyle
          }
        >
          {name}
        </a>
      ))}
    </nav>
  );
}

function View() {
  const view = new URLSearchParams(location.search).get("v") || "room";
  const inGame = view !== "main";
  const [searchResults, setSearchResults] = useState([]);
  const [votes, setVotes] = useState(phases.voting.votes);
  const [voteCount, setVoteCount] = useState(phases.voting.voteCount);

  useEffect(() => {
    setSocketForTesting({
      emit(event, payload, ack) {
        if (event !== "vote-cast") return;
        setVotes(prev => ({
          ...prev,
          [payload]: [...(prev[payload] || []), "me"],
        }));
        setVoteCount(n => n + 1);
        ack?.({ success: true });
      },
      on: noop,
      off: noop,
      disconnect: noop,
    });
  }, []);

  const handleSongSearchChange = e => {
    const term = e.target.value.trim();
    setSearchResults(term ? mockSearch(term) : []);
  };

  const phase = phases[view] || phases.voting;
  const gameState =
    phase.phase === "voting" ? { ...phase, votes, voteCount } : phase;

  let content;
  if (view === "room" || view === "room-filling") {
    content = (
      <Room
        lobbyCode="A1B2"
        isHost
        players={view === "room-filling" ? players.slice(0, 4) : players}
        startGame={noop}
        leaveRoom={noop}
      />
    );
  } else {
    content = (
      <Lobby
        gifs={gifs}
        handleSongSearchChange={handleSongSearchChange}
        searchResults={searchResults}
        players={players}
        myPlayerId="me"
        isWaiting={false}
        playVideo={noop}
        playerReady
        duration={200}
        isPaused={false}
        seekTo={noop}
        pauseVideo={noop}
        resumeVideo={noop}
        setVolume={noop}
        getCurrentTime={() => 0}
        gameState={gameState}
        leaveRoom={noop}
      />
    );
  }

  return (
    <>
      <div className="page">
        <div className="falling-gifs">
          <div className="page__content">
            <Header location={inGame ? "/lobby" : "/"} />
            <div className="page__view">{content}</div>
          </div>
        </div>
      </div>
      <ViewSwitcher current={view} />
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MemoryRouter>
      <MatchSettingsProvidor>
        <View />
      </MatchSettingsProvidor>
    </MemoryRouter>
  </StrictMode>,
);
