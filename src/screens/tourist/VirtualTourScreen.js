import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getDestination } from '../../db/database';
import SafeImage from '../../components/SafeImage';
import Button from '../../components/Button';
import { colors, radius, shadow } from '../../theme';

const { width } = Dimensions.get('window');
const PANO_W = width * 3;
const PANO_H = 320;

const STOPS = [
  { key: 'panorama', label: 'Look around', icon: 'eye-outline' },
  { key: 'about', label: 'History & culture', icon: 'book-outline' },
];
// Seeded destinations store overview / history / cultural significance as three paragraphs.
const SECTION_TITLES = ['Overview', 'History', 'Cultural significance'];

export default function VirtualTourScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [dest, setDest] = useState(null);
  const [stop, setStop] = useState('panorama');
  const [visited, setVisited] = useState({ panorama: true });
  const [offset, setOffset] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getDestination(route.params.id).then(setDest);
  }, [route.params.id]);

  if (!dest) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const go = (key) => {
    setStop(key);
    setVisited((v) => ({ ...v, [key]: true }));
  };
  const allSeen = STOPS.every((s) => visited[s.key]);
  const paragraphs = dest.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const titled = paragraphs.length === 3;
  const panorama = dest.panorama_asset || dest.image;

  if (done) {
    return (
      <View style={[styles.doneWrap, { paddingTop: insets.top + 40 }]}>
        <Ionicons name="checkmark-circle" size={90} color={colors.success} />
        <Text style={styles.doneTitle}>Tour finished</Text>
        <Text style={styles.doneText}>
          You explored {dest.name}. Take the quiz to check what you remember. Passing it completes this destination.
        </Text>
        <View style={{ gap: 10, alignSelf: 'stretch', marginTop: 26 }}>
          <Button title="Take the quiz" icon="help-circle-outline" onPress={() => navigation.replace('Quiz', { id: dest.id })} />
          <Button title="Back to destination" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headTitle} numberOfLines={1}>{dest.name}</Text>
          <Text style={styles.headSub}>Virtual tour</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {STOPS.map((s) => {
          const active = stop === s.key;
          return (
            <TouchableOpacity key={s.key} onPress={() => go(s.key)} style={[styles.tab, active && styles.tabActive]}>
              <Ionicons
                name={visited[s.key] && !active ? 'checkmark-circle' : s.icon}
                size={16}
                color={active ? '#fff' : visited[s.key] ? colors.success : colors.muted}
              />
              <Text style={[styles.tabText, active && { color: '#fff' }]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {stop === 'panorama' ? (
        <View style={{ flex: 1 }}>
          <View style={[styles.panoFrame, shadow]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: (PANO_W - width) / 2, y: 0 }}
              scrollEventThrottle={32}
              onScroll={(e) => setOffset(e.nativeEvent.contentOffset.x)}
            >
              <SafeImage uri={panorama} style={{ width: PANO_W, height: PANO_H }} />
            </ScrollView>
            <View style={styles.hint}>
              <Ionicons name="swap-horizontal" size={14} color="#fff" />
              <Text style={styles.hintText}>Drag to look around</Text>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.thumb, { left: `${(offset / (PANO_W - width || 1)) * 70}%` }]} />
          </View>
          <Text style={styles.blurb} numberOfLines={5}>{paragraphs[0]}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {paragraphs.map((p, i) => (
            <View key={i} style={[styles.textCard, shadow]}>
              <Text style={styles.cardTitle}>
                {titled ? SECTION_TITLES[i] : i === 0 ? 'Historical and cultural description' : ' '}
              </Text>
              <Text style={styles.cardText}>{p}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {allSeen ? (
          <Button title="Finish tour" icon="flag-outline" onPress={() => setDone(true)} />
        ) : (
          <Text style={styles.footerHint}>Open both steps to finish the tour ({Object.keys(visited).length}/{STOPS.length}).</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 16 },
  headTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  tabs: { flexDirection: 'row', gap: 8, padding: 14 },
  tab: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1.2, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontWeight: '700', fontSize: 13, color: colors.muted },
  panoFrame: { marginHorizontal: 16, height: PANO_H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#D7E6E7' },
  hint: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.overlay, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  hintText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  track: { height: 6, marginHorizontal: 32, marginTop: 14, borderRadius: 3, backgroundColor: colors.border },
  thumb: { position: 'absolute', width: '30%', height: 6, borderRadius: 3, backgroundColor: colors.accent },
  blurb: { marginHorizontal: 20, marginTop: 14, color: '#34505A', lineHeight: 21, fontSize: 14 },
  textCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 18 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  cardText: { fontSize: 15, lineHeight: 24, color: '#34505A' },
  footer: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: colors.bg },
  footerHint: { textAlign: 'center', color: colors.muted, fontSize: 13, paddingVertical: 14, fontWeight: '600' },
  doneWrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', paddingHorizontal: 28 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 14 },
  doneText: { textAlign: 'center', color: colors.muted, marginTop: 8, lineHeight: 21 },
});
