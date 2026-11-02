import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../store';
import {
  selectCombatPower,
  selectEquippedWeapon,
  selectHeroCondition,
  selectHeroVisualClass,
  selectIsOverencumbered,
  selectMana,
  selectSpeed,
  selectTotalStats,
  selectWeightStatus,
} from '../store/selectors';
import { Panel } from './ui/Panel';
import { ProgressBar } from './ui/ProgressBar';
import { colors } from './ui/theme';

// ZONA A: solo lee el store mediante selectores derivados. No tiene botones.
export function HeroAvatarHUD() {
  const heroClass = useAppSelector(selectHeroVisualClass);
  const condition = useAppSelector(selectHeroCondition);
  const weapon = useAppSelector(selectEquippedWeapon);
  const total = useAppSelector(selectTotalStats);
  const weight = useAppSelector(selectWeightStatus);
  const mana = useAppSelector(selectMana);
  const power = useAppSelector(selectCombatPower);
  const speed = useAppSelector(selectSpeed);
  const isOverencumbered = useAppSelector(selectIsOverencumbered);

  const scale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const previousHp = useRef(condition.hp);

  // "Pulso" del avatar cuando cambia de clase.
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 140, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [heroClass.id, scale]);

  // Sacudida cuando el héroe recibe daño.
  useEffect(() => {
    if (condition.hp < previousHp.current) {
      Animated.sequence(
        [8, -8, 6, -6, 0].map((toValue) =>
          Animated.timing(shake, { toValue, duration: 50, useNativeDriver: true }),
        ),
      ).start();
    }
    previousHp.current = condition.hp;
  }, [condition.hp, shake]);

  const hpColor =
    condition.condition === 'healthy' ? colors.hpHealthy : condition.condition === 'wounded' ? colors.gold : colors.hp;

  return (
    <Panel zone="A" title="Avatar & HUD">
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.avatar,
            {
              borderColor: heroClass.auraColor,
              shadowColor: heroClass.auraColor,
              backgroundColor: heroClass.auraColor + '22',
              opacity: condition.isDefeated ? 0.45 : 1,
              transform: [{ scale }, { translateX: shake }],
            },
          ]}
        >
          <Text style={styles.avatarEmoji}>{condition.isDefeated ? '🪦' : heroClass.emoji}</Text>
          <Text style={styles.expression}>{condition.expression}</Text>
          {weapon ? <Text style={styles.weapon}>{weapon.icon}</Text> : null}
        </Animated.View>

        <View style={styles.info}>
          <View style={[styles.badge, { backgroundColor: heroClass.auraColor }]}>
            <Text style={styles.badgeText}>{heroClass.label.toUpperCase()}</Text>
          </View>
          <ProgressBar
            label="❤️ Vida"
            ratio={condition.ratio}
            color={hpColor}
            valueText={`${condition.hp}/${condition.maxHp}`}
          />
          <ProgressBar label="🔮 Maná" ratio={mana.ratio} color={colors.mana} valueText={`${mana.max}`} />
          <ProgressBar
            label={isOverencumbered ? '⚠️ Peso (SOBRECARGA)' : '🎒 Peso'}
            ratio={weight.ratio}
            color={weight.color}
            valueText={`${weight.current}/${weight.max} Kg`}
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatChip label="STR" value={total.str} color={colors.str} />
        <StatChip label="AGI" value={total.agi} color={colors.agi} />
        <StatChip label="INT" value={total.int} color={colors.int} />
        <StatChip label="⚔️ PODER" value={power} color={isOverencumbered ? colors.danger : colors.gold} />
        <StatChip label="💨 VEL" value={speed} color={isOverencumbered ? colors.danger : colors.text} />
      </View>
    </Panel>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={[styles.chipValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  avatarEmoji: { fontSize: 44 },
  expression: { position: 'absolute', top: -6, right: -6, fontSize: 22 },
  weapon: { position: 'absolute', bottom: -6, right: -8, fontSize: 26 },
  info: { flex: 1 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  chip: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 10, paddingVertical: 5, flex: 1, marginHorizontal: 2 },
  chipLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  chipValue: { fontSize: 16, fontWeight: '900' },
});
