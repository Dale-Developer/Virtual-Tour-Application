import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { deleteAccount } from '../../db/database';
import { ProfileForm, PasswordForm, SectionCard } from '../../components/AccountForms';
import Button from '../../components/Button';
import { colors } from '../../theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const confirmLogout = () =>
    Alert.alert('Log out?', 'Your progress stays saved on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', onPress: logout },
    ]);

  const confirmDelete = () =>
    Alert.alert(
      'Delete your account?',
      'Your account, quiz scores and completed destinations will be permanently removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => { await deleteAccount(user.id); await logout(); },
        },
      ]
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.sub}>Signed in as @{user.username}</Text>
      </View>

      <View style={{ padding: 16, marginTop: -26 }}>
        <SectionCard title="Account settings" subtitle="Update your name and username.">
          <ProfileForm />
        </SectionCard>

        <SectionCard title="Change password" subtitle="You need your current password to set a new one.">
          <PasswordForm />
        </SectionCard>

        <SectionCard>
          <Button title="Log out" icon="log-out-outline" variant="outline" onPress={confirmLogout} />
          <View style={{ height: 10 }} />
          <Button title="Delete my account" icon="trash-outline" variant="outline" color={colors.danger} onPress={confirmDelete} />
        </SectionCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.primary, paddingHorizontal: 18, paddingBottom: 46, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
});
