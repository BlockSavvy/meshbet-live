import { View, Text, Pressable } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  transparent?: boolean;
  showNotifications?: boolean;
}

export function Header({
  title,
  showBack = false,
  transparent = false,
  showNotifications = true,
}: HeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between px-4 h-14"
      style={{
        backgroundColor: transparent ? "transparent" : Colors.background,
      }}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.foreground} />
          </Pressable>
        )}
        <Text
          className="text-lg font-bold tracking-widest"
          style={{ color: Colors.foreground }}
        >
          {title}
        </Text>
      </View>

      {showNotifications && (
        <View className="flex-row gap-2">
          <Pressable
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.foreground} />
            <View
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: Colors.primary }}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}
