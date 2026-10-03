import { useEffect, useRef, useState } from "react";
import arrow from "../../images/arrow.svg";
import { useHoverCapable } from "../../utils/useHoverCapable";

export function SettingsDropdown({ value, options, format, onSelect }) {
  const hoverCapable = useHoverCapable();
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  const rootRef = useRef(null);

  const toggleDropdown = event => {
    const dropdown = event.currentTarget.closest(".custom-dropdown");
    const hoverOpen = hoverCapable && !closed && !!dropdown?.matches(":hover");

    if (hoverOpen || open) {
      setOpen(false);
      setClosed(hoverOpen);
    } else {
      setOpen(true);
      setClosed(false);
    }
  };

  const collapseDropdown = () => {
    setClosed(true);
    setOpen(false);
    rootRef.current?.querySelector(".custom-dropdown__trigger")?.focus();
  };

  const resetDropdown = () => {
    setClosed(false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <section
      className={`custom-dropdown${closed ? " custom-dropdown--closed" : ""}${
        open ? " custom-dropdown--open" : ""
      }`}
      onMouseLeave={resetDropdown}
      ref={rootRef}
    >
      <button
        type="button"
        className="custom-dropdown__trigger"
        onClick={toggleDropdown}
        aria-expanded={open}
      >
        <span>{format(value)}</span>
        <img className="custom-dropdown__arrow" src={arrow} alt="" />
      </button>
      <div className="custom-dropdown__options">
        <ul className="custom-dropdown__list">
          {options.map(option => (
            <li key={option}>
              <button
                type="button"
                className={`custom-dropdown__option${value === option ? " selected" : ""}`}
                onClick={() => {
                  onSelect(option);
                  collapseDropdown();
                }}
              >
                {format(option)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
