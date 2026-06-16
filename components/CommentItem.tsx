import { Colors } from "@/constants/theme";
import type { Comment } from "@/types/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  comment: Comment;
  onDelete?: (postId: number) => void;
  isOwner?: boolean;
}

export default function CommentItem({ comment, onDelete, isOwner }: Props) {
  const date = new Date(comment.write_dt);
  const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>{comment.author.nick_nm}</Text>
        <Text style={styles.time}>{timeStr}</Text>
        {isOwner && onDelete && (
          <Pressable onPress={() => onDelete(comment.post_id)}>
            <Ionicons name="trash-outline" size={14} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
      <Text style={styles.content}>{comment.post_content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glassBorder,
    gap: 4,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  author: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  time: { color: Colors.textMuted, fontSize: 12, flex: 1 },
  content: { color: Colors.text, fontSize: 15, lineHeight: 22 },
});
