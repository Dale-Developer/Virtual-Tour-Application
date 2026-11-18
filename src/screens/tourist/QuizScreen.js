import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getDestination, listQuestions, saveQuizResult, PASSING_PERCENT } from '../../db/database';
import SafeImage from '../../components/SafeImage';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { colors, radius, shadow } from '../../theme';

export default function QuizScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [dest, setDest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      setDest(await getDestination(route.params.id));
      setQuestions(await listQuestions(route.params.id));
    })();
  }, [route.params.id]);

  const answeredCount = Object.keys(answers).length;

  const submit = async () => {
    if (answeredCount < questions.length) {
      return Alert.alert('Answer every question', `You have answered ${answeredCount} of ${questions.length}.`);
    }
    // Score is calculated automatically by comparing each choice to the stored answer.
    const score = questions.filter((q) => answers[q.id] === q.answer_index).length;
    await saveQuizResult({ userId: user.id, destinationId: dest.id, score, total: questions.length });
    setResult({ score, total: questions.length });
  };

  const retake = () => { setAnswers({}); setResult(null); };

  if (!dest) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const percent = result ? Math.round((result.score / result.total) * 100) : 0;
  const passed = percent >= PASSING_PERCENT;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <SafeImage uri={dest.image} style={[styles.hero, { paddingTop: insets.top + 10 }]}>
          <View style={styles.shade} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>{dest.name}</Text>
          <Text style={styles.heroSub}>Quiz</Text>
        </SafeImage>

        {questions.length === 0 ? (
          <EmptyState icon="help-circle-outline" title="No questions yet" message="An admin has not added quiz questions for this destination." />
        ) : (
          <View style={{ padding: 16, gap: 12 }}>
            {result && (
              <View style={[styles.resultCard, shadow, { borderColor: passed ? colors.success : colors.warning }]}>
                <Text style={styles.resultScore}>{result.score}/{result.total}</Text>
                <Text style={styles.resultPct}>{percent}%</Text>
                <Text style={[styles.resultMsg, { color: passed ? colors.success : colors.warning }]}>
                  {passed ? 'Passed. Nice work!' : `Almost there. You need ${PASSING_PERCENT}% to pass.`}
                </Text>
              </View>
            )}

            {questions.map((q, qi) => (
              <View key={q.id} style={[styles.qCard, shadow]}>
                <Text style={styles.qText}>{qi + 1}. {q.question}</Text>
                {q.options.map((opt, oi) => {
                  const picked = answers[q.id] === oi;
                  const isRight = q.answer_index === oi;
                  const showRight = result && isRight;
                  const showWrong = result && picked && !isRight;
                  return (
                    <TouchableOpacity
                      key={oi}
                      disabled={!!result}
                      activeOpacity={0.8}
                      onPress={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      style={[styles.option, picked && styles.optionPicked, showRight && styles.optionRight, showWrong && styles.optionWrong]}
                    >
                      <View style={[styles.radio, picked && { borderColor: colors.primary }, showRight && { borderColor: colors.success }, showWrong && { borderColor: colors.danger }]}>
                        {picked || showRight ? <View style={[styles.radioDot, showRight && { backgroundColor: colors.success }, showWrong && { backgroundColor: colors.danger }]} /> : null}
                      </View>
                      <Text style={styles.optText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
                {result && q.explanation ? (
                  <View style={styles.explain}>
                    <Ionicons name="bulb-outline" size={16} color={colors.primaryDark} />
                    <Text style={styles.explainText}>{q.explanation}</Text>
                  </View>
                ) : null}
              </View>
            ))}

            {result ? (
              <View style={{ gap: 10 }}>
                <Button title="Retake quiz" icon="refresh" onPress={retake} />
                <Button title="Back to destination" variant="outline" onPress={() => navigation.goBack()} />
              </View>
            ) : (
              <Button title={`Submit (${answeredCount}/${questions.length} answered)`} onPress={submit} color={colors.primaryDark} />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 190 + 40, justifyContent: 'flex-end', padding: 18 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,18,50,0.4)' },
  back: { position: 'absolute', left: 16, top: 50, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  qCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 16 },
  qText: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 10, lineHeight: 21 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1.2, borderColor: colors.border, marginBottom: 8 },
  optionPicked: { borderColor: colors.primary, backgroundColor: '#EAF6F4' },
  optionRight: { borderColor: colors.success, backgroundColor: '#E6F6EE' },
  optionWrong: { borderColor: colors.danger, backgroundColor: '#FCEAEA' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optText: { flex: 1, fontSize: 14, color: colors.text },
  explain: { flexDirection: 'row', gap: 8, backgroundColor: '#EAF6F4', padding: 10, borderRadius: radius.md, marginTop: 2 },
  explainText: { flex: 1, fontSize: 13, color: colors.primaryDark, lineHeight: 19 },
  resultCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 20, alignItems: 'center', borderWidth: 2 },
  resultScore: { fontSize: 44, fontWeight: '900', color: colors.text },
  resultPct: { fontSize: 15, color: colors.muted, fontWeight: '700' },
  resultMsg: { marginTop: 8, fontWeight: '800', fontSize: 15 },
});
