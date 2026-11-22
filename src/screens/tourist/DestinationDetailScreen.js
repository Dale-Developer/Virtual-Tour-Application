import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { showAlert } from '../../lib/dialog';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getDestination, getProgressFor, deleteDestination } from '../../db/database';
import SafeImage from '../../components/SafeImage';
import Button from '../../components/Button';
import { colors, radius, shadow } from '../../theme';

export default function DestinationDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isAdmin = user.role === 'Admin';
  const palette = colors;
  const [dest, setDest] = useState(null);
  const [progress, setProgress] = useState(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setDest(await getDestination(id));
        if (!isAdmin) setProgress(await getProgressFor(user.id, id));
      })();
    }, [id, isAdmin, user.id])
  );

  if (!dest) return <View style={{ flex: 1, backgroundColor: palette.bg }} />;

  const openMap = () => {
    if (dest.latitude == null) return showAlert('No coordinates', 'This destination has no map location yet.');
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${dest.latitude},${dest.longitude}`);
  };

  const confirmDelete = () =>
    showAlert('Delete destination?', `"${dest.name}", its quiz questions and all progress records will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteDestination(dest.id); navigation.goBack(); },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <SafeImage uri={dest.image} style={[styles.hero, { height: 280 + insets.top * 0.4 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.back, { top: insets.top + 10 }]}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{dest.category}</Text>
          </View>
        </SafeImage>

        <View style={[styles.sheet, { backgroundColor: palette.bg }]}>
          <Text style={[styles.name, { color: palette.text }]}>{dest.name}</Text>
          <View style={styles.addrRow}>
            <Ionicons name="location-sharp" size={15} color={colors.accent} />
            <Text style={styles.addr}>{dest.address}</Text>
          </View>

          {!isAdmin && progress && (
            <View style={styles.statusRow}>
              <Status
                ok={progress.completed}
                label={progress.completed ? 'Destination completed' : progress.best_score != null ? 'Quiz not passed yet' : 'Not completed yet'}
                icon="flag-outline"
              />
              <Status
                ok={progress.passed}
                label={progress.best_score != null ? `Best quiz ${progress.best_score}/${progress.best_total}` : 'Quiz not taken'}
                icon="ribbon"
              />
            </View>
          )}

          <View style={[styles.infoBox, shadow]}>
            <Text style={styles.infoTitle}>Information</Text>
            <Text style={styles.infoText}>{dest.description}</Text>
            <View style={styles.detailLine}><Text style={styles.detailKey}>Province</Text><Text style={styles.detailVal}>{dest.province || '—'}</Text></View>
            <View style={styles.detailLine}><Text style={styles.detailKey}>Category</Text><Text style={styles.detailVal}>{dest.category}</Text></View>
            <View style={styles.detailLine}><Text style={styles.detailKey}>Address</Text><Text style={[styles.detailVal, { flex: 1, textAlign: 'right' }]}>{dest.address}</Text></View>
          </View>

          <View style={{ gap: 10, marginTop: 18 }}>
            {isAdmin ? (
              <>
                <Button title="Edit destination" icon="create-outline" onPress={() => navigation.navigate('DestinationForm', { id: dest.id })} />
                <Button title="Manage quiz questions" icon="help-circle-outline" variant="outline" onPress={() => navigation.navigate('AdminQuestions', { destinationId: dest.id, name: dest.name })} />
                <Button title="Delete destination" icon="trash-outline" variant="danger" onPress={confirmDelete} />
              </>
            ) : (
              <>
                <Button title="Start virtual tour" icon="walk-outline" onPress={() => navigation.navigate('VirtualTour', { id: dest.id })} />
                <Button title="Take the quiz" icon="help-circle-outline" onPress={() => navigation.navigate('Quiz', { id: dest.id })} />
                <Button title="Open in Maps" icon="navigate-outline" variant="outline" onPress={openMap} />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Status({ ok, label, icon }) {
  return (
    <View style={[styles.status, ok && { backgroundColor: '#E2F5EC' }]}>
      <Ionicons name={ok ? 'checkmark-circle' : icon} size={15} color={ok ? colors.success : colors.muted} />
      <Text style={[styles.statusText, ok && { color: colors.success }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { justifyContent: 'flex-end' },
  back: { position: 'absolute', left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  pill: { position: 'absolute', right: 16, bottom: 40, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  sheet: { marginTop: -24, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20 },
  name: { fontSize: 25, fontWeight: '800' },
  addrRow: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 6 },
  addr: { color: colors.muted, fontSize: 13, flex: 1 },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E8EEF0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  statusText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  infoBox: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 18, marginTop: 16 },
  infoTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 22, color: '#34505A', marginBottom: 12 },
  detailLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  detailKey: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  detailVal: { fontSize: 13, color: colors.text, fontWeight: '700' },
});
