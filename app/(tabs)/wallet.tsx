import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";

export default function WalletScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="WALLET" />

      <View className="flex-1 px-4 pt-6">
        <View
          className="rounded-2xl p-5 overflow-hidden"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row justify-between items-start mb-6">
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

        <View className="mt-6">
          <Text
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: Colors.mutedForeground }}
          >
            Recent Activity
          </Text>

          {[
            { type: "win", amount: "+$150.00", event: "UFC 304 - Pereira KO" },
            { type: "loss", amount: "-$50.00", event: "Boxing - Crawford W" },
            { type: "deposit", amount: "+$500.00", event: "Lightning Deposit" },
          ].map((item, i) => (
            <View
              key={i}
              className="flex-row justify-between items-center py-3"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.05)",
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{
                    backgroundColor:
                      item.type === "win"
                        ? `${Colors.green}20`
                        : item.type === "loss"
                        ? "rgba(239,68,68,0.2)"
                        : `${Colors.primary}20`,
                  }}
                >
                  <Ionicons
                    name={
                      item.type === "win"
                        ? "trending-up"
                        : item.type === "loss"
                        ? "trending-down"
                        : "flash"
                    }
                    size={16}
                    color={
                      item.type === "win"
                        ? Colors.green
                        : item.type === "loss"
                        ? "#ef4444"
                        : Colors.primary
                    }
                  />
                </View>
                <Text className="text-sm" style={{ color: Colors.mutedForeground }}>
                  {item.event}
                </Text>
              </View>
              <Text
                className="font-mono font-bold"
                style={{
                  color:
                    item.type === "loss"
                      ? "#ef4444"
                      : item.type === "win"
                      ? Colors.green
                      : Colors.primary,
                }}
              >
                {item.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
