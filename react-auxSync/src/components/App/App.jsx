import "./App.css";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

//components
import { Header } from "../Header/Header";
import { Main } from "../Main/Main";

function App() {
  const [user, setUser] = useState(null);

  const handleUserChange = (e) => {
    e.preventDefault();
    setUser(e.target.value);
    console.log(user);
  };

  return (
    <div className="page">
      <div className="page__content">
        <div className="falling-gifs">
          <Header />
          <Routes>
            <Route path="/" element={<Main handleUserChange={handleUserChange} user={user} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
