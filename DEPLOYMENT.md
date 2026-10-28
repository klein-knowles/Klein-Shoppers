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
2. Import `Db.sql`.
3. Give the app user permissions for the app database only.
4. Confirm the app can create the `sessions` table, or create it manually:

```sql
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(128) NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expires DATETIME NOT NULL,
  INDEX idx_sessions_expires (expires)
);
```

## 4. Install And Start

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
{"ok":true,"service":"klein-shoppers"}
```

## 5. Smoke Tests

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

## 6. Before Going Live

- Replace all placeholder SMTP and OpenAI values.
- Rotate any secrets that were ever committed or shared.
- Confirm HTTPS is active before setting `SESSION_SECURE=true`.
- Confirm `public/uploads` is backed up or mounted as persistent storage.
- Run `npm test`.
