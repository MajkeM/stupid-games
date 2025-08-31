import React, { useState, useEffect, useRef } from "react";
import "./game1.css";

const goodEmojis = ["😀", "😎", "🥳", "🤩", "😍", "👑", "⚡"];
const badEmojis = ["💩", "☠️", "👻", "🤮", "😡", "🥶"];

export default function EmojiGame({addPoint}) {
const [isGameActive, setIsGameActive] = useState(true);
  const [emojis, setEmojis] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [speed, setSpeed] = useState(800);
    const [pointAdded, setPointAdded] = useState(false);    

  const goodSound = useRef(null);
  const badSound = useRef(null);
  const song1 = useRef(null);

  // Spawn emojis
  useEffect(() => {

    if (timeLeft > 15){
        setSpeed(10500);
    }


    const interval = setInterval(() => {
      spawnEmoji();
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
    setIsGameActive(false);
    return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (isGameActive) {
      const song1 = new Audio("/sounds/song-game1.mp3");
      song1.loop = true;
      song1.volume = 0.2;
      song1.play();
      return () => {
        song1.pause();
        song1.currentTime = 0;
      };
    }
  }, [isGameActive]);



  const spawnEmoji = () => {
    const isGood = Math.random() > 0.3; // 70% šance na dobrý emoji
    const emoji = {
      id: Date.now(),
      symbol: isGood
        ? goodEmojis[Math.floor(Math.random() * goodEmojis.length)]
        : badEmojis[Math.floor(Math.random() * badEmojis.length)],
      good: isGood,
      x: Math.random() * 80 + 5,
      y: Math.random() * 70 + 10,
    };
    setEmojis((prev) => [...prev, emoji]);

    setTimeout(() => {
      setEmojis((prev) => prev.filter((e) => e.id !== emoji.id));
    }, 800);
  };

  const handleClick = (emoji) => {
    if (emoji.good) {
        
      goodSound.current.play();
      const bonus = 10 + combo * 2;
      setScore(score + bonus);
      setCombo(combo + 1);
      showMessage(["Great!", "Awesome!", "🔥 Combo!", "Perfect!"][Math.floor(Math.random() * 4)]);
    } else {
      badSound.current.play();
      setScore(score - 5);
      setCombo(0);
      showMessage("💩 Ouch!");
    }
    setEmojis((prev) => prev.filter((e) => e.id !== emoji.id));
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 800);
  };

  return (
    <div className="emoji-game">
      <div className="hud">
        <span>⏱️ {timeLeft}s</span>
        <span>⭐ Score: {score}</span>
        <span>🔥 Combo: {combo}</span>
      </div>
      {timeLeft > 0 ? (
        <div className="game-area">
          {emojis.map((emoji) => (
            <div
              key={emoji.id}
              className={`emoji ${emoji.good ? "good" : "bad"}`}
              style={{ top: `${emoji.y}%`, left: `${emoji.x}%` }}
              onClick={() => handleClick(emoji)}
            >
              {emoji.symbol}
            </div>
          ))}
          {message && <div className="popup">{message}</div>}
        </div>
      ) :
        
      (

        <div className="game-over">
          <h3>Game Over 🎉</h3>
          <p>Your score: {score}</p>
            {score >= 500 && !pointAdded && (
                <>
                <p style={{ color: "lightgreen", fontWeight: "bold" }}>You completed the main game! +1 point</p>
                {setPointAdded(true)}
                {addPoint()}
                </>
            )}
          <button className="play-again-btn" onClick={() => { setSpeed(800); setScore(0); setCombo(0); setTimeLeft(30); setIsGameActive(true); }}>Play Again</button>
        </div>
      )}

      {/* Zvuky */}
      <audio ref={goodSound} src="/sounds/pop.mp3" preload="auto"></audio>
      <audio ref={badSound} src="/sounds/error.mp3" preload="auto"></audio>
      <audio ref={song1} src="/sounds/song-game1.mp3" preload="auto"></audio>
    </div>
  );
}
