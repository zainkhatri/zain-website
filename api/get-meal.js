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

    const { ingredients, fitnessGoals } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid ingredients format',
        received: ingredients 
      });
    }

    const fitnessInstructions = fitnessGoals && fitnessGoals.length > 0
      ? `Create a recipe that supports these fitness goals: ${fitnessGoals.join(', ')}. `
      : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: `You are a professional chef and nutritionist. Create recipes that are practical and easy to follow. Format your response in plain text exactly as shown below, with double newlines between sections and no additional formatting:

[Recipe Name]

Cooking Time
[Time in minutes]

Ingredients
[List each ingredient on a new line with amount]

Steps
[Number each step, one per line]

Nutrition Facts
[Calories, protein, carbs, and fats]

Health Benefits
[List 2-3 health benefits relevant to the fitness goals]

A good recipe response example:

High-Protein Chicken Stir-Fry

Cooking Time
25 minutes

Ingredients
1 lb chicken breast, diced
2 cups mixed vegetables
3 cloves garlic
2 tbsp soy sauce
1 tbsp olive oil
Salt and pepper to taste

Steps
1. Heat oil in a large pan over medium-high heat
2. Add diced chicken and cook until golden
3. Add vegetables and garlic
4. Stir in soy sauce and seasonings
5. Cook until vegetables are tender-crisp

Nutrition Facts
Calories: 350
Protein: 42g
Carbs: 15g
Fat: 12g

Health Benefits
- High in lean protein for muscle building
- Rich in vitamins and minerals for recovery
- Low in calories to support weight management`
        },
        {
          role: "user",
          content: `${fitnessInstructions}Create a recipe using these ingredients: ${ingredients.join(', ')}`
        }
      ],
      temperature: 0.7,
      max_tokens: 600,
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