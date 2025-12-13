import { NextResponse } from 'next/server';
import backendClient from '@/lib/backendClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await backendClient.post('/calculate/matchmaking', body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in matchmaking proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch matchmaking result' },
      { status: error.response?.status || 500 }
    );
  }
}
