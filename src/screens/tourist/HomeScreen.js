import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { listDestinations, getCategories, getProgress } from '../../db/database';
import SearchBar from '../../components/SearchBar';
import Chips from '../../components/Chips';
import DestinationCard from '../../components/DestinationCard';
import EmptyState from '../../components/EmptyState';
import Logo from '../../components/Logo';
import { colors, radius } from '../../theme';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [completed, setCompleted] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoadError('');
      const [list, cats, progress] = await Promise.all([
        listDestinations({ search, category }), getCategories(), getProgress(user.id),
      ]);
      setItems(list);
      setCategories(cats);
      setCompleted(Object.fromEntries(progress.filter((p) => p.completed).map((p) => [p.id, true])));
    } catch (error) {
      setLoadError(error.message || 'Please try again in a moment.');
    }
  }, [search, category, user.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const firstName = user.first_name || user.name?.split(' ')[0] || 'Explorer';

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(d) => String(d.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={[styles.hero, { paddingTop: insets.top + 13 }]}>
              <View style={styles.topRow}>
                <Logo size={15} />
                <View style={styles.regionPill}><Ionicons name="location" size={12} color="#D7F5EF" /><Text style={styles.regionText}>PHILIPPINES</Text></View>
              </View>
              <Text style={styles.eyebrow}>YOUR NEXT DISCOVERY STARTS HERE</Text>
              <Text style={styles.greeting}>Hello, {firstName}.</Text>
              <Text style={styles.heroCopy}>Explore the places, stories, and culture of CALABARZON.</Text>
              <TouchableOpacity style={styles.mapShortcut} activeOpacity={0.85} onPress={() => navigation.navigate('Places')}>
                <View style={styles.mapIcon}><Ionicons name="map-outline" size={19} color="#fff" /></View>
                <View style={{ flex: 1 }}><Text style={styles.shortcutTitle}>Explore the cultural map</Text><Text style={styles.shortcutSub}>Discover destinations by province</Text></View>
                <Ionicons name="arrow-forward-circle" size={25} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}><SearchBar value={search} onChangeText={setSearch} /></View>
            <View style={styles.sectionHeading}>
              <View><Text style={styles.sectionTitle}>Find your experience</Text><Text style={styles.sectionSub}>Browse by interest</Text></View>
              <Ionicons name="sparkles-outline" size={21} color={colors.accent} />
            </View>
            <Chips options={['All', ...categories]} value={category} onChange={setCategory} />
            <View style={styles.resultsHeading}>
              <Text style={styles.sectionTitle}>Destinations to explore</Text>
              <Text style={styles.resultCount}>{items.length} places</Text>
            </View>
            {loadError ? <Text style={styles.errorText}>Unable to load destinations: {loadError}</Text> : null}
          </>
        }
        renderItem={({ item }) => (
          <DestinationCard item={item} badge={completed[item.id] ? 'Completed' : null}
            onPress={() => navigation.navigate('DestinationDetail', { id: item.id })} />
        )}
        ListEmptyComponent={<EmptyState icon="search-outline" title="No destinations found" message="Try another search or select a different category." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingBottom: 28 },
  hero: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingBottom: 27, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  regionPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  regionText: { color: '#D7F5EF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  eyebrow: { color: '#9EDBD3', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginTop: 29 },
  greeting: { color: '#fff', fontSize: 29, fontWeight: '900', marginTop: 5, letterSpacing: -0.5 },
  heroCopy: { color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 20, marginTop: 5, maxWidth: 300 },
  mapShortcut: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 22, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 17, padding: 12 },
  mapIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  shortcutTitle: { color: '#fff', fontWeight: '800', fontSize: 13 },
  shortcutSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  searchWrap: { marginTop: -1, paddingTop: 17 },
  sectionHeading: { marginHorizontal: 20, marginTop: 24, marginBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  sectionSub: { color: colors.muted, fontSize: 11, marginTop: 2 },
  resultsHeading: { marginHorizontal: 20, marginTop: 21, marginBottom: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultCount: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  errorText: { color: colors.danger, marginHorizontal: 20, marginBottom: 12, fontSize: 12 },
});
