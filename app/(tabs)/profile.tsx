import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="PROFILE" />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="items-center py-6">
          <View
            className="w-24 h-24 rounded-full p-1"
            style={{
              backgroundColor: Colors.primary,
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 15,
            }}
          >
            <Image
              source={{ uri: "https://api.dicebear.com/7.x/avataaars/png?seed=Felix" }}
              className="w-full h-full rounded-full bg-black"
            />
            <View
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full"
              style={{
                backgroundColor: Colors.green,
                borderWidth: 4,
                borderColor: Colors.background,
              }}
            />
          </View>
          <Text className="mt-4 text-2xl font-bold text-white">NeonRider_99</Text>
          <View
            className="px-3 py-1 rounded-full mt-2"
            style={{
              backgroundColor: `${Colors.primary}15`,
              borderWidth: 1,
              borderColor: `${Colors.primary}30`,
            }}
          >
            <Text className="text-xs font-mono" style={{ color: Colors.primary }}>
              0x83...f9a2
            </Text>
          </View>
        </View>

        <View
          className="rounded-2xl p-5 mb-6"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: Colors.mutedForeground }}
              >
                Total Balance
              </Text>
              <Text className="text-3xl font-bold font-mono text-white">$4,293.52</Text>
              <Text className="text-xs font-mono mt-1" style={{ color: Colors.green }}>
                +12.5% this week
              </Text>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Ionicons name="wallet" size={20} color={Colors.foreground} />
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: Colors.primary }}
            >
              <Text className="font-bold" style={{ color: Colors.primaryForeground }}>
                Deposit
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 h-12 rounded-xl items-center justify-center"
              style={{
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text className="font-bold text-white">Withdraw</Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-6">
          {[
            { icon: "time", label: "Betting History", route: "/history" },
            { icon: "settings", label: "Settings", route: "/settings" },
            { icon: "shield-checkmark", label: "Security", route: "/security" },
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={() => router.push(item.route as any)}
              className="flex-row items-center justify-between py-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.05)",
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={Colors.foreground}
                  />
                </View>
                <Text className="text-base font-medium text-white">{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <Text className="text-center text-xs mb-8" style={{ color: Colors.mutedForeground }}>
          MeshBet Live v0.1.0 (Beta)
        </Text>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
