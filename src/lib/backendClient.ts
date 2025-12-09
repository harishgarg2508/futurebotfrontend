import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://harishgarg2508-vedic-engine.hf.space';

const backendClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Cold Starts (503 Retry)
backendClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.config &&
      error.response &&
      error.response.status === 503 &&
      !error.config.__isRetry
    ) {
      error.config.__isRetry = true;
      console.log('Server is waking up, retrying in 2s...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return backendClient.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default backendClient;
