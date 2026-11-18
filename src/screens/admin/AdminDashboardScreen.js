import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats, getPopularDestinations } from '../../db/database';
import AdminHeader from '../../components/AdminHeader';
import { colors as c, radius, shadow } from '../../theme';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [popular, setPopular] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getAdminStats().then(setStats);
      getPopularDestinations(5).then(setPopular);
    }, [])
  );

  const cards = stats
    ? [
        { label: 'Destinations', value: stats.destinations, icon: 'location', color: c.accent },
        { label: 'Quiz questions', value: stats.questions, icon: 'help-circle', color: c.primary },
        { label: 'Tourists', value: stats.tourists, icon: 'people', color: c.success },
        { label: 'Quiz attempts', value: stats.attempts, icon: 'ribbon', color: c.warning },
      ]
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AdminHeader title="Admin dashboard" subtitle={`Signed in as ${user.name}`} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <View style={styles.grid}>
          {cards.map((s) => (
            <View key={s.label} style={[styles.stat, shadow]}>
              <View style={[styles.statIcon, { backgroundColor: s.color }]}>
                <Ionicons name={s.icon} size={18} color="#fff" />
              </View>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {stats && (
          <View style={[styles.wide, shadow]}>
            <Text style={styles.wideLabel}>Average quiz score across all tourists</Text>
            <Text style={styles.wideVal}>{stats.avgPercent == null ? 'No attempts yet' : `${stats.avgPercent}%`}</Text>
            <Text style={styles.wideSub}>{stats.completed} destinations completed by tourists</Text>
          </View>
        )}

        <Text style={styles.section}>Quick actions</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Action icon="add-circle" label="Add destination" onPress={() => navigation.navigate('DestinationForm')} />
          <Action icon="create" label="Manage quizzes" onPress={() => navigation.navigate('Quiz Manager')} />
        </View>

        <Text style={styles.section}>Most active destinations</Text>
        {popular.map((p, i) => (
          <TouchableOpacity key={p.id} style={styles.pop} onPress={() => navigation.navigate('DestinationDetail', { id: p.id })}>
            <Text style={styles.popRank}>{i + 1}</Text>
            <Text style={styles.popName} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.popMeta}>{p.attempts} quiz {p.attempts === 1 ? 'attempt' : 'attempts'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const Action = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.action, shadow]}>
    <Ionicons name={icon} size={26} color={c.primary} />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', flexGrow: 1, backgroundColor: '#fff', borderRadius: radius.lg, padding: 16 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 28, fontWeight: '900', color: c.text, marginTop: 10 },
  statLabel: { fontSize: 12, color: c.muted, fontWeight: '600' },
  wide: { backgroundColor: c.primary, borderRadius: radius.lg, padding: 18, marginTop: 10 },
  wideLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  wideVal: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 4 },
  wideSub: { color: '#9EDBD3', fontSize: 12, fontWeight: '700', marginTop: 2 },
  section: { fontSize: 16, fontWeight: '800', color: c.text, marginTop: 22, marginBottom: 10 },
  action: { flex: 1, backgroundColor: '#fff', borderRadius: radius.lg, padding: 16, alignItems: 'flex-start', gap: 8 },
  actionText: { fontWeight: '800', color: c.text, fontSize: 14 },
  pop: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 12, borderRadius: radius.md, marginBottom: 8 },
  popRank: { width: 24, textAlign: 'center', fontWeight: '900', color: c.primary },
  popName: { flex: 1, fontWeight: '700', color: c.text },
  popMeta: { fontSize: 11, color: c.muted },
});
