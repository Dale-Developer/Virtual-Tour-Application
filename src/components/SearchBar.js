import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export default function SearchBar({ value, onChangeText, placeholder = 'Search destinations, places, provinces' }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search-outline" size={19} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#91A0A8"
        style={styles.input}
        returnKeyType="search"
        accessibilityLabel="Search destinations"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onChangeText('')} hitSlop={10}>
          <Ionicons name="close-circle" size={19} color={colors.muted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, marginHorizontal: 18, height: 52, gap: 10 },
  input: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
});
