import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/services/AuthContext';
import { ThemeProvider, useTheme } from './src/services/ThemeContext';

// Auth screens
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// User screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WorkoutListScreen from './src/screens/workout/WorkoutListScreen';
import WorkoutFormScreen from './src/screens/workout/WorkoutFormScreen';
import WorkoutDetailScreen from './src/screens/workout/WorkoutDetailScreen';

// Exercise screens
import ExerciseListScreen from './src/screens/exercise/ExerciseListScreen';
import ExerciseDetailScreen from './src/screens/exercise/ExerciseDetailScreen';
import ExerciseFormScreen from './src/screens/exercise/ExerciseFormScreen';

// Nutrition screens (user)
import NutritionHomeScreen from './src/screens/nutrition/NutritionHomeScreen';
import AddMealScreen from './src/screens/nutrition/AddMealScreen';
import EditMealScreen from './src/screens/nutrition/EditMealScreen';
import MealDetailScreen from './src/screens/nutrition/MealDetailScreen';

// Progress screens (user)
import ProgressListScreen from './src/screens/progress/ProgressListScreen';
import ProgressFormScreen from './src/screens/progress/ProgressFormScreen';

// Goal Screen
import GoalScreen from './src/screens/goals/GoalScreen';

// Goal Screen for admin
import AdminGoalScreen from './src/screens/admin/AdminGoalScreen';
import AdminGoalFormScreen from './src/screens/admin/AdminGoalFormScreen';

//report screens
import ProgressReportScreen from './src/screens/reports/ProgressReportScreen';
import SavedReportsScreen from './src/screens/reports/SavedReportsScreen';
import ReportEditScreen from './src/screens/reports/ReportEditScreen';

// Admin screens
import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminUserDetailScreen from './src/screens/admin/AdminUserDetailScreen';
import AdminWorkoutsScreen from './src/screens/admin/AdminWorkoutsScreen';
import AdminWorkoutDetailScreen from './src/screens/admin/AdminWorkoutDetailScreen';
import AdminWorkoutFormScreen from './src/screens/admin/AdminWorkoutFormScreen';

// Admin Nutrition screens
import AdminNutritionScreen from './src/screens/admin/AdminNutritionScreen';
import AdminNutritionFormScreen from './src/screens/admin/AdminNutritionFormScreen';

// Admin progress screens
import AdminProgressScreen from './src/screens/admin/AdminProgressScreen';
import AdminProgressFormScreen from './src/screens/admin/AdminProgressFormScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="WorkoutForm" component={WorkoutFormScreen} />

      {/* Exercise screens */}
      <Stack.Screen name="ExerciseList" component={ExerciseListScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="ExerciseForm" component={ExerciseFormScreen} />

      {/* Nutrition screens */}
      <Stack.Screen name="NutritionHome" component={NutritionHomeScreen} />
      <Stack.Screen name="AddMeal" component={AddMealScreen} />
      <Stack.Screen name="EditMeal" component={EditMealScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />

      {/* Report screens */}
      <Stack.Screen name="ProgressReport" component={ProgressReportScreen} />
      <Stack.Screen name="SavedReports" component={SavedReportsScreen} />
      <Stack.Screen name="ReportEdit" component={ReportEditScreen} />

      {/* Progress screens */}
      <Stack.Screen name="ProgressList" component={ProgressListScreen} />
      <Stack.Screen name="ProgressForm" component={ProgressFormScreen} />

      {/* Goal Screen */}
      <Stack.Screen name="GoalScreen" component={GoalScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} />
      <Stack.Screen name="AdminWorkouts" component={AdminWorkoutsScreen} />
      <Stack.Screen name="AdminWorkoutDetail" component={AdminWorkoutDetailScreen} />
      <Stack.Screen name="AdminWorkoutForm" component={AdminWorkoutFormScreen} />

      {/* Exercise screens – for admin exercise management */}
      <Stack.Screen name="ExerciseList" component={ExerciseListScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="ExerciseForm" component={ExerciseFormScreen} />

      {/* Admin Nutrition screens */}
      <Stack.Screen name="AdminNutrition" component={AdminNutritionScreen} />
      <Stack.Screen name="AdminNutritionForm" component={AdminNutritionFormScreen} />

      {/* Admin goal screens */}
      <Stack.Screen name="AdminGoal" component={AdminGoalScreen} />
      <Stack.Screen name="AdminGoalForm" component={AdminGoalFormScreen} />

      {/* Admin progress screens */}
      <Stack.Screen name="AdminProgress" component={AdminProgressScreen} />
      <Stack.Screen name="AdminProgressForm" component={AdminProgressFormScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : user.role === 'admin' ? <AdminStack /> : <UserStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}