import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './MLGame.css';

const MLGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [current, setCurrent] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(true);
  const [message, setMessage] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [nextNumber, setNextNumber] = useState(null);

  const handleGameOver = (endMessage) => {
    setIsGameOver(true);
    setMessage(endMessage);
    setTimerActive(false);

    if (current - 1 > highScore) {
      setHighScore(current - 1);
      setMessage(`${endMessage} New High Score: ${current - 1}`);
    } else {
      setMessage(`${endMessage} High Score: ${highScore}`);
    }

    setNextNumber(current);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && !isGameOver) {
      clearInterval(timer);
      handleGameOver(`Time is up! Game Over. You reached ${current - 1}.`);
    }

    return () => clearInterval(timer);
  }, [timerActive, timeLeft, isGameOver, current]);

  const initializeGame = () => {
    const shuffledNumbers = Array.from({ length: 50 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const initialNumbers = shuffledNumbers.map((value) => ({
      value,
      status: 'default',
    }));
    setNumbers(initialNumbers);
    setCurrent(1);
    setTimeLeft(60);
    setIsGameOver(true);
    setMessage('');
    setTimerActive(false);
    setGameStarted(false);
    setNextNumber(null);
  };

  const handleNumberClick = (number) => {
    if (isGameOver) return;

    if (number.status === 'correct') {
      handleGameOver(`You clicked the same number twice! Game Over. You reached ${current - 1}.`);
      return;
    }

    if (number.value === current) {
      setNumbers((prevNumbers) =>
        prevNumbers.map((n) =>
          n.value === number.value ? { ...n, status: 'correct' } : n
        )
      );
      setCurrent(current + 1);

      if (current === 50) {
        handleGameOver('Congratulations! You won!');
        setHighScore(50);
      }
    } else {
      setNumbers((prevNumbers) =>
        prevNumbers.map((n) =>
          n.value === number.value ? { ...n, status: 'incorrect' } : n
        )
      );
      handleGameOver(`Wrong number clicked! Game Over. You reached ${current - 1}.`);
    }
  };

  const handleStartOrRestart = () => {
    if (isGameOver && !gameStarted) {
      setIsGameOver(false);
      setTimerActive(true);
      setGameStarted(true);
    } else {
      initializeGame();
    }
  };

  return (
    <div className={`ml-game`}>
      <div className="ml-game-header">
        <div className={`ml-game-timer ${timeLeft <= 10 ? 'red-timer' : ''}`}>{timeLeft}s</div>
        <button className="ml-game-button" onClick={handleStartOrRestart}>
          {isGameOver && !gameStarted ? 'Start' : 'Restart'}
        </button>
      </div>
      
      {!gameStarted && (
        <div className="ml-game-description">
          <h2 className="ml-game-title">1-50 in 60: The Vision Challenge</h2>
          <p>
          Welcome to the "1-50 in 60" game, where we test your speed and precision. Your goal is to find 
            and click all the numbers from 1 to 50 in ascending order within 60 seconds.
            Compete against yourself to see who can achieve the highest score 
            in the shortest time. Click the "Start" button when you're ready to begin. Good luck!
          </p>
        </div>
      )}

      <div className={`ml-game-grid ${gameStarted ? 'visible' : 'hidden'}`}>
        {numbers.map((number) => (
          <motion.button
            key={number.value}
            onClick={() => handleNumberClick(number)}
            className={`ml-game-number ${number.status} ${nextNumber === number.value ? 'highlight-next' : ''}`}
            disabled={isGameOver}
          >
            {number.value}
          </motion.button>
        ))}
      </div>
      
      {message && <div className="ml-game-message">{message}</div>}
    </div>
  );
};

export default MLGame;
