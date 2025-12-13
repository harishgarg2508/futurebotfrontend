import axios from 'axios';

export interface BirthChartData {
  date: string;
  time: string;
  lat: number;
  lon: number;
  timezone?: string;
}

export const getBirthChart = async (data: BirthChartData) => {
  const cacheKey = `birth_chart_${JSON.stringify(data)}`
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      console.log("Serving from cache:", data)
      return JSON.parse(cached)
    }
  }

  console.log("Calling Birth Chart API with:", data);
  try {
    const response = await axios.post('/api/birth-chart', {
      ...data,
      timezone: data.timezone || 'Asia/Kolkata',
    });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify(response.data))
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching birth chart:', error);
    throw error;
  }
};
