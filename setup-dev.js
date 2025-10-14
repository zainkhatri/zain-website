const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up development environment for MunchMate...\n');

// Check if .env.local file exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# OpenAI API Key for MunchMate functionality
# Replace with your actual OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Unsplash API Key for restaurant gallery
# Replace with your Unsplash access key (safe to expose client-side)
REACT_APP_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# React App Environment Variables
REACT_APP_API_URL=http://localhost:3001
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created');
} else {
  console.log('✅ .env.local file already exists');
}

console.log('\n🔧 Development Setup Instructions:');
console.log('1. Get your OpenAI API key from: https://platform.openai.com/api-keys');
console.log('2. Replace "your_openai_api_key_here" in the .env.local file with your actual API key');
console.log('3. Grab an Unsplash access key from: https://unsplash.com/developers');
console.log('4. Replace "your_unsplash_access_key_here" in the .env.local file with your access key');
console.log('5. Run "npm run dev" to start the development server with API support');
console.log('6. The MunchMate and photo gallery features will work once the keys are configured\n');

console.log('💡 For production deployment on Vercel:');
console.log('   Add OPENAI_API_KEY and REACT_APP_UNSPLASH_ACCESS_KEY to your Vercel environment variables\n');

console.log('🎉 Setup complete! Don\'t forget to add your OpenAI and Unsplash keys to the .env.local file');
