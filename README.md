# Zain Khatri's Personal Website

Welcome to the repository for my personal website, [zainkhatri.com](http://zainkhatri.com). This site is a reflection of my journey and showcases my work in **Computer Science**, **Cognitive Science**, and **Machine Learning**. Here, you will find details about my projects, interests, and experience, all designed to provide a glimpse into my passion for technology and innovation.

## Features

- **Project Portfolio**: Highlights of my projects in fields like autonomous robotics, brainwave algorithms, and machine learning applications.
- **Interactive Demos**: Some of my work includes interactive components, such as simulations or visualizations, to make the experience more engaging.
- **Personal Insights**: Learn about my hobbies, interests, and what drives me in the world of technology.

## Getting Started

This website is built with React and was bootstrapped using [Create React App](https://github.com/facebook/create-react-app). Below are the available scripts to help you run and develop the site locally.

### Prerequisites

To get started, ensure you have the following tools installed:
- **[Node.js](https://nodejs.org/)**: The runtime environment for JavaScript.
- **Package Manager**: Either [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) is recommended to manage dependencies.

### Environment Setup

For the "Good Munch" section to work properly, you'll need to set up a Google Maps API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API** and **Places API**
4. Create credentials (API Key)
5. Create a `.env` file in the root directory with:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Custom Handwriting Font (Optional)

The ego mode currently uses the "Caveat" Google Font for a handwriting effect. To use your actual handwriting:

1. Create a custom font from your handwriting using [Calligraphr](https://www.calligraphr.com/)
2. Download the generated font file (`.ttf` or `.otf`)
3. Place it in the `public/` directory
4. Update the font imports in `src/app.css` to use your custom font instead of Caveat
5. Replace `'Caveat'` with your font name in the ego mode CSS rules

### Deployment

The website is currently hosted on [Vercel](https://vercel.com/). To deploy any changes, push to the main branch, and Vercel will automatically build and deploy the latest version.

## Technologies Used

- **React**: JavaScript library for building the user interface.
- **CSS**: Custom styles for creating a modern, clean look.
- **JavaScript**: Handles interactivity and dynamic elements.
- **Vercel**: Handles hosting and deployment, making the site fast and reliable.

## Contact

If you have questions or would like to connect, you can reach me via:
- **Email**: [hello@zainkhatri.com](mailto:hello@zainkhatri.com)
- **LinkedIn**: [linkedin.com/in/zainkhatri](https://linkedin.com/in/zainkhatri)

Thank you for visiting my personal website repository. I hope you find something here that inspires or helps you on your own journey.
# Force deployment
