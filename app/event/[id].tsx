import { useState, useEffect, useCallback } from "react";
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
import { bitchatService, BitchatMessage } from "@/lib/services/bitchat";
import { bettingService, Bet } from "@/lib/services/betting";
import { sportsDataService, SportEvent } from "@/lib/services/sportsData";
import { streamingService, StreamMetadata } from "@/lib/services/streaming";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isSelf: boolean;
}

export default function EventRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"chat" | "bets" | "stats">("chat");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [peerCount, setPeerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeStreams, setActiveStreams] = useState<StreamMetadata[]>([]);

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const loadEventData = useCallback(async () => {
    try {
      const events = await sportsDataService.getUpcomingEvents('upcoming');
      const matchedEvent = events.find(e => e.id === id);
      if (matchedEvent) {
        setEvent(matchedEvent);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    }
  }, [id]);

  const loadBets = useCallback(() => {
    const allBets = bettingService.getAllBets();
    const eventBets = id ? allBets.filter(b => b.eventId === id) : allBets.slice(0, 10);
    setBets(eventBets);
  }, [id]);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await loadEventData();
      loadBets();
      
      if (!bitchatService.running) {
        await bitchatService.startServices('MeshBet_User');
      }
      
      await bitchatService.hydratePeers();
      setPeerCount(bitchatService.connectedPeers.length);
      const allStreams = streamingService.getActiveStreams();
      const eventStreams = allStreams.filter(s => s.eventId === id || s.eventId === 'general');
      setActiveStreams(eventStreams);
      setLoading(false);
    };

    initialize();

    const unsubStreams = streamingService.onStreamUpdate((streams) => {
      const eventStreams = streams.filter(s => s.eventId === id || s.eventId === 'general');
      setActiveStreams(eventStreams);
    });

    const unsubMessage = bitchatService.onMessage((msg: BitchatMessage) => {
      const chatMsg: ChatMessage = {
        id: msg.id,
        user: msg.senderNickname || msg.sender.slice(0, 8),
        text: msg.content,
        time: formatTimeAgo(msg.timestamp),
        isSelf: msg.sender === 'self',
      };
      setMessages((prev) => [...prev, chatMsg]);
    });

    const unsubBet = bettingService.onBetUpdate((bet) => {
      if (!id || bet.eventId === id) {
        setBets((prev) => {
          const existing = prev.findIndex(b => b.id === bet.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = bet;
            return updated;
          }
          return [...prev, bet];
        });
      }
    });

    const unsubPeerConnect = bitchatService.onPeerConnected(() => {
      setPeerCount(bitchatService.connectedPeers.length);
    });

    const unsubPeerDisconnect = bitchatService.onPeerDisconnected(() => {
      setPeerCount(bitchatService.connectedPeers.length);
    });

    return () => {
      unsubMessage();
      unsubBet();
      unsubPeerConnect();
      unsubPeerDisconnect();
      unsubStreams();
    };
  }, [id, loadEventData, loadBets]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const success = await bitchatService.sendMessage(message.trim(), '#general');
    
    if (success) {
      setMessage("");
    }
  };

  const acceptBet = async (bet: Bet) => {
    try {
      await bettingService.acceptBet(bet.id);
    } catch (error) {
      console.error('Failed to accept bet:', error);
    }
  };

  const getEventTitle = () => {
    if (event) {
      return `${event.homeTeam} vs ${event.awayTeam}`;
    }
    return "Event Room";
  };

  const getEventSubtitle = () => {
    if (event) {
      return event.sportTitle;
    }
    return "Live Event";
  };

  const getTotalPool = () => {
    const total = bets.reduce((sum, bet) => sum + bet.amount, 0);
    return `$${total.toLocaleString()}`;
  };

  const getOddsDisplay = (bet: Bet) => {
    return sportsDataService.formatOdds(bet.odds);
  };

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
        <Text className="text-lg font-bold text-white" numberOfLines={1}>
          {event?.sportTitle || "Event Room"}
        </Text>
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
          <View className="absolute inset-0 bg-black/50" />
          
          {activeStreams.length > 0 ? (
            <View className="items-center">
              <View className="flex-row items-center mb-2">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <Text className="text-white font-bold">LIVE STREAM AVAILABLE</Text>
              </View>
              <Pressable
                onPress={() => router.push(`/stream/${activeStreams[0].streamId}`)}
                className="px-6 py-3 rounded-xl flex-row items-center gap-2"
                style={{ backgroundColor: Colors.secondary }}
              >
                <Ionicons name="play" size={20} color={Colors.secondaryForeground} />
                <Text className="font-bold" style={{ color: Colors.secondaryForeground }}>
                  Watch Stream
                </Text>
              </Pressable>
              <Text className="text-xs mt-2" style={{ color: Colors.mutedForeground }}>
                {activeStreams[0].viewerCount} watching • {activeStreams[0].hostNickname}
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <Ionicons name="radio-outline" size={48} color="rgba(255,255,255,0.6)" />
              <Text className="text-white font-bold mt-2">No Active Streams</Text>
              <Pressable
                onPress={() => router.push('/host-stream')}
                className="mt-3 px-6 py-3 rounded-xl flex-row items-center gap-2"
                style={{ backgroundColor: Colors.primary }}
              >
                <Ionicons name="radio" size={20} color={Colors.primaryForeground} />
                <Text className="font-bold" style={{ color: Colors.primaryForeground }}>
                  Start Streaming
                </Text>
              </Pressable>
            </View>
          )}

          <View
            className="absolute bottom-3 right-3 flex-row items-center px-2 py-1 rounded"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            <Text className="text-xs text-white font-mono">{peerCount} peers connected</Text>
          </View>
          
          <View
            className="absolute bottom-3 left-3 flex-row items-center px-2 py-1 rounded"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <Ionicons name="radio" size={12} color={activeStreams.length > 0 ? Colors.secondary : Colors.mutedForeground} />
            <Text className="text-xs ml-1" style={{ color: activeStreams.length > 0 ? Colors.secondary : Colors.mutedForeground }}>
              {activeStreams.length} stream{activeStreams.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-4 mb-2 flex-row justify-between items-center">
        <View className="flex-1 mr-4">
          <Text className="text-xl font-bold text-white" numberOfLines={1}>
            {getEventTitle()}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-xs font-mono" style={{ color: Colors.primary }}>
              {getEventSubtitle()}
            </Text>
            {event && (
              <>
                <Text style={{ color: Colors.mutedForeground }}>•</Text>
                <Text className="text-xs" style={{ color: Colors.green }}>
                  {sportsDataService.formatTime(event.commenceTime)}
                </Text>
              </>
            )}
            <Text style={{ color: Colors.mutedForeground }}>•</Text>
            <View className="flex-row items-center">
              <Ionicons name="flash" size={10} color={Colors.secondary} />
              <Text className="text-xs ml-1" style={{ color: Colors.secondary }}>
                P2P MESH
              </Text>
            </View>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
            Pool Value
          </Text>
          <Text className="font-mono font-bold text-lg" style={{ color: Colors.green }}>
            {getTotalPool()}
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
                {messages.length === 0 ? (
                  <View className="flex-1 items-center justify-center py-10">
                    <Ionicons name="chatbubbles-outline" size={48} color={Colors.mutedForeground} />
                    <Text className="text-white font-bold mt-4">No Messages Yet</Text>
                    <Text className="text-center mt-2" style={{ color: Colors.mutedForeground }}>
                      Start chatting with peers in this event room
                    </Text>
                  </View>
                ) : (
                  messages.map((msg) => (
                    <View key={msg.id} className="mb-3">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text 
                          className="font-bold text-sm" 
                          style={{ color: msg.isSelf ? Colors.secondary : Colors.primary }}
                        >
                          {msg.isSelf ? 'You' : msg.user}
                        </Text>
                        <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                          {msg.time}
                        </Text>
                      </View>
                      <Text className="text-white">{msg.text}</Text>
                    </View>
                  ))
                )}
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
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                />
                <Pressable
                  onPress={sendMessage}
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
                {bets.length === 0 ? (
                  <View className="flex-1 items-center justify-center py-10">
                    <Ionicons name="trophy-outline" size={48} color={Colors.mutedForeground} />
                    <Text className="text-white font-bold mt-4">No Bets Yet</Text>
                    <Text className="text-center mt-2" style={{ color: Colors.mutedForeground }}>
                      Create the first bet for this event
                    </Text>
                  </View>
                ) : (
                  bets.map((bet) => (
                    <View
                      key={bet.id}
                      className="p-4 rounded-xl mb-3"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.3)",
                        borderWidth: 1,
                        borderColor: bet.status === 'open' ? `${Colors.primary}30` : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-1">
                          <Text className="font-bold text-white">{bet.proposition}</Text>
                          <Text className="text-xs mt-1" style={{ color: Colors.mutedForeground }}>
                            by {bet.creator.nickname} • ${bet.amount}
                          </Text>
                        </View>
                        <View 
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: bet.status === 'open' ? `${Colors.green}20` : `${Colors.mutedForeground}20` }}
                        >
                          <Text className="text-xs font-bold uppercase" style={{ 
                            color: bet.status === 'open' ? Colors.green : Colors.mutedForeground 
                          }}>
                            {bet.status}
                          </Text>
                        </View>
                      </View>
                      
                      {bet.status === 'open' && bet.creator.peerId !== bitchatService.localPeerId && (
                        <Pressable
                          onPress={() => acceptBet(bet)}
                          className="py-2 rounded-lg items-center mt-2"
                          style={{ backgroundColor: Colors.primary }}
                        >
                          <Text className="font-bold" style={{ color: Colors.primaryForeground }}>
                            Accept @ {getOddsDisplay(bet)}
                          </Text>
                        </Pressable>
                      )}
                      
                      {bet.status === 'open' && bet.creator.peerId === bitchatService.localPeerId && (
                        <View className="py-2 rounded-lg items-center mt-2" style={{ backgroundColor: `${Colors.secondary}20` }}>
                          <Text className="font-bold" style={{ color: Colors.secondary }}>
                            Your Bet @ {getOddsDisplay(bet)}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
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
            <View className="flex-1 px-4 py-6">
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: `${Colors.primary}10` }}>
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Active Bets</Text>
                  <Text className="text-2xl font-bold" style={{ color: Colors.primary }}>
                    {bets.filter(b => b.status === 'open' || b.status === 'accepted').length}
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: `${Colors.secondary}10` }}>
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Peers</Text>
                  <Text className="text-2xl font-bold" style={{ color: Colors.secondary }}>
                    {peerCount}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: `${Colors.green}10` }}>
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Total Pool</Text>
                  <Text className="text-2xl font-bold" style={{ color: Colors.green }}>
                    {getTotalPool()}
                  </Text>
                </View>
                <View className="flex-1 p-4 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Messages</Text>
                  <Text className="text-2xl font-bold text-white">
                    {messages.length}
                  </Text>
                </View>
              </View>

              {event && (
                <View className="p-4 rounded-xl" style={{ backgroundColor: Colors.card }}>
                  <Text className="font-bold text-white mb-2">Event Details</Text>
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text style={{ color: Colors.mutedForeground }}>Sport</Text>
                      <Text className="text-white">{event.sportTitle}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text style={{ color: Colors.mutedForeground }}>Start Time</Text>
                      <Text className="text-white">{sportsDataService.formatTime(event.commenceTime)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text style={{ color: Colors.mutedForeground }}>Status</Text>
                      <Text style={{ color: Colors.green }}>Active</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
