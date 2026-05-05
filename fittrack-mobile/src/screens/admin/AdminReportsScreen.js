import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../services/ThemeContext';
import apiRequest from '../../services/api';
import ThemeToggleButton from '../../components/ThemeToggleButton';

export default function AdminReportsScreen({ navigation }) {
  const { theme } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await apiRequest('/reports/admin/all');
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to permanently delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiRequest(`/reports/${id}`, 'DELETE');
              if (res.success) {
                setReports((prev) => prev.filter((r) => r._id !== id));
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const renderReportCard = ({ item }) => {
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.reportName, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.reportName || 'Unnamed Report'}
          </Text>
          <Text style={[styles.periodBadge, { backgroundColor: theme.accent + '22', color: theme.accent }]}>
            {item.period === 'custom' ? 'Custom' : item.period}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userIcon}>👤</Text>
          <Text style={[styles.userName, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.user?.name || 'Unknown User'}
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            📅 {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.actionRow}>
          <Text style={[styles.createdText, { color: theme.textMuted }]}>
            Created: {formatDate(item.generatedAt)}
          </Text>
          <View style={styles.btnGroup}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.danger + '22' }]}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewBtn, { backgroundColor: theme.admin }]}
              onPress={() => navigation.navigate('ReportDetail', { reportId: item._id })}
            >
              <Text style={styles.viewBtnText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, { color: theme.admin }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Manage Reports</Text>
        <ThemeToggleButton />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.admin} />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No reports found in the system.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
          renderItem={renderReportCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.admin} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  periodBadge: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateContainer: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdText: {
    fontSize: 11,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
