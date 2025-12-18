# MeshBet Live - React Native (Expo)

A decentralized, offline-first mobile app for local sports/fights viewing parties with real-time crypto betting. Built with Expo, NativeWind, and the Bitchat protocol.

## Overview

This is an Expo React Native application running in web mode on Replit. It features:
- Expo SDK 54 with New Architecture enabled
- NativeWind (Tailwind CSS for React Native) styling
- Expo Router (file-based routing)
- React Native Reanimated for animations
- Cyberpunk/Neon design theme

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation (5 tabs)
│   │   ├── index.tsx      # Home/Lobby screen
│   │   ├── events.tsx     # Live events
│   │   ├── wallet.tsx     # Wallet screen (center tab)
│   │   ├── mesh.tsx       # Mesh network scanner with radar animation
│   │   └── profile.tsx    # User profile with stats
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Splash screen (checks onboarding status)
│   ├── onboarding.tsx     # 3-step onboarding with persistence
│   ├── scan.tsx           # Mesh scanner modal
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
│   └── fonts/             # Custom fonts (SpaceMono)
└── lib/
    └── utils.ts           # Utility functions
```

## Running the App

The app runs in web mode via:
```bash
npm run dev
```

This starts Expo on port 5000 with tunnel mode for mobile testing.

### Mobile Testing with Expo Go

Scan the QR code from the terminal or use the tunnel URL:
`exp://tnrgqu8-anonymous-5000.exp.direct`

## Tab Navigation

The app has a 5-tab layout:
1. **LOBBY** (home) - Main betting lobby
2. **LIVE** (radio) - Live events
3. **WALLET** (center, elevated) - Wallet with cyan glow
4. **MESH** (radio) - Mesh network scanner
5. **ME** (person) - User profile

## Design System

The app uses a Cyberpunk/Neon theme:
- **Background:** `#0a0a0a` (near black)
- **Primary:** `#00ffff` (cyan/neon blue)
- **Secondary:** `#ff00ff` (magenta/neon pink)
- **Card:** `#171717` (dark gray)
- **Border:** `rgba(255,255,255,0.1)`

All buttons have subtle glow effects using shadow with primary color.

## Key Features

### Onboarding Flow
- Step 1: Enable Mesh Mode (simulates Bluetooth permissions)
- Step 2: Create Wallet (generates wallet address, persists to AsyncStorage)
- Step 3: Set Identity (username validation, persists to AsyncStorage)
- Persists `onboarding_complete` flag for skip on next launch

### Mesh Scanner
- Radar-style animation with concentric rings
- Rotating sweep line
- Peer nodes appear as magenta dots with fade-in animation
- Pulsing center point representing the user

### Profile Screen
- Username and wallet from AsyncStorage
- Mesh status indicator (connected/disconnected)
- Stats: Total Bets, Win Rate, Total Won
- Menu items: History, Settings, Security, Help

## Notes

- The app is configured to run in web mode for Replit compatibility
- Some native features (Bluetooth mesh, native modules) are not available in web mode
- Expo Go SDK 54+ is required for mobile testing
- Custom RadarIcon component (SVG) used for MESH tab icon - matches Lucide Radar style
- GitHub connector configured for BlockSavvy/meshbet-live repo access
