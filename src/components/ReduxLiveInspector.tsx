import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { BOSS_MAX_HP, bossHitDamage, heroHitDamage } from '../store/combat';
import {
  selectCatalog,
  selectCombatPower,
  selectHeroCondition,
  selectIsOverencumbered,
  selectLogEntries,
  selectTotalStats,
} from '../store/selectors';
import { logEvent } from '../store/slices/actionLogSlice';
import { healHero, takeDamage } from '../store/slices/statsSlice';
import { GameButton } from './ui/GameButton';
import { Panel } from './ui/Panel';
import { ProgressBar } from './ui/ProgressBar';
import { colors, monoFont } from './ui/theme';

// ZONA D: arena de combate + consola visual de Redux.
export function ReduxLiveInspector() {
  const dispatch = useAppDispatch();
  const combatPower = useAppSelector(selectCombatPower);
  const total = useAppSelector(selectTotalStats);
  const hero = useAppSelector(selectHeroCondition);
  const isOverencumbered = useAppSelector(selectIsOverencumbered);
  const entries = useAppSelector(selectLogEntries);
  const catalog = useAppSelector(selectCatalog);

  // El HP del Boss es estado LOCAL (useState): solo lo usa este componente.
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const bossDefeated = bossHp <= 0;

  const attack = () => {
    const dealt = heroHitDamage(combatPower, Math.random());
    const newBossHp = Math.max(0, bossHp - dealt);
    setBossHp(newBossHp);
    dispatch(logEvent(newBossHp === 0 ? `¡Boss derrotado! (-${dealt})` : `Golpe al Boss: -${dealt} HP`));

    if (newBossHp > 0) {
      dispatch(takeDamage(bossHitDamage(total.str, Math.random())));
    }
  };

  const newBoss = () => {
    setBossHp(BOSS_MAX_HP);
    dispatch(logEvent('Apareció un nuevo Boss'));
  };

  // Muestra el payload de forma legible; si es el id de un ítem, agrega su nombre.
  const formatPayload = (payload: unknown) => {
    if (payload === undefined) return '∅';
    if (typeof payload === 'string') {
      const item = catalog.find((i) => i.id === payload);
      return item ? `"${payload}" (${item.name})` : `"${payload}"`;
    }
    return JSON.stringify(payload);
  };

  return (
    <Panel zone="D" title="Arena & Inspector Redux">
      <View style={styles.arena}>
        <Text style={[styles.boss, bossDefeated && { opacity: 0.3 }]}>🐉</Text>
        <View style={styles.bossInfo}>
          <Text style={styles.bossName}>Dragón Ancestral</Text>
          <ProgressBar
            label="HP del Boss"
            ratio={bossHp / BOSS_MAX_HP}
            color={colors.danger}
            valueText={`${bossHp}/${BOSS_MAX_HP}`}
          />
          <Text style={[styles.power, isOverencumbered && { color: colors.danger }]}>
            Tu poder: {combatPower} {isOverencumbered ? '(-30% sobrecarga)' : ''}
          </Text>
        </View>
      </View>

      {hero.isDefeated ? <Text style={styles.message}>💀 Has sido derrotado. Cúrate para seguir.</Text> : null}
      {bossDefeated ? <Text style={[styles.message, { color: colors.success }]}>🏆 ¡Victoria!</Text> : null}

      <View style={styles.actions}>
        {bossDefeated ? (
          <GameButton label="🐉 Nuevo Boss" color="#7c2d12" style={styles.flex} onPress={newBoss} />
        ) : (
          <GameButton
            label="⚔️ Atacar al Boss"
            color="#b91c1c"
            style={styles.flex}
            disabled={hero.isDefeated}
            onPress={attack}
          />
        )}
        <GameButton
          label="💚 Curar"
          color="#15803d"
          style={styles.flex}
          disabled={hero.hp === hero.maxHp}
          onPress={() => dispatch(healHero())}
        />
      </View>

      <View style={styles.console}>
        <Text style={styles.consoleTitle}>{'>'} redux-devtools (últimas 5 acciones)</Text>
        {entries.length === 0 ? (
          <Text style={styles.consoleEmpty}>Esperando acciones... toca cualquier control.</Text>
        ) : (
          entries.map((entry, index) => (
            <Text key={entry.seq} style={[styles.consoleLine, index === 0 && styles.consoleLatest]}>
              <Text style={styles.consoleSeq}>#{entry.seq} </Text>
              <Text style={styles.consoleType}>[{entry.type}]</Text>
              <Text> → {formatPayload(entry.payload)}</Text>
            </Text>
          ))
        )}
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  arena: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  boss: { fontSize: 56 },
  bossInfo: { flex: 1 },
  bossName: { color: colors.text, fontWeight: '900', fontSize: 15 },
  power: { color: colors.gold, fontSize: 12, fontWeight: '700', marginTop: 4 },
  message: { color: '#fca5a5', fontWeight: '800', textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  flex: { flex: 1 },
  console: { backgroundColor: '#020617', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#14532d' },
  consoleTitle: { color: '#4ade80', fontFamily: monoFont, fontSize: 11, marginBottom: 6 },
  consoleEmpty: { color: colors.textMuted, fontFamily: monoFont, fontSize: 11 },
  consoleLine: { color: '#cbd5e1', fontFamily: monoFont, fontSize: 11, marginVertical: 2, opacity: 0.7 },
  consoleLatest: { opacity: 1, color: '#fff' },
  consoleSeq: { color: colors.textMuted },
  consoleType: { color: '#c084fc', fontWeight: '700' },
});
