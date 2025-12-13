import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define types based on backend response
interface MatchDetails {
  varna: number;
  vashya: number;
  tara: number;
  yoni: number;
  graha_maitri: number;
  gana: number;
  bhakoot: number;
  nadi: number;
}

interface Info {
  nakshatra: string;
  rashi: string;
  rashi_name: string;
}

interface MatchResult {
  total_score: number;
  details: MatchDetails;
  boy_info: Info;
  girl_info: Info;
  is_good_match: boolean;
  bhakoot_reason?: string;
}

interface MatchState {
  result: MatchResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  result: null,
  loading: false,
  error: null,
};

// Async Thunk for fetching match
export const fetchMatchMaking = createAsyncThunk(
  'match/fetchMatchMaking',
  async (payload: {
    boy_date: string;
    boy_time: string;
    girl_date: string;
    girl_time: string;
  }, { rejectWithValue }) => {
    const cacheKey = `match_making_${JSON.stringify(payload)}`

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    }

    try {
      // Using API proxy route
      const response = await axios.post('/api/matchmaking', payload);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(response.data))
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch match result');
    }
  }
);

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    clearMatchResult: (state) => {
      state.result = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchMaking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchMaking.fulfilled, (state, action: PayloadAction<MatchResult>) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(fetchMatchMaking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMatchResult } = matchSlice.actions;
export default matchSlice.reducer;
