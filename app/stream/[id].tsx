import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { streamingService, StreamMetadata, StreamStatus } from "@/lib/services/streaming";
import { bitchatService } from "@/lib/services/bitchat";

export default function StreamPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stream, setStream] = useState<StreamMetadata | null>(null);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [bufferLevel, setBufferLevel] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initStream = async () => {
      if (!id) return;
      
      const streams = streamingService.getActiveStreams();
      const foundStream = streams.find(s => s.streamId === id);
      
      if (foundStream) {
        setStream(foundStream);
        await streamingService.joinStream(id);
      } else {
        await streamingService.joinStream(id);
      }
    };

    initStream();

    const unsubStreams = streamingService.onStreamUpdate((streams) => {
      const current = streams.find(s => s.streamId === id);
      if (current) {
        setStream(current);
      }
    });

    const statusInterval = setInterval(() => {
      setStatus(streamingService.getStatus());
      if (id) {
        setBufferLevel(streamingService.getBufferLevel(id));
      }
    }, 500);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      unsubStreams();
      clearInterval(statusInterval);
      streamingService.leaveStream();
    };
  }, [id]);

  useEffect(() => {
    if (showControls) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls]);

  const handleTap = () => {
    setShowControls(!showControls);
  };

  const handleLeave = async () => {
    await streamingService.leaveStream();
    router.back();
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return 'Connecting to stream...';
      case 'buffering': return 'Buffering...';
      case 'streaming': return 'Live';
      case 'paused': return 'Paused';
      case 'ended': return 'Stream Ended';
      default: return 'Waiting for stream...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'streaming': return Colors.green;
      case 'connecting':
      case 'buffering': return Colors.yellow;
      case 'ended': return Colors.mutedForeground;
      default: return Colors.primary;
    }
  };

  const formatDuration = () => {
    if (!stream) return '00:00';
    const elapsed = Math.floor((Date.now() - stream.startedAt) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <Pressable 
        className="flex-1"
        onPress={handleTap}
      >
        <View className="flex-1 items-center justify-center bg-black">
          {status === 'streaming' ? (
            <View className="w-full h-full items-center justify-center">
              <View 
                className="absolute inset-0"
                style={{ backgroundColor: '#111' }}
              />
              
              <View className="items-center">
                <Animated.View
                  style={{
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  <View 
                    className="w-24 h-24 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${Colors.primary}20` }}
                  >
                    <Ionicons name="radio" size={48} color={Colors.primary} />
                  </View>
                </Animated.View>
                
                <Text className="text-white font-bold text-lg mt-4">
                  P2P Stream Active
                </Text>
                <Text className="text-sm mt-1" style={{ color: Colors.mutedForeground }}>
                  Receiving video chunks via mesh network
                </Text>
                
                <View className="flex-row items-center mt-4 gap-4">
                  <View className="items-center">
                    <Text className="text-2xl font-bold" style={{ color: Colors.primary }}>
                      {stream?.fps || 24}
                    </Text>
                    <Text className="text-xs" style={{ color: Colors.mutedForeground }}>FPS</Text>
                  </View>
                  <View className="w-px h-8" style={{ backgroundColor: Colors.mutedForeground }} />
                  <View className="items-center">
                    <Text className="text-2xl font-bold" style={{ color: Colors.secondary }}>
                      {stream?.quality?.toUpperCase() || 'MED'}
                    </Text>
                    <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Quality</Text>
                  </View>
                  <View className="w-px h-8" style={{ backgroundColor: Colors.mutedForeground }} />
                  <View className="items-center">
                    <Text className="text-2xl font-bold" style={{ color: Colors.green }}>
                      {stream?.viewerCount || 1}
                    </Text>
                    <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Viewers</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center">
              {status === 'connecting' || status === 'buffering' ? (
                <Animated.View
                  style={{
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  <View 
                    className="w-20 h-20 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${Colors.primary}20` }}
                  >
                    <Ionicons name="wifi" size={40} color={Colors.primary} />
                  </View>
                </Animated.View>
              ) : status === 'ended' ? (
                <Ionicons name="stop-circle" size={64} color={Colors.mutedForeground} />
              ) : (
                <Ionicons name="radio-outline" size={64} color={Colors.mutedForeground} />
              )}
              
              <Text className="text-white font-bold text-lg mt-4">
                {getStatusText()}
              </Text>
              
              {(status === 'connecting' || status === 'buffering') && (
                <View className="w-48 h-2 rounded-full mt-4 overflow-hidden" style={{ backgroundColor: `${Colors.primary}20` }}>
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: Colors.primary,
                      width: `${bufferLevel}%`,
                    }}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        {showControls && (
          <>
            <View 
              className="absolute top-0 inset-x-0 px-4 py-2 flex-row items-center justify-between"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            >
              <Pressable
                onPress={handleLeave}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Ionicons name="arrow-back" size={20} color="white" />
              </Pressable>
              
              <View className="flex-1 mx-4">
                <Text className="text-white font-bold" numberOfLines={1}>
                  {stream?.title || 'P2P Stream'}
                </Text>
                <Text className="text-xs" style={{ color: Colors.mutedForeground }}>
                  {stream?.hostNickname || 'Unknown Host'}
                </Text>
              </View>
              
              <View 
                className="flex-row items-center px-2 py-1 rounded"
                style={{ backgroundColor: `${getStatusColor()}20` }}
              >
                <View 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: getStatusColor() }}
                />
                <Text className="text-xs font-bold" style={{ color: getStatusColor() }}>
                  {getStatusText()}
                </Text>
              </View>
            </View>

            <View 
              className="absolute bottom-0 inset-x-0 px-4 py-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="time" size={16} color={Colors.mutedForeground} />
                  <Text className="font-mono" style={{ color: Colors.foreground }}>
                    {formatDuration()}
                  </Text>
                </View>
                
                <View className="flex-row items-center gap-2">
                  <Ionicons name="people" size={16} color={Colors.mutedForeground} />
                  <Text style={{ color: Colors.foreground }}>
                    {stream?.viewerCount || 0} viewers
                  </Text>
                </View>
              </View>
              
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>Buffer</Text>
                  <Text className="text-xs" style={{ color: Colors.mutedForeground }}>{Math.round(bufferLevel)}%</Text>
                </View>
                <View className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${Colors.primary}20` }}>
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: bufferLevel > 50 ? Colors.green : bufferLevel > 20 ? Colors.yellow : '#ef4444',
                      width: `${bufferLevel}%`,
                    }}
                  />
                </View>
              </View>
              
              <View className="flex-row items-center justify-center gap-6">
                <Pressable
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Ionicons name="volume-high" size={24} color="white" />
                </Pressable>
                
                <Pressable
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: Colors.primary }}
                >
                  <Ionicons name="pause" size={32} color={Colors.primaryForeground} />
                </Pressable>
                
                <Pressable
                  onPress={() => setIsFullscreen(!isFullscreen)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="white" />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </Pressable>
    </SafeAreaView>
  );
}
