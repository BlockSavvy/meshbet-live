import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Header } from "@/components/layout/Header";

interface Peer {
  id: string;
  strength: number;
  name: string;
  users: number;
}

export default function MeshTab() {
  const [scanning, setScanning] = useState(false);
  const [peers, setPeers] = useState<Peer[]>([]);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const startScan = () => {
    setScanning(true);
    setPeers([]);
    
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    const timeouts = [
      setTimeout(
        () => setPeers((p) => [...p, { id: "Node_A7x", strength: 90, name: "Bar 2049 Main", users: 42 }]),
        1500
      ),
      setTimeout(
        () => setPeers((p) => [...p, { id: "Node_B9y", strength: 65, name: "Mike's Tailgate", users: 12 }]),
        2500
      ),
      setTimeout(
        () => setPeers((p) => [...p, { id: "Node_C2z", strength: 40, name: "Underground FC", users: 156 }]),
        4000
      ),
      setTimeout(() => setScanning(false), 5000),
    ];
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  const getStrengthColor = (strength: number) => {
    if (strength > 70) return Colors.green;
    if (strength > 40) return Colors.yellow;
    return "#ef4444";
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="MESH NETWORK" />

      <ScrollView className="flex-1 px-6">
        <View className="items-center py-8">
          <View className="w-40 h-40 items-center justify-center">
            {scanning && (
              <Animated.View
                className="absolute w-40 h-40 rounded-full"
                style={{
                  backgroundColor: Colors.primary,
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                }}
              />
            )}
            <View
              className="w-32 h-32 rounded-full items-center justify-center"
              style={{
                backgroundColor: `${Colors.primary}20`,
                borderWidth: 2,
                borderColor: scanning ? Colors.primary : `${Colors.primary}50`,
              }}
            >
              <Ionicons
                name="radio"
                size={48}
                color={scanning ? Colors.primary : `${Colors.primary}80`}
              />
            </View>
          </View>

          <Text className="text-lg font-bold mt-4" style={{ color: Colors.foreground }}>
            {scanning ? "Scanning for peers..." : "Mesh Scanner"}
          </Text>
          <Text className="text-sm mt-1" style={{ color: Colors.mutedForeground }}>
            {scanning ? "Finding nearby Bitchat nodes" : "Discover nearby mesh networks"}
          </Text>

          {!scanning && (
            <Pressable
              onPress={startScan}
              className="mt-6 px-8 py-3 rounded-xl"
              style={{ backgroundColor: Colors.primary }}
            >
              <Text className="font-bold" style={{ color: Colors.primaryForeground }}>
                Start Scan
              </Text>
            </Pressable>
          )}
        </View>

        {peers.length > 0 && (
          <View className="mt-4">
            <Text className="text-sm font-bold mb-3" style={{ color: Colors.foreground }}>
              NEARBY NODES ({peers.length})
            </Text>
            {peers.map((peer) => (
              <Pressable
                key={peer.id}
                className="p-4 rounded-xl mb-3"
                style={{
                  backgroundColor: `${Colors.card}`,
                  borderWidth: 1,
                  borderColor: `${getStrengthColor(peer.strength)}30`,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${getStrengthColor(peer.strength)}20` }}
                    >
                      <Ionicons name="radio" size={20} color={getStrengthColor(peer.strength)} />
                    </View>
                    <View>
                      <Text className="font-bold" style={{ color: Colors.foreground }}>
                        {peer.name}
                      </Text>
                      <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                        {peer.id} • {peer.users} users
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold" style={{ color: getStrengthColor(peer.strength) }}>
                      {peer.strength}%
                    </Text>
                    <Text className="text-xs" style={{ color: Colors.mutedForeground }}>signal</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
