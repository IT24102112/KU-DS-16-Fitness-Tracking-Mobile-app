import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { useTheme } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';
import apiRequest from '../services/api';

export default function ProgressFormScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const editItem = route.params?.item;
  const isEditing = !!editItem;

  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState(editItem?.weight?.toString() || '');
  const [calories, setCalories] = useState(editItem?.calories?.toString() || '');
  const [chest, setChest] = useState(editItem?.chest?.toString() || '');
  const [waist, setWaist] = useState(editItem?.waist?.toString() || '');
  const [hips, setHips] = useState(editItem?.hips?.toString() || '');
  const [notes, setNotes] = useState(editItem?.notes || '');

  const handleSubmit = async () => {
    if (!weight || !calories) {
      Alert.alert('Error', 'Weight and Calories are required!');
      return;
    }
    setLoading(true);
    try {
      const data = { userId: user._id, weight, calories, chest, waist, hips, notes };
      if (isEditing) {
        await apiRequest(`/progress/${editItem._id}`, 'PUT', data);
        Alert.alert('Success', '✅ Progress updated!');
      } else {
        await apiRequest('/progress', 'POST', data);
        Alert.alert('Success', '✅ Progress logged!');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.blue }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {isEditing ? '✏️ Edit Progress' : '➕ Log Progress'}
        </Text>
        <Text style={[styles.headerSub, { color: theme.textMuted }]}>
          {isEditing ? 'Update your entry' : 'Track your fitness journey'}
        </Text>
      </View>

      {/* Required Fields */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.blue }]}>📊 Required Info</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Weight (kg) *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 70"
          placeholderTextColor={theme.textMuted}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Calories *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 2000"
          placeholderTextColor={theme.textMuted}
          value={calories}
          onChangeText={setCalories}
          keyboardType="numeric"
        />
      </View>

      {/* Measurements */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.purple }]}>📏 Measurements (optional)</Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Chest (cm)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 90"
          placeholderTextColor={theme.textMuted}
          value={chest}
          onChangeText={setChest}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Waist (cm)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 75"
          placeholderTextColor={theme.textMuted}
          value={waist}
          onChangeText={setWaist}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Hips (cm)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 95"
          placeholderTextColor={theme.textMuted}
          value={hips}
          onChangeText={setHips}
          keyboardType="numeric"
        />
      </View>

      {/* Notes */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.accent }]}>📝 Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="How are you feeling today?"
          placeholderTextColor={theme.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: theme.blue }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>{isEditing ? '✅ Update Progress' : '➕ Log Progress'}</Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, marginBottom: 4 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, fontWeight: '700' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 4 },
  card: { margin: 16, marginBottom: 4, padding: 16, borderRadius: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 14 },
  notesInput: { height: 90, textAlignVertical: 'top' },
  submitBtn: { margin: 16, padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 40 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});