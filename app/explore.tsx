import PostPreview from "@/components/post_preview";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import * as postsApi from "@/services/posts";
import type { PostListItem } from "@/types/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Explore() {
  const { categories } = useCategories();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostListItem[]>([]);
  const [recommended, setRecommended] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    postsApi
      .getPosts({ limit: 10 })
      .then((data) => setRecommended(data.items))
      .catch(() => {})
      .finally(() => setInitLoading(false));
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 1) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const params: Parameters<typeof postsApi.searchPosts>[0] = {
          q: q.trim(),
        };
        if (selectedMajor) params.major_cat_cd = selectedMajor;
        const data = await postsApi.searchPosts(params);
        setResults(data.items);
      } finally {
        setLoading(false);
      }
    },
    [selectedMajor]
  );

  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text), 400);
  };

  const isSearching = query.trim().length > 0;
  const displayData = isSearching ? results : recommended;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "탐색",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="게시물 제목·내용 검색"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleChange}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => doSearch(query)}
        />
        {query.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color={Colors.textMuted}
            onPress={() => {
              setQuery("");
              setResults([]);
            }}
          />
        )}
      </View>

      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catBar}
          contentContainerStyle={styles.catContent}
        >
          <Pressable
            style={[styles.catChip, !selectedMajor && styles.catChipActive]}
            onPress={() => setSelectedMajor(null)}
          >
            <Text
              style={[
                styles.catChipText,
                !selectedMajor && styles.catChipTextActive,
              ]}
            >
              전체
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat.major_cat_cd}
              style={[
                styles.catChip,
                selectedMajor === cat.major_cat_cd && styles.catChipActive,
              ]}
              onPress={() =>
                setSelectedMajor(
                  selectedMajor === cat.major_cat_cd
                    ? null
                    : cat.major_cat_cd
                )
              }
            >
              <Text
                style={[
                  styles.catChipText,
                  selectedMajor === cat.major_cat_cd &&
                    styles.catChipTextActive,
                ]}
              >
                {cat.cat_major_nm}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {loading || initLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item) => String(item.post_id)}
          renderItem={({ item }) => <PostPreview item={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={
            <Text style={styles.section}>
              {isSearching ? `"${query}" 검색 결과` : "추천 게시물"}
            </Text>
          }
          ListEmptyComponent={
            <Text style={styles.hint}>
              {isSearching
                ? "검색 결과가 없습니다."
                : "게시물을 탐색해보세요."}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    margin: 16,
    marginBottom: 0,
  },
  input: { flex: 1, color: Colors.text, fontSize: 16 },
  catBar: {
    flexGrow: 0,
    marginTop: 12,
  },
  catContent: { paddingHorizontal: 16, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.glassHighlight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  catChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  catChipText: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
  catChipTextActive: { color: Colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingBottom: 40, gap: 4 },
  section: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  hint: { color: Colors.textMuted, fontSize: 14, textAlign: "center" },
});
