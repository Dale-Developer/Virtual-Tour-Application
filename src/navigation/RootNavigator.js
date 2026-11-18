import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { colors } from '../theme';
import Logo from '../components/Logo';

import StartScreen from '../screens/auth/StartScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import HomeScreen from '../screens/tourist/HomeScreen';
import PlacesScreen from '../screens/tourist/PlacesScreen';
import DestinationDetailScreen from '../screens/tourist/DestinationDetailScreen';
import VirtualTourScreen from '../screens/tourist/VirtualTourScreen';
import QuizListScreen from '../screens/tourist/QuizListScreen';
import QuizScreen from '../screens/tourist/QuizScreen';
import ProgressScreen from '../screens/tourist/ProgressScreen';
import SettingsScreen from '../screens/tourist/SettingsScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminDestinationsScreen from '../screens/admin/AdminDestinationsScreen';
import DestinationFormScreen from '../screens/admin/DestinationFormScreen';
import AdminQuizzesScreen from '../screens/admin/AdminQuizzesScreen';
import AdminQuestionsScreen from '../screens/admin/AdminQuestionsScreen';
import QuestionFormScreen from '../screens/admin/QuestionFormScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg } };

function tabOptions(palette, icons) {
  return ({ route }) => ({
    headerShown: false,
    tabBarShowLabel: true,
    tabBarActiveTintColor: '#fff',
    tabBarInactiveTintColor: 'rgba(255,255,255,0.66)',
    tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 7 },
    tabBarStyle: {
      backgroundColor: palette.primary,
      borderTopWidth: 0,
      height: 68,
      paddingTop: 8,
      paddingBottom: 5,
      elevation: 12,
      shadowColor: '#102B36',
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -3 },
    },
    tabBarIcon: ({ focused, color }) => {
      const [active, inactive] = icons[route.name];
      return <Ionicons name={focused ? active : inactive} size={21} color={color} />;
    },
  });
}

function TouristTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions(colors, {
      Home: ['home', 'home-outline'], Places: ['map', 'map-outline'],
      Quizzes: ['school', 'school-outline'], Progress: ['trophy', 'trophy-outline'],
      Settings: ['settings', 'settings-outline'],
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Places" component={PlacesScreen} />
      <Tab.Screen name="Quizzes" component={QuizListScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions(colors, {
      Dashboard: ['grid', 'grid-outline'], Destinations: ['location', 'location-outline'],
      'Quiz Manager': ['clipboard', 'clipboard-outline'], Users: ['people', 'people-outline'],
      Settings: ['settings', 'settings-outline'],
    })}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Destinations" component={AdminDestinationsScreen} />
      <Tab.Screen name="Quiz Manager" component={AdminQuizzesScreen} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
}

const plain = { headerShown: false, animation: 'fade' };

export default function RootNavigator() {
  const { user, ready, error } = useAuth();
  const { loaded: settingsLoaded } = useAppSettings();

  if (!ready || !settingsLoaded) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
      <Logo size={22} />
      <ActivityIndicator color="#fff" style={{ marginTop: 20 }} size="large" />
      <Text style={{ color: 'rgba(255,255,255,0.75)', marginTop: 12, fontSize: 12 }}>Preparing your journey…</Text>
    </View>
  );

  if (error) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: colors.bg }}>
      <Ionicons name="cloud-offline-outline" size={42} color={colors.danger} />
      <Text style={{ fontWeight: '800', fontSize: 17, marginTop: 14, color: colors.text }}>We couldn't open the local database</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 7, lineHeight: 21 }}>{error}</Text>
    </View>
  );

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={plain}>
        {!user ? <>
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </> : user.role === 'Admin' ? <>
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
          <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} />
          <Stack.Screen name="DestinationForm" component={DestinationFormScreen} />
          <Stack.Screen name="AdminQuestions" component={AdminQuestionsScreen} />
          <Stack.Screen name="QuestionForm" component={QuestionFormScreen} />
        </> : <>
          <Stack.Screen name="TouristTabs" component={TouristTabs} />
          <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} />
          <Stack.Screen name="VirtualTour" component={VirtualTourScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
        </>}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
