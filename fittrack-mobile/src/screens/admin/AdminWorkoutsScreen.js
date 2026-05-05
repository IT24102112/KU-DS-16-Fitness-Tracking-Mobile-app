import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const STATUS_COLORS = { planned: '#6366F1', in_progress: '#F59E0B', completed: '#10B981', skipped: '#EF4444' };
const STATUS_TEXT = { planned: '#818CF8', in_progress: '#F59E0B', completed: '#10B981', skipped: '#EF4444' };
const STATUS_ICONS = { planned: '📅', in_progress: '⚡', completed: '✅', skipped: '⏭️' };
const CATEGORY_ICONS = {
  strength: '🏋️', cardio: '🏃', flexibility: '🧘', hiit: '⚡', yoga: '🌿', sports: '⚽', custom: '✨',
};

export default function AdminWorkoutsScreen({ route, navigation }) {
  const filterUserId = route.params?.userId;
  const filterUserName = route.params?.userName;
  const { theme } = useTheme();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchWorkouts = useCallback(async () => {
    try {
      const query = filterUserId ? `?userId=${filterUserId}` : '';
      const res = await apiRequest(`/auth/admin/workouts${query}`);
      setWorkouts(res.data || []);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filterUserId]);

  useFocusEffect(useCallback(() => { fetchWorkouts(); }, [fetchWorkouts]));

  const handleDelete = (id, title) =>
    Alert.alert(`Delete "${title}"?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiRequest(`/auth/admin/workouts/${id}`, 'DELETE'); setWorkouts(p => p.filter(w => w._id !== id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);

  const filtered = workouts.filter(w => {
    const matchSearch = w.title?.toLowerCase().includes(search.toLowerCase()) ||
                        w.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const renderWorkout = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <Text style={styles.catIcon}>{CATEGORY_ICONS[item.category] || '✨'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.wTitle, { color: theme.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.wUser, { color: theme.blue }]}>👤 {item.user?.name || 'Unknown'}</Text>
          <Text style={[styles.wMeta, { color: theme.textMuted }]}>
            {item.durationMinutes} min  •  {item.category}  •  {item.difficulty}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || '#6366F1') + '22' }]}>
          <Text>{STATUS_ICONS[item.status] || '📅'}</Text>
          <Text style={[styles.statusText, { color: STATUS_TEXT[item.status] || '#818CF8' }]}>
            {item.status?.replace('_', ' ')}
          </Text>
        </View>
      </View>
      {item.exercises?.length > 0 && (
        <Text style={[styles.exCount, { color: theme.accentText }]}>
          🏋️ {item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}
        </Text>
      )}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.detailBtn, { backgroundColor: theme.blueLight, borderColor: theme.blue + '33' }]}
          onPress={() => navigation.navigate('AdminWorkoutDetail', { workout: item })}
        >
          <Text style={[styles.detailBtnText, { color: theme.blueText }]}>👁️  View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
          onPress={() => navigation.navigate('AdminWorkoutForm', { workout: item })}
        >
          <Text style={[styles.editBtnText, { color: theme.accent }]}>✏️  Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder + '33' }]}
          onPress={() => handleDelete(item._id, item.title)}
        >
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: theme.admin }]}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {filterUserName ? `💪 ${filterUserName}'s Workouts` : '💪 All Workouts'}
        </Text>
        <Text style={[styles.count, { color: theme.textMuted }]}>{workouts.length} total</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.search, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="🔍  Search by title or user..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={[styles.filterRow, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        {['all', 'planned', 'in_progress', 'completed', 'skipped'].map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatusFilter(s)}
            style={[
              styles.filterBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
              statusFilter === s && { backgroundColor: theme.accent, borderColor: theme.accent },
            ]}
          >
            <Text style={[styles.filterText, { color: statusFilter === s ? '#fff' : theme.textMuted }]}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderWorkout}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWorkouts(); }} tintColor={theme.accent} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💪</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No workouts found</Text>
            </View>
          }
        />
      )}

      {/* Add Workout Button */}
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.admin }]}
        onPress={() => navigation.navigate('AdminWorkoutForm', {})}
      >
        <Text style={styles.addBtnText}>➕  Add Workout for User</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles (same as before, with a few additions) ──────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn: { fontWeight: '700', fontSize: 15 },
  title: { fontSize: 20, fontWeight: '900' },
  count: { fontSize: 12, marginTop: 2 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, borderBottomWidth: 1 },
  search: { borderRadius: 10, padding: 10, fontSize: 13, borderWidth: 1 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, gap: 6, borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 10, textTransform: 'capitalize' },
  card: { borderRadius: 14, padding: 13, marginBottom: 11, borderWidth: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7 },
  catIcon: { fontSize: 26, marginRight: 10 },
  wTitle: { fontSize: 14, fontWeight: '800' },
  wUser: { fontSize: 11, marginTop: 2 },
  wMeta: { fontSize: 10, marginTop: 2, textTransform: 'capitalize' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  statusText: { fontSize: 9, fontWeight: '800', textTransform: 'capitalize' },
  exCount: { fontSize: 11, marginBottom: 7 },
  cardActions: { flexDirection: 'row', gap: 7 },
  detailBtn: { flex: 1, borderRadius: 9, padding: 8, alignItems: 'center', borderWidth: 1 },
  detailBtnText: { fontSize: 11, fontWeight: '700' },
  editBtn: { flex: 1, borderRadius: 9, padding: 8, alignItems: 'center', borderWidth: 1 },
  editBtnText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { borderRadius: 9, padding: 8, alignItems: 'center', paddingHorizontal: 14, borderWidth: 1 },
  deleteBtnText: { fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 15 },
  addBtn: { margin: 16, borderRadius: 14, padding: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});