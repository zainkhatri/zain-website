import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MLGame.css';
import { database, ref, set, push, onValue } from './firebase';

const MLGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [current, setCurrent] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(true);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [nextNumber, setNextNumber] = useState(null);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [playerInitials, setPlayerInitials] = useState('');
  const [showHighScores, setShowHighScores] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    initializeGame();
    fetchHighScores();
  }, []);

  const handleGameOver = useCallback(
    (endMessage, finalScore, finalTime) => {
      setIsGameOver(true);
      setMessage(endMessage);
      clearInterval(timerRef.current);

      const newScore = {
        initials: playerInitials.toUpperCase(),
        score: finalScore,
        time: 60 - finalTime,
      };
      const wouldMakeTopTen =
        highScores.length < 10 ||
        newScore.score > highScores[highScores.length - 1].score ||
        (newScore.score === highScores[highScores.length - 1].score &&
          newScore.time < highScores[highScores.length - 1].time);

      if (wouldMakeTopTen) {
        setShowScoreInput(true);
      } else {
        setMessage(`${endMessage} You didn't make the top 6. Try again!`);
      }

      setNextNumber(current);

      setNumbers((prevNumbers) =>
        prevNumbers.map((n) => {
          if (
            n.status === 'correct' ||
            n.value === current ||
            n.status === 'incorrect'
          ) {
            return n;
          }
          return { ...n, status: 'grayed-out' };
        })
      );
    },
    [current, highScores, playerInitials]
  );

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleGameOver("Time's Up! Game Over.", current - 1, 0);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (isGameOver) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameStarted, timeLeft, isGameOver, current, handleGameOver]);

  const fetchHighScores = () => {
    const scoresRef = ref(database, 'scores/');
    onValue(scoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const scoresArray = Object.entries(data).map(([id, score]) => ({
          id,
          ...score,
        }));
        // Remove duplicates, keeping only the best score for each set of initials
        const uniqueScores = scoresArray.reduce((acc, current) => {
          const x = acc.find((item) => item.initials === current.initials);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc.map((item) =>
              item.initials === current.initials &&
              (current.score > item.score ||
                (current.score === item.score && current.time < item.time))
                ? current
                : item
            );
          }
        }, []);

        uniqueScores.sort((a, b) => b.score - a.score || a.time - b.time);
        setHighScores(uniqueScores.slice(0, 10)); // Store up to 10 scores
      }
    });
  };

  const submitScore = (newScore) => {
    const scoresRef = ref(database, 'scores/');

    onValue(
      scoresRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const scoresArray = Object.entries(data).map(([id, score]) => ({
            id,
            ...score,
          }));
          const existingScore = scoresArray.find(
            (score) => score.initials === newScore.initials
          );

          if (existingScore) {
            // Update existing score if the new one is better
            const [existingScoreId, existingScoreData] = existingScore;
            if (
              newScore.score > existingScoreData.score ||
              (newScore.score === existingScoreData.score &&
                newScore.time < existingScoreData.time)
            ) {
              set(ref(database, `scores/${existingScoreId}`), newScore)
                .then(() => {
                  setMessage(
                    'New high score! Your previous record has been updated.'
                  );
                  fetchHighScores();
                  cleanupScores(scoresArray, scoresRef); // Cleanup after updating
                })
                .catch((error) => {
                  console.error('Failed to update score:', error);
                  setMessage('Failed to update score. Please try again.');
                });
            } else {
              setMessage('Your current high score is better. Keep trying!');
            }
          } else {
            // Add new high score
            const newScoreRef = push(scoresRef);
            set(newScoreRef, newScore)
              .then(() => {
                setMessage('New high score submitted successfully!');
                fetchHighScores();
                cleanupScores(scoresArray, scoresRef); // Cleanup after adding new score
              })
              .catch((error) => {
                console.error('Failed to submit score:', error);
                setMessage('Failed to submit score. Please try again.');
              });
          }
        } else {
          // No scores exist, create the first score
          const newScoreRef = push(scoresRef);
          set(newScoreRef, newScore)
            .then(() => {
              setMessage('First high score submitted successfully!');
              fetchHighScores();
            })
            .catch((error) => {
              console.error('Failed to submit score:', error);
              setMessage('Failed to submit score. Please try again.');
            });
        }
      },
      {
        onlyOnce: true,
      }
    );
  };

  // Cleanup function to keep only the top 10 scores in Firebase
  const cleanupScores = (scoresArray, scoresRef) => {
    // Sort scores array to identify which ones need to be removed
    scoresArray.sort((a, b) => b.score - a.score || a.time - b.time);

    // If more than 10 scores, remove the excess ones
    if (scoresArray.length > 10) {
      const scoresToRemove = scoresArray.slice(10); // Get scores beyond the top 10
      scoresToRemove.forEach((score) => {
        const scoreRef = ref(database, `scores/${score.id}`);
        set(scoreRef, null)
          .then(() => console.log(`Removed score with ID: ${score.id}`))
          .catch((error) => console.error('Failed to remove score:', error));
      });
    }
  };

  const handleScoreSubmit = () => {
    if (playerInitials.length === 3) {
      const initials = playerInitials.toUpperCase();

      const isAlpha = /^[A-Z]+$/.test(initials);
      if (!isAlpha) {
        setMessage('Initials can only contain letters. Please try again.');
        return;
      }

      const bannedWords = [
        'ASS',
        'SEX',
        'FAG',
        'CUM',
        'DIE',
        'JEW',
        'FUC',
        'GAY',
        'PUS',
        'TIT',
        'DIC',
        'COC',
        'NIG',
        'COK',
        'DIK',
        'WTF',
        'FCK',
        'NGA',
        'NGR',
      ];
      if (bannedWords.includes(initials)) {
        setMessage(
          'The initials you have entered are not allowed. Please try again.'
        );
        return;
      }

      const newScore = {
        initials: initials,
        score: current - 1,
        time: 60 - timeLeft,
      };

      submitScore(newScore);
      setShowScoreInput(false);
    }
  };

  const toggleHighScores = () => {
    setShowHighScores(!showHighScores);
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
        handleGameOver('Congratulations! You won!', 50, timeLeft);
      }
    } else if (number.status === 'correct') {
      // Do nothing if the number is already correctly clicked
      return;
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
      setGameStarted(true);
      setTimeLeft(60);
    } else {
      initializeGame();
    }
  };

  const initializeGame = () => {
    const shuffledNumbers = Array.from({ length: 50 }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5
    );
    const initialNumbers = shuffledNumbers.map((value) => ({
      value,
      status: 'default',
    }));
    setNumbers(initialNumbers);
    setCurrent(1);
    setTimeLeft(60);
    setIsGameOver(true);
    setMessage('');
    setGameStarted(false);
    setNextNumber(null);
    setShowScoreInput(false);
    setPlayerInitials('');
    clearInterval(timerRef.current);
  };

  return (
    <motion.div layout className="ml-game">
      <div className="ml-game-header">
        <div
          className={`ml-game-timer ${timeLeft <= 10 ? 'red-timer' : ''}`}
        >
          {timeLeft}s
        </div>
        <button className="ml-game-button" onClick={handleStartOrRestart}>
          {isGameOver && !gameStarted ? 'Start' : 'Restart'}
        </button>
      </div>

      {!gameStarted && (
        <div className="ml-game-description">
          <h2 className="ml-game-title">Eagle Eye: 1-50 in 60</h2>
          <p>
            Welcome to the Eagle Eye, a game where I test your speed and
            precision. Your goal is to find and click all the numbers from 1 to
            50 in ascending order within 60 seconds. Compete to make it to the
            top 6 scorers list! Click the "Start" button when you're ready to
            begin. Good luck!
          </p>
        </div>
      )}

      <div className={`ml-game-grid ${gameStarted ? 'visible' : 'hidden'}`}>
        {numbers.map((number) => (
          <motion.button
            key={number.value}
            onPointerDown={() => handleNumberClick(number)} // Changed from onClick to onPointerDown
            className={`ml-game-number ${number.status} ${
              nextNumber === number.value ? 'highlight-next' : ''
            }`}
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
          <button
            onClick={handleScoreSubmit}
            disabled={playerInitials.length !== 3}
          >
            Submit Score
          </button>
        </div>
      )}

      <div className="ml-game-score-management">
        <button onClick={toggleHighScores}>
          {showHighScores ? 'Hide High Scores' : 'Show High Scores'}
        </button>
      </div>

      <AnimatePresence>
        {showHighScores && (
          <motion.div
            className="ml-game-high-scores arcade-style"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            layout
          >
            <h3>Leaderboard</h3>
            {highScores.length > 0 ? (
              <ol>
                {highScores.slice(0, 6).map((score, index) => (
                  // Display only the top 6 scores
                  <li key={index}>
                    {score.initials} - {score.score} in {score.time}s
                  </li>
                ))}
              </ol>
            ) : (
              <p>No high scores yet. Be the first to set a record!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MLGame;
