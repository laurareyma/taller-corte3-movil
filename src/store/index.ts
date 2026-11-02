import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import statsReducer from './slices/statsSlice';
import inventoryReducer from './slices/inventorySlice';
import actionLogReducer from './slices/actionLogSlice';

export const store = configureStore({
  reducer: {
    stats: statsReducer,
    inventory: inventoryReducer,
    actionLog: actionLogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks tipados para los componentes visuales (forma recomendada en react-redux 9).
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
