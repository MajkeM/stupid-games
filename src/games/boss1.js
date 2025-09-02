import React, { useState, useEffect, useRef, useCallback } from "react";
import "./boss1.css";

// --- Herní Nastavení ---
const PLAYER_WIDTH = 3; 
const PLAYER_HEIGHT = 5;
const GROUND_LEVEL =70; 
const GRAVITY = 0.17; 
const JUMP_FORCE = -2.0; 
const PLAYER_SPEED = 0.555;
const GAME_DURATION = 60;

const RAIN_SPAWN_CHANCE = 0.005;
const CAR_BASE_SPEED_MIN = 0.3;
const CAR_BASE_SPEED_MAX = 0.4;

const random = (min, max) => Math.random() * (max - min) + min;

const GameObject = React.memo(({ emoji, x, y, size, zIndex = 1, rotation = 0, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: `${x}vw`,
      top: `${y}vh`,
      fontSize: `${size}vh`,
      transform: `rotate(${rotation}deg)`,
      opacity: opacity,
      userSelect: "none",
      zIndex: zIndex,
      willChange: "transform, opacity",
    }}
  >
    {emoji}
  </div>
));

// --- Debug: Hitbox render ---


export default function Boss1({ emojis, moveEmojis, turnOnEndGame, turnWon }) {
  const [bossPhrase, setBossPhrase] = useState("I need to do this by myself...");
  const [showBoss, setShowBoss] = useState(false);


  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState("pending");

    turnOnEndGame();
    

  useEffect(() => {
    const center = { top: 49, left: 48 };
    let animationId;
    function animate() {
      moveEmojis((prev) => {
        const next = prev.map((e) => ({
          ...e,
          left:
            Math.abs(center.left - e.left) < 0.05
              ? center.left
              : e.left + (center.left - e.left) * 0.01,
          top:
            Math.abs(center.top - e.top) < 0.05
              ? center.top
              : e.top + (center.top - e.top) * 0.01,
        }));
        const allAtCenter = next.every(
          (e) =>
            Math.abs(e.left - center.left) < 0.05 &&
            Math.abs(e.top - center.top) < 0.05
        );
        if (allAtCenter) {
          setBossPhrase("");
          setShowBoss(true);
          setTimeout(() => {
            moveEmojis([]);
            setGameStarted(true);
            setGameState("playing");
          }, 500);
        } else {
          animationId = requestAnimationFrame(animate);
        }
        return next;
      });
    }
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [moveEmojis]);

  useEffect(() => {
    document.body.style.background = "black";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  
  return (
    <div>
      {!gameStarted ? (
        <div className="boss-intro-container">
          <h2 className="boss-phrase">{bossPhrase}</h2>
          {showBoss && <div className="boss">👹</div>}
        </div>
      ) : (
        <CupheadGame turnWon={turnWon}  gameState={gameState} setGameState={setGameState} />
      )}
    </div>
  );

}

function CupheadGame({ gameState, setGameState, turnWon}) {

  const [playerState, setPlayerState] = useState({
    x: 50,
    y: GROUND_LEVEL - PLAYER_HEIGHT,
    yVelocity: 0,
  });
  const [rainState, setRainState] = useState([]);
  const [carsState, setCarsState] = useState([]);
  const [bombsState, setBombsState] = useState([]);
  const [projectilesState, setProjectilesState] = useState([]);
  const [explosionsState, setExplosionsState] = useState([]);

  // --- PŘIDÁNO: Ref pro audio element ---
  const musicRef = useRef(null);

  const player = useRef(playerState);
  const rain = useRef([]);
  const cars = useRef([]);
  const bombs = useRef([]);
  const projectiles = useRef([]);
  const explosions = useRef([]);

  const [timer, setTimer] = useState(GAME_DURATION);
  const keysPressed = useRef({});
  const gameLoopRef = useRef();
  const gameTimeRef = useRef(0);



  const restartGame = () => {
    player.current = { x: 50, y: GROUND_LEVEL - PLAYER_HEIGHT, yVelocity: 0 };
    rain.current = [];
    cars.current = [];
    bombs.current = [];
    projectiles.current = [];
    explosions.current = [];

    setPlayerState(player.current);
    setRainState([]);
    setCarsState([]);
    setBombsState([]);
    setProjectilesState([]);
    setExplosionsState([]);

    setTimer(GAME_DURATION);
    gameTimeRef.current = 0;
    setGameState("playing");
  };

  const gameLoop = useCallback(() => {
    // ... tělo funkce gameLoop zůstává beze změny ...
    if (gameState !== "playing") return;
    gameTimeRef.current += 1 / 60;
    const elapsedTime = gameTimeRef.current;
    const difficulty = Math.min(1 + elapsedTime / 50, 4.5);

    // --- Pohyb hráče ---
    let { x, y, yVelocity } = player.current;
    if (keysPressed.current["a"]) x -= PLAYER_SPEED;
    if (keysPressed.current["d"]) x += PLAYER_SPEED;
    y += yVelocity;
    yVelocity += GRAVITY;
    if (y >= GROUND_LEVEL - PLAYER_HEIGHT) {
      y = GROUND_LEVEL - PLAYER_HEIGHT;
      yVelocity = 0;
      if (keysPressed.current[" "]) yVelocity = JUMP_FORCE;
    }
    if (x < 0) x = 0;
    if (x > 100 - PLAYER_WIDTH) x = 100 - PLAYER_WIDTH;
    player.current = { x, y, yVelocity };

    // --- Spawn objektů ---
    if (elapsedTime > 0.5) {
      if (Math.random() < RAIN_SPAWN_CHANCE * difficulty)
        rain.current.push({
          id: Date.now(),
          x: random(0, 98),
          y: -10,
          speed: random(0.3, 0.5) * difficulty,
        });

      if (Math.random() < 0.0005 * difficulty) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const carSize = 16;
        cars.current.push({
          id: Date.now(),
          x: direction > 0 ? -20 : 120,
          y: GROUND_LEVEL - carSize,
          speed:
            random(CAR_BASE_SPEED_MIN, CAR_BASE_SPEED_MAX) *
            difficulty *
            direction,
          emoji: direction > 0 ? "🏎️" : "🚓",
        });
      }

      if (Math.random() < 0.0008 * difficulty)
        bombs.current.push({
          id: Date.now(),
          x: random(5, 95),
          y: -10,
          speed: random(0.3, 0.4) * difficulty,
        });
    }

    // --- Pohyb objektů ---
    rain.current = rain.current
      .map((r) => ({ ...r, y: r.y + r.speed }))
      .filter((r) => r.y < 100);

    cars.current = cars.current
      .map((c) => ({ ...c, x: c.x + c.speed }))
      .filter((c) => c.x > -25 && c.x < 125);

    const newBombs = [];
    for (const bomb of bombs.current) {
      if (bomb.y >= GROUND_LEVEL - 5) {
        explosions.current.push({
          id: bomb.id,
          x: bomb.x,
          y: GROUND_LEVEL - 5,
          size: 10,
          opacity: 1,
        });
        const projSpeed = 0.5 * difficulty;
        projectiles.current.push(
          {
            id: bomb.id + 1,
            x: bomb.x,
            y: GROUND_LEVEL - 6,
            dir: 1,
            speed: projSpeed,
          },
          {
            id: bomb.id + 2,
            x: bomb.x,
            y: GROUND_LEVEL - 6,
            dir: -1,
            speed: projSpeed,
          }
        );
      } else {
        newBombs.push({ ...bomb, y: bomb.y + bomb.speed });
      }
    }
    bombs.current = newBombs;

    projectiles.current = projectiles.current
      .map((p) => ({ ...p, x: p.x + p.speed * p.dir }))
      .filter((p) => p.x > -5 && p.x < 105);

    explosions.current = explosions.current
      .map((e) => ({
        ...e,
        size: e.size + 0.5,
        opacity: e.opacity - 0.04,
      }))
      .filter((e) => e.opacity > 0);

    // --- Kolize ---
    const playerHitbox = {
      x: player.current.x,
      y: player.current.y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };

    const checkCollision = (obj, hitbox) => {
         const offsetX = hitbox.offsetX || 0;
          const offsetY = hitbox.offsetY || 0;
        return (
      playerHitbox.x < obj.x + hitbox.width &&
    playerHitbox.x + playerHitbox.width > obj.x + offsetX &&
    playerHitbox.y < obj.y + hitbox.height + offsetY &&
    playerHitbox.y + playerHitbox.height > obj.y + offsetY
        );
    };

    if (
      rain.current.some((r) => checkCollision(r, { width: 1.5, height: 3 })) || 
      cars.current.some((c) => checkCollision(c, { width: 5, height: 30, offsetY: 10 })) ||
      bombs.current.some((b) => checkCollision(b, { width: 4, height: 4 })) ||
      projectiles.current.some((p) => checkCollision(p, { width: 2, height: 2 }))
    ) {
      setGameState("lost");
      return;
    }

    // --- Sync se state ---
    setPlayerState(player.current);
    setRainState([...rain.current]);
    setCarsState([...cars.current]);
    setBombsState([...bombs.current]);
    setProjectilesState([...projectiles.current]);
    setExplosionsState([...explosions.current]);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, setGameState]);

  useEffect(() => {
    // ... timer useEffect ...
    if (gameState === "playing") {
      const i = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setGameState("won");
            clearInterval(i);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(i);
    }
  }, [gameState, setGameState]);

  useEffect(() => {
    // ... ovládání useEffect ...
    const kD = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const kU = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", kD);
    window.addEventListener("keyup", kU);
    return () => {
      window.removeEventListener("keydown", kD);
      window.removeEventListener("keyup", kU);
    };
  }, []);

  useEffect(() => {
    // ... gameLoop useEffect ...
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);

  // --- PŘIDÁNO: useEffect pro ovládání hudby ---
  useEffect(() => {
    const musicElement = musicRef.current;
    if (!musicElement) return;

    if (gameState === 'playing') {
        musicElement.volume = 0.2; // Nastav hlasitost
        musicElement.currentTime = 0; // Začni od začátku
        musicElement.play();
    } else {
        musicElement.pause(); // Zastav hudbu, když hra neběží
    }
  }, [gameState]); // Spustí se pokaždé, když se změní gameState

  const backgroundBrightness =
    gameState === "playing"
      ? 1 - (0.8 * (GAME_DURATION - timer)) / GAME_DURATION
      : 0.2;

    const getReward = () => {
        turnWon();
    }

  return (
    <div
      className="game-container"
      style={{ filter: `brightness(${backgroundBrightness})` }}
    >
      <div className="game-area">
        {/* Hráč, déšť, auta atd. */}
        <GameObject emoji="🤓" x={playerState.x} y={playerState.y} size={5} zIndex={50} />

        {rainState.map((r) => (
          <React.Fragment key={r.id}>
            <GameObject emoji="💧" x={r.x} y={r.y} size={3.5} />
          </React.Fragment>
        ))}

        {carsState.map((c) => (
          <React.Fragment key={c.id}>
            <GameObject emoji={c.emoji} x={c.x} y={c.y} size={16} zIndex={2} />
          </React.Fragment>
        ))}

        {bombsState.map((b) => (
          <React.Fragment key={b.id}>
            <GameObject emoji="💣" x={b.x} y={b.y} size={5} rotation={b.y * 5} />
          </React.Fragment>
        ))}

        {projectilesState.map((p) => (
          <React.Fragment key={p.id}>
            <GameObject emoji="⚡" x={p.x} y={p.y} size={5.5} zIndex={4} />
          </React.Fragment>
        ))}

        {explosionsState.map((e) => (
          <GameObject
            key={e.id}
            emoji="💥"
            x={e.x}
            y={e.y}
            size={e.size}
            opacity={e.opacity}
            zIndex={3}
          />
        ))}
      </div>
      <div className="hud">
        <span>TIME: {timer}</span>
      </div>
      {gameState !== "playing" && (
        <div className={(gameState === "lost" ? "lost" : "won")}>
          <h1>{gameState === "lost" ? "YOU..DIED..AGAIN" :  "YOU HAVE MUST BE THE STUPIDIEST PERSON"}</h1>
            (gameState === "lost" ? <p>Time left: {timer}</p>)
          <button onClick={(gameState === "won" ? getReward : restartGame)}>
            {(gameState === "lost" ? "Please suffer again (why?)" : "Claim your reward (dopamine hit)")}
          </button>
        </div>
      )}

      {/* --- PŘIDÁNO: Audio element pro hudbu --- */}
      {/* Nezapomeň změnit cestu k souboru, pokud je jiná! */}
      <audio ref={musicRef} src="/sounds/bossFightMusic.mp3" loop preload="auto" />
    </div>
  );
}
