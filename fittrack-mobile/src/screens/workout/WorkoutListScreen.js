import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const STATUS_COLORS = { planned: '#6366F1', in_progress: '#F59E0B', completed: '#10B981', skipped: '#EF4444' };
const CATEGORY_ICONS = { strength: '🏋️', cardio: '🏃', flexibility: '🧘', hiit: '⚡', yoga: '🌿', sports: '⚽', custom: '✨' };

export default function WorkoutListScreen({ navigation }) {
  const { theme } = useTheme();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchWorkouts = useCallback(async () => {
    try {
      const query = filter !== 'all' ? `?status=${filter}` : '';
      const res = await apiRequest(`/workouts${query}`);
      setWorkouts(res.data);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useFocusEffect(useCallback(() => { fetchWorkouts(); }, [fetchWorkouts]));

  const handleDelete = (id) =>
    Alert.alert('Delete Workout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiRequest(`/workouts/${id}`, 'DELETE'); setWorkouts(p => p.filter(w => w._id !== id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);

  const renderWorkout = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item._id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{CATEGORY_ICONS[item.category] || '✨'}</Text>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.cardMeta, { color: theme.textMuted }]}>{item.durationMinutes} min  •  {item.category}  •  {item.difficulty}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
      {item.exercises?.length > 0 && <Text style={[styles.exCount, { color: theme.accentText }]}>{item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}</Text>}
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme.blueLight }]} onPress={() => navigation.navigate('WorkoutForm', { workout: item })}>
          <Text style={[styles.editBtnText, { color: theme.blueText }]}>✏️ Edit</Text>
        </TouchableOpacity>
        {item.status !== 'completed' && (
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: theme.accentLight }]} onPress={async () => {
            try { await apiRequest(`/workouts/${item._id}/complete`, 'PATCH'); fetchWorkouts(); }
            catch (e) { Alert.alert('Error', e.message); }
          }}>
            <Text style={[styles.completeBtnText, { color: theme.accent }]}>✅ Done</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.danger }]} onPress={() => handleDelete(item._id)}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.topBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <BackToHomeButton goHome />
        <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>💪 My Workouts</Text>
        <View style={styles.topBarRight}>
          <ThemeToggleButton />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={() => navigation.navigate('WorkoutForm', {})}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.filterRow, { backgroundColor: theme.headerBg }]}>
        {['all', 'planned', 'in_progress', 'completed'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[styles.filterBtn, { backgroundColor: theme.card, borderColor: theme.border },
              filter === f && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
            <Text style={[styles.filterText, { color: filter === f ? '#fff' : theme.textMuted }]}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 60 }} /> : (
        <FlatList
          data={workouts}
          keyExtractor={item => item._id}
          renderItem={renderWorkout}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWorkouts(); }} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No workouts found</Text>
              <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>Tap "+ Add" to create your first workout</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 52, borderBottomWidth: 1 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  screenTitle: { fontSize: 18, fontWeight: '800' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 11, textTransform: 'capitalize' },
  card: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { fontSize: 30, marginRight: 10 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardMeta: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  exCount: { fontSize: 11, marginBottom: 8 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
  editBtnText: { fontSize: 12, fontWeight: '600' },
  completeBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
  completeBtnText: { fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 8, borderRadius: 8, alignItems: 'center', paddingHorizontal: 14 },
  deleteBtnText: { fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptySubtext: { fontSize: 13, marginTop: 6 },
});
