# react-auxsync

## Setup

```bash
npm install
```

## Running

```bash
# Starts backend + frontend together
npm run dev

# Or frontend only, from the react-auxsync directory
npm run dev
```

The dev server runs on **http://localhost:3000** and proxies `/api` and
`/socket.io` to the backend on `:3001`, so anything socket-driven needs
`python-auxsync` running too.

## Viewing each screen

There are two ways to reach a given screen, and they mock different amounts.

### 1. The live app - real data, no mocks

`http://localhost:3000`. Routing is `HashRouter`, so there are three URLs:

| URL | View |
| --- | --- |
| `#/` | `Main` - nickname, host, join |
| `#/room` | `Room` - player list + match settings |
| `#/lobby` | `Lobby` - every in-game phase |

`#/room` and `#/lobby` render off live socket state (`lobbyCode`, `players`,
`gameState` from `useRoomConnection`). Navigating straight to `#/lobby` shows an
empty shell, because `gameState` is undefined and no phase matches. Reaching a
real phase means running the backend, hosting a room, joining with a second
player, and playing forward - which is slow to do for a CSS tweak.

### 2. The layout harness - fully mocked, no socket

`harness.html` is a second Vite entry that mounts a screen with fixed props and
no network at all. Pick the screen with the `v` query param:

```
http://localhost:3000/harness.html?v=game-over
```

| `?v=` | Renders |
| --- | --- |
| `room` *(default)* | `Room` |
| `choosing` | `Lobby` - GIF selection, as the chooser |
| `searching` | `Lobby` - song search + submission |
| `listening` | `Lobby` - playback with skip votes |
| `voting` | `Lobby` - submissions + vote tallies |
| `results` | `Lobby` - round winners |
| `tiebreaker` | `Lobby` - rock-paper-scissors |
| `tiebreaker-locked` | `lobby` - 1/2 locked |
| `tiebreaker-reveal` | `lobby` - round 2 |
| `tiebreaker-draw` | `lobby` - draw |
| `game-over` | `Lobby` - podium + quote |

Anything unrecognised falls back to `voting`.

Use the harness for layout, responsive, and styling work. Use the live app for
anything involving real sockets, timers, or state transitions.

## What the harness mocks

All mock data lives at the top of `src/harness.jsx`:

- **`players`** - five players with descending points, one host, one
  disconnected. Enough to exercise the crown, the dimmed disconnected state,
  and the leaderboard's scroll behaviour.
- **`gifs` / `gif`** - placeholder images from `placehold.co`, so trending GIFs
  and the chosen GIF render without a Giphy key.
- **`submissions`** - one per player, with deliberately long track and artist
  names to catch text overflow.
- **`base`** - the shared `gameState` (round 2 of 5, a chooser, a next chooser,
  a 30s duration). Each entry in `phases` spreads `base` and overrides `phase`
  plus whatever that screen needs.

To try a different shape - a full 12-player room, a one-player podium, a name
long enough to ellipsize - edit those constants directly. Nothing is persisted
and nothing talks to the backend, so it is safe to change freely.

### Know

- The harness is dev-only. It is not in the build inputs, so `npm run build`
  emits `index.html` alone and nothing needs stripping before deploy.

## Project structure

```
src/
  main.jsx               # App entry point (HashRouter)
  harness.jsx            # Mock-prop layout harness (dev only)
  index.css              # Design tokens + global reset
  components/
    App/                 # Routes, socket wiring, falling-GIF backdrop
    Home/                # Main, JoinModal, Instructions, Options
    Room/                # Pre-game room + MatchSettings
    Lobby/               # Choosing, Searching, Listening, Voting,
                         #   Results, Tiebreaker, GameOver
    shared/              # Header, GifMedia, VolumeSlider
  contexts/
    MatchSettingsContext.jsx
    MatchSettingsProvidor.jsx
  utils/
    constants.js         # pfps, gestures, instructions, quotes
    useHoverCapable.js
    apis/                # checkResponse gate, room/gif/music fetches
    socketFunctions/     # socket client + useRoomConnection
    youtubeFunctions/    # useSongSearch, useYouTubePlayer
    gifFunctions/        # useTrendingGifs
```
