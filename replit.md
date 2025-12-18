# MeshBet Live - React Native (Expo)

A decentralized, offline-first mobile app for local sports/fights viewing parties with real-time crypto betting. Built with Expo, NativeWind, and the Bitchat protocol.

## Overview

This is an Expo React Native application running in web mode on Replit. It features:
- Expo SDK 54 with New Architecture enabled
- NativeWind (Tailwind CSS for React Native) styling
- Expo Router (file-based routing)
- React Native Reanimated for animations
- Cyberpunk/Neon design theme
- P2P betting system with cryptographic signatures
- P2P video streaming with chunked transfer

## Service Architecture

### Real Service Layers (lib/services/)

1. **bitchat.ts** - Mesh networking via expo-bitchat
   - `initialize()`, `startServices()`, `startDiscovery()`
   - Event listeners: `onPeerConnected`, `onPeerDisconnected`, `onStatusChange`
   - Mock fallback for web preview (generates fake peers after 2s delay)
   - Real Bluetooth mesh on native iOS/Android builds

2. **wallet.ts** - HD Wallet with BIP39
   - Uses ethers.js for wallet generation and signing
   - 12-word seed phrase with secure storage (expo-secure-store)
   - `createWallet()`, `restoreFromMnemonic()`, `signMessage()`
   - Backup confirmation tracking

3. **sportsData.ts** - Live Sports & Odds
   - The Odds API integration for real-time events
   - Sports: UFC/MMA, NFL, NBA, MLB, NHL, Soccer
   - Odds formatting (American/Decimal)
   - Offline caching with AsyncStorage (5-min TTL)

4. **betting.ts** - P2P Betting System
   - Bet creation, acceptance, and settlement
   - Message types: BET_PROPOSAL, BET_ACCEPT, BET_SETTLE, BET_CANCEL
   - Cryptographic signatures via wallet service
   - Bet status: open, pending, accepted, settled, cancelled
   - Stats tracking: wins, losses, win rate

5. **streaming.ts** - P2P Video Streaming
   - Chunked transfer (16KB chunks, 30-chunk buffer)
   - Stream metadata broadcasting
   - Quality settings (low/medium/high)
   - Host/viewer management

## Screen Status (Mock Data Audit)

All screens now use real service layers:
- **Lobby Tab** - Real betting service, mesh peers, sports data
- **Events Tab** - Real sports data API with live odds
- **Wallet Tab** - Real wallet service with transaction history
- **Mesh Tab** - Real bitchat service for peer discovery
- **Profile Tab** - Real stats from betting and wallet services
- **Create Bet** - Real betting service with event selection
- **Event Room** - Real chat messages and bets via mesh
- **Scan Modal** - Real peer discovery via bitchat
- **Settings** - Persistent settings with AsyncStorage, wallet export, emergency wipe

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
