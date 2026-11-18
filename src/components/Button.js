import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export default function Button({ title, onPress, icon, variant = 'primary', loading, disabled, style, color, textStyle }) {
  const outline = variant === 'outline';
  const ghost = variant === 'ghost';
  const danger = variant === 'danger';
  const background = color || (danger ? colors.danger : colors.accent);
  const foreground = outline || ghost ? (color || colors.primary) : '#fff';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: outline || ghost ? 'transparent' : background },
        outline && { borderWidth: 1.3, borderColor: color || colors.border },
        ghost && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={foreground} /> : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={18} color={foreground} style={styles.icon} /> : null}
          <Text style={[styles.text, { color: foreground }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 48, paddingVertical: 13, paddingHorizontal: 20, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: 8 },
  text: { fontSize: 14, fontWeight: '800', letterSpacing: 0.15 },
  ghost: { borderWidth: 0 },
  disabled: { opacity: 0.5 },
});
