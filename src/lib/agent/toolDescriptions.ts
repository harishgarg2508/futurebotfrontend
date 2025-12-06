/**
 * Tool Descriptions - Human-readable descriptions for LLM tool selection
 * Single Responsibility: Provide clear descriptions to help LLM choose the right tool
 */

export const TOOL_DESCRIPTIONS = {
  getTransits: `Calculate planetary transits for future predictions, current planetary positions, and timing analysis.
Use this tool when the user asks about:
- Future predictions or forecasts
- Current planetary influences
- What's happening in their life now
- Upcoming events or changes
- "What does my future look like?"
- Transit effects on their birth chart`,

  getVargaChart: `Calculate divisional charts (Varga) for in-depth analysis of specific life areas.
Use this tool when the user asks about:
- Marriage, relationships, spouse (use varga_num: 9 - Navamsa)
- Career, profession, fame (use varga_num: 10 - Dasamsa)
- Wealth, financial matters (use varga_num: 2 - Hora)
- Children, creativity (use varga_num: 7 - Saptamsa)
- Parents, lineage (use varga_num: 12 - Dwadasamsa)
- Education, learning (use varga_num: 24 - Siddhamsa)
- Spirituality, dharma (use varga_num: 20 - Vimsamsa)`,

  getVarshaphala: `Calculate annual solar return chart (Varshaphala/Tajika) for yearly predictions.
Use this tool when the user asks about:
- This year's predictions
- Birthday to birthday forecast
- What will happen in my Nth year
- Annual horoscope
- Yearly predictions`,

  getDasha: `Calculate Vimshottari Dasha periods to understand current and upcoming planetary time periods. No parameters needed - automatically uses the user's birth data.
Use this tool when the user asks about:
- Current dasha/mahadasha/antardasha
- Planetary periods affecting them
- "Which planet is ruling my life now?"
- "What is my current dasha?"
- Timing of events
- When will something happen
- Life phases and transitions
Just call this tool directly without any parameters.`,

  getBirthChart: `Get the birth chart (Kundli/Rashi chart) with planetary positions and house placements. No parameters needed - automatically uses the user's birth data.
Use this tool when the user asks about:
- Their birth chart or kundli
- Planetary positions in their chart
- House placements
- Ascendant (Lagna)
- Basic chart interpretation
- "What does my chart say?"
Just call this tool directly without any parameters.`,
} as const;

export type ToolDescriptionKey = keyof typeof TOOL_DESCRIPTIONS;
