import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";

export default function EventsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="LIVE EVENTS" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-bold text-white text-center mb-2">
          No Active Streams
        </Text>
        <Text className="text-center" style={{ color: Colors.mutedForeground }}>
          Join a mesh room to start watching live events
        </Text>
      </View>
    </SafeAreaView>
  );
}
