import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "@/constants/theme";

type SearchContext = "home" | "chat" | "account";

const META: Record<SearchContext, { title: string; placeholder: string; hint: string }> = {
  home: {
    title: "게시물 검색",
    placeholder: "게시물 제목·내용 검색",
    hint: "일반 · 질문 · 장터 게시물을 검색합니다.",
  },
  chat: {
    title: "채팅 검색",
    placeholder: "대화 내용·사람 검색",
    hint: "채팅 내용과 대화 상대를 검색합니다.",
  },
  account: {
    title: "설정 검색",
    placeholder: "설정 항목 검색",
    hint: "계정 설정 항목을 검색합니다.",
  },
};

export default function Search() {
  const { context } = useLocalSearchParams<{ context?: string }>();
  const ctx: SearchContext = (["home", "chat", "account"].includes(context ?? "")
    ? context
    : "home") as SearchContext;
  const meta = META[ctx];

  const [query, setQuery] = useState("");

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: meta.title,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={meta.placeholder}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color={Colors.textMuted}
            onPress={() => setQuery("")}
          />
        )}
      </View>

      <View style={styles.results}>
        {/* TODO: context "{ctx}" 에 맞는 검색 결과를 표시 */}
        <Text style={styles.hint}>{meta.hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16, gap: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  input: { flex: 1, color: Colors.text, fontSize: 16 },
  results: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: { color: Colors.textMuted, fontSize: 14 },
});
