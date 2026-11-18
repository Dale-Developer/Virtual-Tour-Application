import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

/** Compact teal header (same colors as the tourist screens) with a small ADMIN badge. */
export default function AdminHeader({ title, subtitle, onBack, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.back} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
      <View style={styles.pill}>
        <Ionicons name="shield-checkmark" size={11} color="#D7F5EF" />
        <Text style={styles.pillText}>ADMIN</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingBottom: 12, borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  back: { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 19, fontWeight: '900', letterSpacing: -0.2 },
  sub: { color: 'rgba(255,255,255,0.72)', fontSize: 11, marginTop: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5 },
  pillText: { color: '#D7F5EF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});
