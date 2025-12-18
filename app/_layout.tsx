import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { notificationService } from "@/lib/services/notifications";
import { streamingService } from "@/lib/services/streaming";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const servicesInitialized = useRef(false);
  
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const initializeServices = async () => {
      if (servicesInitialized.current) return;
      servicesInitialized.current = true;
      
      try {
        await notificationService.initialize();
        await streamingService.initialize();
        console.log('[App] Services initialized');
      } catch (error) {
        console.error('[App] Failed to initialize services:', error);
      }
    };
    
    initializeServices();
    
    return () => {
      notificationService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="scan" options={{ presentation: "modal" }} />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="create-bet" options={{ presentation: "modal" }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="host-stream" />
        <Stack.Screen name="stream/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
