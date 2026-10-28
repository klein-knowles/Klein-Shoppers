# Klein Shoppers Uganda

Installable mobile shopping app built as a Progressive Web App.

## Expanded website

The website now includes a larger marketplace-style shopping experience:

- Home page with department rails, deal rows, product quick view, and cart quantity controls
- 50 original Klein Shoppers products across electronics, home, fashion, beauty, grocery, office, baby, sports, automotive, books, toys, garden, pets, appliances, and BUBU local goods
- Extra pages: `deals.html`, `departments.html`, `sell.html`, `customer-service.html`, `account.html`, `orders.html`, and `videos.html`
- PWA service worker cache updated for the new pages

## Android and iOS apps

A native-phone app project has been added in `mobile/`. It uses Expo React Native and shares the storefront flow from the website: home, deals, categories, search, product details, cart quantities, and checkout handoff.

```bash
cd mobile
npm install
npm run start
```

See `mobile/README.md` for Android, iOS, and EAS build commands.

## Flutter Android and iOS apps

A Flutter/Dart version has also been added in `mobile_flutter/`.

```bash
cd mobile_flutter
flutter pub get
flutter run
```

Open `mobile_flutter/` in Visual Studio when working from your preferred IDE, or use the Flutter CLI commands above.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:5000/`.

## Install on a phone

Host the folder on HTTPS, then open the site in a mobile browser and choose the browser's install or add-to-home-screen option. Localhost works for desktop testing, but real phones generally need an HTTPS-hosted URL.

## Database setup

Set the database variables in your local environment, then run `npm run db:migrate` to create or upgrade the MySQL schema. The migration is additive and repeatable; back up any existing production database first. Do not import the deprecated `Db.sql` file.
