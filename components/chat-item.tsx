import { useTheme } from "@/context/theme-context";
import { Id } from "@/convex/_generated/dataModel";
import { NoImage } from "@/dummyData";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface Chat {
  _id: Id<"chats">;
  name: string;
  image: string | null;
  lastMessage: {
    text?: string;
    createdAt: number;
    media?: {
      type: string;
      fileName?: string;
    }[];
  } | null;
  unreadCount: number;
  isGroup: boolean;
}

export const ChatItem = ({ item }: { item: Chat }) => {
  const { isDark } = useTheme();

  const getFormattedTime = () => {
    if (!item.lastMessage) return "";

    return formatDistanceToNow(item.lastMessage.createdAt, {
      addSuffix: true,
    });
  };

  const getMessagePreview = () => {
    if (!item.lastMessage) return "No message yet";

    if (item.lastMessage.media && item.lastMessage.media.length > 0) {
      const mediaType = item.lastMessage.media[0].type;

      if (mediaType.startsWith("image")) {
        return "📷 Image";
      } else if (mediaType.startsWith("video")) {
        return "🎥 Video";
      } else if (mediaType.startsWith("audio")) {
        return "🎧 Audio";
      } else if (mediaType.startsWith("file")) {
        return "📄 Document";
      }
    }

    return item.lastMessage.text ? item.lastMessage.text : "No message";
  };
  return (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
      onPress={() => router.push(`/chat/${item._id}`)}
    >
      <View className="mr-3">
        <Image
          source={{ uri: item?.image || NoImage }}
          className="rounded-full w-14 h-14"
        />
      </View>

      {/* chat info */}

      <View className="flex-1">
        <View className="flex-row justify-between">
          <Text
            className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {item.name}
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}   `}
          >
            {getFormattedTime()}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <Text
            numberOfLines={1}
            className={`text-sm ${
              item?.unreadCount > 0
                ? isDark
                  ? "text-white font-semibold"
                  : "text-gray-900 font-semibold"
                : isDark
                  ? "text-gray-400"
                  : "text-gray-500"
            }`}
          >
            {getMessagePreview()}
          </Text>
          {item?.unreadCount > 0 && (
            <View className="items-center justify-center w-6 h-6 text-xs bg-blue-500 rounded-full">
              <Text className="text-xs font-semibold text-center text-white">
                {item?.unreadCount > 99 ? "99+" : item?.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
