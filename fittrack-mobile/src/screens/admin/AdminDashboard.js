import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { useAuth } from '../../services/AuthContext';
import { useTheme } from '../../services/ThemeContext';
import apiRequest from '../../services/api';
import ThemeToggleButton from '../../components/ThemeToggleButton';

function AdminStatCard({ icon, value, label, color, delay, theme }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay, useNativeDriver: true, tension: 60, friction: 8 }).start();
  }, []);
  return (
    <Animated.View style={[
      styles.statCard,
      { borderTopColor: color, backgroundColor: theme.statCard, borderColor: theme.border },
      { opacity: anim, transform: [{ scale: anim }] },
    ]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: theme.textMuted }]}>{label}</Text>
    </Animated.View>
  );
}

export default function AdminDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkouts: 0, completedWorkouts: 0, plannedWorkouts: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerAnim = useRef(new Animated.Value(-20)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiRequest('/auth/admin/stats'),
        apiRequest('/auth/admin/users'),
      ]);
      setStats(statsRes.data || {});
      setRecentUsers((usersRes.data || []).slice(0, 4));
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  const LEVEL_COLORS = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.admin} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <Animated.View style={[
        styles.header,
        { backgroundColor: theme.headerBg, borderBottomColor: isDark ? '#2D2006' : theme.border },
        { opacity: headerOpacity, transform: [{ translateY: headerAnim }] },
      ]}>
        {isDark && <View style={styles.adminGlow} />}
        <View style={styles.topBar}>
          <View style={[styles.adminBadge, { backgroundColor: theme.adminLight, borderColor: theme.adminBorder }]}>
            <Text style={[styles.adminBadgeText, { color: theme.adminText }]}>🛡️  ADMIN</Text>
          </View>
          <View style={styles.topBarRight}>
            <ThemeToggleButton />
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={[styles.logoutText, { color: theme.dangerText }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.dashTitle, { color: theme.adminText }]}>Admin Dashboard</Text>
        <Text style={[styles.dashSubtitle, { color: theme.textMuted }]}>FitTrack System Management</Text>
      </Animated.View>

      {/* STATS */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>📊 System Overview</Text>
        <View style={styles.statsGrid}>
          <AdminStatCard icon="👥" value={stats.totalUsers} label="Users" color="#3B82F6" delay={0} theme={theme} />
          <AdminStatCard icon="🏋️" value={stats.totalWorkouts} label="Workouts" color="#10B981" delay={80} theme={theme} />
          <AdminStatCard icon="✅" value={stats.completedWorkouts} label="Completed" color="#6366F1" delay={160} theme={theme} />
          <AdminStatCard icon="📅" value={stats.plannedWorkouts} label="Planned" color="#F59E0B" delay={240} theme={theme} />
        </View>
      </View>

      {/* MODULES */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>⚙️ Manage</Text>

        {[
          { icon: '👥', title: 'User Management', sub: 'View, edit, delete all users', color: '#3B82F6', live: true, screen: 'AdminUsers' },
          { icon: '💪', title: 'Workout Management', sub: "All users' workouts with CRUD", color: '#10B981', live: true, screen: 'AdminWorkouts' },
          { icon: '🥗', title: 'Diet Plan Management', sub: "Manage all users' diet plans", color: '#F59E0B', live: true, screen: 'AdminNutrition' },
          { icon: '🏃', title: 'Exercise Management', sub: 'Manage exercise library', color: '#6366F1', live: true, screen: 'ExerciseList' },
          { icon: '📈', title: 'Progress Tracking', sub: "View all users' progress", color: '#EC4899', live: true, screen: 'AdminProgress' },
          { icon: '🎯', title: 'Progress Reports', sub: "View all users' reports", color: '#8B5CF6', live: true, screen: 'AdminReports' },
        ].map(m => (
          <TouchableOpacity
            key={m.title}
            style={[
              styles.moduleCard,
              { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: m.color },
              !m.live && styles.moduleCardDimmed,
            ]}
            onPress={() => m.live
              ? navigation.navigate(m.screen)
              : Alert.alert('Under Development', `${m.title} is being built by the team.`)
            }
          >
            <View style={[styles.moduleIcon, { backgroundColor: m.color + '22' }]}>
              <Text style={styles.moduleEmoji}>{m.icon}</Text>
            </View>
            <View style={styles.moduleText}>
              <Text style={[styles.moduleTitle, { color: m.live ? theme.textPrimary : theme.textSecondary }]}>{m.title}</Text>
              <Text style={[styles.moduleSub, { color: theme.textMuted }]}>{m.sub}</Text>
            </View>
            {m.live ? (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            ) : (
              <View style={[styles.soonBadge, { backgroundColor: theme.adminLight }]}>
                <Text style={[styles.soonBadgeText, { color: theme.admin }]}>SOON</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* RECENT USERS */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>👥 Recent Users</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdminUsers')}>
            <Text style={[styles.seeAll, { color: theme.admin }]}>See all →</Text>
          </TouchableOpacity>
        </View>
        {recentUsers.map(u => (
          <TouchableOpacity
            key={u._id}
            style={[styles.userRow, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('AdminUserDetail', { userId: u._id })}
          >
            <View style={[styles.userAvatar, { backgroundColor: LEVEL_COLORS[u.fitnessLevel] || '#64748B' }]}>
              <Text style={styles.userAvatarText}>{u.name?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{u.name}</Text>
              <Text style={[styles.userEmail, { color: theme.textMuted }]}>{u.email}</Text>
            </View>
            <View style={[styles.levelDot, { backgroundColor: LEVEL_COLORS[u.fitnessLevel] || '#64748B' }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* REMOVED: Recent Workouts section */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12 },
  header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden', marginBottom: 8, borderBottomWidth: 1 },
  adminGlow: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#F59E0B08', top: -80, right: -60 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  topBarRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  adminBadge: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  adminBadgeText: { fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  logoutIcon: { fontSize: 14 },
  logoutText: { fontWeight: '700', fontSize: 12 },
  dashTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  dashSubtitle: { fontSize: 13, marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center', borderTopWidth: 3, borderWidth: 1 },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statVal: { fontSize: 24, fontWeight: '900' },
  statLbl: { fontSize: 11, marginTop: 2 },
  moduleCard: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, marginBottom: 10, borderLeftWidth: 4 },
  moduleCardDimmed: { opacity: 0.65 },
  moduleIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  moduleEmoji: { fontSize: 22 },
  moduleText: { flex: 1 },
  moduleTitle: { fontSize: 15, fontWeight: '700' },
  moduleSub: { fontSize: 12, marginTop: 2 },
  liveBadge: { backgroundColor: '#10B98133', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#10B98155' },
  liveBadgeText: { color: '#6EE7B7', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  soonBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  soonBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  userRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  userAvatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  userName: { fontSize: 14, fontWeight: '700' },
  userEmail: { fontSize: 12, marginTop: 2 },
  levelDot: { width: 10, height: 10, borderRadius: 5 },
});