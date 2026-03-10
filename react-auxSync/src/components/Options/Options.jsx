import "./Options.css";
import { Link } from "react-router-dom";
import auxCord from "../../images/aux-cord.svg";
import bluetooth from "../../images/bluetooth.svg";

function generateLobbyCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function Options({ openJoinModal, setLobbyCode, setHost }) {
  return (
    <div className="options">
      <div className="options__content">
        <nav className="options__nav">
          <div className="btn-wrapper">
            <img src={auxCord} alt="Aux Cord" className="aux-cord-img" />
            <button
              className="options_btn options-join__link"
              onClick={openJoinModal}
              aria-label="Open Join Modal"
              title="Join a Room"
            >
              Join
            </button>
          </div>
          <div className="btn-wrapper">
            <img src={bluetooth} alt="Bluetooth" className="bluetooth-img" />
            <Link to="/room" className="options__link">
              <button
                className="options_btn options-host__link"
                onClick={() => {
                  setLobbyCode(generateLobbyCode());
                  setHost(true);
                }}
                aria-label="Host a Room"
                title="Host a Room"
              >
                Host
              </button>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
