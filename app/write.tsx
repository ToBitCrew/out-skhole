import { Colors, WRITE_TYPES, type WriteType } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import * as postsApi from "@/services/posts";
import type { SubCategory } from "@/types/api";
import { alert } from "@/utils/alert";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

const TYPE_TO_NUM: Record<WriteType, number> = {
  general: 1,
  question: 3,
  market: 4,
};

const META: Record<WriteType, { title: string; placeholder: string }> = {
  general: {
    title: "일반 글쓰기",
    placeholder: "자유롭게 이야기를 나눠보세요.",
  },
  question: { title: "질문 글쓰기", placeholder: "궁금한 점을 질문해보세요." },
  market: { title: "장터 글쓰기", placeholder: "사고 팔 물건을 올려보세요." },
};

export default function Write() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const router = useRouter();
  const { categories } = useCategories();

  const writeType: WriteType = useMemo(() => {
    return WRITE_TYPES.find((t) => t.type === type)?.type ?? "general";
  }, [type]);
  const meta = META[writeType];

  const allSubCats: SubCategory[] = categories.flatMap((c) => c.children ?? []);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  // 장터 전용
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && tags.length < 5 && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const toggleCat = (cd: number) => {
    setSelectedCats((prev) =>
      prev.includes(cd) ? prev.filter((c) => c !== cd) : [...prev, cd],
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("입력 오류", "제목을 입력해주세요.");
      return;
    }
    if (!body.trim()) {
      alert("입력 오류", "본문을 입력해주세요.");
      return;
    }

    setBusy(true);
    try {
      const payload: Parameters<typeof postsApi.createPost>[0] = {
        post_title: title.trim(),
        post_content: body.trim(),
        post_type: TYPE_TO_NUM[writeType],
        post_status: 2,
        tags: tags.length > 0 ? tags : undefined,
        sub_cat_cd: selectedCats.length > 0 ? selectedCats : undefined,
      };

      if (writeType === "question") {
        payload.question = { pii_mask: false };
      }
      if (writeType === "market" && itemName.trim()) {
        payload.sale = {
          item_nm: itemName.trim(),
          item_type: 0,
          item_status: 1,
          price: Number(price) || 0,
        };
      }

      const result = await postsApi.createPost(payload);
      router.dismiss();
      router.push({ pathname: "/post", params: { id: result.post_id } });
    } catch (e: any) {
      const msg =
        e.response?.data?.error?.message ?? "게시글 작성에 실패했습니다.";
      alert("오류", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: meta.title,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerRight: () => (
            <Pressable onPress={handleSubmit} disabled={busy}>
              {busy ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <Text style={styles.submitBtn}>게시</Text>
              )}
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
        <TextInput
          style={styles.titleInput}
          placeholder="제목"
          placeholderTextColor={Colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={255}
        />

        <TextInput
          style={styles.contentInput}
          placeholder={meta.placeholder}
          placeholderTextColor={Colors.textMuted}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />

        {writeType === "market" && (
          <View style={styles.saleSection}>
            <Text style={styles.sectionLabel}>판매 정보</Text>
            <TextInput
              style={styles.input}
              placeholder="상품명"
              placeholderTextColor={Colors.textMuted}
              value={itemName}
              onChangeText={setItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="가격 (원)"
              placeholderTextColor={Colors.textMuted}
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
            />
          </View>
        )}

        <View style={styles.tagSection}>
          <Text style={styles.sectionLabel}>태그 ({tags.length}/5)</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="태그 입력 후 추가"
              placeholderTextColor={Colors.textMuted}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <Pressable style={styles.addBtn} onPress={addTag}>
              <Ionicons name="add" size={20} color={Colors.background} />
            </Pressable>
          </View>
          <View style={styles.tagList}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                style={styles.tagChip}
                onPress={() => removeTag(tag)}
              >
                <Text style={styles.tagChipText}>#{tag}</Text>
                <Ionicons
                  name="close-circle"
                  size={14}
                  color={Colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {allSubCats.length > 0 && (
          <View style={styles.catSection}>
            <Text style={styles.sectionLabel}>카테고리</Text>
            <View style={styles.catList}>
              {allSubCats.map((cat) => (
                <Pressable
                  key={cat.sub_cat_cd}
                  style={[
                    styles.catChip,
                    selectedCats.includes(cat.sub_cat_cd) &&
                      styles.catChipActive,
                  ]}
                  onPress={() => toggleCat(cat.sub_cat_cd)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      selectedCats.includes(cat.sub_cat_cd) &&
                        styles.catChipTextActive,
                    ]}
                  >
                    {cat.sub_cat_nm}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  submitBtn: { color: Colors.accent, fontSize: 16, fontWeight: "700" },
  scroll: { flex: 1 },
  body: { padding: 20, gap: 16, paddingBottom: 60 },
  titleInput: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glassBorder,
    paddingBottom: 12,
  },
  contentInput: {
    color: Colors.text,
    fontSize: 16,
    minHeight: 150,
    lineHeight: 24,
  },
  saleSection: { gap: 8 },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: Colors.text,
    fontSize: 15,
    backgroundColor: Colors.glassHighlight,
  },
  tagSection: { gap: 8 },
  tagInputRow: { flexDirection: "row", gap: 8 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  tagList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.glassHighlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagChipText: { color: Colors.accent, fontSize: 13 },
  catSection: { gap: 8 },
  catList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
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
});
