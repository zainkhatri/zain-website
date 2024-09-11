import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './MLGame.css';
import { database, ref, set, push, onValue } from './firebase'; // Import Firebase utilities

const MLGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [current, setCurrent] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(true);
  const [message, setMessage] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [nextNumber, setNextNumber] = useState(null);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [playerInitials, setPlayerInitials] = useState('');
  const [showHighScores, setShowHighScores] = useState(false);

  useEffect(() => {
    initializeGame();
    fetchHighScores();
  }, []);

  const fetchHighScores = () => {
    const scoresRef = ref(database, 'scores/'); // Reference to 'scores' in Realtime Database
    onValue(scoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const scoresArray = Object.values(data);
        scoresArray.sort((a, b) => b.score - a.score || a.time - b.time);
        setHighScores(scoresArray.slice(0, 5));
      }
    });
  };

  const submitScore = (newScore) => {
    const scoresRef = ref(database, 'scores/');
    const newScoreRef = push(scoresRef); // Push a new score to the database
    set(newScoreRef, newScore)
      .then(() => {
        setMessage('Score submitted successfully!');
        fetchHighScores(); // Refresh high scores after submission
      })
      .catch((error) => {
        console.error('Failed to submit score:', error); // Log the error
        setMessage('Failed to submit score. Please try again.');
      });
  };

  const handleGameOver = useCallback((endMessage, finalScore, finalTime) => {
    setIsGameOver(true);
    setMessage(endMessage);
    setTimerActive(false);

    const newScore = { initials: playerInitials.toUpperCase(), score: finalScore, time: 60 - finalTime };
    const wouldMakeTopFive = highScores.length < 5 || newScore.score > highScores[highScores.length - 1].score ||
      (newScore.score === highScores[highScores.length - 1].score && newScore.time < highScores[highScores.length - 1].time);

    if (wouldMakeTopFive) {
      setShowScoreInput(true);
    } else {
      setMessage(`${endMessage} You didn't make the top 5. Try again!`);
    }

    setNextNumber(current);

    setNumbers((prevNumbers) =>
      prevNumbers.map((n) => {
        if (n.status === 'correct' || n.value === current || n.status === 'incorrect') {
          return n;
        }
        return { ...n, status: 'grayed-out' };
      })
    );
  }, [current, highScores, playerInitials]);

  const bannedWords = ["ASS", "SEX", "FAG", "CUM", "DIE", "JEW", "FUC", "GAY", "PUS", "TIT", "DIC", "COC"]; // Add more as needed

  const handleScoreSubmit = () => {
    if (playerInitials.length === 3) {
      const initials = playerInitials.toUpperCase();

      // Check for banned words, numbers, and special characters
      const isAlpha = /^[A-Z]+$/.test(initials);
      if (!isAlpha) {
        setMessage('Initials can only contain letters. Please try again.');
        return;
      }

      if (bannedWords.includes(initials)) {
        setMessage('The initials you have entered are not allowed. Please try again.');
        return;
      }

      const newScore = {
        initials: initials,
        score: current - 1,
        time: 60 - timeLeft
      };

      // Submit the new score to Firebase
      submitScore(newScore);
      setShowScoreInput(false);
    }
  };

  const handleDeleteScore = (initials) => {
    // Deleting scores might be handled differently if you want this feature
  };

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && !isGameOver) {
      clearInterval(timer);
      handleGameOver(`Time's up! Game Over.`, current - 1, 0);
    }

    return () => clearInterval(timer);
  }, [timerActive, timeLeft, isGameOver, current, handleGameOver]);

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
    setShowScoreInput(false);
    setPlayerInitials('');
  };

  const handleNumberClick = (number) => {
    if (isGameOver) return;

    if (number.status === 'correct') {
      handleGameOver(`You clicked the same number twice! Game Over.`, current - 1, timeLeft);
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
        handleGameOver('Congratulations! You won!', 50, timeLeft);
      }
    } else {
      setNumbers((prevNumbers) =>
        prevNumbers.map((n) =>
          n.value === number.value ? { ...n, status: 'incorrect' } : n
        )
      );
      handleGameOver(`Wrong number clicked! Game Over.`, current - 1, timeLeft);
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
  const toggleHighScores = () => {
    setShowHighScores(!showHighScores);
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
            Compete to make it to the top 5 scorers list! Click the "Start" button when you're ready to begin. Good luck!
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

      {showScoreInput && (
        <div className="ml-game-score-input">
          <input
            type="text"
            maxLength="3"
            value={playerInitials}
            onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
            placeholder="Enter 3 initials"
          />
          <button onClick={handleScoreSubmit} disabled={playerInitials.length !== 3}>
            Submit Score
          </button>
        </div>
      )}

      <div className="ml-game-score-management">
        <button onClick={toggleHighScores}>
          {showHighScores ? 'Hide High Scores' : 'Show High Scores'}
        </button>
      </div>

      {showHighScores && (
        <div className="ml-game-high-scores">
          <h3>Top 5 Scorers</h3>
          {highScores.length > 0 ? (
            <ol>
              {highScores.map((score, index) => (
                <li key={index}>
                  {score.initials} - Score: {score.score}, Time: {score.time}s
                  {score.initials === playerInitials.toUpperCase() && (
                    <button onClick={() => handleDeleteScore(score.initials)}>Delete</button>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p>No high scores yet. Be the first to set a record!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MLGame;
