import "./JoinModal.css";
import closeButton from "../../images/close-btn.svg";

export function JoinModal({ preventDefault, closeModal, modalState }) {
  const handleJoinSubmit = e => {
    preventDefault(e);
    // Logic to handle joining the room using the entered room code
  };

  return (
    <div className={`join-modal ${modalState ? "modal--active" : ""}`}>
      <div className="join-modal__content">
        <button className="join-modal__close-btn" onClick={closeModal}>
          <img src={closeButton} alt="Close" />
        </button>
        <h2 className="join-modal__title">Room Code:</h2>
        <form className="join-modal__form" onSubmit={handleJoinSubmit}>
          <input
            className="join-modal__input"
            type="text"
            placeholder="Enter Here"
            maxLength={4}
            minLength={4}
          />
          <button className="join-modal__btn" type="submit">
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
