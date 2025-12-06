/**
 * Chat API Route
 * Single Responsibility: Handle HTTP requests and delegate to the agent service
 * 
 * This route is now clean and focused on:
 * 1. Request parsing
 * 2. Response formatting
 * 3. Error handling
 * 
 * All agent logic is delegated to the modular agent service.
 */

import { NextResponse } from 'next/server';
import { createAgent, AgentRequest, UserData, ChartData } from '@/lib/agent';

export const maxDuration = 60;

/**
 * Validates the incoming request body
 */
function validateRequest(body: any): { isValid: boolean; error?: string } {
  if (!body.message || typeof body.message !== 'string') {
    return { isValid: false, error: 'Message is required and must be a string' };
  }

  if (!body.userData) {
    return { isValid: false, error: 'User data is required' };
  }

  if (!body.userData.date || !body.userData.time) {
    return { isValid: false, error: 'Birth date and time are required in userData' };
  }

  if (!body.userData.location?.lat || !body.userData.location?.lon) {
    return { isValid: false, error: 'Birth location coordinates are required in userData.location' };
  }

  return { isValid: true };
}

/**
 * Transforms raw request body to typed AgentRequest
 */
function parseRequest(body: any): AgentRequest {
  const userData: UserData = {
    name: body.userData.name,
    date: body.userData.date,
    time: body.userData.time,
    location: {
      name: body.userData.location?.name,
      lat: body.userData.location.lat,
      lon: body.userData.location.lon,
    },
    timezone: body.userData.timezone,
  };

  const chartData: ChartData | undefined = body.chartData;

  return {
    message: body.message,
    userData,
    chartData,
  };
}

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const body = await req.json();

    // 2. Validate request
    const validation = validateRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error },
        { status: 400 }
      );
    }

    // 3. Parse into typed request
    const agentRequest = parseRequest(body);

    // 4. Create agent and process message
    const agent = createAgent('default');
    const result = await agent.processMessage(agentRequest);

    // 5. Log tools used (optional, for analytics)
    if (result.toolsUsed && result.toolsUsed.length > 0) {
      console.log(`Tools used: ${result.toolsUsed.join(', ')}`);
    }

    // 6. Return response
    return NextResponse.json({ 
      response: result.response,
      toolsUsed: result.toolsUsed 
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Determine error type for appropriate status code
    const statusCode = error.message?.includes('required') ? 400 : 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response', 
        details: error.message 
      },
      { status: statusCode }
    );
  }
}
