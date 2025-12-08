import { configureStore } from '@reduxjs/toolkit';
import matchReducer from './slices/matchSlice';
import varshphalReducer from './slices/varshphalSlice';

export const store = configureStore({
  reducer: {
    match: matchReducer,
    varshphal: varshphalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
