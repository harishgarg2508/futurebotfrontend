import axios from 'axios';

export interface DashaPayload {
  date: string;
  time: string;
  lat: number;
  lon: number;
  timezone?: string;
  parent_lords?: string[];
}

export const getDasha = async (data: DashaPayload) => {
  const response = await axios.post('/api/dasha', {
    ...data,
    timezone: data.timezone || 'Asia/Kolkata',
    parent_lords: data.parent_lords || []
  });
  return response.data;
};
