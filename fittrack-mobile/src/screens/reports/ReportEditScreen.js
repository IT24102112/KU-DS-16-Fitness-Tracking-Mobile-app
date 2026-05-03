import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiRequest from '../../services/api';
import { useTheme } from '../../services/ThemeContext';
import BackToHomeButton from '../../components/BackToHomeButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';

export default function ReportEditScreen({ route, navigation }) {
  const { reportId } = route.params;
  const { theme } = useTheme();
  const [reportName, setReportName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await apiRequest(`/reports/${reportId}`);
        const report = res.data;
        setReportName(report.reportName);
        setStartDate(new Date(report.startDate));
        setEndDate(new Date(report.endDate));
        setOriginalData(report.data);
      } catch (e) {
        Alert.alert('Error', 'Failed to load report');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleSave = async () => {
    if (!reportName.trim()) return Alert.alert('Error', 'Name required');
    setSaving(true);
    try {
      // If start or end date changed, regenerate report data
      let updatedData = originalData;
      if (
        startDate.toISOString() !== originalData?.startDate ||
        endDate.toISOString() !== originalData?.endDate
      ) {
        // Regenerate
        const res = await apiRequest('/reports/generate', 'POST', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        updatedData = res.data;
      }

      await apiRequest(`/reports/${reportId}`, 'PUT', {
        reportName: reportName.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reportData: updatedData,
      });
      Alert.alert('Updated', 'Report updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <BackToHomeButton goHome />
          <ThemeToggleButton />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Edit Report</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Report Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Report name"
          placeholderTextColor={theme.textMuted}
          value={reportName}
          onChangeText={setReportName}
        />

        <Text style={[styles.label, { color: theme.textPrimary, marginTop: 16 }]}>Start Date</Text>
        <TouchableOpacity style={[styles.dateBtn, { backgroundColor: theme.inputBg }]} onPress={() => setShowStartPicker(true)}>
          <Text style={{ color: theme.textPrimary }}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker value={startDate} mode="date" onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }} />
        )}

        <Text style={[styles.label, { color: theme.textPrimary, marginTop: 16 }]}>End Date</Text>
        <TouchableOpacity style={[styles.dateBtn, { backgroundColor: theme.inputBg }]} onPress={() => setShowEndPicker(true)}>
          <Text style={{ color: theme.textPrimary }}>{endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker value={endDate} mode="date" onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }} />
        )}

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Update Report</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1 },
  dateBtn: { padding: 12, borderRadius: 10, marginBottom: 8 },
  saveBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
});