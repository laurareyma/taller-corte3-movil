import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { MAX_HP, MIN_STAT } from './slices/statsSlice';

// REGLA DE ORO: todo lo de este archivo es estado DERIVADO.
// Nada de esto se guarda en los slices; se recalcula a partir de stats + inventory.

const OVERLOAD_POWER_PENALTY = 0.7; // -30% de poder
const OVERLOAD_SPEED_PENALTY = 0.5; // -50% de velocidad
const CLASS_THRESHOLD = 12; // stat mínima para dejar de ser "Aldeano"
const TANK_MIN_WEIGHT = 20; // Kg equipados para contar como "Tanque Pesado"

// ---------- Selectores base (leen un pedazo del state) ----------

export const selectStats = (state: RootState) => state.stats;
export const selectAvailablePoints = (state: RootState) => state.stats.availablePoints;
export const selectCurrentHp = (state: RootState) => state.stats.currentHp;
export const selectCatalog = (state: RootState) => state.inventory.catalog;
export const selectEquippedIds = (state: RootState) => state.inventory.equippedIds;
export const selectLogEntries = (state: RootState) => state.actionLog.entries;

// ---------- Selectores derivados (cruzan slices, memorizados con createSelector) ----------

export const selectEquippedItems = createSelector(
  [selectCatalog, selectEquippedIds],
  (catalog, equippedIds) => catalog.filter((item) => equippedIds.includes(item.id)),
);

export const selectEquippedWeapon = createSelector(
  [selectEquippedItems],
  (items) => items.find((item) => item.category === 'weapon') ?? null,
);

export const selectTotalStats = createSelector(
  [selectStats, selectEquippedItems],
  (stats, items) => {
    const sum = (key: 'bonusStr' | 'bonusAgi' | 'bonusInt') =>
      items.reduce((acc, item) => acc + item[key], 0);

    // Un ítem maldito puede restar, pero ninguna stat total baja de 1.
    return {
      str: Math.max(MIN_STAT, stats.str + sum('bonusStr')),
      agi: Math.max(MIN_STAT, stats.agi + sum('bonusAgi')),
      int: Math.max(MIN_STAT, stats.int + sum('bonusInt')),
    };
  },
);

export const selectTotalWeight = createSelector([selectEquippedItems], (items) =>
  items.reduce((acc, item) => acc + item.weight, 0),
);

export const selectMaxCarryCapacity = createSelector(
  [selectTotalStats],
  (total) => 10 + total.str * 2,
);

export const selectIsOverencumbered = createSelector(
  [selectTotalWeight, selectMaxCarryCapacity],
  (weight, capacity) => weight > capacity,
);

export type WeightLevel = 'ok' | 'warning' | 'danger';

// Para la barra de peso: verde < 70%, amarillo hasta 100%, rojo si hay sobrecarga.
export const selectWeightStatus = createSelector(
  [selectTotalWeight, selectMaxCarryCapacity, selectIsOverencumbered],
  (current, max, isOverencumbered) => {
    const ratio = max > 0 ? current / max : 0;
    const level: WeightLevel = isOverencumbered ? 'danger' : ratio >= 0.7 ? 'warning' : 'ok';
    const color = { ok: '#22c55e', warning: '#eab308', danger: '#ef4444' }[level];
    return { current, max, ratio: Math.min(1, ratio), level, color };
  },
);

export const selectCombatPower = createSelector(
  [selectTotalStats, selectIsOverencumbered],
  (total, isOverencumbered) => {
    const rawPower = total.str * 3 + total.agi * 2 + total.int * 3;
    return isOverencumbered ? Math.round(rawPower * OVERLOAD_POWER_PENALTY) : rawPower;
  },
);

export const selectSpeed = createSelector(
  [selectTotalStats, selectIsOverencumbered],
  (total, isOverencumbered) => {
    const baseSpeed = total.agi * 10;
    return isOverencumbered ? Math.round(baseSpeed * OVERLOAD_SPEED_PENALTY) : baseSpeed;
  },
);

// Barra de maná: crece con la INT total (25 de INT = barra llena).
export const selectMana = createSelector([selectTotalStats], (total) => ({
  max: total.int * 10,
  ratio: Math.min(1, total.int / 25),
}));

export type HeroClassId = 'VILLAGER' | 'BERSERKER' | 'ARCHMAGE' | 'ROGUE' | 'TANK';

export interface HeroVisualClass {
  id: HeroClassId;
  label: string;
  emoji: string;
  auraColor: string;
}

const CLASSES: Record<HeroClassId, HeroVisualClass> = {
  VILLAGER: { id: 'VILLAGER', label: 'Aldeano', emoji: '🧑‍🌾', auraColor: '#94a3b8' },
  BERSERKER: { id: 'BERSERKER', label: 'Guerrero Berserker', emoji: '🪓', auraColor: '#ef4444' },
  ARCHMAGE: { id: 'ARCHMAGE', label: 'Archimago', emoji: '🧙', auraColor: '#3b82f6' },
  ROGUE: { id: 'ROGUE', label: 'Asesino Sombrío', emoji: '🥷', auraColor: '#10b981' },
  TANK: { id: 'TANK', label: 'Tanque Pesado', emoji: '🛡️', auraColor: '#f59e0b' },
};

// La clase sale de la stat dominante + el peso equipado.
export const selectHeroVisualClass = createSelector(
  [selectTotalStats, selectTotalWeight],
  (total, weight): HeroVisualClass => {
    const { str, agi, int } = total;
    const dominant = Math.max(str, agi, int);

    if (dominant < CLASS_THRESHOLD) return CLASSES.VILLAGER;
    if (str === dominant && weight >= TANK_MIN_WEIGHT) return CLASSES.TANK;
    if (str === dominant) return CLASSES.BERSERKER;
    if (int === dominant) return CLASSES.ARCHMAGE;
    return CLASSES.ROGUE;
  },
);

export type HeroCondition = 'healthy' | 'wounded' | 'defeated';

export const selectHeroCondition = createSelector([selectCurrentHp], (hp) => {
  const ratio = hp / MAX_HP;
  const condition: HeroCondition = hp <= 0 ? 'defeated' : ratio <= 0.5 ? 'wounded' : 'healthy';
  const expression = { healthy: '😎', wounded: '😣', defeated: '💀' }[condition];
  return { hp, maxHp: MAX_HP, ratio, condition, expression, isDefeated: hp <= 0 };
});

// Alias con el nombre alternativo usado en el documento
export const selectIsOverloaded = selectIsOverencumbered;

// Selector cruzado unificado conforme al ejemplo de la Sección 4 de la rúbrica
export const selectHeroComputedStatus = createSelector(
  [
    selectTotalStats,
    selectTotalWeight,
    selectMaxCarryCapacity,
    selectIsOverencumbered,
    selectHeroVisualClass,
    selectCombatPower,
    selectHeroCondition,
  ],
  (total, currentWeight, maxWeightCapacity, isOverloaded, heroClass, combatPower, condition) => ({
    totalStr: total.str,
    totalAgi: total.agi,
    totalInt: total.int,
    currentWeight,
    maxWeightCapacity,
    isOverloaded,
    heroClass: heroClass.label,
    auraColor: heroClass.auraColor,
    combatPower,
    isDefeated: condition.isDefeated,
  }),
);
