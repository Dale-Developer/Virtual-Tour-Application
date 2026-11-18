import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SafeImage from '../../components/SafeImage';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { useAppSettings, DEFAULT_START_IMAGE } from '../../context/AppSettingsContext';
import { colors, radius } from '../../theme';

export default function StartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { startImageUri } = useAppSettings();
  return (
    <SafeImage source={startImageUri ? { uri: startImageUri } : DEFAULT_START_IMAGE} style={styles.bg}>
      <View style={styles.overlay} />
      <View style={[styles.top, { paddingTop: insets.top + 25 }]}>
        <Logo size={40} style={{ marginTop: 23, alignSelf: 'center' }} />
        <View style={styles.location}><Ionicons name="location" size={13} color="#D7F5EF" /><Text style={styles.locationText}>SOUTHERN LUZON · PHILIPPINES</Text></View>
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.kicker}>DISCOVER MORE THAN A DESTINATION</Text>
        <Text style={styles.title}>Stories worth{ '\n' }the journey.</Text>
        <Text style={styles.description}>Explore the heritage, natural wonders, and local culture of Cavite, Laguna, Batangas, Rizal, and Quezon.</Text>
        <Button title="Start exploring" icon="arrow-forward" onPress={() => navigation.navigate('Auth', { mode: 'register' })} style={styles.cta} />
        <TouchableOpacity onPress={() => navigation.navigate('Auth', { mode: 'login' })} style={styles.login}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginStrong}>Log in</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeImage>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'space-between', backgroundColor: colors.primary },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,29,38,0.55)' },
  top: { paddingHorizontal: 26, alignItems: 'center' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14 },
  locationText: { color: '#D7F5EF', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  bottom: { paddingHorizontal: 25, paddingTop: 30 },
  kicker: { color: '#9EDBD3', fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: '#fff', fontSize: 43, lineHeight: 48, fontWeight: '900', marginTop: 11, letterSpacing: -1.2 },
  description: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 22, marginTop: 13, marginBottom: 24, maxWidth: 330 },
  cta: { backgroundColor: colors.accent, minHeight: 54 },
  login: { paddingVertical: 18 },
  loginText: { color: 'rgba(255,255,255,0.82)', textAlign: 'center', fontSize: 13 },
  loginStrong: { color: '#fff', fontWeight: '900' },
});
