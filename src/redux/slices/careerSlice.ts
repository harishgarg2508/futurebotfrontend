import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import backendClient from '../../lib/backendClient';
import { RootState } from '../store';

// Types
export interface CareerScore {
  career: string;
  score: number;
  match_pct: number;
}

export interface UnlockedYoga {
  id: number;
  name: string;
  result: string;
  tags: string[];
  impact: any;
}

export interface CareerPredictionResult {
  status: string;
  archetype: string;
  scores: {
    CAREER: CareerScore[];
    ATTRIBUTES: {
      WEALTH: number;
      FAME: number;
      SPIRITUALITY: number;
      INTUITION: number;
      AUTHORITY: number;
      LUCK: number;
    };
  };
  unlocked_yogas: UnlockedYoga[];
  timeline: any[];
  sherlock_hooks: string[];
}

interface CareerState {
  // Cache key: utils generateCacheKey
  cache: Record<string, CareerPredictionResult>;
  loading: boolean;
  error: string | null;
  currentPrediction: CareerPredictionResult | null;
}

const initialState: CareerState = {
  cache: {},
  loading: false,
  error: null,
  currentPrediction: null,
};

export const generateCacheKey = (date: string, time: string, lat: number, lon: number) => {
    return `${date}-${time}-${lat}-${lon}`;
};

export const fetchCareerPrediction = createAsyncThunk(
  'career/fetchPrediction',
  async (
    { 
      date, time, lat, lon, timezone 
    }: { 
      date: string; time: string; lat: number; lon: number; timezone: string 
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const cacheKey = generateCacheKey(date, time, lat, lon);
    
    if (state.career.cache[cacheKey]) {
      return { result: state.career.cache[cacheKey], key: cacheKey };
    }

    try {
      const response = await backendClient.post('/predict/career', {
        date,
        time,
        lat,
        lon,
        timezone,
      });
      return { result: response.data, key: cacheKey };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch career prediction');
    }
  }
);

const careerSlice = createSlice({
  name: 'career',
  initialState,
  reducers: {
    clearCareerData: (state) => {
      state.currentPrediction = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCareerPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCareerPrediction.fulfilled, (state, action) => {
        state.loading = false;
        const { result, key } = action.payload;
        state.cache[key] = result;
        state.currentPrediction = result;
      })
      .addCase(fetchCareerPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCareerData } = careerSlice.actions;
export default careerSlice.reducer;
