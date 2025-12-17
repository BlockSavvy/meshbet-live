import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Header } from "@/components/layout/Header";

const mockMeshRooms = [
  { id: "1", name: "Bar 2049", users: 42 },
  { id: "2", name: "Mike's Tailgate", users: 12 },
  { id: "3", name: "Fight Club HQ", users: 156 },
];

const mockEvents = [
  {
    id: "1",
    title: "UFC 305",
    subtitle: "Pereira vs Adesanya",
    pool: "$42,590",
    viewers: 1240,
    live: true,
  },
  {
    id: "2",
    title: "Boxing PPV",
    subtitle: "Crawford vs Spence",
    pool: "$28,420",
    viewers: 890,
    live: true,
  },
  {
    id: "3",
    title: "NBA Finals G7",
    subtitle: "Lakers vs Celtics",
    pool: "$15,230",
    viewers: 2100,
    live: false,
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="LOBBY" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
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
            placeholder="Find events, fighters, pools..."
            placeholderTextColor={Colors.mutedForeground}
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
              Nearby Mesh Rooms
            </Text>
            <Pressable onPress={() => router.push("/scan")}>
              <Text className="text-xs" style={{ color: Colors.primary }}>
                Scan →
              </Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            <Pressable
              onPress={() => router.push("/scan")}
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

            {mockMeshRooms.map((room) => (
              <Pressable
                key={room.id}
                onPress={() => router.push(`/event/${room.id}`)}
                className="w-36 h-24 rounded-xl p-3 justify-between mr-3"
                style={{
                  backgroundColor: Colors.card,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <View className="flex-row justify-between">
                  <Text className="text-xs font-bold text-white" numberOfLines={1}>
                    {room.name}
                  </Text>
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: Colors.green }}
                  />
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="people" size={12} color={Colors.mutedForeground} />
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                    {room.users} users
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="mb-6">
          <Text
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: Colors.mutedForeground }}
          >
            Live Events
          </Text>

          {mockEvents.map((event) => (
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
                  <Text className="text-lg font-bold text-white">{event.title}</Text>
                  <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                    {event.subtitle}
                  </Text>
                </View>
                {event.live && (
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: "rgba(239,68,68,0.2)" }}
                  >
                    <Text className="text-xs font-bold" style={{ color: "#ef4444" }}>
                      LIVE
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="eye" size={14} color={Colors.mutedForeground} />
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                    {event.viewers} watching
                  </Text>
                </View>
                <Text className="font-mono font-bold" style={{ color: Colors.green }}>
                  {event.pool}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
