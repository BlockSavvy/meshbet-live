import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { sportsDataService, SportEvent } from "@/lib/services/sportsData";

const SPORT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'mma_mixed_martial_arts': 'fitness',
  'americanfootball_nfl': 'american-football',
  'basketball_nba': 'basketball',
  'baseball_mlb': 'baseball',
  'soccer': 'football',
  'icehockey_nhl': 'snow',
};

export default function EventsScreen() {
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const fetchEvents = useCallback(async () => {
    try {
      const data = await sportsDataService.getUpcomingEvents('upcoming');
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = selectedSport === 'all' 
    ? events 
    : events.filter(e => e.sport === selectedSport);

  const getOdds = (event: SportEvent) => {
    if (!event.bookmakers || event.bookmakers.length === 0) return null;
    const market = event.bookmakers[0].markets.find(m => m.key === 'h2h');
    if (!market) return null;
    return market.outcomes;
  };

  const getSportIcon = (sport: string) => {
    return SPORT_ICONS[sport] || 'trophy';
  };

  const sports = ['all', ...new Set(events.map(e => e.sport))];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="LIVE EVENTS" />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="max-h-12 px-4 mb-2"
        contentContainerStyle={{ alignItems: 'center', gap: 8 }}
      >
        {sports.map((sport) => (
          <Pressable
            key={sport}
            onPress={() => setSelectedSport(sport)}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: selectedSport === sport ? Colors.primary : Colors.card,
              borderWidth: 1,
              borderColor: selectedSport === sport ? Colors.primary : 'transparent',
            }}
          >
            <Text 
              className="text-xs font-bold uppercase"
              style={{ 
                color: selectedSport === sport ? Colors.primaryForeground : Colors.mutedForeground 
              }}
            >
              {sport === 'all' ? 'All' : sport.split('_').pop()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text style={{ color: Colors.mutedForeground }}>Loading events...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="calendar-outline" size={48} color={Colors.mutedForeground} />
            <Text className="text-xl font-bold text-white text-center mt-4 mb-2">
              No Events Found
            </Text>
            <Text className="text-center" style={{ color: Colors.mutedForeground }}>
              Pull down to refresh or check back later
            </Text>
          </View>
        ) : (
          <View className="gap-3 pb-20">
            {filteredEvents.map((event) => {
              const odds = getOdds(event);
              const timeLabel = sportsDataService.formatTime(event.commenceTime);
              const isLive = timeLabel === 'LIVE';

              return (
                <Pressable
                  key={event.id}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: Colors.card,
                    borderWidth: 1,
                    borderColor: isLive ? `${Colors.secondary}50` : 'transparent',
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View 
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${Colors.primary}20` }}
                      >
                        <Ionicons 
                          name={getSportIcon(event.sport)} 
                          size={16} 
                          color={Colors.primary} 
                        />
                      </View>
                      <Text className="text-xs uppercase" style={{ color: Colors.mutedForeground }}>
                        {event.sportTitle}
                      </Text>
                    </View>
                    <View 
                      className="px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: isLive ? `${Colors.secondary}20` : `${Colors.primary}20` 
                      }}
                    >
                      <Text 
                        className="text-xs font-bold"
                        style={{ color: isLive ? Colors.secondary : Colors.primary }}
                      >
                        {timeLabel}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="font-bold mb-1" style={{ color: Colors.foreground }}>
                        {event.homeTeam}
                      </Text>
                      <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                        vs
                      </Text>
                      <Text className="font-bold mt-1" style={{ color: Colors.foreground }}>
                        {event.awayTeam}
                      </Text>
                    </View>

                    {odds && (
                      <View className="items-end gap-2">
                        {odds.map((outcome) => (
                          <View 
                            key={outcome.name}
                            className="px-3 py-1 rounded"
                            style={{ backgroundColor: `${Colors.primary}15` }}
                          >
                            <Text 
                              className="text-sm font-mono font-bold"
                              style={{ 
                                color: outcome.price > 0 ? Colors.green : Colors.foreground 
                              }}
                            >
                              {sportsDataService.formatOdds(outcome.price)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => router.push({ pathname: '/create-bet', params: { eventId: event.id } })}
                      className="flex-1 py-2 rounded-lg items-center"
                      style={{ backgroundColor: `${Colors.primary}20` }}
                    >
                      <Text className="text-xs font-bold" style={{ color: Colors.primary }}>
                        CREATE BET
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.push(`/event/${event.id}`)}
                      className="flex-1 py-2 rounded-lg items-center"
                      style={{ backgroundColor: `${Colors.secondary}20` }}
                    >
                      <Text className="text-xs font-bold" style={{ color: Colors.secondary }}>
                        JOIN ROOM
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
