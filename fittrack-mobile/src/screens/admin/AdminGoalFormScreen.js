import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const GOAL_TYPES = ['Lose Weight', 'Gain Muscle', 'Build Endurance', 'Improve Strength'];

export default function AdminGoalFormScreen({ route, navigation }) {
  const { theme } = useTheme();
  const editGoal = route.params?.goal;
  const isEditing = !!editGoal;

  // Form state
  const [goalType, setGoalType] = useState(editGoal?.goalType || 'Lose Weight');
  const [targetValue, setTargetValue] = useState(editGoal?.targetValue?.toString() || '');
  const [deadlineYear, setDeadlineYear] = useState('');
  const [deadlineMonth, setDeadlineMonth] = useState('');
  const [deadlineDay, setDeadlineDay] = useState('');
  const [loading, setLoading] = useState(false);

  // User picker state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users and prefill form if editing
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest('/auth/admin/users');
        const allUsers = res.data || [];
        setUsers(allUsers);
        if (isEditing && editGoal?.user) {
          const userId = typeof editGoal.user === 'object' ? editGoal.user._id : editGoal.user;
          const found = allUsers.find(u => u._id === userId);
          if (found) setSelectedUser(found);
          else setSelectedUser({ _id: userId, name: 'Unknown', email: '' });
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    };

    if (isEditing) {
      // Prefill deadline
      if (editGoal.deadline) {
        const d = new Date(editGoal.deadline);
        setDeadlineYear(d.getFullYear().toString());
        setDeadlineMonth((d.getMonth() + 1).toString());
        setDeadlineDay(d.getDate().toString());
      }
      // Prefill goal type and target value
      setGoalType(editGoal.goalType || 'Lose Weight');
      setTargetValue(editGoal.targetValue?.toString() || '');
    }

    fetchUsers();
  }, []);

  // Filter users as typing
  useEffect(() => {
    if (userSearch.trim() === '') {
      setFilteredUsers([]);
    } else {
      setFilteredUsers(
        users
          .filter(u =>
            u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(userSearch.toLowerCase())
          )
          .slice(0, 10)
      );
    }
  }, [userSearch, users]);

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserSearch(user.name);
    setFilteredUsers([]);
  };

  const clearUser = () => {
    setSelectedUser(null);
    setUserSearch('');
  };

  const buildDeadline = () => {
    if (!deadlineYear || !deadlineMonth || !deadlineDay) return null;
    const y = parseInt(deadlineYear);
    const m = parseInt(deadlineMonth) - 1;
    const d = parseInt(deadlineDay);
    return new Date(y, m, d);
  };

  const handleSubmit = async () => {
    if (!targetValue) {
      Alert.alert('Error', 'Target value required');
      return;
    }
    const deadline = buildDeadline();
    if (!deadline) {
      Alert.alert('Error', 'Invalid deadline');
      return;
    }
    if (!isEditing && !selectedUser) {
      Alert.alert('Error', 'Select a user');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        goalType,
        targetValue: parseFloat(targetValue),
        deadline: deadline.toISOString(),
      };

      const url = isEditing ? `/goals/admin/${editGoal._id}` : '/goals/admin';
      const method = isEditing ? 'PUT' : 'POST';
      if (!isEditing) payload.userId = selectedUser._id;

      await apiRequest(url, method, payload);
      Alert.alert('Success', isEditing ? 'Goal updated!' : 'Goal created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: theme.inputBg,
    borderColor: theme.border,
    color: theme.textPrimary,
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: theme.admin }]}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>
          {isEditing ? '✏️ Edit Goal' : '➕ Add Goal for User'}
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* User picker (only for new goals) */}
        {!isEditing && (
          <>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Select User *</Text>
            <TextInput
              style={[styles.input, inputStyle]}
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
          </>
        )}

        <Text style={[styles.label, { color: theme.textPrimary }]}>Goal Type</Text>
        <View style={styles.typeRow}>
          {GOAL_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setGoalType(type)}
              style={[
                styles.typeBtn,
                { borderColor: theme.accent },
                goalType === type && { backgroundColor: theme.accent },
              ]}
            >
              <Text style={goalType === type ? styles.typeBtnActiveText : { color: theme.accent }}>
                {type}
              </Text>
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
          <TextInput
            style={[styles.dateInput, inputStyle]}
            placeholder="YYYY"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            maxLength={4}
            value={deadlineYear}
            onChangeText={setDeadlineYear}
          />
          <Text style={[styles.dateSep, { color: theme.textMuted }]}>-</Text>
          <TextInput
            style={[styles.dateInput, inputStyle]}
            placeholder="MM"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            maxLength={2}
            value={deadlineMonth}
            onChangeText={setDeadlineMonth}
          />
          <Text style={[styles.dateSep, { color: theme.textMuted }]}>-</Text>
          <TextInput
            style={[styles.dateInput, inputStyle]}
            placeholder="DD"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
            maxLength={2}
            value={deadlineDay}
            onChangeText={setDeadlineDay}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.admin }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{isEditing ? 'Update Goal' : 'Create Goal'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn: { fontWeight: '700', fontSize: 15 },
  pageTitle: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, marginBottom: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  typeBtnActiveText: { color: '#fff' },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, textAlign: 'center' },
  dateSep: { fontSize: 18, marginHorizontal: 5 },
  submitBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  selectedUserRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  dropdown: { borderRadius: 10, borderWidth: 1, maxHeight: 150, marginTop: 4 },
  userItem: { padding: 12, borderBottomWidth: 1 },
});