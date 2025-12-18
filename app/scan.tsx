import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, Animated, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { bitchatService, BitchatPeer } from "@/lib/services/bitchat";

interface DisplayPeer extends BitchatPeer {
  strength: number;
}

export default function MeshScanScreen() {
  const [scanning, setScanning] = useState(true);
  const [peers, setPeers] = useState<DisplayPeer[]>([]);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const rotateRef = useRef<Animated.CompositeAnimation | null>(null);

  const convertRssiToStrength = (rssi?: number): number => {
    if (!rssi) return 70;
    const minRssi = -100;
    const maxRssi = -30;
    const strength = ((rssi - minRssi) / (maxRssi - minRssi)) * 100;
    return Math.min(100, Math.max(0, Math.round(strength)));
  };

  useEffect(() => {
    const startScan = async () => {
      if (!bitchatService.running) {
        await bitchatService.startServices('MeshBet_User');
      }
      await bitchatService.startDiscovery();
    };

    startScan();

    const unsubPeer = bitchatService.onPeerConnected((peer) => {
      const displayPeer: DisplayPeer = {
        ...peer,
        strength: convertRssiToStrength(peer.rssi),
      };
      setPeers((prev) => {
        if (prev.find(p => p.peerID === peer.peerID)) return prev;
        return [...prev, displayPeer];
      });
    });

    const unsubDisconnect = bitchatService.onPeerDisconnected((peer) => {
      setPeers((prev) => prev.filter(p => p.peerID !== peer.peerID));
    });

    const unsubStatus = bitchatService.onStatusChange((status) => {
      if (status === 'connected') {
        setTimeout(() => setScanning(false), 3000);
      }
    });

    const scanTimeout = setTimeout(() => setScanning(false), 8000);

    return () => {
      unsubPeer();
      unsubDisconnect();
      unsubStatus();
      clearTimeout(scanTimeout);
    };
  }, []);

  useEffect(() => {
    if (scanning) {
      pulseRef.current = Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      pulseRef.current.start();

      rotateRef.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );
      rotateRef.current.start();
    } else {
      pulseRef.current?.stop();
      rotateRef.current?.stop();
    }

    return () => {
      pulseRef.current?.stop();
      rotateRef.current?.stop();
    };
  }, [scanning]);

  const handleRescan = async () => {
    setPeers([]);
    setScanning(true);
    pulseAnim.setValue(0);
    rotateAnim.setValue(0);
    await bitchatService.startDiscovery();
    setTimeout(() => setScanning(false), 8000);
  };

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
        {Platform.OS === 'web' && (
          <View className="mx-4 mb-4 px-4 py-2 rounded-lg" style={{ backgroundColor: `${Colors.yellow}20` }}>
            <Text className="text-xs text-center" style={{ color: Colors.yellow }}>
              Web Preview Mode - Real Bluetooth requires native build
            </Text>
          </View>
        )}

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
            {scanning ? "Scanning..." : `Found ${peers.length} Peer${peers.length !== 1 ? 's' : ''}`}
          </Text>
          <Text className="text-sm mt-1" style={{ color: Colors.mutedForeground }}>
            {scanning
              ? "Discovering Bitchat mesh nodes nearby"
              : peers.length > 0 ? "Select a peer to connect" : "No peers found nearby"}
          </Text>
        </View>

        <View className="flex-1">
          {peers.map((peer) => (
            <Pressable
              key={peer.peerID}
              onPress={() => router.push(`/event/${peer.peerID}`)}
              className="flex-row items-center p-4 rounded-xl mb-3"
              style={{
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: `${getStrengthColor(peer.strength)}30`,
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
                <Text className="font-bold text-white">{peer.nickname}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                    {peer.peerID.slice(0, 12)}...
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
          ))}
        </View>

        {!scanning && (
          <Pressable
            onPress={handleRescan}
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
