import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/theme";
import * as schoolsApi from "@/services/schools";
import type { School, Department } from "@/types/api";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { alert } from "@/utils/alert";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();

  const [handle, setHandle] = useState("");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [school, setSchool] = useState<School | null>(null);
  const [dept, setDept] = useState<Department | null>(null);

  const [schoolModal, setSchoolModal] = useState(false);
  const [deptModal, setDeptModal] = useState(false);

  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!handle.trim() || !nick.trim() || !email.trim() || !password) {
      alert("입력 오류", "모든 필드를 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("입력 오류", "비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      alert("입력 오류", "비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (!school || !dept) {
      alert("입력 오류", "학교와 학과를 선택해주세요.");
      return;
    }
    setBusy(true);
    try {
      await register({
        handle_nm: handle.trim(),
        nick_nm: nick.trim(),
        email: email.trim(),
        password,
        school_cd: school.school_cd,
        dept_cd: dept.dept_cd,
      });
      alert("가입 완료", "회원가입에 성공했습니다.", [
        { text: "로그인", onPress: () => router.replace("/login") },
      ]);
    } catch (e: any) {
      const msg =
        e.response?.data?.error?.message ?? "회원가입에 실패했습니다.";
      alert("가입 실패", msg);
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
        <Text style={styles.title}>회원가입</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="아이디 (4~20자, 영문·숫자·_)"
            placeholderTextColor={Colors.textMuted}
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="닉네임 (2~20자)"
            placeholderTextColor={Colors.textMuted}
            value={nick}
            onChangeText={setNick}
          />
          <TextInput
            style={styles.input}
            placeholder="이메일"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호 (8자 이상)"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호 확인"
            placeholderTextColor={Colors.textMuted}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
          />

          <Pressable
            style={styles.selector}
            onPress={() => setSchoolModal(true)}
          >
            <Text
              style={school ? styles.selectorText : styles.selectorPlaceholder}
            >
              {school ? school.school_nm : "학교 선택"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.selector, !school && styles.selectorDisabled]}
            onPress={() => school && setDeptModal(true)}
            disabled={!school}
          >
            <Text
              style={dept ? styles.selectorText : styles.selectorPlaceholder}
            >
              {dept ? dept.dept_nm : "학과 선택"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text style={styles.buttonText}>가입하기</Text>
            )}
          </Pressable>
        </View>

        <Link href="/login" style={styles.link}>
          <Text style={styles.linkText}>
            이미 계정이 있으신가요?{" "}
            <Text style={styles.linkAccent}>로그인</Text>
          </Text>
        </Link>
      </View>

      <SearchPickerModal
        visible={schoolModal}
        title="학교 검색"
        placeholder="학교명을 입력하세요"
        onClose={() => setSchoolModal(false)}
        onSearch={async (q) => schoolsApi.searchSchools({ q })}
        renderLabel={(item: School) => `${item.school_nm} (${item.region})`}
        onSelect={(item: School) => {
          setSchool(item);
          setDept(null);
          setSchoolModal(false);
        }}
      />

      <SearchPickerModal
        visible={deptModal}
        title="학과 검색"
        placeholder="학과명을 입력하세요"
        onClose={() => setDeptModal(false)}
        onSearch={async (q) =>
          school ? schoolsApi.getDepartments(school.school_cd, { q }) : []
        }
        renderLabel={(item: Department) =>
          `${item.dept_nm} (${item.college_nm})`
        }
        onSelect={(item: Department) => {
          setDept(item);
          setDeptModal(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function SearchPickerModal<T>({
  visible,
  title,
  placeholder,
  onClose,
  onSearch,
  renderLabel,
  onSelect,
}: {
  visible: boolean;
  title: string;
  placeholder: string;
  onClose: () => void;
  onSearch: (q: string) => Promise<T[]>;
  renderLabel: (item: T) => string;
  onSelect: (item: T) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (q.length < 1) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const items = await onSearch(q);
        setResults(items);
      } finally {
        setLoading(false);
      }
    },
    [onSearch]
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <Text style={modalStyles.close}>닫기</Text>
          </Pressable>
        </View>
        <TextInput
          style={modalStyles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={doSearch}
          autoFocus
        />
        {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
        <FlatList
          data={results}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <Pressable
              style={modalStyles.item}
              onPress={() => onSelect(item)}
            >
              <Text style={modalStyles.itemText}>{renderLabel(item)}</Text>
            </Pressable>
          )}
          style={modalStyles.list}
        />
      </View>
    </Modal>
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
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  form: { gap: 12 },
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
  selector: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: Colors.glassHighlight,
  },
  selectorDisabled: { opacity: 0.4 },
  selectorText: { color: Colors.text, fontSize: 16 },
  selectorPlaceholder: { color: Colors.textMuted, fontSize: 16 },
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

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.text },
  close: { fontSize: 16, color: Colors.accent },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: Colors.text,
    fontSize: 16,
    backgroundColor: Colors.glassHighlight,
  },
  list: { marginTop: 8 },
  item: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glassBorder,
  },
  itemText: { color: Colors.text, fontSize: 15 },
});
