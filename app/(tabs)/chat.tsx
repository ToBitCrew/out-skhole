import { Colors } from "@/constants/theme";
import * as chatApi from "@/services/chat";
import type { ChatRoom } from "@/types/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ChatList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = useCallback(async (refresh = false) => {
    try {
      const items = await chatApi.getChatRooms();
      setRooms(items);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms(true);
  };

  const renderRoom = ({ item }: { item: ChatRoom }) => {
    const date = new Date(item.last_message_dt);
    const timeStr = `${date.getMonth() + 1}/${date.getDate()}`;

    return (
      <Pressable
        style={styles.room}
        onPress={() =>
          router.push({
            pathname: "/chat-room",
            params: {
              roomId: item.chat_room_id,
              partnerName: item.partner.nick_nm,
            },
          })
        }
      >
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={Colors.textMuted} />
        </View>
        <View style={styles.roomBody}>
          <View style={styles.roomHeader}>
            <Text style={styles.partnerName}>{item.partner.nick_nm}</Text>
            <Text style={styles.time}>{timeStr}</Text>
          </View>
          <View style={styles.roomFooter}>
            <Text style={styles.lastMsg} numberOfLines={1}>
              {item.last_message}
            </Text>
            {item.unread_cnt > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread_cnt}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.chat_room_id)}
        renderItem={renderRoom}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
        contentContainerStyle={rooms.length === 0 ? styles.center : styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>채팅방이 없습니다</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { paddingBottom: 100 },
  empty: { color: Colors.textMuted, fontSize: 15 },
  room: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glassBorder,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glassHighlight,
    alignItems: "center",
    justifyContent: "center",
  },
  roomBody: { flex: 1, gap: 4 },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partnerName: { color: Colors.text, fontSize: 16, fontWeight: "600" },
  time: { color: Colors.textMuted, fontSize: 12 },
  roomFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMsg: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 11,
    fontWeight: "700",
  },
});
