import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import {
  incrementStat,
  decrementStat,
  takeDamage,
  healHero,
  applyBuildPreset,
  resetStats,
} from './statsSlice';
import { toggleEquipItem, clearEquipment } from './inventorySlice';

export const MAX_LOG_ENTRIES = 5;

export interface LogEntry {
  seq: number; // número de orden, sirve como key en las listas
  type: string; // ej. "inventory/toggleEquipItem"
  payload?: unknown;
}

export interface ActionLogState {
  entries: LogEntry[]; // la más reciente primero
  nextSeq: number;
}

const initialState: ActionLogState = {
  entries: [],
  nextSeq: 1,
};

function pushEntry(state: ActionLogState, type: string, payload?: unknown) {
  state.entries.unshift({ seq: state.nextSeq, type, payload });
  state.nextSeq += 1;
  if (state.entries.length > MAX_LOG_ENTRIES) {
    state.entries.length = MAX_LOG_ENTRIES;
  }
}

// Acciones de otros slices que el log escucha automáticamente.
const trackedActions = isAnyOf(
  incrementStat,
  decrementStat,
  takeDamage,
  healHero,
  applyBuildPreset,
  resetStats,
  toggleEquipItem,
  clearEquipment,
);

const actionLogSlice = createSlice({
  name: 'actionLog',
  initialState,
  reducers: {
    // Para eventos que no son acciones de otro slice (ej. "Atacaste al Boss por 42").
    logEvent(state, action: PayloadAction<string>) {
      pushEntry(state, action.type, action.payload);
    },
    clearLog(state) {
      state.entries = [];
    },
  },
  // Bonus: el log se llena solo, sin que los componentes tengan que despachar nada extra.
  extraReducers: (builder) => {
    builder.addMatcher(trackedActions, (state, action) => {
      pushEntry(state, action.type, 'payload' in action ? action.payload : undefined);
    });
  },
});

export const { logEvent, clearLog } = actionLogSlice.actions;

export default actionLogSlice.reducer;
