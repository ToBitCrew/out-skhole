import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { alert } from "@/utils/alert";

const PERMISSION_LABEL: Record<number, string> = {
  0: "비회원",
  1: "일반 회원",
  2: "본인인증 완료",
  3: "학교인증 완료",
  8: "운영자",
  9: "관리자",
};

export default function Account() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소" },
      { text: "로그아웃", style: "destructive", onPress: logout },
    ]);
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={Colors.textMuted} />
        </View>
        <Text style={styles.nick}>{user.nick_nm}</Text>
        <Text style={styles.handle}>@{user.handle_nm}</Text>
        <View style={styles.permBadge}>
          <Text style={styles.permText}>
            {PERMISSION_LABEL[user.permission] ?? `등급 ${user.permission}`}
          </Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <MenuItem icon="shield-checkmark-outline" label="학교 인증" />
        <MenuItem icon="finger-print-outline" label="본인 인증" />
        <MenuItem icon="notifications-outline" label="알림 설정" />
        <MenuItem icon="color-palette-outline" label="테마 설정" />
        <MenuItem icon="information-circle-outline" label="앱 정보" />
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
        <Text style={styles.logoutText}>로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}

function MenuItem({ icon, label }: { icon: string; label: string }) {
  return (
    <Pressable style={styles.menuItem}>
      <Ionicons name={icon as any} size={22} color={Colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 120 },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glassHighlight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  nick: { color: Colors.text, fontSize: 22, fontWeight: "700" },
  handle: { color: Colors.textMuted, fontSize: 15 },
  permBadge: {
    marginTop: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  permText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: "700",
  },
  menuSection: {
    marginHorizontal: 16,
    backgroundColor: Colors.glass,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.glassBorder,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glassBorder,
  },
  menuLabel: { flex: 1, color: Colors.text, fontSize: 16 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
  },
  logoutText: { color: "#ff6b6b", fontSize: 16, fontWeight: "600" },
});
