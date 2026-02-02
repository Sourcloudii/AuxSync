import "./Options.css";
import { Link } from "react-router-dom";
import auxCord from "../../images/aux-cord.svg";
import bluetooth from "../../images/bluetooth.svg";

export function Options() {
  return (
    <div className="options">
      <div className="options__content">
        <nav className="options__nav">
          <div className="btn-wrapper">
            <img src={auxCord} alt="Aux Cord" className="aux-cord-img" />
            <Link to="#" className="options__link">
              <button className="options_btn options-join__link">Join</button>
            </Link>
          </div>
          <div className="btn-wrapper">
            <img src={bluetooth} alt="Bluetooth" className="bluetooth-img" />
            <Link to="#" className="options__link">
              <button className="options_btn options-host__link">Host</button>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
