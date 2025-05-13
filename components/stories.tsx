import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/context/theme-context";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useProfile } from "@/hooks/use-profile";

export interface Story {
  _id: Id<"stories"> | string;
  userId: string;
  type: "image" | "video";
  content: {
    media?: string;
    storageId?: string;
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  viewers: string[];
  createdAt: number;
  storyGroupId: string;
  user: Doc<"users">;
}

export const Stories = () => {
  const { isDark } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadURL = useMutation(api.general.generateUploadURL);
  const createStory = useMutation(api.stories.createStory);
  const user = useProfile();

  const storiesByUser = useQuery(api.stories.getStories, {});

  const handleAddStory = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) return;

      setIsUploading(true);
      const selectedMedia = result.assets[0];

      const uploadURL = await generateUploadURL();

      const response = await fetch(selectedMedia.uri);
      const blob = await response.blob();

      const postResult = await fetch(uploadURL, {
        method: "POST",
        headers: { "Content-Type": selectedMedia.mimeType! },
        body: blob,
      });

      const { storageId } = await postResult.json();

      await createStory({
        type: selectedMedia.type === "image" ? "image" : "video",
        content: {
          storageId,
          duration: selectedMedia.duration ?? undefined,
          dimensions: {
            width: selectedMedia.width,
            height: selectedMedia.height,
          },
        },
      });

      setIsUploading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderAddStory = () => {
    return (
      <TouchableOpacity
        disabled={isUploading}
        className="items-center mr-4"
        onPress={handleAddStory}
      >
        <View
          className={`w-16 h-16 rounded-full items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
        >
          {isUploading ? (
            <ActivityIndicator
              size={"small"}
              color={isDark ? "#9CA3AF" : "black"}
            />
          ) : (
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color={isDark ? "#9CA3AF" : "black"}
            />
          )}
        </View>
        <Text
          className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
        >
          Add Story
        </Text>
      </TouchableOpacity>
    );
  };

  const userStoriesArray = useMemo(() => {
    const currentUserId = user?._id ?? "";

    if (!storiesByUser) return [];

    const myStories = storiesByUser[currentUserId] ?? [];

    const result = Object.entries(storiesByUser)
      .filter(([userId]) => userId !== currentUserId)
      .map(([userId, stories]) => ({
        userId,
        stories: stories.sort((a, b) => a.sequence - b.sequence),
      }));

    //   /if current has stories add to the top of the array
    if (myStories.length > 0) {
      result.unshift({
        userId: currentUserId,
        stories: myStories.sort((a, b) => a.sequence - b.sequence),
      });
    }
    return result;
  }, [storiesByUser, user?._id]);

  return (
    <View className={isDark ? "bg-gray-900" : "bg-white"}>
      <FlatList
        data={[{ userId: "add", stories: [] }, ...userStoriesArray]}
        horizontal
        showsVerticalScrollIndicator={false}
        className="p-4"
        renderItem={({ item }) =>
          item.userId === "add" ? (
            renderAddStory()
          ) : (
            <StoryItem
              item={item as unknown as { userId: string; stories: Story[] }}
            />
          )
        }
        keyExtractor={(item) => item.userId}
      />

      <View className="flex-row items-center justify-between px-4 mb-4">
        <Text
          className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-600"}`}
        >
          Chats
        </Text>
      </View>
    </View>
  );
};

const StoryItem = ({
  item,
}: {
  item: { userId: string; stories: Story[] };
}) => {
  const { isDark } = useTheme();
  const user = useProfile();

  const isMyStory = item.userId === user?._id;

  const hasUserViewedStory = item.stories.some(
    (story) => !story?.viewers.includes(user?._id ?? "")
  );

  const sortedStories = item.stories.sort((a, b) =>
    a.viewers.includes(user?._id ?? "") ? 1 : -1
  );

  const userInfo = item.stories[0].user;

  return (
    <View className="items-center mr-4">
      <View className="flex-row">
        {/* Show only the first story as a preview */}
        {sortedStories.slice(0, 1).map((story, index) => (
          <TouchableOpacity
            onPress={() => router.push(`/story/${story.userId}`)}
            key={story._id}
            className={`w-16 h-16 rounded-full ${
              hasUserViewedStory ? "border-blue-500" : "border-gray-300"
            } border-2 items-center justify-center overflow-hidden ${index > 0 ? "-ml-4" : ""}`}
          >
            {/* Show image or text story preview */}
            {story.type === "image" ? (
              <Image
                source={{ uri: story.content.media }}
                className="w-full h-full"
              />
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
      {/* Show user name or 'Your Story' */}
      <Text
        numberOfLines={1}
        className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-900"}`}
      >
        {isMyStory ? "Your Story" : (userInfo?.name ?? "User's Story")}
      </Text>
    </View>
  );
};
