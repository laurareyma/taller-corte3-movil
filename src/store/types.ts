// Tipos compartidos entre slices, selectores y componentes.

export type StatKey = 'str' | 'agi' | 'int';

// El enunciado pide WARRIOR | MAGE | ROGUE; TANK se agrega para el botón "Build Tanque" de la Zona B.
export type BuildPreset = 'WARRIOR' | 'MAGE' | 'ROGUE' | 'TANK';

export type ItemCategory = 'weapon' | 'shield' | 'armor' | 'boots' | 'accessory';

export interface Item {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  bonusStr: number;
  bonusAgi: number;
  bonusInt: number;
  weight: number; // Kg
}
