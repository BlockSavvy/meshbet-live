import { Tabs } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(10,10,10,0.95)",
          borderTopColor: "rgba(255,255,255,0.1)",
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "LOBBY",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "LIVE",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "radio" : "radio-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              className="w-14 h-14 rounded-full items-center justify-center -mt-6"
              style={{
                backgroundColor: Colors.primary,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 15,
                borderWidth: 4,
                borderColor: Colors.background,
              }}
            >
              <Ionicons name="wallet" size={24} color={Colors.primaryForeground} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mesh"
        options={{
          title: "MESH",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "radio" : "radio-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "ME",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
