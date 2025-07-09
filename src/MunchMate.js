import React, { useState, useEffect } from 'react';
import './MunchMate.css';

const MunchMate = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGoals, setSelectedGoals] = useState(new Set());
  const [apiStatus, setApiStatus] = useState('checking');

  // Test API connectivity on component mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('/api/test');
        if (response.ok) {
          const data = await response.json();
          console.log('API test successful:', data);
          setApiStatus('connected');
        } else {
          console.error('API test failed:', response.status);
          setApiStatus('disconnected');
        }
      } catch (error) {
        console.error('API test error:', error);
        setApiStatus('disconnected');
      }
    };

    testAPI();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ingredients.trim()) {
      setError('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe(null);

    try {
      const ingredientList = ingredients
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const response = await fetch('/api/get-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ingredients: ingredientList,
          fitnessGoals: Array.from(selectedGoals)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      setRecipe(data.mealSuggestion);
    } catch (err) {
      console.error('Recipe generation error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Recipe generation failed. ';
      
      if (err.message.includes('Failed to fetch') || err.message.includes('network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (err.message.includes('Service temporarily unavailable')) {
        errorMessage += 'The recipe service is temporarily unavailable. Please try again later.';
      } else if (err.message.includes('Service configuration error')) {
        errorMessage += 'The recipe service is currently being configured. Please try again later.';
      } else if (err.message.includes('temporarily busy')) {
        errorMessage += 'The service is busy right now. Please wait a moment and try again.';
      } else if (err.message.includes('404')) {
        errorMessage += 'The recipe service is currently unavailable. Please try again later.';
      } else {
        errorMessage += 'Please try again with different ingredients or check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goal) => {
    const newSelectedGoals = new Set(selectedGoals);
    if (selectedGoals.has(goal)) {
      newSelectedGoals.delete(goal);
    } else {
      newSelectedGoals.add(goal);
    }
    setSelectedGoals(newSelectedGoals);
  };

  const handleTryAgain = () => {
    setError('');
    setRecipe(null);
  };

  return (
    <div className="munchmate-container">
      <header className="munchmate-header">
        <h2 className="munchmate-title">MunchMate</h2>
        <p className="munchmate-tagline">Transform your ingredients into healthy, delicious meals!</p>
        {apiStatus === 'checking' && (
          <p className="api-status checking">Checking API connection...</p>
        )}
        {apiStatus === 'disconnected' && (
          <p className="api-status disconnected">⚠️ Recipe service temporarily unavailable</p>
        )}
        {apiStatus === 'connected' && (
          <p className="api-status connected">✅ Recipe service online</p>
        )}
      </header>

      <div className="input-container">
        <div className="input-group">
          <label className="input-label">
            What ingredients do you have?
          </label>
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="input-field"
            placeholder="Enter ingredients (comma-separated)"
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Select your fitness goals:</label>
          <div className="fitness-goals-grid">
            {['Weight Loss', 'Muscle Gain', 'General Fitness'].map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`fitness-goal-button ${selectedGoals.has(goal) ? 'selected' : ''}`}
                disabled={loading}
              >
                <input
                  type="checkbox"
                  checked={selectedGoals.has(goal)}
                  onChange={() => toggleGoal(goal)}
                  className="fitness-checkbox"
                />
                <span>{goal}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !ingredients.trim() || apiStatus === 'disconnected'}
          className="generate-button"
        >
          {loading ? 'Generating Recipe...' : 'Generate Recipe'}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <div className="error-content">
            <p>{error}</p>
            <button 
              onClick={handleTryAgain}
              className="try-again-button"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {recipe && (
        <div className="recipe-result">
          <div className="recipe-container">
            {recipe.split('\n\n').map((section, index) => {
              const lines = section.split('\n');
              return (
                <div key={index} className="recipe-section">
                  <h3>{lines[0]}</h3>
                  <div className="section-content">
                    {lines.slice(1).map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MunchMate;