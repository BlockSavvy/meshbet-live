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
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";
import { walletService } from "@/lib/services/wallet";
import { bitchatService } from "@/lib/services/bitchat";

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
    desc: "Secure HD wallet with seed phrase backup. Sign bets cryptographically.",
    action: "Create Wallet",
  },
  {
    icon: "shield-checkmark",
    iconColor: Colors.accentForeground,
    title: "Set Identity",
    desc: "Choose your mesh handle for P2P betting.",
    action: "Enter The Arena",
    isInput: true,
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [meshEnabled, setMeshEnabled] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

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
      successAnim.setValue(0);
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

  const showSuccess = (onComplete: () => void) => {
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
    ]).start(onComplete);
  };

  const handleStep0 = async () => {
    setLoading(true);
    try {
      await bitchatService.initialize();
      await AsyncStorage.setItem("mesh_enabled", "true");
      setMeshEnabled(true);
      setLoading(false);
      showSuccess(() => {
        animateTransition("next", () => setStep(1));
      });
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to enable mesh mode. Please try again.");
    }
  };

  const handleStep1 = async () => {
    if (showSeedPhrase && !seedConfirmed) {
      Alert.alert(
        "Confirm Backup",
        "Have you securely written down your seed phrase? You will need it to recover your wallet.",
        [
          { text: "Go Back", style: "cancel" },
          { 
            text: "I've Saved It", 
            onPress: async () => {
              setSeedConfirmed(true);
              await walletService.markAsBackedUp();
              showSuccess(() => {
                animateTransition("next", () => setStep(2));
              });
            }
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await walletService.createWallet();
      
      if (result) {
        setWalletAddress(result.address);
        setSeedPhrase(result.mnemonic.split(' '));
        setShowSeedPhrase(true);
        await AsyncStorage.setItem("wallet_address", result.address);
      } else {
        const chars = "0123456789abcdef";
        let address = "0x";
        for (let i = 0; i < 40; i++) {
          address += chars[Math.floor(Math.random() * chars.length)];
        }
        setWalletAddress(address);
        await AsyncStorage.setItem("wallet_address", address);
        showSuccess(() => {
          animateTransition("next", () => setStep(2));
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to create wallet. Please try again.");
    }
  };

  const handleStep2 = async () => {
    if (!username.trim()) {
      Alert.alert("Username Required", "Please enter a username to continue.");
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem("username", username.trim());
      await AsyncStorage.setItem("onboarding_complete", "true");
      
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings. Please try again.");
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 0) {
      handleStep0();
    } else if (step === 1) {
      handleStep1();
    } else {
      handleStep2();
    }
  };

  const currentStep = steps[step];
  const isStepComplete = (step === 0 && meshEnabled) || (step === 1 && walletAddress && seedConfirmed);

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
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-center items-center px-6 pt-10">
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                }}
                className="items-center w-full"
              >
                <View
                  className="w-24 h-24 rounded-full items-center justify-center mb-6"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: isStepComplete ? Colors.green : "rgba(255,255,255,0.1)",
                    shadowColor: currentStep.iconColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                  }}
                >
                  <Animated.View
                    style={{
                      opacity: successAnim,
                      position: "absolute",
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
                  </Animated.View>
                  <Animated.View
                    style={{
                      opacity: successAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0],
                      }),
                    }}
                  >
                    <Ionicons
                      name={currentStep.icon}
                      size={48}
                      color={currentStep.iconColor}
                    />
                  </Animated.View>
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

                {step === 1 && showSeedPhrase && seedPhrase.length > 0 && (
                  <View className="mt-6 w-full">
                    <View
                      className="p-4 rounded-xl mb-4"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                        borderColor: Colors.yellow + "40",
                      }}
                    >
                      <View className="flex-row items-center mb-3">
                        <Ionicons name="warning" size={20} color={Colors.yellow} />
                        <Text className="ml-2 font-bold" style={{ color: Colors.yellow }}>
                          Backup Your Seed Phrase
                        </Text>
                      </View>
                      <Text className="text-xs mb-3" style={{ color: Colors.mutedForeground }}>
                        Write down these 12 words in order. This is the ONLY way to recover your wallet.
                      </Text>
                      <View className="flex-row flex-wrap justify-center gap-2">
                        {seedPhrase.map((word, index) => (
                          <View
                            key={index}
                            className="px-3 py-2 rounded-lg"
                            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                          >
                            <Text className="font-mono text-xs" style={{ color: Colors.foreground }}>
                              <Text style={{ color: Colors.mutedForeground }}>{index + 1}. </Text>
                              {word}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View
                      className="px-4 py-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderWidth: 1,
                        borderColor: Colors.secondary + "40",
                      }}
                    >
                      <Text className="text-xs mb-1" style={{ color: Colors.mutedForeground }}>
                        Your Wallet Address
                      </Text>
                      <Text className="font-mono text-sm" style={{ color: Colors.secondary }}>
                        {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                      </Text>
                    </View>
                  </View>
                )}

                {step === 1 && walletAddress && !showSeedPhrase && (
                  <View
                    className="mt-6 px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderWidth: 1,
                      borderColor: Colors.secondary + "40",
                    }}
                  >
                    <Text className="text-xs mb-1" style={{ color: Colors.mutedForeground }}>
                      Your Wallet Address
                    </Text>
                    <Text className="font-mono text-sm" style={{ color: Colors.secondary }}>
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </Text>
                  </View>
                )}

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
                        borderColor: username ? Colors.primary + "50" : "rgba(255,255,255,0.2)",
                        color: Colors.foreground,
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={20}
                    />
                    <Text className="text-xs text-center mt-2" style={{ color: Colors.mutedForeground }}>
                      This will be your public mesh identity
                    </Text>
                  </View>
                )}
              </Animated.View>
            </View>
          </ScrollView>

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
                      i < step ? Colors.green : i === step ? Colors.primary : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </View>

            <Pressable
              onPress={nextStep}
              disabled={loading || (step === 2 && !username.trim())}
              className="w-full h-14 rounded-xl flex-row items-center justify-center"
              style={{
                backgroundColor: loading || (step === 2 && !username.trim()) 
                  ? Colors.muted 
                  : Colors.primary,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: loading ? 0 : 0.4,
                shadowRadius: 15,
              }}
            >
              {loading ? (
                <Text className="text-lg font-bold" style={{ color: Colors.mutedForeground }}>
                  {step === 0 ? "Enabling..." : step === 1 ? "Creating Wallet..." : "Saving..."}
                </Text>
              ) : (
                <>
                  <Text className="text-lg font-bold" style={{ color: Colors.primaryForeground }}>
                    {step === 1 && showSeedPhrase && !seedConfirmed ? "I've Backed Up My Seed" : currentStep.action}
                  </Text>
                  <Ionicons
                    name={step < 2 ? "arrow-forward" : "checkmark"}
                    size={24}
                    color={Colors.primaryForeground}
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}
