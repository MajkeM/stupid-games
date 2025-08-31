import React from "react";
import { Link } from "react-router-dom";
import "./Games.css";

const games = [
  {
    name: "Stupidiest Emoji Game",
    path: "/games/emoji",
    desc: "Click on the emojis!",
    main: "main game: do 500 points to complete",
    requirements: 0,
    emoji: "😎",
  },
  {
    name: "Stupidiest Reaction Test",
    path: "/games/reaction",
    main: "main game: do 4000 points to complete",
    desc: "Are you quick enough?",
    requirements: 1,
    emoji: "⚡",
  },
  {
    name: "Stupidiest Goat Game You will ever play",
    path: "/games/space-goat",
    desc: "Drag and move to shoot the goat into space!",
    main: "main game: do 500m to complete",
    requirements: 2,
    emoji: "🐐",
  },
  {
    name: "Complete this for CERTIFICATE!",
    path: "/games/ehm",
    desc: "Just..play...or not...your choice.",
    main: "bonus game: no main game completion",
    requirements: 0,
    emoji: "🫠",
  },
  {
    name: "Stupid....Parking? Seriously?", 
    path: "/games/theGoose",
    main: "main game: complete all levels to complete",
    desc: "park in spot and get nothing!",
    requirements: 3,
    emoji: "🚘",
  },
  {
    name: "", 
    path: "/games/boss1",
    main: "",
    desc: "",
    requirements: 5,
    emoji: "👀",
  },
];

export default function Games({points, endGame, won}) {
  return (
    <div className="games-menu">
      <div className="games-grid">
        {games.map((game, i) => {
          const isSecret = game.emoji === "👀";
          const unlocked = points >= game.requirements;

          let displayName = game.name;
          if (isSecret && unlocked) {
            displayName = "I NEED TO TAKE YOUR TIME BY MYSELF. THESE STUPID GAMES ARE USELESS";
          }

          let action;
          if (unlocked && isSecret) {
            action = (
              <Link to={game.path} className="play-btn-boss">
                {(won ? "Play again (why?)":"Play (Why you just didnt loose up there? You make everything worse.😑)")}
              </Link>
            );
          } else if (unlocked) {
            action = (
              <Link to={game.path} className="play-btn">
                Play
              </Link>
            );
          } else if (!isSecret) {
            action = (
              <p>You need {game.requirements} points to play this game you fool!🥱 </p>
            );
          } else {
            action = null;
          }


          if (isSecret && points === 1) {
                displayName = "ah. Just luck.";
          }
          else if (isSecret && points === 2) {
                displayName = "You are persistent. I like that.";
          }
          else if (isSecret && points === 3) {
                displayName = "You really want to waste your time, huh?";
          }
          else if (isSecret && points === 4) {
                displayName = "Last chance. Turn back.";
          }
          else if (isSecret && points >= 5) {
                displayName = "I NEED TO TAKE YOUR TIME BY MYSELF. THESE STUPID GAMES ARE USELESS";
          }


          if (endGame && isSecret) {
            displayName = "YOU ARE A FOOL. YOU COULD HAVE JUST STOPPED. NOW YOU MUST SUFFER.";
          }

          if (won && isSecret) {
            displayName = "You think you have won? You have only begun the suffer.";

          }

          return (
            <div key={i} className={isSecret ? "secret" : (won ? "game-card-won" : (endGame ? "game-card-endgame" : "game-card"))}>
              <div className={isSecret ? "secret-emoji" : "emoji-icon"}>{game.emoji}</div>
              <h2 className={won ? "won-title" : ""} >{displayName}</h2>
              <p>{game.desc}</p>
              <p style={{ color: "yellow" }}>{game.main}</p>
              {action}
            </div>
          );
        })}
      </div>
    </div>
  );
}
