import { configureStore } from '@reduxjs/toolkit';
import matchReducer from './slices/matchSlice';
import varshphalReducer from './slices/varshphalSlice';
import dashaReducer from './slices/dashaSlice';
import gocharReducer from './slices/gocharSlice';

export const store = configureStore({
  reducer: {
    varshphal: varshphalReducer,
    dasha: dashaReducer,
    gochar: gocharReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
