import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const STATUS_COLORS = { planned: '#6366F1', in_progress: '#F59E0B', completed: '#10B981', skipped: '#EF4444' };

export default function WorkoutDetailScreen({ route, navigation }) {
  const { workoutId } = route.params;
  const { theme } = useTheme();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await apiRequest(`/workouts/${workoutId}`); setWorkout(res.data); }
      catch (e) { Alert.alert('Error', e.message); }
      finally { setLoading(false); }
    };
    fetch();
  }, [workoutId]);

  const markComplete = async () => {
    try { const res = await apiRequest(`/workouts/${workoutId}/complete`, 'PATCH'); setWorkout(res.data); Alert.alert('🎉 Great job!', 'Workout completed!'); }
    catch (e) { Alert.alert('Error', e.message); }
  };

  if (loading) return <ActivityIndicator size="large" color={theme.accent} style={{ flex: 1, backgroundColor: theme.bg }} />;
  if (!workout) return <View style={[styles.container, { backgroundColor: theme.bg }]}><Text style={{ color: theme.textPrimary }}>Workout not found</Text></View>;

  const color = STATUS_COLORS[workout.status] || '#6366F1';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.hero, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.heroNav}>
          <BackToHomeButton />
          <BackToHomeButton goHome />
          <ThemeToggleButton />
        </View>
        <Text style={[styles.heroCategory, { color: theme.accent }]}>{workout.category.toUpperCase()}</Text>
        <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>{workout.title}</Text>
        <View style={[styles.statusPill, { backgroundColor: color + '22' }]}>
          <Text style={[styles.statusText, { color }]}>{workout.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[['⏱️', `${workout.durationMinutes} min`, 'Duration'], ['🔥', `${workout.caloriesBurned || 0}`, 'Calories'], ['💪', workout.difficulty, 'Level']].map(([icon, val, lbl]) => (
          <View key={lbl} style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{val}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{lbl}</Text>
          </View>
        ))}
      </View>

      {workout.description ? (
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>📝 Description</Text>
          <Text style={[styles.descText, { color: theme.textSecondary }]}>{workout.description}</Text>
        </View>
      ) : null}

      {workout.exercises?.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>🏋️ Exercises ({workout.exercises.length})</Text>
          {workout.exercises.map((ex, i) => (
            <View key={i} style={[styles.exerciseCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <Text style={[styles.exerciseName, { color: theme.textPrimary }]}>{ex.name}</Text>
              <Text style={[styles.exerciseMeta, { color: theme.accent }]}>
                {ex.sets && `${ex.sets} sets`}{ex.reps && ` × ${ex.reps} reps`}
                {ex.durationSeconds && ` • ${ex.durationSeconds}s`}{ex.restSeconds && ` • ${ex.restSeconds}s rest`}
              </Text>
              {ex.notes ? <Text style={[styles.exerciseNotes, { color: theme.textMuted }]}>📌 {ex.notes}</Text> : null}
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        {workout.status !== 'completed' && (
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: theme.accent }]} onPress={markComplete}>
            <Text style={styles.completeBtnText}>✅ Mark as Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('WorkoutForm', { workout })}
        >
          <Text style={[styles.editBtnText, { color: theme.textSecondary }]}>✏️ Edit Workout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 20, paddingTop: 52, borderBottomWidth: 1 },
  heroNav: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  heroCategory: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  heroTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '700', textTransform: 'capitalize' },
  statLabel: { fontSize: 11, marginTop: 2 },
  section: { borderRadius: 14, margin: 16, marginTop: 0, padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  descText: { fontSize: 14, lineHeight: 22 },
  exerciseCard: { borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1 },
  exerciseName: { fontSize: 14, fontWeight: '600' },
  exerciseMeta: { fontSize: 12, marginTop: 4 },
  exerciseNotes: { fontSize: 11, marginTop: 4 },
  actions: { padding: 16, gap: 10, marginBottom: 40 },
  completeBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  editBtn: { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  editBtnText: { fontSize: 15 },
});
