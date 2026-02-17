import "./Room.css";
import exitButton from "../../images/exit-btn.svg";
// import clipBoard from "../../images/clipboard.png";
import { MatchSettings } from "./MatchSettings";

import { Link } from "react-router-dom";

//Add lobby code bubble and player list later
export function Room({ lobbyCode }) {
  return (
    <main className="room">
      <div className="room__content">
        <div className="room__lobby-info">
          <h2
            className="room__lobby-code"
            // style={{ cursor: `url(${clipBoard}), auto` }}
          >
            Lobby Code: 7B2W
          </h2>
          <div className="room__lobby-players__wrapper">
            <Link className="room__exit-btn" to="/">
              <img src={exitButton} alt="Exit" />
            </Link>
            <div className="room__lobby-players-info">
              <p className="room__lobby-host player-label">Host: </p>
              <p className="room__lobby-players player-label">Players: </p>
              {/*Add players later*/}
            </div>
          </div>
        </div>
        <MatchSettings />
      </div>
    </main>
  );
}
