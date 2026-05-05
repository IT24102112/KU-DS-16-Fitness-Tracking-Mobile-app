import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
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

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params;
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);
  const tabScrollRef = useRef(null);

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/reports/${reportId}`);
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        throw new Error('Failed to load report data');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      navigation.goBack();
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderTabContent = () => {
    if (!report || !report.data) return null;

    // Use report.data directly
    const { overview, weight, workout, nutrition, goals, images } = report.data;

    switch (activeTab) {
      case 0:
        return <OverviewTab data={{
          streak: overview?.activityDays || overview?.streak || 0,
          caloriesBurned: nutrition?.totalCalories || overview?.caloriesBurned || 0,
          weightChange: weight?.totalChange || overview?.weightChange || 0,
          weightChangePercent: weight?.changePercentage || overview?.weightChangePercent || 0,
          goalsDone: goals?.achievedGoals || overview?.goalsDone || 0,
          goalsTotal: goals?.totalActiveGoals || overview?.goalsTotal || 0,
        }} />;
      case 1:
        return <WeightTab data={{
          entries: weight?.weightTrendData || weight?.entries || [],
          minWeight: weight?.bestWeight || weight?.minWeight || 0,
          avgWeight: Math.round(weight?.averageWeight || weight?.avgWeight || 0),
          maxWeight: weight?.worstWeight || weight?.maxWeight || 0,
          trend: weight?.totalChange || weight?.trend || 0,
        }} />;
      case 2:
        const normalizedWorkouts = {
          total: typeof workout?.total === 'number' ? workout.total : 0,
          totalDuration: typeof workout?.totalDuration === 'number' ? workout.totalDuration : 0,
          completionRate: typeof workout?.completionRate === 'number' ? workout.completionRate : 0,
          split: (workout?.split && typeof workout.split === 'object') ? workout.split : {
            strength: 0, cardio: 0, flexibility: 0, hiit: 0, yoga: 0, sports: 0, custom: 0,
          },
          topExercises: Array.isArray(workout?.topExercises) ? workout.topExercises : [],
          workoutsList: Array.isArray(workout?.workoutsList) ? workout.workoutsList : [],
        };
        return <WorkoutTab data={normalizedWorkouts} navigation={navigation} />;
      case 3:
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
          mealFrequency: nutrition?.mealsByType || nutrition?.mealFrequency || {
            breakfast: 0, lunch: 0, dinner: 0, snacks: 0,
          },
        }} />;
      case 4:
        const goalsList = goals?.goalsList || [];
        const activeGoals = goalsList.length ? goalsList.filter(g => g.status === 'In Progress') : (Array.isArray(goals?.active) ? goals.active : []);
        const completedGoals = goalsList.length ? goalsList.filter(g => g.status === 'Achieved') : (Array.isArray(goals?.completed) ? goals.completed : []);
        
        return <GoalsTab data={{
          active: activeGoals,
          completed: completedGoals,
          stats: {
            total: goals?.totalActiveGoals || goals?.stats?.total || 0,
            achieved: goals?.achievedGoals || goals?.stats?.achieved || 0,
            onTrack: goals?.onTrackGoals || goals?.stats?.inProgress || 0,
            offTrack: goals?.totalActiveGoals ? (goals.totalActiveGoals - (goals.onTrackGoals || 0)) : (goals?.stats?.failed || 0),
          },
        }} />;
      case 5:
        return <ImagesTab data={{
          progressImages: images?.imagesList || images?.progressImages || [],
          beforeAfter: {
            beforeImage: images?.beforeImage?.imageUrl || images?.beforeAfter?.beforeImage,
            afterImage: images?.afterImage?.imageUrl || images?.beforeAfter?.afterImage,
            beforeDate: images?.beforeImage?.date || images?.beforeAfter?.beforeDate,
            afterDate: images?.afterImage?.date || images?.beforeAfter?.afterDate,
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
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Report Detail</Text>
        <ThemeToggleButton />
      </View>

      {/* Report Info Header */}
      {report && (
        <View style={[styles.infoContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Text style={[styles.reportName, { color: theme.textPrimary }]}>{report.reportName}</Text>
          <Text style={[styles.dateLabel, { color: theme.textMuted }]}>
            {formatDate(report.startDate)} - {formatDate(report.endDate)}
          </Text>
        </View>
      )}

      {/* Tab Navigation */}
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
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading report details...</Text>
        </View>
      ) : !report ? (
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
            Report not found.
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
          <View style={{ height: 40 }} />
        </ScrollView>
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
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  reportName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateLabel: {
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
    paddingBottom: 40,
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
});
