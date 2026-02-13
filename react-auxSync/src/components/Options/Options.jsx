import "./Options.css";
import { Link } from "react-router-dom";
import auxCord from "../../images/aux-cord.svg";
import bluetooth from "../../images/bluetooth.svg";

export function Options({ openJoinModal }) {
  return (
    <div className="options">
      <div className="options__content">
        <nav className="options__nav">
          <div className="btn-wrapper">
            <img src={auxCord} alt="Aux Cord" className="aux-cord-img" />
            <button
              className="options_btn options-join__link"
              onClick={openJoinModal}
            >
              Join
            </button>
          </div>
          <div className="btn-wrapper">
            <img src={bluetooth} alt="Bluetooth" className="bluetooth-img" />
            <Link to="/host-page" className="options__link">
              <button className="options_btn options-host__link">Host</button>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
