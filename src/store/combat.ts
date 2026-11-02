// Reglas del combate como funciones puras: fáciles de probar y fuera de los componentes.
// `roll` es un número aleatorio 0..1 (se pasa desde afuera para que la función sea predecible).

export const BOSS_MAX_HP = 300;

// Daño que el héroe le hace al Boss: depende del Poder de Combate (ya penalizado si hay sobrecarga).
export function heroHitDamage(combatPower: number, roll: number): number {
  return Math.max(1, Math.round(combatPower * (0.8 + roll * 0.4)));
}

// Daño que el Boss le devuelve al héroe: la Fuerza total lo amortigua.
export function bossHitDamage(totalStr: number, roll: number): number {
  const base = 28 - totalStr * 0.6;
  return Math.max(5, Math.round(base * (0.8 + roll * 0.4)));
}
