import "./JoinModal.css";
import closeButton from "../../../images/close-btn.svg";
import { useState, useEffect, useRef } from "react";

export function JoinModal({
  preventDefault,
  closeModal,
  modalState,
  handleJoinRoom,
  handleUserChange,
  user,
  inviteCode,
}) {
  const [roomCode, setRoomCode] = useState(inviteCode);
  const [seededCode, setSeededCode] = useState(inviteCode);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const nicknameRef = useRef(null);

  if (inviteCode !== seededCode) {
    setSeededCode(inviteCode);
    setRoomCode(inviteCode);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (modalState && !dialog.open) {
      dialog.showModal();
      if (nicknameRef.current && !user.trim()) nicknameRef.current.focus();
      else inputRef.current?.focus();
    } else if (!modalState && dialog.open) {
      dialog.close();
    }
  }, [modalState, user]);

  const handleJoinSubmit = async e => {
    preventDefault(e);
    setError("");

    if (!user || !user.trim()) {
      setError("Enter a nickname first");
      return;
    }

    if (roomCode.length !== 4) {
      setError("Room code must be 4 characters");
      return;
    }

    const result = await handleJoinRoom(roomCode.toUpperCase());
    if (result?.error) {
      setError(result.error);
    } else {
      closeModal();
    }
  };

  const handleDialogClose = () => {
    setError("");
    setRoomCode("");
    closeModal();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onOutsideClick = e => {
      if (e.target === dialog) dialog.close();
    };

    dialog.addEventListener("click", onOutsideClick);
    return () => dialog.removeEventListener("click", onOutsideClick);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="join-modal"
      aria-labelledby="joinModalTitle"
      onClose={handleDialogClose}
    >
      <div className="join-modal__content">
        <button
          type="button"
          className="join-modal__close-btn"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close Join Modal"
        >
          <img src={closeButton} alt="Close Join Modal" />
        </button>
        <h2 id="joinModalTitle" className="join-modal__title text-shadow">
          Join a Room
        </h2>
        <form className="join-modal__form" onSubmit={handleJoinSubmit}>
          {inviteCode && (
            <>
              <label htmlFor="joinNickname" className="visually-hidden">
                Nickname
              </label>
              <input
                autoComplete="off"
                id="joinNickname"
                ref={nicknameRef}
                className="join-modal__input join-modal__input--nickname"
                type="text"
                placeholder="Nickname"
                maxLength={14}
                value={user}
                onChange={handleUserChange}
              />
            </>
          )}
          <label htmlFor="roomCode" className="visually-hidden">
            Room Code
          </label>
          <input
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            id="roomCode"
            ref={inputRef}
            className="join-modal__input"
            type="text"
            placeholder="A1B2"
            maxLength={4}
            minLength={4}
            value={roomCode}
            aria-describedby={error ? "joinModalError" : undefined}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
          />
          <button className="join-modal__btn" type="submit">
            Join
          </button>
        </form>
        {error && (
          <p
            id="joinModalError"
            className="join-modal__error text-shadow"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </dialog>
  );
}
