// AdminUserDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEVEL_COLORS = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

export default function AdminUserDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiRequest(`/auth/admin/users/${userId}`);
        setUser(res.data);
        setForm({ name: res.data.name || '', email: res.data.email || '', age: res.data.age?.toString() || '', weight: res.data.weight?.toString() || '', height: res.data.height?.toString() || '', fitnessLevel: res.data.fitnessLevel || 'beginner', gender: res.data.gender || '' });
      } catch (e) { Alert.alert('Error', e.message); }
      finally { setLoading(false); }
    };
    fetch();
  }, [userId]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name is required');
    try {
      setSaving(true);
      await apiRequest(`/auth/admin/users/${userId}`, 'PUT', { name: form.name, email: form.email, age: form.age ? Number(form.age) : undefined, weight: form.weight ? Number(form.weight) : undefined, height: form.height ? Number(form.height) : undefined, fitnessLevel: form.fitnessLevel });
      Alert.alert('Success', 'User updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = () =>
    Alert.alert(`Delete "${user?.name}"?`, 'Permanently deletes user and all data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiRequest(`/auth/admin/users/${userId}`, 'DELETE'); navigation.goBack(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);

  if (loading) return <ActivityIndicator size="large" color={theme.accent} style={{ flex: 1, backgroundColor: theme.bg }} />;
  const levelColor = LEVEL_COLORS[form.fitnessLevel] || '#10B981';
  const inp = { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary, borderRadius: 10, padding: 11, fontSize: 13, borderWidth: 1, marginBottom: 2 };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ backgroundColor: theme.headerBg, paddingTop: 52, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: theme.admin, fontWeight: '700', fontSize: 15 }}>‹  Back</Text>
          </TouchableOpacity>
          <ThemeToggleButton />
        </View>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: levelColor, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={{ color: theme.textMuted, fontSize: 11 }}>
            Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={{ margin: 16, backgroundColor: theme.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: theme.border }}>
        <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>✏️ Edit User Info</Text>
        {[['name','Full Name'],['email','Email']].map(([k,lbl]) => (
          <View key={k}>
            <Text style={{ color: theme.textMuted, fontSize: 11, marginBottom: 5, marginTop: 12 }}>{lbl}</Text>
            <TextInput style={inp} value={form[k]} onChangeText={v => update(k, v)} placeholderTextColor={theme.textMuted} autoCapitalize="none" />
          </View>
        ))}
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          {[['age','Age'],['weight','kg'],['height','cm']].map(([k,lbl],i) => (
            <View key={k} style={{ flex: 1, marginRight: i < 2 ? 8 : 0 }}>
              <Text style={{ color: theme.textMuted, fontSize: 11, marginBottom: 5, marginTop: 12 }}>{lbl}</Text>
              <TextInput style={inp} value={form[k]} onChangeText={v => update(k, v)} keyboardType="numeric" placeholderTextColor={theme.textMuted} />
            </View>
          ))}
        </View>
        <Text style={{ color: theme.textMuted, fontSize: 11, marginBottom: 8, marginTop: 14 }}>Fitness Level</Text>
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {LEVELS.map(l => (
            <TouchableOpacity key={l} onPress={() => update('fitnessLevel', l)}
              style={{ flex: 1, padding: 9, borderRadius: 9, backgroundColor: form.fitnessLevel === l ? LEVEL_COLORS[l] : theme.inputBg, borderWidth: 1, borderColor: form.fitnessLevel === l ? LEVEL_COLORS[l] : theme.border, alignItems: 'center' }}>
              <Text style={{ color: form.fitnessLevel === l ? '#fff' : theme.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{l.charAt(0).toUpperCase() + l.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={{ backgroundColor: theme.blue, borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 20 }} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>💾  Save Changes</Text>}
        </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal: 16, marginBottom: 40, gap: 10 }}>
        <TouchableOpacity style={{ backgroundColor: theme.accentLight, borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: theme.accentBorder }}
          onPress={() => navigation.navigate('AdminWorkouts', { userId, userName: user?.name })}>
          <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '700' }}>💪  View This User's Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: theme.danger, borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: theme.dangerBorder }} onPress={handleDelete}>
          <Text style={{ color: theme.dangerText, fontSize: 13, fontWeight: '700' }}>🗑️  Delete This User</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
