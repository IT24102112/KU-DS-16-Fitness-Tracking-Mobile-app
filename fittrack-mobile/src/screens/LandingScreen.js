import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Animated,
} from 'react-native';
import Svg, { Rect, Circle, Ellipse, Line, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../services/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

const { width, height } = Dimensions.get('window');

// ── Equipment SVG Illustrations ──────────────────────────────────────────────

function BarbellHero({ size = 280 }) {
  return (
    <Svg width={size} height={size * 0.45} viewBox="0 0 280 120">
      <Defs>
        <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#60A5FA" stopOpacity="1" />
          <Stop offset="1" stopColor="#3B82F6" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="plateGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#93C5FD" stopOpacity="1" />
          <Stop offset="1" stopColor="#1D4ED8" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      {/* Left outer plate */}
      <Rect x="4" y="18" width="28" height="84" rx="6" fill="url(#plateGrad)" opacity="0.95" />
      {/* Left inner plate */}
      <Rect x="30" y="28" width="18" height="64" rx="4" fill="url(#plateGrad)" opacity="0.85" />
      {/* Collar left */}
      <Rect x="46" y="48" width="10" height="24" rx="3" fill="#1E3A5F" />
      {/* Bar */}
      <Rect x="54" y="55" width="172" height="10" rx="5" fill="url(#barGrad)" />
      {/* Collar right */}
      <Rect x="224" y="48" width="10" height="24" rx="3" fill="#1E3A5F" />
      {/* Right inner plate */}
      <Rect x="232" y="28" width="18" height="64" rx="4" fill="url(#plateGrad)" opacity="0.85" />
      {/* Right outer plate */}
      <Rect x="248" y="18" width="28" height="84" rx="6" fill="url(#plateGrad)" opacity="0.95" />
      {/* Plate detail lines */}
      <Line x1="14" y1="30" x2="14" y2="90" stroke="#BFDBFE" strokeWidth="2" opacity="0.3" />
      <Line x1="22" y1="25" x2="22" y2="95" stroke="#BFDBFE" strokeWidth="2" opacity="0.3" />
      <Line x1="258" y1="30" x2="258" y2="90" stroke="#BFDBFE" strokeWidth="2" opacity="0.3" />
      <Line x1="266" y1="25" x2="266" y2="95" stroke="#BFDBFE" strokeWidth="2" opacity="0.3" />
    </Svg>
  );
}

function DumbbellPair({ size = 260 }) {
  return (
    <Svg width={size} height={size * 0.5} viewBox="0 0 260 130">
      <Defs>
        <LinearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4ADE80" stopOpacity="1" />
          <Stop offset="1" stopColor="#16A34A" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      {/* Left dumbbell */}
      <Rect x="6" y="30" width="22" height="44" rx="5" fill="url(#dGrad)" opacity="0.9" />
      <Rect x="25" y="42" width="36" height="20" rx="4" fill="#15803D" opacity="0.8" />
      <Rect x="58" y="30" width="22" height="44" rx="5" fill="url(#dGrad)" opacity="0.9" />
      <Line x1="16" y1="40" x2="16" y2="64" stroke="#86EFAC" strokeWidth="2" opacity="0.4" />
      {/* Right dumbbell */}
      <Rect x="172" y="30" width="22" height="44" rx="5" fill="url(#dGrad)" opacity="0.9" />
      <Rect x="191" y="42" width="36" height="20" rx="4" fill="#15803D" opacity="0.8" />
      <Rect x="224" y="30" width="22" height="44" rx="5" fill="url(#dGrad)" opacity="0.9" />
      <Line x1="182" y1="40" x2="182" y2="64" stroke="#86EFAC" strokeWidth="2" opacity="0.4" />
      {/* VS text in middle */}
      <Circle cx="130" cy="52" r="22" fill="#0F172A" opacity="0.6" />
      <Path d="M120 46 L125 62 L130 46 L135 62 L140 46" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function KettlebellRow({ size = 240 }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 240 130">
      <Defs>
        <LinearGradient id="kGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#C084FC" stopOpacity="1" />
          <Stop offset="1" stopColor="#7C3AED" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      {/* Kettlebell 1 - small */}
      <Path d="M30 50 C22 50 16 56 16 64 L16 90 C16 100 24 108 34 108 L56 108 C66 108 74 100 74 90 L74 64 C74 56 68 50 60 50 C60 42 54 36 45 36 C36 36 30 42 30 50 Z" fill="url(#kGrad)" opacity="0.9" />
      <Path d="M36 44 C36 40 40 37 45 37 C50 37 54 40 54 44" fill="none" stroke="#DDD6FE" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Kettlebell 2 - medium */}
      <Path d="M104 45 C94 45 86 53 86 64 L86 94 C86 106 96 116 108 116 L132 116 C144 116 154 106 154 94 L154 64 C154 53 146 45 136 45 C136 35 129 28 120 28 C111 28 104 35 104 45 Z" fill="url(#kGrad)" opacity="0.9" />
      <Path d="M110 38 C110 33 114 29 120 29 C126 29 130 33 130 38" fill="none" stroke="#DDD6FE" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      {/* Kettlebell 3 - large */}
      <Path d="M178 40 C166 40 156 50 156 62 L156 96 C156 110 168 122 182 122 L210 122 C224 122 236 110 236 96 L236 62 C236 50 226 40 214 40 C214 28 206 20 196 20 C186 20 178 28 178 40 Z" fill="url(#kGrad)" opacity="0.9" />
      <Path d="M184 32 C184 26 189 22 196 22 C203 22 208 26 208 32" fill="none" stroke="#DDD6FE" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

function PullUpBarScene({ size = 260 }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 260 140">
      <Defs>
        <LinearGradient id="pbGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FB923C" stopOpacity="1" />
          <Stop offset="1" stopColor="#EA580C" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      {/* Bar */}
      <Rect x="10" y="18" width="240" height="14" rx="7" fill="url(#pbGrad)" />
      {/* Left support */}
      <Rect x="12" y="30" width="12" height="50" rx="5" fill="#C2410C" opacity="0.7" />
      {/* Right support */}
      <Rect x="236" y="30" width="12" height="50" rx="5" fill="#C2410C" opacity="0.7" />
      {/* Person hanging - left */}
      <Circle cx="85" cy="28" r="0" />
      {/* Arms */}
      <Line x1="72" y1="25" x2="72" y2="55" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <Line x1="98" y1="25" x2="98" y2="55" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      {/* Body */}
      <Line x1="85" y1="55" x2="85" y2="100" stroke="#FDBA74" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
      {/* Head */}
      <Circle cx="85" cy="47" r="10" fill="#FDBA74" opacity="0.85" />
      {/* Legs */}
      <Line x1="85" y1="100" x2="75" y2="125" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <Line x1="85" y1="100" x2="95" y2="125" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      {/* Person hanging - right */}
      <Line x1="162" y1="25" x2="162" y2="55" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <Line x1="188" y1="25" x2="188" y2="55" stroke="#FB923C" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <Line x1="175" y1="55" x2="175" y2="100" stroke="#FDBA74" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
      <Circle cx="175" cy="47" r="10" fill="#FDBA74" opacity="0.85" />
      <Line x1="175" y1="100" x2="163" y2="128" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <Line x1="175" y1="100" x2="187" y2="128" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
    </Svg>
  );
}

// ── Main Landing Screen ───────────────────────────────────────────────────────
export default function LandingScreen({ navigation }) {
  const { theme, isDark } = useTheme();

  // Entrance animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const img1Anim = useRef(new Animated.Value(0)).current;
  const img2Anim = useRef(new Animated.Value(0)).current;
  const img3Anim = useRef(new Animated.Value(0)).current;
  const img4Anim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(subtitleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(img1Anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(img2Anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(img3Anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(img4Anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(btnAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
    ]).start();
  }, []);

  const fadeUp = (anim) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Theme toggle */}
      <View style={styles.topRow}>
        <ThemeToggleButton />
      </View>

      {/* ── LOGO & NAME ── */}
      <Animated.View style={[styles.logoSection, fadeUp(logoAnim)]}>
        <View style={[styles.logoCircle, { backgroundColor: isDark ? '#10B98122' : '#D1FAE5', borderColor: isDark ? '#10B98144' : '#A7F3D0' }]}>
          <Text style={styles.logoEmoji}>💪</Text>
        </View>
        <Text style={[styles.appName, { color: theme.accent }]}>FitTrack</Text>
        <Text style={[styles.tagline, { color: theme.textMuted }]}>
          Your Complete Fitness Companion
        </Text>
      </Animated.View>

      {/* ── FEATURE PILLS ── */}
      <Animated.View style={[styles.pillsRow, fadeUp(subtitleAnim)]}>
        {['🏋️ Workouts', '🥗 Diet', '🎯 Goals', '📈 Progress'].map(p => (
          <View key={p} style={[styles.pill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: theme.border }]}>
            <Text style={[styles.pillText, { color: theme.textSecondary }]}>{p}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── EQUIPMENT ILLUSTRATIONS ── */}

      {/* Barbell */}
      <Animated.View style={[styles.illustrationCard, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: isDark ? '#334155' : '#BFDBFE' }, fadeUp(img1Anim)]}>
        <Text style={[styles.illustrationLabel, { color: isDark ? '#60A5FA' : '#1D4ED8' }]}>🏋️ Barbell Training</Text>
        <View style={styles.illustrationWrap}>
          <BarbellHero size={width * 0.78} />
        </View>
        <Text style={[styles.illustrationCaption, { color: theme.textMuted }]}>
          Build strength with compound lifts
        </Text>
      </Animated.View>

      {/* Dumbbell pair */}
      <Animated.View style={[styles.illustrationCard, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4', borderColor: isDark ? '#334155' : '#BBF7D0' }, fadeUp(img2Anim)]}>
        <Text style={[styles.illustrationLabel, { color: isDark ? '#4ADE80' : '#15803D' }]}>🎯 Dumbbell Workouts</Text>
        <View style={styles.illustrationWrap}>
          <DumbbellPair size={width * 0.72} />
        </View>
        <Text style={[styles.illustrationCaption, { color: theme.textMuted }]}>
          Isolate and sculpt every muscle
        </Text>
      </Animated.View>

      {/* Kettlebell row */}
      <Animated.View style={[styles.illustrationCard, { backgroundColor: isDark ? '#1E293B' : '#FAF5FF', borderColor: isDark ? '#334155' : '#DDD6FE' }, fadeUp(img3Anim)]}>
        <Text style={[styles.illustrationLabel, { color: isDark ? '#C084FC' : '#7C3AED' }]}>⚡ Kettlebell Power</Text>
        <View style={styles.illustrationWrap}>
          <KettlebellRow size={width * 0.68} />
        </View>
        <Text style={[styles.illustrationCaption, { color: theme.textMuted }]}>
          Explosive full-body conditioning
        </Text>
      </Animated.View>

      {/* Pull-up bar */}
      <Animated.View style={[styles.illustrationCard, { backgroundColor: isDark ? '#1E293B' : '#FFF7ED', borderColor: isDark ? '#334155' : '#FED7AA' }, fadeUp(img4Anim)]}>
        <Text style={[styles.illustrationLabel, { color: isDark ? '#FB923C' : '#EA580C' }]}>🔝 Bodyweight Mastery</Text>
        <View style={styles.illustrationWrap}>
          <PullUpBarScene size={width * 0.72} />
        </View>
        <Text style={[styles.illustrationCaption, { color: theme.textMuted }]}>
          Master your own bodyweight
        </Text>
      </Animated.View>

      {/* ── STATS STRIP ── */}
      <Animated.View style={[styles.statsStrip, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.border }, fadeUp(btnAnim)]}>
        {[['6+', 'Modules'], ['CRUD', 'Functions'], ['Real-time', 'Tracking'], ['Dark &', 'Light Mode']].map(([val, lbl]) => (
          <View key={lbl} style={styles.stripItem}>
            <Text style={[styles.stripVal, { color: theme.accent }]}>{val}</Text>
            <Text style={[styles.stripLbl, { color: theme.textMuted }]}>{lbl}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── CTA BUTTONS ── */}
      <Animated.View style={[styles.btnsSection, fadeUp(btnAnim)]}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>🚀  Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: theme.accentLight, borderColor: theme.accentBorder }]}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.accent }]}>✨  Create Account</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <Text style={[styles.footer, { color: theme.textMuted }]}>
        2026-Y2-S2-KU-DS-16
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', paddingTop: 52, paddingBottom: 40, paddingHorizontal: 20 },
  topRow: { width: '100%', alignItems: 'flex-end', marginBottom: 16 },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 20 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 2 },
  logoEmoji: { fontSize: 52 },
  appName: { fontSize: 46, fontWeight: '900', letterSpacing: 3 },
  tagline: { fontSize: 14, marginTop: 6, textAlign: 'center' },

  // Pills
  pillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600' },

  // Illustration cards
  illustrationCard: {
    width: '100%', borderRadius: 20, padding: 18,
    marginBottom: 14, borderWidth: 1, alignItems: 'center',
  },
  illustrationLabel: { fontSize: 15, fontWeight: '800', marginBottom: 12, alignSelf: 'flex-start' },
  illustrationWrap: { alignItems: 'center', marginVertical: 4 },
  illustrationCaption: { fontSize: 12, marginTop: 10, textAlign: 'center' },

  // Stats strip
  statsStrip: {
    flexDirection: 'row', width: '100%', borderRadius: 16,
    padding: 16, marginBottom: 24, borderWidth: 1,
    justifyContent: 'space-around',
  },
  stripItem: { alignItems: 'center' },
  stripVal: { fontSize: 15, fontWeight: '900' },
  stripLbl: { fontSize: 10, marginTop: 2, textAlign: 'center' },

  // Buttons
  btnsSection: { width: '100%', gap: 12, marginBottom: 24 },
  primaryBtn: { borderRadius: 16, padding: 17, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  secondaryBtn: { borderRadius: 16, padding: 15, alignItems: 'center', borderWidth: 1.5 },
  secondaryBtnText: { fontSize: 16, fontWeight: '700' },

  footer: { fontSize: 11, textAlign: 'center' },
});
