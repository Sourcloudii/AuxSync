import "./Main.css";
import { Options } from "../Options/Options.jsx";
import { Instructions } from "../Instructions/Instructions.jsx";
import { usePageSEO, PAGE_SEO } from "../../../hooks/usePageSEO";

export function Main({
  user,
  handleUserChange,
  preventDefault,
  openJoinModal,
  handleHostRoom,
  shake,
  hostError,
  rejoinInfo,
  handleRejoinRoom,
  dismissRejoin,
}) {
  usePageSEO(PAGE_SEO.home);

  return (
    <main className="main">
      <h1 className="visually-hidden">
        AuxSync - the multiplayer GIF and song party game
      </h1>
      {rejoinInfo && (
        <div className="main__rejoin-popup">
          <button
            type="button"
            className="main__rejoin-dismiss"
            onClick={dismissRejoin}
            aria-label="Dismiss rejoin prompt"
          >
            ×
          </button>
          <p className="main__rejoin-text">
            You left room <strong>{rejoinInfo.roomCode}</strong> as{" "}
            <strong>{rejoinInfo.nickname}</strong>.
          </p>
          <button
            type="button"
            className="main__rejoin-btn"
            onClick={handleRejoinRoom}
          >
            Rejoin Room
          </button>
        </div>
      )}
      <div className="main__content">
        <Options
          openJoinModal={openJoinModal}
          handleHostRoom={handleHostRoom}
        />
        <form className="nickname-form" onSubmit={preventDefault}>
          <label htmlFor="nickname" className="visually-hidden">
            Nickname
          </label>
          <input
            autoComplete="off"
            id="nickname"
            className={`nickname_input ${shake ? "nickname-input--shake" : ""}`}
            placeholder="Nickname"
            minLength="1"
            maxLength="14"
            onChange={handleUserChange}
            value={user}
          />
        </form>
        {hostError && (
          <p className="main__error text-shadow" role="alert">
            {hostError}
          </p>
        )}
        <Instructions />
      </div>
    </main>
  );
}
