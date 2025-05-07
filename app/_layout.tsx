import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { router, Slot, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment, useEffect } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

import { ThemeProvider, useTheme } from "@/context/theme-context";
import "../global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

function Layout() {
  const { isDark } = useTheme();

  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();

  if (!isLoaded) {
    return null;
  }

  useEffect(() => {
    if (!isLoaded) return;

    const inProtectedRoute = segments[0] === "(protected)";

    if (isSignedIn && !inProtectedRoute) {
      router.replace("/(protected)/(tabs)");
    } else if (!isSignedIn && inProtectedRoute) {
      router.replace("/");
    }
  }, [isSignedIn]);

  return (
    <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
      <Slot />
      <StatusBar style={isDark ? "light" : "dark"} />
    </ConvexProviderWithClerk>
  );
}
export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ClerkLoaded>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
