import React, { useState, useEffect, useRef } from 'react';
import './game4.css';

const TOTAL_CLICKS = 1000;

const Insults = [
    "Seriously, stop.", "Don't you have hobbies?", "My grandma clicks faster.", "That was a misclick, right?",
    "You are a disappointment.", "Go touch some grass.", "This is not a good use of your time.", "Pathetic."
];

export default function PointlessButtonGame({addPoint}) {
    const [gameState, setGameState] = useState('start');
    const [clicksLeft, setClicksLeft] = useState(TOTAL_CLICKS);
    const [buttonStyle, setButtonStyle] = useState({});
    const [message, setMessage] = useState("It's just a button. Or is it?");
    const [decoys, setDecoys] = useState([]);
    const [pointsAdded, setPointsAdded] = useState(false);

    // Sound Refs
    const clickSfxRef = useRef(null);
    const decoySfxRef = useRef(null);
    const winSfxRef = useRef(null);
    
    const playSfx = (ref) => {
        if (ref.current) {
            ref.current.currentTime = 0;
            ref.current.play();
        }
    };

    const startGame = () => {
        setClicksLeft(TOTAL_CLICKS);
        setButtonStyle({ top: '45%', left: '40%' });
        setMessage("It begins.");
        setDecoys([]);
        setGameState('playing');
    };

    const handleCorrectClick = () => {
        const newClicks = clicksLeft - 1;
        setClicksLeft(newClicks);
        playSfx(clickSfxRef);

        // --- The Button's AI ---
        let newStyle = { ...buttonStyle };
        let newDecoys = [];
        
        // Phase 2: Anger (starts moving)
        if (newClicks < 900) {
            newStyle.top = `${Math.random() * 80 + 10}%`;
            newStyle.left = `${Math.random() * 80 + 10}%`;
            newStyle.transition = 'top 0.3s ease, left 0.3s ease';
        }
        
        // Phase 3: Bargaining (tricks)
        if (newClicks < 700 && newClicks > 400) {
            const trick = Math.random();
            if (trick < 0.3) { // Decoys
                setMessage("One of us tells the truth. The others lie.");
                newDecoys = [1, 2, 3].map(() => ({
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`
                }));
            } else if (trick < 0.5) { // Shrink
                 setMessage("Catch me if you can!");
                 newStyle.transform = 'scale(0.5)';
            } else {
                 newStyle.transform = 'scale(1)';
            }
        } else {
            setDecoys([]);
            newStyle.transform = 'scale(1)';
        }

        // Phase 4: Depression (psychological warfare)
        if (newClicks === 300) {
            setMessage("ERROR: Progress lost. Just kidding... or am I?");
            // Fake out a reset
            setClicksLeft(999);
            setTimeout(() => setClicksLeft(299), 1000);
        }

        // Phase 5: Acceptance (chaos)
        if (newClicks < 100 && newClicks > 0) {
             setMessage("FINAL STRETCH! I WILL NOT YIELD!");
             newStyle.transition = 'all 0.1s linear';
             newStyle.top = `${Math.random() * 80 + 10}%`;
             newStyle.left = `${Math.random() * 80 + 10}%`;
             newStyle.transform = `scale(${0.4 + Math.random() * 0.8})`;
             newStyle.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }

        if (newClicks <= 0) {
            setGameState('gameOver');
            playSfx(winSfxRef);
        }
        
        setButtonStyle(newStyle);
        setDecoys(newDecoys);
    };

    const handleDecoyClick = () => {
        setMessage(Insults[Math.floor(Math.random() * Insults.length)]);
        setClicksLeft(prev => prev + 10);
        playSfx(decoySfxRef);
    };

    return (
        <div className="pointless-container">
            {gameState === 'start' && (
                <div className="game-intro">
                    <h2>The Pointless Button</h2>
                    <p className="rules">Your goal is simple: click the button until its counter reaches zero. The button's goal is simpler: to make you quit. Do you have what it takes to achieve the truly meaningless?</p>
                    <button className="btn-start-pointless" onClick={startGame}>Start my pointless journey</button>
                </div>
            )}

            {gameState === 'gameOver' && (
                <div className="game-over-pointless">
                    {!pointsAdded && (addPoint(), setPointsAdded(true))}
                    
                    <h3>It is done.</h3>
                    <p className="final-message">You have clicked the button {TOTAL_CLICKS} times.</p>
                    <div className="certificate">
                        <h2>Certificate of Wasted Time</h2>
                        <p>This certifies that</p>
                        <p className="winner-name">[Your Name Here, probably]</p>
                        <p>has successfully wasted a measurable portion of their finite existence to conquer a pointless button.</p>
                        <p className="congrats">Congratulations?</p>
                    </div>
                    <button className="btn-start-pointless" onClick={startGame}>Do it all again (why?)</button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="game-area-pointless">
                    <div className="hud-pointless">
                        <span>Clicks Remaining: {clicksLeft}</span>
                    </div>
                    <div className="message-pointless">{message}</div>
                    
                    <button 
                        className="the-button"
                        style={buttonStyle}
                        onClick={handleCorrectClick}
                    >
                        Click Me!
                    </button>
                    
                    {decoys.map((decoy, i) => (
                        <button 
                            key={i} 
                            className="the-button decoy"
                            style={{ top: decoy.top, left: decoy.left }}
                            onClick={handleDecoyClick}
                        >
                           Click Me!
                        </button>
                    ))}
                </div>
            )}

            {/* Audio */}
        </div>
    );
}