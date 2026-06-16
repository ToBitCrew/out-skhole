import { Alert, Platform } from "react-native";

type AlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

export function alert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const fullMessage = message ? `${title}\n${message}` : title;

  if (!buttons || buttons.length === 0) {
    window.alert(fullMessage);
    return;
  }

  const cancelBtn = buttons.find((b) => b.style === "cancel" || b.text === "취소");
  const actionBtn = buttons.find((b) => b !== cancelBtn);

  if (cancelBtn && actionBtn) {
    if (window.confirm(fullMessage)) {
      actionBtn.onPress?.();
    }
  } else {
    window.alert(fullMessage);
    buttons[buttons.length - 1].onPress?.();
  }
}
