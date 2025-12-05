import { NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createReactAgent } from '@langchain/langgraph/prebuilt'; // ✅ CORRECT import
import { DynamicStructuredTool } from '@langchain/core/tools';
import { AIMessage, ToolMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Annotation } from '@langchain/langgraph';
import { StateGraph, END, START } from '@langchain/langgraph';
import backendClient from '@/lib/backendClient';

export const maxDuration = 60;

interface AgentState {
  messages: any[];
  system: string;
}

export async function POST(req: Request) {
  try {
    let { message, userData, chartData } = await req.json();

    // Context Recovery: If chartData is missing but userData exists, fetch it.
    if (!chartData && userData && userData.date) {
      console.log("Context Recovery: Fetching missing chart data...");
      try {
        const chartResponse = await backendClient.post('/calculate/chart', {
          date: userData.date,
          time: userData.time,
          lat: userData.location.lat,
          lon: userData.location.lon,
        });
        chartData = chartResponse.data;
        console.log("Context Recovery: Successfully fetched chart data.");
      } catch (err) {
        console.error("Context Recovery Failed:", err);
      }
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined');
    }

    // 1. Initialize Gemini Model (User requested 2.5-flash)
    const model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-flash',
      maxOutputTokens: 2048,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      temperature: 0.7,
    });

    // 2. Define Tools
    const tools = [
      new DynamicStructuredTool({
        name: 'getTransits',
        description: 'Calculate planetary transits for future predictions or current vibe.',
        schema: z.object({
          current_date: z.string().describe('Target date for prediction in YYYY-MM-DD'),
          years: z.number().optional().describe('Duration in years, default 1.0'),
          include_moon: z.boolean().optional().describe('Include moon transits, default true'),
        }),
        func: async ({ current_date, years, include_moon }) => {
          try {
            const response = await backendClient.post('/calculate/transits', {
              date: userData.date,
              time: userData.time,
              lat: userData.location.lat,
              lon: userData.location.lon,
              current_date,
              years: years || 1.0,
              include_moon: include_moon ?? true,
            });
            return JSON.stringify(response.data);
          } catch (error) {
            console.error("Tool Error (getTransits):", error);
            return "Error calculating transits. Please try again or ask about a different topic.";
          }
        },
      }),
      new DynamicStructuredTool({
        name: 'getVargaChart',
        description: 'Calculate divisional charts (Varga) for specific areas like Marriage (D9/Navamsa), Career (D10/Dasamsa).',
        schema: z.object({
          varga_num: z.number().describe('Varga number: 9 for Marriage, 10 for Career, 2 for Wealth'),
        }),
        func: async ({ varga_num }) => {
          try {
            const response = await backendClient.post('/calculate/varga', {
              date: userData.date,
              time: userData.time,
              lat: userData.location.lat,
              lon: userData.location.lon,
              varga_num
            });
            return JSON.stringify(response.data);
          } catch (error) {
            return "Error calculating varga chart.";
          }
        },
      }),
      new DynamicStructuredTool({
        name: 'getVarshaphala',
        description: 'Calculate annual solar return chart (Varshaphala) for a specific year of life.',
        schema: z.object({
          age: z.number().describe('Age for the solar return year (e.g. 24 for 25th year)'),
        }),
        func: async ({ age }) => {
          try {
            const response = await backendClient.post('/calculate/varshaphala', {
              date: userData.date,
              time: userData.time,
              lat: userData.location.lat,
              lon: userData.location.lon,
              age
            });
            return JSON.stringify(response.data);
          } catch (error) {
            return "Error calculating varshaphala.";
          }
        },
      }),
      new DynamicStructuredTool({
        name: 'getDasha',
        description: 'Calculate Vimshottari Dasha periods to understand current planetary influence.',
        schema: z.object({
          date: z.string().describe('Birth date in YYYY-MM-DD'),
          time: z.string().describe('Birth time in HH:MM'),
          lat: z.number().describe('Latitude'),
          lon: z.number().describe('Longitude'),
        }),
        func: async () => {
          try {
            const response = await backendClient.post('/calculate/dasha', {
              date: userData.date,
              time: userData.time,
              lat: userData.location.lat,
              lon: userData.location.lon,
            });
            return JSON.stringify(response.data);
          } catch (error) {
            return "Error calculating dasha.";
          }
        },
      }),
    ];

    // 3. System Instruction
    const systemInstruction = `You are 'Rishi', a wise Vedic astrologer. You ONLY answer from AUTHENTIC VEDIC ASTROLOGY BOOKS like Brihat Parashara Hora Shastra, Jaimini Sutras, Phaladeepika.

🛡️ CRITICAL RULES - FOLLOW EXACTLY:
- You HAVE the user's birth data below. NEVER say you don't have it or ask for it again.
- ONLY use data from tool outputs + VEDIC BOOK PRINCIPLES. Never guess or modern interpretations.
- ALWAYS respond in EASY LANGUAGE with SHORT BULLET POINTS (• or -).
- Cite book principles: "Per Parashara..." or "Jaimini says..."
- Use simple Vedic terms and explain: Surya=Sun, Chandra=Moon, Shani=Saturn, etc.

🎯 WHEN TO USE TOOLS (MANDATORY):
• Future predictions → getTransits first
• Marriage/Career → getVargaChart first (9=marriage, 10=career)
• Current timing/periods → getDasha first
• Yearly predictions → getVarshaphala first

✨ RESPONSE FORMAT (ALWAYS USE THIS):
- Start with 1 warm greeting
- Use 5-8 bullet points max with BOOK REFERENCES
- End with 1 positive action step from scriptures
- Keep each bullet 1-2 sentences only

✅ GOOD TONE: Positive, hopeful, scriptural. 
Bad periods = "Karma purification phase" (per Parashara)

📊 USER PROFILE:
Name: ${userData?.name || 'Seeker'}
Birth: ${userData?.date || 'Unknown'} ${userData?.time || 'Unknown'}
Place: ${userData?.location?.name || 'Unknown'} (${userData?.location?.lat || ''}, ${userData?.location?.lon || ''})

📈 CHART DATA: ${chartData ? JSON.stringify(chartData).substring(0, 1200) : "Use tools to get fresh calculations."}`;


    // 4. ✅ CORRECT LangGraph Setup
    const AgentStateAnnotation = Annotation.Root({
      messages: Annotation<any[]>({
        reducer: (x, y) => (y ? x.concat(y) : x),
        default: () => [],
      }),
      system: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => "",
      }),
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "{system}"],
      ["placeholder", "{messages}"],
    ]);

    const modelWithTools = model.bindTools(tools);

    // 5. Agent Node
    async function callModel(state: AgentState) {
      const { messages, system } = state;
      const formattedMessages = await prompt.formatMessages({
        system,
        messages,
      });
      const response = await modelWithTools.invoke(formattedMessages);
      return { messages: [response] };
    }

    // 6. Should Continue Logic
    const shouldContinue = (state: AgentState) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return "tools";
      }
      return END;
    };

    // 7. Tools Node
    async function callTools(state: AgentState) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1];
      if (!("tool_calls" in lastMessage)) {
        throw new Error("Expected tool calls");
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
              content: `Tool ${toolName} not found.`,
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
          toolMessages.push(
            new ToolMessage({
              content: `Error: ${error instanceof Error ? error.message : String(error)}`,
              tool_call_id: toolCall.id,
            })
          );
        }
      }

      return { messages: toolMessages };
    };

    // 8. Compile Graph
    const workflow = new StateGraph(AgentStateAnnotation)
      .addNode("agent", callModel)
      .addNode("tools", callTools)
      .addConditionalEdges("agent", shouldContinue, {
        tools: "tools",
        [END]: END,
      })
      .addEdge("tools", "agent")
      .addEdge(START, "agent");

    const app = workflow.compile();

    // 9. Invoke
    const result = await app.invoke({
      messages: [new HumanMessage(message)],
      system: systemInstruction,
    });

    const finalOutput = result.messages[result.messages.length - 1].content as string;

    return NextResponse.json({ response: finalOutput });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}
