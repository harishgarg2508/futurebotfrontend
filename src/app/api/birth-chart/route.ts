import { NextResponse } from 'next/server';
import backendClient from '@/lib/backendClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await backendClient.post('/calculate/chart', body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in birth-chart proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch birth chart' },
      { status: error.response?.status || 500 }
    );
  }
}
