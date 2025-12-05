import axios from 'axios';

export interface VargaData {
  date: string;
  time: string;
  lat: number;
  lon: number;
  varga_num: number;
}

export const getVargaChart = async (data: VargaData) => {
  try {
    const response = await axios.post('/api/varga', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching varga chart:', error);
    throw error;
  }
};
