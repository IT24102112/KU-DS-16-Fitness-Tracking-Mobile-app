import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import { useAuth } from '../../services/AuthContext';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { EquipmentImage, MUSCLE_ICONS, EQUIP_COLORS_EXPORT } from '../../components/EquipmentImage';

const DIFFICULTY_COLORS = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

const MUSCLE_FILTERS = [
  'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'core', 'glutes', 'quadriceps', 'hamstrings', 'calves', 'full body', 'cardio',
];

export default function ExerciseListScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');

  const fetchExercises = useCallback(async () => {
    try {
      let url = '/exercises';
      const params = [];
      if (muscleFilter !== 'all') params.push(`muscleGroup=${muscleFilter}`);
      if (search.trim()) params.push(`search=${search.trim()}`);
      if (params.length) url += '?' + params.join('&');
      const res = await apiRequest(url);
      setExercises(res.data || []);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [muscleFilter, search]);

  useFocusEffect(useCallback(() => { fetchExercises(); }, [fetchExercises]));

  const handleDelete = (id, name) =>
    Alert.alert(`Delete "${name}"?`, 'This exercise will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiRequest(`/exercises/${id}`, 'DELETE'); setExercises(p => p.filter(e => e._id !== id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);

  const handleSeed = async () => {
    Alert.alert('Seed Exercises', 'Add 23 default global exercises?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Seed', onPress: async () => {
        try {
          const res = await apiRequest('/exercises/seed', 'POST');
          Alert.alert('Done', res.message);
          fetchExercises();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const renderExercise = ({ item }) => {
    const equipColors = EQUIP_COLORS_EXPORT[item.equipment] || EQUIP_COLORS_EXPORT.other;
    const canEdit = isAdmin || item.createdBy?._id === user?._id || item.createdBy === user?._id;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item._id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardLeft}>
          <EquipmentImage equipment={item.equipment} size={48} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
            {item.isGlobal && (
              <View style={[styles.globalBadge, { backgroundColor: theme.accentLight }]}>
                <Text style={[styles.globalBadgeText, { color: theme.accent }]}>⭐ Global</Text>
              </View>
            )}
          </View>

          <Text style={[styles.cardMuscle, { color: equipColors.accent }]}>
            {MUSCLE_ICONS[item.muscleGroup]} {item.muscleGroup}  •  {item.equipment}
          </Text>

          <View style={styles.cardTags}>
            <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + '22' }]}>
              <Text style={[styles.diffBadgeText, { color: DIFFICULTY_COLORS[item.difficulty] }]}>{item.difficulty}</Text>
            </View>
            <View style={[styles.catBadge, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <Text style={[styles.catBadgeText, { color: theme.textMuted }]}>{item.category}</Text>
            </View>
            {item.defaultReps && <Text style={[styles.repsText, { color: theme.textMuted }]}>{item.defaultSets}×{item.defaultReps}</Text>}
            {item.defaultDurationSeconds && <Text style={[styles.repsText, { color: theme.textMuted }]}>{item.defaultDurationSeconds}s</Text>}
          </View>
        </View>

        {canEdit && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: theme.blueLight }]}
              onPress={() => navigation.navigate('ExerciseForm', { exercise: item })}
            >
              <Text style={[styles.editBtnText, { color: theme.blueText }]}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteBtn, { backgroundColor: theme.danger }]}
              onPress={() => handleDelete(item._id, item.name)}
            >
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <BackToHomeButton goHome={!isAdmin} adminHome={isAdmin} />
          <ThemeToggleButton />
        </View>
        <View style={styles.headerBottom}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>🏋️ Exercises</Text>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>{exercises.length} exercises</Text>
          </View>
          <View style={styles.headerBtns}>
            {isAdmin && (
              <TouchableOpacity style={[styles.seedBtn, { backgroundColor: theme.adminLight, borderColor: theme.adminBorder }]} onPress={handleSeed}>
                <Text style={[styles.seedBtnText, { color: theme.admin }]}>🌱 Seed</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={() => navigation.navigate('ExerciseForm', {})}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <TextInput
          style={[styles.search, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="🔍  Search exercises..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchExercises}
          returnKeyType="search"
        />
      </View>

      {/* Muscle filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]} contentContainerStyle={styles.filterScrollContent}>
        {MUSCLE_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setMuscleFilter(f)}
            style={[styles.filterChip, { backgroundColor: theme.card, borderColor: theme.border },
              muscleFilter === f && { backgroundColor: theme.accent, borderColor: theme.accent }]}
          >
            <Text style={[styles.filterChipText, { color: muscleFilter === f ? '#fff' : theme.textMuted }]}>
              {f === 'all' ? 'All' : `${MUSCLE_ICONS[f] || ''} ${f}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={item => item._id}
          renderItem={renderExercise}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchExercises(); }} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No exercises found</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                {isAdmin ? 'Tap "🌱 Seed" to add defaults or "+ Add" to create one' : 'Tap "+ Add" to create a custom exercise'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  headerSub: { fontSize: 12, marginTop: 2 },
  headerBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  seedBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  seedBtnText: { fontSize: 12, fontWeight: '700' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  search: { borderRadius: 12, padding: 11, fontSize: 13, borderWidth: 1 },
  filterScroll: { borderBottomWidth: 1, maxHeight: 52 },
  filterScrollContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 11, textTransform: 'capitalize' },
  card: { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardLeft: {},
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' },
  cardTitle: { fontSize: 15, fontWeight: '800', flex: 1 },
  globalBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  globalBadgeText: { fontSize: 9, fontWeight: '800' },
  cardMuscle: { fontSize: 12, marginBottom: 8, textTransform: 'capitalize', fontWeight: '600' },
  cardTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  catBadgeText: { fontSize: 10, textTransform: 'capitalize' },
  repsText: { fontSize: 11 },
  cardActions: { flexDirection: 'column', gap: 6 },
  editBtn: { padding: 8, borderRadius: 8, alignItems: 'center' },
  editBtnText: { fontSize: 14 },
  deleteBtn: { padding: 8, borderRadius: 8, alignItems: 'center' },
  deleteBtnText: { fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
});
