import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WebLayout } from "@/components/web";
import { notificationService } from "@/lib/services/notifications";
import { streamingService } from "@/lib/services/streaming";
import { sportsDataService } from "@/lib/services/sportsData";
import { walletService } from "@/lib/services/wallet";
import { bettingService } from "@/lib/services/betting";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const ODDS_API_KEY = process.env.EXPO_PUBLIC_ODDS_API_KEY || process.env.ODDS_API_KEY || '';

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
        if (ODDS_API_KEY) {
          sportsDataService.setApiKey(ODDS_API_KEY);
          console.log('[App] Sports API key configured');
        }
        
        await walletService.initialize();
        await walletService.loadExistingWallet();
        await bettingService.initialize();
        await notificationService.initialize();
        await streamingService.initialize();
        console.log('[App] All services initialized');
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

  const isWeb = Platform.OS === 'web';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      {isWeb && (
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root {
            height: 100%;
            overflow-x: hidden;
          }
          * {
            box-sizing: border-box;
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #171717;
          }
          ::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #444;
          }
          @media (min-width: 1024px) {
            .hide-on-desktop {
              display: none !important;
            }
          }
        `}} />
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
          animation: isWeb ? "none" : "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" options={{ animation: isWeb ? "none" : "fade" }} />
        <Stack.Screen name="scan" options={{ presentation: isWeb ? "card" : "modal" }} />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="create-bet" options={{ presentation: isWeb ? "card" : "modal" }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="host-stream" />
        <Stack.Screen name="stream/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
