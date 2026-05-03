import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };
const MEAL_COLORS = { Breakfast: '#F59E0B', Lunch: '#10B981', Dinner: '#6366F1', Snack: '#EC4899' };

export default function AdminNutritionScreen({ navigation }) {
  const { theme } = useTheme();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchMeals = useCallback(async () => {
    try {
      const res = await apiRequest('/nutrition/admin/all');
      setMeals(res.data || []);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchMeals(); }, [fetchMeals]));

  const handleDelete = (id, userName, mealType) =>
    Alert.alert(`Delete ${userName}'s ${mealType}?`, '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/nutrition/admin/${id}`, 'DELETE');
            setMeals(prev => prev.filter(m => m._id !== id));
          } catch (e) { Alert.alert('Error', e.message); }
        },
      },
    ]);

  const filtered = meals.filter(m => {
    const s = search.toLowerCase();
    return (
      m.user?.name?.toLowerCase().includes(s) ||
      m.user?.email?.toLowerCase().includes(s) ||
      m.mealType?.toLowerCase().includes(s) ||
      m.items?.some(i => i.name.toLowerCase().includes(s))
    );
  });

  const renderItem = ({ item }) => {
    const color = MEAL_COLORS[item.mealType] || '#6366F1';
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
            <Text style={styles.mealIcon}>{MEAL_ICONS[item.mealType] || '🍽️'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: theme.blueText }]}>👤 {item.user?.name || 'Unknown'}</Text>
            <Text style={[styles.mealType, { color: theme.textPrimary }]}>{item.mealType}</Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {item.items?.length} items • {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.calBadge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.calValue, { color }]}>{item.totalCalories}</Text>
            <Text style={[styles.calLabel, { color }]}>kcal</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
            onPress={() => navigation.navigate('AdminNutritionForm', { meal: item })}
          >
            <Text style={[styles.editBtnText, { color: theme.accent }]}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
            onPress={() => handleDelete(item._id, item.user?.name || 'User', item.mealType)}
          >
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        <Text style={[styles.title, { color: theme.textPrimary }]}>🥗 All Diet Plans</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{meals.length} meals across all users</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.search, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="🔍  Search by user, meal type, food..."
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeals(); }} tintColor={theme.accent} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🥗</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No meals found</Text>
            </View>
          }
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.admin }]}
        onPress={() => navigation.navigate('AdminNutritionForm', {})}
      >
        <Text style={styles.addBtnText}>➕  Add Meal for User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  header:        { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn:       { fontWeight: '700', fontSize: 15 },
  title:         { fontSize: 22, fontWeight: '900' },
  subtitle:      { fontSize: 12, marginTop: 2 },
  searchWrap:    { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, borderBottomWidth: 1 },
  search:        { borderRadius: 10, padding: 10, fontSize: 13, borderWidth: 1 },
  card:          { borderRadius: 14, padding: 13, marginBottom: 11, borderWidth: 1 },
  cardTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  iconWrap:      { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mealIcon:      { fontSize: 22 },
  userName:      { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  mealType:      { fontSize: 15, fontWeight: '800' },
  meta:          { fontSize: 11, marginTop: 2 },
  calBadge:      { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  calValue:      { fontSize: 16, fontWeight: '900' },
  calLabel:      { fontSize: 9, fontWeight: '600' },
  cardActions:   { flexDirection: 'row', gap: 7 },
  editBtn:       { flex: 1, borderRadius: 9, padding: 8, alignItems: 'center', borderWidth: 1 },
  editBtnText:   { fontSize: 12, fontWeight: '700' },
  deleteBtn:     { borderRadius: 9, padding: 8, alignItems: 'center', paddingHorizontal: 14, borderWidth: 1 },
  deleteBtnText: { fontSize: 13 },
  empty:         { alignItems: 'center', marginTop: 80 },
  emptyIcon:     { fontSize: 50, marginBottom: 12 },
  emptyText:     { fontSize: 16, fontWeight: '700' },
  addBtn:        { margin: 16, borderRadius: 14, padding: 16, alignItems: 'center' },
  addBtnText:    { color: '#fff', fontSize: 15, fontWeight: '800' },
});