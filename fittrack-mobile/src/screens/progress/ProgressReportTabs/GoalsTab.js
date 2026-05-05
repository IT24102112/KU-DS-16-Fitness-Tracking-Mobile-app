import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';

function GoalCard({ goal, status, theme }) {
  const statusColor = {
    'In Progress': '#F59E0B',
    'Achieved': '#10B981',
    'Failed': '#EF4444',
  }[status] || theme.accent;

  const progress = Math.max(0, Math.min(100, goal.progress || 0));

  return (
    <View style={[styles.goalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.goalHeader}>
        <View style={styles.goalInfo}>
          <Text style={[styles.goalType, { color: theme.textPrimary }]}>{goal.goalType || 'Goal'}</Text>
          <Text style={[styles.goalStatus, { color: statusColor }]}>{status}</Text>
        </View>
        <View style={styles.goalProgress}>
          <Text style={[styles.progressPercent, { color: statusColor }]}>{Math.round(progress)}%</Text>
        </View>
      </View>

      <View style={styles.goalProgressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: statusColor,
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      <View style={styles.goalDetails}>
        <View style={styles.goalDetail}>
          <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Target</Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
            {goal.targetValue || 0}
          </Text>
        </View>
        <View style={styles.goalDetail}>
          <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Current</Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
            {goal.currentValue || 0}
          </Text>
        </View>
        <View style={styles.goalDetail}>
          <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Days Left</Text>
          <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
            {goal.daysRemaining || 0}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function GoalsTab({ data }) {
  const { theme } = useTheme();

  if (!data) {
    return null;
  }

  // Safely check if arrays exist and have items
  const activeGoals = Array.isArray(data.active) ? data.active : [];
  const completedGoals = Array.isArray(data.completed) ? data.completed : [];
  const hasActiveGoals = activeGoals.length > 0;
  const hasCompletedGoals = completedGoals.length > 0;
  const hasAnyGoals = hasActiveGoals || hasCompletedGoals;

  return (
    <View style={styles.container}>
      {/* Goal Statistics */}
      <View style={[styles.statsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.statsTitle, { color: theme.textPrimary }]}>Goal Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: theme.accent }]}>{data.stats?.total || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Goals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{data.stats?.achieved || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Achieved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{data.stats?.onTrack || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>On Track</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{data.stats?.offTrack || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Off Track</Text>
          </View>
        </View>
      </View>

      {/* Active Goals */}
      {hasActiveGoals && (
        <View style={[styles.goalsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Active Goals</Text>
          {activeGoals.map((goal, index) => (
            <GoalCard key={`active-${index}`} goal={goal} status={goal.status || 'In Progress'} theme={theme} />
          ))}
        </View>
      )}

      {/* Completed Goals */}
      {hasCompletedGoals && (
        <View style={[styles.goalsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Achieved Goals</Text>
          {completedGoals.map((goal, index) => (
            <GoalCard key={`completed-${index}`} goal={goal} status="Achieved" theme={theme} />
          ))}
        </View>
      )}

      {!hasAnyGoals && (
        <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No goals recorded</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  statsContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  goalsSection: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  goalCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  goalInfo: {
    flex: 1,
  },
  goalType: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalStatus: {
    fontSize: 11,
    fontWeight: '500',
  },
  goalProgress: {
    alignItems: 'flex-end',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  goalDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
