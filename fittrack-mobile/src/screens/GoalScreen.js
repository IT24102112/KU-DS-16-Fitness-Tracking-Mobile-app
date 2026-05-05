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
import goalService from '../services/goalService';
import { useTheme } from '../services/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

const GoalScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Form states
  const [goalType, setGoalType] = useState('Lose Weight');
  const [targetValue, setTargetValue] = useState('');
  const [deadlineYear, setDeadlineYear] = useState('');
  const [deadlineMonth, setDeadlineMonth] = useState('');
  const [deadlineDay, setDeadlineDay] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      const response = await goalService.getMyGoals();
      let goalsData = [];
      if (response && response.data && Array.isArray(response.data)) {
        goalsData = response.data;
      } else if (response && response.goals && Array.isArray(response.goals)) {
        goalsData = response.goals;
      } else if (Array.isArray(response)) {
        goalsData = response;
      } else if (response && response.success && response.data) {
        goalsData = response.data;
      }
      setGoals(goalsData);
    } catch (error) {
      console.error('Fetch goals error:', error);
      Alert.alert('Error', error.message || 'Failed to load goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
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

  const getDeadlineDate = () => {
    if (!deadlineYear || !deadlineMonth || !deadlineDay) return null;
    const year = parseInt(deadlineYear);
    const month = parseInt(deadlineMonth) - 1;
    const day = parseInt(deadlineDay);
    const date = new Date(year, month, day);
    return date;
  };

  const handleAddGoal = async () => {
    if (!targetValue) {
      Alert.alert('Error', 'Please enter target value');
      return;
    }

    const deadline = getDeadlineDate();
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
      const goalData = {
        goalType,
        targetValue: parseFloat(targetValue),
        deadline: deadline.toISOString(),
      };

      if (editingGoal) {
        await goalService.updateGoal(editingGoal._id, goalData);
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        await goalService.createGoal(goalData);
        Alert.alert('Success', 'Goal created successfully');
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

  const handleDeleteGoal = (goalId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalService.deleteGoal(goalId);
              Alert.alert('Success', 'Goal deleted');
              fetchGoals();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (goalId, newStatus) => {
    try {
      await goalService.updateStatus(goalId, newStatus);
      Alert.alert('Success', `Goal marked as ${newStatus}`);
      fetchGoals();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleEditGoal = (goal) => {
    const deadline = new Date(goal.deadline);
    setEditingGoal(goal);
    setGoalType(goal.goalType);
    setTargetValue(goal.targetValue.toString());
    setDeadlineYear(deadline.getFullYear().toString());
    setDeadlineMonth((deadline.getMonth() + 1).toString());
    setDeadlineDay(deadline.getDate().toString());
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Achieved': return '#10B981'; // theme success
      case 'Failed': return '#EF4444'; // theme danger
      default: return '#F59E0B'; // theme warning
    }
  };

  const renderGoalCard = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.goalType, { color: theme.textPrimary }]}>{item.goalType}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status || 'In Progress'}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={[styles.progressText, { color: theme.textMuted }]}>
          Progress: {item.currentValue || 0} / {item.targetValue} {item.unit || 'kg'}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { backgroundColor: theme.accent, width: `${Math.min(((item.currentValue || 0) / item.targetValue) * 100, 100)}%` }
            ]} 
          />
        </View>
      </View>

      <Text style={[styles.deadline, { color: theme.textMuted }]}>
        📅 Deadline: {new Date(item.deadline).toLocaleDateString()}
      </Text>

      <View style={styles.cardActions}>
        {item.status === 'In Progress' && (
          <>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#10B98122' }]}
              onPress={() => handleUpdateStatus(item._id, 'Achieved')}
            >
              <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Achieved</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#EF444422' }]}
              onPress={() => handleUpdateStatus(item._id, 'Failed')}
            >
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Failed</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: theme.accent + '22' }]}
          onPress={() => handleEditGoal(item)}
        >
          <Text style={[styles.actionBtnText, { color: theme.accent }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: theme.textMuted + '22' }]}
          onPress={() => handleDeleteGoal(item._id)}
        >
          <Text style={[styles.actionBtnText, { color: theme.textMuted }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Standardized Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.accent }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Fitness Goals</Text>
        <ThemeToggleButton />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
          }
          renderItem={renderGoalCard}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyIcon, { color: theme.textMuted }]}>🎯</Text>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No goals yet</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Tap the "+" button below to set your first fitness goal!
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.accent }]} 
        onPress={() => { resetForm(); setModalVisible(true); }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {editingGoal ? '✏️ Edit Goal' : '🎯 Add New Goal'}
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Goal Type</Text>
              <View style={styles.typeContainer}>
                {['Lose Weight', 'Gain Muscle', 'Build Endurance', 'Improve Strength'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeBtn,
                      { borderColor: theme.accent },
                      goalType === type && { backgroundColor: theme.accent },
                    ]}
                    onPress={() => setGoalType(type)}
                  >
                    <Text style={[
                      styles.typeBtnText,
                      { color: goalType === type ? '#fff' : theme.accent }
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.textPrimary }]}>Target Value (kg)</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.bg }]}
                placeholder="Enter target value"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={targetValue}
                onChangeText={setTargetValue}
              />

              <Text style={[styles.label, { color: theme.textPrimary }]}>Deadline (YYYY-MM-DD)</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.dateInput, styles.dateYear, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.bg }]}
                  placeholder="Year"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={deadlineYear}
                  onChangeText={setDeadlineYear}
                  maxLength={4}
                />
                <Text style={[styles.dateSep, { color: theme.textMuted }]}>-</Text>
                <TextInput
                  style={[styles.dateInput, styles.dateMonth, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.bg }]}
                  placeholder="Month"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={deadlineMonth}
                  onChangeText={setDeadlineMonth}
                  maxLength={2}
                />
                <Text style={[styles.dateSep, { color: theme.textMuted }]}>-</Text>
                <TextInput
                  style={[styles.dateInput, styles.dateDay, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.bg }]}
                  placeholder="Day"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={deadlineDay}
                  onChangeText={setDeadlineDay}
                  maxLength={2}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 1 }]}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme.accent }]}
                  onPress={handleAddGoal}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Goal</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 52,
    borderBottomWidth: 1,
  },
  backBtn: {
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabIcon: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '300',
    marginTop: -4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  deadline: {
    fontSize: 12,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '85%',
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    textAlign: 'center',
  },
  dateYear: {
    flex: 3,
  },
  dateMonth: {
    flex: 2,
  },
  dateDay: {
    flex: 2,
  },
  dateSep: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  typeBtnText: {
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontWeight: '700',
    fontSize: 15,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default GoalScreen;