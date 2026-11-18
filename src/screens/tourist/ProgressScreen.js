import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getProgress, getRecentResults } from '../../db/database';
import { colors, radius, shadow } from '../../theme';

export default function ProgressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [recent, setRecent] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getProgress(user.id).then(setProgress);
      getRecentResults(user.id).then(setRecent);
    }, [user.id])
  );

  const completed = progress.filter((p) => p.completed).length;
  const attemptsTotal = progress.reduce((s, p) => s + p.attempts, 0);
  const taken = progress.filter((p) => p.best_ratio != null);
  const avg = taken.length ? Math.round((taken.reduce((s, p) => s + p.best_ratio, 0) / taken.length) * 100) : null;
  const overall = progress.length ? completed / progress.length : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text></View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>@{user.username}</Text>
      </View>

      <View style={[styles.summary, shadow]}>
        <Text style={styles.sumTitle}>Completed destinations</Text>
        <Text style={styles.sumBig}>{completed} <Text style={styles.sumOf}>of {progress.length}</Text></Text>
        <View style={styles.bar}><View style={[styles.barFill, { width: `${overall * 100}%` }]} /></View>
        <View style={styles.statsRow}>
          <Stat label="Quiz attempts" value={attemptsTotal} />
          <Stat label="Quizzes taken" value={taken.length} />
          <Stat label="Average best score" value={avg == null ? '—' : `${avg}%`} />
        </View>
      </View>

      <Text style={styles.section}>Destination progress</Text>
      {progress.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.row, shadow]} onPress={() => navigation.navigate('DestinationDetail', { id: p.id })}>
          <Ionicons name={p.completed ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={p.completed ? colors.success : colors.border} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowName} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.rowMeta}>
              {p.best_score != null ? `Best ${p.best_score}/${p.best_total} · ${p.attempts} ${p.attempts === 1 ? 'attempt' : 'attempts'}` : 'Quiz not taken'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>
      ))}

      <Text style={styles.section}>Recent quiz scores</Text>
      {recent.length === 0 ? (
        <Text style={styles.none}>No quiz attempts yet. Take a virtual tour, then try its quiz.</Text>
      ) : (
        recent.map((r) => (
          <View key={r.id} style={styles.recent}>
            <Text style={styles.recentName} numberOfLines={1}>{r.destination_name}</Text>
            <Text style={styles.recentScore}>{r.score}/{r.total}</Text>
          </View>
        ))
      )}

    </ScrollView>
  );
}

const Stat = ({ label, value }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={styles.statVal}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { backgroundColor: colors.primary, alignItems: 'center', paddingBottom: 54, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  name: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 8 },
  email: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  summary: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -34, borderRadius: radius.lg, padding: 18 },
  sumTitle: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  sumBig: { fontSize: 34, fontWeight: '900', color: colors.text, marginTop: 2 },
  sumOf: { fontSize: 16, color: colors.muted, fontWeight: '600' },
  bar: { height: 8, backgroundColor: '#DDF5F1', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.accent, borderRadius: 4 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  statVal: { fontSize: 20, fontWeight: '800', color: colors.primaryDark },
  statLabel: { fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 2 },
  section: { marginHorizontal: 18, marginTop: 22, marginBottom: 10, fontSize: 16, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: radius.md },
  rowName: { fontSize: 14, fontWeight: '800', color: colors.text },
  rowMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  none: { marginHorizontal: 18, color: colors.muted, fontSize: 13 },
  recent: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 18, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  recentName: { flex: 1, color: colors.text, fontWeight: '600' },
  recentScore: { fontWeight: '800', color: colors.primaryDark },
});
