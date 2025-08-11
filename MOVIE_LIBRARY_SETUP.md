# Movie Library Setup Guide

## Overview
I've created a movie library component that mirrors your music library but is designed for movie posters. The component includes:

- **Movies.js** - The main component with expandable movie grid
- **movies.css** - Styling optimized for movie posters (2:3 aspect ratio)
- **movieData.js** - Data file with movie information and links
- **Integration** - Added to your App.js navigation

## Features
- **Responsive Grid**: 5x4 layout on large screens, 4x5 on medium, 2x10 on mobile
- **Movie Posters**: Optimized for portrait movie poster aspect ratio (2:3)
- **Hover Effects**: Title overlay appears on hover (desktop) or always visible (mobile)
- **Links**: Each poster links to IMDB or streaming services
- **Smooth Animations**: Framer Motion animations matching your existing components

## Setup Steps

### 1. Add Movie Poster Images
Place your movie poster images in the `src/images/optimized/` folder. You can use:
- **WebP format** (recommended for performance)
- **JPEG/PNG** (will work but larger file sizes)

**Important**: The current code expects 20 images named `1.webp` through `20.webp`. You can either:
- Rename your images to match this pattern, or
- Update the import statements in `Movies.js` to match your actual filenames

### 2. Customize Movie Data
Edit `src/movieData.js` to include your actual favorite movies:

```javascript
export const movieData = [
  {
    title: "Your Favorite Movie",
    link: "https://www.imdb.com/title/tt[imdb-id]/",
    year: "2024",
    director: "Director Name"
  },
  // Add more movies...
];
```

### 3. Update Image Imports
In `src/Movies.js`, update the import statements to match your actual image files:

```javascript
// Replace these with your actual movie poster images
import img1 from './images/optimized/your-movie-1.webp';
import img2 from './images/optimized/your-movie-2.webp';
// ... etc
```

## Customization Options

### Change Grid Layout
Edit `movies.css` to modify the grid layout:
- **Large screens**: Change `grid-template-columns: repeat(5, 1fr)` to your preferred number
- **Medium screens**: Adjust the 4x5 layout
- **Small screens**: Modify the 2x10 mobile layout

### Modify Aspect Ratio
Change the movie poster aspect ratio in `movies.css`:
```css
.movies-item {
  aspect-ratio: 2 / 3; /* Change to 1 / 1 for square, 16 / 9 for landscape */
}
```

### Update Links
You can link to various services:
- **IMDB**: `https://www.imdb.com/title/tt[imdb-id]/`
- **Netflix**: `https://www.netflix.com/title/[movie-id]`
- **Amazon Prime**: `https://www.amazon.com/[movie-title]`
- **Hulu**: `https://www.hulu.com/movie/[movie-id]`
- **Disney+**: `https://www.disneyplus.com/movies/[movie-title]`

### Add More Movies
To add more than 20 movies:
1. Add new entries to `movieData.js`
2. Import additional images in `Movies.js`
3. Update the `movieImages` array
4. Adjust CSS grid layouts if needed

## Current Status
The component is ready to use but currently uses placeholder images. Once you add your movie posters and update the data, it will display your personal movie collection with the same smooth animations and responsive design as your music library.

## File Structure
```
src/
├── Movies.js          # Main component
├── movies.css         # Styling
├── movieData.js       # Movie information
└── images/
    └── optimized/     # Your movie poster images
```

## Testing
After setup, the movie library will appear below your music library in the navigation. Click the "movie library +" header to expand and see your movie collection!
