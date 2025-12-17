import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

type StepData = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  desc: string;
  action: string;
  isInput?: boolean;
};

const steps: StepData[] = [
  {
    icon: "wifi",
    iconColor: Colors.primary,
    title: "Mesh Network",
    desc: "Connect to nearby viewing parties without internet using Bluetooth & WiFi Direct.",
    action: "Enable Mesh Mode",
  },
  {
    icon: "wallet",
    iconColor: Colors.secondary,
    title: "Crypto Wallet",
    desc: "Instant payouts via Lightning Network & Solana. No KYC, just pure betting.",
    action: "Create Vault",
  },
  {
    icon: "shield-checkmark",
    iconColor: Colors.accentForeground,
    title: "Set Identity",
    desc: "Choose your anonymous handle for the leaderboards.",
    action: "Enter The Arena",
    isInput: true,
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (direction: "next" | "prev", callback: () => void) => {
    const exitValue = direction === "next" ? -50 : 50;
    const enterValue = direction === "next" ? 50 : -50;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: exitValue,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(enterValue);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const nextStep = () => {
    if (step < 2) {
      animateTransition("next", () => setStep(step + 1));
    } else {
      router.replace("/(tabs)");
    }
  };

  const currentStep = steps[step];

  return (
    <ImageBackground
      source={require("../assets/images/cyberpunk-bg.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 bg-black/80">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-center items-center px-6 pt-10">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              }}
              className="items-center"
            >
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  shadowColor: currentStep.iconColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                }}
              >
                <Ionicons
                  name={currentStep.icon}
                  size={48}
                  color={currentStep.iconColor}
                />
              </View>

              <Text className="text-3xl font-bold text-white text-center mb-3">
                {currentStep.title}
              </Text>
              <Text
                className="text-center leading-6 max-w-xs"
                style={{ color: Colors.mutedForeground }}
              >
                {currentStep.desc}
              </Text>

              {currentStep.isInput && (
                <View className="w-full mt-8">
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter Username"
                    placeholderTextColor={Colors.mutedForeground}
                    className="w-full h-14 rounded-xl text-center text-lg font-mono"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.2)",
                      color: Colors.foreground,
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
            </Animated.View>
          </View>

          <View className="px-6 pb-12">
            <View className="flex-row justify-center gap-2 mb-6">
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  className={cn(
                    "h-1 rounded-full",
                    i === step ? "w-8" : "w-2"
                  )}
                  style={{
                    backgroundColor:
                      i === step ? Colors.primary : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </View>

            <Pressable
              onPress={nextStep}
              className="w-full h-14 rounded-xl flex-row items-center justify-center"
              style={{
                backgroundColor: Colors.primary,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 15,
              }}
            >
              <Text className="text-lg font-bold" style={{ color: Colors.primaryForeground }}>
                {currentStep.action}
              </Text>
              <Ionicons
                name={step < 2 ? "arrow-forward" : "checkmark"}
                size={24}
                color={Colors.primaryForeground}
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}
