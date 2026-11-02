import { StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { selectStats, selectTotalStats } from '../store/selectors';
import {
  applyBuildPreset,
  decrementStat,
  incrementStat,
  MIN_STAT,
  resetStats,
} from '../store/slices/statsSlice';
import type { BuildPreset, StatKey } from '../store/types';
import { GameButton } from './ui/GameButton';
import { Panel } from './ui/Panel';
import { ProgressBar } from './ui/ProgressBar';
import { colors } from './ui/theme';

const STAT_ROWS: { key: StatKey; label: string; color: string }[] = [
  { key: 'str', label: '💪 Fuerza (STR)', color: colors.str },
  { key: 'agi', label: '🏹 Agilidad (AGI)', color: colors.agi },
  { key: 'int', label: '🧠 Inteligencia (INT)', color: colors.int },
];

const PRESETS: { preset: BuildPreset; label: string; color: string }[] = [
  { preset: 'WARRIOR', label: '🪓 Guerrero', color: '#b91c1c' },
  { preset: 'MAGE', label: '🧙 Mago', color: '#1d4ed8' },
  { preset: 'ROGUE', label: '🥷 Pícaro', color: '#047857' },
  { preset: 'TANK', label: '🛡️ Tanque', color: '#b45309' },
];

const BAR_MAX = 20; // una stat base no puede pasar de 20 (5 + 15 puntos)

// ZONA B: despacha acciones a statsSlice. No sabe nada de las otras zonas.
export function StatsControlPanel() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectStats);
  const total = useAppSelector(selectTotalStats);

  return (
    <Panel zone="B" title="Panel de Entrenamiento">
      <View style={styles.pointsBox}>
        <Text style={styles.pointsLabel}>Puntos de habilidad disponibles</Text>
        <Text style={[styles.points, stats.availablePoints === 0 && styles.pointsEmpty]}>
          {stats.availablePoints}
        </Text>
      </View>

      {STAT_ROWS.map(({ key, label, color }) => {
        const bonus = total[key] - stats[key];
        return (
          <View key={key} style={styles.statRow}>
            <GameButton
              compact
              label="−"
              color={colors.surface}
              disabled={stats[key] <= MIN_STAT}
              onPress={() => dispatch(decrementStat(key))}
            />
            <View style={styles.statBar}>
              <ProgressBar
                label={label}
                ratio={stats[key] / BAR_MAX}
                color={color}
                valueText={bonus !== 0 ? `${stats[key]} (${bonus > 0 ? '+' : ''}${bonus})` : `${stats[key]}`}
              />
            </View>
            <GameButton
              compact
              label="+"
              color={color}
              disabled={stats.availablePoints <= 0}
              onPress={() => dispatch(incrementStat(key))}
            />
          </View>
        );
      })}

      <Text style={styles.sectionLabel}>Presets rápidos (1 solo dispatch)</Text>
      <View style={styles.presets}>
        {PRESETS.map(({ preset, label, color }) => (
          <GameButton
            key={preset}
            label={label}
            color={color}
            style={styles.presetButton}
            onPress={() => dispatch(applyBuildPreset(preset))}
          />
        ))}
      </View>
      <GameButton label="🧪 Poción de Reseteo" color="#7e22ce" onPress={() => dispatch(resetStats())} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  pointsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  pointsLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  points: { color: colors.gold, fontSize: 26, fontWeight: '900' },
  pointsEmpty: { color: colors.textMuted },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 3 },
  statBar: { flex: 1 },
  sectionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  presetButton: { flexGrow: 1, flexBasis: '45%' },
});
