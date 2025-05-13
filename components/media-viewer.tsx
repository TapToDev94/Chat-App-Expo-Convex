import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  TouchableOpacity,
} from "react-native";

interface MediaViewerProps {
  visible: boolean;
  onClose: () => void;
  media: {
    url: string;
    type: string;
  };
}

export const MediaViewer = ({ visible, onClose, media }: MediaViewerProps) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const player = useVideoPlayer(media.url, (player) => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <Animated.View
        className="flex-1 bg-black"
        style={{
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          className="absolute z-10 p-2 top-12 right-4"
          onPress={onClose}
        >
          <MaterialCommunityIcons name="close" size={28} color="white" />
        </TouchableOpacity>

        <Animated.View
          className="items-center justify-center flex-1"
          style={{
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Dimensions.get("window").height, 0],
                }),
              },
            ],
          }}
        >
          {media.type === "image" ? (
            <Image
              source={{ uri: media.url }}
              className="flex-1 w-full h-auto"
              resizeMode="contain"
            />
          ) : media.type === "video" ? (
            <VideoView
              style={{
                width: "100%",
                height: "100%",
              }}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />
          ) : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
