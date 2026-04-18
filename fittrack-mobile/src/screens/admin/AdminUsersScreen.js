import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const LEVEL_COLORS = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

export default function AdminUsersScreen({ navigation }) {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try { const res = await apiRequest('/auth/admin/users'); setUsers(res.data || []); }
    catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchUsers(); }, [fetchUsers]));

  const handleDelete = (id, name) =>
    Alert.alert(`Delete "${name}"?`, 'This permanently deletes the user and all their data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiRequest(`/auth/admin/users/${id}`, 'DELETE'); setUsers(p => p.filter(u => u._id !== id)); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderUser = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: LEVEL_COLORS[item.fitnessLevel] || '#64748B' }]}>
          <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.email, { color: theme.textMuted }]}>{item.email}</Text>
          <View style={styles.metaRow}>
            {item.age && <Text style={[styles.metaChip, { backgroundColor: theme.inputBg, color: theme.textSecondary }]}>🎂 {item.age}y</Text>}
            {item.weight && <Text style={[styles.metaChip, { backgroundColor: theme.inputBg, color: theme.textSecondary }]}>⚖️ {item.weight}kg</Text>}
            {item.height && <Text style={[styles.metaChip, { backgroundColor: theme.inputBg, color: theme.textSecondary }]}>📏 {item.height}cm</Text>}
            <Text style={[styles.levelChip, { backgroundColor: (LEVEL_COLORS[item.fitnessLevel] || '#64748B') + '22', color: LEVEL_COLORS[item.fitnessLevel] || '#64748B' }]}>
              {item.fitnessLevel || 'beginner'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.viewBtn, { backgroundColor: theme.blueLight, borderColor: theme.blue + '33' }]}
          onPress={() => navigation.navigate('AdminUserDetail', { userId: item._id })}>
          <Text style={[styles.viewBtnText, { color: theme.blueText }]}>👁️  View & Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.workoutsBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
          onPress={() => navigation.navigate('AdminWorkouts', { userId: item._id, userName: item.name })}>
          <Text style={[styles.workoutsBtnText, { color: theme.accent }]}>💪  Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder + '33' }]}
          onPress={() => handleDelete(item._id, item.name)}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>👥 All Users</Text>
        <Text style={[styles.count, { color: theme.textMuted }]}>{users.length} total</Text>
      </View>
      <View style={[styles.searchWrap, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TextInput style={[styles.search, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="🔍  Search by name or email..." placeholderTextColor={theme.textMuted} value={search} onChangeText={setSearch} />
      </View>
      {loading ? <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 60 }} /> : (
        <FlatList data={filtered} keyExtractor={item => item._id} renderItem={renderUser}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} tintColor={theme.accent} />}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>👥</Text><Text style={[styles.emptyText, { color: theme.textMuted }]}>No users found</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn: { fontWeight: '700', fontSize: 15 },
  title: { fontSize: 22, fontWeight: '900' },
  count: { fontSize: 12, marginTop: 2 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  search: { borderRadius: 12, padding: 11, fontSize: 13, borderWidth: 1 },
  card: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  name: { fontSize: 15, fontWeight: '800' },
  email: { fontSize: 12, marginTop: 3 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 },
  metaChip: { fontSize: 10, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  levelChip: { fontSize: 10, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, fontWeight: '700', textTransform: 'capitalize' },
  cardActions: { flexDirection: 'row', gap: 7 },
  viewBtn: { flex: 2, borderRadius: 9, padding: 8, alignItems: 'center', borderWidth: 1 },
  viewBtnText: { fontSize: 11, fontWeight: '700' },
  workoutsBtn: { flex: 2, borderRadius: 9, padding: 8, alignItems: 'center', borderWidth: 1 },
  workoutsBtnText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { borderRadius: 9, padding: 8, alignItems: 'center', paddingHorizontal: 12, borderWidth: 1 },
  deleteBtnText: { fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 15 },
});
