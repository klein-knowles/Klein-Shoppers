# Klein Shoppers Deployment Checklist

## 1. Server Requirements

- Node.js 20 or newer
- MySQL 8 or compatible MariaDB
- HTTPS termination through your host, reverse proxy, or load balancer
- A process manager such as PM2, Render, Railway, Fly.io, or your host's Node service runner

## 2. Environment

Create a production `.env` from `.env.example`.

Required values:

- `NODE_ENV=production`
- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `SESSION_SECRET`
- `JWT_SECRET`

Use unique random values of at least 32 characters for `SESSION_SECRET` and `JWT_SECRET`.

When serving over HTTPS, keep:

```env
SESSION_SECURE=true
```

For local HTTP testing only, use:

```env
SESSION_SECURE=false
```

## 3. Database

1. Create the production database and user.
2. Give the app user permissions to create and alter tables in the app database during migration.
3. Set the production database variables in the service environment.
4. Run the additive, repeatable migration against the selected database:

```bash
npm run db:migrate
```

The migration creates missing application tables and adds compatibility columns to the original schema. It does not drop tables or seed accounts. Back up an existing production database before applying it. Do not import the legacy `Db.sql`; it contains conflicting table definitions and development seed data.

## 4. Languages

The public site supports English, French, Swahili, Spanish, Punjabi, and Simplified Chinese. Generate the static translation files before publishing, using a valid OpenAI API key in the local environment:

```bash
npm run i18n:build
```

This writes the generated files to `public/i18n/`. Include those files in the deployment artifact; the site does not translate pages at runtime.

## 5. Install And Start

```bash
npm ci --omit=dev
npm start
```

Health check:

```bash
curl https://your-domain.example/health
```

Expected response:

```json
{"ok":true,"service":"klein-shoppers","environment":"production","database":"connected"}
```

## 6. Smoke Tests

- Open `/`
- Open `/products.html`
- Open `/videos.html`
- Register and log in as a customer
- Add an item to cart
- Open `/checkout.html`
- Open `/customer-service.html`
- Log in to `/admin/login.html`
- Open `/admin`
- Open `/admin/videos.html`
- Open `/health`

## 7. Before Going Live

- Configure real SMTP credentials, payment provider credentials, and an OpenAI API key if AI chat is enabled. Keep secrets in the hosting provider's secret store; never commit them.
- Rotate any secrets that were ever committed or shared.
- Confirm HTTPS is active before setting `SESSION_SECURE=true`.
- Confirm `public/uploads` is backed up or mounted as persistent storage.
- Mount persistent storage for `public/uploads/videos`; video metadata is stored in MySQL.
- Run `npm test`.
