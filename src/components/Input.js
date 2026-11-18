import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function Input({ label, error, multiline, style, helperText, ...props }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#91A0A8"
        multiline={multiline}
        selectionColor={colors.accent}
        style={[styles.input, multiline && styles.multiline, error && styles.invalid, style]}
        {...props}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 7 },
  input: { minHeight: 48, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, color: colors.text },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  invalid: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12, marginTop: 5 },
  helper: { color: colors.muted, fontSize: 12, marginTop: 5 },
});
