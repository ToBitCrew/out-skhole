import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, WRITE_TYPES } from "@/constants/theme";

const H_MARGIN = 16; // 화면 좌우 여백
const PILL_HEIGHT = 60;
const CIRCLE = 56;

/** 포커스된 탭 이름 → 검색 컨텍스트 매핑 */
const SEARCH_CONTEXT: Record<string, string> = {
  index: "home",
  chat: "chat",
  account: "account",
};

export default function LiquidGlassTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentRoute = state.routes[state.index]?.name ?? "index";

  const haptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleMenu = () => {
    haptic();
    setMenuOpen((v) => !v);
  };

  const handleWrite = (type: string) => {
    setMenuOpen(false);
    router.push({ pathname: "/write", params: { type } });
  };

  const handleSearch = () => {
    haptic();
    // 홈에서는 탐색 화면, 그 외에는 컨텍스트 검색 화면
    if (currentRoute === "index") {
      router.push("/explore");
      return;
    }
    router.push({
      pathname: "/search",
      params: { context: SEARCH_CONTEXT[currentRoute] ?? "home" },
    });
  };

  return (
    <>
      {/* 추가 플로팅 메뉴 (전체화면 오버레이) */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={() => setMenuOpen(false)}
        />
        <View
          pointerEvents="box-none"
          style={[styles.menu, { bottom: insets.bottom + 10 + CIRCLE + 12 }]}
        >
          {WRITE_TYPES.map((item, i) => (
            <FloatingItem
              key={item.type}
              index={i}
              label={item.label}
              icon={item.icon}
              onPress={() => handleWrite(item.type)}
            />
          ))}
        </View>
      </Modal>

      <View
        pointerEvents="box-none"
        style={[styles.wrap, { paddingBottom: insets.bottom + 10 }]}
      >
        <View style={styles.row} pointerEvents="box-none">
          {/* 좌측: 추가 버튼 */}
          <GlassCircle onPress={toggleMenu} active={menuOpen}>
            <Animated.View style={useRotate(menuOpen)}>
              <Ionicons name="add" size={30} color={Colors.text} />
            </Animated.View>
          </GlassCircle>

          {/* 가운데: 탭 알약 */}
          <GlassPill>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const focused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  haptic();
                  navigation.navigate(route.name);
                }
              };

              const color = focused ? Colors.accent : Colors.textMuted;
              const icon = options.tabBarIcon?.({
                focused,
                color,
                size: 24,
              });

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={styles.tabItem}
                  accessibilityRole="button"
                  accessibilityState={focused ? { selected: true } : {}}
                >
                  {icon}
                  <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                    {typeof options.title === "string"
                      ? options.title
                      : route.name}
                  </Text>
                </Pressable>
              );
            })}
          </GlassPill>

          {/* 우측: 검색 버튼 */}
          <GlassCircle onPress={handleSearch}>
            <Ionicons name="search" size={26} color={Colors.text} />
          </GlassCircle>
        </View>
      </View>
    </>
  );
}

/** + → × 회전 애니메이션 스타일 훅 */
function useRotate(open: boolean) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withSpring(open ? 1 : 0, { damping: 14, stiffness: 160 });
  }, [open, rot]);
  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 45}deg` }],
  }));
}

/** 플로팅 메뉴의 개별 아이템 (스태거 등장) */
function FloatingItem({
  index,
  label,
  icon,
  onPress,
}: {
  index: number;
  label: string;
  icon: string;
  onPress: () => void;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(index * 40, withTiming(1, { duration: 200 }));
  }, [p, index]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 16 }, { scale: 0.9 + p.value * 0.1 }],
  }));

  return (
    <Animated.View style={[styles.menuItemWrap, style]}>
      <View style={styles.menuLabelChip}>
        <Text style={styles.menuLabelText}>{label}</Text>
      </View>
      <Pressable onPress={onPress}>
        <BlurView
          intensity={40}
          tint="dark"
          style={[styles.menuItemBtn, styles.glassBorder]}
        >
          <Ionicons name={icon as any} size={24} color={Colors.text} />
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

function GlassCircle({
  children,
  onPress,
  active,
}: {
  children: React.ReactNode;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.circleShadow}>
      <BlurView
        intensity={50}
        tint="dark"
        style={[
          styles.circle,
          styles.glassBorder,
          active && { borderColor: Colors.accent },
        ]}
      >
        {children}
      </BlurView>
    </Pressable>
  );
}

function GlassPill({ children }: { children: React.ReactNode }) {
  return (
    <BlurView
      intensity={50}
      tint="dark"
      style={[styles.pill, styles.glassBorder]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: H_MARGIN,
    gap: 10,
  },
  glassBorder: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.glassBorder,
    overflow: "hidden",
  },
  pill: {
    flex: 1,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.glass,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    height: "100%",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },
  circleShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    position: "absolute",
    left: H_MARGIN,
    alignItems: "flex-start",
    gap: 14,
  },
  menuItemWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuItemBtn: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.glass,
  },
  menuLabelChip: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  menuLabelText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
