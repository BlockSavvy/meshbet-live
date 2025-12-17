# MeshBet Live - Complete Deployment Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- An Expo account (https://expo.dev/signup)
- EAS CLI installed (`npm install -g eas-cli`)
- Apple Developer account (for iOS builds)
- Google Play Console account (for Android builds)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/BlockSavvy/meshbet-live.git
cd meshbet-live

# Install dependencies
npm install
```

## Step 2: Configure Expo Account

```bash
# Login to Expo
eas login

# Verify you're logged in
eas whoami
```

## Step 3: Configure EAS Project

```bash
# Link to your Expo project (first time only)
eas init

# This will:
# 1. Create a project on expo.dev
# 2. Link your local project to it
# 3. Generate a unique project ID
```

## Step 4: Configure App Credentials

### For iOS:
```bash
# Configure iOS credentials (requires Apple Developer account)
eas credentials --platform ios

# Options:
# - Use Expo-managed credentials (recommended for testing)
# - Use your own Apple Developer credentials
```

### For Android:
```bash
# Configure Android credentials
eas credentials --platform android

# This will generate a keystore for signing your app
```

## Step 5: Build for Development

### Development Build (for testing with Expo Go alternative)
```bash
# Build for iOS Simulator
eas build --profile development --platform ios

# Build for Android Emulator/Device
eas build --profile development --platform android
```

### Preview Build (internal testing)
```bash
# Build APK for Android
eas build --profile preview --platform android

# Build for iOS (Ad Hoc distribution)
eas build --profile preview --platform ios
```

## Step 6: Build for Production

```bash
# Build production iOS app
eas build --profile production --platform ios

# Build production Android app
eas build --profile production --platform android

# Build both platforms
eas build --profile production --platform all
```

## Step 7: Submit to App Stores

### iOS App Store:
```bash
eas submit --platform ios
```

### Google Play Store:
```bash
eas submit --platform android
```

## Step 8: Over-The-Air Updates

After your app is published, you can push updates without rebuilding:

```bash
# Publish an update
eas update --branch production --message "Bug fixes and improvements"
```

## Environment Variables & Secrets

Configure secrets for your app:

```bash
# Set a secret (will be encrypted)
eas secret:create --name WALLET_CONNECT_PROJECT_ID --value "your_project_id"
eas secret:create --name BITCHAT_API_KEY --value "your_api_key"
```

## Testing Locally

```bash
# Start Expo development server
npx expo start

# Run on iOS Simulator
npx expo run:ios

# Run on Android Emulator
npx expo run:android
```

## Troubleshooting

### Build Failures
- Check Expo status: https://status.expo.dev
- Review build logs on expo.dev dashboard
- Ensure all native dependencies are compatible

### Permissions Issues
- Verify Bluetooth permissions in app.json
- Check location permissions for geohash discovery

### Native Module Issues
- Run `npx expo prebuild` to generate native projects
- Check for expo-bitchat compatibility

## Quick Reference Commands

| Command | Description |
|---------|-------------|
| `npx expo start` | Start development server |
| `eas build --profile preview --platform android` | Build preview APK |
| `eas build --profile production --platform all` | Build production apps |
| `eas submit --platform ios` | Submit to App Store |
| `eas submit --platform android` | Submit to Play Store |
| `eas update --branch production` | Push OTA update |

## Support

For issues with:
- **Expo/EAS**: https://docs.expo.dev
- **React Native**: https://reactnative.dev/docs
- **Bitchat Protocol**: https://github.com/quiint/expo-bitchat
- **WalletConnect**: https://docs.walletconnect.com

---

**Your app is ready to launch!** 🚀
