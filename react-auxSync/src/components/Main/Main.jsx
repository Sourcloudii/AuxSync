import "./Main.css";
import { Options } from "../Options/Options.jsx";
import { Instructions } from "../Instructions/Instructions.jsx";

export function Main({
  handleUserChange,
  user,
  preventDefault,
  openJoinModal,
}) {
  return (
    <main className="main">
      <div className="main__content">
        <Options openJoinModal={openJoinModal} />
        <form className="nickname-form" onSubmit={preventDefault}>
          <input
            className="nickname_input"
            placeholder="Nickname here"
            minLength="2"
            maxLength="15"
            onChange={handleUserChange}
            value={user}
          />
        </form>
        <Instructions />
      </div>
    </main>
  );
}
