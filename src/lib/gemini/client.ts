/**
 * Gemini AI Client
 * Single Responsibility: Initialize and export the Google GenAI client
 */

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI client with API key from environment
export const geminiAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

// Export for convenience
export default geminiAI;
