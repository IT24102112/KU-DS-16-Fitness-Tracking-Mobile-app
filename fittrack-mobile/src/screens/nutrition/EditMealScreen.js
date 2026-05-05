import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };

export default function EditMealScreen({ route, navigation }) {
  const { mealId } = route.params;
  const { theme }  = useTheme();
  const [mealType, setMealType] = useState('Breakfast');
  const [notes, setNotes]       = useState('');
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // Load existing meal data when screen opens
  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const res = await apiRequest(`/nutrition/${mealId}`);
        const meal = res.data;
        setMealType(meal.mealType);
        setNotes(meal.notes || '');
        // Convert numbers back to strings for TextInput
        setItems(meal.items.map(item => ({
          name:     item.name,
          calories: String(item.calories),
          protein:  String(item.protein || 0),
          carbs:    String(item.carbs   || 0),
          fat:      String(item.fat     || 0),
          quantity: String(item.quantity || 1),
          unit:     item.unit || 'serving',
        })));
      } catch (e) {
        Alert.alert('Error', e.message);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [mealId]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const formattedItems = items.map(item => ({
        name:     item.name.trim(),
        calories: Number(item.calories),
        protein:  Number(item.protein)  || 0,
        carbs:    Number(item.carbs)    || 0,
        fat:      Number(item.fat)      || 0,
        quantity: Number(item.quantity) || 1,
        unit:     item.unit || 'serving',
      }));

      // Recalculate total calories on update
      const totalCalories = formattedItems.reduce(
        (sum, item) => sum + item.calories * item.quantity, 0
      );

      await apiRequest(`/nutrition/${mealId}`, 'PUT', {
        mealType,
        items: formattedItems,
        notes,
        totalCalories,
      });

      Alert.alert('Updated! ✅', 'Meal updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

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
        <Text style={[styles.title, { color: theme.textPrimary }]}>✏️ Edit Meal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

        {/* MEAL TYPE SELECTOR */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>Meal Type</Text>
        <View style={styles.typeRow}>
          {MEAL_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setMealType(type)}
              style={[
                styles.typeBtn,
                { backgroundColor: theme.card, borderColor: theme.border },
                mealType === type && { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
            >
              <Text style={styles.typeIcon}>{MEAL_ICONS[type]}</Text>
              <Text style={[styles.typeText, { color: mealType === type ? '#fff' : theme.textMuted }]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FOOD ITEMS */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>Food Items</Text>
        {items.map((item, index) => (
          <View key={index} style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>🍽️  Item {index + 1}</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Food name"
              placeholderTextColor={theme.textMuted}
              value={item.name}
              onChangeText={v => updateItem(index, 'name', v)}
            />
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Calories</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  keyboardType="numeric"
                  value={item.calories}
                  onChangeText={v => updateItem(index, 'calories', v)}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Quantity</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  keyboardType="numeric"
                  value={item.quantity}
                  onChangeText={v => updateItem(index, 'quantity', v)}
                />
              </View>
            </View>
          </View>
        ))}

        {/* NOTES */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Any notes..."
          placeholderTextColor={theme.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.accent }, saving && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>💾  Update Meal</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:     { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn:    { fontWeight: '700', fontSize: 15 },
  title:      { fontSize: 22, fontWeight: '900' },
  form:       { padding: 16, paddingBottom: 40 },
  label:      { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  typeRow:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeBtn:    { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1, minWidth: 80 },
  typeIcon:   { fontSize: 20, marginBottom: 4 },
  typeText:   { fontSize: 11, fontWeight: '700' },
  itemCard:   { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  itemTitle:  { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  input:      { borderRadius: 10, padding: 11, fontSize: 13, borderWidth: 1, marginBottom: 8 },
  inputLabel: { fontSize: 11, marginBottom: 4 },
  row:        { flexDirection: 'row', gap: 8 },
  halfInput:  { flex: 1 },
  notesInput: { height: 80, textAlignVertical: 'top' },
  submitBtn:  { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});