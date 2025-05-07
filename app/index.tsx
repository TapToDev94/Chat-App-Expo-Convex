import { useTheme } from "@/context/theme-context";
import { useCallback, useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  useWarmUpBrowser();

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO();
  const { isDark } = useTheme();

  const onPress = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          // For web, defaults to current path
          // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
          // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#1A1C1E]" : "bg-white"}`}>
      <View className="flex-1">
        <View className="items-center mt-20">
          <Image
            source={require("@/assets/images/chat.png")}
            className="w-[90%] h-[200px] rounded-2xl mb-1-"
          />
          <Text
            className={`${
              isDark ? "text-white" : "text-black"
            } text-2xl font-bold text-center`}
          >
            Welcome to Chatol
          </Text>
          <Text
            className={`${
              isDark ? "text-white" : "text-black"
            } text-center text-base text-pretty px-12`}
          >
            Experience seamless conversations with friends and family in
            real-time
          </Text>
        </View>

        <View className="absolute w-full px-6 bottom-10">
          <TouchableOpacity
            className={`${
              isDark ? "bg-[#292B2D]" : "bg-white"
            } rounded-full py-4 mb-4 items-center flex-row justify-center`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: isDark ? 0 : 2,
            }}
            onPress={onPress}
          >
            <Image
              source={require("@/assets/images/google.png")}
              className="w-6 h-6 mr-2"
            />
            <Text>Continue with Google</Text>
          </TouchableOpacity>

          {/* Terms Text */}
          <Text
            className={`text-sm text-center px-10 ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            By continuing, you agree to our{" "}
            <Text className="text-blue-500">Terms of Service</Text> and{" "}
            <Text className="text-blue-500">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
