import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useResponsive } from '@/lib/hooks/useResponsive';

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    icon: 'wallet',
    title: 'Ultra-Low 0.75% Fees',
    description: 'The lowest platform fees anywhere. 60% to treasury, 15% to relay nodes that power the mesh.',
    color: Colors.green,
  },
  {
    icon: 'bluetooth',
    title: 'Bluetooth Mesh',
    description: 'Connect with nearby bettors without internet. Perfect for stadiums, bars, and parties.',
    color: Colors.primary,
  },
  {
    icon: 'lock-closed',
    title: 'Crypto Secured',
    description: 'Every bet is cryptographically signed. No trust required, just math.',
    color: Colors.primary,
  },
  {
    icon: 'flash',
    title: 'Instant Settlement',
    description: 'Bets settle instantly when the game ends. Winner takes all, no waiting.',
    color: Colors.yellow,
  },
  {
    icon: 'people',
    title: 'Social Betting',
    description: 'See what your crew is betting on. Join rooms and chat during games.',
    color: Colors.secondary,
  },
  {
    icon: 'stats-chart',
    title: 'Live Odds',
    description: 'Real-time odds from major sportsbooks. NFL, NBA, UFC, and more.',
    color: Colors.primary,
  },
];

export function WebFeatures() {
  const { isDesktop, isWide, columns } = useResponsive();

  if (Platform.OS !== 'web') return null;

  const gridColumns = isWide ? 3 : isDesktop ? 3 : 2;

  return (
    <View
      style={{
        width: '100%',
        paddingVertical: isDesktop ? 80 : 60,
        paddingHorizontal: 24,
        backgroundColor: Colors.card,
      }}
    >
      <View style={{ maxWidth: 1200, marginHorizontal: 'auto' }}>
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: Colors.primary,
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            FEATURES
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
            Everything You Need
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: Colors.mutedForeground,
              textAlign: 'center',
              maxWidth: 500,
            }}
          >
            Built for real-world betting scenarios where internet isn't reliable
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 24,
            justifyContent: 'center',
          }}
        >
          {FEATURES.map((feature, index) => (
            <View
              key={index}
              style={{
                width: `calc(${100 / gridColumns}% - ${(24 * (gridColumns - 1)) / gridColumns}px)` as any,
                minWidth: 280,
                padding: 28,
                borderRadius: 20,
                backgroundColor: Colors.background,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: `${feature.color}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <Ionicons name={feature.icon} size={28} color={feature.color} />
              </View>
              
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: Colors.foreground,
                  marginBottom: 10,
                }}
              >
                {feature.title}
              </Text>
              
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.mutedForeground,
                  lineHeight: 22,
                }}
              >
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
