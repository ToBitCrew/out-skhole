/** 앱 전역에서 쓰는 색상 팔레트 */
export const Colors = {
  background: "#25292e",
  accent: "#ffd33d",
  text: "#fff",
  textMuted: "rgba(255,255,255,0.6)",
  // Liquid Glass 표면/테두리 (반투명)
  glass: "rgba(40,44,52,0.55)",
  glassBorder: "rgba(255,255,255,0.18)",
  glassHighlight: "rgba(255,255,255,0.08)",
};

/** 추가 버튼으로 작성할 수 있는 글 종류 */
export const WRITE_TYPES = [
  { type: "general", label: "일반", icon: "create-outline" },
  { type: "question", label: "질문", icon: "help-circle-outline" },
  { type: "market", label: "장터", icon: "pricetag-outline" },
] as const;

export type WriteType = (typeof WRITE_TYPES)[number]["type"];
