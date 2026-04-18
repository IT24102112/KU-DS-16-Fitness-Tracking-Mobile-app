import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const STATUS_COLORS = { planned: '#6366F1', in_progress: '#F59E0B', completed: '#10B981', skipped: '#EF4444' };

export default function AdminWorkoutDetailScreen({ route, navigation }) {
  const { workout } = route.params;
  const { theme } = useTheme();
  const color = STATUS_COLORS[workout.status] || '#6366F1';

  const handleDelete = () =>
    Alert.alert(`Delete "${workout.title}"?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiRequest(`/auth/admin/workouts/${workout._id}`, 'DELETE'); navigation.goBack(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);

  const s = (base) => ({ ...base });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.card, padding: 20, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: theme.admin, fontWeight: '700', fontSize: 15 }}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <Text style={{ color: theme.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 5 }}>{workout.category?.toUpperCase()}</Text>
        <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '900', marginBottom: 6 }}>{workout.title}</Text>
        <Text style={{ color: theme.blue, fontSize: 12, marginBottom: 10 }}>👤 {workout.user?.name || 'Unknown'}  —  {workout.user?.email || ''}</Text>
        <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: color + '22' }}>
          <Text style={{ color, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{workout.status?.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', padding: 14, gap: 10 }}>
        {[['⏱️', `${workout.durationMinutes} min`, 'Duration'], ['🔥', `${workout.caloriesBurned || 0}`, 'Calories'], ['💪', workout.difficulty, 'Level']].map(([icon, val, lbl]) => (
          <View key={lbl} style={{ flex: 1, backgroundColor: theme.card, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
            <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '700', textTransform: 'capitalize' }}>{val}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 2 }}>{lbl}</Text>
          </View>
        ))}
      </View>

      {workout.description ? (
        <View style={{ backgroundColor: theme.card, borderRadius: 14, margin: 14, marginTop: 0, padding: 14, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>📝 Description</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 21 }}>{workout.description}</Text>
        </View>
      ) : null}

      {workout.exercises?.length > 0 && (
        <View style={{ backgroundColor: theme.card, borderRadius: 14, margin: 14, marginTop: 0, padding: 14, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 10 }}>🏋️ Exercises ({workout.exercises.length})</Text>
          {workout.exercises.map((ex, i) => (
            <View key={i} style={{ backgroundColor: theme.bg, borderRadius: 9, padding: 11, marginBottom: 7, borderWidth: 1, borderColor: theme.border }}>
              <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '600' }}>{ex.name}</Text>
              <Text style={{ color: theme.accent, fontSize: 11, marginTop: 3 }}>
                {ex.sets && `${ex.sets} sets`}{ex.reps && ` × ${ex.reps} reps`}{ex.durationSeconds && ` • ${ex.durationSeconds}s`}{ex.restSeconds && ` • ${ex.restSeconds}s rest`}
              </Text>
              {ex.notes ? <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 3 }}>📌 {ex.notes}</Text> : null}
            </View>
          ))}
        </View>
      )}

      <View style={{ padding: 14, marginBottom: 40 }}>
        <TouchableOpacity style={{ backgroundColor: theme.danger, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.dangerBorder }} onPress={handleDelete}>
          <Text style={{ color: theme.dangerText, fontSize: 14, fontWeight: '700' }}>🗑️  Delete This Workout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
