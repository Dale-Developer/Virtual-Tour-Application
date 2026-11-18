import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { listDestinationsWithQuestionCount } from '../../db/database';
import AdminHeader from '../../components/AdminHeader';
import SafeImage from '../../components/SafeImage';
import EmptyState from '../../components/EmptyState';
import { colors as c, radius, shadow } from '../../theme';

export default function AdminQuizzesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  useFocusEffect(useCallback(() => { listDestinationsWithQuestionCount().then(setItems); }, []));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AdminHeader title="Quiz manager" subtitle="Pick a destination to edit its questions" />
      <FlatList
        data={items}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.row, shadow]}
            onPress={() => navigation.navigate('AdminQuestions', { destinationId: item.id, name: item.name })}
          >
            <SafeImage uri={item.image} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.meta, item.question_count === 0 && { color: c.danger }]}>
                {item.question_count === 0 ? 'No questions yet' : `${item.question_count} questions`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.muted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="help-circle-outline" title="No destinations yet" message="Add a destination first, then write its quiz." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 10, borderRadius: radius.md, marginBottom: 10 },
  thumb: { width: 56, height: 56, borderRadius: 12 },
  name: { fontWeight: '800', color: c.text, fontSize: 14 },
  meta: { fontSize: 12, color: c.muted, marginTop: 3, fontWeight: '600' },
});
