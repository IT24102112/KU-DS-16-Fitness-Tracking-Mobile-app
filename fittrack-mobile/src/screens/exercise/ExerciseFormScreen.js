import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import { useAuth } from '../../services/AuthContext';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { EquipmentImage, MUSCLE_GROUPS, EQUIPMENT_LIST, MUSCLE_ICONS } from '../../components/EquipmentImage';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance', 'plyometric'];
const DIFF_COLORS = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

export default function ExerciseFormScreen({ route, navigation }) {
  const existingExercise = route.params?.exercise;
  const isEdit = !!existingExercise?._id;
  const { theme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState({
    name: existingExercise?.name || '',
    description: existingExercise?.description || '',
    muscleGroup: existingExercise?.muscleGroup || 'chest',
    category: existingExercise?.category || 'strength',
    equipment: existingExercise?.equipment || 'bodyweight',
    difficulty: existingExercise?.difficulty || 'beginner',
    instructions: existingExercise?.instructions || '',
    defaultSets: existingExercise?.defaultSets?.toString() || '3',
    defaultReps: existingExercise?.defaultReps?.toString() || '10',
    defaultDurationSeconds: existingExercise?.defaultDurationSeconds?.toString() || '',
    caloriesPerMinute: existingExercise?.caloriesPerMinute?.toString() || '5',
    isGlobal: existingExercise?.isGlobal ?? false,
  });

  // Admin user assignment
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // { _id, name, email }
  const [assignmentMode, setAssignmentMode] = useState('global'); // 'global' or 'user'

  const [usersLoaded, setUsersLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Fetch user list for admin
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const res = await apiRequest('/auth/admin/users');
          setUsers(res.data || []);
        } catch (e) { Alert.alert('Error', e.message); }
        finally { setUsersLoaded(true); }
      };
      fetchUsers();
    }
  }, []);

  // Pre-fill assignment if editing
  useEffect(() => {
    if (isEdit && existingExercise) {
      if (existingExercise.isGlobal) {
        setAssignmentMode('global');
      } else if (existingExercise.createdBy && existingExercise.createdBy._id) {
        setAssignmentMode('user');
        setSelectedUser(existingExercise.createdBy);
      } else if (existingExercise.createdBy && typeof existingExercise.createdBy === 'string') {
        // Only ID, try to find in loaded users
        const found = users.find(u => u._id === existingExercise.createdBy);
        if (found) {
          setAssignmentMode('user');
          setSelectedUser(found);
        }
      }
    }
  }, [isEdit, existingExercise, users]);

  // Filter users as typing
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

  const selectUser = (u) => {
    setSelectedUser(u);
    setUserSearch(u.name);
    setFilteredUsers([]);
  };

  const clearUser = () => {
    setSelectedUser(null);
    setUserSearch('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Exercise name is required';
    if (!form.muscleGroup) return 'Please select a muscle group';
    if (isAdmin && assignmentMode === 'user' && !selectedUser) return 'Please select a user or choose Global';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation Error', err);
    try {
      setLoading(true);
      const payload = {
        ...form,
        defaultSets: form.defaultSets ? Number(form.defaultSets) : undefined,
        defaultReps: form.defaultReps ? Number(form.defaultReps) : undefined,
        defaultDurationSeconds: form.defaultDurationSeconds ? Number(form.defaultDurationSeconds) : undefined,
        caloriesPerMinute: form.caloriesPerMinute ? Number(form.caloriesPerMinute) : 5,
      };

      if (isAdmin) {
        if (assignmentMode === 'global') {
          payload.isGlobal = true;
          delete payload.targetUserId;
        } else {
          payload.isGlobal = false;
          if (selectedUser) {
            payload.targetUserId = selectedUser._id;
          }
        }
      } else {
        // Regular user: force personal
        payload.isGlobal = false;
        delete payload.targetUserId;
      }

      if (isEdit) {
        await apiRequest(`/exercises/${existingExercise._id}`, 'PUT', payload);
        Alert.alert('Updated!', 'Exercise updated successfully.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await apiRequest('/exercises', 'POST', payload);
        Alert.alert('Created!', 'Exercise added to library.', [{ text: 'OK', onPress: () => navigation.navigate('ExerciseList') }]);
      }
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const inp = [styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topNav}>
        <BackToHomeButton />
        <BackToHomeButton goHome={!isAdmin} adminHome={isAdmin} />
        <ThemeToggleButton />
      </View>

      {/* Live equipment preview */}
      <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <EquipmentImage equipment={form.equipment} size={80} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.previewName, { color: theme.textPrimary }]} numberOfLines={1}>
            {form.name || 'New Exercise'}
          </Text>
          <Text style={[styles.previewMeta, { color: theme.textMuted }]} numberOfLines={1}>
            {MUSCLE_ICONS[form.muscleGroup]} {form.muscleGroup}  •  {form.equipment}
          </Text>
        </View>
      </View>

      <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>
        {isEdit ? '✏️ Edit Exercise' : '➕ New Exercise'}
      </Text>

      {/* Admin assignment options */}
      {isAdmin && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Visibility</Text>
          <View style={styles.assignmentRow}>
            <TouchableOpacity
              style={[
                styles.assignBtn,
                { backgroundColor: assignmentMode === 'global' ? theme.accent : theme.inputBg, borderColor: theme.border },
              ]}
              onPress={() => setAssignmentMode('global')}
            >
              <Text style={{ color: assignmentMode === 'global' ? '#fff' : theme.textMuted, fontWeight: '700' }}>🌍 Global</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.assignBtn,
                { backgroundColor: assignmentMode === 'user' ? theme.accent : theme.inputBg, borderColor: theme.border },
              ]}
              onPress={() => setAssignmentMode('user')}
            >
              <Text style={{ color: assignmentMode === 'user' ? '#fff' : theme.textMuted, fontWeight: '700' }}>👤 Assign to User</Text>
            </TouchableOpacity>
          </View>
          {assignmentMode === 'user' && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.label, { color: theme.textMuted }]}>Search User</Text>
              <TextInput
                style={inp}
                placeholder="Type name or email..."
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
        </View>
      )}

      {/* Basic info */}
      <Text style={[styles.label, { color: theme.textMuted }]}>Exercise Name *</Text>
      <TextInput style={inp} placeholder="e.g. Bench Press" placeholderTextColor={theme.textMuted} value={form.name} onChangeText={v => update('name', v)} />

      <Text style={[styles.label, { color: theme.textMuted }]}>Description</Text>
      <TextInput style={[inp, styles.textArea]} placeholder="Brief description..." placeholderTextColor={theme.textMuted} value={form.description} onChangeText={v => update('description', v)} multiline numberOfLines={3} />

      {/* Muscle Group */}
      <Text style={[styles.label, { color: theme.textMuted }]}>Muscle Group *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
        {MUSCLE_GROUPS.map(m => (
          <TouchableOpacity key={m} onPress={() => update('muscleGroup', m)}
            style={[styles.chip, { backgroundColor: theme.inputBg, borderColor: theme.border }, form.muscleGroup === m && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
            <Text style={[styles.chipText, { color: form.muscleGroup === m ? '#fff' : theme.textMuted }]}>
              {MUSCLE_ICONS[m]} {m}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Equipment */}
      <Text style={[styles.label, { color: theme.textMuted }]}>Equipment</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
        {EQUIPMENT_LIST.map(e => (
          <TouchableOpacity key={e} onPress={() => update('equipment', e)}
            style={[styles.chip, { backgroundColor: theme.inputBg, borderColor: theme.border }, form.equipment === e && { backgroundColor: theme.purple, borderColor: theme.purple }]}>
            <Text style={[styles.chipText, { color: form.equipment === e ? '#fff' : theme.textMuted }]}>{e}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Difficulty */}
      <Text style={[styles.label, { color: theme.textMuted }]}>Difficulty</Text>
      <View style={styles.row}>
        {DIFFICULTIES.map((d, i) => (
          <TouchableOpacity key={d} onPress={() => update('difficulty', d)}
            style={[styles.thirdBtn, { backgroundColor: theme.inputBg, borderColor: theme.border, marginRight: i < 2 ? 8 : 0 },
              form.difficulty === d && { backgroundColor: DIFF_COLORS[d], borderColor: DIFF_COLORS[d] }]}>
            <Text style={[styles.thirdBtnText, { color: form.difficulty === d ? '#fff' : theme.textMuted }]}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category */}
      <Text style={[styles.label, { color: theme.textMuted }]}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} onPress={() => update('category', c)}
            style={[styles.chip, { backgroundColor: theme.inputBg, borderColor: theme.border }, form.category === c && { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }]}>
            <Text style={[styles.chipText, { color: form.category === c ? '#fff' : theme.textMuted }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Defaults */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Default Values</Text>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Sets</Text>
          <TextInput style={inp} value={form.defaultSets} onChangeText={v => update('defaultSets', v)} keyboardType="numeric" placeholder="3" placeholderTextColor={theme.textMuted} />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Reps</Text>
          <TextInput style={inp} value={form.defaultReps} onChangeText={v => update('defaultReps', v)} keyboardType="numeric" placeholder="10" placeholderTextColor={theme.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Cal/min</Text>
          <TextInput style={inp} value={form.caloriesPerMinute} onChangeText={v => update('caloriesPerMinute', v)} keyboardType="numeric" placeholder="5" placeholderTextColor={theme.textMuted} />
        </View>
      </View>

      <Text style={[styles.label, { color: theme.textMuted }]}>Duration (seconds) — for timed exercises</Text>
      <TextInput style={inp} value={form.defaultDurationSeconds} onChangeText={v => update('defaultDurationSeconds', v)} keyboardType="numeric" placeholder="Leave empty for rep-based" placeholderTextColor={theme.textMuted} />

      {/* Instructions */}
      <Text style={[styles.label, { color: theme.textMuted }]}>How to Perform</Text>
      <TextInput style={[inp, styles.textAreaLg]} placeholder="Step by step instructions..." placeholderTextColor={theme.textMuted} value={form.instructions} onChangeText={v => update('instructions', v)} multiline numberOfLines={5} />

      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.accent }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEdit ? 'Update Exercise' : 'Add to Library'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 52 },
  topNav: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  previewCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1 },
  previewName: { fontSize: 16, fontWeight: '800' },
  previewMeta: { fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
  pageTitle: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  label: { fontSize: 12, marginBottom: 6, marginTop: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginTop: 20, marginBottom: 4 },
  input: { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1 },
  textArea: { height: 80, textAlignVertical: 'top' },
  textAreaLg: { height: 110, textAlignVertical: 'top' },
  chipScroll: { paddingVertical: 4, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, textTransform: 'capitalize' },
  row: { flexDirection: 'row', marginTop: 4 },
  thirdBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  thirdBtnText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  submitBtn: { borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 24 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn: { borderRadius: 14, padding: 13, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  cancelBtnText: { fontSize: 14 },
  card: { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  assignmentRow: { flexDirection: 'row', gap: 10 },
  assignBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  selectedUserRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  dropdown: { borderRadius: 10, borderWidth: 1, maxHeight: 150, marginTop: 4 },
  userItem: { padding: 12, borderBottomWidth: 1 },
});