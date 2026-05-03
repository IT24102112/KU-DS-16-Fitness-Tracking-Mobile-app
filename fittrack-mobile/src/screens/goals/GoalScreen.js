import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const GOAL_TYPES = ['Lose Weight', 'Gain Muscle', 'Build Endurance', 'Improve Strength'];

const GoalScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // form
  const [goalType, setGoalType] = useState('Lose Weight');
  const [targetValue, setTargetValue] = useState('');
  const [deadlineYear, setDeadlineYear] = useState('');
  const [deadlineMonth, setDeadlineMonth] = useState('');
  const [deadlineDay, setDeadlineDay] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // fetch goals
  const fetchGoals = useCallback(async () => {
    try {
      const res = await apiRequest('/goals/my-goals');
      setGoals(res.data || []);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [fetchGoals])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGoals();
  };

  const resetForm = () => {
    setGoalType('Lose Weight');
    setTargetValue('');
    setDeadlineYear('');
    setDeadlineMonth('');
    setDeadlineDay('');
    setEditingGoal(null);
  };

  const buildDeadline = () => {
    if (!deadlineYear || !deadlineMonth || !deadlineDay) return null;
    const y = parseInt(deadlineYear);
    const m = parseInt(deadlineMonth) - 1;
    const d = parseInt(deadlineDay);
    return new Date(y, m, d);
  };

  const handleSave = async () => {
    if (!targetValue) {
      Alert.alert('Error', 'Please enter target value');
      return;
    }
    const deadline = buildDeadline();
    if (!deadline) {
      Alert.alert('Error', 'Please enter a valid deadline (YYYY, MM, DD)');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadline < today) {
      Alert.alert('Error', 'Deadline must be in the future');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        goalType,
        targetValue: parseFloat(targetValue),
        deadline: deadline.toISOString(),
      };

      if (editingGoal) {
        await apiRequest(`/goals/${editingGoal._id}`, 'PUT', payload);
        Alert.alert('Success', 'Goal updated');
      } else {
        await apiRequest('/goals', 'POST', payload);
        Alert.alert('Success', 'Goal created');
      }

      setModalVisible(false);
      resetForm();
      fetchGoals();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save goal');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/goals/${id}`, 'DELETE');
            fetchGoals();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete goal');
          }
        },
      },
    ]);
  };

  const handleStatus = async (id, status) => {
    try {
      await apiRequest(`/goals/${id}/status`, 'PATCH', { status });
      fetchGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleEdit = (item) => {
    const d = new Date(item.deadline);
    setEditingGoal(item);
    setGoalType(item.goalType);
    setTargetValue(item.targetValue.toString());
    setDeadlineYear(d.getFullYear().toString());
    setDeadlineMonth((d.getMonth() + 1).toString());
    setDeadlineDay(d.getDate().toString());
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Achieved': return '#4CAF50';
      case 'Failed': return '#F44336';
      default: return theme.accent;
    }
  };

  const progressPercent = (item) =>
    Math.min(((item.currentValue || 0) / item.targetValue) * 100, 100);

  const renderCard = ({ item }) => (
    <View style={[styles.card, {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderLeftColor: theme.accent,
    }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.goalType, { color: theme.textPrimary }]}>{item.goalType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'In Progress'}</Text>
        </View>
      </View>

      <Text style={[styles.progressText, { color: theme.textSecondary }]}>
        Progress: {item.currentValue || 0} / {item.targetValue} {item.unit || 'kg'}
      </Text>
      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <View style={[styles.progressFill, { width: `${progressPercent(item)}%`, backgroundColor: theme.accent }]} />
      </View>

      <Text style={[styles.deadline, { color: theme.textMuted }]}>
        📅 Deadline: {new Date(item.deadline).toLocaleDateString()}
      </Text>

      <View style={styles.actions}>
        {item.status === 'In Progress' && (
          <>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]} onPress={() => handleStatus(item._id, 'Achieved')}>
              <Text style={styles.actionBtnText}>Achieved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F44336' }]} onPress={() => handleStatus(item._id, 'Failed')}>
              <Text style={styles.actionBtnText}>Failed</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.blue }]} onPress={() => handleEdit(item)}>
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.textMuted }]} onPress={() => handleDelete(item._id)}>
          <Text style={styles.actionBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const inputStyle = {
    backgroundColor: theme.inputBg,
    borderColor: theme.border,
    color: theme.textPrimary,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <BackToHomeButton goHome />
          <ThemeToggleButton />
        </View>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>🎯 Fitness Goals</Text>
        <Text style={[styles.headerSub, { color: theme.textMuted }]}>{goals.length} goals set</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No goals yet</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>Tap the button to set your first goal</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.accent }]}
        onPress={() => { resetForm(); setModalVisible(true); }}
      >
        <Text style={styles.addBtnText}>+ Add New Goal</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {editingGoal ? '✏️ Edit Goal' : '🎯 Add New Goal'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Goal Type</Text>
              <View style={styles.typeRow}>
                {GOAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeBtn,
                      { borderColor: theme.accent },
                      goalType === type && { backgroundColor: theme.accent },
                    ]}
                    onPress={() => setGoalType(type)}
                  >
                    <Text style={goalType === type ? styles.typeBtnActiveText : { color: theme.accent }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textPrimary }]}>Target Value (kg)</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="e.g. 70"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={targetValue}
                onChangeText={setTargetValue}
              />

              <Text style={[styles.label, { color: theme.textPrimary }]}>Deadline</Text>
              <View style={styles.dateRow}>
                <TextInput style={[styles.dateInput, inputStyle]} placeholder="YYYY" placeholderTextColor={theme.textMuted} keyboardType="numeric" maxLength={4} value={deadlineYear} onChangeText={setDeadlineYear} />
                <Text style={[styles.dateSep, { color: theme.textMuted }]}>-</Text>
                <TextInput style={[styles.dateInput, inputStyle]} placeholder="MM" placeholderTextColor={theme.textMuted} keyboardType="numeric" maxLength={2} value={deadlineMonth} onChangeText={setDeadlineMonth} />
                <Text style={[styles.dateSep, { color: theme.textMuted }]}>-</Text>
                <TextInput style={[styles.dateInput, inputStyle]} placeholder="DD" placeholderTextColor={theme.textMuted} keyboardType="numeric" maxLength={2} value={deadlineDay} onChangeText={setDeadlineDay} />
              </View>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.accent }]} onPress={handleSave} disabled={formLoading}>
                  {formLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GoalScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, marginBottom: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 4 },
  addBtn: { margin: 16, padding: 16, borderRadius: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalType: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  progressText: { fontSize: 14, marginBottom: 6 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  deadline: { fontSize: 12, marginBottom: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyCard: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, marginTop: 6 },

  // modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 16, padding: 20, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  typeBtnActiveText: { color: '#fff' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, textAlign: 'center' },
  dateSep: { fontSize: 18, marginHorizontal: 5 },
  modalBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
});