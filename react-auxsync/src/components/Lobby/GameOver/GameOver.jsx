import "./GameOver.css";
import { useState } from "react";
import { getPfpForPlayer, quotes } from "../../../utils/constants";
import wreathGold from "../../../images/wreath-gold.svg";
import wreathSilver from "../../../images/wreath-silver.svg";
import wreathBronze from "../../../images/wreath-bronze.svg";

const WREATHS = { 1: wreathGold, 2: wreathSilver, 3: wreathBronze };

function Podium({ player, place }) {
  return (
    <li className={`podium__column podium__column--${place}`}>
      <div className="podium__wreath">
        <img className="podium__branch" src={WREATHS[place]} alt="" />
        <img
          className="podium__branch podium__branch--mirrored"
          src={WREATHS[place]}
          alt=""
        />
        <img
          className="podium__avatar"
          src={player.profile || getPfpForPlayer(player)}
          alt={`${player.name}'s profile`}
        />
      </div>
      <div className="podium__block">
        <div className="podium__identity">
          <p className="podium__name">{player.name}</p>
          <p className="podium__points">Points: {player.points}</p>
        </div>
        <span
          className={`podium__place podium__place--${place}`}
          aria-hidden="true"
        >
          {place}
        </span>
      </div>
    </li>
  );
}

export function GameOver({ gameState, players = [] }) {
  const [pick] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)],
  );

  const standings = gameState?.scoreboard?.length ? gameState.scoreboard : players;

  const ranked = standings
    .slice()
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);

  const [first, second, third] = ranked;
  const arranged = [
    { player: second, place: 2 },
    { player: first, place: 1 },
    { player: third, place: 3 },
  ].filter(entry => entry.player);

  return (
    <div className="lobby__game-over">
      <h2 className="visually-hidden">Game over</h2>

      <figure className="podium__quote">
        <blockquote className="podium__quote-text">“{pick.quote}”</blockquote>
        <figcaption className="podium__quote-author">
          - {pick.author}
        </figcaption>
      </figure>
      {gameState.tiebreakerWinner && (
        <p className="lobby__tiebreak-note">
          {gameState.tiebreakerWinner.playerName} won the rock-paper-scissors
          tiebreaker!
        </p>
      )}
      {arranged.length > 0 && (
        <ol className="podium">
          {arranged.map(({ player, place }) => (
            <Podium key={player.playerId} player={player} place={place} />
          ))}
        </ol>
      )}
    </div>
  );
}
