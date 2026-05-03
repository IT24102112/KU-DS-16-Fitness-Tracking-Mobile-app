import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const STATUS_COLORS = {
  'In Progress': '#EAB308',
  Achieved: '#22C55E',
  Failed: '#EF4444',
};

export default function AdminGoalScreen({ navigation }) {
  const { theme } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchGoals = useCallback(async () => {
    try {
      const res = await apiRequest('/goals/admin/all');
      setGoals(res.data || []);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchGoals(); }, [fetchGoals]));

  const handleDelete = (id, userName) =>
    Alert.alert(`Delete goal for ${userName}?`, '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/goals/admin/${id}`, 'DELETE');
            setGoals(prev => prev.filter(g => g._id !== id));
          } catch (e) { Alert.alert('Error', e.message); }
        },
      },
    ]);

  const filtered = goals.filter(g => {
    const s = search.toLowerCase();
    return (
      g.user?.name?.toLowerCase().includes(s) ||
      g.user?.email?.toLowerCase().includes(s) ||
      g.goalType?.toLowerCase().includes(s)
    );
  });

  const renderItem = ({ item }) => (
    <View style={[styles.card, {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderLeftColor: STATUS_COLORS[item.status] || theme.accent,
    }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.userName, { color: theme.blueText }]}>
          👤 {item.user?.name || 'Unknown'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || theme.accent) + '22' }]}>
          <Text style={{ color: STATUS_COLORS[item.status] || theme.accent, fontWeight: '700', fontSize: 11 }}>
            {item.status || 'In Progress'}
          </Text>
        </View>
      </View>
      <Text style={[styles.goalType, { color: theme.textPrimary }]}>{item.goalType}</Text>
      <Text style={[styles.meta, { color: theme.textMuted }]}>
        {item.currentValue || 0} / {item.targetValue} {item.unit || 'kg'}  •  📅 {new Date(item.deadline).toLocaleDateString()}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
          onPress={() => navigation.navigate('AdminGoalForm', { goal: item })}
        >
          <Text style={[styles.editBtnText, { color: theme.accent }]}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
          onPress={() => handleDelete(item._id, item.user?.name || 'User')}
        >
          <Text style={{ color: theme.dangerText, fontWeight: '700' }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: theme.admin }]}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>🎯 All Goals</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{goals.length} goals across all users</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.search, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="🔍  Search by user or goal type..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGoals(); }} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No goals found</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.admin }]}
        onPress={() => navigation.navigate('AdminGoalForm', {})}
      >
        <Text style={styles.addBtnText}>➕  Add Goal for User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn: { fontWeight: '700', fontSize: 15 },
  title: { fontSize: 22, fontWeight: '900' },
  subtitle: { fontSize: 12, marginTop: 2 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, borderBottomWidth: 1 },
  search: { borderRadius: 10, padding: 10, fontSize: 13, borderWidth: 1 },
  card: { borderRadius: 14, padding: 13, marginBottom: 11, borderWidth: 1, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  userName: { fontSize: 13, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  goalType: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  meta: { fontSize: 12, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 7 },
  editBtn: { flex: 1, borderRadius: 9, padding: 8, alignItems: 'center', borderWidth: 1 },
  editBtnText: { fontSize: 12, fontWeight: '700' },
  deleteBtn: { borderRadius: 9, padding: 8, alignItems: 'center', paddingHorizontal: 14, borderWidth: 1 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  addBtn: { margin: 16, borderRadius: 14, padding: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});