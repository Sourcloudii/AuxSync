import "./Instructions.css";
import { useState } from "react";
import { instructions } from "../../utils/constants";

export function Instructions() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="instructions">
      <div className="instructions__content">
        <ol className="instructions-list">
          {instructions.map((instruction, index) => (
            <li
              key={index}
              className={`instructions-list__item ${activeSlide === index ? "" : "instructions-list__item-hidden"}`}
            >
              {instruction}
            </li>
          ))}
        </ol>
        <div className="instructions-btn__wrapper">
          {[0, 1, 2, 3].map((slideIndex) => (
            <button
              key={slideIndex}
              className={`instructions-btn ${
                activeSlide === slideIndex ? "instructions-btn_active" : ""
              }`}
              onClick={() => setActiveSlide(slideIndex)}
              aria-label={`instruction slide ${slideIndex + 1}`}
            >
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
