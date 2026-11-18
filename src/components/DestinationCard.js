import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SafeImage from './SafeImage';
import { colors, radius, shadow } from '../theme';

export default function DestinationCard({ item, onPress, badge }) {
  return (
    <TouchableOpacity activeOpacity={0.92} accessibilityRole="button" onPress={onPress} style={[styles.card, shadow]}>
      <SafeImage uri={item.image} style={styles.image}>
        <View style={styles.shade} />
        <View style={styles.tag}><Text style={styles.tagText}>{item.category || 'Destination'}</Text></View>
        {badge ? <View style={styles.badge}><Ionicons name="checkmark-circle" size={13} color="#fff" /><Text style={styles.badgeText}>{badge}</Text></View> : null}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.address} numberOfLines={1}>{item.address || item.province || 'CALABARZON, Philippines'}</Text>
            <Ionicons name="arrow-forward" size={17} color="#fff" />
          </View>
        </View>
      </SafeImage>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 18, marginBottom: 16, borderRadius: radius.lg, backgroundColor: '#fff', overflow: 'hidden' },
  image: { height: 184, justifyContent: 'flex-end', backgroundColor: '#D7E6E7' },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,25,34,0.34)' },
  tag: { position: 'absolute', top: 13, left: 13, backgroundColor: 'rgba(255,255,255,0.96)', paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill },
  tagText: { fontSize: 11, fontWeight: '800', color: colors.primaryDark },
  badge: { position: 'absolute', top: 13, right: 13, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  info: { padding: 15 },
  name: { color: '#fff', fontSize: 19, fontWeight: '900', letterSpacing: 0.1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  address: { color: 'rgba(255,255,255,0.94)', fontSize: 12, flex: 1, fontWeight: '600' },
});
