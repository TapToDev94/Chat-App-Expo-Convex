import { useTheme } from "@/context/theme-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export const NewChatButton = () => {
  const { isDark } = useTheme();
  return (
    <TouchableOpacity
      className="absolute bottom-6 right-6"
      onPress={() => router.push("/new-chat")}
    >
      <View
        className={`w-14 h-14 rounded-full bg-blue-600 items-center justify-center`}
      >
        <MaterialCommunityIcons name="message-plus" size={24} color={"white"} />
      </View>
    </TouchableOpacity>
  );
};
