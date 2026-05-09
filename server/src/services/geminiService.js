const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

// Pool of free-tier models to fallback on if one hits a rate limit
const FREE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro-latest'
];

function initGenAI() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

function parseGeminiResponse(text) {
  // Try to parse as JSON
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                     text.match(/```\s*([\s\S]*?)\s*```/);
  
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // If JSON parse fails from code block, try the raw text
    }
  }
  
  // Try direct JSON parse
  try {
    return JSON.parse(text);
  } catch {
    // Return as plain text with a wrapper
    return { rawText: text };
  }
}

async function callGemini(prompt) {
  const ai = initGenAI();
  let lastError;

  for (const modelName of FREE_MODELS) {
    try {
      console.log(`[Gemini] Attempting review with model: ${modelName}`);
      const model = ai.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return parseGeminiResponse(text);
    } catch (error) {
      console.error(`[Gemini] Model ${modelName} failed:`, error.message);
      lastError = error;
      
      // If the error is a quota/rate limit error (like 429), we immediately
      // try the next model in the pool. We add a small 1-second delay 
      // just to be safe and avoid bombarding the API.
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }
  }

  // If we exit the loop, all models failed
  throw new Error(`All free models exhausted due to rate limits. Last error: ${lastError.message}`);
}

module.exports = { callGemini };
