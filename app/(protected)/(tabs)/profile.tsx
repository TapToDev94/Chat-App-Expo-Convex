import { useTheme } from "@/context/theme-context";
import { NoImage } from "@/dummyData";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  ScrollView,
  Text,
  Touchable,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingItem = ({
  icon,
  title,
  subTitle,
  showArrow,
  showToggle,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subTitle?: string;
  showArrow?: boolean;
  showToggle?: boolean;
  onPress?: () => void;
}) => {
  const { isDark } = useTheme();

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between"
      onPress={onPress}
    >
      <View>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={isDark ? "#9CA3AF" : "#4B5563"}
        />
      </View>
      <View className="flex-1 ml-4">
        <Text
          className={`text-[16px] font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          {title}
        </Text>

        <Text
          className={`text-[14px] mt-0.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {subTitle || "N/A"}
        </Text>
      </View>

      {showArrow && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={isDark ? "#9CA3AF" : "#4B5563"}
        />
      )}
    </TouchableOpacity>
  );
};
const Profile = () => {
  const { isDark, theme, setTheme } = useTheme();
  const user = useProfile();
  const { signOut } = useAuth();

  const themeText = useMemo(() => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "Light";
    }
  }, [theme]);

  const handleTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("light");
        break;
      default:
        setTheme("light");
        break;
    }
  };

  const logOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* header */}
      <View className="flex-row items-center justify-between p-4">
        <Text
          className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}
        >
          Profile
        </Text>
      </View>

      {/* content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className={`items-center py-8`}>
          <View className="relative">
            <Image
              source={{ uri: user?.imageUrl || NoImage }}
              className="rounded-full w-28 h-28"
            />

            <TouchableOpacity
              className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full"
              onPress={() => console.log("edit profile")}
            >
              <MaterialCommunityIcons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <Text
            className={`text-2xl font-semibold mt-4 ${isDark ? "text-white" : "text-black"}`}
          >
            {user?.name}
          </Text>

          <View className="items-center">
            <Text
              className={`text-gray-500 ${isDark ? "text-white" : "text-black"}`}
            >
              @{user?.username}
            </Text>

            <TouchableOpacity className="flex-row items-center gap-2 mt-4">
              <MaterialCommunityIcons name="pencil" size={20} color="blue" />
              <Text className="text-blue-600">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-4 mt-4">
          <View className="mb-8">
            <Text
              className={`text-[12px] font-semibold ${isDark ? "text-white" : "text-black"}`}
            >
              Account Settings
            </Text>

            <View className="gap-4 mt-4">
              <SettingItem
                icon="account"
                title="Username"
                subTitle={user?.username}
                showArrow={false}
              />
              <View
                style={{ height: StyleSheet.hairlineWidth }}
                className={`${isDark ? "bg-gray-800" : "bg-gray-200"}`}
              />
              <SettingItem
                icon="email"
                title="Email"
                subTitle={user?.email}
                showArrow={false}
              />
              <View
                style={{ height: StyleSheet.hairlineWidth }}
                className={`${isDark ? "bg-gray-800" : "bg-gray-200"}`}
              />
              <SettingItem
                icon="phone"
                title="Phone Number"
                subTitle={user?.phoneNumber}
                showArrow={false}
              />
            </View>
          </View>

          <View className="mb-8">
            <Text
              className={`text-[12px] font-semibold ${isDark ? "text-white" : "text-black"}`}
            >
              Appearance
            </Text>

            <View className="gap-4 mt-4">
              <SettingItem
                icon="theme-light-dark"
                title="Theme"
                subTitle={isDark ? "Dark" : "Light"}
                showArrow={true}
                onPress={() => handleTheme()}
              />
              <View
                style={{ height: StyleSheet.hairlineWidth }}
                className={`${isDark ? "bg-gray-800" : "bg-gray-200"}`}
              />
            </View>
          </View>

          <TouchableOpacity
            className="items-center justify-center p-4 mt-4 bg-red-500 rounded-lg"
            onPress={logOut}
          >
            <Text className="text-base font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
