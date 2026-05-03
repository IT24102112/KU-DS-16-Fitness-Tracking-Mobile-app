import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform, Modal, TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../services/ThemeContext';
import apiRequest from '../../services/api';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import OverviewTab from './ProgressReportTabs/OverviewTab';
import WeightTab from './ProgressReportTabs/WeightTab';
import WorkoutTab from './ProgressReportTabs/WorkoutTab';
import NutritionTab from './ProgressReportTabs/NutritionTab';
import GoalsTab from './ProgressReportTabs/GoalsTab';
import ImagesTab from './ProgressReportTabs/ImagesTab';

const TABS = ['Overview', 'Weight', 'Workout', 'Nutrition', 'Goals', 'Images'];

export default function ProgressReportScreen({ navigation, route }) {
  const { theme } = useTheme();
  const reportId = route.params?.reportId;
  const isViewingSaved = !!reportId;

  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [reportName, setReportName] = useState('');
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Keep a mutable reference of the latest reportData for the save handler
  const reportDataRef = useRef(reportData);
  useEffect(() => { reportDataRef.current = reportData; }, [reportData]);

  // ── Generate new report ─────────────────────────────
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/reports/generate', 'POST', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      if (res.success) setReportData(res.data);
      else Alert.alert('Error', 'Failed to generate report');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // ── Load saved report ───────────────────────────────
  const loadSavedReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/reports/${reportId}`);
      const saved = res.data;
      setStartDate(new Date(saved.startDate));
      setEndDate(new Date(saved.endDate));
      // The data might be stored directly as the report structure
      const data = saved.data || saved; // fallback if data field missing
      setReportData(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  // ── Effects ─────────────────────────────────────────
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      if (isViewingSaved) {
        loadSavedReport();
      } else {
        fetchReport();
      }
    }
  }, [initialized, isViewingSaved]);

  useEffect(() => {
    if (initialized && !isViewingSaved) {
      fetchReport();
    }
  }, [startDate, endDate]);

  const handleDateChange = (setter) => (event, date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
    if (date) setter(date);
  };

  const handleSave = async () => {
    if (!reportName.trim()) {
      return Alert.alert('Error', 'Please enter a report name');
    }
    const currentData = reportDataRef.current;
    if (!currentData) {
      return Alert.alert('Error', 'No report data to save. Generate a report first.');
    }
    setSaving(true);
    try {
      await apiRequest('/reports', 'POST', {
        reportName: reportName.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reportData: currentData,
      });
      Alert.alert('Saved', 'Report saved successfully');
      setSaveModalVisible(false);
      setReportName('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    if (!reportData) return null;
    const { metrics, summary, images } = reportData;
    if (!metrics || Object.keys(metrics).length === 0) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: theme.textMuted, fontSize: 16 }}>
            No data available for the selected period.
          </Text>
          <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 8 }}>
            Try adjusting the date range or ensure you have workouts, meals, and progress entries logged.
          </Text>
        </View>
      );
    }

    switch (activeTab) {
      case 0: return <OverviewTab data={{ streak: summary?.activityDays || 0, caloriesBurned: summary?.caloriesBurned || 0, weightChange: summary?.weightChange || 0, goalsDone: summary?.goalsDone || 0, goalsTotal: summary?.goalsTotal || 0 }} />;
      case 1: return <WeightTab data={metrics.weight || {}} />;
      case 2: return <WorkoutTab data={metrics.workouts || {}} />;
      case 3: return <NutritionTab data={metrics.nutrition || {}} />;
      case 4: return <GoalsTab data={metrics.goals || {}} />;
      case 5: return <ImagesTab data={images || {}} />;
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <BackToHomeButton goHome />
          <ThemeToggleButton />
        </View>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {isViewingSaved ? 'View Report' : 'Progress Report'}
        </Text>
      </View>

      {!isViewingSaved && (
        <>
          <View style={[styles.dateRow, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
            <TouchableOpacity style={[styles.dateBtn, { backgroundColor: theme.inputBg }]} onPress={() => setShowStartPicker(true)}>
              <Text style={{ color: theme.textPrimary }}>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <Text style={{ color: theme.textMuted }}>→</Text>
            <TouchableOpacity style={[styles.dateBtn, { backgroundColor: theme.inputBg }]} onPress={() => setShowEndPicker(true)}>
              <Text style={{ color: theme.textPrimary }}>{endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>
          {showStartPicker && <DateTimePicker value={startDate} mode="date" onChange={handleDateChange(setStartDate)} maximumDate={endDate} />}
          {showEndPicker && <DateTimePicker value={endDate} mode="date" onChange={handleDateChange(setEndDate)} minimumDate={startDate} />}
        </>
      )}

      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((tab, idx) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === idx && { borderBottomColor: theme.accent }]}
              onPress={() => setActiveTab(idx)}
            >
              <Text style={{ color: activeTab === idx ? theme.accent : theme.textMuted, fontSize: 13 }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
        ) : (
          renderTabContent()
        )}
      </View>

      {!isViewingSaved && (
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity style={[styles.footerBtn, { backgroundColor: theme.accent }]} onPress={() => navigation.navigate('SavedReports')}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>📋 My Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerBtn, { backgroundColor: theme.accent }]} onPress={() => setSaveModalVisible(true)}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>💾 Save Report</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={saveModalVisible && !isViewingSaved} transparent animationType="fade" onRequestClose={() => setSaveModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Save Report</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Enter report name"
              placeholderTextColor={theme.textMuted}
              value={reportName}
              onChangeText={setReportName}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={() => setSaveModalVisible(false)}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.accent }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  dateRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 12 },
  dateBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  tabBar: { borderBottomWidth: 1, paddingHorizontal: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  footer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, gap: 10 },
  footerBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 16, padding: 20, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 20 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
});