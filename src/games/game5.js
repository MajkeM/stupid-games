import React, { useState, useEffect, useRef, useCallback } from 'react';
import './game5.css';

// --- Game Settings ---
const CAR_WIDTH = 30;
const CAR_HEIGHT = 50;
const ACCELERATION = 0.1;
const MAX_SPEED = 3;
const TURN_SPEED = 2.5; // degrees
const FRICTION = 0.97; // 1 = no friction, 0 = instant stop

// --- Nové, výrazně těžší úrovně ---
const LEVELS = [
    // Úroveň 1: Jemný slalom pro zahřátí
    {
        spot: { x: 450, y: 50, width: 40, height: 60 },
        obstacles: [
            { x: 150, y: 350, width: 200, height: 20 },
            { x: 100, y: 200, width: 200, height: 20 }
        ]
    },
    // Úroveň 2: Ostrá zatáčka o 90 stupňů
    {
        spot: { x: 50, y: 100, width: 40, height: 60 },
        obstacles: [
            { x: 150, y: 0, width: 20, height: 400 },
            { x: 150, y: 400, width: 200, height: 20 }
        ]
    },
    // Úroveň 3: Těsná šikana (S-zatáčka)
    {
        spot: { x: 450, y: 50, width: 40, height: 60 },
        obstacles: [
            { x: 300, y: 400, width: 200, height: 20 },
            { x: 0, y: 250, width: 220, height: 20 }
        ]
    },
    // Úroveň 4: Ulička smrti (velmi úzký průjezd)
    {
        spot: { x: 230, y: 50, width: 40, height: 60 },
        obstacles: [
            { x: 160, y: 120, width: 20, height: 450 },
            { x: 250, y: 120, width: 20, height: 400 },
            { x: 250, y: 120, width: 200, height: 20 }
        ]
    },
    // Úroveň 5: Vynucené couvání do garáže
    {
        spot: { x: 10, y: 230, width: 40, height: 60 },
        obstacles: [
            { x: 100, y: 150, width: 20, height: 140 },
            { x: 10, y: 130, width: 400, height: 20 },
            { x: 200, y: 210, width: 20, height: 140 },
            { x: 300, y: 150, width: 20, height: 140 },
            { x: 0, y: 350, width: 400, height: 20 }
        ]
    },
    // Úroveň 6: Labyrint
    {
        spot: { x: 450, y: 10, width: 40, height: 60 },
        obstacles: [
            { x: 100, y: 80, width: 20, height: 200 },
            { x: 0, y: 350, width: 300, height: 20 },
            { x: 280, y: 280, width: 20, height: 200 },
            { x: 100, y: 180, width: 2000, height: 20 },
            { x: 180, y: 0, width: 20, height: 100 }
        ]
    },
    // Úroveň 7: Těsné paralelní parkování
    {
        spot: { x: 220, y: 250, width: 40, height: 65 }, // Horizontální místo
        obstacles: [
            { x: 100, y: 180, width: 300, height: 20 }, // Zeď nahoře
            { x: 100, y: 370, width: 300, height: 20 }, // Zeď dole
            { x: 150, y: 240, width: 50, height: 60 }, // "Auto" vlevo
            { x: 325, y: 240, width: 50, height: 60 }  // "Auto" vpravo
        ]
    },
    // Úroveň 8: Finální zkouška - vyžaduje vícefázové otočení
    {
        spot: { x: 230, y: 10, width: 40, height: 60 },
        
    },
];

