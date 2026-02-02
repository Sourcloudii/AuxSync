import "./Header.css";
import { Link } from "react-router-dom";
import title from "../../images/title.svg";

export function Header() {
  return (
    <header className="header">
      <div className="header__content">
        <Link to="/">
          <img src={title} alt="AuxSync" className="header__title" />
        </Link>
      </div>
    </header>
  );
}
