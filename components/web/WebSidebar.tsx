import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Lobby', icon: 'home', path: '/(tabs)' },
  { label: 'Live Events', icon: 'radio', path: '/(tabs)/events' },
  { label: 'Wallet', icon: 'wallet', path: '/(tabs)/wallet' },
  { label: 'Mesh Network', icon: 'git-network', path: '/(tabs)/mesh' },
  { label: 'Profile', icon: 'person', path: '/(tabs)/profile' },
];

const SECONDARY_ITEMS: NavItem[] = [
  { label: 'Settings', icon: 'settings-outline', path: '/settings' },
  { label: 'Create Bet', icon: 'add-circle', path: '/create-bet' },
];

export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  if (Platform.OS !== 'web') return null;

  return (
    <View
      style={{
        width: 280,
        height: '100%',
        backgroundColor: Colors.card,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.1)',
        paddingTop: 24,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ marginBottom: 32, paddingHorizontal: 8 }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: Colors.foreground,
          letterSpacing: 2,
        }}>
          <Text style={{ color: Colors.foreground }}>MESH</Text>
          <Text style={{ color: Colors.primary }}>BET</Text>
        </Text>
        <Text style={{ 
          fontSize: 10, 
          color: Colors.mutedForeground,
          letterSpacing: 3,
          marginTop: 2,
        }}>
          DECENTRALIZED BETTING
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontSize: 11, 
          fontWeight: '600',
          color: Colors.mutedForeground,
          letterSpacing: 1.5,
          marginBottom: 12,
          paddingHorizontal: 8,
        }}>
          MAIN
        </Text>
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || 
            (item.path === '/(tabs)' && pathname === '/');
          
          return (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={({ hovered }: any) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 12,
                marginBottom: 4,
                backgroundColor: isActive 
                  ? `${Colors.primary}20` 
                  : hovered 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'transparent',
                borderWidth: isActive ? 1 : 0,
                borderColor: `${Colors.primary}40`,
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive 
                    ? `${Colors.primary}30` 
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={isActive ? Colors.primary : Colors.mutedForeground} 
                />
              </View>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: isActive ? '600' : '400',
                color: isActive ? Colors.foreground : Colors.mutedForeground,
              }}>
                {item.label}
              </Text>
              {isActive && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: Colors.primary,
                    marginLeft: 'auto',
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 6,
                  }}
                />
              )}
            </Pressable>
          );
        })}

        <View style={{ height: 24 }} />
        
        <Text style={{ 
          fontSize: 11, 
          fontWeight: '600',
          color: Colors.mutedForeground,
          letterSpacing: 1.5,
          marginBottom: 12,
          paddingHorizontal: 8,
        }}>
          QUICK ACTIONS
        </Text>

        {SECONDARY_ITEMS.map((item) => (
          <Pressable
            key={item.path}
            onPress={() => router.push(item.path as any)}
            style={({ hovered }: any) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 10,
              marginBottom: 4,
              backgroundColor: hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
            })}
          >
            <Ionicons name={item.icon} size={18} color={Colors.mutedForeground} />
            <Text style={{ fontSize: 13, color: Colors.mutedForeground }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View 
        style={{ 
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <View 
          style={{ 
            padding: 16, 
            borderRadius: 12, 
            backgroundColor: `${Colors.secondary}15`,
            borderWidth: 1,
            borderColor: `${Colors.secondary}30`,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="phone-portrait-outline" size={16} color={Colors.secondary} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.secondary }}>
              Best on Mobile
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: Colors.mutedForeground, lineHeight: 16 }}>
            Mesh networking and P2P features work best on the mobile app with Bluetooth.
          </Text>
        </View>
      </View>
    </View>
  );
}
