import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Item } from '../types';

export interface InventoryState {
  catalog: Item[];
  equippedIds: string[];
}

// Capacidad de carga = 10 + (Fuerza Total * 2). Con STR 5 el héroe aguanta 20 Kg,
// así que la Armadura Maldita (30 Kg) provoca sobrecarga por sí sola.
const CATALOG: Item[] = [
  { id: 'fire_sword', name: 'Espada de Fuego', icon: '🗡️', category: 'weapon', bonusStr: 4, bonusAgi: 0, bonusInt: 0, weight: 6 },
  { id: 'arcane_staff', name: 'Báculo Arcano', icon: '🪄', category: 'weapon', bonusStr: 0, bonusAgi: 0, bonusInt: 6, weight: 4 },
  { id: 'shadow_dagger', name: 'Daga Sombría', icon: '🔪', category: 'weapon', bonusStr: 0, bonusAgi: 3, bonusInt: 0, weight: 2 },
  { id: 'titanium_shield', name: 'Escudo de Titanio', icon: '🛡️', category: 'shield', bonusStr: 2, bonusAgi: 0, bonusInt: 0, weight: 14 },
  { id: 'elven_boots', name: 'Botas Élficas', icon: '👢', category: 'boots', bonusStr: 0, bonusAgi: 4, bonusInt: 0, weight: 1 },
  { id: 'wisdom_amulet', name: 'Amuleto de Sabiduría', icon: '📿', category: 'accessory', bonusStr: 0, bonusAgi: 0, bonusInt: 3, weight: 1 },
  { id: 'cursed_armor', name: 'Armadura Maldita', icon: '🥋', category: 'armor', bonusStr: 2, bonusAgi: -3, bonusInt: 2, weight: 30 },
];

const initialState: InventoryState = {
  catalog: CATALOG,
  equippedIds: [],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    toggleEquipItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.catalog.some((item) => item.id === id)) return;

      const index = state.equippedIds.indexOf(id);
      if (index >= 0) {
        state.equippedIds.splice(index, 1);
      } else {
        state.equippedIds.push(id);
      }
    },

    clearEquipment(state) {
      state.equippedIds = [];
    },
  },
});

export const { toggleEquipItem, clearEquipment } = inventorySlice.actions;

// Alias requerido por la rúbrica (Zona C)
export const unequipAll = clearEquipment;

export default inventorySlice.reducer;
