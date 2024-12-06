const OpenAI = require('openai');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.OPENAI_API_KEY
    });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid ingredients format',
        received: ingredients 
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: `You are a professional chef. Create recipes that are practical and easy to follow. Format your response in plain text exactly as shown below, with double newlines between sections and no additional formatting:

[Recipe Name]

Cooking Time
[Time in minutes]

Ingredients
[List each ingredient on a new line with amount]

Steps
[Number each step, one per line]

A good recipe response example:

Garlic Shrimp Pasta

Cooking Time
20 minutes

Ingredients
8 oz pasta
1 lb shrimp
4 cloves garlic
2 tbsp olive oil
Salt and pepper to taste

Steps
1. Boil pasta according to package instructions
2. Heat olive oil in a large pan
3. Add minced garlic and cook until fragrant
4. Add shrimp and cook until pink
5. Combine with pasta and serve`
          },
        {
          role: "user",
          content: `Create a recipe using these ingredients: ${ingredients.join(', ')}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('OpenAI request successful');

    res.status(200).json({
      status: 'success',
      mealSuggestion: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      body: req.body
    });

    res.status(500).json({
      error: 'Failed to generate recipe',
      details: error.message
    });
  }
};