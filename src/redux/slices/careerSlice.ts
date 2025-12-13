import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

// Types
export interface CareerScore {
  category: string;
  score: number;
  color: string;
  yogas: {
    name: string;
    desc: string;
    points: number;
    tier: string;
  }[];
}

export interface CareerPredictionResult {
  user_name: string;
  hero_stats: {
    primary_archetype: string;
    confidence_score: number;
    top_category: string;
  };
  career_matrix: CareerScore[];
  oracle_verdict: string;
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

export const generateCacheKey = (date: string, time: string, lat: number, lon: number, profileId: string = '') => {
    return `${date}-${time}-${lat}-${lon}-${profileId}`;
};

export const fetchCareerPrediction = createAsyncThunk(
  'career/fetchPrediction',
  async (
    { 
      date, time, lat, lon, timezone, name, language, profileId, forceRefresh = false
    }: { 
      date: string; time: string; lat: number; lon: number; timezone: string; name?: string; language?: string; profileId?: string; forceRefresh?: boolean
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const cacheKey = generateCacheKey(date, time, lat, lon, profileId);
    
    // Check cache ONLY if forceRefresh is false
    if (!forceRefresh && state.career.cache[cacheKey]) {
      return { result: state.career.cache[cacheKey], key: cacheKey };
    }

    try {
      // Call Next.js API route (BFF proxy)
      const response = await axios.post('/api/career/predict', {
        date,
        time,
        lat,
        lon,
        timezone,
        name,
        language
      });
      return { result: response.data, key: cacheKey };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch career prediction');
      }
      return rejectWithValue('Failed to fetch career prediction');
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
    },
    setPrediction: (state, action: PayloadAction<CareerPredictionResult>) => {
      state.currentPrediction = action.payload;
      state.loading = false;
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

export const { clearCareerData, setPrediction } = careerSlice.actions;
export default careerSlice.reducer;
