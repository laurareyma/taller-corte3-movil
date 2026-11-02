import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BuildPreset, StatKey } from '../types';

export const MAX_HP = 100;
export const MIN_STAT = 1;

export interface StatsState {
  availablePoints: number;
  str: number;
  agi: number;
  int: number;
  currentHp: number;
}

const initialState: StatsState = {
  availablePoints: 15,
  str: 5,
  agi: 5,
  int: 5,
  currentHp: MAX_HP,
};

// Cada preset reparte el total de puntos (15 base + 15 libres = 30) y deja 0 disponibles.
const PRESETS: Record<BuildPreset, Pick<StatsState, StatKey>> = {
  WARRIOR: { str: 16, agi: 9, int: 5 },
  MAGE: { str: 5, agi: 7, int: 18 },
  ROGUE: { str: 7, agi: 17, int: 6 },
  TANK: { str: 20, agi: 5, int: 5 },
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    // Gracias a Immer podemos "mutar" el borrador; RTK genera un estado nuevo e inmutable.
    incrementStat(state, action: PayloadAction<StatKey>) {
      if (state.availablePoints <= 0) return;
      state[action.payload] += 1;
      state.availablePoints -= 1;
    },

    decrementStat(state, action: PayloadAction<StatKey>) {
      if (state[action.payload] <= MIN_STAT) return;
      state[action.payload] -= 1;
      state.availablePoints += 1;
    },

    takeDamage(state, action: PayloadAction<number>) {
      const damage = Math.max(0, Math.round(action.payload));
      state.currentHp = Math.max(0, state.currentHp - damage);
    },

    healHero(state) {
      state.currentHp = MAX_HP;
    },

    applyBuildPreset(state, action: PayloadAction<BuildPreset>) {
      const preset = PRESETS[action.payload];
      state.str = preset.str;
      state.agi = preset.agi;
      state.int = preset.int;
      state.availablePoints = 0;
    },

    // Poción de Reseteo: devuelve los atributos al inicio, pero conserva el HP actual.
    resetStats(state) {
      state.availablePoints = initialState.availablePoints;
      state.str = initialState.str;
      state.agi = initialState.agi;
      state.int = initialState.int;
    },
  },
});

export const {
  incrementStat,
  decrementStat,
  takeDamage,
  healHero,
  applyBuildPreset,
  resetStats,
} = statsSlice.actions;

// Alias requerido por la rúbrica (Zona B)
export const applyPreset = applyBuildPreset;

export default statsSlice.reducer;
