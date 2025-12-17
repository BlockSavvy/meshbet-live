import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
// Note: Install with: npx expo install @react-native-community/slider
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";

export default function CreateBetScreen() {
  const [step, setStep] = useState(1);
  const [proposition, setProposition] = useState("");
  const [yourOdds, setYourOdds] = useState("+150");
  const [opponentOdds, setOpponentOdds] = useState("-110");
  const [amount, setAmount] = useState(50);
  const [broadcasting, setBroadcasting] = useState(false);

  const handleCreate = () => {
    setBroadcasting(true);
    setTimeout(() => {
      setBroadcasting(false);
      setStep(3);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="NEW P2P BET" showBack />

      <View className="flex-1 px-6 py-4">
        {step === 1 && (
          <View className="flex-1">
            <View className="mb-6">
              <Text
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: Colors.mutedForeground }}
              >
                Proposition
              </Text>
              <TextInput
                value={proposition}
                onChangeText={setProposition}
                placeholder="e.g. Pereira via KO in Round 2"
                placeholderTextColor={Colors.mutedForeground}
                className="h-14 rounded-xl px-4 text-lg"
                style={{
                  backgroundColor: Colors.card,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  color: Colors.foreground,
                }}
              />
            </View>

            <View className="flex-row gap-4 mb-6">
              <View className="flex-1">
                <Text
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: Colors.mutedForeground }}
                >
                  Your Odds
                </Text>
                <TextInput
                  value={yourOdds}
                  onChangeText={setYourOdds}
                  placeholder="+150"
                  placeholderTextColor={Colors.mutedForeground}
                  className="h-12 rounded-xl px-4 font-mono text-center"
                  style={{
                    backgroundColor: Colors.card,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                    color: Colors.primary,
                  }}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: Colors.mutedForeground }}
                >
                  Opponent Odds
                </Text>
                <TextInput
                  value={opponentOdds}
                  onChangeText={setOpponentOdds}
                  placeholder="-110"
                  placeholderTextColor={Colors.mutedForeground}
                  className="h-12 rounded-xl px-4 font-mono text-center"
                  style={{
                    backgroundColor: Colors.card,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                    color: Colors.secondary,
                  }}
                />
              </View>
            </View>

            <View className="mb-8">
              <View className="flex-row justify-between mb-2">
                <Text
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: Colors.mutedForeground }}
                >
                  Wager Amount
                </Text>
                <Text className="font-mono font-bold" style={{ color: Colors.primary }}>
                  {amount} sats
                </Text>
              </View>
              <View
                className="h-12 rounded-xl justify-center px-4"
                style={{
                  backgroundColor: Colors.card,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Slider
                  minimumValue={10}
                  maximumValue={500}
                  value={amount}
                  onValueChange={setAmount}
                  step={10}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.muted}
                  thumbTintColor={Colors.primary}
                />
              </View>
            </View>

            <View className="mt-auto">
              <Pressable
                onPress={() => setStep(2)}
                className="h-14 rounded-xl items-center justify-center flex-row"
                style={{
                  backgroundColor: Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 15,
                }}
              >
                <Text className="font-bold text-lg" style={{ color: Colors.primaryForeground }}>
                  Review Bet
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={Colors.primaryForeground}
                  style={{ marginLeft: 8 }}
                />
              </Pressable>
            </View>
          </View>
        )}

        {step === 2 && (
          <View className="flex-1">
            <View
              className="rounded-2xl p-6 mb-6"
              style={{
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="alert-circle" size={20} color={Colors.yellow} />
                <Text className="ml-2 font-bold text-white">Review Your Bet</Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                  Proposition
                </Text>
                <Text className="text-lg font-bold text-white mt-1">
                  {proposition || "Pereira via KO in Round 2"}
                </Text>
              </View>

              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                    Your Odds
                  </Text>
                  <Text className="text-xl font-mono font-bold" style={{ color: Colors.primary }}>
                    {yourOdds}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                    Opponent Odds
                  </Text>
                  <Text
                    className="text-xl font-mono font-bold"
                    style={{ color: Colors.secondary }}
                  >
                    {opponentOdds}
                  </Text>
                </View>
              </View>

              <View
                className="h-px my-4"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              />

              <View className="flex-row justify-between">
                <Text className="font-bold text-white">Wager Amount</Text>
                <Text className="font-mono font-bold" style={{ color: Colors.green }}>
                  {amount} sats
                </Text>
              </View>
            </View>

            <View className="mt-auto gap-3">
              <Pressable
                onPress={handleCreate}
                disabled={broadcasting}
                className="h-14 rounded-xl items-center justify-center flex-row"
                style={{
                  backgroundColor: broadcasting ? Colors.muted : Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: broadcasting ? 0 : 0.4,
                  shadowRadius: 15,
                }}
              >
                {broadcasting ? (
                  <>
                    <ActivityIndicator color={Colors.foreground} />
                    <Text className="ml-2 font-bold" style={{ color: Colors.foreground }}>
                      Broadcasting to Mesh...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="flash" size={20} color={Colors.primaryForeground} />
                    <Text
                      className="ml-2 font-bold text-lg"
                      style={{ color: Colors.primaryForeground }}
                    >
                      Broadcast Bet
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={() => setStep(1)}
                className="h-14 rounded-xl items-center justify-center"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Text className="font-bold text-white">Go Back</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="flex-1 items-center justify-center">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: `${Colors.green}20`,
                shadowColor: Colors.green,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
              }}
            >
              <Ionicons name="checkmark-circle" size={64} color={Colors.green} />
            </View>

            <Text className="text-2xl font-bold text-white mb-2">Bet Created!</Text>
            <Text
              className="text-center mb-8 max-w-xs"
              style={{ color: Colors.mutedForeground }}
            >
              Your bet has been broadcast to the mesh network. Waiting for takers...
            </Text>

            <Pressable
              onPress={() => router.back()}
              className="h-14 px-8 rounded-xl items-center justify-center"
              style={{
                backgroundColor: Colors.primary,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 15,
              }}
            >
              <Text className="font-bold text-lg" style={{ color: Colors.primaryForeground }}>
                Back to Event
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
