import React, { useState, useEffect, useCallback, useRef } from "react";
import "./game1.css";

const goodEmojis = ["😀", "😎", "🥳", "🤩", "😍", "👑", "⚡"];
const badEmojis = ["💩", "☠️", "👻", "🤮", "😡", "🥶"];

export default function EmojiGame({ addPoint }) {
  const [isGameActive, setIsGameActive] = useState(false); // Začínáme jako neaktivní
  const [emojis, setEmojis] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [pointAdded, setPointAdded] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Zvuky zakomentujeme, dokud neopravíme hlavní logiku
  // const goodSound = useRef(null);
  // const badSound = useRef(null);

  // OPRAVA: Tato funkce pro spawnování je nyní zabalena v useCallback
  const spawnEmoji = useCallback(() => {
    const isGood = Math.random() > 0.3;
    const emoji = {
      id: Date.now() + Math.random(),
      symbol: isGood ? goodEmojis[Math.floor(Math.random() * goodEmojis.length)] : badEmojis[Math.floor(Math.random() * badEmojis.length)],
      good: isGood,
      x: Math.random() * 85 + 5,
      y: Math.random() * 80 + 10,
    };
    setEmojis((prev) => [...prev, emoji]);
    setTimeout(() => {
      setEmojis((prev) => prev.filter((e) => e.id !== emoji.id));
    }, 1200);
  }, []);

  // OPRAVA: Spawnování i časovač jsou nyní řízeny stavem isGameActive
  useEffect(() => {
    if (!isGameActive) {
      return; // Pokud hra neběží, nic nedělej
    }

    // Interval pro spawnování emoji
    const spawnInterval = setInterval(spawnEmoji, 800);
    
    // Časovač
    const timerTimeout = setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        setIsGameActive(false); // Hra končí
      }
    }, 1000);

    // Důležitá čistící funkce: zastaví intervaly, když hra skončí
    return () => {
      clearInterval(spawnInterval);
      clearTimeout(timerTimeout);
    };
  }, [isGameActive, timeLeft, spawnEmoji]);
  
  // OPRAVA: Logika pro přidání bodu po skončení hry - bezpečně v useEffect
  useEffect(() => {
    // Spustí se jen tehdy, když hra skončí (isGameActive je false) a čas je 0.
    if (!isGameActive && timeLeft <= 0 && score >= 500 && !pointAdded) {
        addPoint();
        setPointAdded(true); // Označíme, že bod byl přidán
    }
  }, [isGameActive, score, pointAdded, addPoint, timeLeft]);


  const handleClick = (emoji) => {
    if (!isGameActive) return;

    if (emoji.good) {
      // goodSound.current.play(); // Dočasně vypnuto
      const bonus = 10 + combo * 2;
      setScore((prev) => prev + bonus);
      setCombo((prev) => prev + 1);
      showMessage(["Great!", "Awesome!", "🔥 Combo!", "Perfect!"][Math.floor(Math.random() * 4)]);
    } else {
      // badSound.current.play(); // Dočasně vypnuto
      setScore((prev) => prev - 5);
      setCombo(0);
      showMessage("💩 Ouch!");
    }
    setEmojis((prev) => prev.filter((e) => e.id !== emoji.id));
  };
  
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 800);
  };
  
  // OPRAVA: Nová funkce pro restart a start hry
  const startGame = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setEmojis([]);
    setPointAdded(false);
    setShowStartScreen(false); // Skryjeme úvodní obrazovku
    setIsGameActive(true); // Spustíme hru
  };

  // Zobrazovací logika
  if (showStartScreen) {
    return (
      <div className="emoji-game-start-screen">
        <h1>Emoji Game</h1>
        <p>Click on the good emojis, avoid the bad ones!</p>
        <button className="play-again-btn" onClick={startGame}>Start Game</button>
      </div>
    );
  }

  return (
    <div className="emoji-game">
      <div className="hud">
        <span>⏱️ {timeLeft}s</span>
        <span>⭐ Score: {score}</span>
        <span>🔥 Combo: {combo}</span>
      </div>

      {timeLeft > 0 ? (
        <div className="emoji-game-area">
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
      ) : (
        <div className="game-over">
          <h3>Game Over 🎉</h3>
          <p>Your score: {score}</p>
          {score >= 500 && (
            <p style={{ color: "lightgreen", fontWeight: "bold" }}>You completed the main game! +1 point</p>
          )}
          <button className="play-again-btn" onClick={startGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}