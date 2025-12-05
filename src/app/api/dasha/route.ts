import { NextResponse } from 'next/server';
import backendClient from '@/lib/backendClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, time, lat, lon } = body;

    const response = await backendClient.post('/calculate/dasha', {
      date,
      time,
      lat,
      lon,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching dasha:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch dasha details' },
      { status: error.response?.status || 500 }
    );
  }
}
