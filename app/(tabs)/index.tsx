import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, ScrollView, Pressable, RefreshControl } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Header } from "@/components/layout/Header";
import { bettingService, Bet } from "@/lib/services/betting";
import { bitchatService, BitchatPeer } from "@/lib/services/bitchat";
import { sportsDataService, SportEvent } from "@/lib/services/sportsData";

export default function HomeScreen() {
  const [openBets, setOpenBets] = useState<Bet[]>([]);
  const [meshPeers, setMeshPeers] = useState<BitchatPeer[]>([]);
  const [liveEvents, setLiveEvents] = useState<SportEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    await bettingService.initialize();
    setOpenBets(bettingService.getOpenBets());
    
    const peers = await bitchatService.getConnectedPeers();
    setMeshPeers(peers);

    const events = await sportsDataService.getUpcomingEvents('upcoming');
    setLiveEvents(events.slice(0, 3));
  }, []);

  useEffect(() => {
    loadData();

    const unsubBet = bettingService.onBetUpdate(() => {
      setOpenBets(bettingService.getOpenBets());
    });

    const unsubPeer = bitchatService.onPeerConnected((peer) => {
      setMeshPeers(prev => [...prev.filter(p => p.peerID !== peer.peerID), peer]);
    });

    const unsubPeerDisconnect = bitchatService.onPeerDisconnected((peer) => {
      setMeshPeers(prev => prev.filter(p => p.peerID !== peer.peerID));
    });

    return () => {
      unsubBet();
      unsubPeer();
      unsubPeerDisconnect();
    };
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'SAT') return `${amount} sats`;
    if (currency === 'ETH') return `${amount} ETH`;
    return `$${amount}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="LOBBY" />

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
        <View
          className="flex-row items-center h-12 rounded-xl px-3 mt-4 mb-6"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Ionicons name="search" size={18} color={Colors.mutedForeground} />
          <TextInput
            placeholder="Find events, fighters, bets..."
            placeholderTextColor={Colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-sm"
            style={{ color: Colors.foreground }}
          />
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: Colors.mutedForeground }}
            >
              Mesh Network
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/mesh")}>
              <Text className="text-xs" style={{ color: Colors.primary }}>
                Scan →
              </Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            <Pressable
              onPress={() => router.push("/(tabs)/mesh")}
              className="w-36 h-24 rounded-xl items-center justify-center mr-3"
              style={{
                backgroundColor: `${Colors.primary}15`,
                borderWidth: 1,
                borderColor: `${Colors.primary}50`,
              }}
            >
              <Ionicons name="radio" size={24} color={Colors.primary} />
              <Text className="text-xs font-bold mt-2" style={{ color: Colors.primary }}>
                Find Peers
              </Text>
            </Pressable>

            {meshPeers.length === 0 ? (
              <View
                className="w-36 h-24 rounded-xl p-3 justify-center items-center mr-3"
                style={{
                  backgroundColor: Colors.card,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <Text className="text-xs text-center" style={{ color: Colors.mutedForeground }}>
                  No peers found.{"\n"}Start scanning!
                </Text>
              </View>
            ) : (
              meshPeers.map((peer) => (
                <Pressable
                  key={peer.peerID}
                  className="w-36 h-24 rounded-xl p-3 justify-between mr-3"
                  style={{
                    backgroundColor: Colors.card,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-bold text-white" numberOfLines={1}>
                      {peer.nickname}
                    </Text>
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: Colors.green }}
                    />
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="bluetooth" size={12} color={Colors.mutedForeground} />
                    <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                      {peer.peerID.slice(-6)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {openBets.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: Colors.mutedForeground }}
              >
                Open Bets ({openBets.length})
              </Text>
            </View>

            {openBets.slice(0, 3).map((bet) => (
              <Pressable
                key={bet.id}
                className="rounded-xl p-4 mb-3"
                style={{
                  backgroundColor: Colors.card,
                  borderWidth: 1,
                  borderColor: `${Colors.secondary}30`,
                }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-white">{bet.eventName}</Text>
                    <Text className="text-xs mt-1" style={{ color: Colors.mutedForeground }}>
                      {bet.creatorSelection}
                    </Text>
                  </View>
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: `${Colors.secondary}20` }}
                  >
                    <Text className="text-xs font-bold" style={{ color: Colors.secondary }}>
                      OPEN
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                    by {bet.creator.nickname}
                  </Text>
                  <Text className="font-mono font-bold" style={{ color: Colors.green }}>
                    {formatAmount(bet.amount, bet.currency)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: Colors.mutedForeground }}
            >
              Upcoming Events
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/events")}>
              <Text className="text-xs" style={{ color: Colors.primary }}>
                See All →
              </Text>
            </Pressable>
          </View>

          {liveEvents.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => router.push(`/event/${event.id}`)}
              className="rounded-xl p-4 mb-3"
              style={{
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">{event.homeTeam}</Text>
                  <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                    vs {event.awayTeam}
                  </Text>
                </View>
                <View
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: `${Colors.primary}20` }}
                >
                  <Text className="text-xs font-bold" style={{ color: Colors.primary }}>
                    {sportsDataService.formatTime(event.commenceTime)}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                  {event.sportTitle}
                </Text>
                <Pressable
                  onPress={() => router.push('/create-bet')}
                  className="px-3 py-1 rounded"
                  style={{ backgroundColor: `${Colors.primary}30` }}
                >
                  <Text className="text-xs font-bold" style={{ color: Colors.primary }}>
                    CREATE BET
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))}

          {liveEvents.length === 0 && (
            <View
              className="rounded-xl p-6 items-center"
              style={{ backgroundColor: Colors.card }}
            >
              <Ionicons name="calendar-outline" size={32} color={Colors.mutedForeground} />
              <Text className="text-sm mt-2" style={{ color: Colors.mutedForeground }}>
                No upcoming events
              </Text>
            </View>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
