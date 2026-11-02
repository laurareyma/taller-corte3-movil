import { Platform } from 'react-native';

export const colors = {
  background: '#0b1120',
  panel: '#111827',
  panelBorder: '#1f2937',
  surface: '#1e293b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  accent: '#a855f7',
  hp: '#ef4444',
  hpHealthy: '#22c55e',
  mana: '#3b82f6',
  gold: '#facc15',
  danger: '#ef4444',
  success: '#22c55e',
  str: '#f97316',
  agi: '#10b981',
  int: '#6366f1',
};

export const monoFont = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
