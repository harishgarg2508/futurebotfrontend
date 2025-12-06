/**
 * Vedic Astrology Agent Service
 * Single Responsibility: Orchestrate the complete agent workflow
 * 
 * This is the main entry point for the agent system.
 * It coordinates all the modular components to process user queries.
 */

import { HumanMessage } from '@langchain/core/messages';
import { createGeminiModel, ModelPreset, MODEL_PRESETS } from './modelConfig';
import { createTools } from './toolFactory';
import { buildSystemPrompt } from './prompts';
import { buildAgentGraph } from './graphBuilder';
import { UserData, ChartData } from './types';
import backendClient from '@/lib/backendClient';

// [DEBUG] Trace Logger
const trace = (step: string, msg: string, data?: any) => {
  console.log(`\x1b[35m[AGENT_TRACE] ${step}: ${msg}\x1b[0m`, data ? JSON.stringify(data, null, 2) : '');
};

export interface AgentRequest {
  message: string;
  userData: UserData;
  chartData?: ChartData;
}

export interface AgentResponse {
  response: string;
  toolsUsed?: string[];
  error?: string;
}

/**
 * VedicAstrologyAgent - The main agent class
 * Follows Open/Closed principle - extend through composition, not modification
 */
export class VedicAstrologyAgent {
  private modelPreset: ModelPreset;

  constructor(modelPreset: ModelPreset = 'default') {
    this.modelPreset = modelPreset;
  }

  /**
   * Process a user message and return the agent's response
   */
  async processMessage(request: AgentRequest): Promise<AgentResponse> {
    const { message, userData, chartData } = request;

    // Validate inputs
    this.validateRequest(request);

    // Recover missing chart data if needed
    const recoveredChartData = await this.recoverChartDataIfNeeded(userData, chartData);

    // Create model instance
    const model = createGeminiModel({
      ...MODEL_PRESETS[this.modelPreset],
    });

    // Create tools bound to user context
    const tools = createTools(userData);

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(userData, recoveredChartData);
    trace('PROMPT', 'System prompt built', { length: systemPrompt.length });

    // Build and compile the agent graph
    const agentGraph = buildAgentGraph(model, tools);
    trace('GRAPH', 'Agent graph built, starting execution...');

    // Execute the agent
    const result = await agentGraph.invoke({
      messages: [new HumanMessage(message)],
      system: systemPrompt,
    });

    // Extract final response
    const finalMessage = result.messages[result.messages.length - 1];
    const response = finalMessage.content as string;

    // Track which tools were used (for logging/analytics)
    const toolsUsed = this.extractToolsUsed(result.messages);
    trace('COMPLETE', 'Agent execution finished', { toolsUsed, responseLength: response.length });

    return {
      response,
      toolsUsed,
    };
  }

  /**
   * Validates the incoming request
   */
  private validateRequest(request: AgentRequest): void {
    if (!request.message || request.message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    if (!request.userData) {
      throw new Error('User data is required');
    }

    if (!request.userData.date || !request.userData.time) {
      throw new Error('Birth date and time are required');
    }

    if (!request.userData.location?.lat || !request.userData.location?.lon) {
      throw new Error('Birth location coordinates are required');
    }
  }

  /**
   * Recovers chart data if missing but userData is available
   */
  private async recoverChartDataIfNeeded(
    userData: UserData,
    chartData?: ChartData
  ): Promise<ChartData | undefined> {
    if (chartData) {
      return chartData;
    }

    // Try to fetch chart data if we have user birth info
    if (userData?.date && userData?.time && userData?.location) {
      console.log("Context Recovery: Fetching missing chart data...");
      try {
        const chartResponse = await backendClient.post('/calculate/chart', {
          date: userData.date,
          time: userData.time,
          lat: userData.location.lat,
          lon: userData.location.lon,
        });
        console.log("Context Recovery: Successfully fetched chart data.");
        return chartResponse.data;
      } catch (err) {
        console.error("Context Recovery Failed:", err);
        return undefined;
      }
    }

    return undefined;
  }

  /**
   * Extracts the list of tools that were used during processing
   */
  private extractToolsUsed(messages: any[]): string[] {
    const toolsUsed: string[] = [];
    
    for (const msg of messages) {
      if (msg.tool_calls) {
        for (const toolCall of msg.tool_calls) {
          if (!toolsUsed.includes(toolCall.name)) {
            toolsUsed.push(toolCall.name);
          }
        }
      }
    }
    
    return toolsUsed;
  }
}

/**
 * Factory function to create agent instances
 */
export function createAgent(preset: ModelPreset = 'default'): VedicAstrologyAgent {
  return new VedicAstrologyAgent(preset);
}

// Default agent instance for simple usage
export const defaultAgent = new VedicAstrologyAgent();
