import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="write" options={{ presentation: "modal" }} />
        <Stack.Screen name="search" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
