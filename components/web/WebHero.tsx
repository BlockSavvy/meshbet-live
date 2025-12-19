import { View, Text, Pressable, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useResponsive } from '@/lib/hooks/useResponsive';

export function WebHero() {
  const router = useRouter();
  const { isDesktop, isWide } = useResponsive();

  if (Platform.OS !== 'web') return null;

  return (
    <View
      style={{
        width: '100%',
        paddingVertical: isWide ? 80 : 60,
        paddingHorizontal: 24,
        backgroundColor: Colors.background,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: 200,
            backgroundColor: Colors.primary,
            opacity: 0.3,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -150,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: 250,
            backgroundColor: Colors.secondary,
            opacity: 0.2,
          }}
        />
      </View>

      <View
        style={{
          maxWidth: 1200,
          marginHorizontal: 'auto',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'center',
          gap: isDesktop ? 60 : 40,
        }}
      >
        <View style={{ flex: 1, maxWidth: 600 }}>
          <View 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 8,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: `${Colors.green}20`,
                borderWidth: 1,
                borderColor: `${Colors.green}40`,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.green }}>
                DECENTRALIZED
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: `${Colors.primary}20`,
                borderWidth: 1,
                borderColor: `${Colors.primary}40`,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary }}>
                OFFLINE-FIRST
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: isWide ? 56 : isDesktop ? 48 : 36,
              fontWeight: 'bold',
              color: Colors.foreground,
              lineHeight: isWide ? 64 : isDesktop ? 56 : 44,
              marginBottom: 20,
            }}
          >
            Join the{' '}
            <Text style={{ color: Colors.primary }}>Offline Betting</Text>
            {'\n'}
            <Text style={{ color: Colors.secondary }}>Revolution</Text>
          </Text>

          <Text
            style={{
              fontSize: isDesktop ? 18 : 16,
              color: Colors.mutedForeground,
              lineHeight: isDesktop ? 28 : 24,
              marginBottom: 32,
            }}
          >
            Host offline betting parties at bars, watch parties, or anywhere. 
            No internet needed. Crypto-secured P2P bets over Bluetooth mesh.
          </Text>

          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            <Pressable
              onPress={() => router.push('/(tabs)/events')}
              style={({ hovered }: any) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 28,
                paddingVertical: 16,
                borderRadius: 14,
                backgroundColor: hovered ? Colors.primary : Colors.primary,
                opacity: hovered ? 0.9 : 1,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
              })}
            >
              <Ionicons name="flash" size={20} color={Colors.primaryForeground} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.primaryForeground }}>
                Browse Live Events
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/create-bet')}
              style={({ hovered }: any) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 28,
                paddingVertical: 16,
                borderRadius: 14,
                backgroundColor: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
              })}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.foreground} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.foreground }}>
                Create a Bet
              </Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.green }}>
                0.75%
              </Text>
              <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>
                Ultra-Low Fees
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.primary }}>
                100%
              </Text>
              <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>
                Offline Capable
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.secondary }}>
                P2P
              </Text>
              <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>
                No Middleman
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.yellow }}>
                50K+
              </Text>
              <Text style={{ fontSize: 12, color: Colors.mutedForeground }}>
                Downloads
              </Text>
            </View>
          </View>
        </View>

        {isDesktop && (
          <View
            style={{
              flex: 1,
              maxWidth: 500,
              aspectRatio: 1,
              borderRadius: 24,
              backgroundColor: Colors.card,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: `${Colors.primary}05`,
              }}
            />
            
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: `${Colors.primary}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                  borderWidth: 2,
                  borderColor: `${Colors.primary}40`,
                }}
              >
                <Ionicons name="git-network" size={56} color={Colors.primary} />
              </View>
              
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.foreground, marginBottom: 8 }}>
                Mesh Network Ready
              </Text>
              <Text style={{ fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', maxWidth: 300 }}>
                Download the mobile app to connect via Bluetooth mesh at your next watch party
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Ionicons name="logo-apple" size={20} color={Colors.foreground} />
                  <Text style={{ fontSize: 13, color: Colors.foreground }}>iOS</Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Ionicons name="logo-android" size={20} color={Colors.foreground} />
                  <Text style={{ fontSize: 13, color: Colors.foreground }}>Android</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
