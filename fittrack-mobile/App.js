import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from './src/services/AuthContext';
import { ThemeProvider, useTheme } from './src/services/ThemeContext';

// Auth screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// User screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
//import WorkoutListScreen from './src/screens/workout/WorkoutListScreen';
//import WorkoutFormScreen from './src/screens/workout/WorkoutFormScreen';
//import WorkoutDetailScreen from './src/screens/workout/WorkoutDetailScreen';

// Progress screens
import ProgressListScreen from './src/screens/ProgressListScreen';
import ProgressFormScreen from './src/screens/ProgressFormScreen';

// Admin screens
import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminUserDetailScreen from './src/screens/admin/AdminUserDetailScreen';
import AdminWorkoutsScreen from './src/screens/admin/AdminWorkoutsScreen';
import AdminWorkoutDetailScreen from './src/screens/admin/AdminWorkoutDetailScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      {/* <Stack.Screen name="WorkoutList" component={WorkoutListScreen} /> */}
      {/* <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} /> */}
      {/* <Stack.Screen name="WorkoutForm" component={WorkoutFormScreen} /> */}
      {/* Progress Tracking Screens */}
      <Stack.Screen name="ProgressList" component={ProgressListScreen} />
      <Stack.Screen name="ProgressForm" component={ProgressFormScreen} />
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
      {!user
        ? <AuthStack />
        : user.role === 'admin'
          ? <AdminStack />
          : <UserStack />
      }
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