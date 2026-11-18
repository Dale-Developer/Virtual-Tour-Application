import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../db/database';
import Input from './Input';
import Button from './Button';
import { colors } from '../theme';

/** Edit first name, last name and username. Shared by the tourist and admin settings screens. */
export function ProfileForm({ color = colors.primary }) {
  const { user, refreshUser } = useAuth();
  const [first, setFirst] = useState(user.first_name);
  const [last, setLast] = useState(user.last_name);
  const [username, setUsername] = useState(user.username);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const unchanged = first.trim() === user.first_name && last.trim() === user.last_name && username.trim() === user.username;

  const save = async () => {
    const e = {};
    if (!first.trim()) e.first = 'Enter your first name.';
    if (!last.trim()) e.last = 'Enter your last name.';
    if (!/^[A-Za-z0-9_.]{3,20}$/.test(username.trim())) e.username = '3-20 characters: letters, numbers, _ or .';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await updateProfile(user.id, { first_name: first, last_name: last, username });
      await refreshUser();
      Alert.alert('Saved', 'Your account details were updated.');
    } catch (err) {
      setErrors({ username: err.message });
    }
    setBusy(false);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Input label="First name" value={first} onChangeText={setFirst} error={errors.first} /></View>
        <View style={{ flex: 1 }}><Input label="Last name" value={last} onChangeText={setLast} error={errors.last} /></View>
      </View>
      <Input label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} error={errors.username} />
      <Button title="Save changes" onPress={save} loading={busy} disabled={unchanged} color={color} />
    </View>
  );
}

/** Change password: asks for the current password, then the new one twice. */
export function PasswordForm({ color = colors.primary }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const e = {};
    if (!current) e.current = 'Enter your current password.';
    if (next.length < 6) e.next = 'Use at least 6 characters.';
    else if (next === current) e.next = 'Choose a password different from the current one.';
    if (confirm !== next) e.confirm = 'The passwords do not match.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await changePassword(user.id, current, next);
      setCurrent(''); setNext(''); setConfirm('');
      Alert.alert('Password changed', 'Use your new password the next time you log in.');
    } catch (err) {
      setErrors({ current: err.message });
    }
    setBusy(false);
  };

  return (
    <View>
      <Input label="Current password" value={current} onChangeText={setCurrent} secureTextEntry error={errors.current} />
      <Input label="New password" value={next} onChangeText={setNext} secureTextEntry placeholder="At least 6 characters" error={errors.next} />
      <Input label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry error={errors.confirm} />
      <Button title="Change password" onPress={save} loading={busy} color={color} />
    </View>
  );
}

export function SectionCard({ title, subtitle, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      <View style={{ marginTop: title ? 12 : 0 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 22, padding: 18, marginBottom: 14,
    shadowColor: '#17313A', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 3 },
});
