import { useEffect, useRef, useState } from "react";
import { View, Text, Image, Animated, Platform, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: isDesktop ? 400 : 800,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: isDesktop ? 800 : 2000,
        useNativeDriver: false,
      }),
    ]).start();

    const checkOnboarding = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem("onboarding_complete");
        const delay = isDesktop ? 1000 : 2500;
        
        timerRef.current = setTimeout(() => {
          if (isWeb || onboardingComplete === "true") {
            router.replace("/(tabs)");
          } else {
            router.replace("/onboarding");
          }
        }, delay);
      } catch (error) {
        const delay = isDesktop ? 1000 : 2500;
        timerRef.current = setTimeout(() => {
          if (isWeb) {
            router.replace("/(tabs)");
          } else {
            router.replace("/onboarding");
          }
        }, delay);
      }
    };

    checkOnboarding();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isDesktop, isWeb]);

  const logoSize = isDesktop ? 80 : 128;

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
          transform: isWeb ? [] : [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
        className="items-center"
      >
        <View 
          className="relative mb-6 items-center justify-center"
          style={{ width: logoSize, height: logoSize }}
        >
          <View
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: `${Colors.primary}30`,
              boxShadow: isWeb ? `0 0 30px ${Colors.primary}80` : undefined,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 30,
            }}
          />
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: logoSize, height: logoSize }}
            resizeMode="contain"
          />
        </View>

        <Text
          style={{
            fontSize: isDesktop ? 28 : 36,
            fontWeight: 'bold',
            letterSpacing: 4,
            color: Colors.primary,
            textShadowColor: isWeb ? undefined : Colors.primary,
            textShadowOffset: isWeb ? undefined : { width: 0, height: 0 },
            textShadowRadius: isWeb ? undefined : 10,
          }}
        >
          MESHBET
        </Text>
        <Text
          className="text-xs font-mono mt-2 uppercase"
          style={{ 
            color: `${Colors.primary}AA`,
            letterSpacing: 3,
          }}
        >
          Decentralized Live Betting
        </Text>
      </Animated.View>

      {isDesktop ? (
        <View className="absolute bottom-16 items-center" style={{ width: 200 }}>
          <View 
            style={{ 
              width: '100%', 
              height: 3, 
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Animated.View 
              style={{ 
                height: '100%',
                backgroundColor: Colors.primary,
                borderRadius: 2,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                boxShadow: `0 0 10px ${Colors.primary}`,
              }} 
            />
          </View>
          <Text 
            className="mt-3 text-xs"
            style={{ color: Colors.mutedForeground }}
          >
            Loading...
          </Text>
        </View>
      ) : (
        <View className="absolute bottom-10 flex-row gap-2">
          <BouncingDot delay={0} color={Colors.primary} />
          <BouncingDot delay={150} color={Colors.secondary} />
          <BouncingDot delay={300} color={Colors.primary} />
        </View>
      )}
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
