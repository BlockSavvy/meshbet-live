import { View, Text, Switch, Pressable, ScrollView, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { bitchatService } from "@/lib/services/bitchat";
import { walletService } from "@/lib/services/wallet";
import { bettingService } from "@/lib/services/betting";

const SETTINGS_KEY = 'app_settings';

interface AppSettings {
  meshMode: boolean;
  hybridRelay: boolean;
  batteryOptimization: boolean;
}

const defaultSettings: AppSettings = {
  meshMode: true,
  hybridRelay: false,
  batteryOptimization: true,
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [meshStatus, setMeshStatus] = useState<string>('disconnected');

  useEffect(() => {
    loadSettings();
    setMeshStatus(bitchatService.running ? 'connected' : 'disconnected');

    const unsubStatus = bitchatService.onStatusChange((status) => {
      setMeshStatus(status);
    });

    return () => unsubStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      
      if (key === 'meshMode') {
        if (value && !bitchatService.running) {
          await bitchatService.startServices('MeshBet_User');
        } else if (!value && bitchatService.running) {
          await bitchatService.stopServices();
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleEmergencyWipe = () => {
    const performWipe = async () => {
      try {
        await AsyncStorage.clear();
        await bitchatService.stopServices();
        
        if (Platform.OS === 'web') {
          alert('All data has been wiped. Please restart the app.');
        }
        
        router.replace('/onboarding');
      } catch (error) {
        console.error('Failed to wipe data:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('This will delete all local data including your wallet. Are you sure?')) {
        performWipe();
      }
    } else {
      Alert.alert(
        'Emergency Wipe',
        'This will delete all local data including your wallet. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Wipe All Data', style: 'destructive', onPress: performWipe },
        ]
      );
    }
  };

  const handleExportWallet = async () => {
    const mnemonic = await walletService.getMnemonic();
    if (mnemonic) {
      if (Platform.OS === 'web') {
        alert(`Your recovery phrase:\n\n${mnemonic}\n\nWrite this down and keep it safe!`);
      } else {
        Alert.alert(
          'Recovery Phrase',
          `${mnemonic}\n\nWrite this down and keep it safe!`,
          [{ text: 'I saved it', style: 'default' }]
        );
      }
    } else {
      if (Platform.OS === 'web') {
        alert('No wallet found. Please complete onboarding first.');
      } else {
        Alert.alert('No Wallet', 'No wallet found. Please complete onboarding first.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="SETTINGS" showBack />

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6 p-4 rounded-xl" style={{ backgroundColor: Colors.card }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: meshStatus === 'connected' ? Colors.green : Colors.mutedForeground }}
              />
              <Text className="text-white font-bold">Mesh Status</Text>
            </View>
            <Text style={{ color: meshStatus === 'connected' ? Colors.green : Colors.mutedForeground }}>
              {meshStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          <Text className="text-xs mt-2" style={{ color: Colors.mutedForeground }}>
            {bitchatService.connectedPeers.length} peers nearby
          </Text>
        </View>

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
            value={settings.meshMode}
            onValueChange={(value) => updateSetting('meshMode', value)}
            trackColor={{ false: Colors.muted, true: `${Colors.primary}50` }}
            thumbColor={settings.meshMode ? Colors.primary : Colors.mutedForeground}
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
            value={settings.hybridRelay}
            onValueChange={(value) => updateSetting('hybridRelay', value)}
            trackColor={{ false: Colors.muted, true: `${Colors.secondary}50` }}
            thumbColor={settings.hybridRelay ? Colors.secondary : Colors.mutedForeground}
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
            value={settings.batteryOptimization}
            onValueChange={(value) => updateSetting('batteryOptimization', value)}
            trackColor={{ false: Colors.muted, true: `${Colors.yellow}50` }}
            thumbColor={settings.batteryOptimization ? Colors.yellow : Colors.mutedForeground}
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
          onPress={handleExportWallet}
          className="rounded-xl p-4 flex-row items-center justify-between mb-3"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${Colors.primary}15` }}
            >
              <Ionicons name="key" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text className="font-bold text-white">Export Recovery Phrase</Text>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                Backup your wallet
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.mutedForeground} />
        </Pressable>

        <Pressable
          onPress={handleEmergencyWipe}
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
