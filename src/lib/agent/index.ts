/**
 * Agent Module Index
 * Single Responsibility: Export all agent components for easy importing
 */

// Types
export * from './types';

// Schemas
export * from './schemas';

// Descriptions
export { TOOL_DESCRIPTIONS, type ToolDescriptionKey } from './toolDescriptions';

// Prompts
export { 
  buildSystemPrompt, 
  generateBaseSystemPrompt, 
  generateUserContext, 
  generateChartContext,
  INTENT_CLASSIFICATION_PROMPT 
} from './prompts';

// Handlers
export {
  TransitHandler,
  VargaHandler,
  VarshaphalaHandler,
  DashaHandler,
  BirthChartHandler,
  ToolHandlerRegistry,
  transitHandler,
  vargaHandler,
  varshaphalaHandler,
  dashaHandler,
  birthChartHandler,
} from './handlers';

// Tool Factory
export { 
  createTools,
  createTransitTool,
  createVargaTool,
  createVarshapalaTool,
  createDashaTool,
  createBirthChartTool,
} from './toolFactory';

// Graph Builder
export {
  buildAgentGraph,
  createAgentStateAnnotation,
  createPromptTemplate,
  createShouldContinue,
  createModelNode,
  createToolsNode,
} from './graphBuilder';

// Model Configuration
export {
  createGeminiModel,
  DEFAULT_MODEL_CONFIG,
  MODEL_PRESETS,
  type ModelConfig,
  type ModelPreset,
} from './modelConfig';

// Agent Service
export {
  VedicAstrologyAgent,
  createAgent,
  defaultAgent,
  type AgentRequest,
  type AgentResponse,
} from './agentService';
