import logo from './logo.svg';
import './App.css';



import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Games from "./pages/Games";
import Contact from './pages/Contact';
import Game1 from "./games/game1";
import Game2 from "./games/game2";
import Game3 from "./games/game3";
import Game4 from "./games/game4";
import Game5 from "./games/game5";
import Boss1 from "./games/boss1";
import { Routes, Route,} from 'react-router-dom'; 
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const EMOJI_COUNT = 150;
const stupidEmojis = ["💩", "🦄", "🐸", "🍕", "🐒", "🧀", "👽", "🥒", "🦖", "🍔"];
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomEmojis() {
  return Array.from({ length: EMOJI_COUNT }).map(() => ({
    emoji: stupidEmojis[getRandomInt(0, stupidEmojis.length)],
    top: getRandomInt(0, 90),
    left: getRandomInt(0, 90),
    size: getRandomInt(32, 90),
    rotate: getRandomInt(-30, 30),
  }));
}

function App() {
  const [points, setPoints] = useState(0);
  const [emojis, setEmojis] = useState(getRandomEmojis());
  const [endGame, setEndGame] = useState(false);
  const [won, setWon] = useState(false);
  const location = useLocation();


  const turnWon = () => {
    setWon(true);
  }
  const addPoint = () => setPoints(prev => prev + 1);
  const turnOnEndGame = () => setEndGame(true); 

  // Funkce pro změnu pozic z jiné komponenty
  const moveEmojis = useCallback((newEmojis) => setEmojis(newEmojis), []);

  useEffect(() => {
    if (endGame) {
      document.body.style.background = "#2d0000"; // your desired color
      document.body.style.transition = "background 0.5s";
    } else {
      document.body.style.background = "";
      document.body.style.transition = "";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.background = "";
      document.body.style.transition = "";
    };
  }, [endGame]);


  useEffect(() => {
    if (won) {
      document.body.style.background = "gold";
    } else if (endGame) {
      document.body.style.background = "#2d0000";
    } else if (location.pathname.startsWith("/games")) {
      document.body.style.background = ""; // blue for games
    } else {
      document.body.style.background = "";
    }
    document.body.style.transition = "background 0.5s";
    return () => {
      document.body.style.background = "";
      document.body.style.transition = "";
    };
  }, [won, endGame, location.pathname]);

  return (
    <div>
         {/* Stupid floating emojis */}
      {emojis.map((e, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${e.top}vh`,
            left: `${e.left}vw`,
            fontSize: `${e.size}px`,
            opacity: 0.18,
            transform: `rotate(${e.rotate}deg)`,
            pointerEvents: "none",
            zIndex: -2,
          }}
        >
          {e.emoji}
        </div>
      ))}


<div className="nebula purple"></div>
<div className="nebula blue"></div>
      
      <Navbar won={won} endGame={endGame} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games/ehm" element={<Game4 addPoint={addPoint} />} />
        <Route path="/games/theGoose" element={<Game5 addPoint={addPoint} />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/games" element={<Games endGame={endGame} won={won} points={points} />} />
        <Route path="/games/emoji" element={<Game1 addPoint={addPoint} />} />
        <Route path="/about" element={<About addPoint={addPoint}/>} />
         <Route path="/games/reaction" element={<Game2 addPoint={addPoint} />} />
         <Route path="/games/space-goat" element={<Game3 addPoint={addPoint} />} />
         <Route path="/games/boss1" element={<Boss1 turnWon={turnWon} turnOnEndGame={turnOnEndGame} moveEmojis={moveEmojis} emojis={emojis} />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      
      <p style={{ position: "fixed", bottom: "1rem", right: "40%", fontSize: "1.5rem" }}>{points} main games "completed"</p>
    </div>
  );
}

export default App;
