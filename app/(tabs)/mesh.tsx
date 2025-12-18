import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Header } from "@/components/layout/Header";

interface Peer {
  id: string;
  strength: number;
  name: string;
  users: number;
  angle: number;
  distance: number;
}

const RADAR_SIZE = 280;
const CENTER = RADAR_SIZE / 2;

export default function MeshTab() {
  const [scanning, setScanning] = useState(false);
  const [peers, setPeers] = useState<Peer[]>([]);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;
  const centerPulse = useRef(new Animated.Value(1)).current;
  const peerFadeAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const rotationRef = useRef<Animated.CompositeAnimation | null>(null);
  const ring1Ref = useRef<Animated.CompositeAnimation | null>(null);
  const ring2Ref = useRef<Animated.CompositeAnimation | null>(null);
  const ring3Ref = useRef<Animated.CompositeAnimation | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const stopAnimations = () => {
    rotationRef.current?.stop();
    ring1Ref.current?.stop();
    ring2Ref.current?.stop();
    ring3Ref.current?.stop();
    pulseRef.current?.stop();
  };

  const startScan = () => {
    setScanning(true);
    setPeers([]);
    peerFadeAnims.forEach(anim => anim.setValue(0));
    rotateAnim.setValue(0);

    rotationRef.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    rotationRef.current.start();

    ring1Ref.current = Animated.loop(
      Animated.sequence([
        Animated.timing(ring1Anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(ring1Anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    ring1Ref.current.start();

    ring2Ref.current = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(ring2Anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(ring2Anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    ring2Ref.current.start();

    ring3Ref.current = Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(ring3Anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(ring3Anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    ring3Ref.current.start();

    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(centerPulse, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(centerPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();

    const mockPeers: Peer[] = [
      { id: "Node_A7x", strength: 90, name: "Bar 2049 Main", users: 42, angle: 45, distance: 0.4 },
      { id: "Node_B9y", strength: 65, name: "Mike's Tailgate", users: 12, angle: 160, distance: 0.6 },
      { id: "Node_C2z", strength: 40, name: "Underground FC", users: 156, angle: 280, distance: 0.8 },
    ];

    setTimeout(() => {
      setPeers([mockPeers[0]]);
      Animated.timing(peerFadeAnims[0], { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 1500);

    setTimeout(() => {
      setPeers((p) => [...p, mockPeers[1]]);
      Animated.timing(peerFadeAnims[1], { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 2500);

    setTimeout(() => {
      setPeers((p) => [...p, mockPeers[2]]);
      Animated.timing(peerFadeAnims[2], { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 4000);

    setTimeout(() => {
      stopAnimations();
      setScanning(false);
    }, 6000);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getRingStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.3, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
  });

  const getPeerPosition = (peer: Peer) => {
    const radians = (peer.angle * Math.PI) / 180;
    const maxRadius = CENTER - 30;
    const radius = peer.distance * maxRadius;
    return {
      left: CENTER + Math.cos(radians) * radius - 8,
      top: CENTER + Math.sin(radians) * radius - 8,
    };
  };

  const getStrengthColor = (strength: number) => {
    if (strength > 70) return Colors.green;
    if (strength > 40) return Colors.yellow;
    return "#ef4444";
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="MESH NETWORK" />

      <ScrollView className="flex-1 px-6">
        <View className="items-center py-6">
          <View style={{ width: RADAR_SIZE, height: RADAR_SIZE, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                position: "absolute",
                width: RADAR_SIZE,
                height: RADAR_SIZE,
                borderRadius: RADAR_SIZE / 2,
                borderWidth: 1,
                borderColor: `${Colors.primary}30`,
              }}
            />
            <View
              style={{
                position: "absolute",
                width: RADAR_SIZE * 0.66,
                height: RADAR_SIZE * 0.66,
                borderRadius: RADAR_SIZE * 0.33,
                borderWidth: 1,
                borderColor: `${Colors.primary}30`,
              }}
            />
            <View
              style={{
                position: "absolute",
                width: RADAR_SIZE * 0.33,
                height: RADAR_SIZE * 0.33,
                borderRadius: RADAR_SIZE * 0.165,
                borderWidth: 1,
                borderColor: `${Colors.primary}30`,
              }}
            />

            {scanning && (
              <>
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      width: RADAR_SIZE,
                      height: RADAR_SIZE,
                      borderRadius: RADAR_SIZE / 2,
                      borderWidth: 2,
                      borderColor: Colors.primary,
                    },
                    getRingStyle(ring1Anim),
                  ]}
                />
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      width: RADAR_SIZE,
                      height: RADAR_SIZE,
                      borderRadius: RADAR_SIZE / 2,
                      borderWidth: 2,
                      borderColor: Colors.primary,
                    },
                    getRingStyle(ring2Anim),
                  ]}
                />
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      width: RADAR_SIZE,
                      height: RADAR_SIZE,
                      borderRadius: RADAR_SIZE / 2,
                      borderWidth: 2,
                      borderColor: Colors.primary,
                    },
                    getRingStyle(ring3Anim),
                  ]}
                />

                <Animated.View
                  style={{
                    position: "absolute",
                    width: RADAR_SIZE,
                    height: RADAR_SIZE,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    transform: [{ rotate: spin }],
                  }}
                >
                  <View
                    style={{
                      width: 2,
                      height: CENTER,
                      backgroundColor: Colors.primary,
                      opacity: 0.8,
                    }}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: "absolute",
                    width: RADAR_SIZE,
                    height: RADAR_SIZE,
                    transform: [{ rotate: spin }],
                    overflow: "hidden",
                    borderRadius: RADAR_SIZE / 2,
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: CENTER,
                      width: CENTER,
                      height: CENTER,
                      backgroundColor: `${Colors.primary}15`,
                      borderTopRightRadius: CENTER,
                    }}
                  />
                </Animated.View>
              </>
            )}

            <Animated.View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: Colors.primary,
                transform: [{ scale: scanning ? centerPulse : 1 }],
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
              }}
            />

            {peers.map((peer, index) => (
              <Animated.View
                key={peer.id}
                style={{
                  position: "absolute",
                  ...getPeerPosition(peer),
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: Colors.secondary,
                  opacity: peerFadeAnims[index],
                  shadowColor: Colors.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                }}
              />
            ))}
          </View>

          <Text className="text-lg font-bold mt-4" style={{ color: Colors.foreground }}>
            {scanning ? "Scanning for peers..." : "Mesh Scanner"}
          </Text>
          <Text className="text-sm mt-1" style={{ color: Colors.mutedForeground }}>
            {scanning ? "Finding nearby Bitchat nodes" : "Discover nearby mesh networks"}
          </Text>

          {!scanning && peers.length === 0 && (
            <Pressable
              onPress={startScan}
              className="mt-6 px-8 py-3 rounded-xl"
              style={{
                backgroundColor: Colors.primary,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 15,
              }}
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
                  backgroundColor: Colors.card,
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
