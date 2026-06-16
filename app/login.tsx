import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/theme";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { alert } from "@/utils/alert";

export default function Login() {
  const { login } = useAuth();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!contact.trim() || !password) return;
    setBusy(true);
    try {
      await login(contact.trim(), password);
    } catch (e: any) {
      const msg =
        e.response?.data?.error?.message ?? "로그인에 실패했습니다.";
      alert("로그인 실패", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>CoSkhol</Text>
        <Text style={styles.subtitle}>대학생 커뮤니티</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="이메일 또는 전화번호"
            placeholderTextColor={Colors.textMuted}
            value={contact}
            onChangeText={setContact}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>로그인</Text>
            )}
          </Pressable>
        </View>

        <Link href="/register" style={styles.link}>
          <Text style={styles.linkText}>
            계정이 없으신가요? <Text style={styles.linkAccent}>회원가입</Text>
          </Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.accent,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 32,
  },
  form: { gap: 14 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 16,
    backgroundColor: Colors.glassHighlight,
  },
  button: {
    height: 50,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  link: { marginTop: 24, alignSelf: "center" },
  linkText: { color: Colors.textMuted, fontSize: 14 },
  linkAccent: { color: Colors.accent, fontWeight: "600" },
});
