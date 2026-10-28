# Klein Shoppers Global Flutter

Flutter and Dart phone app for Klein Shoppers Global, based on the current website storefront.

## Requirements

- Flutter 3.29.3 or newer
- Android Studio for Android emulator or Android device builds
- macOS with Xcode for local iOS simulator/device builds

## Run

```bash
flutter pub get
flutter run --dart-define=KLEIN_API_BASE_URL=http://10.0.2.2:5000
```

The home screen includes the Klein Assistant. It sends questions to the
store backend's `/chat` route; keep `OPENAI_API_KEY` configured on the backend
and never put that key in the app. The default API address above is for the
Android emulator. For a physical device, replace `10.0.2.2` with the computer's
LAN address; for iOS or a deployed backend, pass its reachable API origin using
`KLEIN_API_BASE_URL`. Local HTTP is enabled only in Android debug builds, so
release builds should use an HTTPS backend.

Run a specific platform:

```bash
flutter run -d android --dart-define=KLEIN_API_BASE_URL=http://10.0.2.2:5000
flutter run -d ios --dart-define=KLEIN_API_BASE_URL=https://your-api-host
```

## Build

Android APK:

```bash
flutter build apk --release
```

Android App Bundle:

```bash
flutter build appbundle --release
```

iOS release build requires macOS and Xcode:

```bash
flutter build ios --release
```

## Features

- Native Flutter storefront based on the Klein Shoppers Global website
- Home, deals, categories, and cart tabs
- Search and category filtering
- Website-matched hero actions for deals and department browsing
- Website-matched department shortcuts for electronics, grocery, appliances, office, baby, sports, automotive, and BUBU
- Product detail bottom sheet
- Quick actions for buy-again, saved items, delivery slots, and payment methods
- Save-for-later product hearts with an account saved-item count
- Account shortcuts for addresses, payment methods, orders, support, and seller tools
- Cart delivery slot panel with delivery fee and estimated savings summary
- Cart quantity controls and subtotal
- Checkout integration placeholder
- Android display name: `Klein Shoppers Global`
- Android package: `com.kleinshoppers.uganda`
- iOS display name: `Klein Shoppers Global`
- iOS bundle identifier: `com.kleinshoppers.uganda`
