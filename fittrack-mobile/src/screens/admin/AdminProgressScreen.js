import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  RefreshControl, TextInput, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest, { API_BASE_URL } from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

export default function AdminProgressScreen({ navigation }) {
  const { theme } = useTheme();
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProgress = useCallback(async () => {
    try {
      const res = await apiRequest('/progress/admin/all');
      const data = res.data || res;
      setProgressList(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchProgress(); }, [fetchProgress]));

  const handleDelete = (id, userName) =>
    Alert.alert(`Delete entry for ${userName}?`, '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/progress/admin/${id}`, 'DELETE');
            setProgressList(prev => prev.filter(p => p._id !== id));
          } catch (e) { Alert.alert('Error', e.message); }
        },
      },
    ]);

  const filtered = progressList.filter(p => {
    const s = search.toLowerCase();
    return (
      (p.user?.name?.toLowerCase().includes(s)) ||
      (p.user?.email?.toLowerCase().includes(s)) ||
      (p.notes?.toLowerCase().includes(s))
    );
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return API_BASE_URL.replace('/api', '') + '/' + imagePath;
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: theme.blue }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.dateBadge, { backgroundColor: theme.blueLight }]}>
          <Text style={[styles.dateText, { color: theme.blueText }]}>
            📅 {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.userText, { color: theme.blueText }]}>
          👤 {item.user?.name || 'Unknown'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.blue }]}>{item.weight}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>kg</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.accent }]}>{item.calories}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>cal</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.purple }]}>{item.chest || '—'}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>chest</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.purple }]}>{item.waist || '—'}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>waist</Text>
        </View>
      </View>

      {item.notes ? (
        <Text style={[styles.notes, { color: theme.textSecondary }]}>📝 {item.notes}</Text>
      ) : null}

      {/* Image thumbnail */}
      {item.image ? (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.blueLight, borderColor: theme.blue }]}
          onPress={() => navigation.navigate('AdminProgressForm', { item })}
        >
          <Text style={[styles.editText, { color: theme.blueText }]}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
          onPress={() => handleDelete(item._id, item.user?.name || 'User')}
        >
          <Text style={[styles.deleteText, { color: theme.dangerText }]}>🗑️ Delete</Text>
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>📈 All Progress Entries</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{progressList.length} entries across all users</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.search, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="🔍  Search by user, notes..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.blue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProgress(); }} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No progress entries found</Text>
            </View>
          }
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.admin }]}
        onPress={() => navigation.navigate('AdminProgressForm', {})}
      >
        <Text style={styles.addButtonText}>+ Add Progress for User</Text>
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
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  dateText: { fontSize: 12, fontWeight: '700' },
  userText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 6 },
  statBox: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2 },
  notes: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  imageWrap: { alignItems: 'center', marginBottom: 12 },
  thumbnail: { width: 120, height: 120, borderRadius: 10 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  editText: { fontWeight: '700', fontSize: 13 },
  deleteBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  deleteText: { fontWeight: '700', fontSize: 13 },
  emptyCard: { borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  addButton: { margin: 16, padding: 16, borderRadius: 14, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});