import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCatalog, selectEquippedIds, selectIsOverencumbered, selectWeightStatus } from '../store/selectors';
import { clearEquipment, toggleEquipItem } from '../store/slices/inventorySlice';
import type { Item } from '../store/types';
import { GameButton } from './ui/GameButton';
import { Panel } from './ui/Panel';
import { colors } from './ui/theme';

// ZONA C: despacha a inventorySlice. El registro en actionLogSlice ocurre solo (extraReducers).
export function ArmoryGrid() {
  const dispatch = useAppDispatch();
  const catalog = useAppSelector(selectCatalog);
  const equippedIds = useAppSelector(selectEquippedIds);
  const isOverencumbered = useAppSelector(selectIsOverencumbered);
  const weight = useAppSelector(selectWeightStatus);

  return (
    <Panel zone="C" title="Armería & Mochila">
      {isOverencumbered ? (
        <View style={styles.alert}>
          <Text style={styles.alertTitle}>⚠️ ¡SOBRECARGADO! (-50% Velocidad)</Text>
          <Text style={styles.alertText}>
            Llevas {weight.current} Kg y tu límite es {weight.max} Kg. El poder de combate baja un 30%.
          </Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        {catalog.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            equipped={equippedIds.includes(item.id)}
            onPress={() => dispatch(toggleEquipItem(item.id))}
          />
        ))}
      </View>

      <GameButton
        label="Desequipar todo"
        color={colors.surface}
        disabled={equippedIds.length === 0}
        onPress={() => dispatch(clearEquipment())}
      />
    </Panel>
  );
}

function ItemCard({ item, equipped, onPress }: { item: Item; equipped: boolean; onPress: () => void }) {
  const strLabel = item.category === 'shield' || item.category === 'armor' ? 'Defensa' : 'Ataque';
  const bonuses = [
    { label: strLabel, value: item.bonusStr, color: colors.str },
    { label: 'Agilidad', value: item.bonusAgi, color: colors.agi },
    { label: 'Magia', value: item.bonusInt, color: colors.int },
  ].filter((b) => b.value !== 0);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, equipped && styles.cardEquipped, pressed && { opacity: 0.75 }]}
    >
      {equipped ? <Text style={styles.equippedTag}>EQUIPADO</Text> : null}
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      {bonuses.map((b) => (
        <Text key={b.label} style={[styles.bonus, { color: b.value > 0 ? b.color : colors.danger }]}>
          {b.value > 0 ? '+' : ''}
          {b.value} {b.label}
        </Text>
      ))}
      <Text style={[styles.weight, item.weight >= 14 && { color: colors.gold }]}>⚖️ {item.weight} Kg</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  alert: {
    backgroundColor: '#450a0a',
    borderColor: colors.danger,
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  alertTitle: { color: '#fecaca', fontWeight: '900', fontSize: 14 },
  alertText: { color: '#fca5a5', fontSize: 12, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  card: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 10,
    marginBottom: 8,
  },
  cardEquipped: {
    borderColor: colors.gold,
    backgroundColor: '#2a2410',
    shadowColor: colors.gold,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  equippedTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
  },
  icon: { fontSize: 30 },
  name: { color: colors.text, fontWeight: '800', fontSize: 13, marginVertical: 4 },
  bonus: { fontSize: 12, fontWeight: '700' },
  weight: { color: colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: '600' },
});
