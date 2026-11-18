import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getProgress } from '../../db/database';
import SafeImage from '../../components/SafeImage';
import EmptyState from '../../components/EmptyState';
import { colors, radius, shadow } from '../../theme';

export default function QuizListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getProgress(user.id).then((rows) => setItems(rows.filter((r) => r.question_count > 0)));
    }, [user.id])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingBottom: 28 }}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + 12, paddingBottom: 14 }}>
            <Text style={styles.title}>Quizzes</Text>
            <Text style={styles.sub}>One quiz for every destination. Score {60}% or more to pass.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const taken = item.best_score != null;
          return (
            <TouchableOpacity style={[styles.row, shadow]} activeOpacity={0.9} onPress={() => navigation.navigate('Quiz', { id: item.id })}>
              <SafeImage uri={item.image} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.meta}>{item.question_count} questions · {item.attempts} {item.attempts === 1 ? 'attempt' : 'attempts'}</Text>
              </View>
              <View style={[styles.score, taken && (item.passed ? styles.pass : styles.fail)]}>
                <Text style={[styles.scoreText, taken && { color: '#fff' }]}>{taken ? `${item.best_score}/${item.best_total}` : 'Start'}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<EmptyState icon="help-circle-outline" title="No quizzes yet" message="Quizzes appear here once an admin adds questions." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginHorizontal: 18, fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { marginHorizontal: 18, fontSize: 13, color: colors.muted, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, padding: 10, borderRadius: radius.md },
  thumb: { width: 60, height: 60, borderRadius: 12 },
  name: { fontSize: 14, fontWeight: '800', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 3 },
  score: { minWidth: 58, paddingVertical: 8, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: '#DDF5F1', alignItems: 'center' },
  scoreText: { fontWeight: '800', fontSize: 13, color: colors.primaryDark },
  pass: { backgroundColor: colors.success },
  fail: { backgroundColor: colors.warning },
});
