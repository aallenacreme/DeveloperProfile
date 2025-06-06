import React, { useState, useEffect, useRef } from 'react';
import Die from './Die';
import { nanoid } from 'nanoid';
import Confetti from 'react-confetti';
import './TenziesGame.css';

function TenziesGame() {
  const [dice, setDice] = useState(() => generateAllNewDice());
  const [mismatch, setMismatch] = useState(Array(10).fill(false));
  const [rollCount, setRollCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const buttonRef = useRef(null);

  const gameWon = dice.every(die => die.isHeld) && 
                  dice.every(die => die.value === dice[0].value);

  useEffect(() => {
    if (gameWon) {
      buttonRef.current.focus();
      setMismatch(Array(10).fill(false));
    }
  }, [gameWon]);

  useEffect(() => {
    if (rollCount >= 10 && !gameWon) {
      setGameOver(true);
    }
  }, [rollCount, gameWon]);

  useEffect(() => {
    const heldDice = dice.filter(die => die.isHeld);
    const hasMismatch = heldDice.length > 1 && 
                       !heldDice.every(die => die.value === heldDice[0].value);
    setMismatch(dice.map(die => die.isHeld && hasMismatch));
  }, [dice]);

  function generateAllNewDice() {
    return Array(10).fill().map(() => ({
      value: Math.floor(Math.random() * 6) + 1,
      isHeld: false,
      id: nanoid()
    }));
  }

  function rollDice() {
    if (gameWon || gameOver) {
      setDice(generateAllNewDice());
      setRollCount(0);
      setGameOver(false);
    } else {
      setDice(prevDice => prevDice.map(die => 
        die.isHeld ? die : { ...die, value: Math.floor(Math.random() * 6) + 1 }
      ));
      setRollCount(prevCount => prevCount + 1);
    }
  }

  function hold(id) {
    if (!gameWon && !gameOver) {
      setDice(prevDice => prevDice.map(die => 
        die.id === id ? { ...die, isHeld: !die.isHeld } : die
      ));
    }
  }

  const diceElements = dice.map((die, index) => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      isMismatched={mismatch[index]}
      hold={() => hold(die.id)}
    />
  ));

  return (
    <>
      <div className="tenzies-backdrop"></div>
      <div className={`tenzies-game-container ${gameWon ? 'won' : gameOver ? 'game-over' : ''}`}>
        <main className="tenzies-game-main">
          {gameWon && <Confetti />}
          <div aria-live="polite" className="sr-only">
            {gameWon && <p>Congratulations! You won! Press "Play Again" to start again.</p>}
            {gameOver && !gameWon && <p>Game Over! You ran out of rolls. Press "Play Again" to try again.</p>}
          </div>
          <h1 className="tenzies-game-title">Tenzies</h1>
          <p className="tenzies-game-instructions">
            {gameWon
              ? 'Congratulations! You won! Click below to play again.'
              : gameOver
              ? 'Game Over! You ran out of rolls. Click below to try again.'
              : `Roll until all dice are the same. Rolls remaining: ${10 - rollCount}`}
          </p>
          <div className="tenzies-dice-grid">
            {diceElements}
          </div>
          <button
            ref={buttonRef}
            className="tenzies-roll-button"
            onClick={rollDice}
          >
            {gameWon || gameOver ? 'Play Again' : 'Roll Dice'}
          </button>
        </main>
      </div>
    </>
  );
}

export default TenziesGame;