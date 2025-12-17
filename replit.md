# MeshBet Live - React Native (Expo)

A decentralized, offline-first mobile app for local sports/fights viewing parties with real-time crypto betting. Built with Expo, NativeWind, and the Bitchat protocol.

## Overview

This is an Expo React Native application running in web mode on Replit. It features:
- Expo SDK 52 with New Architecture enabled
- NativeWind (Tailwind CSS for React Native) styling
- Expo Router (file-based routing)
- React Native Reanimated for animations
- Cyberpunk/Neon design theme

## Project Structure

```
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
│   └── fonts/             # Custom fonts (SpaceMono)
└── lib/
    └── utils.ts           # Utility functions
```

## Running the App

The app runs in web mode via:
```bash
npm run dev
```

This starts Expo on port 5000 in LAN mode for web development.

## Design System

The app uses a Cyberpunk/Neon theme:
- **Background:** `#0a0a0a` (near black)
- **Primary:** `#00ffff` (cyan/neon blue)
- **Secondary:** `#ff00ff` (magenta/neon pink)
- **Card:** `#171717` (dark gray)

## Notes

- The app is configured to run in web mode for Replit compatibility
- Some native features (Bluetooth mesh, native modules) are not available in web mode
- A symlink for `react-native-worklets` was created to resolve NativeWind compatibility
- Placeholder images are used for logo and background assets
