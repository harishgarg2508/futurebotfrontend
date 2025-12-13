import axios from 'axios';

export interface VarshaphalaData {
  date: string;
  time: string;
  lat: number;
  lon: number;
  age: number;
}

export const getVarshaphala = async (data: VarshaphalaData) => {
  try {
    const response = await axios.post('/api/varshaphala', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching varshaphala:', error);
    throw error;
  }
};
