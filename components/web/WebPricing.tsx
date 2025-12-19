import { View, Text, Pressable, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useResponsive } from '@/lib/hooks/useResponsive';

interface PlanFeature {
  text: string;
  included: boolean;
}

const FREE_FEATURES: PlanFeature[] = [
  { text: 'P2P betting on mesh', included: true },
  { text: 'Live sports odds', included: true },
  { text: 'Basic stats tracking', included: true },
  { text: 'Chat in rooms', included: true },
  { text: 'HD priority streaming', included: false },
  { text: 'Advanced analytics', included: false },
  { text: 'Custom rooms', included: false },
  { text: 'Venue mode', included: false },
];

const PRO_FEATURES: PlanFeature[] = [
  { text: 'P2P betting on mesh', included: true },
  { text: 'Live sports odds', included: true },
  { text: 'Advanced stats & analytics', included: true },
  { text: 'Chat in rooms', included: true },
  { text: 'HD priority streaming', included: true },
  { text: 'Custom branded rooms', included: true },
  { text: 'Priority relay access', included: true },
  { text: 'Venue/House mode', included: true },
];

export function WebPricing() {
  const { isDesktop } = useResponsive();

  if (Platform.OS !== 'web') return null;

  const openAppStore = () => {
    Linking.openURL('https://apps.apple.com/app/meshbet-live');
  };

  return (
    <View
      style={{
        width: '100%',
        paddingVertical: isDesktop ? 80 : 60,
        paddingHorizontal: 24,
        backgroundColor: Colors.background,
      }}
    >
      <View style={{ maxWidth: 1000, marginHorizontal: 'auto' }}>
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: Colors.yellow,
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            PRICING
          </Text>
          <Text
            style={{
              fontSize: isDesktop ? 36 : 28,
              fontWeight: 'bold',
              color: Colors.foreground,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Simple, Transparent Pricing
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: Colors.mutedForeground,
              textAlign: 'center',
              maxWidth: 500,
            }}
          >
            Start free, go Pro when you need more
          </Text>
        </View>

        <View
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            gap: 24,
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              flex: 1,
              maxWidth: isDesktop ? 400 : undefined,
              padding: 32,
              borderRadius: 20,
              backgroundColor: Colors.card,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.mutedForeground,
                marginBottom: 8,
              }}
            >
              FREE
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 }}>
              <Text style={{ fontSize: 48, fontWeight: 'bold', color: Colors.foreground }}>
                $0
              </Text>
              <Text style={{ fontSize: 16, color: Colors.mutedForeground, marginLeft: 4 }}>
                /forever
              </Text>
            </View>
            
            <View style={{ gap: 12, marginBottom: 24 }}>
              {FREE_FEATURES.map((feature, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons 
                    name={feature.included ? 'checkmark-circle' : 'close-circle'} 
                    size={20} 
                    color={feature.included ? Colors.green : Colors.mutedForeground} 
                  />
                  <Text style={{ 
                    fontSize: 14, 
                    color: feature.included ? Colors.foreground : Colors.mutedForeground,
                  }}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
            
            <Pressable
              onPress={openAppStore}
              style={({ hovered }: any) => ({
                padding: 14,
                borderRadius: 12,
                backgroundColor: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.foreground }}>
                Download Free
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              flex: 1,
              maxWidth: isDesktop ? 400 : undefined,
              padding: 32,
              borderRadius: 20,
              backgroundColor: Colors.card,
              borderWidth: 2,
              borderColor: Colors.yellow,
              position: 'relative',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -12,
                right: 24,
                backgroundColor: Colors.yellow,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Ionicons name="diamond" size={14} color={Colors.background} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.background }}>
                POPULAR
              </Text>
            </View>
            
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: Colors.yellow,
                marginBottom: 8,
              }}
            >
              PRO
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 }}>
              <Text style={{ fontSize: 48, fontWeight: 'bold', color: Colors.foreground }}>
                $6.99
              </Text>
              <Text style={{ fontSize: 16, color: Colors.mutedForeground, marginLeft: 4 }}>
                /month
              </Text>
            </View>
            
            <View style={{ gap: 12, marginBottom: 24 }}>
              {PRO_FEATURES.map((feature, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={Colors.green} 
                  />
                  <Text style={{ fontSize: 14, color: Colors.foreground }}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
            
            <Pressable
              onPress={openAppStore}
              style={({ hovered }: any) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 14,
                borderRadius: 12,
                backgroundColor: hovered ? Colors.yellow : Colors.yellow,
                opacity: hovered ? 0.9 : 1,
              })}
            >
              <Ionicons name="diamond" size={18} color={Colors.background} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.background }}>
                Unlock in App
              </Text>
            </Pressable>
          </View>
        </View>
        
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: `${Colors.green}15`,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
            }}
          >
            <Ionicons name="shield-checkmark" size={18} color={Colors.green} />
            <Text style={{ fontSize: 13, color: Colors.green }}>
              Ultra-low 0.75% platform fees on all bets
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
