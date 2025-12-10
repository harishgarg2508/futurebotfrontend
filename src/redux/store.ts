import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import matchReducer from './slices/matchSlice';
import varshphalReducer from './slices/varshphalSlice';
import dashaReducer from './slices/dashaSlice';
import gocharReducer from './slices/gocharSlice';
import vargaReducer from './slices/vargaSlice';
import careerReducer from './slices/careerSlice';

const rootReducer = combineReducers({
  varshphal: varshphalReducer,
  dasha: dashaReducer,
  gochar: gocharReducer,
  match: matchReducer,
  varga: vargaReducer,
  career: careerReducer,
});

const persistConfig = {
  key: 'futurebot_root',
  storage,
  whitelist: ['varga'], // Only persist varga for now as requested
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
