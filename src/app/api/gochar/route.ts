import { NextResponse } from 'next/server';
import backendClient from '@/lib/backendClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Forward to backend
    const response = await backendClient.post('/calculate/gochar', body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in gochar proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gochar data' },
      { status: error.response?.status || 500 }
    );
  }
}
