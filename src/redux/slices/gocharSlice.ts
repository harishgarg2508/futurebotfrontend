import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { CACHE_KEYS, getFromCache, saveToCache } from '@/lib/cache';

interface GocharState {
  transitData: any | null;
  natalData: any | null;
  loadingTransit: boolean;
  loadingNatal: boolean;
  error: string | null;
  mode: 'lagna' | 'moon';
  currentDate: string;
}

const initialState: GocharState = {
  transitData: null,
  natalData: null,
  loadingTransit: false,
  loadingNatal: false,
  error: null,
  mode: 'lagna',
  currentDate: new Date().toISOString().split('T')[0]
};

export const fetchDailyTransits = createAsyncThunk(
  'gochar/fetchDailyTransits',
  async (date: string) => {
    // Check Cache
    const cacheKey = `${CACHE_KEYS.TRANSIT}${date}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await axios.post('/api/gochar/daily', {
      current_date: date
    });
    
    saveToCache(cacheKey, response.data);
    return response.data;
  }
);

export const fetchNatalData = createAsyncThunk(
  'gochar/fetchNatalData',
  async (payload: { 
    birthDetails: { date: string, time: string, lat: number, lon: number, timezone: string },
    profileId: string
  }) => {
    // Check Cache
    const cacheKey = `${CACHE_KEYS.NATAL}${payload.profileId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    // Use existing chart endpoint to get Ascendant/Moon
    const response = await axios.post('/api/birth-chart', payload.birthDetails);
    
    // Extract only needed data
    const natalData = {
        ascendant: response.data.ascendant,
        moon: response.data.planets.Moon
    };

    saveToCache(cacheKey, natalData);
    return natalData;
  }
);

const gocharSlice = createSlice({
  name: 'gochar',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<'lagna' | 'moon'>) => {
      state.mode = action.payload;
    },
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    resetGochar: (state) => {
      state.transitData = null;
      state.natalData = null;
      state.loadingTransit = false;
      state.loadingNatal = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Daily Transits
      .addCase(fetchDailyTransits.pending, (state) => {
        state.loadingTransit = true;
        state.error = null;
      })
      .addCase(fetchDailyTransits.fulfilled, (state, action) => {
        state.loadingTransit = false;
        state.transitData = action.payload;
      })
      .addCase(fetchDailyTransits.rejected, (state, action) => {
        state.loadingTransit = false;
        state.error = action.error.message || 'Failed to fetch transits';
      })
      // Natal Data
      .addCase(fetchNatalData.pending, (state) => {
        state.loadingNatal = true;
        state.error = null;
      })
      .addCase(fetchNatalData.fulfilled, (state, action) => {
        state.loadingNatal = false;
        state.natalData = action.payload;
      })
      .addCase(fetchNatalData.rejected, (state, action) => {
        state.loadingNatal = false;
        state.error = action.error.message || 'Failed to fetch natal data';
      });
  },
});

export const { setMode, setCurrentDate, resetGochar } = gocharSlice.actions;
export default gocharSlice.reducer;
