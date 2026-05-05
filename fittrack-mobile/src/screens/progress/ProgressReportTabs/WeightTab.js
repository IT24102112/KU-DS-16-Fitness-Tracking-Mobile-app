import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../../services/ThemeContext';

export default function WeightTab({ data }) {
  const { theme } = useTheme();

  if (!data || !data.entries || data.entries.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No weight data available</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.entries.map((_, i) => {
      if (data.entries.length <= 7) return i + 1;
      if (i % Math.floor(data.entries.length / 5) === 0) {
        return new Date(data.entries[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return '';
    }),
    datasets: [
      {
        data: data.entries.map((e) => e.weight),
        color: () => theme.accent,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: () => theme.textMuted,
    labelColor: () => theme.textMuted,
    style: { borderRadius: 8 },
    propsForDots: { r: '4', fill: theme.accent, strokeWidth: '1', stroke: theme.card },
  };

  const beforeAfterColor = (data.trend || 0) < 0 ? '#10B981' : '#EF4444';

  return (
    <View style={styles.container}>
      {/* Weight Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{ marginLeft: -10 }}
          yAxisInterval={1}
        />
      </View>

      {/* Weight Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.statsTitle, { color: theme.textPrimary }]}>Weight Statistics</Text>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Minimum</Text>
            <Text style={[styles.statValue, { color: theme.accent }]}>{data.minWeight || 0} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Average</Text>
            <Text style={[styles.statValue, { color: theme.accent }]}>{data.avgWeight || 0} kg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Maximum</Text>
            <Text style={[styles.statValue, { color: theme.accent }]}>{data.maxWeight || 0} kg</Text>
          </View>
        </View>

        <View style={[styles.trendBox, { backgroundColor: beforeAfterColor + '15', borderColor: beforeAfterColor }]}>
          <Text style={[styles.trendLabel, { color: theme.textMuted }]}>Weight Trend</Text>
          <Text style={[styles.trendValue, { color: beforeAfterColor }]}>
            {(data.trend || 0) > 0 ? '+' : ''}{(data.trend || 0).toFixed(1)} kg
          </Text>
          <Text style={[styles.trendPercent, { color: beforeAfterColor }]}>
            {(data.trend || 0) < 0 ? '↓ Losing' : '↑ Gaining'} weight
          </Text>
        </View>
      </View>

      {/* Body Measurements */}
      {data.entries.length > 0 && (data.entries[0].chest || data.entries[0].waist || data.entries[0].hips) && (
        <View style={[styles.measurementsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.measurementsTitle, { color: theme.textPrimary }]}>Body Measurements</Text>

          {data.entries[0].chest && (
            <View style={styles.measurementRow}>
              <Text style={[styles.measurementLabel, { color: theme.textMuted }]}>Chest</Text>
              <Text style={[styles.measurementValue, { color: theme.accent }]}>
                {data.entries[0].chest} cm → {data.entries[data.entries.length - 1].chest} cm
              </Text>
            </View>
          )}

          {data.entries[0].waist && (
            <View style={styles.measurementRow}>
              <Text style={[styles.measurementLabel, { color: theme.textMuted }]}>Waist</Text>
              <Text style={[styles.measurementValue, { color: theme.accent }]}>
                {data.entries[0].waist} cm → {data.entries[data.entries.length - 1].waist} cm
              </Text>
            </View>
          )}

          {data.entries[0].hips && (
            <View style={styles.measurementRow}>
              <Text style={[styles.measurementLabel, { color: theme.textMuted }]}>Hips</Text>
              <Text style={[styles.measurementValue, { color: theme.accent }]}>
                {data.entries[0].hips} cm → {data.entries[data.entries.length - 1].hips} cm
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  emptyContainer: {
    paddingVertical: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  chartContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  statsContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  trendBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  trendPercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  measurementsContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  measurementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  measurementLabel: {
    fontSize: 13,
  },
  measurementValue: {
    fontSize: 13,
    fontWeight: '500',
  },
});
