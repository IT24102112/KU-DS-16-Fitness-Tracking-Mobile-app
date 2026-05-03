import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';

export default function NutritionTab({ data }) {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Nutrition</Text>
      <Text style={{ color: theme.textSecondary }}>Total Calories: {data.totalCalories || 0} kcal</Text>
      <Text style={{ color: theme.textSecondary }}>Daily Average: {data.dailyAvg || 0} kcal</Text>
      <Text style={{ color: theme.textSecondary }}>Protein: {data.macros?.totalProtein || 0}g</Text>
      <Text style={{ color: theme.textSecondary }}>Carbs: {data.macros?.totalCarbs || 0}g</Text>
      <Text style={{ color: theme.textSecondary }}>Fat: {data.macros?.totalFat || 0}g</Text>
    </View>
  );
}