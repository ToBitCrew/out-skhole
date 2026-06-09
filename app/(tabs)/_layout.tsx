import LiquidGlassTabBar from "@/components/LiquidGlassTabBar";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.text,
        // 커스텀 탭바가 화면 위에 떠 있으므로 콘텐츠 하단에 여백 확보
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "채팅",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "계정",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
