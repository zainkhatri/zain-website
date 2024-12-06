import React, { useState } from 'react';
import './MunchMate.css';

const MunchMate = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        body: JSON.stringify({ ingredients: ingredientList })
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

  return (
    <div className="munchmate-container">
      <header className="munchmate-header">
        <h2 className="munchmate-title">MunchMate</h2>
        <p className="munchmate-tagline">Transform ingredients into healthy, delicious meals!</p>
      </header>

      <form onSubmit={handleSubmit} className="input-container">
        <div className="input-group">
          <label className="input-label" htmlFor="ingredients-input">
            What ingredients do you have?
          </label>
          <input
            id="ingredients-input"
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="input-field"
            placeholder="Enter ingredients (comma-separated)"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="generate-button"
        >
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Creating your recipe...</span>
            </div>
          ) : (
            'Create Magic Meal'
          )}
        </button>
      </form>

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
