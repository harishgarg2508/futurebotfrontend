import axios from 'axios';

export interface TransitData {
  date: string;
  time: string;
  lat: number;
  lon: number;
  current_date: string;
  years?: number;
  include_moon?: boolean;
}

export const getTransits = async (data: TransitData) => {
  try {
    const response = await axios.post('/api/transits', {
      ...data,
      years: data.years || 1.0,
      include_moon: data.include_moon !== undefined ? data.include_moon : true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transits:', error);
    throw error;
  }
};
