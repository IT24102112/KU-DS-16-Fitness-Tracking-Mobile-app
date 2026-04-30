import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  RefreshControl, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

// Meal type icons
const MEAL_ICONS = {
  Breakfast: '🌅',
  Lunch:     '☀️',
  Dinner:    '🌙',
  Snack:     '🍎',
};

const MEAL_COLORS = {
  Breakfast: '#F59E0B',
  Lunch:     '#10B981',
  Dinner:    '#6366F1',
  Snack:     '#EC4899',
};

export default function NutritionHomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [meals, setMeals]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('All');

  // Fetch meals every time screen comes into focus
  const fetchMeals = useCallback(async () => {
    try {
      const res = await apiRequest('/nutrition');
      setMeals(res.data || []);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMeals();
    }, [fetchMeals])
  );

  // Delete a meal with confirmation alert
  const handleDelete = (id, mealType) =>
    Alert.alert(
      `Delete ${mealType}?`,
      'This meal log will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(`/nutrition/${id}`, 'DELETE');
              // Remove from local state without refetching
              setMeals(prev => prev.filter(m => m._id !== id));
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );

  // Filter meals by type and search text
  const filtered = meals.filter(m => {
    const matchSearch = m.mealType?.toLowerCase().includes(search.toLowerCase()) ||
      m.items?.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'All' || m.mealType === filter;
    return matchSearch && matchFilter;
  });

  // Total calories for filtered meals
  const totalCalories = filtered.reduce((sum, m) => sum + (m.totalCalories || 0), 0);

  const renderMeal = ({ item }) => {
    const color = MEAL_COLORS[item.mealType] || '#6366F1';
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => navigation.navigate('MealDetail', { mealId: item._id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          {/* Meal type icon badge */}
          <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
            <Text style={styles.mealIcon}>{MEAL_ICONS[item.mealType] || '🍽️'}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.mealType, { color: theme.textPrimary }]}>{item.mealType}</Text>
            <Text style={[styles.mealMeta, { color: theme.textMuted }]}>
              {item.items?.length} item{item.items?.length !== 1 ? 's' : ''}  •  {new Date(item.date).toLocaleDateString()}
            </Text>
            {item.notes ? (
              <Text style={[styles.notes, { color: theme.textMuted }]} numberOfLines={1}>
                📝 {item.notes}
              </Text>
            ) : null}
          </View>

          {/* Calorie badge */}
          <View style={[styles.calBadge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.calValue, { color }]}>{item.totalCalories}</Text>
            <Text style={[styles.calLabel, { color }]}>kcal</Text>
          </View>
        </View>

        {/* Food items preview */}
        <Text style={[styles.itemsPreview, { color: theme.textMuted }]}>
          🥘 {item.items?.slice(0, 3).map(i => i.name).join(', ')}
          {item.items?.length > 3 ? ` +${item.items.length - 3} more` : ''}
        </Text>

        {/* Action buttons*/}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
            onPress={() => navigation.navigate('EditMeal', { mealId: item._id })}
          >
            <Text style={[styles.editBtnText, { color: theme.accent }]}>✏️  Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
            onPress={() => handleDelete(item._id, item.mealType)}
          >
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: theme.accent }]}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>🥗 Nutrition Log</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {meals.length} meal{meals.length !== 1 ? 's' : ''} logged
        </Text>

        {/* Daily calorie summary card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Showing total</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>{totalCalories} kcal</Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={[styles.searchWrap, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.search, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="🔍  Search meals or food items..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* FILTER TABS */}
      <View style={[styles.filterRow, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
              filter === type && { backgroundColor: theme.accent, borderColor: theme.accent },
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: filter === type ? '#fff' : theme.textMuted },
            ]}>
              {type === 'All' ? 'All' : `${MEAL_ICONS[type]} ${type}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MEAL LIST */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderMeal}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchMeals(); }}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🥗</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No meals logged yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>Tap the button below to log your first meal</Text>
            </View>
          }
        />
      )}

      {/* ADD MEAL BUTTON */}
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.accent }]}
        onPress={() => navigation.navigate('AddMeal')}
      >
        <Text style={styles.addBtnText}>➕  Log a Meal</Text>
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
  summaryCard:   { marginTop: 12, borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1 },
  summaryLabel:  { fontSize: 13 },
  summaryValue:  { fontSize: 20, fontWeight: '900' },
  searchWrap:    { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, borderBottomWidth: 1 },
  search:        { borderRadius: 10, padding: 10, fontSize: 13, borderWidth: 1 },
  filterRow:     { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, gap: 6, borderBottomWidth: 1 },
  filterBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  filterText:    { fontSize: 10, fontWeight: '600' },
  card:          { borderRadius: 14, padding: 13, marginBottom: 11, borderWidth: 1 },
  cardTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  iconWrap:      { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mealIcon:      { fontSize: 22 },
  mealType:      { fontSize: 15, fontWeight: '800' },
  mealMeta:      { fontSize: 11, marginTop: 2 },
  notes:         { fontSize: 11, marginTop: 3 },
  calBadge:      { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  calValue:      { fontSize: 16, fontWeight: '900' },
  calLabel:      { fontSize: 9, fontWeight: '600' },
  itemsPreview:  { fontSize: 11, marginBottom: 10 },
  cardActions:   { flexDirection: 'row', gap: 7 },
  editBtn:       { flex: 1, borderRadius: 9, padding: 8, alignItems: 'center', borderWidth: 1 },
  editBtnText:   { fontSize: 12, fontWeight: '700' },
  deleteBtn:     { borderRadius: 9, padding: 8, alignItems: 'center', paddingHorizontal: 14, borderWidth: 1 },
  deleteBtnText: { fontSize: 13 },
  empty:         { alignItems: 'center', marginTop: 80 },
  emptyIcon:     { fontSize: 50, marginBottom: 12 },
  emptyText:     { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySubtext:  { fontSize: 13 },
  addBtn:        { margin: 16, borderRadius: 14, padding: 16, alignItems: 'center' },
  addBtnText:    { color: '#fff', fontSize: 15, fontWeight: '800' },
});