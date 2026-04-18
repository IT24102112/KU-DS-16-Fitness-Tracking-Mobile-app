import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme } = useTheme();

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Name, email and password are required');
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    if (!/^\S+@\S+\.\S+$/.test(email)) return Alert.alert('Error', 'Invalid email address');
    try {
      setLoading(true);
      await register({
        name, email: email.trim().toLowerCase(), password,
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        fitnessLevel,
      });
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = [styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.themeRow}>
        <ThemeToggleButton />
      </View>

      <View style={styles.header}>
        <Text style={styles.emoji}>🏃</Text>
        <Text style={[styles.title, { color: theme.accent }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Start your fitness journey today</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Full Name</Text>
        <TextInput style={inp} placeholder="Enter your name" placeholderTextColor={theme.textMuted} value={name} onChangeText={setName} />

        <Text style={[styles.label, { color: theme.textMuted }]}>Email</Text>
        <TextInput style={inp} placeholder="Enter your email" placeholderTextColor={theme.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={[styles.label, { color: theme.textMuted }]}>Password</Text>
        <TextInput style={inp} placeholder="At least 6 characters" placeholderTextColor={theme.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={[styles.label, { color: theme.textMuted }]}>Confirm Password</Text>
        <TextInput style={inp} placeholder="Repeat your password" placeholderTextColor={theme.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <View style={styles.row}>
          {[['Age', age, setAge], ['Weight (kg)', weight, setWeight], ['Height (cm)', height, setHeight]].map(([lbl, val, setter], i) => (
            <View key={lbl} style={{ flex: 1, marginRight: i < 2 ? 8 : 0 }}>
              <Text style={[styles.label, { color: theme.textMuted }]}>{lbl}</Text>
              <TextInput style={inp} placeholder={lbl.split(' ')[0]} placeholderTextColor={theme.textMuted} value={val} onChangeText={setter} keyboardType="numeric" />
            </View>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.textMuted }]}>Fitness Level</Text>
        <View style={styles.row}>
          {LEVELS.map((l, i) => (
            <TouchableOpacity
              key={l}
              onPress={() => setFitnessLevel(l)}
              style={[
                styles.levelBtn,
                { backgroundColor: theme.inputBg, borderColor: theme.border, marginRight: i < 2 ? 6 : 0 },
                fitnessLevel === l && { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
            >
              <Text style={[styles.levelText, { color: fitnessLevel === l ? '#fff' : theme.textMuted }]}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accent }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, { color: theme.textMuted }]}>
            Already have an account?{' '}
            <Text style={[styles.linkBold, { color: theme.accent }]}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', paddingVertical: 40 },
  themeRow: { width: '88%', alignItems: 'flex-end', marginBottom: 8 },
  header: { alignItems: 'center', marginBottom: 24 },
  emoji: { fontSize: 52 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  subtitle: { fontSize: 13, marginTop: 4 },
  card: { width: '88%', borderRadius: 20, padding: 24, borderWidth: 1 },
  label: { fontSize: 12, marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1 },
  row: { flexDirection: 'row', marginTop: 4 },
  levelBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  levelText: { fontSize: 12 },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 16, fontSize: 13 },
  linkBold: { fontWeight: '700' },
});
