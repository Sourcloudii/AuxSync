import "./Instructions.css";
import { useState } from "react";
import { instructions } from "../../../utils/constants";

export function Instructions() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="instructions" aria-labelledby="instructionsTitle">
      <h2 id="instructionsTitle" className="visually-hidden">
        How to play AuxSync
      </h2>
      <div className="instructions__content">
        <ol className="instructions-list">
          {instructions.map((instruction, index) => (
            <li
              key={instruction}
              className={`instructions-list__item ${activeSlide === index ? "" : "instructions-list__item-hidden"}`}
            >
              {instruction}
            </li>
          ))}
        </ol>
        <div className="instructions-btn__wrapper">
          {[0, 1, 2, 3].map(slideIndex => (
            <button
              key={slideIndex}
              type="button"
              className={`instructions-btn ${
                activeSlide === slideIndex ? "instructions-btn_active" : ""
              }`}
              onClick={() => setActiveSlide(slideIndex)}
              aria-label={`instruction slide ${slideIndex + 1}`}
              title={`Instruction ${slideIndex + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
