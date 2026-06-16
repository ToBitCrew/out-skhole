import { Colors } from "@/constants/theme";
import type { PostListItem } from "@/types/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const POST_TYPE_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "일반", color: "#6ec6ff" },
  2: { label: "공지", color: "#ff6b6b" },
  3: { label: "질문", color: "#ffa94d" },
  4: { label: "장터", color: "#69db7c" },
};

export default function PostPreview({ item }: { item: PostListItem }) {
  const router = useRouter();
  const typeInfo = POST_TYPE_LABEL[item.post_type] ?? {
    label: "기타",
    color: Colors.textMuted,
  };

  const date = new Date(item.write_dt);
  const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/post", params: { id: item.post_id } })
      }
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: typeInfo.color }]}>
          <Text style={styles.badgeText}>{typeInfo.label}</Text>
        </View>
        <Text style={styles.time}>{timeStr}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {item.post_title}
      </Text>

      {item.tags.length > 0 && (
        <View style={styles.tags}>
          {item.tags.slice(0, 3).map((tag) => (
            <Text key={tag} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.author}>{item.author.nick_nm}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="heart-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.statText}>{item.like_cnt}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color={Colors.textMuted}
            />
            <Text style={styles.statText}>{item.comment_cnt}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="bookmark-outline"
              size={14}
              color={Colors.textMuted}
            />
            <Text style={styles.statText}>{item.bookmark_cnt}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.glassBorder,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  time: { color: Colors.textMuted, fontSize: 12 },
  title: { color: Colors.text, fontSize: 16, fontWeight: "600" },
  tags: { flexDirection: "row", gap: 6 },
  tag: { color: Colors.accent, fontSize: 12 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  author: { color: Colors.textMuted, fontSize: 13 },
  stats: { flexDirection: "row", gap: 12 },
  stat: { flexDirection: "row", alignItems: "center", gap: 3 },
  statText: { color: Colors.textMuted, fontSize: 12 },
});
