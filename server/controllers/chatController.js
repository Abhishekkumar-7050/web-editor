const { model } = require('../config/gemini');

const generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Enhance the prompt to get better structured responses
    const enhancedPrompt = `
Please provide a detailed response with the following structure:

1. Brief explanation of the solution
2. Code implementation with comments
3. Step-by-step explanation of how the code works
4. Example usage with different scenarios
5. Best practices and potential improvements

Original prompt: ${prompt}
    `.trim();

    const result = await model.generateContent(enhancedPrompt);
    const text = result.response.text();

    res.json({ 
      response: text,
      model: "gemini-1.5-pro"
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: "Error generating response",
      details: error.message,
      model: "gemini-1.5-pro"
    });
  }
};

module.exports = {
  generateResponse
}; 