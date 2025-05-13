import { Loader } from "@/components/loader";
import { Story } from "@/components/stories";
import { useTheme } from "@/context/theme-context";
import { api } from "@/convex/_generated/api";
import { useProfile } from "@/hooks/use-profile";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StoryView = () => {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const user = useProfile();

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stories, setStories] = useState<Story[]>([]);

  const userStories = useQuery(api.stories.getStories, {
    friends: [id as string],
  });
  const markStoryAsViewed = useMutation(api.stories.markStoryAsViewed);

  useEffect(() => {
    if (userStories && id) {
      const userStoryArray = userStories[id as string] ?? [];

      const sortedStories = [...userStoryArray].sort((a, b) => {
        const viewedA = a.viewers.includes(user?._id || "");
        const viewedB = b.viewers.includes(user?._id || "");

        if (viewedA !== viewedB) {
          return viewedA ? 1 : -1;
        }

        return a.sequence - b.sequence;
      });

      setStories(sortedStories as unknown as Story[]);
    }
  }, [userStories, id, user]);

  useEffect(() => {
    if (stories.length > 0 && user && currentStoryIndex < stories.length) {
      const currentStory = stories[currentStoryIndex];

      markStoryAsViewed({ storyId: currentStory._id });
    }
  }, [currentStoryIndex, stories, user]);

  // Handle story progress and navigation
  useEffect(() => {
    if (stories.length > 0 && currentStoryIndex < stories.length) {
      const currentStory = stories[currentStoryIndex];
      const duration = currentStory.type === "video" ? 30000 : 5000; // 30 seconds for videos, 5 for images
      const interval = 50; // Update progress every 50ms
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setProgress((currentStep / steps) * 100);

        if (currentStep >= steps) {
          clearInterval(timer);
          // Move to next story or exit if at the end
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            setProgress(0);
          } else {
            router.back();
          }
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [currentStoryIndex, stories]);

  if (!stories.length) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-black" : "bg-white"}`}
      >
        <Loader />
      </View>
    );
  }

  const currentStory = stories[currentStoryIndex];

  return (
    <SafeAreaView className="flex-1">
      <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
        {/* progress abr */}

        <View className="flex-row h-1">
          {stories.map((_, index) => (
            <View key={index} className="flex-1 h-full bg-gray-300 mx-0.5">
              <View
                className="h-full bg-blue-500"
                style={{
                  width:
                    index < currentStoryIndex
                      ? "100%"
                      : index === currentStoryIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </View>
          ))}
        </View>

        {/* header */}

        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-4" onPress={() => router.back()}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            </TouchableOpacity>

            <Text
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-black"}`}
            >
              {currentStory.userId === user?._id
                ? "Your Story"
                : currentStory.user.name}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">
            {new Date(currentStory.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* story */}

        <View className="items-center justify-center flex-1">
          {currentStory.type === "image" ? (
            <View className="w-full h-full">
              <Image
                source={{ uri: currentStory.content.media }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StoryView;
