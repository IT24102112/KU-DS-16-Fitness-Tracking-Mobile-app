import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';

export default function WorkoutTab({ data }) {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Workouts</Text>
      <Text style={{ color: theme.textSecondary }}>Total: {data.total || 0}</Text>
      <Text style={{ color: theme.textSecondary }}>Duration: {data.totalDuration || 0} min</Text>
      <Text style={{ color: theme.textSecondary }}>Completion: {data.completionRate || 0}%</Text>
      {(data.topExercises || []).slice(0, 3).map((ex, i) => (
        <Text key={i} style={{ color: theme.textMuted }}>{ex.name} ({ex.count}x)</Text>
      ))}
    </View>
  );
}