# ⚔️ HeroForge RPG

Mini-juego en **React Native (Expo)** para demostrar visualmente cómo funciona **Redux Toolkit**: cada acción despachada en una zona de la pantalla provoca reacciones inmediatas en otras zonas independientes, sin pasar props entre ellas.

> Taller práctico — Desarrollo Móvil, Universidad de La Sabana (trabajo individual).

📹 **Video explicativo:** _(agregar enlace)_

---

## Stack

| Herramienta | Versión |
| --- | --- |
| Expo SDK | 58 |
| React Native | 0.88 |
| TypeScript | 6.0 |
| @reduxjs/toolkit | 2.13 |
| react-redux | 9.3 |

## Cómo ejecutarlo

```bash
cd heroforge-rpg
npm install
npx expo start
```

Escanea el código QR con **Expo Go** (Android / iOS) o presiona `a` para abrir el emulador de Android o `i` para el simulador de iOS.

---

## Estructura del proyecto

La UI (`src/components/`) está separada de la lógica de estado (`src/store/`).

```
heroforge-rpg/
├── App.tsx                      ← Provider + las 4 zonas como hermanas
└── src/
    ├── store/
    │   ├── index.ts             ← configureStore + hooks tipados
    │   ├── types.ts             ← StatKey, BuildPreset, Item
    │   ├── selectors.ts         ← estado derivado (createSelector)
    │   ├── combat.ts            ← fórmulas de combate (funciones puras)
    │   └── slices/
    │       ├── statsSlice.ts
    │       ├── inventorySlice.ts
    │       └── actionLogSlice.ts
    └── components/
        ├── HeroAvatarHUD.tsx       ← Zona A
        ├── StatsControlPanel.tsx   ← Zona B
        ├── ArmoryGrid.tsx          ← Zona C
        ├── ReduxLiveInspector.tsx  ← Zona D
        └── ui/                     ← ProgressBar, GameButton, Panel, theme
```

---

## Flujo unidireccional de Redux

```
 ┌──────────────┐  dispatch(action)  ┌──────────────┐
 │ Componente   │ ─────────────────▶ │    Store     │
 │ (Zona B / C) │                    │  + Reducers  │
 └──────────────┘                    └──────┬───────┘
        ▲                                   │ nuevo state
        │ re-render                         ▼
 ┌──────┴───────┐   useAppSelector   ┌──────────────┐
 │ Zonas A,B,C,D│ ◀───────────────── │  Selectores  │
 └──────────────┘                    └──────────────┘
```

**UI → Dispatch(Action) → Reducer → State actualizado → Selector → Re-render visual**

Ejemplo: tocar *Armadura Maldita* despacha `inventory/toggleEquipItem` con payload `"cursed_armor"`. El reducer agrega el id a `equippedIds`, los selectores recalculan peso, sobrecarga, poder y clase, y las 4 zonas se actualizan a la vez.

---

## Las 4 zonas visuales

Son componentes hermanos: **ninguno recibe props**. Todos leen del store con `useAppSelector` y escriben con `dispatch`.

| Zona | Componente | Qué muestra | Relación con el store |
| --- | --- | --- | --- |
| **A** | `HeroAvatarHUD` | Avatar con aura del color de la clase, expresión según la vida, arma equipada, badge de clase, barras de Vida / Maná / Peso, stats totales, Poder y Velocidad | Solo **lee** selectores derivados. No tiene botones |
| **B** | `StatsControlPanel` | Puntos disponibles, controles [−] [+] para STR / AGI / INT, presets y Poción de Reseteo | Despacha a `statsSlice` |
| **C** | `ArmoryGrid` | Cuadrícula de ítems con bonos y peso, borde dorado al equipar, alerta de **¡SOBRECARGADO!** | Despacha a `inventorySlice` |
| **D** | `ReduxLiveInspector` | Combate contra el Boss y consola con las últimas 5 acciones (`type` + `payload`) | Lee poder de combate y `actionLogSlice`; despacha `takeDamage`, `healHero`, `logEvent` |

El HUD (Zona A) queda fijo arriba al hacer scroll, para ver el "efecto dominó" mientras se usan las demás zonas.

---

## Arquitectura del Store

### `statsSlice`

Estado inicial: `{ availablePoints: 15, str: 5, agi: 5, int: 5, currentHp: 100 }`

