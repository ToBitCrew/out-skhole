import PostPreview from "@/components/post_preview";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import * as postsApi from "@/services/posts";
import type { PostListItem, SubCategory } from "@/types/api";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Home() {
  const { categories } = useCategories();
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const allSubCats: SubCategory[] = categories.flatMap((c) => c.children ?? []);

  const fetchPosts = useCallback(
    async (p: number, refresh = false) => {
      try {
        const params: Parameters<typeof postsApi.getPosts>[0] = {
          page: p,
          limit: 20,
        };
        if (selectedCat) params.sub_cat_cd = selectedCat;
        const result = await postsApi.getPosts(params);
        if (refresh || p === 1) {
          setPosts(result.items);
        } else {
          setPosts((prev) => [...prev, ...result.items]);
        }
        setHasNext(result.pagination.hasNext);
        setPage(p);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCat]
  );

  useEffect(() => {
    setLoading(true);
    fetchPosts(1, true);
  }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(1, true);
  };

  const onEndReached = () => {
    if (hasNext && !loading) {
      fetchPosts(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catBar}
        contentContainerStyle={styles.catContent}
      >
        <Pressable
          style={[styles.catChip, !selectedCat && styles.catChipActive]}
          onPress={() => setSelectedCat(null)}
        >
          <Text
            style={[
              styles.catChipText,
              !selectedCat && styles.catChipTextActive,
            ]}
          >
            전체
          </Text>
        </Pressable>
        {allSubCats.map((cat) => (
          <Pressable
            key={cat.sub_cat_cd}
            style={[
              styles.catChip,
              selectedCat === cat.sub_cat_cd && styles.catChipActive,
            ]}
            onPress={() =>
              setSelectedCat(
                selectedCat === cat.sub_cat_cd ? null : cat.sub_cat_cd
              )
            }
          >
            <Text
              style={[
                styles.catChipText,
                selectedCat === cat.sub_cat_cd && styles.catChipTextActive,
              ]}
            >
              {cat.sub_cat_nm}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.post_id)}
          renderItem={({ item }) => <PostPreview item={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>게시글이 없습니다</Text>
            </View>
          }
          ListFooterComponent={
            hasNext ? (
              <ActivityIndicator
                style={{ padding: 16 }}
                color={Colors.accent}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  catBar: { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.glassBorder },
  catContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
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
  list: { padding: 14, paddingBottom: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: Colors.textMuted, fontSize: 15 },
});
