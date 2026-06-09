import { StyleSheet, Text, View } from "react-native";

const ProfileBanner = require("@/assets/images/android-icon-background.png");
const ProfileImage = require("@/assets/images/android-icon-foreground.png");

// TODO: 프로필 배너, 프로필 이미지(연필 모양 동그라미 버튼으로 수정), 프로필명, 소분류과목 표시

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>계정 화면</Text>
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
  profileBanner: {
    width: 50,
    height: 30,
  },
});
