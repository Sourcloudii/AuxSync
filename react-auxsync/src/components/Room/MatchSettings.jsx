import { useEffect, useRef, useState } from "react";
import "./MatchSettings.css";

import { useMediaQuery } from "../../utils/useMediaQuery";
import { useSettingsSync } from "../../hooks/useSettingsSync";
import { SettingsPanel } from "./SettingsPanel";

const COMPACT_QUERY = "(max-width: 700px)";

export function MatchSettings({ startGame, players }) {
  const isCompact = useMediaQuery(COMPACT_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef(null);

  useSettingsSync();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (menuOpen && !dialog.open) dialog.showModal();
    else if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onOutsideClick = e => {
      if (e.target === dialog) dialog.close();
    };

    dialog.addEventListener("click", onOutsideClick);
    return () => dialog.removeEventListener("click", onOutsideClick);
  }, [isCompact]);

  if (!isCompact && menuOpen) setMenuOpen(false);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  const panel = (
    <SettingsPanel
      startGame={startGame}
      players={players}
      closeMenu={closeMenu}
    />
  );

  return (
    <>
      <button
        type="button"
        className="settings_menu-btn"
        onClick={openMenu}
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-label="Match Settings"
        title="Match Settings"
      >
        <span className="settings_menu-btn__bars" aria-hidden="true" />
      </button>
      {isCompact ? (
        <dialog
          ref={dialogRef}
          className="settings_dialog"
          aria-labelledby="matchSettingsTitle"
          onClose={closeMenu}
        >
          {panel}
        </dialog>
      ) : (
        panel
      )}
    </>
  );
}
