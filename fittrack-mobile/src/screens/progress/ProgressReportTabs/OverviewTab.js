import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';

function StatCard({ icon, value, label, color, subtext, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      {subtext && <Text style={[styles.statSubtext, { color: theme.textMuted }]}>{subtext}</Text>}
    </View>
  );
}

export default function OverviewTab({ data }) {
  const { theme } = useTheme();

  if (!data) return null;

  const streakColor = data.streak > 7 ? '#10B981' : '#F59E0B';
  const weightChangeColor = data.weightChange < 0 ? '#10B981' : '#EF4444';

  return (
    <View style={styles.container}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="🔥"
          value={data.streak || 0}
          label="Activity Days"
          color="#F59E0B"
          subtext="days in period"
          theme={theme}
        />
        <StatCard
          icon="💪"
          value={(data.caloriesBurned || 0).toLocaleString()}
          label="Total Calories"
          color="#10B981"
          subtext="kcal this period"
          theme={theme}
        />
        <StatCard
          icon="⚖️"
          value={`${data.weightChange > 0 ? '+' : ''}${(data.weightChange || 0).toFixed(1)} kg`}
          label="Weight Change"
          color={weightChangeColor}
          subtext={`${data.weightChangePercent > 0 ? '+' : ''}${(data.weightChangePercent || 0).toFixed(1)}%`}
          theme={theme}
        />
        <StatCard
          icon="🎯"
          value={`${data.goalsDone || 0}/${data.goalsTotal || 0}`}
          label="Goals Done"
          color="#8B5CF6"
          subtext={data.goalsTotal > 0 ? `${Math.round(((data.goalsDone || 0) / data.goalsTotal) * 100)}% complete` : 'No goals'}
          theme={theme}
        />
      </View>

      {/* Nutrition Summary */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Nutrition Summary</Text>
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Calories</Text>
            <Text style={[styles.summaryValue, { color: theme.accent }]}>{(data.caloriesBurned || 0).toLocaleString()}</Text>
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Daily Avg</Text>
            <Text style={[styles.summaryValue, { color: theme.accent }]}>{Math.round((data.caloriesBurned || 0) / 30)} kcal</Text>
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Weight Change</Text>
            <Text style={[styles.summaryValue, { color: weightChangeColor }]}>{(data.weightChange || 0).toFixed(1)} kg</Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
