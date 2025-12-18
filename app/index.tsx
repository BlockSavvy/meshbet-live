import { useEffect, useRef, useState } from "react";
import { View, Text, Image, Animated } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const checkOnboarding = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem("onboarding_complete");
        
        timerRef.current = setTimeout(() => {
          if (onboardingComplete === "true") {
            router.replace("/(tabs)");
          } else {
            router.replace("/onboarding");
          }
        }, 2500);
      } catch (error) {
        timerRef.current = setTimeout(() => {
          router.replace("/onboarding");
        }, 2500);
      }
    };

    checkOnboarding();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <LinearGradient
        colors={[`${Colors.primary}33`, Colors.background, Colors.background]}
        className="absolute inset-0"
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
        className="items-center"
      >
        <View className="relative w-32 h-32 mb-6 items-center justify-center">
          <View
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: `${Colors.primary}30`,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 30,
            }}
          />
          <Image
            source={require("../assets/images/logo.png")}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        <Text
          className="text-4xl font-bold tracking-widest"
          style={{
            color: Colors.primary,
            textShadowColor: Colors.primary,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
          }}
        >
          MESHBET
        </Text>
        <Text
          className="text-xs font-mono tracking-[3px] mt-2 uppercase"
          style={{ color: `${Colors.primary}AA` }}
        >
          Decentralized Live Betting
        </Text>
      </Animated.View>

      <View className="absolute bottom-10 flex-row gap-2">
        <BouncingDot delay={0} color={Colors.primary} />
        <BouncingDot delay={150} color={Colors.secondary} />
        <BouncingDot delay={300} color={Colors.primary} />
      </View>
    </View>
  );
}

function BouncingDot({ delay, color }: { delay: number; color: string }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        transform: [{ translateY: bounceAnim }],
      }}
    />
  );
}
