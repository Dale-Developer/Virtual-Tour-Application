import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { showAlert } from '../../lib/dialog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getQuestion, createQuestion, updateQuestion } from '../../db/database';
import AdminHeader from '../../components/AdminHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors as c, radius } from '../../theme';

export default function QuestionFormScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { destinationId, id } = route.params;
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getQuestion(id).then((q) => {
      if (!q) return;
      setQuestion(q.question);
      setOptions([...q.options, '', '', '', ''].slice(0, 4));
      setAnswer(q.answer_index);
      setExplanation(q.explanation || '');
    });
  }, [id]);

  const setOption = (i) => (v) => setOptions((o) => o.map((x, idx) => (idx === i ? v : x)));

  const save = async () => {
    if (!question.trim()) return showAlert('Question is empty', 'Type the question first.');
    if (options.some((o) => !o.trim())) return showAlert('Fill every choice', 'Each multiple-choice question needs four answer choices.');
    setSaving(true);
    try {
      if (id) await updateQuestion(id, { question, options, answer_index: answer, explanation });
      else await createQuestion({ destination_id: destinationId, question, options, answer_index: answer, explanation });
      navigation.goBack();
    } catch (e) {
      showAlert('Could not save', e.message);
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AdminHeader title={id ? 'Edit question' : 'Add question'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
          <Input label="Question" value={question} onChangeText={setQuestion} multiline placeholder="e.g. In which town was José Rizal born?" />
          <Text style={styles.label}>Answer choices (tap the circle to mark the correct one)</Text>
          {options.map((o, i) => (
            <View key={i} style={styles.optRow}>
              <TouchableOpacity onPress={() => setAnswer(i)} hitSlop={8} style={[styles.radio, answer === i && { borderColor: c.success }]}>
                {answer === i ? <View style={styles.dot} /> : null}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Input value={o} onChangeText={setOption(i)} placeholder={`Choice ${String.fromCharCode(65 + i)}`} style={{ marginBottom: 0 }} />
              </View>
            </View>
          ))}
          <Input label="Explanation (shown after the tourist answers)" value={explanation} onChangeText={setExplanation} multiline placeholder="Why is this the correct answer?" style={{ marginTop: 6 }} />
          <Button title={id ? 'Save changes' : 'Add question'} onPress={save} loading={saving} style={{ marginTop: 14 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: c.text, marginBottom: 10 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: c.success },
});
