import backendClient from '@/lib/backendClient';

export interface CareerPredictionData {
  date: string;
  time: string;
  lat: number;
  lon: number;
  timezone?: string;
  name?: string; // Optional for display
}

export const getCareerPrediction = async (data: CareerPredictionData) => {
  const cacheKey = `career_prediction_${JSON.stringify(data)}`;
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log("Serving Career Prediction from cache");
      return JSON.parse(cached);
    }
  }

  console.log("Calling Career Prediction API...");
  try {
    const response = await backendClient.post('/predict/career', {
      ...data,
      timezone: data.timezone || 'Asia/Kolkata',
    });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching career prediction:', error);
    throw error;
  }
};
