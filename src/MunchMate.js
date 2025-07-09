import React, { useState } from 'react';
import './MunchMate.css';

const MunchMate = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGoals, setSelectedGoals] = useState(new Set());

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ingredients.trim()) {
      setError('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');

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

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setRecipe(data.mealSuggestion);
    } catch (err) {
      setError(`Recipe generation failed: ${err.message}`);
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

  return (
    <div className="munchmate-container">
      <header className="munchmate-header">
        <h2 className="munchmate-title">MunchMate</h2>
        <p className="munchmate-tagline">Transform your ingredients into healthy, delicious meals!</p>
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
          disabled={loading}
          className="generate-button"
        >
          {loading ? 'Generating...' : 'Generate Recipe'}
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
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