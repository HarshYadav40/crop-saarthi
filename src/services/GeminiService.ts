
// Gemini API Service for farming information and advice

// Type definitions for the Gemini API request and response
interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
    role: string;
  }[];
  generationConfig: {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
  };
}

interface GeminiResponse {
  candidates?: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
  }[];
  promptFeedback?: any;
}

// Storage key for the Gemini API key
const GEMINI_API_KEY_STORAGE_KEY = 'geminiApiKey';
const DEFAULT_GEMINI_API_KEY = 'AIzaSyA7y_jsIXXCOpwXUs5lCF8GX86Q0cL8pxY';

/**
 * Ask a farming-related question to the Gemini API
 * @param question The user's question about farming, crops, etc.
 * @returns The AI-generated answer
 */
export const askFarmingQuestion = async (question: string): Promise<string> => {
  try {
    // Get the API key from localStorage or use default
    const apiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || DEFAULT_GEMINI_API_KEY;
    
    // Create the system prompt for farming advice
    const systemPrompt = 
      "You are a helpful farming assistant for an app called CropSaarthi. " +
      "Provide accurate, practical advice about farming, crop diseases, " +
      "organic treatments, weather-related farming tips, and sustainable " +
      "agricultural techniques. Keep answers clear, concise and focused on " +
      "helping farmers in India. Always prioritize organic and sustainable " +
      "solutions when possible.";
    
    // Prepare the request
    const request: GeminiRequest = {
      contents: [
        {
          parts: [{ text: systemPrompt }],
          role: "user"
        },
        {
          parts: [{ text: question }],
          role: "user"
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024
      }
    };
    
    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data: GeminiResponse = await response.json();
    
    // Extract the response text
    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      return text;
    } else {
      throw new Error("No response from Gemini API");
    }
  } catch (error) {
    console.error("Error asking farming question:", error);
    
    // Fallback responses based on keywords in the question
    const question_lower = question.toLowerCase();
    
    if (question_lower.includes("disease") || question_lower.includes("pest")) {
      return "I'm currently unable to analyze specific plant diseases. As a general approach, inspect your plants regularly for unusual spots, discoloration, or pest presence. Many plant diseases can be managed with neem oil sprays or organic fungicides. For accurate diagnosis, consider using the Crop Doctor feature or consult a local agricultural extension.";
    } else if (question_lower.includes("water") || question_lower.includes("irrigation")) {
      return "For optimal irrigation, water deeply but infrequently to encourage deep root growth. Most crops need about 1-1.5 inches of water per week, either from rainfall or irrigation. Early morning is the best time to water to minimize evaporation and fungal diseases. Consider drip irrigation to save water and target the root zone directly.";
    } else if (question_lower.includes("fertilizer") || question_lower.includes("nutrient")) {
      return "Organic fertilizers like compost, manure, and vermicompost are excellent for long-term soil health. For nitrogen, consider growing legumes as cover crops. Balanced NPK fertilizers (like 10-10-10) work well for many crops, but specific crops may need different ratios. Always conduct a soil test before applying fertilizers to avoid over-application.";
    } else {
      return "I'm currently unable to answer this question. Please try again later or check the other features in the CropSaarthi app for assistance with your farming needs.";
    }
  }
};

/**
 * Save the Gemini API key to localStorage
 * @param apiKey The API key to save
 */
export const saveGeminiApiKey = (apiKey: string): void => {
  localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey);
};

/**
 * Get the stored Gemini API key
 * @returns The stored API key or default key if not set
 */
export const getGeminiApiKey = (): string => {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || DEFAULT_GEMINI_API_KEY;
};

/**
 * Check if a Gemini API key is stored
 * @returns True if API key is stored or default key exists, false otherwise
 */
export const hasGeminiApiKey = (): boolean => {
  return true; // We always have at least the default key
};
