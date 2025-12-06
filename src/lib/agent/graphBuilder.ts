/**
 * LangGraph Workflow Builder - Creates the agent execution graph
 * Single Responsibility: Build and configure the LangGraph state machine
 */

import { Annotation } from '@langchain/langgraph';
import { StateGraph, END, START } from '@langchain/langgraph';
import { AIMessage, ToolMessage, BaseMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { AgentState } from './types';

/**
 * Creates the agent state annotation for LangGraph
 */
export function createAgentStateAnnotation() {
  return Annotation.Root({
    messages: Annotation<any[]>({
      reducer: (x, y) => (y ? x.concat(y) : x),
      default: () => [],
    }),
    system: Annotation<string>({
      reducer: (x, y) => y ?? x,
      default: () => "",
    }),
  });
}

/**
 * Creates the chat prompt template
 */
export function createPromptTemplate(): ChatPromptTemplate {
  return ChatPromptTemplate.fromMessages([
    ["system", "{system}"],
    ["placeholder", "{messages}"],
  ]);
}

/**
 * Determines if the agent should continue to tools or end
 */
export function createShouldContinue() {
  return (state: AgentState) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (
      lastMessage instanceof AIMessage && 
      lastMessage.tool_calls && 
      lastMessage.tool_calls.length > 0
    ) {
      return "tools";
    }
    return END;
  };
}

/**
 * Creates the model calling node
 */
export function createModelNode(
  model: any, 
  tools: DynamicStructuredTool[],
  promptTemplate: ChatPromptTemplate
) {
  const modelWithTools = model.bindTools(tools);
  
  return async (state: AgentState) => {
    const { messages, system } = state;
    const formattedMessages = await promptTemplate.formatMessages({
      system,
      messages,
    });
    const response = await modelWithTools.invoke(formattedMessages);
    return { messages: [response] };
  };
}

/**
 * Creates the tool execution node
 */
export function createToolsNode(tools: DynamicStructuredTool[]) {
  return async (state: AgentState) => {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    
    if (!("tool_calls" in lastMessage)) {
      throw new Error("Expected tool calls in the last message");
    }

    const toolCalls = lastMessage.tool_calls;
    const toolMessages: BaseMessage[] = [];

    for (const toolCall of toolCalls) {
      const toolName = toolCall.name;
      const toolArgs = toolCall.args;
      const tool = tools.find((t) => t.name === toolName);
      
      if (!tool) {
        toolMessages.push(
          new ToolMessage({
            content: `Tool "${toolName}" not found. Available tools: ${tools.map(t => t.name).join(', ')}`,
            tool_call_id: toolCall.id,
          })
        );
        continue;
      }

      try {
        const toolResult = await (tool as any).invoke(toolArgs);
        toolMessages.push(
          new ToolMessage({
            content: toolResult.toString(),
            tool_call_id: toolCall.id,
          })
        );
      } catch (error) {
        console.error(`Tool execution error [${toolName}]:`, error);
        toolMessages.push(
          new ToolMessage({
            content: `Error executing ${toolName}: ${error instanceof Error ? error.message : String(error)}`,
            tool_call_id: toolCall.id,
          })
        );
      }
    }

    return { messages: toolMessages };
  };
}

/**
 * Builds and compiles the complete agent workflow graph
 */
export function buildAgentGraph(
  model: any,
  tools: DynamicStructuredTool[]
) {
  const AgentStateAnnotation = createAgentStateAnnotation();
  const promptTemplate = createPromptTemplate();
  
  const callModel = createModelNode(model, tools, promptTemplate);
  const callTools = createToolsNode(tools);
  const shouldContinue = createShouldContinue();

  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", callTools)
    .addConditionalEdges("agent", shouldContinue, {
      tools: "tools",
      [END]: END,
    })
    .addEdge("tools", "agent")
    .addEdge(START, "agent");

  return workflow.compile();
}
