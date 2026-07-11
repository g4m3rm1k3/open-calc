---
series: backend-fundamentals
level: 5
title: Environment Variables and Configuration
lang: javascript
---

# Environment Variables and Configuration

Never hardcode secrets (database passwords, API keys, JWT secrets) in source code. Environment variables separate configuration from code, and `.env` files make local development manageable.

## process.env and .env files

```javascript
// .env file (NEVER commit this to git)
DATABASE_URL=postgresql://postgres:secret@localhost:5432/myapp
JWT_SECRET=f3a8b2c7d1e6f9a4b8c2d7e3f1a6b9c4d8e2f7a3b6c9d1e4f8a2b7c3d6e9f4
PORT=3000
NODE_ENV=development

// Load .env in development:
// npm install dotenv
require('dotenv').config(); // must be called before any process.env access

// Access variables:
const port = parseInt(process.env.PORT ?? '3000');
const jwtSecret = process.env.JWT_SECRET;
const dbUrl = process.env.DATABASE_URL;

if (!jwtSecret) throw new Error('JWT_SECRET environment variable is required');
```

```text
process.env is a plain object containing all environment variables.
Variables set in the OS or by the deployment platform (Heroku, Railway, etc.)
are available automatically — dotenv is only needed locally.

The .env file is listed in .gitignore:
  node_modules/
  .env          ← never commit secrets

In production: set environment variables in the platform's dashboard (Heroku config vars,
Railway variables, Vercel environment variables, AWS Parameter Store).
```

**CS lens:** Environment variables are the **12-Factor App** methodology's solution to configuration. Factor III: "Store config in the environment." The key insight: configuration differs between deployments (dev/staging/prod), but code does not. Embedding configuration in code forces code changes to change configuration — violating separation of concerns.

## Configuration module pattern

```javascript
// config.js — centralize all env access
const config = {
  port: parseInt(process.env.PORT ?? '3000'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Required environment variable ${name} is not set`);
  return value;
}

module.exports = config;
```

```text
// Usage:
const config = require('./config');
app.listen(config.port);
const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

Benefits:
- Crashes at startup (not at request time) if required vars are missing
- All configuration in one place — easy to audit what the app needs
- TypeScript users: add type annotations to make config shape explicit
```

## CORS — cross-origin requests

```javascript
// npm install cors
const cors = require('cors');

// Allow specific origin (recommended for production)
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,  // allow cookies to be sent cross-origin
}));

// Why CORS exists:
// Browser security policy prevents JavaScript on example.com from fetching
// api.other-domain.com without explicit permission.
// CORS (Cross-Origin Resource Sharing) is the server's permission grant.
// The browser checks the CORS headers before completing the request.
```

```text
Without CORS header:
Browser: "api.other-domain.com didn't grant permission to http://localhost:5173"
→ "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

With CORS header:
Server sends: Access-Control-Allow-Origin: http://localhost:5173
Browser: "permission granted, completing request"

CORS is enforced by the BROWSER, not the server.
curl and Postman ignore CORS — they're not browsers.
CORS errors in the browser console = missing CORS headers on the server.
```

**SE lens:** CORS errors are the most common backend-related error frontend developers encounter. Understanding that CORS is a browser enforcement mechanism (not a server security measure) clarifies why the fix is always on the server side. A `cors()` middleware adds the necessary response headers. The `credentials: true` option is required when the frontend sends cookies or Authorization headers — without it, the browser blocks the request even with CORS enabled.

**Common mistakes:**
- Setting `origin: '*'` (allow all origins) in production with `credentials: true` — browsers reject this combination. You must specify the exact origin when credentials are involved.
- Accessing `process.env.SECRET` before calling `dotenv.config()` — returns `undefined` even if `.env` has the value.

**Debug tip:** CORS errors appear in the browser console, not the server log. The server receives the request and sends a response — the browser is the one rejecting it. Check browser DevTools → Network tab → look at the response headers for `Access-Control-Allow-Origin`.

**Next:** Testing — unit tests with Jest, integration tests with Supertest, and what to test in an API.

## Challenge: env_config

Build a config object from environment variables.

```javascript
// Simulate process.env for this exercise:
const env = {
  PORT: '4000',
  JWT_SECRET: 'my-secret-key',
  NODE_ENV: 'production',
};

function buildConfig(env) {
  // Return an object with:
  // port: number (parsed from env.PORT, default 3000)
  // jwtSecret: string (from env.JWT_SECRET)
  // isProd: boolean (true if env.NODE_ENV === 'production')
}

const config = buildConfig(env);
```

```test
assert config.port === 4000
assert config.jwtSecret === 'my-secret-key'
assert config.isProd === true
var config2 = buildConfig({ PORT: '3000', JWT_SECRET: 'x', NODE_ENV: 'development' })
assert config2.isProd === false
assert config2.port === 3000
```
