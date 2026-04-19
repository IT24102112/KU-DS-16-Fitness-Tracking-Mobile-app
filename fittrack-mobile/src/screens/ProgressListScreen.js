import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useTheme } from '../services/ThemeContext';
import apiRequest from '../services/api';

export default function ProgressListScreen({ navigation }) {
  const { theme } = useTheme();
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProgress = async () => {
    try {
      const res = await apiRequest('/progress');
      setProgressList(res.data || res);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProgress(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this progress entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/progress/${id}`, 'DELETE');
            fetchProgress();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderLeftColor: theme.blue }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.dateBadge, { backgroundColor: theme.blueLight }]}>
          <Text style={[styles.dateText, { color: theme.blueText }]}>
            📅 {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.userText, { color: theme.textMuted }]}>👤 {item.userId}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.blue }]}>{item.weight}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>kg</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.accent }]}>{item.calories}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>cal</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.purple }]}>{item.chest || '—'}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>chest</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statValue, { color: theme.purple }]}>{item.waist || '—'}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>waist</Text>
        </View>
      </View>

      {item.notes ? (
        <Text style={[styles.notes, { color: theme.textSecondary }]}>📝 {item.notes}</Text>
      ) : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.blueLight, borderColor: theme.blue }]}
          onPress={() => navigation.navigate('ProgressForm', { item })}
        >
          <Text style={[styles.editText, { color: theme.blueText }]}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: theme.danger, borderColor: theme.dangerBorder }]}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={[styles.deleteText, { color: theme.dangerText }]}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
    {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>📈 Progress Tracking</Text>
        <Text style={[styles.headerSub, { color: theme.textMuted }]}>{progressList.length} entries logged</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.blue} style={{ marginTop: 40 }} />
      ) : (
        <>
          {progressList.length > 1 && (
            <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>⚖️ Weight Progress</Text>
              <LineChart
                data={{
                  labels: progressList.slice(-5).map(p => new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
                  datasets: [{ data: progressList.slice(-5).map(p => p.weight) }]
                }}
                width={Dimensions.get('window').width - 60}
                height={180}
                chartConfig={{
                  backgroundColor: theme.card,
                  backgroundGradientFrom: theme.card,
                  backgroundGradientTo: theme.card,
                  decimalPlaces: 1,
                  color: () => theme.blue,
                  labelColor: () => theme.textMuted,
                  propsForDots: { r: '5', strokeWidth: '2', stroke: theme.blue }
                }}
                bezier
                style={{ borderRadius: 12 }}
              />
            </View>
          )}
          <FlatList
            data={progressList}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProgress(); }} />}
            ListEmptyComponent={
              <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No progress logged yet</Text>
                <Text style={[styles.emptyAction, { color: theme.accent }]}>Tap + to add your first entry</Text>
              </View>
            }
          />
        </>
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.blue }]}
        onPress={() => navigation.navigate('ProgressForm', {})}
      >
        <Text style={styles.addButtonText}>+ Log Progress</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderLeftWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  dateText: { fontSize: 12, fontWeight: '700' },
  userText: { fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 6 },
  statBox: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2 },
  notes: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  editText: { fontWeight: '700', fontSize: 13 },
  deleteBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  deleteText: { fontWeight: '700', fontSize: 13 },
  emptyCard: { borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptyAction: { fontSize: 13, marginTop: 6, fontWeight: '600' },
  addButton: { margin: 16, padding: 16, borderRadius: 14, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  chartCard: { margin: 16, marginBottom: 4, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  chartTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12, alignSelf: 'flex-start' },
});