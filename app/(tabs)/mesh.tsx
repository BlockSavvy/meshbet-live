import { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Pressable, Animated, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Header } from "@/components/layout/Header";
import { bitchatService, BitchatPeer } from "@/lib/services/bitchat";

interface DisplayPeer extends BitchatPeer {
  strength: number;
  angle: number;
  distance: number;
}

const RADAR_SIZE = 280;
const CENTER = RADAR_SIZE / 2;

export default function MeshTab() {
  const [scanning, setScanning] = useState(false);
  const [meshStatus, setMeshStatus] = useState<'disconnected' | 'connected' | 'scanning'>('disconnected');
  const [peers, setPeers] = useState<DisplayPeer[]>([]);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;
  const centerPulse = useRef(new Animated.Value(1)).current;
  const peerFadeAnims = useRef<Animated.Value[]>([]).current;

  const rotationRef = useRef<Animated.CompositeAnimation | null>(null);
  const ring1Ref = useRef<Animated.CompositeAnimation | null>(null);
  const ring2Ref = useRef<Animated.CompositeAnimation | null>(null);
  const ring3Ref = useRef<Animated.CompositeAnimation | null>(null);
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  const convertRssiToStrength = (rssi?: number): number => {
    if (!rssi) return 70;
    const minRssi = -100;
    const maxRssi = -30;
    const strength = ((rssi - minRssi) / (maxRssi - minRssi)) * 100;
    return Math.min(100, Math.max(0, Math.round(strength)));
  };

  const getRandomAngle = () => Math.random() * 360;
  const getDistanceFromStrength = (strength: number) => 0.3 + (1 - strength / 100) * 0.5;

  useEffect(() => {
    const loadExistingPeers = async () => {
      await bitchatService.hydratePeers();
      const existingPeers = bitchatService.connectedPeers;
      if (existingPeers.length > 0) {
        const displayPeers = existingPeers.map(peer => ({
          ...peer,
          strength: convertRssiToStrength(peer.rssi),
          angle: getRandomAngle(),
          distance: getDistanceFromStrength(convertRssiToStrength(peer.rssi)),
        }));
        setPeers(displayPeers);
        setMeshStatus('connected');
      }
    };
    loadExistingPeers();

    const unsubPeerConnected = bitchatService.onPeerConnected((peer) => {
      const strength = convertRssiToStrength(peer.rssi);
      const displayPeer: DisplayPeer = {
        ...peer,
        strength,
        angle: getRandomAngle(),
        distance: getDistanceFromStrength(strength),
      };

      setPeers((prev) => {
        if (prev.find(p => p.peerID === peer.peerID)) return prev;
        const newPeers = [...prev, displayPeer];
        
        while (peerFadeAnims.length < newPeers.length) {
          peerFadeAnims.push(new Animated.Value(0));
        }
        
        Animated.timing(peerFadeAnims[newPeers.length - 1], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        
        return newPeers;
      });
    });

    const unsubPeerDisconnected = bitchatService.onPeerDisconnected((peer) => {
      setPeers((prev) => prev.filter(p => p.peerID !== peer.peerID));
    });

    const unsubStatus = bitchatService.onStatusChange((status) => {
      setMeshStatus(status);
      if (status === 'connected') {
        setScanning(false);
        stopAnimations();
      }
    });

    return () => {
      unsubPeerConnected();
      unsubPeerDisconnected();
      unsubStatus();
    };
  }, []);

  const stopAnimations = () => {
    rotationRef.current?.stop();
    ring1Ref.current?.stop();
    ring2Ref.current?.stop();
    ring3Ref.current?.stop();
    pulseRef.current?.stop();
  };

  const startScan = async () => {
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

    if (!bitchatService.running) {
      await bitchatService.startServices('MeshBet_User');
    }
    await bitchatService.startDiscovery();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getRingStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 0.3, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
  });

  const getPeerPosition = (peer: DisplayPeer) => {
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

  const getStatusText = () => {
    if (scanning) return "Scanning for peers...";
    if (meshStatus === 'connected' && peers.length > 0) return `Connected to ${peers.length} peer${peers.length > 1 ? 's' : ''}`;
    if (meshStatus === 'connected') return "Mesh active - no peers nearby";
    return "Mesh Scanner";
  };

  const getSubtitleText = () => {
    if (scanning) return "Finding nearby Bitchat nodes";
    if (meshStatus === 'connected') return "Real-time peer discovery active";
    return "Discover nearby mesh networks";
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="MESH NETWORK" />

      <ScrollView className="flex-1 px-6">
        <View className="items-center py-6">
          {Platform.OS === 'web' && (
            <View className="mb-4 px-4 py-2 rounded-lg" style={{ backgroundColor: `${Colors.yellow}20` }}>
              <Text className="text-xs text-center" style={{ color: Colors.yellow }}>
                Web Preview Mode - Real Bluetooth requires native build
              </Text>
            </View>
          )}

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
                backgroundColor: meshStatus === 'connected' ? Colors.green : Colors.primary,
                transform: [{ scale: scanning ? centerPulse : 1 }],
                shadowColor: meshStatus === 'connected' ? Colors.green : Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
              }}
            />

            {peers.map((peer, index) => (
              <Animated.View
                key={peer.peerID}
                style={{
                  position: "absolute",
                  ...getPeerPosition(peer),
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: Colors.secondary,
                  opacity: peerFadeAnims[index] || new Animated.Value(1),
                  shadowColor: Colors.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                }}
              />
            ))}
          </View>

          <Text className="text-lg font-bold mt-4" style={{ color: Colors.foreground }}>
            {getStatusText()}
          </Text>
          <Text className="text-sm mt-1" style={{ color: Colors.mutedForeground }}>
            {getSubtitleText()}
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
                key={peer.peerID}
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
                        {peer.nickname}
                      </Text>
                      <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                        {peer.peerID.slice(0, 12)}...
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
