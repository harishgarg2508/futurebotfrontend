import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import backendClient from '@/lib/backendClient';

interface DashaPeriod {
  level: number;
  lord: string;
  start: string;
  end: string;
  duration_days?: number;
  duration_years?: number;
}

interface DashaState {
  periods: Record<string, DashaPeriod[]>; // Key: "root" or "Lord1-Lord2..."
  loading: boolean;
  error: string | null;
  expandedPaths: string[];
}

const initialState: DashaState = {
  periods: {},
  loading: false,
  error: null,
  expandedPaths: [],
};

export const fetchDashaPeriods = createAsyncThunk(
  'dasha/fetchPeriods',
  async ({ birthDetails, parentLords }: { birthDetails: any; parentLords: string[] }, { rejectWithValue }) => {
    try {
      const response = await backendClient.post('/calculate/dasha-periods', {
        ...birthDetails,
        parent_lords: parentLords,
      });
      return { key: parentLords.length === 0 ? 'root' : parentLords.join('-'), data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch dasha periods');
    }
  }
);

const dashaSlice = createSlice({
  name: 'dasha',
  initialState,
  reducers: {
    togglePath: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      if (state.expandedPaths.includes(path)) {
        state.expandedPaths = state.expandedPaths.filter((p) => p !== path);
      } else {
        state.expandedPaths.push(path);
      }
    },
    resetDasha: (state) => {
        state.periods = {};
        state.expandedPaths = [];
        state.loading = false;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashaPeriods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashaPeriods.fulfilled, (state, action) => {
        state.loading = false;
        const { key, data } = action.payload;
        state.periods[key] = data;
      })
      .addCase(fetchDashaPeriods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { togglePath, resetDasha } = dashaSlice.actions;
export default dashaSlice.reducer;
