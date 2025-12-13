import { NextResponse } from 'next/server';
import backendClient from '@/lib/backendClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Proxy to Python Backend
    const response = await backendClient.post('/predict/career', body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in career proxy:', error);
    return NextResponse.json(
      { error: 'Failed to generate career prediction' },
      { status: error.response?.status || 500 }
    );
  }
}
