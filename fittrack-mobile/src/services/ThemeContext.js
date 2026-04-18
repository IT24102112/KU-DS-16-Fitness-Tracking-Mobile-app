import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext(null);

export const DARK = {
  bg: '#080F1E',
  surface: '#0F172A',
  card: '#1E293B',
  border: '#334155',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#10B981',
  accentLight: '#10B98120',
  accentBorder: '#10B98140',
  accentText: '#6EE7B7',
  danger: '#450A0A',
  dangerBorder: '#7F1D1D',
  dangerText: '#FCA5A5',
  admin: '#F59E0B',
  adminLight: '#F59E0B22',
  adminBorder: '#F59E0B44',
  adminText: '#FCD34D',
  purple: '#6366F1',
  purpleLight: '#6366F122',
  blue: '#3B82F6',
  blueLight: '#1E3A5F',
  blueText: '#60A5FA',
  inputBg: '#1E293B',
  statCard: '#0F172A',
  headerBg: '#0F172A',
  navBg: '#1E293B',
  tabActive: '#10B981',
  shadow: 'transparent',
};

export const LIGHT = {
  bg: '#F0F4F8',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  accent: '#059669',
  accentLight: '#D1FAE5',
  accentBorder: '#A7F3D0',
  accentText: '#065F46',
  danger: '#FEF2F2',
  dangerBorder: '#FECACA',
  dangerText: '#DC2626',
  admin: '#D97706',
  adminLight: '#FEF3C7',
  adminBorder: '#FDE68A',
  adminText: '#92400E',
  purple: '#6366F1',
  purpleLight: '#EEF2FF',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  blueText: '#1D4ED8',
  inputBg: '#F8FAFC',
  statCard: '#FFFFFF',
  headerBg: '#FFFFFF',
  navBg: '#FFFFFF',
  tabActive: '#059669',
  shadow: '#00000010',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? DARK : LIGHT;
  const toggleTheme = () => setIsDark(prev => !prev);
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
