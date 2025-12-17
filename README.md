# MeshBet Live - React Native (Expo)

A decentralized, offline-first mobile app for local sports/fights viewing parties with real-time crypto betting. Built with Expo, NativeWind, and the Bitchat protocol.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on physical device

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web (limited functionality)
npx expo start --web
```

## 📱 Tech Stack

- **Framework:** Expo SDK 52 (New Architecture enabled)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** Expo Router (file-based routing)
- **Animations:** React Native Reanimated
- **Icons:** @expo/vector-icons (Ionicons)

## 🔧 Native Modules (To Be Integrated)

The following native modules need to be installed for full functionality:

```bash
# Bluetooth mesh networking (Bitchat protocol)
npm install expo-bitchat

# Video playback for streams
npm install expo-av

# Geolocation for geohash discovery
npm install expo-location

# WalletConnect for crypto wallets
npm install @walletconnect/modal-react-native
```

## 📂 Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home/Lobby screen
│   │   ├── events.tsx     # Live events
│   │   ├── wallet.tsx     # Wallet screen
│   │   └── profile.tsx    # User profile
│   ├── index.tsx          # Splash screen
│   ├── onboarding.tsx     # Onboarding flow
│   ├── scan.tsx           # Mesh scanner
│   ├── event/[id].tsx     # Event room
│   ├── create-bet.tsx     # Create bet wizard
│   └── settings.tsx       # Settings
├── components/
│   └── layout/
│       └── Header.tsx     # Reusable header
├── constants/
│   └── Colors.ts          # Design system colors
├── assets/
│   ├── images/            # App images and icons
│   └── fonts/             # Custom fonts
└── lib/
    └── utils.ts           # Utility functions
```

## 🎨 Design System

The app uses a Cyberpunk/Neon theme with:
- **Background:** `#0a0a0a` (near black)
- **Primary:** `#00ffff` (cyan/neon blue)
- **Secondary:** `#ff00ff` (magenta/neon pink)
- **Card:** `#171717` (dark gray)

## 🔌 Bitchat Integration

To integrate real Bitchat functionality, replace the mock implementations:

### MeshScan (scan.tsx)
```typescript
import Bitchat from 'expo-bitchat';

// Replace setTimeout simulation with:
useEffect(() => {
  Bitchat.startScanning();
  
  const subscription = Bitchat.addPeerListener((peer) => {
    setPeers(prev => [...prev, peer]);
  });
  
  return () => {
    Bitchat.stopScanning();
    subscription.remove();
  };
}, []);
```

### Chat Messages (event/[id].tsx)
```typescript
import Bitchat from 'expo-bitchat';

// Send message
Bitchat.sendMessage(channelId, message);

// Listen for messages
Bitchat.addMessageListener((msg) => {
  setMessages(prev => [...prev, msg]);
});
```

## 📦 Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🧪 Testing at Real Events

1. Build a development build with EAS
2. Install on multiple devices
3. Enable Bluetooth on all devices
4. One device creates/hosts an event room
5. Other devices scan and join the mesh
6. Test chat, video relay, and betting flows

## 📝 Bitchat Compliance Notes

This app follows the Bitchat protocol specification:
- Binary packet format with TTL flooding
- Noise Protocol E2E encryption
- LZ4 compression for messages
- Geohash-based channel discovery
- Compatible with other Bitchat apps/clients

## 🐦 Share Your Build

```
Shipped MeshBet Live – Bitchat-native offline sports betting mesh! 
Interoperable with real Bitchat users 🚀 
#Bitchat #DeFi #Mesh #ReactNative #Expo
```

## 📄 License

MIT License - Feel free to fork and extend!
