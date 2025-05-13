import { useTheme } from "@/context/theme-context";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useStorage } from "@/hooks/use-storage";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { EmojiPicker } from "./emoji-picker";

export const MessageInput = ({ chatId }: { chatId: Id<"chats"> }) => {
  const { isDark } = useTheme();

  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { uploadFile } = useStorage();

  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage({
        chatId: chatId,
        text: message,
      });

      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmojiSelected = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleMediaPicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        // aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);

        const asset = result.assets[0];

        const uploadResult = await uploadFile({
          file: asset,
          type: asset.mimeType!,
        });

        if (uploadResult) {
          await sendMessage({
            chatId: chatId,
            media: [
              {
                storageId: uploadResult.storageId,
                type: asset.type || "image",
                fileName: asset.fileName || undefined,
                fileSize: asset.fileSize || undefined,
                mimeType: asset.mimeType || undefined,
                duration: asset.duration || undefined,
                dimensions:
                  asset.width && asset.height
                    ? {
                        width: asset.width,
                        height: asset.height,
                      }
                    : undefined,
              },
            ],
          });
        }
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View
      className={`flex-row items-center p-2 border-t ${isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}
    >
      <TouchableOpacity onPress={handleMediaPicker}>
        {isUploading ? (
          <ActivityIndicator
            color={isDark ? "white" : "black"}
            size={"small"}
          />
        ) : (
          <MaterialIcons
            name="attach-file"
            size={24}
            color={isDark ? "white" : "black"}
          />
        )}
      </TouchableOpacity>

      <View className="flex-row items-center flex-1 px-4 py-2 rounded-2xl">
        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline={true}
          numberOfLines={3}
          placeholder="Type a message"
          placeholderTextColor={isDark ? "gray-400" : "gray-600"}
          className={`${isDark ? "text-white" : "text-black"} text-base flex-1`}
        />
        <TouchableOpacity onPress={() => setShowEmojiPicker(true)}>
          <MaterialCommunityIcons
            name={showEmojiPicker ? "emoticon" : "emoticon-outline"}
            size={24}
            color={isDark ? "white" : "black"}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className={`${message.trim().length > 0 ? "opacity-100" : "opacity-50"}`}
        onPress={handleSendMessage}
        disabled={!message.trim().length}
      >
        <MaterialIcons
          name="send"
          size={24}
          color={isDark ? "white" : "black"}
        />
      </TouchableOpacity>

      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelected={handleEmojiSelected}
      />
    </View>
  );
};
