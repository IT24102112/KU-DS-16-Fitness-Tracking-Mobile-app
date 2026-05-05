import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../services/ThemeContext';
import apiRequest from '../services/api';
import ThemeToggleButton from '../components/ThemeToggleButton';
import OverviewTab from './progress/ProgressReportTabs/OverviewTab';
import WeightTab from './progress/ProgressReportTabs/WeightTab';
import WorkoutTab from './progress/ProgressReportTabs/WorkoutTab';
import NutritionTab from './progress/ProgressReportTabs/NutritionTab';
import GoalsTab from './progress/ProgressReportTabs/GoalsTab';
import ImagesTab from './progress/ProgressReportTabs/ImagesTab';

const TABS = ['Overview', 'Weight', 'Workout', 'Nutrition', 'Goals', 'Images'];

export default function ProgressReportScreen({ navigation }) {
  const { theme } = useTheme();
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState(null); // write-only state to capture errors for potential future use
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const scrollViewRef = useRef(null);
  const tabScrollRef = useRef(null);

  // Fetch report data when dates change
  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Send dates as ISO strings to backend
      const res = await apiRequest('/reports/generate', 'POST', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      console.log('=== RAW API RESPONSE ===');
      console.log('Full response:', JSON.stringify(res, null, 2));
      console.log('Response data:', res.data);
      console.log('Response data metrics:', res.data?.metrics);
      console.log('Response data metrics.nutrition:', res.data?.metrics?.nutrition);
      console.log('Response data metrics.goals:', res.data?.metrics?.goals);
      console.log('Response data metrics.workouts:', res.data?.metrics?.workouts);
      console.log('=== END RAW API RESPONSE ===');

      // Validate response structure
      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', 'Failed to generate report: ' + error.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }

    if (selectedDate) {
      if (selectedDate <= endDate) {
        setStartDate(selectedDate);
      } else {
        Alert.alert('Error', 'Start date must be before end date');
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }

    if (selectedDate) {
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert('Error', 'End date must be after start date');
      }
    }
  };

  const handleSaveReport = async () => {
    const generatedName = `Report ${formatDate(startDate)} - ${formatDate(endDate)}`;

    try {
      setLoading(true);
      const res = await apiRequest('/reports', 'POST', {
        reportName: generatedName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (res.success) {
        Alert.alert('Success', 'Report saved successfully!');
      } else {
        throw new Error(res.message || 'Failed to save report');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (index) => {
    setActiveTab(index);
    if (tabScrollRef.current) {
      const tabWidth = 80;
      const scrollPosition = Math.max(0, (index * tabWidth) - 50);
      tabScrollRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderTabContent = () => {
    if (!reportData) return null;

    const { metrics, summary, images } = reportData;

    // Extract nested data properly with enhanced logging
    const goals = metrics?.goals || {};
    // Support both backend keys: 'workouts' (new) and 'workout' (older/alternate)
    const workouts = metrics?.workouts || metrics?.workout || {};
    const nutrition = metrics?.nutrition || {};
    const weight = metrics?.weight || {};

    console.log('=== TAB CONTENT DEBUG ===');
    console.log('Full metrics:', JSON.stringify(metrics, null, 2));
    console.log('goals data:', goals);
    console.log('workouts data (resolved):', workouts);
    console.log('nutrition data:', nutrition);
    console.log('weight data:', weight);
    console.log('=== END TAB CONTENT DEBUG ===');

    switch (activeTab) {
      case 0:
        // Overview Tab - map summary and metrics data
        return <OverviewTab data={{
          streak: summary?.activityDays || 0,
          caloriesBurned: metrics?.nutrition?.totalCalories || 0,
          weightChange: weight?.totalChange || 0,
          weightChangePercent: weight?.changePercentage || 0,
          goalsDone: goals?.achievedGoals || 0,
          goalsTotal: goals?.totalActiveGoals || 0,
        }} />;
      case 1:
        // Weight Tab - map weight metrics
        return <WeightTab data={{
          entries: weight?.weightTrendData || [],
          minWeight: weight?.bestWeight || 0,
          avgWeight: Math.round(weight?.averageWeight || 0),
          maxWeight: weight?.worstWeight || 0,
          trend: weight?.totalChange || 0,
        }} />;
      case 2:
        // Workout Tab - map workout metrics
        // Resolve workouts object and provide defaults for missing fields
        const workoutsRaw = metrics?.workouts || metrics?.workout || {};
        if (!metrics?.workouts && metrics?.workout) {
          console.log('[ProgressReportScreen] ⚠ using fallback key "metrics.workout"');
        }

        const normalizedWorkouts = {
          total: typeof workoutsRaw.total === 'number' ? workoutsRaw.total : 0,
          totalDuration: typeof workoutsRaw.totalDuration === 'number' ? workoutsRaw.totalDuration : 0,
          completionRate: typeof workoutsRaw.completionRate === 'number' ? workoutsRaw.completionRate : 0,
          split: (workoutsRaw.split && typeof workoutsRaw.split === 'object') ? workoutsRaw.split : {
            strength: 0,
            cardio: 0,
            flexibility: 0,
            hiit: 0,
            yoga: 0,
            sports: 0,
            custom: 0,
          },
          topExercises: Array.isArray(workoutsRaw.topExercises) ? workoutsRaw.topExercises : [],
          // include detailed list of workouts if backend provided them
          workoutsList: Array.isArray(workoutsRaw.workoutsList) ? workoutsRaw.workoutsList : [],
        };

        console.log('[WorkoutTab] Data received:', {
          total: normalizedWorkouts.total,
          totalDuration: normalizedWorkouts.totalDuration,
          completionRate: normalizedWorkouts.completionRate,
          topExercisesCount: normalizedWorkouts.topExercises.length,
          topExercises: normalizedWorkouts.topExercises,
          workoutsListCount: normalizedWorkouts.workoutsList.length,
        });

        return <WorkoutTab data={normalizedWorkouts} navigation={navigation} />;
      case 3:
        // Nutrition Tab - map nutrition metrics
        // Handle both old format (with avgCarbs, avgFat, avgProtein) and new format
        const nutritionMacros = nutrition?.macros || {};
        return <NutritionTab data={{
          totalCalories: nutrition?.totalCalories || 0,
          dailyAvg: nutrition?.dailyAvg || nutrition?.avgDailyCalories || 0,
          calorieEntries: nutrition?.calorieEntries || [],
          macros: {
            totalProtein: nutritionMacros?.totalProtein || nutrition?.totalProtein || 0,
            totalCarbs: nutritionMacros?.totalCarbs || nutrition?.totalCarbs || 0,
            totalFat: nutritionMacros?.totalFat || nutrition?.totalFat || 0,
          },
          mealFrequency: nutrition?.mealsByType || {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            snacks: 0,
          },
        }} />;
      case 4:
        // Goals Tab - map goals data properly
        const goalsList = goals?.goalsList || [];
        const activeGoals = goalsList.filter(g => g.status === 'In Progress');
        const completedGoals = goalsList.filter(g => g.status === 'Achieved');

        console.log('=== GOALS TAB DEBUG ===');
        console.log('Full goals object:', goals);
        console.log('goalsList:', goalsList);
        console.log('activeGoals:', activeGoals);
        console.log('completedGoals:', completedGoals);

        return <GoalsTab data={{
          active: activeGoals,
          completed: completedGoals,
          stats: {
            total: goals?.totalActiveGoals || 0,
            achieved: goals?.achievedGoals || 0,
            onTrack: goals?.onTrackGoals || 0,
            offTrack: (goals?.totalActiveGoals || 0) - (goals?.onTrackGoals || 0),
          },
        }} />;
      case 5:
        // Images Tab - map images data
        return <ImagesTab data={{
          progressImages: images?.imagesList || [],
          beforeAfter: {
            beforeImage: images?.beforeImage?.imageUrl,
            afterImage: images?.afterImage?.imageUrl,
            beforeDate: images?.beforeImage?.date,
            afterDate: images?.afterImage?.date,
          },
        }} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtn, { color: theme.accent }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Progress report</Text>
        <ThemeToggleButton />
      </View>

      {/* Date Range Picker */}
      <View style={[styles.datePickerContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.dateInputRow}>
          <View style={styles.dateInputColumn}>
            <Text style={[styles.dateLabel, { color: theme.textMuted }]}>From</Text>
            <TouchableOpacity
              style={[styles.dateInputBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={[styles.dateInputText, { color: theme.textPrimary }]}>
                {formatDate(startDate)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInputColumn}>
            <Text style={[styles.dateLabel, { color: theme.textMuted }]}>To</Text>
            <TouchableOpacity
              style={[styles.dateInputBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={[styles.dateInputText, { color: theme.textPrimary }]}>
                {formatDate(endDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
          maximumDate={endDate}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          minimumDate={startDate}
        />
      )}

      {/* Tab Navigation - Horizontal Scroll */}
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
        scrollEventThrottle={16}
      >
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === index && { borderBottomColor: theme.accent, borderBottomWidth: 3 },
            ]}
            onPress={() => handleTabPress(index)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === index ? theme.accent : theme.textMuted,
                  fontWeight: activeTab === index ? '600' : '400',
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Generating report...</Text>
        </View>
      ) : !reportData ? (
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
            No data available. Please try again.
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {renderTabContent()}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Split Buttons: My Reports and Save Reports */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.buttonContainer}>
          {/* My Reports Button */}
          <TouchableOpacity
            style={[
              styles.splitBtn,
              {
                backgroundColor: theme.accent,
                borderRightColor: theme.bg,
                borderRightWidth: 1,
              },
            ]}
            onPress={() => navigation.navigate('SavedReports')}
            disabled={!reportData}
          >
            <Text style={styles.splitBtnText}>📋 My Reports</Text>
          </TouchableOpacity>

          {/* Save Reports Button */}
          <TouchableOpacity
            style={[
              styles.splitBtn,
              {
                backgroundColor: theme.accent,
              },
            ]}
            onPress={handleSaveReport}
            disabled={!reportData}
          >
            <Text style={styles.splitBtnText}>💾 Save Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    paddingBottom: 12,
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
    flex: 1,
    textAlign: 'center',
  },
  datePickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  dateInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInputColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateInputBtn: {
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateInputText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    maxHeight: 50,
  },
  tab: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  splitBtnText: {
    color: '#fff',
    fontSize: 16,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
