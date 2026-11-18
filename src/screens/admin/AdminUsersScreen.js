import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { listTourists, deleteUser } from '../../db/database';
import AdminHeader from '../../components/AdminHeader';
import EmptyState from '../../components/EmptyState';
import { colors as c, radius, shadow } from '../../theme';

export default function AdminUsersScreen() {
  const [items, setItems] = useState([]);
  const load = useCallback(() => listTourists().then(setItems), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const remove = (u) =>
    Alert.alert('Remove tourist?', `${u.name}'s account and quiz progress will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteUser(u.id); load(); } },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AdminHeader title="Tourists" subtitle="Registered users and their progress" />
      <FlatList
        data={items}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        renderItem={({ item }) => (
          <View style={[styles.row, shadow]}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.email} numberOfLines={1}>@{item.username}</Text>
              <Text style={styles.meta}>
                {item.completed} completed · {item.attempts} quiz attempts · avg {item.avg_ratio == null ? '—' : `${Math.round(item.avg_ratio * 100)}%`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => remove(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={c.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No tourists yet" message="Accounts appear here as people register." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 12, borderRadius: radius.md, marginBottom: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  name: { fontWeight: '800', color: c.text, fontSize: 14 },
  email: { fontSize: 12, color: c.muted },
  meta: { fontSize: 11, color: c.primary, fontWeight: '700', marginTop: 3 },
});
