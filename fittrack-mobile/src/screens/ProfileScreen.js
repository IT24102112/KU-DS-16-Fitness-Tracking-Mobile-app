import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';
import apiRequest from '../services/api';
import BackToHomeButton from '../components/BackToHomeButton';
import ThemeToggleButton from '../components/ThemeToggleButton';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    name: user?.name || '', age: user?.age?.toString() || '',
    weight: user?.weight?.toString() || '', height: user?.height?.toString() || '',
    fitnessLevel: user?.fitnessLevel || 'beginner',
    currentPassword: '', newPassword: '', confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('profile');
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleUpdateProfile = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name is required');
    try {
      setLoading(true);
      const res = await apiRequest('/auth/profile', 'PUT', {
        name: form.name,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        fitnessLevel: form.fitnessLevel,
      });
      updateUser(res.data);
      Alert.alert('Success', 'Profile updated!');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    if (!form.currentPassword || !form.newPassword) return Alert.alert('Error', 'Fill in all password fields');
    if (form.newPassword.length < 6) return Alert.alert('Error', 'New password must be at least 6 characters');
    if (form.newPassword !== form.confirmNewPassword) return Alert.alert('Error', 'Passwords do not match');
    try {
      setLoading(true);
      await apiRequest('/auth/change-password', 'PUT', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      Alert.alert('Success', 'Password changed!');
      update('currentPassword', ''); update('newPassword', ''); update('confirmNewPassword', '');
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = () =>
    Alert.alert('⚠️ Delete Account', 'This permanently deletes your account and all data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Forever', style: 'destructive', onPress: async () => {
        try { await apiRequest('/auth/profile', 'DELETE'); logout(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);

  const inp = [styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.topNav, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <BackToHomeButton goHome />
        <ThemeToggleButton />
      </View>

      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name}</Text>
        <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user?.email}</Text>
        <View style={[styles.levelBadge, { backgroundColor: theme.accentLight }]}>
          <Text style={[styles.levelBadgeText, { color: theme.accent }]}>
            💪 {user?.fitnessLevel?.charAt(0).toUpperCase() + user?.fitnessLevel?.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.tabRow, { backgroundColor: theme.card, margin: 16, borderRadius: 12 }]}>
        <TouchableOpacity style={[styles.tab, tab === 'profile' && { backgroundColor: theme.accent }]} onPress={() => setTab('profile')}>
          <Text style={[styles.tabText, { color: tab === 'profile' ? '#fff' : theme.textMuted }]}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'password' && { backgroundColor: theme.accent }]} onPress={() => setTab('password')}>
          <Text style={[styles.tabText, { color: tab === 'password' ? '#fff' : theme.textMuted }]}>Password</Text>
        </TouchableOpacity>
      </View>

      {tab === 'profile' ? (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginHorizontal: 16 }]}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Full Name</Text>
          <TextInput style={inp} value={form.name} onChangeText={v => update('name', v)} placeholderTextColor={theme.textMuted} />
          <View style={styles.row}>
            {[['age','Age'],['weight','Weight (kg)'],['height','Height (cm)']].map(([k,lbl],i) => (
              <View key={k} style={{ flex: 1, marginRight: i < 2 ? 8 : 0 }}>
                <Text style={[styles.label, { color: theme.textMuted }]}>{lbl}</Text>
                <TextInput style={inp} value={form[k]} onChangeText={v => update(k, v)} keyboardType="numeric" placeholderTextColor={theme.textMuted} />
              </View>
            ))}
          </View>
          <Text style={[styles.label, { color: theme.textMuted }]}>Fitness Level</Text>
          <View style={styles.row}>
            {LEVELS.map((l, i) => (
              <TouchableOpacity key={l} onPress={() => update('fitnessLevel', l)}
                style={[styles.levelBtn, { backgroundColor: theme.inputBg, borderColor: theme.border, marginRight: i < 2 ? 6 : 0 },
                  form.fitnessLevel === l && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                <Text style={[styles.levelText, { color: form.fitnessLevel === l ? '#fff' : theme.textMuted }]}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleUpdateProfile} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginHorizontal: 16 }]}>
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirmNewPassword','Confirm New Password']].map(([k,lbl]) => (
            <View key={k}>
              <Text style={[styles.label, { color: theme.textMuted }]}>{lbl}</Text>
              <TextInput style={inp} value={form[k]} onChangeText={v => update(k, v)} secureTextEntry placeholder={lbl} placeholderTextColor={theme.textMuted} />
            </View>
          ))}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleChangePassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Change Password</Text>}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.dangerZone}>
        <Text style={[styles.dangerTitle, { color: theme.textMuted }]}>Account Actions</Text>
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
          <Text style={[styles.logoutBtnText, { color: theme.textPrimary }]}>🚪  Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]} onPress={handleDeleteAccount}>
          <Text style={[styles.deleteBtnText, { color: theme.dangerText }]}>🗑️  Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1 },
  header: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  userName: { fontSize: 22, fontWeight: '800' },
  userEmail: { fontSize: 14, marginTop: 4 },
  levelBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
  levelBadgeText: { fontSize: 13, fontWeight: '700' },
  tabRow: { flexDirection: 'row', padding: 4 },
  tab: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  tabText: { fontWeight: '700', fontSize: 14 },
  card: { borderRadius: 16, padding: 20, borderWidth: 1 },
  label: { fontSize: 12, marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1 },
  row: { flexDirection: 'row', marginTop: 4 },
  levelBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  levelText: { fontSize: 12 },
  saveBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  dangerZone: { margin: 16, marginTop: 24, marginBottom: 40 },
  dangerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  logoutBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  logoutBtnText: { fontSize: 15, fontWeight: '600' },
  deleteBtn: { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  deleteBtnText: { fontSize: 15, fontWeight: '600' },
});
