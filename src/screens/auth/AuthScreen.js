import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { colors, radius } from '../../theme';

export default function AuthScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [mode, setMode] = useState(route.params?.mode || 'register');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  const validate = () => {
    const next = {};
    if (isRegister && !firstName.trim()) next.firstName = 'Enter your first name.';
    if (isRegister && !lastName.trim()) next.lastName = 'Enter your last name.';
    if (!/^[A-Za-z0-9_.]{3,20}$/.test(username.trim())) next.username = 'Use 3–20 letters, numbers, underscores, or periods.';
    if (password.length < 6) next.password = 'Password must contain at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      if (isRegister) await register({ first_name: firstName.trim(), last_name: lastName.trim(), username: username.trim(), password });
      else await login(username.trim(), password);
    } catch (err) {
      setErrors({ form: err.message || 'Please check your details and try again.' });
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.back} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Logo size={30} style={{ marginTop: 6, alignSelf: 'center' }} />
          <Text style={styles.title}>{isRegister ? 'Join the journey.' : 'Welcome back.'}</Text>
          <Text style={styles.subtitle}>{isRegister ? 'Create an account to save places and track your discoveries.' : 'Sign in to continue exploring CALABARZON.'}</Text>
        </View>

        <View style={styles.card}>
          {isRegister ? (
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}><Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="Juan" error={errors.firstName} autoCapitalize="words" /></View>
              <View style={{ flex: 1 }}><Input label="Last name" value={lastName} onChangeText={setLastName} placeholder="Dela Cruz" error={errors.lastName} autoCapitalize="words" /></View>
            </View>
          ) : null}
          <Input label="Username" value={username} onChangeText={setUsername} placeholder="your.username" autoCapitalize="none" autoCorrect={false} error={errors.username} />
          <View>
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry={!showPassword} error={errors.password} />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.passwordToggle} hitSlop={8}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>
          {errors.form ? <Text accessibilityRole="alert" style={styles.formError}>{errors.form}</Text> : null}
          <Button title={isRegister ? 'Create account' : 'Log in'} icon={isRegister ? 'person-add-outline' : 'log-in-outline'} onPress={submit} loading={busy} style={styles.submit} />
          <TouchableOpacity onPress={() => { setMode(isRegister ? 'login' : 'register'); setErrors({}); }} style={styles.switchWrap}>
            <Text style={styles.switch}>{isRegister ? 'Already have an account? Log in' : 'New to the app? Create an account'}</Text>
          </TouchableOpacity>
          <View style={styles.privacy}><Ionicons name="shield-checkmark-outline" size={15} color={colors.muted} /><Text style={styles.privacyText}>Your account is used to save your exploration progress.</Text></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1 },
  header: { backgroundColor: colors.primary, paddingHorizontal: 23, paddingBottom: 55 },
  back: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 29, fontWeight: '900', marginTop: 14, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.76)', fontSize: 13, lineHeight: 20, marginTop: 6, maxWidth: 310, textAlign: 'center', alignSelf: 'center' },
  card: { backgroundColor: colors.bg, marginTop: -28, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 27, paddingBottom: 32, flex: 1 },
  nameRow: { flexDirection: 'row', gap: 10 },
  passwordToggle: { position: 'absolute', right: 14, top: 37, padding: 5 },
  formError: { color: colors.danger, marginBottom: 12, fontSize: 13, fontWeight: '600' },
  submit: { marginTop: 4, minHeight: 52 },
  switchWrap: { marginTop: 20, paddingVertical: 8 },
  switch: { textAlign: 'center', color: colors.primary, fontWeight: '800', fontSize: 13 },
  privacy: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 },
  privacyText: { color: colors.muted, fontSize: 10 },
});
