import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../services/ThemeContext';
import apiRequest, { API_BASE_URL } from '../../services/api';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';

export default function ProgressFormScreen({ navigation, route }) {
  const { theme } = useTheme();
  const editItem = route.params?.item;
  const isEditing = !!editItem;

  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState(editItem?.weight?.toString() || '');
  const [calories, setCalories] = useState(editItem?.calories?.toString() || '');
  const [chest, setChest] = useState(editItem?.chest?.toString() || '');
  const [waist, setWaist] = useState(editItem?.waist?.toString() || '');
  const [hips, setHips] = useState(editItem?.hips?.toString() || '');
  const [notes, setNotes] = useState(editItem?.notes || '');

  const [image, setImage] = useState(null);           // newly picked image
  const [existingImage, setExistingImage] = useState(editItem?.image || null); // stored image path
  const [keepExistingImage, setKeepExistingImage] = useState(true); // flag

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
      setKeepExistingImage(false); // new image selected, discard old
    }
  };

  const removeImage = () => {
    setImage(null);
    setExistingImage(null);
    setKeepExistingImage(false);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return API_BASE_URL.replace('/api', '') + '/' + imagePath;
  };

  const handleSubmit = async () => {
    if (!weight || !calories) {
      Alert.alert('Error', 'Weight and Calories are required!');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('weight', weight);
      formData.append('calories', calories);
      if (chest) formData.append('chest', chest);
      if (waist) formData.append('waist', waist);
      if (hips) formData.append('hips', hips);
      if (notes) formData.append('notes', notes);

      // Image logic
      if (!keepExistingImage) {
        if (image) {
          formData.append('image', {
            uri: image.uri,
            type: 'image/jpeg',
            name: 'progress.jpg',
          });
        } else {
          formData.append('image', ''); 
        }
      }

      const url = isEditing ? `/progress/${editItem._id}` : '/progress';
      const method = isEditing ? 'PUT' : 'POST';

      await apiRequest(url, method, formData, true); // isFormData=true
      Alert.alert('Success', isEditing ? '✅ Progress updated!' : '✅ Progress logged!');
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
        <View style={styles.headerTop}>
          <BackToHomeButton goHome />
          <ThemeToggleButton />
        </View>
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

      {/* Image Upload */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.admin }]}>📸 Progress Photo (optional)</Text>

        {(existingImage && keepExistingImage) && (
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <Image
              source={{ uri: getImageUrl(existingImage) }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity onPress={() => { setKeepExistingImage(false); setExistingImage(null); }}>
              <Text style={[styles.removeImage, { color: theme.dangerText }]}>✕ Remove photo</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.imagePicker, { borderColor: theme.border, backgroundColor: theme.inputBg }]}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>📷</Text>
              <Text style={[styles.imageText, { color: theme.textMuted }]}>
                {existingImage && keepExistingImage ? 'Tap to replace photo' : 'Tap to select photo'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {image && (
          <TouchableOpacity onPress={() => setImage(null)}>
            <Text style={[styles.removeImage, { color: theme.dangerText }]}>✕ Remove photo</Text>
          </TouchableOpacity>
        )}
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 4 },
  card: { margin: 16, marginBottom: 4, padding: 16, borderRadius: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 14 },
  notesInput: { height: 90, textAlignVertical: 'top' },
  imagePicker: { borderWidth: 1, borderRadius: 12, borderStyle: 'dashed', overflow: 'hidden' },
  previewImage: { width: '100%', height: 200, resizeMode: 'cover' },
  imagePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center' },
  imageIcon: { fontSize: 36, marginBottom: 8 },
  imageText: { fontSize: 14 },
  removeImage: { textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: '700' },
  submitBtn: { margin: 16, padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 40 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});