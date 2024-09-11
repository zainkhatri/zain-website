import React, { useState, useEffect } from 'react';
import './MLGame.css';

const MLGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [current, setCurrent] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(true);
  const [message, setMessage] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

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
      handleGameOver('Time is up! Game Over.');
    }

    return () => clearInterval(timer);
  }, [timerActive, timeLeft, isGameOver]);

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
  };

  const handleNumberClick = (number) => {
    if (isGameOver) return;

    if (number.value === current) {
      setNumbers((prevNumbers) =>
        prevNumbers.map((n) =>
          n.value === number.value ? { ...n, status: 'correct' } : n
        )
      );
      setCurrent(current + 1);

      if (current === 50) {
        handleGameOver('Congratulations! You won!');
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

  const handleGameOver = (message) => {
    setIsGameOver(true);
    setMessage(message);
    setTimerActive(false);
  };

  return (
    <div className={`ml-game ${!gameStarted ? 'pre-game' : ''}`}>
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
            Welcome to the "1-50 in 60" game, where speed and precision are key! Your goal is to find 
            and click all the numbers from 1 to 50 in ascending order within 60 seconds. This game tests 
            your quick-thinking abilities and sharp eyes. Pay attention, as each mistake will end the game. 
            Compete against yourself or challenge your friends to see who can achieve the highest score 
            in the shortest time. Click the "Start" button when you're ready to begin. Good luck!
          </p>
        </div>
      )}

      <div className={`ml-game-grid ${gameStarted ? 'visible' : 'hidden'}`}>
        {numbers.map((number) => (
          <button
            key={number.value}
            onClick={() => handleNumberClick(number)}
            className={`ml-game-number ${number.status}`}
            disabled={isGameOver}
          >
            {number.value}
          </button>
        ))}
      </div>
      
      {message && <div className="ml-game-message">{message}</div>}
    </div>
  );
};

export default MLGame;