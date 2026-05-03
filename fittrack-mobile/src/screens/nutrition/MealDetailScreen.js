import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const MEAL_ICONS  = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };
const MEAL_COLORS = { Breakfast: '#F59E0B', Lunch: '#10B981', Dinner: '#6366F1', Snack: '#EC4899' };

export default function MealDetailScreen({ route, navigation }) {
  const { mealId } = route.params;
  const { theme }  = useTheme();
  const [meal, setMeal]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const res = await apiRequest(`/nutrition/${mealId}`);
        setMeal(res.data);
      } catch (e) {
        Alert.alert('Error', e.message);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [mealId]);

  const handleDelete = () =>
    Alert.alert('Delete Meal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/nutrition/${mealId}`, 'DELETE');
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const color = MEAL_COLORS[meal?.mealType] || '#6366F1';

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
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {MEAL_ICONS[meal?.mealType]}  {meal?.mealType}
        </Text>
        <Text style={[styles.date, { color: theme.textMuted }]}>
          📅 {new Date(meal?.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* CALORIE SUMMARY */}
        <View style={[styles.summaryCard, { backgroundColor: color + '15', borderColor: color + '40' }]}>
          <Text style={[styles.summaryTitle, { color }]}>Total Calories</Text>
          <Text style={[styles.summaryValue, { color }]}>{meal?.totalCalories} kcal</Text>
        </View>

        {/* FOOD ITEMS */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>🥘 Food Items</Text>
        {meal?.items?.map((item, index) => (
          <View key={index} style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.itemRow}>
              <Text style={[styles.itemName, { color: theme.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.itemCal, { color }]}>{item.calories * item.quantity} kcal</Text>
            </View>
            <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
              {item.quantity} {item.unit}  •  {item.calories} kcal each
            </Text>
            {/* Macros */}
            <View style={styles.macrosRow}>
              {[
                ['P', item.protein, '#10B981'],
                ['C', item.carbs,   '#F59E0B'],
                ['F', item.fat,     '#EF4444'],
              ].map(([label, value, col]) => (
                <View key={label} style={[styles.macroBadge, { backgroundColor: col + '20' }]}>
                  <Text style={[styles.macroLabel, { color: col }]}>{label}</Text>
                  <Text style={[styles.macroValue, { color: col }]}>{value || 0}g</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* NOTES */}
        {meal?.notes ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>📝 Notes</Text>
            <View style={[styles.notesCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.notesText, { color: theme.textSecondary }]}>{meal.notes}</Text>
            </View>
          </>
        ) : null}

        {/* ACTION BUTTONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
            onPress={() => navigation.navigate('EditMeal', { mealId })}
          >
            <Text style={[styles.editBtnText, { color: theme.accent }]}>✏️  Edit Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteBtnText}>🗑️  Delete</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn:      { fontWeight: '700', fontSize: 15 },
  title:        { fontSize: 22, fontWeight: '900' },
  date:         { fontSize: 12, marginTop: 4 },
  content:      { padding: 16, paddingBottom: 40 },
  summaryCard:  { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1 },
  summaryTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 36, fontWeight: '900' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 4 },
  itemCard:     { borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1 },
  itemRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemName:     { fontSize: 14, fontWeight: '700', flex: 1 },
  itemCal:      { fontSize: 14, fontWeight: '800' },
  itemMeta:     { fontSize: 11, marginBottom: 8 },
  macrosRow:    { flexDirection: 'row', gap: 8 },
  macroBadge:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center' },
  macroLabel:   { fontSize: 10, fontWeight: '800' },
  macroValue:   { fontSize: 12, fontWeight: '700' },
  notesCard:    { borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
  notesText:    { fontSize: 13, lineHeight: 20 },
  actions:      { flexDirection: 'row', gap: 10, marginTop: 8 },
  editBtn:      { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  editBtnText:  { fontSize: 14, fontWeight: '700' },
  deleteBtn:    { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  deleteBtnText:{ color: '#fff', fontSize: 14, fontWeight: '700' },
});