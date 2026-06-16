import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import * as chatApi from "@/services/chat";
import type { ChatMessage } from "@/types/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ChatRoomScreen() {
  const { roomId, partnerName } = useLocalSearchParams<{
    roomId: string;
    partnerName: string;
  }>();
  const rid = Number(roomId);
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(
    async (before?: number) => {
      try {
        const res = await chatApi.getMessages(rid, {
          before,
          limit: 30,
        });
        if (before) {
          setMessages((prev) => [...res.items, ...prev]);
        } else {
          setMessages(res.items);
        }
        setHasPrev(res.has_prev);
        setCursor(res.next_cursor);
      } finally {
        setLoading(false);
      }
    },
    [rid]
  );

  useEffect(() => {
    fetchMessages();
    chatApi.markMessagesRead(rid).catch(() => {});
  }, [fetchMessages, rid]);

  const loadMore = () => {
    if (hasPrev && cursor != null) {
      fetchMessages(cursor);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await chatApi.sendMessage(rid, { content: text.trim() });
      const newMsg: ChatMessage = {
        chat_block_id: res.chat_block_id,
        sender_id: user!.uid,
        chat_content: text.trim(),
        chat_message_type: 0,
        sent_dt: res.sent_dt,
        is_read: false,
        del_by_sender: false,
        del_by_receiver: false,
        files: [],
      };
      setMessages((prev) => [...prev, newMsg]);
      setText("");
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.sender_id === user?.uid;
    const time = new Date(item.sent_dt);
    const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;

    return (
      <View
        style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowOther]}
      >
        {isMine && <Text style={styles.msgTime}>{timeStr}</Text>}
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleOther,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isMine ? styles.bubbleTextMine : styles.bubbleTextOther,
            ]}
          >
            {item.chat_content}
          </Text>
        </View>
        {!isMine && <Text style={styles.msgTime}>{timeStr}</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: partnerName ?? "채팅",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.chat_block_id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onStartReached={loadMore}
          onStartReachedThreshold={0.2}
          ListHeaderComponent={
            hasPrev ? (
              <Pressable style={styles.loadMore} onPress={loadMore}>
                <Text style={styles.loadMoreText}>이전 메시지 불러오기</Text>
              </Pressable>
            ) : null
          }
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={255}
        />
        <Pressable
          onPress={handleSend}
          disabled={sending || !text.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={text.trim() ? Colors.accent : Colors.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 12, gap: 6, paddingBottom: 10 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  msgRowMine: { justifyContent: "flex-end" },
  msgRowOther: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.glass,
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.glassBorder,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextMine: { color: Colors.background },
  bubbleTextOther: { color: Colors.text },
  msgTime: { color: Colors.textMuted, fontSize: 10 },
  loadMore: { alignItems: "center", paddingVertical: 10 },
  loadMoreText: { color: Colors.accent, fontSize: 13 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.glassBorder,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.glassHighlight,
    color: Colors.text,
    fontSize: 15,
  },
});
