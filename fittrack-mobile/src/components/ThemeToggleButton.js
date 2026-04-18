import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../services/ThemeContext';

export default function ThemeToggleButton({ style }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.btn,
        isDark ? styles.darkBtn : styles.lightBtn,
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
      <Text style={[styles.label, { color: isDark ? '#FCD34D' : '#475569' }]}>
        {isDark ? 'Light' : 'Dark'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  darkBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  lightBtn: {
    backgroundColor: '#FEF9EE',
    borderColor: '#FDE68A',
  },
  icon: { fontSize: 14 },
  label: { fontSize: 12, fontWeight: '700' },
});
