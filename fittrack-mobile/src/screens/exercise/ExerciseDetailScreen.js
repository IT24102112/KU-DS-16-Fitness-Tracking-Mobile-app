import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import { useAuth } from '../../services/AuthContext';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { EquipmentImage, MUSCLE_ICONS, EQUIP_COLORS_EXPORT } from '../../components/EquipmentImage';

const DIFFICULTY_COLORS = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

export default function ExerciseDetailScreen({ route, navigation }) {
  const { exerciseId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await apiRequest(`/exercises/${exerciseId}`); setExercise(res.data); }
      catch (e) { Alert.alert('Error', e.message); }
      finally { setLoading(false); }
    };
    fetch();
  }, [exerciseId]);

  const handleDelete = () =>
    Alert.alert(`Delete "${exercise?.name}"?`, 'This exercise will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiRequest(`/exercises/${exerciseId}`, 'DELETE'); navigation.goBack(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);

  if (loading) return <ActivityIndicator size="large" color={theme.accent} style={{ flex: 1, backgroundColor: theme.bg }} />;
  if (!exercise) return <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: theme.textPrimary }}>Exercise not found</Text></View>;

  const equipColors = EQUIP_COLORS_EXPORT[exercise.equipment] || EQUIP_COLORS_EXPORT.other;
  const canEdit = isAdmin || exercise.createdBy?._id === user?._id || exercise.createdBy === user?._id;
  const diffColor = DIFFICULTY_COLORS[exercise.difficulty] || '#10B981';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.heroNav}>
          <BackToHomeButton />
          <BackToHomeButton goHome={!isAdmin} adminHome={isAdmin} />
          <ThemeToggleButton />
        </View>

        {/* Large equipment illustration */}
        <View style={styles.heroImageWrap}>
          <EquipmentImage equipment={exercise.equipment} size={100} />
          {exercise.isGlobal && (
            <View style={[styles.globalBadge, { backgroundColor: theme.accentLight }]}>
              <Text style={[styles.globalBadgeText, { color: theme.accent }]}>⭐ Global Exercise</Text>
            </View>
          )}
        </View>

        <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>{exercise.name}</Text>
        <Text style={[styles.heroMuscle, { color: equipColors.accent }]}>
          {MUSCLE_ICONS[exercise.muscleGroup]} {exercise.muscleGroup}
        </Text>

        <View style={styles.heroBadges}>
          <View style={[styles.badge, { backgroundColor: diffColor + '22' }]}>
            <Text style={[styles.badgeText, { color: diffColor }]}>{exercise.difficulty}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 }]}>
            <Text style={[styles.badgeText, { color: theme.textMuted }]}>{exercise.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: equipColors.bg }]}>
            <Text style={[styles.badgeText, { color: equipColors.accent }]}>{exercise.equipment}</Text>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {exercise.defaultSets && (
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.statIcon}>🔢</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{exercise.defaultSets}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Sets</Text>
          </View>
        )}
        {exercise.defaultReps && (
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.statIcon}>🔄</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{exercise.defaultReps}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Reps</Text>
          </View>
        )}
        {exercise.defaultDurationSeconds && (
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{exercise.defaultDurationSeconds}s</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Duration</Text>
          </View>
        )}
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{exercise.caloriesPerMinute}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cal/min</Text>
        </View>
      </View>

      {/* Description */}
      {exercise.description ? (
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>📋 About</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>{exercise.description}</Text>
        </View>
      ) : null}

      {/* Instructions */}
      {exercise.instructions ? (
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>📖 How to perform</Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>{exercise.instructions}</Text>
        </View>
      ) : null}

      {/* Use in Workout CTA */}
      <View style={[styles.section, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>💪 Use in a Workout</Text>
        <Text style={[styles.sectionText, { color: theme.accent, opacity: 0.8 }]}>
          Go to Workouts → create or edit a workout → tap "+ Add" to pick this exercise from the library.
        </Text>
      </View>

      {/* Actions */}
      {canEdit && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: theme.accent }]}
            onPress={() => navigation.navigate('ExerciseForm', { exercise })}
          >
            <Text style={styles.editBtnText}>✏️  Edit Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
            onPress={handleDelete}
          >
            <Text style={[styles.deleteBtnText, { color: theme.dangerText }]}>🗑️  Delete Exercise</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 20, paddingTop: 52, borderBottomWidth: 1 },
  heroNav: { flexDirection: 'row', gap: 8, marginBottom: 20, alignItems: 'center' },
  heroImageWrap: { alignItems: 'center', marginBottom: 16, gap: 10 },
  globalBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  globalBadgeText: { fontSize: 11, fontWeight: '800' },
  heroTitle: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  heroMuscle: { fontSize: 14, textAlign: 'center', textTransform: 'capitalize', fontWeight: '700', marginBottom: 12 },
  heroBadges: { flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2 },
  section: { borderRadius: 14, margin: 16, marginTop: 0, padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  sectionText: { fontSize: 14, lineHeight: 22 },
  actions: { padding: 16, gap: 10, marginBottom: 40 },
  editBtn: { borderRadius: 14, padding: 15, alignItems: 'center' },
  editBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  deleteBtn: { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  deleteBtnText: { fontSize: 15, fontWeight: '600' },
});
