import { View, Text, Switch, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { useState } from "react";

export default function SettingsScreen() {
  const [meshMode, setMeshMode] = useState(true);
  const [hybridRelay, setHybridRelay] = useState(false);
  const [batteryOptimization, setBatteryOptimization] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="SETTINGS" showBack />

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <Text
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: Colors.mutedForeground }}
        >
          Network Protocol
        </Text>

        <View
          className="rounded-xl p-4 flex-row items-center justify-between mb-3"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${Colors.primary}15` }}
            >
              <Ionicons name="bluetooth" size={20} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-white">Mesh Mode (Bitchat)</Text>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                Offline discovery & chat
              </Text>
            </View>
          </View>
          <Switch
            value={meshMode}
            onValueChange={setMeshMode}
            trackColor={{ false: Colors.muted, true: `${Colors.primary}50` }}
            thumbColor={meshMode ? Colors.primary : Colors.mutedForeground}
          />
        </View>

        <View
          className="rounded-xl p-4 flex-row items-center justify-between mb-6"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${Colors.secondary}15` }}
            >
              <Ionicons name="globe" size={20} color={Colors.secondary} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-white">Hybrid Relay</Text>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                Bridge to Nostr when online
              </Text>
            </View>
          </View>
          <Switch
            value={hybridRelay}
            onValueChange={setHybridRelay}
            trackColor={{ false: Colors.muted, true: `${Colors.secondary}50` }}
            thumbColor={hybridRelay ? Colors.secondary : Colors.mutedForeground}
          />
        </View>

        <Text
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: Colors.mutedForeground }}
        >
          Performance
        </Text>

        <View
          className="rounded-xl p-4 flex-row items-center justify-between mb-6"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${Colors.yellow}15` }}
            >
              <Ionicons name="battery-half" size={20} color={Colors.yellow} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-white">Battery Optimization</Text>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                Reduce mesh activity when idle
              </Text>
            </View>
          </View>
          <Switch
            value={batteryOptimization}
            onValueChange={setBatteryOptimization}
            trackColor={{ false: Colors.muted, true: `${Colors.yellow}50` }}
            thumbColor={batteryOptimization ? Colors.yellow : Colors.mutedForeground}
          />
        </View>

        <Text
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: Colors.mutedForeground }}
        >
          Security
        </Text>

        <View
          className="rounded-xl p-4 flex-row items-center justify-between mb-3"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${Colors.green}15` }}
            >
              <Ionicons name="shield-checkmark" size={20} color={Colors.green} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-white">E2E Encryption</Text>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                Noise Protocol (Always On)
              </Text>
            </View>
          </View>
          <Ionicons name="lock-closed" size={20} color={Colors.green} />
        </View>

        <Pressable
          className="rounded-xl p-4 flex-row items-center justify-between"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            borderWidth: 1,
            borderColor: "rgba(239,68,68,0.3)",
          }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(239,68,68,0.2)" }}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
            </View>
            <View>
              <Text className="font-bold" style={{ color: "#ef4444" }}>
                Emergency Wipe
              </Text>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                Delete all local data
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ef4444" />
        </Pressable>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
