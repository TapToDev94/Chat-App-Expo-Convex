import { useTheme } from "@/context/theme-context";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useProfile } from "@/hooks/use-profile";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Image, Text, TouchableOpacity, View } from "react-native";

export interface Message {
  _id: Id<"messages">;
  text?: string;
  media?: {
    storageId: string;
    type: string;
    fileName?: string;
    url?: string;
  }[];
  userId: string;
  userName: string;
  userImage?: string;
  createdAt: number;
  user: Doc<"users">;
}

export const MessageItem = ({
  message,
  isGroup,
  handleMediaPress,
}: {
  message: Message;
  isGroup: boolean | undefined;
  handleMediaPress: (media: any) => void;
}) => {
  const { isDark } = useTheme();
  const user = useProfile();

  const isMyMessage = user?._id === message.userId;
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  const MediaCard = ({
    media,
  }: {
    media: {
      storageId: string;
      type: string;
      fileName?: string;
      url?: string;
    }[];
  }) => {
    return (
      <View className="w-full mt-2">
        {media.map((item) => (
          <TouchableOpacity
            key={item.storageId}
            onPress={() => handleMediaPress(item)}
          >
            {item.type === "image" ? (
              <Image
                source={{ uri: item.url }}
                className="h-64 w-72 rounded-xl"
                resizeMode="cover"
              />
            ) : item.type === "video" ? (
              <View className="items-center justify-center h-64 bg-gray-700 w-72 rounded-xl">
                <MaterialCommunityIcons
                  name="play-circle"
                  size={48}
                  color={"white"}
                />
              </View>
            ) : (
              <View className="flex-row items-center justify-center h-12 bg-gray-700 rounded-lg w-72">
                <MaterialCommunityIcons name="file" size={24} color="white" />
                <Text className="ml-2 text-white" numberOfLines={1}>
                  {item?.fileName || "File"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity>
      <View
        className={`flex-row mb-2 mx-4 ${isMyMessage ? "justify-end" : "justify-start"}`}
      >
        <View
          className={`p-3 rounded-2xl max-w-[80%] ${
            isMyMessage
              ? `${isDark ? "bg-blue-700" : "bg-blue-500"}`
              : `${isDark ? "bg-gray-800" : "bg-gray-200"}`
          } ${message.media && message.media.length > 0 ? "rounded-t-none bg-transparent" : ""}`}
        >
          {!isMyMessage && isGroup && (
            <Text
              className={`text-xs  ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {message.userName}
            </Text>
          )}

          {message.text && (
            <Text
              className={`text-lg ${isMyMessage ? "text-white" : isDark ? "text-white" : "text-gray-800"}`}
            >
              {message.text}
            </Text>
          )}

          {message.media && message.media.length > 0 && (
            <MediaCard media={message.media} />
          )}

          <Text
            className={`text-xs ${isMyMessage ? "text-gray-300" : isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {formattedTime}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
