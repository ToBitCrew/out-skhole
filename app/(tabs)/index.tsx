import { StyleSheet, Text, View } from "react-native";
// State: 불러온 게시물 개수, 게시물 분류(최근, 일일 인기, 주간 인기), 게시물 태그(대중소 과목)

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>탐색(홈) 화면</Text>
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
