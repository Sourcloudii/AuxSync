import "./Room.css";
import exitButton from "../../images/exit-btn.svg";
import { MatchSettings } from "./MatchSettings";

import { Link } from "react-router-dom";

//Add lobby code bubble and player list later
export function Room({ lobbyCode, host, players }) {
  return (
    <main className="room">
      <div className="room__content">
        <div className="room__lobby-info">
          <button className="room__lobby-code-btn text_shadow">
            Lobby Code: {lobbyCode}
          </button>
          <div className="room__lobby-players-info">
            <Link className="room__exit-btn" to="/">
              <img src={exitButton} alt="Exit" />
            </Link>
            <div className="room__lobby-wrapper room__lobby-host-wrapper">
              <h3 className="title-label">Host: </h3>
              <p className="room__lobby-host">{host}</p>
            </div>
            <div className="room__lobby-wrapper room__lobby-players-wrapper">
              <h3 className="room__lobby-players-title title-label">
                Players:{" "}
              </h3>
              <ul className="room__lobby-players-list">
                {players.map((player, index) => (
                  <li className="room__lobby-players" key={index}>
                    {player}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <MatchSettings />
      </div>
    </main>
  );
}
