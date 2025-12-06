/**
 * Tool Factory - Creates LangChain DynamicStructuredTool instances
 * Single Responsibility: Build tool instances with proper schemas and handlers
 * 
 * This module bridges the gap between:
 * - Tool schemas (validation)
 * - Tool descriptions (LLM guidance)
 * - Tool handlers (execution)
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { 
  transitSchema, 
  vargaSchema, 
  varshaphalaSchema, 
  dashaSchema,
  birthChartSchema,
  fileSearchSchema,
} from './schemas';
import { TOOL_DESCRIPTIONS } from './toolDescriptions';
import { 
  transitHandler, 
  vargaHandler, 
  varshaphalaHandler, 
  dashaHandler,
  birthChartHandler 
} from './handlers';
import { fileSearchHandler } from './fileSearchHandler';
import { UserData, ToolResult } from './types';

// [DEBUG] Trace Logger
const trace = (step: string, msg: string, data?: any) => {
  console.log(`\x1b[33m[TOOL_TRACE] ${step}: ${msg}\x1b[0m`, data || '');
};

/**
 * Creates all tools with the given user context
 * The tools are bound to the user's birth data for automatic context
 */
export function createTools(userData: UserData): DynamicStructuredTool[] {
  return [
    createTransitTool(userData),
    createVargaTool(userData),
    createVarshapalaTool(userData),
    createDashaTool(userData),
    createBirthChartTool(userData),
    createFileSearchTool(userData),
  ];
}

/**
 * Creates the Transit calculation tool
 */
function createTransitTool(userData: UserData): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'getTransits',
    description: TOOL_DESCRIPTIONS.getTransits,
    schema: transitSchema,
    func: async ({ current_date, years, include_moon }) => {
      const result: ToolResult = await transitHandler.execute(
        { current_date, years, include_moon },
        userData
      );
      
      if (result.success) {
        return JSON.stringify(result.data);
      }
      return `Error calculating transits: ${result.error}. Please try again or ask about a different topic.`;
    },
  });
}

/**
 * Creates the Varga (Divisional Chart) tool
 */
function createVargaTool(userData: UserData): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'getVargaChart',
    description: TOOL_DESCRIPTIONS.getVargaChart,
    schema: vargaSchema,
    func: async ({ varga_num }) => {
      const result: ToolResult = await vargaHandler.execute(
        { varga_num },
        userData
      );
      
      if (result.success) {
        return JSON.stringify(result.data);
      }
      return `Error calculating Varga chart D${varga_num}: ${result.error}`;
    },
  });
}

/**
 * Creates the Varshaphala (Annual Solar Return) tool
 */
function createVarshapalaTool(userData: UserData): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'getVarshaphala',
    description: TOOL_DESCRIPTIONS.getVarshaphala,
    schema: varshaphalaSchema,
    func: async ({ age }) => {
      const result: ToolResult = await varshaphalaHandler.execute(
        { age },
        userData
      );
      
      if (result.success) {
        return JSON.stringify(result.data);
      }
      return `Error calculating Varshaphala for age ${age}: ${result.error}`;
    },
  });
}

/**
 * Creates the Dasha (Planetary Periods) tool
 */
function createDashaTool(userData: UserData): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'getDasha',
    description: TOOL_DESCRIPTIONS.getDasha,
    schema: dashaSchema,
    func: async () => {
      // Dasha uses userData directly, schema params are for LLM context only
      const result: ToolResult = await dashaHandler.execute(userData);
      
      if (result.success) {
        return JSON.stringify(result.data);
      }
      return `Error calculating Dasha periods: ${result.error}`;
    },
  });
}

/**
 * Creates the Birth Chart tool
 */
function createBirthChartTool(userData: UserData): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'getBirthChart',
    description: TOOL_DESCRIPTIONS.getBirthChart,
    schema: birthChartSchema,
    func: async () => {
      // Birth chart uses userData directly
      const result: ToolResult = await birthChartHandler.execute(userData);
      
      if (result.success) {
        return JSON.stringify(result.data);
      }
      return `Error fetching birth chart: ${result.error}`;
    },
  });
}

/**
 * Creates the File Search tool for querying indexed astrology books
 */
function createFileSearchTool(userData: UserData): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'searchBooks',
    description: TOOL_DESCRIPTIONS.searchBooks,
    schema: fileSearchSchema,
    func: async ({ query, topic }) => {
      trace('EXEC_START', 'searchBooks tool called', { query, topic });
      const result: ToolResult = await fileSearchHandler.execute(
        { query, topic },
        userData
      );
      
      trace('EXEC_END', 'searchBooks tool finished', { success: result.success });
      if (result.success) {
        return JSON.stringify(result.data);
      }
      return `Error searching books: ${result.error}. The knowledge base may not be available.`;
    },
  });
}

export { 
  createTransitTool, 
  createVargaTool, 
  createVarshapalaTool, 
  createDashaTool,
  createBirthChartTool,
  createFileSearchTool,
};
