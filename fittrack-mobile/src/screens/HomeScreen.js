import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';
import apiRequest from '../services/api';
import ThemeToggleButton from '../components/ThemeToggleButton';

function StatCard({ icon, value, label, color, delay = 0, theme }) {
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
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </Animated.View>
  );
}

function ModuleCard({ icon, title, subtitle, color, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[styles.moduleCard, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.moduleIconWrap, { backgroundColor: color + '22' }]}>
        <Text style={styles.moduleIcon}>{icon}</Text>
      </View>
      <View style={styles.moduleText}>
        <Text style={[styles.moduleTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.moduleSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      </View>
      <Text style={[styles.moduleChevron, { color }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState({ workouts: 0, completed: 0, planned: 0 });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
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
      const res = await apiRequest('/workouts');
      const all = res.data || [];
      setRecentWorkouts(all.slice(0, 3));
      setStats({
        workouts: res.total || all.length,
        completed: all.filter(w => w.status === 'completed').length,
        planned: all.filter(w => w.status === 'planned').length,
      });
    } catch (e) {
      console.log('Dashboard error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  const levelColor = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' }[user?.fitnessLevel] || '#10B981';
  const STATUS_COLORS = { planned: '#6366F1', in_progress: '#F59E0B', completed: '#10B981', skipped: '#EF4444' };

  // Safe navigation function with error handling
  const handleNavigation = (screenName, params = {}) => {
    try {
      navigation.navigate(screenName, params);
    } catch (error) {
      console.log(`Navigation to ${screenName} failed:`, error);
      Alert.alert('Coming Soon', `${screenName} feature is being developed.`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <Animated.View style={[
        styles.header,
        { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
        { opacity: headerOpacity, transform: [{ translateY: headerAnim }] },
      ]}>
        {isDark && <><View style={styles.circle1} /><View style={styles.circle2} /></>}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={[styles.logoutText, { color: theme.dangerText }]}>Logout</Text>
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            <ThemeToggleButton />
            <TouchableOpacity
              style={[styles.profileBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handleNavigation('Profile')}
            >
              <Text style={[styles.profileBtnText, { color: theme.textSecondary }]}>👤  Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userInfo}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.accent }]}>
            <Text style={styles.avatarLetter}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: theme.textMuted }]}>Welcome back 👋</Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name}</Text>
            <View style={[styles.levelPill, { backgroundColor: levelColor + '33' }]}>
              <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
              <Text style={[styles.levelTxt, { color: levelColor }]}>
                {(user?.fitnessLevel || 'beginner').charAt(0).toUpperCase() + (user?.fitnessLevel || 'beginner').slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.userStrip}>
          {user?.age ? <View style={[styles.stripChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.stripVal, { color: theme.textPrimary }]}>{user.age}</Text>
            <Text style={[styles.stripLbl, { color: theme.textMuted }]}>yrs</Text>
          </View> : null}
          {user?.weight ? <View style={[styles.stripChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.stripVal, { color: theme.textPrimary }]}>{user.weight}</Text>
            <Text style={[styles.stripLbl, { color: theme.textMuted }]}>kg</Text>
          </View> : null}
          {user?.height ? <View style={[styles.stripChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.stripVal, { color: theme.textPrimary }]}>{user.height}</Text>
            <Text style={[styles.stripLbl, { color: theme.textMuted }]}>cm</Text>
          </View> : null}
          <TouchableOpacity
            style={[styles.editChip, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
            onPress={() => handleNavigation('Profile')}
          >
            <Text style={[styles.editChipText, { color: theme.accent }]}>✏️  Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* STATS */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>📊 Your Overview</Text>
        <View style={styles.statsRow}>
          <StatCard icon="🏋️" value={stats.workouts} label="Total" color="#6366F1" delay={0} theme={theme} />
          <StatCard icon="✅" value={stats.completed} label="Done" color="#10B981" delay={80} theme={theme} />
          <StatCard icon="📅" value={stats.planned} label="Planned" color="#F59E0B" delay={160} theme={theme} />
        </View>
      </View>

      {/* MODULES */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>⚡ Your Modules</Text>
        <ModuleCard icon="💪" title="Workouts" subtitle="Plan & track sessions" color="#10B981" theme={theme}
          onPress={() => handleNavigation('WorkoutList')} />
        <ModuleCard icon="🥗" title="Diet Plans" subtitle="Nutrition & meal plans" color="#F59E0B" theme={theme}
          onPress={() => handleNavigation('NutritionHome')} />
        <ModuleCard icon="🏃" title="Exercises" subtitle="Exercise library" color="#6366F1" theme={theme}
          onPress={() => handleNavigation('ExerciseList')} />
        <ModuleCard icon="📈" title="Progress Tracking" subtitle="Track your journey" color="#3B82F6" theme={theme}
          onPress={() => handleNavigation('ProgressList')} />
        <ModuleCard icon="🎯" title="Fitness Goals" subtitle="Set & achieve goals" color="#EC4899" theme={theme}
          onPress={() => {
            // Option A: Navigate to ProgressList (which exists)
            handleNavigation('GoalScreen');
            
            // Option B: Show coming soon message until GoalScreen is created
            // Alert.alert('Coming Soon', 'Fitness Goals feature is being developed. Check back soon!');
          }} />
        <ModuleCard icon="📸" title="Progress Reports" subtitle="Photos & reports" color="#8B5CF6" theme={theme}
          onPress={() => handleNavigation('ProgressReport')} />
      </View>

      {/* RECENT WORKOUTS */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>🕐 Recent Workouts</Text>
          <TouchableOpacity onPress={() => handleNavigation('WorkoutList')}>
            <Text style={[styles.seeAll, { color: theme.accent }]}>See all →</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color={theme.accent} style={{ marginVertical: 16 }} />
        ) : recentWorkouts.length === 0 ? (
          <TouchableOpacity
            style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handleNavigation('WorkoutForm')}
          >
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No workouts yet</Text>
            <Text style={[styles.emptyAction, { color: theme.accent }]}>Tap to create your first workout →</Text>
          </TouchableOpacity>
        ) : (
          recentWorkouts.map(w => (
            <TouchableOpacity
              key={w._id}
              style={[styles.recentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handleNavigation('WorkoutDetail', { workoutId: w._id })}
            >
              <View style={[styles.recentBadge, { backgroundColor: (STATUS_COLORS[w.status] || '#6366F1') + '22' }]}>
                <Text style={{ fontSize: 18 }}>
                  {w.status === 'completed' ? '✅' : w.status === 'in_progress' ? '⚡' : '📅'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recentTitle, { color: theme.textPrimary }]}>{w.title}</Text>
                <Text style={[styles.recentMeta, { color: theme.textMuted }]}>{w.durationMinutes} min  •  {w.category}</Text>
              </View>
              <View style={[styles.recentDot, { backgroundColor: STATUS_COLORS[w.status] || '#6366F1' }]} />
            </TouchableOpacity>
          ))
        )}
        <TouchableOpacity
          style={[styles.newWorkoutBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
          onPress={() => handleNavigation('WorkoutForm')}
        >
          <Text style={[styles.newWorkoutBtnText, { color: theme.accent }]}>➕  New Workout</Text>
        </TouchableOpacity>
      </View>

      {/* TIPS */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>💡 Tips</Text>
        {[
          ['🎯', 'Goals', 'Link your workouts to a Fitness Goal to track progress automatically.'],
          ['📸', 'Reports', 'Upload progress photos to visualize your transformation over time.'],
          ['🥗', 'Diet', 'Pair your workout plan with a Diet Plan for best results.'],
        ].map(([icon, highlight, text]) => (
          <View key={highlight} style={[styles.tipCard, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: '#6366F1' }]}>
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>
              {icon}  <Text style={[styles.tipHighlight, { color: theme.accentText }]}>{highlight}: </Text>{text}
            </Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden', marginBottom: 8, borderBottomWidth: 1 },
  circle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#10B98112', top: -50, right: -50 },
  circle2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#6366F10E', top: 70, right: 70 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  topBarRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  logoutIcon: { fontSize: 14 },
  logoutText: { fontWeight: '700', fontSize: 12 },
  profileBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  profileBtnText: { fontWeight: '700', fontSize: 13 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#fff', fontSize: 24, fontWeight: '900' },
  greeting: { fontSize: 12 },
  userName: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  levelPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  levelDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  levelTxt: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  userStrip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stripChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center', borderWidth: 1 },
  stripVal: { fontSize: 14, fontWeight: '800' },
  stripLbl: { fontSize: 10, marginTop: 1 },
  editChip: { marginLeft: 'auto', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  editChipText: { fontSize: 12, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderTopWidth: 3, borderWidth: 1 },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  moduleCard: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, marginBottom: 10, borderLeftWidth: 4 },
  moduleIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  moduleIcon: { fontSize: 22 },
  moduleText: { flex: 1 },
  moduleTitle: { fontSize: 15, fontWeight: '700' },
  moduleSubtitle: { fontSize: 12, marginTop: 2 },
  moduleChevron: { fontSize: 24 },
  recentCard: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderWidth: 1 },
  recentBadge: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recentTitle: { fontSize: 14, fontWeight: '700' },
  recentMeta: { fontSize: 11, marginTop: 3, textTransform: 'capitalize' },
  recentDot: { width: 8, height: 8, borderRadius: 4 },
  emptyCard: { borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, fontWeight: '700' },
  emptyAction: { fontSize: 13, marginTop: 6, fontWeight: '600' },
  newWorkoutBtn: { borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 6, borderWidth: 1 },
  newWorkoutBtnText: { fontSize: 14, fontWeight: '700' },
  tipCard: { borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderLeftWidth: 3 },
  tipText: { fontSize: 13, lineHeight: 20 },
  tipHighlight: { fontWeight: '700' },
});