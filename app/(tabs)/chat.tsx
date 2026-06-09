import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    /* */
    <View style={styles.container}>
      <Text style={styles.text}>채팅 홈 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#2495db",
  },
});
