import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getDestination, createDestination, updateDestination } from '../../db/database';
import AdminHeader from '../../components/AdminHeader';
import Input from '../../components/Input';
import Chips from '../../components/Chips';
import Button from '../../components/Button';
import SafeImage from '../../components/SafeImage';
import { colors as c, radius, CATEGORIES } from '../../theme';

const empty = {
  name: '', description: '', address: '', category: 'Heritage',
  image: '', panorama_asset: '', latitude: '', longitude: '',
};

/** Reusable "pick from gallery or paste URL" block for the image and panorama fields. */
function ImageField({ label, value, onChange, aspect, hint, height = 170 }) {
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to pick an image, or paste an image URL instead.');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect, quality: 0.5, base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) onChange(`data:image/jpeg;base64,${res.assets[0].base64}`);
  };
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <SafeImage uri={value} style={{ height, borderRadius: radius.md }} />
      <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
        <Button title="Pick from gallery" icon="images-outline" onPress={pick} style={{ flex: 1, paddingHorizontal: 8 }} />
        {value ? <Button title="Remove" variant="outline" color={c.danger} onPress={() => onChange('')} style={{ paddingHorizontal: 16 }} /> : null}
      </View>
      <Input value={value.startsWith('data:') ? '' : value} onChangeText={onChange} placeholder="…or paste an image URL (https://…)" autoCapitalize="none" />
    </View>
  );
}

export default function DestinationFormScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const id = route.params?.id;
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    getDestination(id).then((d) => {
      if (!d) return;
      setForm({
        name: d.name, description: d.description, address: d.address, category: d.category,
        image: d.image || '', panorama_asset: d.panorama_asset || '',
        latitude: d.latitude == null ? '' : String(d.latitude),
        longitude: d.longitude == null ? '' : String(d.longitude),
      });
    });
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.address.trim()) e.address = 'Address is required.';
    const lat = form.latitude === '' ? null : Number(form.latitude);
    const lng = form.longitude === '' ? null : Number(form.longitude);
    if (lat != null && (isNaN(lat) || lat < -90 || lat > 90)) e.latitude = 'Latitude must be between -90 and 90.';
    if (lng != null && (isNaN(lng) || lng < -180 || lng > 180)) e.longitude = 'Longitude must be between -180 and 180.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return Alert.alert('Check the form', 'Some fields need your attention.');
    setSaving(true);
    try {
      if (id) await updateDestination(id, form);
      else await createDestination(form, user.id);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Could not save', err.message);
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AdminHeader title={id ? 'Edit destination' : 'Add destination'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
          <Input label="Name *" value={form.name} onChangeText={set('name')} placeholder="e.g. Rizal Shrine" error={errors.name} />
          <Input
            label="Description *"
            value={form.description}
            onChangeText={set('description')}
            multiline
            style={{ minHeight: 150 }}
            placeholder={'Historical and cultural description.\n\nTip: separate paragraphs with a blank line (overview, history, cultural significance).'}
            error={errors.description}
          />
          <Input label="Address *" value={form.address} onChangeText={set('address')} placeholder="Street, town, Province" error={errors.address} />

          <Text style={styles.label}>Category *</Text>
          <Chips options={CATEGORIES} value={form.category} onChange={set('category')} activeColor={c.primary} style={{ paddingHorizontal: 0 }} />
          <View style={{ height: 16 }} />

          <ImageField label="Image" value={form.image} onChange={set('image')} aspect={[16, 10]} />
          <ImageField
            label="Panorama (virtual tour)"
            hint="A wide photo, ideally 3:1, that visitors can drag to look around."
            value={form.panorama_asset}
            onChange={set('panorama_asset')}
            aspect={[3, 1]}
            height={110}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><Input label="Latitude" value={form.latitude} onChangeText={set('latitude')} keyboardType="numbers-and-punctuation" placeholder="14.2114" error={errors.latitude} /></View>
            <View style={{ flex: 1 }}><Input label="Longitude" value={form.longitude} onChangeText={set('longitude')} keyboardType="numbers-and-punctuation" placeholder="121.1653" error={errors.longitude} /></View>
          </View>

          <Button title={id ? 'Save changes' : 'Add destination'} onPress={save} loading={saving} style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: c.text, marginBottom: 6 },
  hint: { fontSize: 12, color: c.muted, marginBottom: 8, marginTop: -2 },
});
