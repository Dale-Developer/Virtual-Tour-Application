import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform, // <-- ADDED Platform import
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { listQuestions, deleteQuestion } from "../../db/database";
import AdminHeader from "../../components/AdminHeader";
import EmptyState from "../../components/EmptyState";
import Button from "../../components/Button";
import { colors as c, radius, shadow } from "../../theme";

export default function AdminQuestionsScreen({ route, navigation }) {
  const { destinationId, name } = route.params;
  const [items, setItems] = useState([]);
  const load = useCallback(
    () => listQuestions(destinationId).then(setItems),
    [destinationId],
  );
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // UPDATED: Cross-platform delete function
  const remove = (q) => {
    const performDelete = async () => {
      try {
        await deleteQuestion(q.id);
        load(); // Refresh the list
      } catch (err) {
        if (Platform.OS === 'web') {
          window.alert('Could not delete: ' + err.message);
        } else {
          Alert.alert('Could not delete', err.message);
        }
      }
    };

    // Web browsers don't support React Native's Alert.alert properly
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Delete question?\n\n${q.question}`);
      if (confirmDelete) {
        performDelete();
      }
    } else {
      // Mobile (iOS/Android) uses the native alert
      Alert.alert('Delete question?', q.question, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <AdminHeader
        title="Quiz questions"
        subtitle={name}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={items}
        keyExtractor={(q) => String(q.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <Button
            title="Add question"
            icon="add-circle-outline"
            onPress={() =>
              navigation.navigate("QuestionForm", { destinationId })
            }
            style={{ marginBottom: 14 }}
          />
        }
        renderItem={({ item, index }) => (
          <View style={[styles.card, shadow]}>
            <Text style={styles.q}>
              {index + 1}. {item.question}
            </Text>
            {item.options.map((o, i) => (
              <View key={i} style={styles.opt}>
                <Ionicons
                  name={
                    i === item.answer_index
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={16}
                  color={i === item.answer_index ? c.success : c.border}
                />
                <Text
                  style={[
                    styles.optText,
                    i === item.answer_index && {
                      fontWeight: "800",
                      color: c.success,
                    },
                  ]}
                >
                  {o}
                </Text>
              </View>
            ))}
            {item.explanation ? (
              <Text style={styles.expl}>Explanation: {item.explanation}</Text>
            ) : null}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("QuestionForm", {
                    destinationId,
                    id: item.id,
                  })
                }
                style={styles.act}
              >
                <Ionicons name="create-outline" size={18} color={c.primary} />
                <Text style={[styles.actText, { color: c.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item)} style={styles.act}>
                <Ionicons name="trash-outline" size={18} color={c.danger} />
                <Text style={[styles.actText, { color: c.danger }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="help-circle-outline"
            title="No questions yet"
            message="Add at least one multiple-choice question so tourists can take this quiz."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  q: {
    fontWeight: "800",
    color: c.text,
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 21,
  },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 3,
  },
  optText: { color: "#34505A", fontSize: 14, flex: 1 },
  expl: {
    fontSize: 12,
    color: c.muted,
    marginTop: 8,
    lineHeight: 17,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E1E9EC",
  },
  act: { flexDirection: "row", alignItems: "center", gap: 5 },
  actText: { fontWeight: "700", fontSize: 13 },
});