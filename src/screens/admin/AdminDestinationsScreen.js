import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { listDestinations, getCategories, deleteDestination } from '../../db/database';
import AdminHeader from '../../components/AdminHeader';
import SearchBar from '../../components/SearchBar';
import Chips from '../../components/Chips';
import SafeImage from '../../components/SafeImage';
import EmptyState from '../../components/EmptyState';
import { colors as c, radius, shadow } from '../../theme';

export default function AdminDestinationsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setItems(await listDestinations({ search, category }));
    setCategories(await getCategories());
  }, [search, category]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [search, category]);

  const remove = (d) =>
    Alert.alert('Delete destination?', `"${d.name}", its quiz questions and tourist progress for it will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteDestination(d.id); load(); } },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AdminHeader title="Destinations" subtitle={`${items.length} records`} />
      <View style={{ height: 16 }} />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Search destinations, places, provinces" />
      <View style={styles.heading}>
        <Text style={styles.headingTitle}>Filter by category</Text>
        <Text style={styles.headingCount}>{items.length} {items.length === 1 ? 'place' : 'places'}</Text>
      </View>
      <Chips options={['All', ...categories]} value={category} onChange={setCategory} />
      <View style={{ height: 14 }} />
      <FlatList
        data={items}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={{ paddingBottom: 96 }}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} style={[styles.row, shadow]} onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}>
            <SafeImage uri={item.image} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>{item.province} · {item.category}</Text>
              <Text style={styles.addr} numberOfLines={1}>{item.address}</Text>
            </View>
            <TouchableOpacity hitSlop={8} onPress={() => navigation.navigate('DestinationForm', { id: item.id })} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={20} color={c.primary} />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={8} onPress={() => remove(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color={c.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="location-outline" title="No destinations match" message="Clear the search or add a new destination." />}
      />
      <TouchableOpacity style={[styles.fab, shadow]} onPress={() => navigation.navigate('DestinationForm')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { marginHorizontal: 20, marginTop: 18, marginBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headingTitle: { color: c.text, fontSize: 16, fontWeight: '900' },
  headingCount: { color: c.muted, fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', marginHorizontal: 18, marginBottom: 10, padding: 10, borderRadius: radius.md },
  thumb: { width: 66, height: 66, borderRadius: 12, backgroundColor: '#D7E6E7' },
  name: { fontWeight: '800', fontSize: 14, color: c.text },
  meta: { fontSize: 12, color: c.accent, fontWeight: '800', marginTop: 2 },
  addr: { fontSize: 11, color: c.muted, marginTop: 2 },
  iconBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' },
});
