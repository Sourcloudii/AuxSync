import "./Header.css";
import { Link } from "react-router-dom";
import title from "../../images/title.svg";

export function Header({ location }) {
  return location === "/" ? (
    <header className="header">
      <div className="header__content">
        <Link to="/" className="header__title-link">
          <img src={title} alt="AuxSync" className="header__title" />
        </Link>
      </div>
    </header>
  ) : location === "/room" || location === "/lobby" ? (
    <header className="header">
      <div className="header__content header__content_in-game">
        <Link to="/" className="header__title-link">
          <img src={title} alt="AuxSync" className="header__title" />
        </Link>
      </div>
    </header>
  ) : null;
}
