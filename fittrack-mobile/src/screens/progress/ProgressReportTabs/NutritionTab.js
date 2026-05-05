import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../../services/ThemeContext';

export default function NutritionTab({ data }) {
  const { theme } = useTheme();

  if (!data) return null;

  // Prepare calorie chart data
  const calorieChartData = {
    labels: data.calorieEntries
      ? data.calorieEntries.map((_, i) => {
          if (data.calorieEntries.length <= 7) return i + 1;
          if (i % Math.floor(data.calorieEntries.length / 5) === 0) {
            return new Date(data.calorieEntries[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          return '';
        })
      : [],
    datasets: [
      {
        data: data.calorieEntries ? data.calorieEntries.map((e) => e.totalCalories) : [0],
        color: () => theme.accent,
        strokeWidth: 2,
      },
    ],
  };

  // Prepare macro pie chart with fallbacks
  const totalMacros = (data.macros?.totalProtein || 0) + (data.macros?.totalCarbs || 0) + (data.macros?.totalFat || 0);
  const macroData = [
    {
      name: 'Protein',
      value: Math.max(data.macros?.totalProtein || 1, 1), // Ensure minimum value for pie chart
      color: '#EF4444',
      legendFontColor: theme.textMuted,
      legendFontSize: 12,
    },
    {
      name: 'Carbs',
      value: Math.max(data.macros?.totalCarbs || 1, 1),
      color: '#F59E0B',
      legendFontColor: theme.textMuted,
      legendFontSize: 12,
    },
    {
      name: 'Fat',
      value: Math.max(data.macros?.totalFat || 1, 1),
      color: '#10B981',
      legendFontColor: theme.textMuted,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: () => theme.textMuted,
    labelColor: () => theme.textMuted,
    style: { borderRadius: 8 },
    propsForDots: { r: '4', fill: theme.accent, strokeWidth: '1', stroke: theme.card },
  };

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Calories</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>
            {(data.totalCalories || 0).toLocaleString()}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Daily Avg</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>{(data.dailyAvg || 0).toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Meals</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>
            {(data.mealFrequency?.breakfast || 0) +
              (data.mealFrequency?.lunch || 0) +
              (data.mealFrequency?.dinner || 0) +
              (data.mealFrequency?.snack || 0)}
          </Text>
        </View>
      </View>

      {/* Macro Distribution */}
      {totalMacros > 0 && (
        <View style={[styles.macroContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.macroTitle, { color: theme.textPrimary }]}>Macro Distribution</Text>
          <PieChart
            data={macroData}
            width={Dimensions.get('window').width - 32}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="0"
            center={[10, 10]}
          />
          <View style={styles.macroStats}>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: '#EF4444' }]} />
              <View>
                <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Protein</Text>
                <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
                  {(data.macros?.totalProtein || 0).toFixed(1)}g
                </Text>
              </View>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: '#F59E0B' }]} />
              <View>
                <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Carbs</Text>
                <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
                  {(data.macros?.totalCarbs || 0).toFixed(1)}g
                </Text>
              </View>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: '#10B981' }]} />
              <View>
                <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Fat</Text>
                <Text style={[styles.macroValue, { color: theme.textPrimary }]}>
                  {(data.macros?.totalFat || 0).toFixed(1)}g
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Meal Breakdown */}
      <View style={[styles.mealContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.mealTitle, { color: theme.textPrimary }]}>Meal Breakdown</Text>
        <View style={styles.mealGrid}>
          <View style={styles.mealItem}>
            <Text style={[styles.mealLabel, { color: theme.textMuted }]}>Breakfast</Text>
            <Text style={[styles.mealValue, { color: theme.accent }]}>{data.mealFrequency?.breakfast || 0}</Text>
          </View>
          <View style={styles.mealItem}>
            <Text style={[styles.mealLabel, { color: theme.textMuted }]}>Lunch</Text>
            <Text style={[styles.mealValue, { color: theme.accent }]}>{data.mealFrequency?.lunch || 0}</Text>
          </View>
          <View style={styles.mealItem}>
            <Text style={[styles.mealLabel, { color: theme.textMuted }]}>Dinner</Text>
            <Text style={[styles.mealValue, { color: theme.accent }]}>{data.mealFrequency?.dinner || 0}</Text>
          </View>
          <View style={styles.mealItem}>
            <Text style={[styles.mealLabel, { color: theme.textMuted }]}>Snacks</Text>
            <Text style={[styles.mealValue, { color: theme.accent }]}>{data.mealFrequency?.snack || 0}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  chartContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  macroContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  macroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  macroLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  mealContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  mealGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealItem: {
    flex: 1,
    alignItems: 'center',
  },
  mealLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  mealValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
});
