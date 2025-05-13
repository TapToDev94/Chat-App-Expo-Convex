import { Loader } from "@/components/loader";
import { MediaViewer } from "@/components/media-viewer";
import { MessageInput } from "@/components/message-inout";
import { MessageItem } from "@/components/message-item";
import { useTheme } from "@/context/theme-context";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { NoImage } from "@/dummyData";
import { useProfile } from "@/hooks/use-profile";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formattedTime = (time: number) => {
  return formatDistanceToNow(new Date(time), {
    addSuffix: true,
  });
};

const Chat = () => {
  const { isDark } = useTheme();
  const { id } = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: string;
    url: string;
  } | null>(null);
  const [showMediaViewer, setShowMediaViewer] = useState(false);

  const user = useProfile();

  const chatId = id as Id<"chats">;

  const chat = useQuery(api.chats.getChatById, { id: chatId });
  const messages = useQuery(api.messages.getMessages, { chatId: chatId });
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);

  const myUnreadMessageIds = messages
    ?.filter((message) => message.userId !== user?._id)
    .map((message) => message._id);

  const handleMediaPress = (media: any) => {
    setSelectedMedia(media);
    setShowMediaViewer(true);
  };

  useEffect(() => {
    if (messages?.length && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    const markAsRead = async () => {
      await markMessageAsRead({ chatId, messageIds: myUnreadMessageIds! });
    };

    if (myUnreadMessageIds) {
      markAsRead();
    }
  }, [myUnreadMessageIds]);

  const isGroup = chat?.isGroup;
  const chatName = chat?.name;
  const chatImage = chat?.image;

  const otherParticipant = chat?.participantsInfo.find(
    (participant) => participant._id !== user?._id
  );

  if (!chat) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-gray-900" : "bg-white"}`}
      >
        <Loader />
      </View>
    );
  }
  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View
          className={`flex-row items-center p-4 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <TouchableOpacity className="mr-4" onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? "white" : "black"}
            />
          </TouchableOpacity>

          <Image
            source={{ uri: chatImage || NoImage }}
            className="w-10 h-10 mr-3 rounded-full"
          />

          <View className="flex-1">
            <Text
              className={`${isDark ? "text-white" : "text-black"} font-semibold`}
            >
              {chatName}
            </Text>

            {isGroup ? (
              <Text
                className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
              >
                {chat?.participants.length} Participants
              </Text>
            ) : (
              <Text
                className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs`}
              >
                {otherParticipant?.isOnline
                  ? "Online"
                  : `Offline ${formattedTime(otherParticipant?.lastSeen || 0)}`}
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={() => setShowContextMenu(true)}>
            <MaterialIcons
              name="more-vert"
              size={22}
              color={isDark ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>

        {/* messages */}
        <View className="flex-1">
          <FlatList
            data={messages}
            ref={flatListRef}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <MessageItem
                message={item}
                isGroup={isGroup}
                handleMediaPress={handleMediaPress}
              />
            )}
            contentContainerStyle={{ paddingVertical: 16 }}
            inverted={false}
            ListEmptyComponent={
              <View className="items-center justify-center h-full">
                <Text
                  className={`text-gray-500 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  No messages yet
                </Text>
              </View>
            }
          />
        </View>

        {/* message input */}
        <MessageInput chatId={chatId} />

        {selectedMedia && (
          <MediaViewer
            visible={showMediaViewer}
            onClose={() => setShowMediaViewer(false)}
            media={selectedMedia}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
