import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';

export default function WeightTab({ data }) {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Weight</Text>
      <Text style={{ color: theme.textSecondary }}>Average: {data.averageWeight || 0} kg</Text>
      <Text style={{ color: theme.textSecondary }}>Best: {data.bestWeight || 0} kg</Text>
      <Text style={{ color: theme.textSecondary }}>Change: {data.totalChange || 0} kg</Text>
    </View>
  );
}