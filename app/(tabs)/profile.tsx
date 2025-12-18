import { useEffect, useState, useCallback } from "react";
import { View, Text, Image, Pressable, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { bettingService } from "@/lib/services/betting";
import { walletService } from "@/lib/services/wallet";
import { bitchatService } from "@/lib/services/bitchat";

export default function ProfileScreen() {
  const [username, setUsername] = useState("Anonymous");
  const [walletAddress, setWalletAddress] = useState("");
  const [meshEnabled, setMeshEnabled] = useState(false);
  const [meshPeerCount, setMeshPeerCount] = useState(0);
  const [stats, setStats] = useState({ totalBets: 0, wins: 0, losses: 0, winRate: 0, totalWon: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const storedUsername = await AsyncStorage.getItem("username");
      const storedMesh = await AsyncStorage.getItem("mesh_enabled");

      if (storedUsername) setUsername(storedUsername);
      if (storedMesh === "true") setMeshEnabled(true);

      const wallet = await walletService.loadExistingWallet();
      if (wallet) setWalletAddress(wallet.address);

      const peers = await bitchatService.getConnectedPeers();
      setMeshPeerCount(peers.length);

      await bettingService.initialize();
      const bettingStats = bettingService.getStats();
      setStats(bettingStats);
    } catch (error) {
      console.log("Error loading user data");
    }
  }, []);

  useEffect(() => {
    loadUserData();

    const unsubPeer = bitchatService.onPeerConnected(() => {
      bitchatService.getConnectedPeers().then(peers => setMeshPeerCount(peers.length));
    });

    const unsubDisconnect = bitchatService.onPeerDisconnected(() => {
      bitchatService.getConnectedPeers().then(peers => setMeshPeerCount(peers.length));
    });

    const unsubBet = bettingService.onBetUpdate(() => {
      setStats(bettingService.getStats());
    });

    return () => {
      unsubPeer();
      unsubDisconnect();
      unsubBet();
    };
  }, [loadUserData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, [loadUserData]);

  const truncateAddress = (address: string) => {
    if (!address) return "Not connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "0";
    return amount.toFixed(0);
  };

  const displayStats = [
    { label: "Total Bets", value: stats.totalBets.toString(), icon: "dice" },
    { label: "Win Rate", value: stats.winRate > 0 ? `${stats.winRate.toFixed(0)}%` : "—", icon: "trending-up" },
    { label: "Total Won", value: stats.totalWon > 0 ? `${formatCurrency(stats.totalWon)}` : "—", icon: "trophy" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="PROFILE" />

      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
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
                backgroundColor: meshPeerCount > 0 ? Colors.green : meshEnabled ? Colors.yellow : Colors.mutedForeground,
                borderWidth: 4,
                borderColor: Colors.background,
              }}
            >
              <Ionicons name="radio" size={10} color="#fff" />
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
              backgroundColor: meshPeerCount > 0 
                ? `${Colors.green}15` 
                : meshEnabled 
                  ? `${Colors.yellow}15` 
                  : `${Colors.mutedForeground}15`,
              borderWidth: 1,
              borderColor: meshPeerCount > 0 
                ? `${Colors.green}30` 
                : meshEnabled 
                  ? `${Colors.yellow}30` 
                  : `${Colors.mutedForeground}30`,
            }}
          >
            <View
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: meshPeerCount > 0 
                  ? Colors.green 
                  : meshEnabled 
                    ? Colors.yellow 
                    : Colors.mutedForeground 
              }}
            />
            <Text
              className="text-xs font-medium"
              style={{ 
                color: meshPeerCount > 0 
                  ? Colors.green 
                  : meshEnabled 
                    ? Colors.yellow 
                    : Colors.mutedForeground 
              }}
            >
              {meshPeerCount > 0 
                ? `${meshPeerCount} Peer${meshPeerCount > 1 ? 's' : ''} Connected` 
                : meshEnabled 
                  ? "Mesh Enabled" 
                  : "Mesh Offline"}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          {displayStats.map((stat, index) => (
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

        <View className="mb-6">
          {[
            { icon: "time", label: "Betting History", route: "/(tabs)/wallet" },
            { icon: "settings", label: "Settings", route: "/settings" },
            { icon: "shield-checkmark", label: "Security & Backup", route: "/settings" },
            { icon: "help-circle", label: "Help & Support", route: "/settings" },
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
          MeshBet Live v0.2.0 (Beta)
        </Text>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
