import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
  FlatList, Modal,
} from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snack: '🍎' };

const emptyItem = () => ({
  name: '', calories: '', protein: '', carbs: '', fat: '', quantity: '1', unit: 'serving',
});

export default function AdminNutritionFormScreen({ route, navigation }) {
  const { theme } = useTheme();
  const editMeal = route.params?.meal;  // existing meal when editing
  const isEditing = !!editMeal;

  const [mealType, setMealType] = useState('Breakfast');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // User picker state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest('/auth/admin/users');
        setUsers(res.data || []);
        if (isEditing && editMeal?.user) {
          // Set selected user from existing meal
          const existing = res.data.find(u => u._id === editMeal.user._id || u._id === editMeal.user);
          if (existing) setSelectedUser(existing);
        }
      } catch (e) { Alert.alert('Error', e.message); }
    };

    if (isEditing) {
      // Pre-fill form
      setMealType(editMeal.mealType);
      setNotes(editMeal.notes || '');
      setItems(editMeal.items.map(item => ({
        name: item.name,
        calories: String(item.calories),
        protein: String(item.protein || 0),
        carbs: String(item.carbs || 0),
        fat: String(item.fat || 0),
        quantity: String(item.quantity || 1),
        unit: item.unit || 'serving',
      })));
    }

    fetchUsers().finally(() => setFetchingInitial(false));
  }, []);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addFoodItem = () => setItems([...items, emptyItem()]);
  const removeFoodItem = (index) => {
    if (items.length === 1) return Alert.alert('Cannot remove', 'At least one item required');
    setItems(items.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!isEditing && !selectedUser) { Alert.alert('Error', 'Please select a user'); return false; }
    for (let i = 0; i < items.length; i++) {
      if (!items[i].name.trim()) { Alert.alert('Error', `Item ${i+1} needs a name`); return false; }
      if (!items[i].calories || isNaN(Number(items[i].calories))) { Alert.alert('Error', `Item ${i+1} needs valid calories`); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const formattedItems = items.map(item => ({
        name: item.name.trim(),
        calories: Number(item.calories),
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
        quantity: Number(item.quantity) || 1,
        unit: item.unit || 'serving',
      }));
      const totalCalories = formattedItems.reduce((sum, item) => sum + item.calories * item.quantity, 0);

      const url = isEditing ? `/nutrition/admin/${editMeal._id}` : '/nutrition/admin';
      const method = isEditing ? 'PUT' : 'POST';

      const body = {
        mealType,
        items: formattedItems,
        notes,
        totalCalories,
      };
      if (!isEditing) body.userId = selectedUser._id;

      await apiRequest(url, method, body);
      Alert.alert('Success', isEditing ? 'Meal updated!' : 'Meal added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (fetchingInitial) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: theme.admin }]}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {isEditing ? '✏️ Edit Meal' : '➕ Add Meal for User'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* User Selector – only when adding */}
        {!isEditing && (
          <>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Select User *</Text>
            <TouchableOpacity
              style={[styles.userSelector, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setShowUserPicker(true)}
            >
              <Text style={{ color: selectedUser ? theme.textPrimary : theme.textMuted }}>
                {selectedUser ? `${selectedUser.name} (${selectedUser.email})` : 'Tap to choose a user'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Meal Type */}
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
              <Text style={[styles.typeText, { color: mealType === type ? '#fff' : theme.textMuted }]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Food Items */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>Food Items</Text>
        {items.map((item, index) => (
          <View key={index} style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>🍽️  Item {index+1}</Text>
              <TouchableOpacity onPress={() => removeFoodItem(index)}>
                <Text style={[styles.removeBtn, { color: theme.dangerText }]}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Food name"
              placeholderTextColor={theme.textMuted}
              value={item.name}
              onChangeText={v => updateItem(index, 'name', v)}
            />
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Calories *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="0"
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
                  keyboardType="numeric"
                  value={item.quantity}
                  onChangeText={v => updateItem(index, 'quantity', v)}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.thirdInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Protein (g)</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]} placeholder="0" keyboardType="numeric" value={item.protein} onChangeText={v => updateItem(index, 'protein', v)} />
              </View>
              <View style={styles.thirdInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Carbs (g)</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]} placeholder="0" keyboardType="numeric" value={item.carbs} onChangeText={v => updateItem(index, 'carbs', v)} />
              </View>
              <View style={styles.thirdInput}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Fat (g)</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]} placeholder="0" keyboardType="numeric" value={item.fat} onChangeText={v => updateItem(index, 'fat', v)} />
              </View>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Unit (e.g. cup, grams)"
              placeholderTextColor={theme.textMuted}
              value={item.unit}
              onChangeText={v => updateItem(index, 'unit', v)}
            />
          </View>
        ))}
        <TouchableOpacity style={[styles.addItemBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]} onPress={addFoodItem}>
          <Text style={[styles.addItemText, { color: theme.accent }]}>➕  Add Another Item</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Optional notes..."
          placeholderTextColor={theme.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: theme.admin }, saving && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isEditing ? '💾  Update Meal' : '💾  Save Meal'}</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* ── USER PICKER MODAL ── */}
      <Modal visible={showUserPicker} animationType="slide" transparent onRequestClose={() => setShowUserPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Choose a User</Text>
              <TouchableOpacity onPress={() => setShowUserPicker(false)}>
                <Text style={[styles.modalClose, { color: theme.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Search users..."
              placeholderTextColor={theme.textMuted}
              value={userSearch}
              onChangeText={setUserSearch}
            />
            <FlatList
              data={filteredUsers.slice(0, 30)}
              keyExtractor={item => item._id}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.userItem, { borderBottomColor: theme.border }]}
                  onPress={() => { setSelectedUser(item); setUserSearch(''); setShowUserPicker(false); }}
                >
                  <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 11 }}>{item.email}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn:       { fontWeight: '700', fontSize: 15 },
  title:         { fontSize: 22, fontWeight: '900' },
  form:          { padding: 16, paddingBottom: 40 },
  label:         { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  userSelector:  { borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 8 },
  typeRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeBtn:       { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1, minWidth: 80 },
  typeIcon:      { fontSize: 20, marginBottom: 4 },
  typeText:      { fontSize: 11, fontWeight: '700' },
  itemCard:      { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  itemHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemTitle:     { fontSize: 14, fontWeight: '700' },
  removeBtn:     { fontSize: 12, fontWeight: '700' },
  input:         { borderRadius: 10, padding: 11, fontSize: 13, borderWidth: 1, marginBottom: 8 },
  inputLabel:    { fontSize: 11, marginBottom: 4 },
  row:           { flexDirection: 'row', gap: 8 },
  halfInput:     { flex: 1 },
  thirdInput:    { flex: 1 },
  notesInput:    { height: 80, textAlignVertical: 'top' },
  addItemBtn:    { borderRadius: 12, padding: 13, alignItems: 'center', marginBottom: 16, borderWidth: 1 },
  addItemText:   { fontSize: 13, fontWeight: '700' },
  submitBtn:     { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText:    { color: '#fff', fontSize: 15, fontWeight: '800' },
  // Modal styles
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent:  { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle:    { fontSize: 17, fontWeight: '800' },
  modalClose:    { fontSize: 20, fontWeight: '700', paddingHorizontal: 8 },
  searchInput:   { borderRadius: 10, padding: 11, fontSize: 13, borderWidth: 1, marginBottom: 10 },
  userItem:      { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});