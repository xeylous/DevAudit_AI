const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function initGemini() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return model;
}

async function callGemini(prompt, retries = 1) {
  const m = initGemini();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await m.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
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
    } catch (error) {
      console.error(`Gemini API call failed (attempt ${attempt + 1}):`, error.message);
      if (attempt === retries) {
        throw new Error(`Gemini API failed after ${retries + 1} attempts: ${error.message}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

module.exports = { callGemini, initGemini };
