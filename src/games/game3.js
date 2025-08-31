import React, { useState, useEffect, useRef, useCallback } from 'react';
import './game3.css';

// --- Game Constants ---
const GOAT_SIZE = 40;
const GRAVITY = 0.4;
const JUMP_POWER_MULTIPLIER = 0.2;
const MAX_JUMP_POWER = 20;
const FRICTION = 0.98;
const BOUNCE_FACTOR = 0.4;
const LEVEL_WIDTH = 400;
const LEVEL_HEIGHT = 600;
const PLATFORM_HEIGHT = 20; // Define platform thickness as a constant

const Insults = [
    "Did you even try?", "A rock could do better.", "That was pathetic.",
    "You have dishonored the goat elders.", "Gravity seems to like you. A lot.",
    "My disappointment is now a tangible object."
];

const Platform = ({ platform }) => (
    <div className="platform" style={{ left: platform.x, top: platform.y, width: platform.width, height: PLATFORM_HEIGHT }}></div>
);

export default function ClumsyGoatGame({ addPoint }) {
    const [gameState, setGameState] = useState('start');
    const [platforms, setPlatforms] = useState([]);
    const [score, setScore] = useState(0);
    const [pointsAdded, setPointsAdded] = useState(false);

    const goatPos = useRef({ x: LEVEL_WIDTH / 2 - GOAT_SIZE / 2, y: LEVEL_HEIGHT - GOAT_SIZE - 20 });
    const goatVel = useRef({ x: 0, y: 0 });
    const totalAscent = useRef(0);

    const isDragging = useRef(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const gameAreaRef = useRef(null);
    const animationFrameId = useRef();

    // --- Sound Refs ---
    const musicRef = useRef(null);
    const jumpSfxRef = useRef(null);
    const fallSfxRef = useRef(null);
    const bounceSfxRef = useRef(null);

    const playSfx = (ref) => {
        if (ref.current) {
            ref.current.currentTime = 0;
            ref.current.volume = ref === bounceSfxRef ? 0.5 : 1.0;
            ref.current.play();
        }
    };

    const generatePlatforms = useCallback((count, startY) => {
        const newPlatforms = [];
        for (let i = 0; i < count; i++) {
            newPlatforms.push({
                x: Math.random() * (LEVEL_WIDTH - 80),
                y: startY - (i * (80 + Math.random() * 40)),
                width: 60 + Math.random() * 40,
            });
        }
        return newPlatforms;
    }, []);

    const startGame = () => {
        goatPos.current = { x: LEVEL_WIDTH / 2 - GOAT_SIZE / 2, y: LEVEL_HEIGHT - GOAT_SIZE - 20 };
        goatVel.current = { x: 0, y: 0 };
        totalAscent.current = 0;
        setScore(0);
        setPointsAdded(false);

        const initialPlatforms = [
            { x: LEVEL_WIDTH / 2 - 50, y: LEVEL_HEIGHT - 20, width: 100 },
            ...generatePlatforms(20, LEVEL_HEIGHT - 100)
        ];
        setPlatforms(initialPlatforms);

        setGameState('playing');
        if (musicRef.current) {
            musicRef.current.volume = 0.2;
            musicRef.current.currentTime = 0;
            musicRef.current.play();
        }
    };

    const gameLoop = useCallback(() => {
        // Apply physics
        goatVel.current.y += GRAVITY;
        goatVel.current.x *= FRICTION;
        goatPos.current.x += goatVel.current.x;
        goatPos.current.y += goatVel.current.y;

        // --- NEW: Full Collision Detection Logic ---
        platforms.forEach(p => {
            const goat = goatPos.current;
            const vel = goatVel.current;
            
            // Check for general collision (Axis-Aligned Bounding Box)
            if (goat.x + GOAT_SIZE > p.x && goat.x < p.x + p.width &&
                goat.y + GOAT_SIZE > p.y && goat.y < p.y + PLATFORM_HEIGHT) 
            {
                // 1. Collision with TOP of the platform (landing)
                // (Must be falling downwards, AND the goat's bottom edge must be within the platform's vertical bounds)
                if (vel.y > 0 && (goat.y + GOAT_SIZE - vel.y) <= p.y) {
                    goat.y = p.y - GOAT_SIZE; // Snap position to top of platform
                    vel.y *= -BOUNCE_FACTOR;   // Bounce
                    playSfx(bounceSfxRef);
                    return; // Prioritize landing, so exit check for this platform
                }

                // 2. Collision with BOTTOM of the platform (bonking head)
                // (Must be moving upwards, AND the goat's top edge was below the platform's bottom)
                if (vel.y < 0 && goat.y - vel.y >= p.y + PLATFORM_HEIGHT) {
                    goat.y = p.y + PLATFORM_HEIGHT; // Snap to bottom
                    vel.y = 0; // Stop upward movement
                    return;
                }

                // 3. Collision with SIDES of the platform
                // (Check this only if not a clear vertical collision)
                if (vel.x > 0 && (goat.x + GOAT_SIZE - vel.x) <= p.x) { // Hitting from the left
                    goat.x = p.x - GOAT_SIZE;
                    vel.x *= -BOUNCE_FACTOR;
                } else if (vel.x < 0 && (goat.x - vel.x) >= p.x + p.width) { // Hitting from the right
                    goat.x = p.x + p.width;
                    vel.x *= -BOUNCE_FACTOR;
                }
            }
        });

        // Wall collisions
        if (goatPos.current.x < 0) { goatPos.current.x = 0; goatVel.current.x *= -BOUNCE_FACTOR; }
        if (goatPos.current.x > LEVEL_WIDTH - GOAT_SIZE) { goatPos.current.x = LEVEL_WIDTH - GOAT_SIZE; goatVel.current.x *= -BOUNCE_FACTOR; }

        // "Camera" logic
        if (goatPos.current.y < LEVEL_HEIGHT / 2) {
            const diff = (LEVEL_HEIGHT / 2) - goatPos.current.y;
            goatPos.current.y += diff;
            totalAscent.current += diff;
            setPlatforms(prev => prev.map(p => ({ ...p, y: p.y + diff })));
        }

        // Calculate and update score
        const currentHeight = Math.max(0, Math.round(totalAscent.current / 10));
        if (currentHeight > score) {
            setScore(currentHeight);
        }

        // Platform generation/cleanup
        const highestPlatformY = platforms.reduce((minY, p) => Math.min(minY, p.y), LEVEL_HEIGHT);
        if (highestPlatformY > 0) {
            setPlatforms(prev => [...prev, ...generatePlatforms(10, highestPlatformY - 50)]);
        }
        setPlatforms(prev => prev.filter(p => p.y < LEVEL_HEIGHT + 100));

        // Game Over condition
        if (goatPos.current.y > LEVEL_HEIGHT) {
            setGameState('gameOver');
            playSfx(fallSfxRef);
            if(musicRef.current) musicRef.current.pause();
        }

        // Update visuals
        if (gameAreaRef.current) {
            const goatEl = gameAreaRef.current.querySelector('.goat');
            if (goatEl) {
                goatEl.style.transform = `translate(${goatPos.current.x}px, ${goatPos.current.y}px)`;
            }
        }
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [gameState, platforms, generatePlatforms, score]);

    useEffect(() => {
        if (gameState === 'playing') {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [gameState, gameLoop]);

    const handleMouseDown = (e) => {
        if (gameState !== 'playing') return;
        isDragging.current = true;
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = (e) => {
        if (gameState !== 'playing' || !isDragging.current) return;
        isDragging.current = false;
        
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        
        let powerX = -dx * JUMP_POWER_MULTIPLIER;
        let powerY = -dy * JUMP_POWER_MULTIPLIER;

        const magnitude = Math.sqrt(powerX * powerX + powerY * powerY);
        if (magnitude > MAX_JUMP_POWER) {
            powerX = (powerX / magnitude) * MAX_JUMP_POWER;
            powerY = (powerY / magnitude) * MAX_JUMP_POWER;
        }

        goatVel.current.x += powerX;
        goatVel.current.y += powerY;
        playSfx(jumpSfxRef);
    };

    return (
        <div className="goat-game-container">
            {gameState === 'start' && (
                <div className="game-intro">
                    <h2>Clumsy Goat Ascends</h2>
                    <p className="rules">You are a goat. Your bones are jelly. Fling yourself upwards to achieve the greatest height. Click and drag to jump. Good luck.</p>
                    <button className="btn-start" onClick={startGame}>Embrace the chaos</button>
                </div>
            )}

            {gameState === 'gameOver' && (
                <div className="game-over-reaction">
                    <h3>The Ascent is Over</h3>
                    <p className="final-message">"{Insults[Math.floor(Math.random() * Insults.length)]}"</p>
                    <p className="final-score">Max Height: {score}m</p>
                    {!pointsAdded && score >= 200 && (
                        <>
                            <p style={{ color: "lightgreen", fontWeight: "bold" }}>Amazing height! +1 point</p>
                            {(() => {
                                if (!pointsAdded) {
                                    addPoint();
                                    setPointsAdded(true);
                                }
                            })()}
                        </>
                    )}
                    <button className="btn-start" onClick={startGame}>Try to suck less</button>
                </div>
            )}

            <div 
                className="game-area-goat" 
                ref={gameAreaRef} 
                onMouseDown={handleMouseDown} 
                onMouseUp={handleMouseUp}
                onMouseMove={(e) => { if (isDragging.current) e.preventDefault(); }}
                style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
            >
                {gameState === 'playing' && (
                    <>
                        <div className="hud-goat">Max Height: {score}m</div>
                        <div className="goat" style={{ transform: `translate(${goatPos.current.x}px, ${goatPos.current.y}px)` }}>🐐</div>
                        {platforms.map((p, i) => <Platform key={i} platform={p} />)}
                    </>
                )}
            </div>


        </div>
    );
}