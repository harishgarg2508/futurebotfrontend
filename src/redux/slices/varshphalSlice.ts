import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define types based on backend response
interface PlanetData {
  current_sign?: string; // Backend might not send this, it sends 'sign'
  sign: string;
  full_degree?: number; // Backend sends 'longitude'
  longitude: number;
  degree: number; // Backend sends 'degree', not 'norm_degree'
  is_retrograde: boolean;
  sign_id: number;
  speed?: number;
  nakshatra?: string;
  nakshatra_lord?: string;
  pada?: number;
  dignity?: string;
}

interface VarshphalResult {
  meta: {
    type: string;
    age: number;
    year: number;
    return_jd: number;
  };
  planets: Record<string, PlanetData>;
  ascendant: PlanetData;
  muntha: {
    sign_id: number;
    sign: string;
    progressed_years: number;
  };
}

interface VarshphalState {
  result: VarshphalResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: VarshphalState = {
  result: null,
  loading: false,
  error: null,
};

// Async Thunk for fetching varshaphala
export const fetchVarshphal = createAsyncThunk(
  'varshphal/fetchVarshphal',
  async (payload: {
    date: string;
    time: string;
    lat: number;
    lon: number;
    age: number;
    timezone?: string;
  }, { rejectWithValue }) => {
    const cacheKey = `varshphal_${JSON.stringify(payload)}`

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    }

    try {
      // Using Hugging Face URL
      const response = await axios.post('https://harishgarg2508-vedic-engine.hf.space/calculate/varshaphala', {
        ...payload,
        timezone: payload.timezone || 'Asia/Kolkata'
      });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(response.data))
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch varshphal chart');
    }
  }
);

const varshphalSlice = createSlice({
  name: 'varshphal',
  initialState,
  reducers: {
    clearVarshphalResult: (state) => {
      state.result = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVarshphal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVarshphal.fulfilled, (state, action: PayloadAction<VarshphalResult>) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(fetchVarshphal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearVarshphalResult } = varshphalSlice.actions;
export default varshphalSlice.reducer;
