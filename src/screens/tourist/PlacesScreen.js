import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { listDestinations } from '../../db/database';
import CultureMap from '../../components/CultureMap';
import Chips from '../../components/Chips';
import SafeImage from '../../components/SafeImage';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { colors, radius, shadow, PROVINCES } from '../../theme';

export default function PlacesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [province, setProvince] = useState('All');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  // While a finger is on the map, the page must not scroll, so the map can be dragged freely.
  const [pageScroll, setPageScroll] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      const rows = await listDestinations({ province });
      setItems(rows);
      setSelected((current) => current && rows.some((row) => row.id === current.id) ? current : null);
    } catch (e) {
      setError(e.message || 'Could not load destinations.');
    }
  }, [province]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const open = (destination) => navigation.navigate('DestinationDetail', { id: destination.id });

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        scrollEnabled={pageScroll}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={{ paddingBottom: 28 }}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + 14 }}>
            <View style={styles.headingRow}>
              <View><Text style={styles.eyebrow}>EXPLORE THE REGION</Text><Text style={styles.title}>Cultural map</Text></View>
              <View style={styles.countBadge}><Text style={styles.countText}>{items.length}</Text><Text style={styles.countLabel}>PLACES</Text></View>
            </View>
            <Text style={styles.sub}>Explore destinations across the five provinces of CALABARZON.</Text>
            <View style={styles.mapHeading}><Ionicons name="map-outline" size={16} color={colors.primary} /><Text style={styles.mapHeadingText}>Destination map</Text></View>
            <View
              onTouchStart={() => setPageScroll(false)}
              onTouchEnd={() => setPageScroll(true)}
              onTouchCancel={() => setPageScroll(true)}
            >
              <CultureMap items={items} selectedId={selected?.id} onSelect={setSelected} height={280} />
            </View>
            <Text style={styles.mapNote}>Drag and pinch to explore. Tap a pin to preview a destination. The map needs an internet connection.</Text>
            <Text style={styles.filterLabel}>FILTER BY PROVINCE</Text>
            <Chips options={['All', ...PROVINCES]} value={province} onChange={(p) => { setProvince(p); setSelected(null); }} />
            {selected ? (
              <View style={[styles.selectedCard, shadow]}>
                <SafeImage uri={selected.image} style={styles.selectedImage} />
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedName} numberOfLines={1}>{selected.name}</Text>
                  <Text style={styles.selectedMeta}>{selected.province || 'CALABARZON'} · {selected.category}</Text>
                  <Button title="View destination" icon="arrow-forward" onPress={() => open(selected)} style={styles.selectedButton} />
                </View>
              </View>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.listHeading}><Text style={styles.listTitle}>All destinations</Text><Text style={styles.listCount}>{items.length} found</Text></View>
          </View>
        }
        renderItem={({ item }) => {
          const active = selected?.id === item.id;
          return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => setSelected(item)} style={[styles.row, shadow, active && styles.rowActive]}>
              <SafeImage uri={item.image} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <View style={styles.meta}><Ionicons name="location-outline" size={12} color={colors.accent} /><Text style={styles.metaText} numberOfLines={1}>{item.province || item.address} · {item.category}</Text></View>
              </View>
              <TouchableOpacity onPress={() => open(item)} style={styles.arrow} accessibilityLabel={`Open ${item.name}`}>
                <Ionicons name="arrow-forward" size={17} color={colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<EmptyState icon="map-outline" title="No destinations in this province" message="Choose another province or add destinations from the admin account." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  headingRow: { marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  title: { fontSize: 27, fontWeight: '900', color: colors.text, marginTop: 3 },
  countBadge: { backgroundColor: colors.accentSoft, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 8, alignItems: 'center' },
  countText: { color: colors.primary, fontSize: 17, fontWeight: '900' },
  countLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  sub: { marginHorizontal: 20, color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  mapHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 20, marginTop: 22, marginBottom: 9 },
  mapHeadingText: { color: colors.text, fontSize: 14, fontWeight: '800' },
  mapNote: { marginHorizontal: 20, color: colors.muted, fontSize: 10, marginTop: 7 },
  filterLabel: { marginHorizontal: 20, marginTop: 20, marginBottom: 5, color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  selectedCard: { flexDirection: 'row', marginHorizontal: 18, marginTop: 13, backgroundColor: '#fff', padding: 10, borderRadius: radius.lg, gap: 12 },
  selectedImage: { width: 104, height: 112, borderRadius: 13, backgroundColor: '#D7E6E7' },
  selectedInfo: { flex: 1, justifyContent: 'center' },
  selectedName: { color: colors.text, fontWeight: '900', fontSize: 14 },
  selectedMeta: { color: colors.muted, fontSize: 10, marginTop: 3 },
  selectedButton: { alignSelf: 'flex-start', minHeight: 37, paddingVertical: 8, paddingHorizontal: 12, marginTop: 10 },
  listHeading: { marginHorizontal: 20, marginTop: 22, marginBottom: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  listCount: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', marginHorizontal: 18, marginBottom: 10, padding: 10, borderRadius: radius.md, borderWidth: 1.5, borderColor: 'transparent' },
  rowActive: { borderColor: colors.accent },
  thumb: { width: 66, height: 66, borderRadius: 12, backgroundColor: '#D7E6E7' },
  name: { fontSize: 14, fontWeight: '800', color: colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 11, color: colors.muted, flex: 1 },
  arrow: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.danger, marginHorizontal: 20, marginTop: 10, fontSize: 12 },
});
