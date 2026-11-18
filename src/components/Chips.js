import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

/**
 * Horizontal row of selectable filter chips (All, Heritage, Churches, Falls ...).
 *
 * Layout fix: a horizontal ScrollView grows to fill spare height inside a column layout,
 * which stretched the chips into tall pills on screens where a list sits below them.
 * `flexGrow: 0` keeps the row exactly as tall as one chip, and every chip has a fixed
 * height, centered text and `flexShrink: 0` so labels never wrap or squeeze.
 */
export default function Chips({ options, value, onChange, activeColor = colors.primary, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={[styles.row, style]}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((o) => {
        const active = o === value;
        return (
          <TouchableOpacity
            key={o}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o)}
            style={[styles.chip, active && { backgroundColor: activeColor, borderColor: activeColor }]}
          >
            <Text numberOfLines={1} style={[styles.text, active && styles.textActive]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: { flexGrow: 0, flexShrink: 0, height: 44 },
  row: { paddingHorizontal: 18, alignItems: 'center', gap: 8 },
  chip: {
    height: 38, minWidth: 54, paddingHorizontal: 17, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
  },
  text: { fontSize: 13, fontWeight: '700', color: colors.muted, includeFontPadding: false },
  textActive: { color: '#fff' },
});
