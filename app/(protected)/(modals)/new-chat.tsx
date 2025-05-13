import { useTheme } from "@/context/theme-context";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { userByExteRnalId } from "@/convex/users";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NewChat = () => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchResults = useQuery(api.users.searchUsers, {
    query: searchQuery.trim() ? searchQuery.trim() : "",
  });
  const createChat = useMutation(api.chats.createChat);

  // determine if there are results
  const isLoading =
    isSearching || (searchQuery.trim() && searchResults === undefined);

  const hasResults = Array.isArray(searchResults) && searchResults?.length > 0;

  const noResults =
    searchQuery.trim() &&
    Array.isArray(searchResults) &&
    searchResults?.length === 0;

  const handleStartChat = async (user: Doc<"users">) => {
    try {
      const chatId = await createChat({
        participants: [user._id],
        isGroup: false,
      });

      if (chatId) {
        router.push({
          pathname: `/(protected)/(modals)/chat/[id]`,
          params: { id: chatId },
        });
      }
    } catch (error) {
      console.log("error creating chat", error);
    }
  };

  const renderUserItem = ({ item }: { item: Doc<"users"> }) => {
    return (
      <TouchableOpacity
        className={`flex-row items-center px-4 py-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
        onPress={() => handleStartChat(item)}
      >
        <Image
          source={{
            uri:
              item.imageUrl ||
              "https://ui-avatars.com/api/?name=sfsf" +
                encodeURIComponent(item.name),
          }}
          className="w-12 h-12 rounded-full"
        />

        <View className="flex-1 ml-3">
          <Text
            className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {item.name}
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {item.username ? `@${item.username}` : item.email}
          </Text>
        </View>

        {item.isOnline && (
          <View className="w-3 h-3 bg-green-500 rounded-full" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View
          className={`px-4 py-2 flex-row items-center border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={isDark ? "white" : "black"}
            />
          </TouchableOpacity>

          <Text
            className={`text-xl font-bold flex-1 ${isDark ? "text-white" : "text-black"}`}
          >
            New Chat
          </Text>
        </View>

        <View className="p-4">
          <View
            className={`flex-row items-center px-4 rounded-full  ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by email, phone, or username"
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              className={`flex-1 ml-2 py-3 text-base ${isDark ? "text-white" : "text-black"}`}
              autoFocus={true}
              returnKeyType="search"
              autoCapitalize="none"
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* search result */}
        {isLoading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator
              size="large"
              color={isDark ? "white" : "black"}
            />

            <Text className="text-sm text-gray-500">Searching...</Text>
          </View>
        ) : noResults ? (
          <View className="items-center justify-center flex-1">
            <MaterialCommunityIcons
              name="account-search-outline"
              size={48}
              color={isDark ? "white" : "black"}
            />

            <Text className="text-sm text-gray-500">No user found</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults as Doc<"users">[]}
            renderItem={renderUserItem}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={
              hasResults ? (
                <Text
                  className={`px-4 pb-2 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Search Results
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <View className="items-center justify-center flex-1">
                <Text className="text-sm text-gray-500">No results found</Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewChat;
