import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };

// Empty food item template
const emptyItem = () => ({
  name: '', calories: '', protein: '', carbs: '', fat: '', quantity: '1', unit: 'serving',
});

export default function AddMealScreen({ navigation }) {
  const { theme } = useTheme();
  const [mealType, setMealType]   = useState('Breakfast');
  const [notes, setNotes]         = useState('');
  const [items, setItems]         = useState([emptyItem()]);
  const [loading, setLoading]     = useState(false);

  // Update a specific field of a specific food item
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addFoodItem = () => setItems([...items, emptyItem()]);

  const removeFoodItem = (index) => {
    if (items.length === 1) {
      Alert.alert('Cannot remove', 'At least one food item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Form validation before submitting
  const validate = () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name.trim()) {
        Alert.alert('Validation Error', `Food item ${i + 1} needs a name`);
        return false;
      }
      if (!item.calories || isNaN(Number(item.calories))) {
        Alert.alert('Validation Error', `Food item ${i + 1} needs valid calories`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Format items - convert string inputs to numbers
      const formattedItems = items.map(item => ({
        name:     item.name.trim(),
        calories: Number(item.calories),
        protein:  Number(item.protein)  || 0,
        carbs:    Number(item.carbs)    || 0,
        fat:      Number(item.fat)      || 0,
        quantity: Number(item.quantity) || 1,
        unit:     item.unit || 'serving',
      }));

      await apiRequest('/nutrition', 'POST', {
        mealType,
        items: formattedItems,
        notes,
      });

      Alert.alert('Success! 🎉', 'Meal logged successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
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
        <Text style={[styles.title, { color: theme.textPrimary }]}>➕ Log a Meal</Text>
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
            <View style={styles.itemHeader}>
              <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>🍽️  Item {index + 1}</Text>
              <TouchableOpacity onPress={() => removeFoodItem(index)}>
                <Text style={[styles.removeBtn, { color: theme.dangerText }]}>✕ Remove</Text>
              </TouchableOpacity>
            </View>

            {/* Food name */}
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Food name (e.g. Oats)"
              placeholderTextColor={theme.textMuted}
              value={item.name}
              onChangeText={v => updateItem(index, 'name', v)}
            />

            {/* Calories and quantity row */}
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Calories *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="150"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={item.calories}
                  onChangeText={v => updateItem(index, 'calories', v)}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Quantity</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="1"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={item.quantity}
                  onChangeText={v => updateItem(index, 'quantity', v)}
                />
              </View>
            </View>

            {/* Macros row */}
            <View style={styles.row}>
              <View style={styles.thirdInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Protein (g)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={item.protein}
                  onChangeText={v => updateItem(index, 'protein', v)}
                />
              </View>
              <View style={styles.thirdInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Carbs (g)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={item.carbs}
                  onChangeText={v => updateItem(index, 'carbs', v)}
                />
              </View>
              <View style={styles.thirdInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Fat (g)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={item.fat}
                  onChangeText={v => updateItem(index, 'fat', v)}
                />
              </View>
            </View>

            {/* Unit */}
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Unit (e.g. cup, grams, piece)"
              placeholderTextColor={theme.textMuted}
              value={item.unit}
              onChangeText={v => updateItem(index, 'unit', v)}
            />
          </View>
        ))}

        {/* ADD ANOTHER ITEM */}
        <TouchableOpacity
          style={[styles.addItemBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
          onPress={addFoodItem}
        >
          <Text style={[styles.addItemText, { color: theme.accent }]}>➕  Add Another Food Item</Text>
        </TouchableOpacity>

        {/* NOTES */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Any notes about this meal..."
          placeholderTextColor={theme.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.accent }, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>💾  Save Meal</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn:     { fontWeight: '700', fontSize: 15 },
  title:       { fontSize: 22, fontWeight: '900' },
  form:        { padding: 16, paddingBottom: 40 },
  label:       { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  typeRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeBtn:     { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1, minWidth: 80 },
  typeIcon:    { fontSize: 20, marginBottom: 4 },
  typeText:    { fontSize: 11, fontWeight: '700' },
  itemCard:    { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  itemHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemTitle:   { fontSize: 14, fontWeight: '700' },
  removeBtn:   { fontSize: 12, fontWeight: '700' },
  input:       { borderRadius: 10, padding: 11, fontSize: 13, borderWidth: 1, marginBottom: 8 },
  inputLabel:  { fontSize: 11, marginBottom: 4 },
  row:         { flexDirection: 'row', gap: 8 },
  halfInput:   { flex: 1 },
  thirdInput:  { flex: 1 },
  notesInput:  { height: 80, textAlignVertical: 'top' },
  addItemBtn:  { borderRadius: 12, padding: 13, alignItems: 'center', marginBottom: 16, borderWidth: 1 },
  addItemText: { fontSize: 13, fontWeight: '700' },
  submitBtn:   { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});