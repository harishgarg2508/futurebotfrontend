/**
 * Tool Schemas - Zod schemas for tool parameter validation
 * Single Responsibility: Define and validate tool input schemas
 */

import { z } from 'zod';

export const transitSchema = z.object({
  current_date: z.string().describe('Target date for prediction in YYYY-MM-DD format'),
  years: z.number().optional().describe('Duration in years, default 1.0'),
  include_moon: z.boolean().optional().describe('Include moon transits, default true'),
});

export const vargaSchema = z.object({
  varga_num: z.number().describe('Varga number: 9 for Marriage (Navamsa), 10 for Career (Dasamsa), 2 for Wealth (Hora), 7 for Children (Saptamsa), 12 for Parents (Dwadasamsa)'),
});

export const varshaphalaSchema = z.object({
  age: z.number().describe('Age for the solar return year (e.g., 24 for 25th year of life)'),
});

// Dasha and BirthChart don't need parameters - they use the user's birth data automatically
export const dashaSchema = z.object({}).describe('No parameters needed - uses user birth data automatically');

export const birthChartSchema = z.object({}).describe('No parameters needed - uses user birth data automatically');

// File Search schema - searches indexed astrology books
export const fileSearchSchema = z.object({
  query: z.string().describe('The search query to find relevant information from astrology books. Be specific and include astrological terms.'),
  topic: z.string().optional().describe('Optional topic focus: remedies, predictions, yogas, doshas, etc.'),
});

export type TransitInput = z.infer<typeof transitSchema>;
export type VargaInput = z.infer<typeof vargaSchema>;
export type VarshaphalaInput = z.infer<typeof varshaphalaSchema>;
export type DashaInput = z.infer<typeof dashaSchema>;
export type BirthChartInput = z.infer<typeof birthChartSchema>;
export type FileSearchInput = z.infer<typeof fileSearchSchema>;
