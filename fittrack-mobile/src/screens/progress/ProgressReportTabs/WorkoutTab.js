import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../../services/ThemeContext';

export default function WorkoutTab({ data, navigation }) {
  const { theme } = useTheme();

  if (!data) return null;

  // Prepare pie chart data for workout split with fallbacks
  const splitData = [
    { name: 'Strength', value: Math.max(data.split?.strength || 1, 1), color: '#6366F1', legendFontColor: theme.textMuted, legendFontSize: 12 },
    { name: 'Cardio', value: Math.max(data.split?.cardio || 1, 1), color: '#F59E0B', legendFontColor: theme.textMuted, legendFontSize: 12 },
    { name: 'Flexibility', value: Math.max(data.split?.flexibility || 1, 1), color: '#10B981', legendFontColor: theme.textMuted, legendFontSize: 12 },
    { name: 'HIIT', value: Math.max(data.split?.hiit || 1, 1), color: '#EF4444', legendFontColor: theme.textMuted, legendFontSize: 12 },
    { name: 'Yoga', value: Math.max(data.split?.yoga || 1, 1), color: '#8B5CF6', legendFontColor: theme.textMuted, legendFontSize: 12 },
  ];

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: () => theme.textMuted,
    labelColor: () => theme.textMuted,
  };

  const STATUS_COLORS = { planned: '#6366F1', in_progress: '#F59E0B', completed: '#10B981', skipped: '#EF4444' };

  const workoutsList = Array.isArray(data.workoutsList) ? data.workoutsList : [];

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Workouts</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>{data.total || 0}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Duration</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>{data.totalDuration || 0} min</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Completion</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>{data.completionRate || 0}%</Text>
        </View>
      </View>

      {/* Workout Split Chart */}
      {data.total > 0 && (
        <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Workout Split</Text>
          <PieChart
            data={splitData}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="0"
            center={[10, 10]}
          />
        </View>
      )}

      {/* Top Exercises */}
      {data.topExercises && data.topExercises.length > 0 ? (
        <View style={[styles.exercisesContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.exercisesTitle, { color: theme.textPrimary }]}>Recent Exercises</Text>
          {data.topExercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, { color: theme.textPrimary }]}>{exercise.name || 'Unknown'}</Text>
                <Text style={[styles.exerciseMuscle, { color: theme.textMuted }]}>{exercise.muscleGroup || 'N/A'}</Text>
              </View>
              <View style={styles.exerciseStats}>
                <Text style={[styles.exerciseCount, { color: theme.accent }]}>×{exercise.count || 0}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.exercisesContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No exercises recorded</Text>
        </View>
      )}

      {/* Workouts List (show all logged workouts) */}
      <View style={[styles.workoutsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.workoutsTitle, { color: theme.textPrimary }]}>Your Workouts</Text>
        {workoutsList.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No workouts created yet</Text>
        ) : (
          workoutsList.map((w) => (
            <TouchableOpacity
              key={w._id}
              style={styles.workoutItem}
              onPress={() => navigation?.navigate('WorkoutDetail', { workoutId: w._id })}
            >
              <View style={[styles.workoutBadge, { backgroundColor: (STATUS_COLORS[w.status] || '#6366F1') + '22' }]}>
                <Text style={{ fontSize: 18 }}>
                  {w.status === 'completed' ? '✅' : w.status === 'in_progress' ? '⚡' : '📅'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.workoutTitle, { color: theme.textPrimary }]}>{w.title}</Text>
                <Text style={[styles.workoutMeta, { color: theme.textMuted }]}>{w.durationMinutes} min  •  {w.category}</Text>
              </View>
              <View style={[styles.workoutDot, { backgroundColor: STATUS_COLORS[w.status] || '#6366F1' }]} />
            </TouchableOpacity>
          ))
        )}
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
    fontSize: 18,
    fontWeight: '700',
  },
  chartContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  exercisesContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  exercisesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseMuscle: {
    fontSize: 11,
  },
  exerciseStats: {
    alignItems: 'flex-end',
  },
  exerciseCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  exerciseRecord: {
    fontSize: 11,
    marginTop: 2,
  },
  breakdownContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  breakdownName: {
    fontSize: 12,
  },
  breakdownBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownProgress: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownPercent: {
    fontSize: 12,
    width: 35,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  workoutsContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  workoutsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  workoutItem: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  workoutBadge: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  workoutTitle: { fontSize: 14, fontWeight: '700' },
  workoutMeta: { fontSize: 11, marginTop: 3, textTransform: 'capitalize' },
  workoutDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
});
