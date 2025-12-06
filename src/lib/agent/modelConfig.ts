/**
 * Model Configuration - LLM setup and configuration
 * Single Responsibility: Configure and create LLM instances
 */

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export interface ModelConfig {
  model: string;
  maxOutputTokens: number;
  temperature: number;
  apiKey: string;
}

/**
 * Default configuration for the Gemini model
 */
export const DEFAULT_MODEL_CONFIG: Omit<ModelConfig, 'apiKey'> = {
  model: 'gemini-2.5-flash',
  maxOutputTokens: 2048,
  temperature: 0.7,
};

/**
 * Creates a configured Gemini model instance
 */
export function createGeminiModel(config?: Partial<ModelConfig>): ChatGoogleGenerativeAI {
  const apiKey = config?.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined');
  }

  return new ChatGoogleGenerativeAI({
    model: config?.model || DEFAULT_MODEL_CONFIG.model,
    maxOutputTokens: config?.maxOutputTokens || DEFAULT_MODEL_CONFIG.maxOutputTokens,
    temperature: config?.temperature || DEFAULT_MODEL_CONFIG.temperature,
    apiKey,
  });
}

/**
 * Available model presets
 */
export const MODEL_PRESETS = {
  default: DEFAULT_MODEL_CONFIG,
  creative: {
    ...DEFAULT_MODEL_CONFIG,
    temperature: 0.9,
  },
  precise: {
    ...DEFAULT_MODEL_CONFIG,
    temperature: 0.3,
  },
  extended: {
    ...DEFAULT_MODEL_CONFIG,
    maxOutputTokens: 4096,
  },
} as const;

export type ModelPreset = keyof typeof MODEL_PRESETS;
