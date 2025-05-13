import { useTheme } from "@/context/theme-context";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// EmojiPicker.tsx - Modal for selecting emojis, organized by category
// Emoji categories with their emojis
const emojiCategories = [
  {
    name: "Smileys & People",
    icon: "emoticon-outline",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😅",
      "😂",
      "🤣",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🤩",
      "🥳",
    ],
  },
  {
    name: "Animals & Nature",
    icon: "leaf",
    emojis: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🌸",
      "🌹",
      "🌺",
      "🌻",
      "🌼",
      "🌷",
      "🌱",
      "🌲",
      "🌳",
      "🌴",
      "🌵",
      "🌾",
      "🌿",
      "☘️",
      "🍀",
    ],
  },
  {
    name: "Food & Drink",
    icon: "food-apple",
    emojis: [
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
      "🌶",
      "🌽",
      "🥕",
      "🥔",
      "🍠",
      "🥐",
      "🥯",
      "🍞",
      "🥖",
    ],
  },
  {
    name: "Activities",
    icon: "basketball",
    emojis: [
      "⚽️",
      "🏀",
      "🏈",
      "⚾️",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "⛳️",
      "🪁",
      "🎣",
      "🤿",
      "🎽",
      "🛹",
      "🛼",
      "🛷",
      "⛸",
      "🥌",
      "🎿",
      "⛷",
      "🏂",
    ],
  },
  {
    name: "Objects",
    icon: "lightbulb-outline",
    emojis: [
      "⌚️",
      "📱",
      "📲",
      "💻",
      "⌨️",
      "🖥",
      "🖨",
      "🖱",
      "🖲",
      "🕹",
      "🗜",
      "💽",
      "💾",
      "💿",
      "📀",
      "📼",
      "📷",
      "📸",
      "📹",
      "🎥",
      "📽",
      "🎞",
      "📞",
      "☎️",
      "📟",
      "📠",
      "📺",
      "📻",
      "🎙",
      "��",
    ],
  },
];

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelected: (emoji: string) => void;
}

export const EmojiPicker = ({
  onEmojiSelected,
  visible,
  onClose,
}: EmojiPickerProps) => {
  const { isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState(0);
  const { height } = Dimensions.get("window");

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View
      className={`absolute bottom-0 left-0 right-0 border-t ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
      style={{
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [height * 0.4, 0],
            }),
          },
        ],
        height: height * 0.4,
      }}
    >
      <View className="flex-row items-center justify-between p-4">
        <Text
          className={`${isDark ? "text-white" : "text-black"} text-lg font-semibold`}
        >
          Emoji
        </Text>

        <TouchableOpacity onPress={onClose}>
          <MaterialIcons
            name="close"
            size={24}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>

      <View
        className={`flex-row p-2 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <FlatList
          data={emojiCategories}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(index)}
              className={`px-4 py-2 mx-1 rounded-full ${selectedCategory === index ? (isDark ? "bg-gray-800" : "bg-gray-200") : "bg-transparent"}`}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={24}
                color={
                  selectedCategory === index
                    ? isDark
                      ? "#FFFFFF"
                      : "#000000"
                    : isDark
                      ? "#9CA3AF"
                      : "#6B7280"
                }
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <FlatList
        data={emojiCategories[selectedCategory].emojis}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              onEmojiSelected(item);
              onClose();
            }}
            className="items-center justify-center p-2"
          >
            <Text className="text-2xl">{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        numColumns={8}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-2"
      />
    </Animated.View>
  );
};
