import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const mockMessages = [
  { id: 1, user: "NeonRider", text: "Pereira looking sharp! 🔥", time: "2m ago" },
  { id: 2, user: "CryptoKing", text: "Adesanya gonna catch him", time: "1m ago" },
  { id: 3, user: "MeshBoss", text: "Taking all bets on Round 2 KO", time: "30s ago" },
];

const mockBets = [
  { id: 1, prop: "Pereira via KO", odds: "+150", pool: "$2,500" },
  { id: 2, prop: "Goes to Decision", odds: "+200", pool: "$1,200" },
  { id: 3, prop: "Round 3 Finish", odds: "+350", pool: "$800" },
];

export default function EventRoomScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"chat" | "bets" | "stats">("chat");
  const [message, setMessage] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 h-14">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.foreground} />
        </Pressable>
        <Text className="text-lg font-bold text-white">UFC 305</Text>
        <Pressable
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <Ionicons name="share-outline" size={20} color={Colors.foreground} />
        </Pressable>
      </View>

      <View className="px-4 pb-3">
        <View
          className="w-full aspect-video rounded-2xl overflow-hidden items-center justify-center"
          style={{ backgroundColor: Colors.card }}
        >
          <Image
            source={require("../../assets/images/cyberpunk-bg.png")}
            className="absolute inset-0 w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/30" />
          <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.8)" />

          <View
            className="absolute bottom-3 right-3 flex-row items-center px-2 py-1 rounded"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-xs text-white font-mono">1,240 watching</Text>
          </View>
        </View>
      </View>

      <View className="px-4 mb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-white">
            PEREIRA <Text style={{ color: Colors.mutedForeground }}>vs</Text> ADESANYA
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs font-mono" style={{ color: Colors.primary }}>
              LIGHT HEAVYWEIGHT
            </Text>
            <Text style={{ color: Colors.mutedForeground }}>•</Text>
            <Text className="text-xs text-red-500">LIVE</Text>
            <Text style={{ color: Colors.mutedForeground }}>•</Text>
            <View className="flex-row items-center">
              <Ionicons name="flash" size={10} color={Colors.secondary} />
              <Text className="text-xs ml-1" style={{ color: Colors.secondary }}>
                HYBRID RELAY
              </Text>
            </View>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
            Pool Value
          </Text>
          <Text className="font-mono font-bold text-lg" style={{ color: Colors.green }}>
            $42,590
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={100}
      >
        <View
          className="flex-1 rounded-t-3xl overflow-hidden"
          style={{
            backgroundColor: Colors.card,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View
            className="absolute top-0 inset-x-0 h-px"
            style={{
              backgroundColor: `${Colors.primary}50`,
            }}
          />

          <View className="flex-row p-3 gap-2">
            {(["chat", "bets", "stats"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="flex-1 h-10 rounded-lg items-center justify-center flex-row gap-2"
                style={{
                  backgroundColor:
                    activeTab === tab ? `${Colors.primary}20` : "rgba(0,0,0,0.2)",
                }}
              >
                <Ionicons
                  name={
                    tab === "chat"
                      ? "chatbubbles"
                      : tab === "bets"
                      ? "trophy"
                      : "stats-chart"
                  }
                  size={16}
                  color={activeTab === tab ? Colors.primary : Colors.mutedForeground}
                />
                <Text
                  className="text-sm font-bold uppercase"
                  style={{
                    color: activeTab === tab ? Colors.primary : Colors.mutedForeground,
                  }}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "chat" && (
            <View className="flex-1">
              <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {mockMessages.map((msg) => (
                  <View key={msg.id} className="mb-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="font-bold text-sm" style={{ color: Colors.primary }}>
                        {msg.user}
                      </Text>
                      <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                        {msg.time}
                      </Text>
                    </View>
                    <Text className="text-white">{msg.text}</Text>
                  </View>
                ))}
              </ScrollView>

              <View className="flex-row items-center px-4 py-3 gap-2">
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type a message..."
                  placeholderTextColor={Colors.mutedForeground}
                  className="flex-1 h-12 rounded-xl px-4"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                    color: Colors.foreground,
                  }}
                />
                <Pressable
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: Colors.primary }}
                >
                  <Ionicons name="send" size={20} color={Colors.primaryForeground} />
                </Pressable>
              </View>
            </View>
          )}

          {activeTab === "bets" && (
            <View className="flex-1 px-4">
              <ScrollView showsVerticalScrollIndicator={false}>
                {mockBets.map((bet) => (
                  <View
                    key={bet.id}
                    className="flex-row items-center justify-between p-4 rounded-xl mb-3"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <View>
                      <Text className="font-bold text-white">{bet.prop}</Text>
                      <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                        Pool: {bet.pool}
                      </Text>
                    </View>
                    <Pressable
                      className="px-4 py-2 rounded-lg"
                      style={{ backgroundColor: Colors.primary }}
                    >
                      <Text className="font-bold" style={{ color: Colors.primaryForeground }}>
                        {bet.odds}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>

              <Pressable
                onPress={() => router.push("/create-bet")}
                className="flex-row items-center justify-center h-14 rounded-xl mb-4"
                style={{
                  backgroundColor: Colors.secondary,
                  shadowColor: Colors.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 15,
                }}
              >
                <Ionicons name="add" size={24} color={Colors.secondaryForeground} />
                <Text
                  className="font-bold ml-2"
                  style={{ color: Colors.secondaryForeground }}
                >
                  Create P2P Bet
                </Text>
              </Pressable>
            </View>
          )}

          {activeTab === "stats" && (
            <View className="flex-1 items-center justify-center px-6">
              <Ionicons name="stats-chart" size={48} color={Colors.mutedForeground} />
              <Text className="text-white font-bold text-lg mt-4">Live Stats</Text>
              <Text className="text-center mt-2" style={{ color: Colors.mutedForeground }}>
                Real-time fight statistics coming soon
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
