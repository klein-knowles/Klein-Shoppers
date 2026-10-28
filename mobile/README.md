# Klein Shoppers Mobile

Android and iOS app for Klein Shoppers Uganda, built with Expo React Native.

## Requirements

- Node.js 22.13 or newer
- npm
- Android Studio for local Android emulator/device builds
- macOS with Xcode for local iOS simulator/device builds, or EAS Build for cloud iOS builds

## Install

```bash
npm install
```

## Run During Development

```bash
npm run start
```

Then scan the QR code with Expo Go, or run one of:

```bash
npm run android
npm run ios
```

## Build Phone Apps

Preview Android build:

```bash
npm run build:android -- --profile preview
```

Preview iOS build:

```bash
npm run build:ios -- --profile preview
```

Production builds:

```bash
npm run build:android -- --profile production
npm run build:ios -- --profile production
```

## App Features

- Mobile storefront based on the existing website categories and catalog
- Home, deals, categories, and cart tabs
- Search and department filtering
- Product detail sheet
- Cart quantities, subtotal, and checkout handoff placeholder
- Native Android package: `com.kleinshoppers.uganda`
- Native iOS bundle identifier: `com.kleinshoppers.uganda`
