import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';
import apiRequest from '../services/api';

function ReportCard({ report, onView, onDelete, theme }) {
  const createdDate = new Date(report.createdAt);
  const dateStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

  return (
    <View style={[styles.reportCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.reportInfo}>
        <Text style={[styles.reportName, { color: theme.textPrimary }]}>{report.reportName}</Text>
        <View style={styles.reportMeta}>
          <Text style={[styles.reportDate, { color: theme.textMuted }]}>
            📅 {dateStr}
          </Text>
          <Text style={[styles.reportPeriod, { color: theme.accent }]}>
            {report.period}
          </Text>
          <Text style={[styles.reportSize, { color: theme.textMuted }]}>
            {report.fileSizeKB ? `${(report.fileSizeKB / 1024).toFixed(2)} MB` : 'Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.reportActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.accent + '20' }]}
          onPress={() => onView(report)}
        >
          <Text style={[styles.actionIcon, { color: theme.accent }]}>👁️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#EF4444' + '20' }]}
          onPress={() => onDelete(report)}
        >
          <Text style={[styles.actionIcon, { color: '#EF4444' }]}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SavedReportsScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/reports');
      setReports(res.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    // Navigate to report detail or PDF viewer
    navigation.navigate('ReportDetail', { reportId: report._id });
  };

  const handleDeleteReport = (report) => {
    setSelectedReport(report);
    setDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedReport) return;

    try {
      await apiRequest(`/reports/${selectedReport._id}`, 'DELETE');
      setReports(reports.filter((r) => r._id !== selectedReport._id));
      setDeleteConfirmModal(false);
      setSelectedReport(null);
      Alert.alert('Success', 'Report deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete report: ' + error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.accent }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Saved Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading reports...</Text>
        </View>
      ) : reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onView={handleViewReport}
              onDelete={handleDeleteReport}
              theme={theme}
            />
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { color: theme.textMuted }]}>📊</Text>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No saved reports yet</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Generate and save your first progress report to see it here
          </Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: theme.accent }]}
            onPress={() => navigation.navigate('ProgressReport')}
          >
            <Text style={styles.createBtnText}>Create Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalIcon, { color: '#EF4444' }]}>⚠️</Text>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Delete Report?</Text>
            <Text style={[styles.modalMessage, { color: theme.textMuted }]}>
              Are you sure you want to delete "{selectedReport?.reportName}"? This action cannot be undone.
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setDeleteConfirmModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteBtn, { backgroundColor: '#EF4444' }]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 52,
    borderBottomWidth: 1,
  },
  backBtn: {
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  reportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportDate: {
    fontSize: 12,
  },
  reportPeriod: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  reportSize: {
    fontSize: 12,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  createBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalDeleteBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

