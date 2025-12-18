import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";

export default function ProfileScreen() {
  const [username, setUsername] = useState("Anonymous");
  const [walletAddress, setWalletAddress] = useState("");
  const [meshEnabled, setMeshEnabled] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem("username");
      const storedWallet = await AsyncStorage.getItem("wallet_address");
      const storedMesh = await AsyncStorage.getItem("mesh_enabled");

      if (storedUsername) setUsername(storedUsername);
      if (storedWallet) setWalletAddress(storedWallet);
      if (storedMesh === "true") setMeshEnabled(true);
    } catch (error) {
      console.log("Error loading user data");
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return "Not connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const stats = [
    { label: "Total Bets", value: "47", icon: "dice" },
    { label: "Win Rate", value: "62%", icon: "trending-up" },
    { label: "Total Won", value: "$1,293", icon: "trophy" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="PROFILE" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="items-center py-6">
          <View
            className="w-24 h-24 rounded-full p-1"
            style={{
              backgroundColor: Colors.primary,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
            }}
          >
            <Image
              source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${username}` }}
              className="w-full h-full rounded-full bg-black"
            />
            <View
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full items-center justify-center"
              style={{
                backgroundColor: meshEnabled ? Colors.green : Colors.mutedForeground,
                borderWidth: 4,
                borderColor: Colors.background,
              }}
            >
              {meshEnabled && <Ionicons name="radio" size={10} color="#fff" />}
            </View>
          </View>
          <Text className="mt-4 text-2xl font-bold text-white">{username}</Text>
          <View
            className="px-3 py-1 rounded-full mt-2 flex-row items-center gap-1"
            style={{
              backgroundColor: `${Colors.primary}15`,
              borderWidth: 1,
              borderColor: `${Colors.primary}30`,
            }}
          >
            <Ionicons name="wallet-outline" size={12} color={Colors.primary} />
            <Text className="text-xs font-mono" style={{ color: Colors.primary }}>
              {truncateAddress(walletAddress)}
            </Text>
          </View>

          <View
            className="flex-row items-center gap-2 mt-3 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: meshEnabled ? `${Colors.green}15` : `${Colors.mutedForeground}15`,
              borderWidth: 1,
              borderColor: meshEnabled ? `${Colors.green}30` : `${Colors.mutedForeground}30`,
            }}
          >
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: meshEnabled ? Colors.green : Colors.mutedForeground }}
            />
            <Text
              className="text-xs font-medium"
              style={{ color: meshEnabled ? Colors.green : Colors.mutedForeground }}
            >
              {meshEnabled ? "Mesh Connected" : "Mesh Offline"}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          {stats.map((stat, index) => (
            <View
              key={index}
              className="flex-1 p-4 rounded-xl items-center"
              style={{
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Ionicons name={stat.icon as any} size={20} color={Colors.primary} />
              <Text className="text-lg font-bold text-white mt-2">{stat.value}</Text>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: Colors.mutedForeground }}
              >
                Total Balance
              </Text>
              <Text className="text-3xl font-bold font-mono text-white">$4,293.52</Text>
              <Text className="text-xs font-mono mt-1" style={{ color: Colors.green }}>
                +12.5% this week
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Ionicons name="wallet" size={20} color={Colors.foreground} />
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 h-12 rounded-xl items-center justify-center"
              style={{
                backgroundColor: Colors.primary,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
              }}
            >
              <Text className="font-bold" style={{ color: Colors.primaryForeground }}>
                Deposit
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 h-12 rounded-xl items-center justify-center"
              style={{
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text className="font-bold text-white">Withdraw</Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-6">
          {[
            { icon: "time", label: "Betting History", route: "/history" },
            { icon: "settings", label: "Settings", route: "/settings" },
            { icon: "shield-checkmark", label: "Security", route: "/security" },
            { icon: "help-circle", label: "Help & Support", route: "/help" },
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={() => router.push(item.route as any)}
              className="flex-row items-center justify-between py-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.05)",
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={Colors.foreground}
                  />
                </View>
                <Text className="text-base font-medium text-white">{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <Text className="text-center text-xs mb-8" style={{ color: Colors.mutedForeground }}>
          MeshBet Live v0.1.0 (Beta)
        </Text>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
