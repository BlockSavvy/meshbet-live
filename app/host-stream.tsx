import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { Colors } from "@/constants/Colors";
import { streamingService, StreamMetadata } from "@/lib/services/streaming";
import { bitchatService } from "@/lib/services/bitchat";
import { sportsDataService, SportEvent } from "@/lib/services/sportsData";

type Quality = 'low' | 'medium' | 'high';

export default function HostStreamScreen() {
  const [step, setStep] = useState<'setup' | 'streaming'>('setup');
  const [title, setTitle] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);
  const [quality, setQuality] = useState<Quality>('medium');
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [stream, setStream] = useState<StreamMetadata | null>(null);
  const [peerCount, setPeerCount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadEvents = async () => {
      const data = await sportsDataService.getUpcomingEvents('upcoming');
      setEvents(data.slice(0, 5));
    };
    loadEvents();
    
    setPeerCount(bitchatService.connectedPeers.length);
    
    const unsubPeer = bitchatService.onPeerConnected(() => {
      setPeerCount(bitchatService.connectedPeers.length);
    });
    
    const unsubDisconnect = bitchatService.onPeerDisconnected(() => {
      setPeerCount(bitchatService.connectedPeers.length);
    });

    return () => {
      unsubPeer();
      unsubDisconnect();
    };
  }, []);

  useEffect(() => {
    if (step === 'streaming') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [step]);

  const startStream = async () => {
    if (!title.trim()) return;

    const metadata = await streamingService.startStream({
      title: title.trim(),
      eventId: selectedEvent?.id || 'general',
      quality,
    });

    if (metadata) {
      setStream(metadata);
      setStep('streaming');
    }
  };

  const stopStream = async () => {
    if (stream) {
      await streamingService.stopStream(stream.streamId);
      router.back();
    }
  };

  const getQualityInfo = (q: Quality) => {
    switch (q) {
      case 'low': return { fps: 15, label: 'Low (15 FPS)', desc: 'Best for weak connections' };
      case 'medium': return { fps: 24, label: 'Medium (24 FPS)', desc: 'Balanced quality' };
      case 'high': return { fps: 30, label: 'High (30 FPS)', desc: 'Best quality' };
    }
  };

  const formatDuration = () => {
    if (!stream) return '00:00';
    const elapsed = Math.floor((Date.now() - stream.startedAt) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (step === 'streaming') {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="flex-1">
          <View className="flex-row items-center justify-between px-4 h-14">
            <View className="flex-row items-center gap-2">
              <View className="w-3 h-3 rounded-full bg-red-500" />
              <Text className="text-white font-bold">LIVE</Text>
            </View>
            <Text className="text-white font-mono">{formatDuration()}</Text>
            <Pressable
              onPress={stopStream}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#ef4444' }}
            >
              <Text className="text-white font-bold">END</Text>
            </Pressable>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            >
              <View 
                className="w-32 h-32 rounded-full items-center justify-center"
                style={{ 
                  backgroundColor: `${Colors.secondary}20`,
                  borderWidth: 3,
                  borderColor: Colors.secondary,
                }}
              >
                <Ionicons name="radio" size={64} color={Colors.secondary} />
              </View>
            </Animated.View>

            <Text className="text-2xl font-bold text-white mt-6">
              Broadcasting
            </Text>
            <Text className="text-lg mt-2" style={{ color: Colors.mutedForeground }}>
              {stream?.title}
            </Text>

            {Platform.OS === 'web' && (
              <View className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: `${Colors.yellow}20` }}>
                <Text className="text-xs text-center" style={{ color: Colors.yellow }}>
                  Web Preview - Camera access requires native build
                </Text>
              </View>
            )}

            <View className="flex-row gap-6 mt-8">
              <View className="items-center">
                <Text className="text-3xl font-bold" style={{ color: Colors.primary }}>
                  {stream?.viewerCount || 0}
                </Text>
                <Text className="text-xs mt-1" style={{ color: Colors.mutedForeground }}>Viewers</Text>
              </View>
              <View className="w-px" style={{ backgroundColor: Colors.mutedForeground }} />
              <View className="items-center">
                <Text className="text-3xl font-bold" style={{ color: Colors.green }}>
                  {peerCount}
                </Text>
                <Text className="text-xs mt-1" style={{ color: Colors.mutedForeground }}>Peers</Text>
              </View>
              <View className="w-px" style={{ backgroundColor: Colors.mutedForeground }} />
              <View className="items-center">
                <Text className="text-3xl font-bold" style={{ color: Colors.secondary }}>
                  {stream?.fps || 24}
                </Text>
                <Text className="text-xs mt-1" style={{ color: Colors.mutedForeground }}>FPS</Text>
              </View>
            </View>

            <View 
              className="w-full mt-10 p-4 rounded-xl"
              style={{ backgroundColor: Colors.card }}
            >
              <Text className="font-bold text-white mb-3">Stream Info</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text style={{ color: Colors.mutedForeground }}>Quality</Text>
                  <Text className="text-white">{stream?.quality?.toUpperCase()}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text style={{ color: Colors.mutedForeground }}>Stream ID</Text>
                  <Text className="text-white font-mono text-xs">{stream?.streamId.slice(0, 16)}...</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text style={{ color: Colors.mutedForeground }}>Protocol</Text>
                  <Text style={{ color: Colors.primary }}>P2P Mesh (Bitchat)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Header title="HOST STREAM" showBack />

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-lg font-bold mb-2">Stream Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter stream title..."
          placeholderTextColor={Colors.mutedForeground}
          className="h-14 rounded-xl px-4 mb-6"
          style={{
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            color: Colors.foreground,
          }}
        />

        <Text className="text-white text-lg font-bold mb-2">Link to Event (Optional)</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ gap: 12 }}
        >
          <Pressable
            onPress={() => setSelectedEvent(null)}
            className="px-4 py-3 rounded-xl"
            style={{
              backgroundColor: !selectedEvent ? `${Colors.primary}20` : Colors.card,
              borderWidth: 1,
              borderColor: !selectedEvent ? Colors.primary : 'transparent',
            }}
          >
            <Text style={{ color: !selectedEvent ? Colors.primary : Colors.mutedForeground }}>
              No Event
            </Text>
          </Pressable>
          {events.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => setSelectedEvent(event)}
              className="px-4 py-3 rounded-xl"
              style={{
                backgroundColor: selectedEvent?.id === event.id ? `${Colors.primary}20` : Colors.card,
                borderWidth: 1,
                borderColor: selectedEvent?.id === event.id ? Colors.primary : 'transparent',
                maxWidth: 200,
              }}
            >
              <Text 
                className="font-bold"
                style={{ color: selectedEvent?.id === event.id ? Colors.primary : Colors.foreground }}
                numberOfLines={1}
              >
                {event.homeTeam} vs {event.awayTeam}
              </Text>
              <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                {event.sportTitle}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text className="text-white text-lg font-bold mb-2">Quality</Text>
        <View className="gap-3 mb-6">
          {(['low', 'medium', 'high'] as Quality[]).map((q) => {
            const info = getQualityInfo(q);
            const isSelected = quality === q;
            return (
              <Pressable
                key={q}
                onPress={() => setQuality(q)}
                className="p-4 rounded-xl flex-row items-center"
                style={{
                  backgroundColor: isSelected ? `${Colors.primary}20` : Colors.card,
                  borderWidth: 1,
                  borderColor: isSelected ? Colors.primary : 'transparent',
                }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: isSelected ? `${Colors.primary}30` : 'rgba(255,255,255,0.05)' }}
                >
                  <Ionicons 
                    name={q === 'high' ? 'speedometer' : q === 'medium' ? 'speedometer-outline' : 'battery-half'} 
                    size={20} 
                    color={isSelected ? Colors.primary : Colors.mutedForeground} 
                  />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isSelected ? Colors.primary : Colors.foreground }}>
                    {info.label}
                  </Text>
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                    {info.desc}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View 
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: Colors.card }}
        >
          <View className="flex-row items-center gap-3 mb-2">
            <Ionicons name="people" size={20} color={Colors.primary} />
            <Text className="text-white font-bold">{peerCount} Peers Connected</Text>
          </View>
          <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
            Your stream will be broadcast to all connected peers via the mesh network
          </Text>
        </View>

        <Pressable
          onPress={startStream}
          disabled={!title.trim()}
          className="h-14 rounded-xl items-center justify-center flex-row gap-2 mb-10"
          style={{
            backgroundColor: title.trim() ? Colors.secondary : Colors.muted,
            opacity: title.trim() ? 1 : 0.5,
            shadowColor: Colors.secondary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: title.trim() ? 0.4 : 0,
            shadowRadius: 15,
          }}
        >
          <Ionicons name="radio" size={24} color={Colors.secondaryForeground} />
          <Text className="font-bold text-lg" style={{ color: Colors.secondaryForeground }}>
            Start Broadcasting
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
