import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors, WRITE_TYPES, type WriteType } from "@/constants/theme";

const META: Record<WriteType, { title: string; placeholder: string }> = {
  general: { title: "일반 글쓰기", placeholder: "자유롭게 이야기를 나눠보세요." },
  question: { title: "질문 글쓰기", placeholder: "궁금한 점을 질문해보세요." },
  market: { title: "장터 글쓰기", placeholder: "사고 팔 물건을 올려보세요." },
};

export default function Write() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const writeType: WriteType = useMemo(() => {
    return (WRITE_TYPES.find((t) => t.type === type)?.type ?? "general");
  }, [type]);
  const meta = META[writeType];

  const [body, setBody] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: meta.title,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <View style={styles.body}>
        <Text style={styles.badge}>{meta.title}</Text>
        <TextInput
          style={styles.input}
          placeholder={meta.placeholder}
          placeholderTextColor={Colors.textMuted}
          value={body}
          onChangeText={setBody}
          multiline
          autoFocus
        />
        {/* TODO: 작성 완료 시 글 종류별 API로 전송 (type: {writeType}) */}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, padding: 20, gap: 16 },
  badge: {
    alignSelf: "flex-start",
    color: Colors.accent,
    fontWeight: "700",
    fontSize: 14,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    textAlignVertical: "top",
  },
});
