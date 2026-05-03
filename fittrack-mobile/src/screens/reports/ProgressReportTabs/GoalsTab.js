import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';

export default function GoalsTab({ data }) {
  const { theme } = useTheme();
  const active = data.totalActiveGoals || 0;
  const achieved = data.achievedGoals || 0;
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Goals</Text>
      <Text style={{ color: theme.textSecondary }}>Active: {active}</Text>
      <Text style={{ color: theme.textSecondary }}>Achieved: {achieved}</Text>
      {(data.goalsList || []).slice(0, 5).map(g => (
        <Text key={g._id} style={{ color: theme.textMuted }}>{g.goalType} – {g.currentValue}/{g.targetValue} ({g.progress}%)</Text>
      ))}
    </View>
  );
}