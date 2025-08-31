import React, { useState, useEffect, useCallback, useRef } from 'react';
import './game2.css';

// --- GAME CONFIG ---
const GAME_DURATION = 60; // seconds
const COLORS = [
  { name: 'RED', value: '#ef4444' },
  { name: 'BLUE', value: '#3b82f6' },
  { name: 'GREEN', value: '#22c55e' },
  { name: 'YELLOW', value: '#eab308' },
  { name: 'PINK', value: '#ec4899' },
  { name: 'ORANGE', value: '#f97316' },
];



const POSITIVE_FEEDBACKS = ["Are you cheating?", "Okay, that was lucky.", "You're not as dumb as you look.", "My grandma is slower. And she's dust.", "Impressive... for a human."];
const NEGATIVE_FEEDBACKS = ["As expected.", "Was that... a thought?", "My disappointment is immeasurable.", "Even a potato could do better.", "ERROR 404: Brain Not Found."];
const GAME_MODES = ['CLASSIC', 'MATH', 'SIMON_SAYS', 'MEMORY', 'SCRAMBLED'];

export default function QuestionableSanityTest({addPoint}) {


 const musicRef = useRef(null);
  const correctSfxRef = useRef(null);
  const incorrectSfxRef = useRef(null);

    const playSfx = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };


  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentRound, setCurrentRound] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [pointsAdded, setPointsAdded] = useState(false);
  
  // Ref to hold timers to prevent state-related issues
  const roundTimer = useRef(null);

  const generateRound = useCallback(() => {
    clearTimeout(roundTimer.current); // Clear any pending timers from previous rounds
    const mode = GAME_MODES[Math.floor(Math.random() * GAME_MODES.length)];
    let roundData = { mode, buttons: [], instruction: '' };
    const shuffled = [...COLORS].sort(() => 0.5 - Math.random());
    const btns = shuffled.slice(0, 4);

    switch (mode) {
      case 'MATH':
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10);
        const correctAnswer = num1 + num2;
        roundData.instruction = `What is ${num1} + ${num2}? ...But click the WRONG answer.`;
        roundData.buttons = [correctAnswer, correctAnswer + 1, correctAnswer - 1, correctAnswer + 2]
          .sort(() => 0.5 - Math.random())
          .map(val => ({ text: val.toString(), isCorrect: val !== correctAnswer }));
        break;

      case 'SIMON_SAYS':
        const saysSimon = Math.random() > 0.4;
        const targetBtn = btns[0];
        if (saysSimon) {
          roundData.instruction = `Simon says click the ${targetBtn.name} button.`;
          roundData.buttons = btns.map(b => ({ ...b, isCorrect: b.name === targetBtn.name }));
        } else {
          roundData.instruction = `Click the ${targetBtn.name} button.`;
          roundData.buttons = btns.map(b => ({ ...b, isCorrect: false })); // All clicks are wrong
          // If you don't click, you win.
          roundTimer.current = setTimeout(() => handleCorrectInaction("You resisted! Good slave."), 2500);
        }
        break;
        
      case 'MEMORY':
        const sequence = [shuffled[0], shuffled[1], shuffled[2]];
        const targetIndex = Math.floor(Math.random() * 3);
        const position = ['first', 'second', 'third'][targetIndex];
        
        roundData.instruction = `Remember this sequence...`;
        roundData.buttons = sequence.map(s => ({...s, isPreview: true})); // Special state for preview
        
        roundTimer.current = setTimeout(() => {
            setCurrentRound(prev => ({
                ...prev,
                instruction: `Now, which color was ${position}?`,
                buttons: btns.map(b => ({...b, isCorrect: b.name === sequence[targetIndex].name }))
            }));
        }, 3000);
        break;
        
      case 'SCRAMBLED':
        const correctScrambled = btns[0];
        const scrambledName = correctScrambled.name.split('').sort(() => 0.5 - Math.random()).join('');
        roundData.instruction = `Find the color '${scrambledName}'`;
        roundData.buttons = btns.map(b => ({ ...b, isCorrect: b.name === correctScrambled.name }));
        break;
        
      default: // CLASSIC
        const askForColor = Math.random() > 0.5;
        const correctClassic = btns[0];
        if (askForColor) {
            roundData.instruction = `Click the ${correctClassic.name} button.`;
            roundData.buttons = btns.map(b => ({
                text: shuffled.find(c => c.name !== b.name).name, // Different text
                color: b.value,
                isCorrect: b.name === correctClassic.name
            }));
        } else {
            roundData.instruction = `Click the button with the text "${correctClassic.name}".`;
            roundData.buttons = btns.map(b => ({
                text: b.name,
                color: shuffled.find(c => c.value !== b.value).value, // Different color
                isCorrect: b.name === correctClassic.name
            }));
        }
        break;
    }
    setCurrentRound(roundData);
  }, []);
    useEffect(() => {
    if (gameState === 'playing') {
      musicRef.current.volume = 0.2; // Nízká hlasitost pro pozadí
      musicRef.current.play();
    } else {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, [gameState]);

  // Main game timer
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) {
      if(timeLeft <= 0) setGameState('gameOver');
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    generateRound();
  };
  
  const showFeedback = (text, type) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 800);
  };

  const handleCorrectInaction = (message) => {
      setScore(prev => prev + 150); // Inaction is harder, more points!
      showFeedback(message, 'correct');
       playSfx(correctSfxRef);
      generateRound();
  }

  const handleButtonClick = (button) => {
    if (button.isPreview) return; // Ignore clicks during memory preview
    
    // If you click during a "don't click" round
    if(currentRound.mode === 'SIMON_SAYS' && !currentRound.instruction.includes('Simon says')) {
        clearTimeout(roundTimer.current);
        setScore(prev => Math.max(0, prev - 75));
        showFeedback("Simon didn't say so!", 'incorrect');
           playSfx(incorrectSfxRef);
        generateRound();
        return;
    }

    if (button.isCorrect) {
      setScore(prev => prev + 100);
      playSfx(correctSfxRef);
      showFeedback(POSITIVE_FEEDBACKS[Math.floor(Math.random() * POSITIVE_FEEDBACKS.length)], 'correct');
    } else {
      setScore(prev => Math.max(0, prev - 50));
      playSfx(incorrectSfxRef);
      showFeedback(NEGATIVE_FEEDBACKS[Math.floor(Math.random() * NEGATIVE_FEEDBACKS.length)], 'incorrect');
    }
    generateRound();
  };

  const getGameOverMessage = () => {
    if (score > 2000) return "Okay, you're officially a robot. Welcome.";
    if (score > 1000) return "Your sanity is... surprisingly intact. I'm impressed.";
    if (score > 400) return "You passed. Barely. Don't frame this certificate.";
    return "Have you tried turning your brain off and on again?";
  }

  const renderButton = (btn, index) => {
      if (btn.isPreview) {
          return <div key={index} className="preview-box" style={{ background: btn.value, boxShadow: `0 0 20px ${btn.value}` }} />;
      }
      return (
          <button
              key={index}
              className="btn-reaction"
              style={{
                  backgroundColor: btn.color || btn.value,
                  boxShadow: `0 0 20px ${btn.color || btn.value}`
              }}
              onClick={() => handleButtonClick(btn)}
          >
              {btn.text || btn.name}
          </button>
      );
  }

  return (
    <div className="reaction-game-v2">
      {gameState === 'start' && (
        <div className="game-intro">
          <h2>The Questionable Sanity Test</h2>
          <p className="rules">The rules are simple: there are no rules. Just do what I say. Or don't. See if I care. Your pathetic score is your own problem.</p>
          <button className="btn-start" onClick={startGame}>Begin the descent into madness</button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="game-over-reaction">
          <h3>The test is complete.</h3>
          <p className="final-score">Final Score: {score}</p>
          <p className="final-message">My diagnosis: "{getGameOverMessage()}"</p>
            {!pointsAdded && score >= 4000 && (
                <>
                <p style={{ color: "lightgreen", fontWeight: "bold" }}>You completed the main game! +1 point</p>
                {setPointsAdded(true)}
                {addPoint()}
                </>
            )}
          <button className="btn-start" onClick={startGame}>Get hurt again</button>
        </div>
      )}

      {gameState === 'playing' && currentRound && (
        <>
          <div className="hud-reaction">
            <span>Score: {score}</span>
            <span>Time: {timeLeft}s</span>
          </div>
          <div className="game-area-reaction">
            {feedback.text && <div className={`feedback-popup ${feedback.type}`}>{feedback.text}</div>}
            
                <h3 className="instruction">{currentRound.instruction}</h3>
                <div className={`buttons-grid ${currentRound.buttons.some(b => b.isPreview) ? 'preview' : ''}`}>
                  {currentRound.buttons.map(renderButton)}
                </div>
          </div>
        </>
      )}

       <audio ref={musicRef} src="/sounds/elevator-music.mp3" loop />
      <audio ref={correctSfxRef} src="/sounds/pop.mp3" />
      <audio ref={incorrectSfxRef} src="/sounds/error.mp3" />
    </div>
  );
}