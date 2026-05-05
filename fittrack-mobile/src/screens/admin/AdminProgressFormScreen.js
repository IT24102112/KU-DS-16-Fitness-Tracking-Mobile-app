import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator, Image,
  FlatList, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../services/ThemeContext';
import apiRequest from '../../services/api';
import ThemeToggleButton from '../../components/ThemeToggleButton';

export default function AdminProgressFormScreen({ navigation, route }) {
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
  const [image, setImage] = useState(null);

  // User picker
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(editItem?.user || null);
  const [userSearch, setUserSearch] = useState('');
  const [showUserPicker, setShowUserPicker] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest('/auth/admin/users');
        setUsers(res.data || []);
        if (isEditing && editItem?.user) {
          // Ensure selectedUser is set from edit item (populated user object)
          const existingUser = res.data.find(u => u._id === editItem.user._id || u._id === editItem.user);
          if (existingUser) setSelectedUser(existingUser);
        }
      } catch (e) { Alert.alert('Error', e.message); }
    };
    fetchUsers();
  }, []);

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
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser && !isEditing) {
      Alert.alert('Error', 'Please select a user');
      return;
    }
    if (!weight || !calories) {
      Alert.alert('Error', 'Weight and Calories are required!');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (!isEditing) formData.append('userId', selectedUser._id);
      formData.append('weight', weight);
      formData.append('calories', calories);
      if (chest) formData.append('chest', chest);
      if (waist) formData.append('waist', waist);
      if (hips) formData.append('hips', hips);
      if (notes) formData.append('notes', notes);
      if (image) {
        formData.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'progress.jpg',
        });
      }

      const url = isEditing
        ? `/progress/admin/${editItem._id}`
        : '/progress/admin';
      const method = isEditing ? 'PUT' : 'POST';

      await apiRequest(url, method, formData, true); // true = isFormData

      Alert.alert('Success', isEditing ? '✅ Progress updated!' : '✅ Progress logged!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: theme.admin }]}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {isEditing ? '✏️ Edit Progress' : '➕ Add Progress for User'}
        </Text>
      </View>

      {/* User Selector (only when adding new, not editing) */}
      {!isEditing && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.admin }]}>👤 Select User *</Text>
          <TouchableOpacity
            style={[styles.userSelector, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
            onPress={() => setShowUserPicker(true)}
          >
            <Text style={{ color: selectedUser ? theme.textPrimary : theme.textMuted }}>
              {selectedUser ? `${selectedUser.name} (${selectedUser.email})` : 'Tap to choose a user'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
        <TouchableOpacity
          style={[styles.imagePicker, { borderColor: theme.border, backgroundColor: theme.inputBg }]}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>📷</Text>
              <Text style={[styles.imageText, { color: theme.textMuted }]}>Tap to select photo</Text>
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
        style={[styles.submitBtn, { backgroundColor: theme.admin }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>{isEditing ? '✅ Update Progress' : '➕ Log Progress'}</Text>
        }
      </TouchableOpacity>

      {/* ── USER PICKER MODAL ── */}
      <Modal
        visible={showUserPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowUserPicker(false)}
      >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, marginBottom: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  backBtn: { fontWeight: '700', fontSize: 15 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  card: { margin: 16, marginBottom: 4, padding: 16, borderRadius: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  userSelector: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4 },
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

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalClose: { fontSize: 20, fontWeight: '700', paddingHorizontal: 8 },
  searchInput: { borderRadius: 10, padding: 11, fontSize: 13, borderWidth: 1, marginBottom: 10 },
  userItem: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});