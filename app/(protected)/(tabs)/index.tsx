import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatItem } from "@/components/chat-item";
import { Loader } from "@/components/loader";
import { NewChatButton } from "@/components/new-chat-button";
import { Stories } from "@/components/stories";
import { useTheme } from "@/context/theme-context";
import { api } from "@/convex/_generated/api";

const Index = () => {
  const { isDark } = useTheme();
  const chats = useQuery(api.chats.getChats, {});
  const isLoading = chats === undefined;

  const formattedChats = chats?.map((chat) => ({
    _id: chat._id,
    name: chat.name,
    image: chat.image,
    lastMessage: chat.lastMessage,
    unreadCount: chat.unreadCount || 0,
    participantsInfo: chat.participantsInfo,
    isGroup: chat.isGroup,
  }));

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text
          className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}
        >
          Chatol
        </Text>
      </View>

      {/* chat */}
      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={formattedChats}
          renderItem={({ item }) => <ChatItem item={item as any} />}
          keyExtractor={(item) => item._id}
          className={isDark ? "bg-gray-900" : "bg-white"}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={() => <Stories />}
          ListEmptyComponent={() => (
            <View className={`items-center justify-center flex-1 py-20`}>
              <MaterialCommunityIcons
                name="chat-outline"
                size={48}
                color={isDark ? "white" : "black"}
              />
              <Text className="text-lg font-bold">No chats yet</Text>
              <Text className="text-gray-500">
                Start a conversation with your friends
              </Text>
            </View>
          )}
        />
      )}

      {/* new chat button */}

      <View className="absolute bottom-24 right-4">
        <NewChatButton />
      </View>
    </SafeAreaView>
  );
};

export default Index;
