const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/env-config.js', (req, res) => {
  const unsplashKey =
    process.env.REACT_APP_UNSPLASH_ACCESS_KEY ||
    process.env.VITE_UNSPLASH_ACCESS_KEY ||
    process.env.UNSPLASH_ACCESS_KEY ||
    '';

  const script = `(function () {
  if (typeof window === 'undefined') {
    return;
  }
  var key = ${JSON.stringify(unsplashKey)};
  if (!key) {
    return;
  }
  window.REACT_APP_UNSPLASH_ACCESS_KEY = key;
  window.VITE_UNSPLASH_ACCESS_KEY = key;
  window.UNSPLASH_ACCESS_KEY = key;
})();`;

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(script);
});

app.use(express.static(path.join(__dirname, 'build')));

// Import and use the API route
const getMealHandler = require('./api/get-meal');
app.use('/api/get-meal', getMealHandler);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/get-meal`);
}); 
