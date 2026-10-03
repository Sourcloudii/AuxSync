import { useState } from "react";
import { MatchSettings } from "./MatchSettings";
import { usePageSEO, PAGE_SEO } from "../../hooks/usePageSEO";
import { DEFAULT_MAX_PLAYERS } from "../../utils/constants";
import eyeClosed from "../../images/eye-closed.svg";
import eyeOpen from "../../images/eye-open.svg";
import "./Room.css";

export function Room({
  lobbyCode,
  isHost,
  players,
  startGame,
  leaveRoom,
  maxPlayers = DEFAULT_MAX_PLAYERS,
}) {
  const [hidden, setHidden] = useState(true);
  const [copied, setCopied] = useState(false);
  const hostPlayer = players.find(p => p.isHost);
  const guests = players.filter(p => !p.isHost);
  const slotCount = Math.max(maxPlayers - 1, guests.length);
  const slots = Array.from(
    { length: slotCount },
    (_, index) => guests[index] ?? null,
  );

  usePageSEO({
    ...PAGE_SEO.room,
    title: lobbyCode ? `Waiting Room ${lobbyCode}` : PAGE_SEO.room.title,
  });

  const handleCopyLobbyCode = () => {
    const { origin, pathname } = window.location;
    navigator.clipboard.writeText(`${origin}${pathname}#/join/${lobbyCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="room">
      <h1 className="visually-hidden">AuxSync waiting room {lobbyCode}</h1>
      <div className="room__content">
        <section className="room__info" aria-label="Room">
          <div className="room__code-wrapper">
            <p
              className={`room__code-copied ${copied ? "room__code-copied--visible" : ""}`}
              aria-live="polite"
            >
              {copied ? "Invite link copied!" : ""}
            </p>
            <button
              type="button"
              className="room__code-btn text-shadow"
              onClick={handleCopyLobbyCode}
              aria-label={`Copy invite link for lobby ${lobbyCode}`}
            >
              Room Code:{" "}
              <span
                className={`room__code-value ${hidden ? "room__code-value--discreet" : ""}`}
              >
                {lobbyCode}
              </span>
            </button>
            <button
              className="room__code-hide-btn"
              type="button"
              onClick={() => setHidden(!hidden)}
              aria-label={hidden ? "Reveal Room Code" : "Blur Room Code"}
            >
              <img
                src={hidden ? eyeClosed : eyeOpen}
                alt={hidden ? "Code Blurred" : "Code Visible"}
              />
            </button>
          </div>
          <div className="room__players-info">
            <button
              type="button"
              className="room__exit-btn"
              onClick={leaveRoom}
              aria-label="Exit Room"
            />
            <div className="room__wrapper room__host-wrapper">
              <h2 className="title-label">Host: </h2>
              <p className="room__host">{hostPlayer ? hostPlayer.name : ""}</p>
            </div>
            <div className="room__wrapper room__players-wrapper">
              <h2 className="room__players-title title-label">Players: </h2>
              <ul className="room__players-list">
                {slots.map((player, index) => {
                  const slotClasses = ["room__slot", player && "room__slot--filled"]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <li
                      className={slotClasses}
                      key={player?.playerId ?? `slot-${index}`}
                      aria-hidden={player ? undefined : "true"}
                    >
                      {player?.name ?? ""}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
        {isHost && <MatchSettings startGame={startGame} players={players} />}
      </div>
    </main>
  );
}
