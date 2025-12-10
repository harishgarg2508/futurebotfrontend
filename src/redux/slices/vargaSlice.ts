import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import backendClient from '../../lib/backendClient';
import { RootState } from '../store';

// Types
export interface VargaPlanet {
  sign: string;
  sign_id: number;
  longitude: number;
  full_degree: number;
  speed: number;
  nakshatra?: string;
  nakshatra_lord?: string;
  pada?: number;
  dignity?: string;
  retrograde?: boolean;
}

export interface VargaAscendant {
  sign: string;
  sign_id: number;
  longitude: number;
  full_degree: number;
}

export interface VargaChartData {
  meta: {
    varga: number;
  };
  planets: Record<string, VargaPlanet>;
  ascendant: VargaAscendant;
}

interface VargaState {
  // Cache structure: { "date-time-lat-lon": { 1: ChartData, 9: ChartData } }
  cache: Record<string, Record<number, VargaChartData>>;
  loading: boolean;
  error: string | null;
  selectedVargas: number[]; // Currently selected vargas to display
}

const initialState: VargaState = {
  cache: {},
  loading: false,
  error: null,
  selectedVargas: [],
};

// Helper to generate cache key
export const generateCacheKey = (date: string, time: string, lat: number, lon: number) => {
    return `${date}-${time}-${lat}-${lon}`;
};

// Async Thunk
export const fetchVargaCharts = createAsyncThunk(
  'varga/fetchCharts',
  async (
    { 
      date, time, lat, lon, timezone, vargaNums 
    }: { 
      date: string; time: string; lat: number; lon: number; timezone: string; vargaNums: number[] 
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const cacheKey = generateCacheKey(date, time, lat, lon);
    const userCache = state.varga.cache[cacheKey] || {};
    
    // Filter out vargas that are already cached for THIS user
    const missingVargas = vargaNums.filter(num => !userCache[num]);
    
    if (missingVargas.length === 0) {
      return { results: {}, params: cacheKey }; // All requested charts are already cached
    }

    try {
      const response = await backendClient.post('/calculate/varga', {
        date,
        time,
        lat,
        lon,
        timezone,
        varga_nums: missingVargas,
      });
      return { results: response.data, params: cacheKey }; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch Varga charts');
    }
  }
);

const vargaSlice = createSlice({
  name: 'varga',
  initialState,
  reducers: {
    setSelectedVargas: (state, action: PayloadAction<number[]>) => {
      state.selectedVargas = action.payload;
    },
    clearVargaData: (state) => {
      // Clears EVERYTHING. Maybe we want clearUserCache?
      state.cache = {};
      state.selectedVargas = [];
      state.error = null;
    },
    resetSelection: (state) => {
        state.selectedVargas = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVargaCharts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVargaCharts.fulfilled, (state, action) => {
        state.loading = false;
        const { results, params } = action.payload;
        
        // Initialize bucket if not exists
        if (!state.cache[params]) {
            state.cache[params] = {};
        }
        
        // Merge new results into the specific user's bucket
        state.cache[params] = { ...state.cache[params], ...results };
      })
      .addCase(fetchVargaCharts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedVargas, clearVargaData, resetSelection } = vargaSlice.actions;
export default vargaSlice.reducer;
