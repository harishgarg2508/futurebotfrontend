import backendClient from '@/lib/backendClient';

export interface DashaPayload {
  date: string;
  time: string;
  lat: number;
  lon: number;
}

export const getDasha = async (data: DashaPayload) => {
  const response = await backendClient.post('/calculate/dasha', data);
  return response.data;
};
