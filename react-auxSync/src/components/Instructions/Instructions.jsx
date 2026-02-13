import "./Instructions.css";
import { useState } from "react";
import { instructions } from "../../utils/constants";
import leftArrow from "../../images/leftArrow.svg";
import rightArrow from "../../images/rightArrow.svg";

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
          <button
            className="instructions-btn instructions-btn_left-arrow"
            onClick={() => {
              activeSlide === 0
                ? setActiveSlide(3)
                : setActiveSlide(activeSlide - 1);
            }}
          >
            <img
              src={leftArrow}
              alt="Left Arrow"
              className="instructions-btn_left-arrow_img"
            />
          </button>
          <button
            className="instructions-btn instructions-btn_right-arrow"
            onClick={() => {
              activeSlide === 3
                ? setActiveSlide(0)
                : setActiveSlide(activeSlide + 1);
            }}
          >
            <img
              src={rightArrow}
              alt="Right Arrow"
              className="instructions-btn_right-arrow_img"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
