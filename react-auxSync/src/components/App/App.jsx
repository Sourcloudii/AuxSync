import "./App.css";

//components
import { Header } from "../Header/Header";
import { Main } from "../Main/Main";

function App() {
  return (
    <div className="page">
      <div className="page__content">
        <div className="falling-gifs">
          <Header />
          <Main />
        </div>
      </div>
    </div>
  );
}

export default App;
