import CommentItem from "@/components/CommentItem";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import * as postsApi from "@/services/posts";
import type { Comment, PostDetail } from "@/types/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { alert } from "@/utils/alert";

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        postsApi.getPost(postId),
        postsApi.getComments(postId),
      ]);
      setPost(p);
      setComments(c.items);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!post) return;
    try {
      if (liked) {
        const res = await postsApi.unlikePost(postId);
        setPost((p) => (p ? { ...p, like_cnt: res.like_cnt } : p));
        setLiked(false);
      } else {
        const res = await postsApi.likePost(postId);
        setPost((p) => (p ? { ...p, like_cnt: res.like_cnt } : p));
        setLiked(true);
      }
    } catch {
      // 이미 처리된 경우
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await postsApi.unbookmarkPost(postId);
        setPost((p) =>
          p ? { ...p, bookmark_cnt: p.bookmark_cnt - 1 } : p
        );
        setBookmarked(false);
      } else {
        await postsApi.bookmarkPost(postId);
        setPost((p) =>
          p ? { ...p, bookmark_cnt: p.bookmark_cnt + 1 } : p
        );
        setBookmarked(true);
      }
    } catch {
      // 이미 처리된 경우
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await postsApi.createComment(postId, {
        post_content: commentText.trim(),
      });
      setCommentText("");
      const c = await postsApi.getComments(postId);
      setComments(c.items);
    } catch {
      alert("오류", "댓글 작성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    alert("댓글 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await postsApi.deleteComment(postId, commentId);
          setComments((prev) =>
            prev.filter((c) => c.post_id !== commentId)
          );
        },
      },
    ]);
  };

  const handleDeletePost = () => {
    alert("게시글 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await postsApi.deletePost(postId);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
          }}
        />
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>게시글을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const isOwner = user?.uid === post.author.uid;
  const date = new Date(post.write_dt);
  const dateStr = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerRight: isOwner
            ? () => (
                <Pressable onPress={handleDeletePost}>
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={Colors.textMuted}
                  />
                </Pressable>
              )
            : undefined,
        }}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.title}>{post.post_title}</Text>

        <View style={styles.meta}>
          <Text style={styles.author}>{post.author.nick_nm}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {post.tags.length > 0 && (
          <View style={styles.tags}>
            {post.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.content}>{post.post_content}</Text>

        {post.sale && (
          <View style={styles.saleBox}>
            <Text style={styles.saleTitle}>{post.sale.item_nm}</Text>
            <Text style={styles.salePrice}>
              {post.sale.price.toLocaleString()}원
              {post.sale.sold && " (판매완료)"}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={handleLike}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color={liked ? "#ff6b6b" : Colors.textMuted}
            />
            <Text style={styles.actionText}>{post.like_cnt}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handleBookmark}>
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={bookmarked ? Colors.accent : Colors.textMuted}
            />
            <Text style={styles.actionText}>{post.bookmark_cnt}</Text>
          </Pressable>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.commentHeader}>
            댓글 {comments.length}개
          </Text>
          {comments.map((comment) => (
            <CommentItem
              key={comment.post_id}
              comment={comment}
              isOwner={user?.uid === comment.author.uid}
              onDelete={handleDeleteComment}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor={Colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
        />
        <Pressable
          onPress={handleCommentSubmit}
          disabled={submitting || !commentText.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={commentText.trim() ? Colors.accent : Colors.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: "center", justifyContent: "center" },
  emptyText: { color: Colors.textMuted, fontSize: 16 },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 40, gap: 12 },
  title: { color: Colors.text, fontSize: 22, fontWeight: "700" },
  meta: { flexDirection: "row", gap: 10, alignItems: "center" },
  author: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  date: { color: Colors.textMuted, fontSize: 13 },
  tags: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tag: { color: Colors.accent, fontSize: 13 },
  content: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 26,
    marginTop: 4,
  },
  saleBox: {
    backgroundColor: Colors.glassHighlight,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  saleTitle: { color: Colors.text, fontSize: 16, fontWeight: "600" },
  salePrice: { color: Colors.accent, fontSize: 18, fontWeight: "700" },
  actions: {
    flexDirection: "row",
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.glassBorder,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { color: Colors.textMuted, fontSize: 14 },
  commentSection: { gap: 4 },
  commentHeader: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  commentBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.glassBorder,
    backgroundColor: Colors.background,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: Colors.glassHighlight,
    color: Colors.text,
    fontSize: 15,
  },
});
