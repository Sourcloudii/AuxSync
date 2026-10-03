import "./Options.css";
import auxCord from "../../../images/aux-cord.svg";
import bluetooth from "../../../images/bluetooth.svg";

export function Options({ openJoinModal, handleHostRoom }) {
  return (
    <div className="options">
      <div className="options__content">
        <h2 className="visually-hidden">Start playing</h2>
        <nav className="options__nav" aria-label="Start playing">
          <div className="btn-wrapper">
            <img src={auxCord} alt="Aux Cord" className="btn-img aux-cord-img" />
            <button
              type="button"
              className="options_btn options-join__link"
              onClick={openJoinModal}
              aria-label="Open Join Modal"
              title="Join a Room"
            >
              Join
            </button>
          </div>
          <div className="btn-wrapper">
            <img src={bluetooth} alt="Bluetooth" className="btn-img bluetooth-img" />
            <button
              type="button"
              className="options_btn options-host__link"
              onClick={handleHostRoom}
              aria-label="Host a Room"
              title="Host a Room"
            >
              Host
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
