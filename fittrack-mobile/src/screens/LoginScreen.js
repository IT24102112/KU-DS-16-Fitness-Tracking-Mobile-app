import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    if (!/^\S+@\S+\.\S+$/.test(email)) return Alert.alert('Error', 'Please enter a valid email');
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}>

        {/* Theme toggle top-right */}
        <View style={styles.themeRow}>
          <ThemeToggleButton />
        </View>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoCircle,
            isAdmin
              ? { backgroundColor: theme.adminLight, borderColor: theme.adminBorder }
              : { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }
          ]}>
            <Text style={styles.logoEmoji}>{isAdmin ? '🛡️' : '💪'}</Text>
          </View>
          <Text style={[styles.appName, { color: isAdmin ? theme.admin : theme.accent }]}>FitTrack</Text>
          <Text style={[styles.tagline, { color: theme.textMuted }]}>
            {isAdmin ? 'Administration Portal' : 'Your personal fitness companion'}
          </Text>
        </View>

        {/* Role Toggle */}
        <View style={[styles.roleToggleWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.roleBtn, !isAdmin && { backgroundColor: theme.accent }]}
            onPress={() => { setIsAdmin(false); setEmail(''); setPassword(''); }}
          >
            <Text style={[styles.roleBtnText, { color: !isAdmin ? '#fff' : theme.textMuted }]}>
              👤  User Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, isAdmin && { backgroundColor: theme.admin }]}
            onPress={() => { setIsAdmin(true); setEmail(''); setPassword(''); }}
          >
            <Text style={[styles.roleBtnText, { color: isAdmin ? '#fff' : theme.textMuted }]}>
              🛡️  Admin Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: isAdmin ? theme.adminBorder : theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            {isAdmin ? 'Admin Sign In' : 'Welcome Back!'}
          </Text>

          <Text style={[styles.label, { color: theme.textMuted }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: isAdmin ? theme.adminBorder : theme.border, color: theme.textPrimary }]}
            placeholder={isAdmin ? 'Enter admin email' : 'Enter your email'}
            placeholderTextColor={theme.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: theme.textMuted }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: isAdmin ? theme.adminBorder : theme.border, color: theme.textPrimary }]}
            placeholder="Enter your password"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: isAdmin ? theme.admin : theme.accent }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>{isAdmin ? '🛡️  Sign In as Admin' : 'Sign In'}</Text>
            }
          </TouchableOpacity>

          {!isAdmin && (
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.link, { color: theme.textMuted }]}>
                Don't have an account?{' '}
                <Text style={[styles.linkBold, { color: theme.accent }]}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', paddingVertical: 40 },
  themeRow: { width: '88%', alignItems: 'flex-end', marginBottom: 8 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2 },
  logoEmoji: { fontSize: 42 },
  appName: { fontSize: 38, fontWeight: '900', letterSpacing: 2 },
  tagline: { fontSize: 13, marginTop: 4 },
  roleToggleWrap: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20, borderWidth: 1, width: '88%' },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  roleBtnText: { fontWeight: '700', fontSize: 13 },
  card: { width: '88%', borderRadius: 22, padding: 24, borderWidth: 1 },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 12, marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1 },
  button: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  link: { textAlign: 'center', marginTop: 16, fontSize: 13 },
  linkBold: { fontWeight: '700' },
});
