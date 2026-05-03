import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';

export default function OverviewTab({ data }) {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Overview</Text>
      <Text style={{ color: theme.textSecondary }}>Streak: {data.streak} days</Text>
      <Text style={{ color: theme.textSecondary }}>Calories Burned: {data.caloriesBurned} kcal</Text>
      <Text style={{ color: theme.textSecondary }}>Weight Change: {data.weightChange} kg</Text>
      <Text style={{ color: theme.textSecondary }}>Goals Achieved: {data.goalsDone}/{data.goalsTotal}</Text>
    </View>
  );
}