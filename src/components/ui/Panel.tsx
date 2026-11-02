import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

interface Props {
  zone: string; // "A", "B", "C", "D"
  title: string;
  children: ReactNode;
}

export function Panel({ zone, title, children }: Props) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>
        <Text style={styles.zone}>ZONA {zone} · </Text>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.panelBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  zone: { color: colors.accent, fontSize: 12 },
});
