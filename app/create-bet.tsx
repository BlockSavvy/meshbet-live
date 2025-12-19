import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { bettingService } from "@/lib/services/betting";
import { sportsDataService, SportEvent } from "@/lib/services/sportsData";
import ConfettiCannon from 'react-native-confetti-cannon';

export default function CreateBetScreen() {
  const params = useLocalSearchParams<{ eventId?: string }>();
  const confettiRef = useRef<any>(null);
  const [step, setStep] = useState(1);
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);
  const [yourSelection, setYourSelection] = useState("");
  const [opponentSelection, setOpponentSelection] = useState("");
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState<'SAT' | 'ETH' | 'USDC'>('SAT');
  const [odds, setOdds] = useState(2.0);
  const [broadcasting, setBroadcasting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      const data = await sportsDataService.getUpcomingEvents('upcoming');
      setEvents(data);
      
      if (params.eventId) {
        const event = data.find(e => e.id === params.eventId);
        if (event) {
          setSelectedEvent(event);
          setYourSelection(event.homeTeam);
          setOpponentSelection(event.awayTeam);
        }
      }
    };
    loadEvents();
  }, [params.eventId]);

  const handleCreate = async () => {
    if (!selectedEvent) return;

    setBroadcasting(true);
    
    const bet = await bettingService.createBet({
      eventId: selectedEvent.id,
      eventName: `${selectedEvent.homeTeam} vs ${selectedEvent.awayTeam}`,
      sport: selectedEvent.sport,
      selection: yourSelection,
      opponentSelection,
      amount,
      currency,
      odds,
    });

    setBroadcasting(false);
    
    if (bet) {
      setShowConfetti(true);
      setStep(3);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const calculatePayout = () => {
    return (amount * odds).toFixed(0);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="NEW P2P BET" showBack />

      <ScrollView className="flex-1 px-6 py-4">
        {step === 1 && (
          <View className="flex-1">
            {!selectedEvent ? (
              <View className="mb-6">
                <Text
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: Colors.mutedForeground }}
                >
                  Select Event
                </Text>
                {events.slice(0, 5).map((event) => (
                  <Pressable
                    key={event.id}
                    onPress={() => {
                      setSelectedEvent(event);
                      setYourSelection(event.homeTeam);
                      setOpponentSelection(event.awayTeam);
                    }}
                    className="p-4 rounded-xl mb-3"
                    style={{
                      backgroundColor: Colors.card,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text className="font-bold text-white">{event.homeTeam} vs {event.awayTeam}</Text>
                    <Text className="text-xs mt-1" style={{ color: Colors.mutedForeground }}>
                      {event.sportTitle} • {sportsDataService.formatTime(event.commenceTime)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <>
                <View
                  className="p-4 rounded-xl mb-6"
                  style={{
                    backgroundColor: `${Colors.primary}15`,
                    borderWidth: 1,
                    borderColor: `${Colors.primary}30`,
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="font-bold text-white">
                        {selectedEvent.homeTeam} vs {selectedEvent.awayTeam}
                      </Text>
                      <Text className="text-xs mt-1" style={{ color: Colors.mutedForeground }}>
                        {selectedEvent.sportTitle}
                      </Text>
                    </View>
                    <Pressable onPress={() => setSelectedEvent(null)}>
                      <Ionicons name="close-circle" size={24} color={Colors.mutedForeground} />
                    </Pressable>
                  </View>
                </View>

                <View className="mb-6">
                  <Text
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: Colors.mutedForeground }}
                  >
                    Your Pick
                  </Text>
                  <View className="flex-row gap-3">
                    {[selectedEvent.homeTeam, selectedEvent.awayTeam].map((team) => (
                      <Pressable
                        key={team}
                        onPress={() => {
                          setYourSelection(team);
                          setOpponentSelection(team === selectedEvent.homeTeam ? selectedEvent.awayTeam : selectedEvent.homeTeam);
                        }}
                        className="flex-1 h-14 rounded-xl items-center justify-center"
                        style={{
                          backgroundColor: yourSelection === team ? Colors.primary : Colors.card,
                          borderWidth: 1,
                          borderColor: yourSelection === team ? Colors.primary : "rgba(255,255,255,0.1)",
                        }}
                      >
                        <Text
                          className="font-bold text-sm"
                          style={{ color: yourSelection === team ? Colors.primaryForeground : Colors.foreground }}
                          numberOfLines={1}
                        >
                          {team}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="mb-6">
                  <View className="flex-row justify-between mb-2">
                    <Text
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: Colors.mutedForeground }}
                    >
                      Odds (Decimal)
                    </Text>
                    <Text className="font-mono font-bold" style={{ color: Colors.primary }}>
                      {odds.toFixed(2)}x
                    </Text>
                  </View>
                  <View
                    className="h-12 rounded-xl justify-center px-4"
                    style={{
                      backgroundColor: Colors.card,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Slider
                      minimumValue={1.1}
                      maximumValue={10}
                      value={odds}
                      onValueChange={setOdds}
                      step={0.1}
                      minimumTrackTintColor={Colors.primary}
                      maximumTrackTintColor={Colors.muted}
                      thumbTintColor={Colors.primary}
                    />
                  </View>
                </View>

                <View className="mb-6">
                  <Text
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: Colors.mutedForeground }}
                  >
                    Currency
                  </Text>
                  <View className="flex-row gap-2">
                    {(['SAT', 'ETH', 'USDC'] as const).map((curr) => (
                      <Pressable
                        key={curr}
                        onPress={() => setCurrency(curr)}
                        className="flex-1 h-10 rounded-lg items-center justify-center"
                        style={{
                          backgroundColor: currency === curr ? `${Colors.secondary}30` : Colors.card,
                          borderWidth: 1,
                          borderColor: currency === curr ? Colors.secondary : "rgba(255,255,255,0.1)",
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: currency === curr ? Colors.secondary : Colors.mutedForeground }}
                        >
                          {curr}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="mb-8">
                  <View className="flex-row justify-between mb-2">
                    <Text
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: Colors.mutedForeground }}
                    >
                      Wager Amount
                    </Text>
                    <Text className="font-mono font-bold" style={{ color: Colors.primary }}>
                      {amount} {currency}
                    </Text>
                  </View>
                  <View
                    className="h-12 rounded-xl justify-center px-4"
                    style={{
                      backgroundColor: Colors.card,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Slider
                      minimumValue={10}
                      maximumValue={1000}
                      value={amount}
                      onValueChange={setAmount}
                      step={10}
                      minimumTrackTintColor={Colors.primary}
                      maximumTrackTintColor={Colors.muted}
                      thumbTintColor={Colors.primary}
                    />
                  </View>
                </View>

                <View className="mt-auto pb-6">
                  <Pressable
                    onPress={() => setStep(2)}
                    disabled={!yourSelection}
                    className="h-14 rounded-xl items-center justify-center flex-row"
                    style={{
                      backgroundColor: yourSelection ? Colors.primary : Colors.muted,
                      shadowColor: Colors.primary,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: yourSelection ? 0.4 : 0,
                      shadowRadius: 15,
                    }}
                  >
                    <Text className="font-bold text-lg" style={{ color: Colors.primaryForeground }}>
                      Review Bet
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={Colors.primaryForeground}
                      style={{ marginLeft: 8 }}
                    />
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}

        {step === 2 && selectedEvent && (
          <View className="flex-1">
            <View
              className="rounded-2xl p-6 mb-6"
              style={{
                backgroundColor: Colors.card,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="alert-circle" size={20} color={Colors.yellow} />
                <Text className="ml-2 font-bold text-white">Review Your Bet</Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                  Event
                </Text>
                <Text className="text-lg font-bold text-white mt-1">
                  {selectedEvent.homeTeam} vs {selectedEvent.awayTeam}
                </Text>
              </View>

              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                    Your Pick
                  </Text>
                  <Text className="text-xl font-bold" style={{ color: Colors.primary }}>
                    {yourSelection}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                    Odds
                  </Text>
                  <Text className="text-xl font-mono font-bold" style={{ color: Colors.secondary }}>
                    {odds.toFixed(2)}x
                  </Text>
                </View>
              </View>

              <View
                className="h-px my-4"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              />

              <View className="flex-row justify-between mb-2">
                <Text className="text-white">Wager</Text>
                <Text className="font-mono font-bold" style={{ color: Colors.foreground }}>
                  {amount} {currency}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="font-bold text-white">Potential Win</Text>
                <Text className="font-mono font-bold" style={{ color: Colors.green }}>
                  {calculatePayout()} {currency}
                </Text>
              </View>
            </View>

            {Platform.OS === 'web' && (
              <View
                className="p-3 rounded-xl mb-4"
                style={{ backgroundColor: `${Colors.yellow}15` }}
              >
                <Text className="text-xs text-center" style={{ color: Colors.yellow }}>
                  Web Preview: Bet will be saved locally. Real P2P broadcast requires native build.
                </Text>
              </View>
            )}

            <View className="mt-auto gap-3 pb-6">
              <Pressable
                onPress={handleCreate}
                disabled={broadcasting}
                className="h-14 rounded-xl items-center justify-center flex-row"
                style={{
                  backgroundColor: broadcasting ? Colors.muted : Colors.primary,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: broadcasting ? 0 : 0.4,
                  shadowRadius: 15,
                }}
              >
                {broadcasting ? (
                  <>
                    <ActivityIndicator color={Colors.foreground} />
                    <Text className="ml-2 font-bold" style={{ color: Colors.foreground }}>
                      Broadcasting to Mesh...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="flash" size={20} color={Colors.primaryForeground} />
                    <Text
                      className="ml-2 font-bold text-lg"
                      style={{ color: Colors.primaryForeground }}
                    >
                      Broadcast Bet
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={() => setStep(1)}
                className="h-14 rounded-xl items-center justify-center"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <Text className="font-bold text-white">Go Back</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 3 && (
          <View className="flex-1 items-center justify-center py-20">
            {showConfetti && (
              <ConfettiCannon
                ref={confettiRef}
                count={150}
                origin={{ x: 200, y: -20 }}
                autoStart={true}
                fadeOut={true}
                colors={[Colors.primary, Colors.secondary, Colors.green, '#FFD700', '#FF6B6B']}
              />
            )}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: `${Colors.green}20`,
                shadowColor: Colors.green,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
              }}
            >
              <Ionicons name="checkmark-circle" size={64} color={Colors.green} />
            </View>

            <Text className="text-2xl font-bold text-white mb-2">Bet Created!</Text>
            <Text
              className="text-center mb-8 max-w-xs"
              style={{ color: Colors.mutedForeground }}
            >
              Your bet has been broadcast to the mesh network. Waiting for someone to accept...
            </Text>

            <Pressable
              onPress={() => router.back()}
              className="h-14 px-8 rounded-xl items-center justify-center"
              style={{
                backgroundColor: Colors.primary,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 15,
              }}
            >
              <Text className="font-bold text-lg" style={{ color: Colors.primaryForeground }}>
                Back to Lobby
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
