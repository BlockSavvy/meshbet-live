import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";

interface Peer {
  id: string;
  name: string;
  strength: number;
  users: number;
}

export default function MeshScanScreen() {
  const [scanning, setScanning] = useState(true);
  const [peers, setPeers] = useState<Peer[]>([]);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [scanning]);

  useEffect(() => {
    const timeouts = [
      setTimeout(
        () =>
          setPeers((p) => [
            ...p,
            { id: "Node_A7x", strength: 90, name: "Bar 2049 Main", users: 42 },
          ]),
        1500
      ),
      setTimeout(
        () =>
          setPeers((p) => [
            ...p,
            { id: "Node_B9y", strength: 65, name: "Mike's Tailgate", users: 12 },
          ]),
        2500
      ),
      setTimeout(
        () =>
          setPeers((p) => [
            ...p,
            { id: "Node_C2z", strength: 40, name: "Underground FC", users: 156 },
          ]),
        4000
      ),
      setTimeout(() => setScanning(false), 5000),
    ];
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getStrengthColor = (strength: number) => {
    if (strength > 70) return Colors.green;
    if (strength > 40) return Colors.yellow;
    return "#ef4444";
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="MESH SCANNER" showBack />

      <View className="flex-1 px-6">
        <View className="items-center py-10">
          <View className="w-64 h-64 items-center justify-center">
            <View
              className="absolute w-64 h-64 rounded-full"
              style={{
                borderWidth: 1,
                borderColor: `${Colors.primary}30`,
              }}
            />
            <View
              className="absolute w-48 h-48 rounded-full"
              style={{
                borderWidth: 1,
                borderColor: `${Colors.primary}20`,
              }}
            />
            <View
              className="absolute w-32 h-32 rounded-full"
              style={{
                borderWidth: 1,
                borderColor: `${Colors.primary}10`,
              }}
            />

            {scanning && (
              <Animated.View
                className="absolute w-64 h-64 rounded-full"
                style={{
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                }}
              />
            )}

            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{
                backgroundColor: `${Colors.primary}20`,
                borderWidth: 1,
                borderColor: Colors.primary,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
              }}
            >
              <Ionicons
                name="wifi"
                size={32}
                color={Colors.primary}
              />
            </View>

            {scanning && (
              <Animated.View
                className="absolute w-64 h-32"
                style={{
                  transform: [{ rotate: spin }],
                }}
              >
                <View
                  className="w-full h-1"
                  style={{
                    backgroundColor: `${Colors.primary}40`,
                  }}
                />
              </Animated.View>
            )}
          </View>
        </View>

        <View className="items-center mb-8">
          <Text className="text-xl font-bold text-white">
            {scanning ? "Scanning..." : `Found ${peers.length} Peers`}
          </Text>
          <Text className="text-sm mt-1" style={{ color: Colors.mutedForeground }}>
            {scanning
              ? "Discovering Bitchat mesh nodes nearby"
              : "Select a room to join"}
          </Text>
        </View>

        <View className="flex-1">
          {peers.map((peer, index) => (
            <Animated.View
              key={peer.id}
              style={{
                opacity: 1,
                transform: [{ translateY: 0 }],
              }}
            >
              <Pressable
                onPress={() => router.push(`/event/${index + 1}`)}
                className="flex-row items-center p-4 rounded-xl mb-3"
                style={{
                  backgroundColor: Colors.card,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: `${getStrengthColor(peer.strength)}20`,
                  }}
                >
                  <Ionicons
                    name="radio"
                    size={20}
                    color={getStrengthColor(peer.strength)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-white">{peer.name}</Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Ionicons name="people" size={12} color={Colors.mutedForeground} />
                    <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                      {peer.users} users
                    </Text>
                    <Text style={{ color: Colors.mutedForeground }}>•</Text>
                    <Text
                      className="text-xs"
                      style={{ color: getStrengthColor(peer.strength) }}
                    >
                      {peer.strength}% signal
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {!scanning && (
          <Pressable
            onPress={() => {
              setPeers([]);
              setScanning(true);
            }}
            className="h-14 rounded-xl items-center justify-center mb-6"
            style={{
              backgroundColor: Colors.primary,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 15,
            }}
          >
            <Text className="font-bold text-lg" style={{ color: Colors.primaryForeground }}>
              Scan Again
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
