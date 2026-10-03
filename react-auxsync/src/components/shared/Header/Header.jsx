import "./Header.css";
import { Link } from "react-router-dom";
import title from "../../../images/title.svg";

export function Header({ location }) {
  const inRoom = location === "/room";
  const inLobby = location === "/lobby";
  if (location !== "/" && !inRoom && !inLobby) return null;

  return (
    <header
      className={`header ${inRoom ? " header_in-room" : ""} ${inLobby ? " header_in-lobby" : ""}`}
    >
      <Link to="/" className="header__title-link">
        <img src={title} alt="AuxSync" className="header__title" />
      </Link>
    </header>
  );
}
