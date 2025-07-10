import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import './MLGame.css';
import { database, ref, set, push, onValue, get } from './firebase';

const MLGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [current, setCurrent] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameOver, setIsGameOver] = useState(true);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [nextNumber, setNextNumber] = useState(null);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [playerInitials, setPlayerInitials] = useState('');
  const [showHighScores, setShowHighScores] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [localHighScores, setLocalHighScores] = useState([]);

  const timerRef = useRef(null);

  // Check Firebase connection and load local scores as fallback
  useEffect(() => {
    if (database) {
      setIsFirebaseConnected(true);
      console.log('Firebase connected successfully');
      // Clear any cached local storage data when Firebase is available
      localStorage.removeItem('eagleEyeHighScores');
      setLocalHighScores([]);
    } else {
      setIsFirebaseConnected(false);
      console.log('Firebase not connected, using local storage');
      // Load local high scores from localStorage
      const savedScores = localStorage.getItem('eagleEyeHighScores');
      if (savedScores) {
        try {
          const parsedScores = JSON.parse(savedScores);
          setLocalHighScores(parsedScores);
          setHighScores(parsedScores);
          console.log('Loaded local high scores:', parsedScores);
        } catch (error) {
          console.error('Error loading local high scores:', error);
          setLocalHighScores([]);
        }
      }
    }
  }, []);

  const initializeGame = useCallback(() => {
    const numbersArray = Array.from({ length: 50 }, (_, i) => i + 1);
    const shuffledNumbers = shuffle(numbersArray);
    const initialNumbers = shuffledNumbers.map((value) => ({
      value,
      status: 'default',
    }));
    setNumbers(initialNumbers);
    setCurrent(1);
    setTimeElapsed(0);
    setIsGameOver(true);
    setMessage('');
    setGameStarted(false);
    setNextNumber(null);
    setShowScoreInput(false);
    setPlayerInitials('');
    clearInterval(timerRef.current);
  }, []);

  const fetchHighScores = useCallback(() => {
    if (!isFirebaseConnected) {
      // Use local storage fallback
      const savedScores = localStorage.getItem('eagleEyeHighScores');
      if (savedScores) {
        try {
          const parsedScores = JSON.parse(savedScores);
          setHighScores(parsedScores);
          setLocalHighScores(parsedScores);
          console.log('Fetched local high scores:', parsedScores);
        } catch (error) {
          console.error('Error loading local high scores:', error);
        }
      }
      return () => {}; // Return empty unsubscribe function
    }

    console.log('Fetching high scores from Firebase...');
    const scoresRef = ref(database, 'scores/');
    const unsubscribe = onValue(scoresRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Raw Firebase data:', data);
      
      if (data) {
        const scoresArray = Object.entries(data).map(([id, scoreData]) => ({
          id,
          initials: scoreData.initials,
          score: scoreData.time || scoreData.score, // Use time field as score for display
          numbersCompleted: scoreData.score || 50, // Original score field contains numbers completed
          time: scoreData.time, // Keep original time field
        }));
        console.log('Parsed scores array:', scoresArray);

        const scoresByInitials = {};

        scoresArray.forEach((score) => {
          const existingScore = scoresByInitials[score.initials];
          if (!existingScore) {
            scoresByInitials[score.initials] = score;
          } else {
            // Lower time is better
            if (score.score < existingScore.score) {
              scoresByInitials[score.initials] = score;
            }
          }
        });

        const uniqueScores = Object.values(scoresByInitials);
        uniqueScores.sort((a, b) => a.score - b.score); // Sort by time ascending (lower is better)
        const topScores = uniqueScores.slice(0, 10);
        setHighScores(topScores); // Store up to 10 scores
        console.log('Final processed Firebase high scores:', topScores);
      } else {
        setHighScores([]);
        console.log('No Firebase scores found');
      }
    }, (error) => {
      console.error('Error fetching high scores:', error);
      setIsFirebaseConnected(false);
      // Fall back to local storage
      const savedScores = localStorage.getItem('eagleEyeHighScores');
      if (savedScores) {
        try {
          const parsedScores = JSON.parse(savedScores);
          setHighScores(parsedScores);
          setLocalHighScores(parsedScores);
          console.log('Fell back to local high scores:', parsedScores);
        } catch (error) {
          console.error('Error loading local high scores:', error);
        }
      }
    });

    return unsubscribe;
  }, [isFirebaseConnected]);

  useEffect(() => {
    initializeGame();
    const unsubscribe = fetchHighScores();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initializeGame, fetchHighScores]);

  const saveScoreLocally = (newScore) => {
    try {
      const currentScores = [...localHighScores];
      
      // Check if user already has a score
      const existingIndex = currentScores.findIndex(score => score.initials === newScore.initials);
      
      if (existingIndex !== -1) {
        // Update if new time is better (lower)
        if (newScore.score < currentScores[existingIndex].score) {
          currentScores[existingIndex] = newScore;
        }
      } else {
        // Add new score
        currentScores.push(newScore);
      }
      
      // Sort by time ascending (lower is better)
      currentScores.sort((a, b) => a.score - b.score);
      const topScores = currentScores.slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('eagleEyeHighScores', JSON.stringify(topScores));
      setLocalHighScores(topScores);
      setHighScores(topScores);
      console.log('Saved score locally:', newScore, 'Updated scores:', topScores);
      
      return true;
    } catch (error) {
      console.error('Error saving score locally:', error);
      return false;
    }
  };

  const handleGameOver = useCallback(
    (endMessage, finalScore) => {
      setIsGameOver(true);
      setMessage(endMessage);
      clearInterval(timerRef.current);

      // Only save score if they completed the game (reached 50)
      if (finalScore === 50) {
        const newScore = {
          initials: playerInitials.toUpperCase(),
          score: 50, // Number of numbers completed
          time: timeElapsed, // Completion time in seconds
          numbersCompleted: finalScore,
        };
        
        const wouldMakeTopTen =
          highScores.length < 10 ||
          timeElapsed < (highScores[highScores.length - 1].score || Infinity);

        if (wouldMakeTopTen) {
          setShowScoreInput(true);
        } else {
          setMessage(`${endMessage} You didn't make the top 10. Try again!`);
        }
      } else {
        setMessage(`${endMessage} Complete all 50 numbers to make the leaderboard!`);
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
    [current, highScores, playerInitials, timeElapsed]
  );

  useEffect(() => {
    if (gameStarted && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    } else if (isGameOver) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameStarted, isGameOver]);

  const submitScore = (newScore) => {
    if (!isFirebaseConnected) {
      // Use local storage fallback
      const success = saveScoreLocally(newScore);
      if (success) {
        setMessage('Score saved locally! (Online leaderboard unavailable)');
      } else {
        setMessage('Failed to save score. Please try again.');
      }
      return;
    }

    const scoresRef = ref(database, 'scores/');

    get(scoresRef)
      .then((snapshot) => {
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
            // Update existing score if the new time is better (lower)
            const existingScoreId = existingScore.id;
            const existingTime = existingScore.time || existingScore.score;
            const newTime = newScore.time;
            
            if (newTime < existingTime) {
              set(ref(database, `scores/${existingScoreId}`), newScore)
                .then(() => {
                  setMessage(
                    'New high score! Your previous record has been updated.'
                  );
                  fetchHighScores(); // Refresh leaderboard
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
                fetchHighScores(); // Refresh leaderboard
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
              fetchHighScores(); // Refresh leaderboard
            })
            .catch((error) => {
              console.error('Failed to submit score:', error);
              setMessage('Failed to submit score. Please try again.');
            });
        }
      })
      .catch((error) => {
        console.error('Failed to read scores:', error);
        setMessage('Failed to submit score. Please try again.');
      });
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
        score: 50, // Number of numbers completed
        time: timeElapsed, // Completion time in seconds
        numbersCompleted: 50, // They completed all numbers to get here
      };

      submitScore(newScore);
      setShowScoreInput(false);
    }
  };

  const toggleHighScores = () => {
    console.log('Toggling high scores. Current state:', showHighScores);
    console.log('Current high scores:', highScores);
    setShowHighScores(!showHighScores);
  };

  const handleNumberClick = useCallback(
    (number) => {
      if (isGameOver) return;

      if (number.value === current) {
        setNumbers((prevNumbers) =>
          prevNumbers.map((n) =>
            n.value === number.value ? { ...n, status: 'correct' } : n
          )
        );
        setCurrent((prev) => prev + 1);

        if (current === 50) {
          handleGameOver('Congratulations! You won!', 50);
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
        handleGameOver(`Wrong number clicked! Game Over.`, current - 1);
      }
    },
    [current, isGameOver, handleGameOver]
  );

  const handleStartOrRestart = () => {
    if (isGameOver && !gameStarted) {
      setIsGameOver(false);
      setGameStarted(true);
      setTimeElapsed(0);
    } else {
      initializeGame();
    }
  };

  // Fisher-Yates shuffle algorithm
  const shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  };

  return (
    <div className="ml-game">
      <div className="ml-game-header">
        <div className="ml-game-timer">{timeElapsed}s</div>
        <button 
          className="ml-game-button" 
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleStartOrRestart();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleStartOrRestart();
          }}
        >
          {isGameOver && !gameStarted ? 'Start' : 'Restart'}
        </button>
      </div>

      {!gameStarted && (
        <div className="ml-game-description">
          <h2 className="ml-game-title">Eagle Eye: 1-50 Challenge</h2>
          <p>
            Welcome to Eagle Eye, a game where we test your speed and precision.
            Your goal is to find and click all the numbers from 1 to 50 in
            ascending order as fast as you can. Compete to make it to the top 10
            scorers list! Click the "Start" button when you're ready to begin.
            Good luck!
          </p>
        </div>
      )}

      <div className={`ml-game-grid ${gameStarted ? 'visible' : 'hidden'}`}>
        {numbers.map((number) => (
          <button
            key={number.value}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isGameOver) {
                handleNumberClick(number);
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isGameOver) {
                handleNumberClick(number);
              }
            }}
            className={`ml-game-number ${number.status} ${
              nextNumber === number.value ? 'highlight-next' : ''
            }`}
            disabled={isGameOver}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {number.value}
          </button>
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
            style={{
              fontSize: '16px',
              padding: '8px',
              border: '2px solid white',
              backgroundColor: '#3c3c3c',
              color: 'white',
              borderRadius: '5px',
              outline: 'none',
              touchAction: 'manipulation',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none'
            }}
          />
          <button
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (playerInitials.length === 3) handleScoreSubmit();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (playerInitials.length === 3) handleScoreSubmit();
            }}
            disabled={playerInitials.length !== 3}
          >
            Submit Score
          </button>
        </div>
      )}

      <div className="ml-game-score-management">
        <button 
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleHighScores();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleHighScores();
          }}
        >
          {showHighScores ? 'Hide High Scores' : 'Show High Scores'}
        </button>
        {!isFirebaseConnected && (
          <span className="offline-indicator"> (Offline Mode)</span>
        )}
      </div>

      {showHighScores && (
        <div className="ml-game-high-scores arcade-style">
          <h3>Leaderboard</h3>
          {highScores.length > 0 ? (
            <div className="leaderboard-list">
              {highScores.slice(0, 10).map((score, index) => (
                <div key={index} className="leaderboard-entry">
                  <span className="rank">#{index + 1}</span>
                  <span className="score">{score.score}s</span>
                  <span className="initials">{score.initials}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No high scores yet. Be the first to set a record!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(MLGame);
