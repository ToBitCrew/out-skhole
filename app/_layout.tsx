import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "back" }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="write" options={{ presentation: "modal" }} />
        <Stack.Screen name="search" options={{ presentation: "modal" }} />
        <Stack.Screen name="explore" options={{ presentation: "modal" }} />
        <Stack.Screen name="post" options={{ title: "" }} />
        <Stack.Screen name="chat-room" options={{ title: "" }} />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
