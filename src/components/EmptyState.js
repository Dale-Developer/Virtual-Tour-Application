import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function EmptyState({ icon = 'compass-outline', title, message }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={46} color={colors.border} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 36 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 10, textAlign: 'center' },
  msg: { fontSize: 13, color: colors.muted, marginTop: 4, textAlign: 'center' },
});
