import axios from 'axios';

export interface BirthChartData {
  date: string;
  time: string;
  lat: number;
  lon: number;
  timezone?: string;
}

export const getBirthChart = async (data: BirthChartData) => {
  try {
    const response = await axios.post('/api/birth-chart', {
      ...data,
      timezone: data.timezone || 'Asia/Kolkata',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching birth chart:', error);
    throw error;
  }
};
