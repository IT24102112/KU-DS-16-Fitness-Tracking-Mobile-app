import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const CATEGORIES = ['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'sports', 'custom'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const DIFF_COLORS = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

export default function WorkoutFormScreen({ route, navigation }) {
  const existingWorkout = route.params?.workout;
  const isEdit = !!existingWorkout?._id;
  const { theme } = useTheme();

  const [form, setForm] = useState({
    title: existingWorkout?.title || '', description: existingWorkout?.description || '',
    category: existingWorkout?.category || 'custom', difficulty: existingWorkout?.difficulty || 'beginner',
    durationMinutes: existingWorkout?.durationMinutes?.toString() || '',
    caloriesBurned: existingWorkout?.caloriesBurned?.toString() || '',
    status: existingWorkout?.status || 'planned',
  });
  const [selectedExercises, setSelectedExercises] = useState(existingWorkout?.exercises || []);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exLoading, setExLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEx = async () => {
      try { setExLoading(true); const res = await apiRequest('/exercises'); setAvailableExercises(res.data || []); }
      catch (e) { setAvailableExercises([]); }
      finally { setExLoading(false); }
    };
    fetchEx();
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addExercise = (ex) => {
    if (selectedExercises.find(e => e.exerciseId === ex._id)) { Alert.alert('Already Added', `${ex.name} is already in this workout`); return; }
    setSelectedExercises(p => [...p, { exerciseId: ex._id, name: ex.name, sets: 3, reps: 10, restSeconds: 60, notes: '' }]);
    setShowPicker(false);
  };
  const addCustom = () => { setSelectedExercises(p => [...p, { exerciseId: null, name: '', sets: 3, reps: 10, restSeconds: 60, notes: '' }]); setShowPicker(false); };
  const updateEx = (i, k, v) => setSelectedExercises(p => { const u = [...p]; u[i] = { ...u[i], [k]: v }; return u; });
  const removeEx = (i) => setSelectedExercises(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.title.trim()) return Alert.alert('Error', 'Workout title is required');
    if (!form.durationMinutes || isNaN(form.durationMinutes) || Number(form.durationMinutes) < 1) return Alert.alert('Error', 'Enter a valid duration');
    for (let ex of selectedExercises) { if (!ex.name.trim()) return Alert.alert('Error', 'All exercises must have a name'); }
    try {
      setLoading(true);
      const payload = { ...form, durationMinutes: Number(form.durationMinutes), caloriesBurned: Number(form.caloriesBurned) || 0,
        exercises: selectedExercises.map(ex => ({ ...ex, sets: Number(ex.sets) || 1, reps: Number(ex.reps) || undefined, restSeconds: Number(ex.restSeconds) || 60 })) };
      if (isEdit) {
        await apiRequest(`/workouts/${existingWorkout._id}`, 'PUT', payload);
        Alert.alert('Success', 'Workout updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await apiRequest('/workouts', 'POST', payload);
        Alert.alert('Success', 'Workout created!', [{ text: 'OK', onPress: () => navigation.navigate('WorkoutList') }]);
      }
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const inp = [styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }];
  const exInp = [styles.exInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary }];
  const filtered = availableExercises.filter(ex => ex.name?.toLowerCase().includes(exerciseSearch.toLowerCase()));

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topNav}>
        <BackToHomeButton />
        <BackToHomeButton goHome />
        <ThemeToggleButton />
      </View>

      <Text style={[styles.title, { color: theme.textPrimary }]}>{isEdit ? '✏️ Edit Workout' : '➕ New Workout'}</Text>

      <Text style={[styles.label, { color: theme.textMuted }]}>Workout Title *</Text>
      <TextInput style={inp} placeholder="e.g. Morning Strength Training" placeholderTextColor={theme.textMuted} value={form.title} onChangeText={v => update('title', v)} />

      <Text style={[styles.label, { color: theme.textMuted }]}>Description</Text>
      <TextInput style={[inp, styles.textArea]} placeholder="Optional notes..." placeholderTextColor={theme.textMuted} value={form.description} onChangeText={v => update('description', v)} multiline numberOfLines={3} />

      <Text style={[styles.label, { color: theme.textMuted }]}>Duration (minutes) *</Text>
      <TextInput style={inp} placeholder="e.g. 45" placeholderTextColor={theme.textMuted} value={form.durationMinutes} onChangeText={v => update('durationMinutes', v)} keyboardType="numeric" />

      <Text style={[styles.label, { color: theme.textMuted }]}>Estimated Calories</Text>
      <TextInput style={inp} placeholder="e.g. 300" placeholderTextColor={theme.textMuted} value={form.caloriesBurned} onChangeText={v => update('caloriesBurned', v)} keyboardType="numeric" />

      <Text style={[styles.label, { color: theme.textMuted }]}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} onPress={() => update('category', cat)}
            style={[styles.chip, { backgroundColor: theme.inputBg, borderColor: theme.border }, form.category === cat && { backgroundColor: theme.purple, borderColor: theme.purple }]}>
            <Text style={[styles.chipText, { color: form.category === cat ? '#fff' : theme.textMuted }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textMuted }]}>Difficulty</Text>
      <View style={styles.chipRow}>
        {DIFFICULTIES.map(d => (
          <TouchableOpacity key={d} onPress={() => update('difficulty', d)}
            style={[styles.chip, { backgroundColor: theme.inputBg, borderColor: theme.border }, form.difficulty === d && { backgroundColor: DIFF_COLORS[d], borderColor: DIFF_COLORS[d] }]}>
            <Text style={[styles.chipText, { color: form.difficulty === d ? '#fff' : theme.textMuted }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.exHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>🏋️ Exercises ({selectedExercises.length})</Text>
        <TouchableOpacity style={[styles.addExBtn, { backgroundColor: theme.accent }]} onPress={() => setShowPicker(true)}>
          <Text style={styles.addExBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {selectedExercises.length === 0 ? (
        <View style={[styles.emptyEx, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyExText, { color: theme.textPrimary }]}>No exercises added yet</Text>
          <Text style={[styles.emptyExSub, { color: theme.textMuted }]}>Tap "+ Add" to pick from library or add custom</Text>
        </View>
      ) : (
        selectedExercises.map((ex, i) => (
          <View key={i} style={[styles.exCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.exCardHeader}>
              <Text style={[styles.exNum, { color: theme.accent }]}>#{i + 1}</Text>
              <TouchableOpacity onPress={() => removeEx(i)} style={[styles.removeBtn, { backgroundColor: theme.danger }]}>
                <Text style={[styles.removeBtnText, { color: theme.dangerText }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.exLabel, { color: theme.textMuted }]}>Exercise Name *</Text>
            <TextInput style={exInp} value={ex.name} onChangeText={v => updateEx(i, 'name', v)} placeholder="Exercise name" placeholderTextColor={theme.textMuted} />
            <View style={styles.exRow}>
              {[['sets','Sets','3'],['reps','Reps','10'],['restSeconds','Rest (sec)','60']].map(([k,lbl,ph],idx) => (
                <View key={k} style={{ flex: 1, marginRight: idx < 2 ? 6 : 0 }}>
                  <Text style={[styles.exLabel, { color: theme.textMuted }]}>{lbl}</Text>
                  <TextInput style={exInp} value={ex[k]?.toString()} onChangeText={v => updateEx(i, k, v)} keyboardType="numeric" placeholder={ph} placeholderTextColor={theme.textMuted} />
                </View>
              ))}
            </View>
            <Text style={[styles.exLabel, { color: theme.textMuted }]}>Notes (optional)</Text>
            <TextInput style={exInp} value={ex.notes} onChangeText={v => updateEx(i, 'notes', v)} placeholder="e.g. Keep back straight" placeholderTextColor={theme.textMuted} />
          </View>
        ))
      )}

      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.accent }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEdit ? 'Update Workout' : 'Create Workout'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
      </TouchableOpacity>

      {/* Exercise Picker Modal */}
      <Modal visible={showPicker} animationType="slide" transparent onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Choose Exercise</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={[styles.modalClose, { color: theme.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={[styles.searchInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]} placeholder="Search exercises..." placeholderTextColor={theme.textMuted} value={exerciseSearch} onChangeText={setExerciseSearch} />
            <TouchableOpacity style={[styles.customBtn, { backgroundColor: theme.blueLight, borderColor: theme.blue }]} onPress={addCustom}>
              <Text style={[styles.customBtnText, { color: theme.blueText }]}>✏️ Add Custom Exercise</Text>
            </TouchableOpacity>
            {exLoading ? <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} /> : filtered.length === 0 ? (
              <View style={styles.noEx}>
                <Text style={[styles.noExText, { color: theme.textMuted }]}>
                  {availableExercises.length === 0 ? 'Exercise library not available yet.\nUse "Add Custom Exercise" above.' : 'No exercises match your search'}
                </Text>
              </View>
            ) : (
              <FlatList data={filtered} keyExtractor={item => item._id} style={{ maxHeight: 350 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={[styles.pickItem, { borderBottomColor: theme.border }]} onPress={() => addExercise(item)}>
                    <View>
                      <Text style={[styles.pickName, { color: theme.textPrimary }]}>{item.name}</Text>
                      <Text style={[styles.pickMeta, { color: theme.textMuted }]}>{item.muscleGroup || item.category || 'General'}</Text>
                    </View>
                    <Text style={[styles.pickAdd, { color: theme.accent }]}>+</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 52 },
  topNav: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  label: { fontSize: 12, marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1 },
  textArea: { height: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, textTransform: 'capitalize' },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  addExBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  addExBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  emptyEx: { borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1 },
  emptyExText: { fontSize: 13, fontWeight: '600' },
  emptyExSub: { fontSize: 11, marginTop: 5, textAlign: 'center' },
  exCard: { borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1 },
  exCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  exNum: { fontWeight: '800', fontSize: 13 },
  removeBtn: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  removeBtnText: { fontSize: 11, fontWeight: '700' },
  exLabel: { fontSize: 10, marginBottom: 3, marginTop: 7 },
  exInput: { borderRadius: 7, padding: 9, fontSize: 12, borderWidth: 1 },
  exRow: { flexDirection: 'row' },
  submitBtn: { borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 28 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn: { borderRadius: 14, padding: 13, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  cancelBtnText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalClose: { fontSize: 20, fontWeight: '700' },
  searchInput: { borderRadius: 10, padding: 11, fontSize: 13, borderWidth: 1, marginBottom: 10 },
  customBtn: { borderRadius: 10, padding: 11, alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  customBtnText: { fontWeight: '700', fontSize: 13 },
  pickItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderBottomWidth: 1 },
  pickName: { fontSize: 14, fontWeight: '600' },
  pickMeta: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  pickAdd: { fontSize: 22, fontWeight: '800', paddingHorizontal: 8 },
  noEx: { padding: 20, alignItems: 'center' },
  noExText: { fontSize: 13, textAlign: 'center', lineHeight: 22 },
});
