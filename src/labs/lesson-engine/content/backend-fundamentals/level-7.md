---
series: backend-fundamentals
level: 7
title: Deployment
lang: javascript
---

# Deployment

A local Node.js server isn't the internet. Deployment means running your app on a server that's always on, accessible by a public URL, secured with HTTPS, and monitored so crashes are detected.

## Preparing for production

```javascript
// package.json
{
  "scripts": {
    "start":   "node server.js",        // production start
    "dev":     "nodemon server.js",     // development (auto-restart on file change)
    "test":    "jest",
    "migrate": "node-pg-migrate up"
  },
  "engines": {
    "node": ">=20.0.0"  // tell the platform what Node version to use
  }
}
```

```javascript
// server.js — production server
const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`Server started on port ${config.port} in ${config.nodeEnv} mode`);
});

// Graceful shutdown — finish in-flight requests before stopping
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

```text
Differences between development and production:
- NODE_ENV=production disables stack traces in error responses
- All environment variables are set on the platform, not in .env
- npm install --production skips devDependencies (jest, nodemon, etc.)
- The platform assigns the PORT — your app reads process.env.PORT
- HTTPS is provided by the platform (Heroku, Railway) — not your code
```

## PM2 — process manager

PM2 keeps your app running. If it crashes, PM2 restarts it. On a VPS (Virtual Private Server), PM2 also starts your app when the server boots.

```text
npm install -g pm2

# Start the app:
pm2 start server.js --name myapp

# Auto-restart on crash, watch for crashes:
pm2 start server.js --name myapp --watch

# Show all running apps:
pm2 list
→ ┌──────────┬────┬──────┬──────────┬─────────┐
  │ name     │ id │ mode │ status   │ restart │
  ├──────────┼────┼──────┼──────────┼─────────┤
  │ myapp    │ 0  │ fork │ online   │ 0       │
  └──────────┴────┴──────┴──────────┴─────────┘

# View logs:
pm2 logs myapp

# Save config and enable startup:
pm2 save
pm2 startup  # generates the command to run on boot
```

## Deploying to Railway

Railway is a platform-as-a-service (PaaS) — it manages the server infrastructure. You push code; Railway builds and runs it.

```text
1. Sign up at railway.app
2. Create a new project → Deploy from GitHub repo
3. Add environment variables:
   DATABASE_URL → Railway can provision a PostgreSQL database automatically
   JWT_SECRET   → generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   NODE_ENV     → production

4. Railway detects package.json and runs:
   npm install
   npm start   (from scripts.start)

5. Railway provides:
   - A public URL (https://myapp.up.railway.app)
   - Automatic HTTPS (TLS certificate)
   - Logs (railway logs)
   - Metrics (CPU, memory, request count)
   - Auto-deploy on git push to main branch
```

**CS lens:** PaaS platforms like Railway, Heroku, and Render implement the **infrastructure abstraction** layer. They handle the OS, runtime version, process management, networking, and TLS. You deploy application code and configuration. The alternative — managing your own VPS — gives more control but requires configuring nginx, certbot (for TLS), PM2, firewalls, and OS security updates. PaaS trades control for simplicity — the right choice for most web apps.

**SE lens:** Continuous deployment (CD) — auto-deploying when code is pushed to `main` — is standard practice. Combined with a CI step (run tests before deploy), it means: push code → tests run → if passing → deploy automatically. This pipeline is what `main is prod` means in practice. Broken code is caught in CI before it reaches users.

**Common mistakes:**
- Committing `.env` to git — even in a private repo, this is a security risk. Add `.env` to `.gitignore` immediately when starting a project.
- Not setting `NODE_ENV=production` — some frameworks (Express, React) have performance optimizations gated behind this variable. Development mode is slower and more verbose.

**Debug tip:** `railway logs` (or `heroku logs --tail`) streams live application logs. If a deployment fails or a request errors, this is the first place to look. The `console.error(err.stack)` in your error middleware writes there.

**Congratulations — Backend Fundamentals complete!** You've covered HTTP, Express, async handlers, authentication, database integration, environment variables, testing, and deployment.

## Challenge: graceful_shutdown

Implement graceful shutdown logic.

```javascript
function createShutdownHandler(server, onShutdown) {
  // Return a function that:
  // 1. Logs 'Shutting down...'
  // 2. Calls server.close() with a callback
  // 3. In the callback, calls onShutdown()
}
```

```test
var closed = false
var callbackCalled = false
var mockServer = { close(cb) { closed = true; cb(); } }
var handler = createShutdownHandler(mockServer, () => { callbackCalled = true; })
handler()
assert closed === true
assert callbackCalled === true
```
