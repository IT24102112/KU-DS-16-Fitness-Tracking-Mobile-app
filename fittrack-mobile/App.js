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

// Nutrition screens
import NutritionHomeScreen from './src/screens/nutrition/NutritionHomeScreen';
import AddMealScreen from './src/screens/nutrition/AddMealScreen';
import EditMealScreen from './src/screens/nutrition/EditMealScreen';
import MealDetailScreen from './src/screens/nutrition/MealDetailScreen';

// Progress screens
import ProgressListScreen from './src/screens/progress/ProgressListScreen';
import ProgressFormScreen from './src/screens/progress/ProgressFormScreen';
import ProgressReportScreen from './src/screens/ProgressReportScreen';
import SavedReportsScreen from './src/screens/SavedReportsScreen';
import ReportDetailScreen from './src/screens/ReportDetailScreen';
import GoalScreen from './src/screens/GoalScreen';

// Admin screens
import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminUserDetailScreen from './src/screens/admin/AdminUserDetailScreen';
import AdminWorkoutsScreen from './src/screens/admin/AdminWorkoutsScreen';
import AdminWorkoutDetailScreen from './src/screens/admin/AdminWorkoutDetailScreen';
import AdminWorkoutFormScreen from './src/screens/admin/AdminWorkoutFormScreen';
import AdminNutritionScreen from './src/screens/admin/AdminNutritionScreen';
import AdminNutritionFormScreen from './src/screens/admin/AdminNutritionFormScreen';
import AdminProgressScreen from './src/screens/admin/AdminProgressScreen';
import AdminProgressFormScreen from './src/screens/admin/AdminProgressFormScreen';
import AdminReportsScreen from './src/screens/admin/AdminReportsScreen';

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
      <Stack.Screen name="ExerciseList" component={ExerciseListScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="ExerciseForm" component={ExerciseFormScreen} />
      <Stack.Screen name="NutritionHome" component={NutritionHomeScreen} />
      <Stack.Screen name="AddMeal" component={AddMealScreen} />
      <Stack.Screen name="EditMeal" component={EditMealScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
      <Stack.Screen name="ProgressList" component={ProgressListScreen} />
      <Stack.Screen name="ProgressForm" component={ProgressFormScreen} />
      <Stack.Screen name="ProgressReport" component={ProgressReportScreen} />
      <Stack.Screen name="SavedReports" component={SavedReportsScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
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
      <Stack.Screen name="ExerciseList" component={ExerciseListScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="ExerciseForm" component={ExerciseFormScreen} />
      <Stack.Screen name="AdminNutrition" component={AdminNutritionScreen} />
      <Stack.Screen name="AdminNutritionForm" component={AdminNutritionFormScreen} />
      <Stack.Screen name="AdminProgress" component={AdminProgressScreen} />
      <Stack.Screen name="AdminProgressForm" component={AdminProgressFormScreen} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
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