| Reducer | Payload | Comportamiento |
| --- | --- | --- |
| `incrementStat` | `'str' \| 'agi' \| 'int'` | +1 al atributo, −1 punto (solo si hay puntos) |
| `decrementStat` | `'str' \| 'agi' \| 'int'` | −1 al atributo, +1 punto (mínimo 1) |
| `takeDamage` | `number` | Resta HP sin bajar de 0 |
| `healHero` | — | HP al máximo (100) |
| `applyBuildPreset` / `applyPreset` | `'WARRIOR' \| 'MAGE' \| 'ROGUE' \| 'TANK'` | Reparte todos los puntos en un solo dispatch |
| `resetStats` | — | Atributos al estado inicial (conserva el HP) |

### `inventorySlice`

Catálogo de 7 ítems `{ id, name, icon, category, bonusStr, bonusAgi, bonusInt, weight }` y `equippedIds: string[]`.

| Reducer | Payload | Comportamiento |
| --- | --- | --- |
| `toggleEquipItem` | `string` (id) | Si está equipado lo quita; si no, lo agrega |
| `clearEquipment` / `unequipAll` | — | Vacía el equipamiento |

### `actionLogSlice`

Guarda las últimas 5 acciones para la consola de la Zona D. Usa **`extraReducers` con `builder.addMatcher(isAnyOf(...))`** para escuchar las acciones de los otros slices, así el log se llena solo sin que los componentes despachen nada extra. También tiene `logEvent` para mensajes del combate.

### Immer

Redux Toolkit usa Immer por debajo: en los reducers se escribe código que parece mutar (`state.str += 1`, `state.equippedIds.push(id)`), pero Immer trabaja sobre un borrador y genera un **estado nuevo e inmutable**.

---

## Estado derivado (selectores)

**Regla de oro:** ningún valor calculado se guarda en los slices. Todo se deriva en `src/store/selectors.ts` con `createSelector` (memorizado: solo se recalcula cuando cambian sus entradas).

| Selector | Cálculo |
| --- | --- |
| `selectTotalStats` | Atributos base + bonos de los ítems equipados (mínimo 1) |
| `selectTotalWeight` | Suma del peso de los ítems equipados |
| `selectMaxCarryCapacity` | `10 + (Fuerza Total × 2)` |
| `selectIsOverencumbered` / `selectIsOverloaded` | `peso > capacidad` |
| `selectWeightStatus` | Nivel y color de la barra: verde < 70 %, amarillo ≤ 100 %, rojo si hay sobrecarga |
| `selectCombatPower` | `STR×3 + AGI×2 + INT×3`, con **−30 %** si hay sobrecarga |
| `selectSpeed` | `AGI×10`, con **−50 %** si hay sobrecarga |
| `selectHeroVisualClass` | Clase, emoji y color del aura según la stat dominante |
| `selectHeroCondition` | Sano / herido / derrotado según el HP |
| `selectHeroComputedStatus` | Objeto unificado derivado con todos los cálculos del héroe |

**Clases del héroe** (la stat dominante debe llegar al menos a 12):

| Clase | Condición | Aura |
| --- | --- | --- |
| 🧑‍🌾 Aldeano | Ninguna stat llega a 12 | Gris |
| 🛡️ Tanque Pesado | STR dominante y ≥ 20 Kg equipados | Ámbar |
| 🪓 Guerrero Berserker | STR dominante | Rojo |
| 🧙 Archimago | INT dominante | Azul |
| 🥷 Asesino Sombrío | AGI dominante | Verde |

¿Por qué no guardar `combatPower` en el slice? Porque dependería de dos slices distintos y habría que actualizarlo manualmente en cada reducer que toque stats o inventario. Si alguno se olvida, la UI muestra datos contradictorios. Calculándolo con un selector, siempre es consistente.

---

## Guía rápida para la demo

1. **Sobrecarga:** con las stats iniciales, equipa la **Armadura Maldita** (30 Kg, límite 20 Kg). En un solo toque: la barra de peso pasa a roja, aparece la alerta, bajan Poder y Velocidad y la consola registra la acción.
2. **Preset:** toca **Guerrero** o **Mago**: un solo dispatch cambia barras, clase, color del aura y poder.
3. **Combate:** como Aldeano el héroe pierde contra el Boss; con un preset aplicado gana. Usa **Curar** para recuperar la vida.

---

## Estado local vs. estado global

- **`useState` (local):** datos que solo usa un componente. Ejemplo en este proyecto: el HP del Boss vive dentro de `ReduxLiveInspector`.
- **Redux Toolkit (global):** datos que comparten varias pantallas o componentes. Ejemplo: stats e inventario, que afectan a las 4 zonas a la vez.
