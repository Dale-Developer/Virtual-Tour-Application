import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { showAlert } from '../../lib/dialog';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings, DEFAULT_START_IMAGE } from '../../context/AppSettingsContext';
import { resetSampleData } from '../../db/database';
import AdminHeader from '../../components/AdminHeader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import SafeImage from '../../components/SafeImage';
import { ProfileForm, PasswordForm, SectionCard } from '../../components/AccountForms';
import { colors, colors as c, radius } from '../../theme';

const START_W = 1080;
const START_H = 1920;

export default function AdminSettingsScreen() {
  const { user, logout } = useAuth();
  const { logoUri, setLogo, resetLogo, startImageUri, setStartImage, resetStartImage } = useAppSettings();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [startUrl, setStartUrl] = useState('');
  const [startBusy, setStartBusy] = useState(false);

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return showAlert('Permission needed', 'Allow photo access to choose a logo, or paste an image URL instead.');
    // No cropping, so a transparent PNG logo keeps its transparency.
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.8, base64: true });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    const a = res.assets[0];
    if (a.base64.length > 2_500_000) {
      return showAlert('Image is too large', 'Choose a logo smaller than about 1.5 MB.');
    }
    setBusy(true);
    await setLogo(`data:${a.mimeType || 'image/png'};base64,${a.base64}`);
    setBusy(false);
    showAlert('Logo updated', 'The new logo now shows across the app.');
  };

  const useUrl = async () => {
    if (!/^https?:\/\/\S+$/i.test(url.trim())) return showAlert('Invalid URL', 'Paste a direct image link that starts with https://');
    await setLogo(url.trim());
    setUrl('');
    showAlert('Logo updated', 'If the logo looks blank, the link may not point straight to an image file.');
  };

  // ----- welcome screen image -----
  // The picker's own crop box is always square on iPhone, so we skip it and crop in code:
  // center-crop to 9:16, then resize to exactly 1080 x 1920.
  const pickStartImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return showAlert('Permission needed', 'Allow photo access to choose a picture, or paste an image URL instead.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
    if (res.canceled || !res.assets?.[0]?.uri) return;

    setStartBusy(true);
    try {
      const original = await ImageManipulator.manipulate(res.assets[0].uri).renderAsync();
      const { width: w, height: h } = original;
      const target = START_W / START_H; // 9:16
      let cropW = w;
      let cropH = h;
      if (w / h > target) cropW = Math.round(h * target); // too wide: trim the sides
      else cropH = Math.round(w / target);                // too tall: trim top and bottom
      const rect = { originX: Math.floor((w - cropW) / 2), originY: Math.floor((h - cropH) / 2), width: cropW, height: cropH };

      const ref = await ImageManipulator.manipulate(original).crop(rect).resize({ width: START_W, height: START_H }).renderAsync();
      const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.75, base64: true });
      await setStartImage(`data:image/jpeg;base64,${out.base64}`);
      showAlert('Welcome image updated', `Saved as ${START_W} x ${START_H}. Log out to see it on the welcome screen.`);
    } catch (e) {
      showAlert('Could not use that picture', e.message);
    }
    setStartBusy(false);
  };

  const useStartUrl = async () => {
    if (!/^https?:\/\/\S+$/i.test(startUrl.trim())) return showAlert('Invalid URL', 'Paste a direct image link that starts with https://');
    await setStartImage(startUrl.trim());
    setStartUrl('');
    showAlert('Welcome image updated', 'If the picture looks blank, the link may not point straight to an image file.');
  };

  const confirmResetStart = () =>
    showAlert('Reset the welcome image?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: resetStartImage },
    ]);

  const confirmReset = () =>
    showAlert('Reset to the default logo?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: resetLogo },
    ]);

  const resetData = () =>
    showAlert(
      'Load the sample data?',
      'All destinations, quiz questions and quiz scores (for every tourist) will be replaced with the built-in samples. Tourist accounts are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => { await resetSampleData(user.id); showAlert('Done', 'Sample data restored.'); },
        },
      ]
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AdminHeader title="Settings" subtitle={`@${user.username} · Admin`} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        <SectionCard title="App logo" subtitle="Shown on the welcome screen, the login screen and the tourist home screen.">
          <View style={styles.preview}>
            <Logo size={26} />
          </View>
          <Text style={styles.previewNote}>Preview on the app's blue header</Text>
          <Button title={logoUri ? 'Choose a different logo' : 'Choose logo from gallery'} icon="image-outline" onPress={pickLogo} loading={busy} style={{ marginTop: 12 }} />
          <Input value={url} onChangeText={setUrl} placeholder="…or paste a logo image URL" autoCapitalize="none" style={{ marginTop: 12 }} />
          <Button title="Use this URL" variant="outline" onPress={useUrl} disabled={!url.trim()} />
          {logoUri ? <Button title="Reset to default logo" variant="outline" color={c.danger} onPress={confirmReset} style={{ marginTop: 10 }} /> : null}
          <Text style={styles.tip}>Tip: use a PNG with a transparent background and light or white artwork, since it sits on a blue header and over photos.</Text>
        </SectionCard>

        <SectionCard title="Welcome screen image" subtitle="The full-screen photo people see before they log in.">
          <SafeImage source={startImageUri ? { uri: startImageUri } : DEFAULT_START_IMAGE} style={styles.startPreview} />
          <Text style={styles.previewNote}>{startImageUri ? 'Custom image' : 'Default image'}</Text>
          <Button title={startImageUri ? 'Choose a different image' : 'Choose image from gallery'} icon="image-outline" onPress={pickStartImage} loading={startBusy} style={{ marginTop: 12 }} />
          <Input value={startUrl} onChangeText={setStartUrl} placeholder="…or paste an image URL" autoCapitalize="none" style={{ marginTop: 12 }} />
          <Button title="Use this URL" variant="outline" onPress={useStartUrl} disabled={!startUrl.trim()} />
          {startImageUri ? <Button title="Reset to default image" variant="outline" color={c.danger} onPress={confirmResetStart} style={{ marginTop: 10 }} /> : null}
          <Text style={styles.tip}>Pictures are cropped from the center to 1080 x 1920 (9:16). A tall photo keeps the most of your picture. The welcome screen darkens it a little so the white text stays readable.</Text>
        </SectionCard>

        <SectionCard title="Account settings" subtitle="Update your name and username.">
          <ProfileForm color={c.primary} />
        </SectionCard>

        <SectionCard title="Change password" subtitle="Change the default admin password before sharing the app.">
          <PasswordForm color={c.primary} />
        </SectionCard>

        <SectionCard title="Sample data" subtitle="Load the built-in CALABARZON destinations and quizzes. Use this the first time, or to restore them if the data gets messy. It replaces all destinations, questions and quiz scores for everyone.">
          <Button title="Load sample data" icon="refresh" variant="outline" color={c.danger} onPress={resetData} />
        </SectionCard>

        <Button title="Log out" icon="log-out-outline" variant="outline" onPress={logout} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 22, alignItems: 'center', justifyContent: 'center' },
  startPreview: { height: 220, borderRadius: radius.md, alignSelf: 'center', aspectRatio: 9 / 16 },
  previewNote: { textAlign: 'center', fontSize: 11, color: c.muted, marginTop: 6 },
  tip: { fontSize: 12, color: c.muted, marginTop: 12, lineHeight: 17 },
});
