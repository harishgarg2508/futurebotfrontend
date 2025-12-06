/**
 * Query Optimizer
 * Single Responsibility: Build optimized queries for file search
 * 
 * This module takes:
 * - User's original query
 * - Tool returned data (astrological data)
 * And combines them into an optimized query for semantic search
 */

export interface QueryContext {
  userQuery: string;
  toolData?: Record<string, any>;
  toolName?: string;
  userContext?: {
    name?: string;
    topic?: string;
  };
}

/**
 * Build an optimized query for file search
 * Combines user query with tool data to create a comprehensive search query
 */
export function buildOptimizedQuery(context: QueryContext): string {
  console.log('\n[STEP 3 - QueryOptimizer] Building optimized query');
  console.log('[STEP 3 - QueryOptimizer] Original user query:', context.userQuery);
  console.log('[STEP 3 - QueryOptimizer] User context:', context.userContext?.name || 'none');
  console.log('[STEP 3 - QueryOptimizer] Tool name:', context.toolName || 'none');
  console.log('[STEP 3 - QueryOptimizer] Has tool data:', !!context.toolData);
  
  const { userQuery, toolData, toolName, userContext } = context;

  const parts: string[] = [];

  // Add user context if available
  if (userContext?.name) {
    parts.push(`User: ${userContext.name}`);
  }

  // Add the original user query
  parts.push(`Question: ${userQuery}`);

  // Add tool context if available
  if (toolData && toolName) {
    console.log('[STEP 3 - QueryOptimizer] Extracting relevant data from tool output...');
    const relevantData = extractRelevantData(toolName, toolData);
    if (relevantData) {
      console.log('[STEP 3 - QueryOptimizer] Extracted context:', relevantData.slice(0, 100) + '...');
      parts.push(`Astrological Context: ${relevantData}`);
    }
  }

  // Combine into optimized query
  const optimizedQuery = parts.join('\n\n');
  console.log('[STEP 3 - QueryOptimizer] ✓ Optimized query built');
  console.log('[STEP 3 - QueryOptimizer] Query length:', optimizedQuery.length);
  
  return optimizedQuery;
}

/**
 * Extract relevant data from tool output for query optimization
 */
function extractRelevantData(toolName: string, data: Record<string, any>): string | null {
  try {
    switch (toolName) {
      case 'getBirthChart':
        return extractBirthChartContext(data);
      case 'getDasha':
        return extractDashaContext(data);
      case 'getTransits':
        return extractTransitContext(data);
      case 'getVargaChart':
        return extractVargaContext(data);
      case 'getVarshaphala':
        return extractVarshaphalaContext(data);
      default:
        return JSON.stringify(data).slice(0, 500);
    }
  } catch (error) {
    console.error('[QueryOptimizer] Error extracting data:', error);
    return null;
  }
}

function extractBirthChartContext(data: any): string {
  const parts: string[] = [];
  
  if (data.ascendant) {
    parts.push(`Ascendant: ${data.ascendant.sign || ''}`);
  }
  
  if (data.planets) {
    const planetInfo = Object.entries(data.planets)
      .slice(0, 5) // Limit to key planets
      .map(([name, info]: [string, any]) => 
        `${name} in ${info.sign || ''} (House ${info.house || ''})`
      )
      .join(', ');
    parts.push(`Key Planets: ${planetInfo}`);
  }

  return parts.join('. ');
}

function extractDashaContext(data: any): string {
  const parts: string[] = [];
  
  if (data.current_mahadasha) {
    parts.push(`Current Mahadasha: ${data.current_mahadasha}`);
  }
  if (data.current_antardasha) {
    parts.push(`Current Antardasha: ${data.current_antardasha}`);
  }
  if (data.current_pratyantardasha) {
    parts.push(`Current Pratyantardasha: ${data.current_pratyantardasha}`);
  }

  return parts.join(', ');
}

function extractTransitContext(data: any): string {
  if (data.transiting_planets) {
    return Object.entries(data.transiting_planets)
      .slice(0, 5)
      .map(([name, info]: [string, any]) => 
        `${name} transiting ${info.sign || ''}`
      )
      .join(', ');
  }
  return '';
}

function extractVargaContext(data: any): string {
  const parts: string[] = [];
  
  if (data.varga_type) {
    parts.push(`Varga: ${data.varga_type}`);
  }
  if (data.ascendant) {
    parts.push(`Varga Ascendant: ${data.ascendant.sign || ''}`);
  }

  return parts.join('. ');
}

function extractVarshaphalaContext(data: any): string {
  const parts: string[] = [];
  
  if (data.muntha) {
    parts.push(`Muntha: ${data.muntha}`);
  }
  if (data.year_lord) {
    parts.push(`Year Lord: ${data.year_lord}`);
  }

  return parts.join('. ');
}

/**
 * Build system instruction for file search query
 */
export function buildFileSearchSystemPrompt(userContext?: { name?: string }): string {
  return `You are an expert Vedic Astrology assistant with deep knowledge from classical texts.

Your role is to:
1. Search the indexed astrology books for relevant information
2. Provide accurate, text-based answers grounded in the source material
3. Connect the theoretical knowledge with the user's specific astrological context

${userContext?.name ? `You are helping: ${userContext.name}` : ''}

CRITICAL INSTRUCTIONS:
- Base your answers ONLY on the content from the indexed books
- Quote relevant passages when possible
- If the books don't contain relevant information, say so clearly
- Connect classical knowledge with modern interpretations when appropriate

RESPONSE STRUCTURE:
1. **Key Insight** - Main answer from the texts
2. **Classical Reference** - Quote or reference from source
3. **Practical Application** - How this applies to the user's situation
`;
}
