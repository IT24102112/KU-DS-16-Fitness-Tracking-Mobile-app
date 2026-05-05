import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'sports', 'custom'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const DIFF_COLORS = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

export default function AdminWorkoutFormScreen({ route, navigation }) {
  const { theme } = useTheme();
  const existingWorkout = route.params?.workout;
  const isEditing = !!existingWorkout;

  // ── Form state ──
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'custom',
    difficulty: 'beginner',
    durationMinutes: '',
    caloriesBurned: '',
    status: 'planned',
  });

  // ── User selection ──
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersLoaded, setUsersLoaded] = useState(false);

  // ── Exercises ──
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [exSearch, setExSearch] = useState('');
  const [exFiltered, setExFiltered] = useState([]);
  const [exLoading, setExLoading] = useState(false);
  const [showExPicker, setShowExPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Helper: fetch exercises filtered by a specific user (admin mode) ──
  const fetchExercises = useCallback(async (userId) => {
    try {
      setExLoading(true);
      let url = '/exercises';
      if (userId) {
        url += `?userId=${userId}`;
      }
      const res = await apiRequest(url);
      const data = res.data || [];
      setAvailableExercises(data);
      setExFiltered(data);
    } catch (e) {
      setAvailableExercises([]);
    } finally {
      setExLoading(false);
    }
  }, []);

  // ── Load users and pre‑fill form when editing ──
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest('/auth/admin/users');
        const list = res.data || [];
        setUsers(list);

        if (isEditing && existingWorkout?.user) {
          const userId = typeof existingWorkout.user === 'object' ? existingWorkout.user._id : existingWorkout.user;
          const found = list.find(u => u._id === userId);
          if (found) setSelectedUser(found);
          else setSelectedUser({ _id: userId, name: 'Unknown', email: '' });
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setUsersLoaded(true);
      }
    };

    if (isEditing) {
      // Pre‑fill form from existing workout
      setForm({
        title: existingWorkout.title || '',
        description: existingWorkout.description || '',
        category: existingWorkout.category || 'custom',
        difficulty: existingWorkout.difficulty || 'beginner',
        durationMinutes: existingWorkout.durationMinutes?.toString() || '',
        caloriesBurned: existingWorkout.caloriesBurned?.toString() || '',
        status: existingWorkout.status || 'planned',
      });
      setSelectedExercises(existingWorkout.exercises || []);

      // Immediately fetch exercises for this workout's user
      const workoutUserId = typeof existingWorkout.user === 'object'
        ? existingWorkout.user._id
        : existingWorkout.user;
      if (workoutUserId) {
        fetchExercises(workoutUserId);
      } else {
        fetchExercises(); // fallback – fetch all (should not happen)
      }
    } else {
      // For new workout, no exercises until a user is selected
      setAvailableExercises([]);
      setExFiltered([]);
    }

    fetchUsers();
  }, []);

  // ── When adding a new workout: after user selected, fetch their exercises ──
  useEffect(() => {
    if (!isEditing && selectedUser?._id) {
      fetchExercises(selectedUser._id);
    }
  }, [selectedUser, isEditing]);

  // ── Filter users as admin types ──
  useEffect(() => {
    if (userSearch.trim() === '') {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
      );
      setFilteredUsers(filtered.slice(0, 10));
    }
  }, [userSearch, users]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserSearch(user.name);
    setFilteredUsers([]);
  };

  const clearUser = () => {
    setSelectedUser(null);
    setUserSearch('');
    setAvailableExercises([]);
    setExFiltered([]);
  };

  // ── Exercise helpers ──
  const addExercise = (ex) => {
    if (selectedExercises.find(e => e.exerciseId === ex._id)) {
      Alert.alert('Already added', `${ex.name} is already in the workout`);
      return;
    }
    setSelectedExercises(prev => [...prev, {
      exerciseId: ex._id,
      name: ex.name,
      sets: 3,
      reps: 10,
      restSeconds: 60,
      notes: '',
    }]);
    setShowExPicker(false);
  };

  const addCustomExercise = () => {
    setSelectedExercises(prev => [...prev, {
      exerciseId: null,
      name: '',
      sets: 3,
      reps: 10,
      restSeconds: 60,
      notes: '',
    }]);
    setShowExPicker(false);
  };

  const updateExercise = (index, key, value) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [key]: value };
    setSelectedExercises(updated);
  };

  const removeExercise = (index) => setSelectedExercises(prev => prev.filter((_, i) => i !== index));

  // ── Filter exercises locally as user searches ──
  const handleExSearch = (text) => {
    setExSearch(text);
    const filtered = availableExercises.filter(ex =>
      ex.name?.toLowerCase().includes(text.toLowerCase())
    );
    setExFiltered(filtered);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!form.title.trim()) return Alert.alert('Error', 'Title is required');
    if (!form.durationMinutes || isNaN(Number(form.durationMinutes))) return Alert.alert('Error', 'Valid duration required');
    if (!isEditing && !selectedUser) return Alert.alert('Error', 'Please select a user');
    for (let ex of selectedExercises) { if (!ex.name.trim()) return Alert.alert('Error', 'All exercises must have a name'); }

    setSaving(true);
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        caloriesBurned: Number(form.caloriesBurned) || 0,
        exercises: selectedExercises.map(ex => ({
          ...ex,
          sets: Number(ex.sets) || 1,
          reps: Number(ex.reps) || undefined,
          restSeconds: Number(ex.restSeconds) || 60,
        })),
      };
      if (!isEditing) {
        payload.userId = selectedUser._id;
      }

      const url = isEditing ? `/workouts/admin/${existingWorkout._id}` : '/workouts/admin';
      const method = isEditing ? 'PUT' : 'POST';
      await apiRequest(url, method, payload);
      Alert.alert('Success', isEditing ? 'Workout updated!' : 'Workout created!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const inputStyle = () => ({
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.inputBg,
    color: theme.textPrimary,
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: theme.admin }]}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>
          {isEditing ? '✏️ Edit Workout' : '➕ Add Workout for User'}
        </Text>
      </View>

      {/* User selection (only for new workout) */}
      {!isEditing && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Select User *</Text>
          <TextInput
            style={inputStyle()}
            placeholder="Type a name to search..."
            placeholderTextColor={theme.textMuted}
            value={userSearch}
            onChangeText={setUserSearch}
            editable={!selectedUser}
          />
          {selectedUser && (
            <View style={styles.selectedUserRow}>
              <Text style={{ color: theme.textPrimary }}>
                ✅ {selectedUser.name} ({selectedUser.email})
              </Text>
              <TouchableOpacity onPress={clearUser}>
                <Text style={{ color: theme.dangerText, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {filteredUsers.length > 0 && !selectedUser && (
            <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {filteredUsers.map(item => (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.userItem, { borderBottomColor: theme.border }]}
                  onPress={() => selectUser(item)}
                >
                  <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 11 }}>{item.email}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Workout details */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Workout Title *</Text>
        <TextInput
          style={inputStyle()}
          placeholder="e.g. Morning Strength Training"
          placeholderTextColor={theme.textMuted}
          value={form.title}
          onChangeText={v => updateForm('title', v)}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Description</Text>
        <TextInput
          style={[inputStyle(), { height: 80, textAlignVertical: 'top' }]}
          placeholder="Optional notes..."
          placeholderTextColor={theme.textMuted}
          value={form.description}
          onChangeText={v => updateForm('description', v)}
          multiline
          numberOfLines={3}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Duration (min) *</Text>
            <TextInput
              style={inputStyle()}
              placeholder="e.g. 45"
              placeholderTextColor={theme.textMuted}
              value={form.durationMinutes}
              onChangeText={v => updateForm('durationMinutes', v)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Calories</Text>
            <TextInput
              style={inputStyle()}
              placeholder="e.g. 300"
              placeholderTextColor={theme.textMuted}
              value={form.caloriesBurned}
              onChangeText={v => updateForm('caloriesBurned', v)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => updateForm('category', cat)}
              style={[
                styles.chip,
                { backgroundColor: theme.inputBg, borderColor: theme.border },
                form.category === cat && { backgroundColor: theme.purple, borderColor: theme.purple },
              ]}
            >
              <Text style={[styles.chipText, { color: form.category === cat ? '#fff' : theme.textMuted }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Difficulty</Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => updateForm('difficulty', d)}
              style={[
                styles.chip,
                { backgroundColor: theme.inputBg, borderColor: theme.border },
                form.difficulty === d && { backgroundColor: DIFF_COLORS[d], borderColor: DIFF_COLORS[d] },
              ]}
            >
              <Text style={[styles.chipText, { color: form.difficulty === d ? '#fff' : theme.textMuted }]}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Exercises section */}
      <View style={styles.section}>
        <View style={styles.exHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            🏋️ Exercises ({selectedExercises.length})
          </Text>
          <TouchableOpacity
            style={[styles.addExBtn, { backgroundColor: theme.accent }]}
            onPress={() => setShowExPicker(!showExPicker)}
          >
            <Text style={styles.addExBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {showExPicker && (
          <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              style={[inputStyle(), { marginBottom: 8 }]}
              placeholder="Search exercises..."
              placeholderTextColor={theme.textMuted}
              value={exSearch}
              onChangeText={handleExSearch}
            />
            <TouchableOpacity
              style={[styles.customBtn, { backgroundColor: theme.blueLight, borderColor: theme.blue }]}
              onPress={addCustomExercise}
            >
              <Text style={[styles.customBtnText, { color: theme.blueText }]}>✏️ Add Custom Exercise</Text>
            </TouchableOpacity>
            {exLoading ? (
              <ActivityIndicator color={theme.accent} style={{ marginTop: 10 }} />
            ) : (
              exFiltered.slice(0, 20).map(item => (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.pickItem, { borderBottomColor: theme.border }]}
                  onPress={() => addExercise(item)}
                >
                  <View>
                    <Text style={[styles.pickName, { color: theme.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.pickMeta, { color: theme.textMuted }]}>
                      {item.muscleGroup || item.category || 'General'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20, color: theme.accent }}>+</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {selectedExercises.map((ex, idx) => (
          <View key={idx} style={[styles.exCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.exCardHeader}>
              <Text style={[styles.exNum, { color: theme.accent }]}>#{idx + 1}</Text>
              <TouchableOpacity onPress={() => removeExercise(idx)}>
                <Text style={{ color: theme.dangerText, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.exLabel, { color: theme.textMuted }]}>Exercise Name *</Text>
            <TextInput
              style={inputStyle()}
              placeholder="Exercise name"
              placeholderTextColor={theme.textMuted}
              value={ex.name}
              onChangeText={v => updateExercise(idx, 'name', v)}
            />
            <View style={styles.row}>
              {[['sets', 'Sets', '3'], ['reps', 'Reps', '10'], ['restSeconds', 'Rest (s)', '60']].map(([key, label, placeholder]) => (
                <View key={key} style={{ flex: 1, marginRight: 6 }}>
                  <Text style={[styles.exLabel, { color: theme.textMuted }]}>{label}</Text>
                  <TextInput
                    style={inputStyle()}
                    keyboardType="numeric"
                    value={ex[key]?.toString()}
                    onChangeText={v => updateExercise(idx, key, v)}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              ))}
            </View>
            <Text style={[styles.exLabel, { color: theme.textMuted }]}>Notes</Text>
            <TextInput
              style={inputStyle()}
              placeholder="Any special instructions..."
              placeholderTextColor={theme.textMuted}
              value={ex.notes}
              onChangeText={v => updateExercise(idx, 'notes', v)}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: theme.admin }]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isEditing ? 'Update Workout' : 'Create Workout'}</Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Styles (unchanged) ──
const styles = StyleSheet.create({
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn: { fontWeight: '700', fontSize: 15 },
  pageTitle: { fontSize: 22, fontWeight: '900' },
  section: { padding: 16 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  selectedUserRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  dropdown: { borderRadius: 10, borderWidth: 1, maxHeight: 150, marginTop: 4 },
  userItem: { padding: 12, borderBottomWidth: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, textTransform: 'capitalize' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  addExBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  addExBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  exCard: { borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1 },
  exCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  exNum: { fontWeight: '800', fontSize: 13 },
  exLabel: { fontSize: 11, marginBottom: 3, marginTop: 7 },
  submitBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginHorizontal: 16, marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  customBtn: { borderRadius: 10, padding: 11, alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  customBtnText: { fontWeight: '700', fontSize: 13 },
  pickItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderBottomWidth: 1 },
  pickName: { fontSize: 14, fontWeight: '600' },
  pickMeta: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
});