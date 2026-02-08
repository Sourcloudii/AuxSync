import "./Main.css";
import { Options } from "../Options/Options.jsx";
import { Instructions } from "../Instructions/Instructions.jsx";

export function Main({ handleUserChange, user }) {
  return (
    <main className="main">
      <div className="main__content">
        <Options />
        <form className="nickname-form">
          <input
            className="nickname_input"
            placeholder="Nickname here"
            minLength="2"
            maxLength="20"
            onChange={handleUserChange}
            value={user}
          />
        </form>
        <Instructions />
      </div>
    </main>
  );
}