export default function HardestParkingJob({addPoint}) {
    const [gameState, setGameState] = useState('start');
    const [level, setLevel] = useState(0);
    const [car, setCar] = useState({ x: 200, y: 500, speed: 0, angle: -90 });
    const [pointsAdded, setPointsAdded] = useState(false);
    const keysPressed = useRef({});
    const animationFrameId = useRef();

    // Sound Refs
    const engineSound = useRef(null);
    const crashSound = useRef(null);
    const successSound = useRef(null);

    const resetCar = () => {
        setCar({ x: 200, y: 500, speed: 0, angle: -90 });
    };
    
    const startGame = () => {
        setLevel(0);
        resetCar();
        setGameState('playing');
        if(engineSound.current) {
            engineSound.current.loop = true;
            engineSound.current.volume = 0.3;
            engineSound.current.play();
        }
    };
    
    const nextLevel = () => {
        const newLevel = level + 1;
        if(newLevel >= LEVELS.length) {
            setGameState('win');
        } else {
            setLevel(newLevel);
            resetCar();
        }
    };
    
    const gameLoop = useCallback(() => {
        setCar(prevCar => {
            let { x, y, speed, angle } = prevCar;

            // Handle controls
            if (keysPressed.current['ArrowUp']) speed = Math.min(MAX_SPEED, speed + ACCELERATION);
            if (keysPressed.current['ArrowDown']) speed = Math.max(-MAX_SPEED / 2, speed - ACCELERATION);
            if (Math.abs(speed) > 0.1) {
                if (keysPressed.current['ArrowLeft']) angle -= TURN_SPEED;
                if (keysPressed.current['ArrowRight']) angle += TURN_SPEED;
            }

            // Apply friction
            speed *= FRICTION;

            // Calculate new position based on angle and speed
            const radians = angle * (Math.PI / 180);
            x += Math.cos(radians) * speed;
            y += Math.sin(radians) * speed;
            
            // Wall collision
            if (x < 0 || x > 500 - CAR_WIDTH || y < 0 || y > 600 - CAR_HEIGHT) {
                if(crashSound.current) crashSound.current.play();
                resetCar();
                setLevel(0);
                return { ...prevCar, x: 200, y: 500, speed: 0, angle: -90 };
            }
            
            // Obstacle collision
            LEVELS[level].obstacles.forEach(obs => {
                if(x < obs.x + obs.width && x + CAR_WIDTH > obs.x && y < obs.y + obs.height && y + CAR_HEIGHT > obs.y) {
                    if(crashSound.current) crashSound.current.play();
                    resetCar();
                    setLevel(0);
                }
            });

            // Win condition
            const spot = LEVELS[level].spot;
            const isHorizontalSpot = spot.width > spot.height;
            const carAngle = (angle % 360 + 360) % 360; // Normalizovat úhel na 0-360
            let isStraightEnough;
            if (isHorizontalSpot) {
                const isFacingRight = carAngle < 10 || carAngle > 350; // Úhel kolem 0/360
                const isFacingLeft = carAngle > 170 && carAngle < 190; // Úhel kolem 180
                isStraightEnough = isFacingLeft || isFacingRight;
            } else {
                const isFacingUp = carAngle > 260 && carAngle < 280; // Úhel kolem 270 (-90)
                const isFacingDown = carAngle > 80 && carAngle < 100; // Úhel kolem 90
                isStraightEnough = isFacingUp || isFacingDown;
            }
            
            const isInSpot = x > spot.x && x + CAR_WIDTH < spot.x + spot.width && y > spot.y && y + CAR_HEIGHT < spot.y + spot.height;
            const isSlowEnough = Math.abs(speed) < 0.2;
            
            if (isInSpot && isSlowEnough && isStraightEnough) {
                if(successSound.current) successSound.current.play();
                nextLevel();
            }

            return { x, y, speed, angle };
        });

        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [level]);

    useEffect(() => {
        const handleKeyDown = (e) => { keysPressed.current[e.key] = true; };
        const handleKeyUp = (e) => { keysPressed.current[e.key] = false; };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        if (gameState === 'playing') {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        } else {
            cancelAnimationFrame(animationFrameId.current);
            if(engineSound.current) engineSound.current.pause();
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [gameState, gameLoop]);

    return (
        <div className="parking-game-container">
             {gameState === 'start' && (
                <div className="game-intro">
                    <h2>Hardest Parking Job in the Universe</h2>
                    <p className="rules">You've been chosen. Your mission: park this highly unstable hover-car. Use arrow keys. Warning: physics are merely a suggestion here. Do not crash.</p>
                    <button className="btn-start-parking" onClick={startGame}>Accept Mission</button>
                </div>
            )}
             {gameState === 'win' && (
                <div className="game-over-reaction">
                    <h3>MISSION... COMPLETE?</h3>
                    <p className="final-message">You did it. You parked the car. Your reward is this message. Now go away.</p>
                    {!pointsAdded && (
                        <>
                        <p style={{ color: "lightgreen", fontWeight: "bold" }}>You completed the main game! +1 point</p>
                        {setPointsAdded(true)}
                        {addPoint()}
                        </>
                    )}
                    <button className="btn-start-parking" onClick={startGame}>Do it all again</button>
                </div>
            )}
            
            <div className="parking-lot">
                <div className="car" style={{
                    left: `${car.x}px`,
                    top: `${car.y}px`,
                    transform: `rotate(${car.angle + 90}deg)` // +90 because default image is vertical
                }}></div>
                <div className="parking-spot" style={{
                    left: `${LEVELS[level].spot.x}px`,
                    top: `${LEVELS[level].spot.y}px`,
                    width: `${LEVELS[level].spot.width}px`,
                    height: `${LEVELS[level].spot.height}px`,
                }}></div>
                {LEVELS[level].obstacles.map((obs, i) => (
                    <div key={i} className="obstacle" style={{
                        left: `${obs.x}px`,
                        top: `${obs.y}px`,
                        width: `${obs.width}px`,
                        height: `${obs.height}px`,
                    }}></div>
                ))}
            </div>
             {/* Audio */}

        </div>
    );
}