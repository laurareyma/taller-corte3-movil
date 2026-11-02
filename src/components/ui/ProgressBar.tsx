import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

interface Props {
  label: string;
  ratio: number; // 0..1
  color: string;
  valueText?: string;
  height?: number;
}

// Barra que se anima cada vez que cambia el ratio (así se "ve" el re-render).
export function ProgressBar({ label, ratio, color, valueText, height = 12 }: Props) {
  const progress = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: Math.max(0, Math.min(1, ratio)),
      duration: 350,
      useNativeDriver: false, // width no se puede animar con el driver nativo
    }).start();
  }, [ratio, progress]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {valueText ? <Text style={[styles.value, { color }]}>{valueText}</Text> : null}
      </View>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color, borderRadius: height / 2 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  value: { fontSize: 11, fontWeight: '700' },
  track: { backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: '100%' },
});
