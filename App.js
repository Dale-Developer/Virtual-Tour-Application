import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppSettingsProvider } from './src/context/AppSettingsContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppSettingsProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AppSettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
