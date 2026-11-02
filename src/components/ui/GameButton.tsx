import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from './theme';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export function GameButton({ label, onPress, color = colors.accent, disabled, style, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        { backgroundColor: color, opacity: disabled ? 0.35 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Text style={[styles.label, compact && styles.compactLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
  compact: { paddingVertical: 4, paddingHorizontal: 0, width: 34, borderRadius: 8 },
  label: { color: colors.text, fontWeight: '800', fontSize: 13 },
  compactLabel: { fontSize: 18 },
});
