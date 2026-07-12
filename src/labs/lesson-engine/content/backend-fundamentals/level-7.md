---
series: backend-fundamentals
level: 7
title: Deployment
lang: javascript
---

# Deployment

A server running on `localhost:3000` is only accessible on your machine. Deployment means running the same code on a remote machine that is publicly reachable, always on, protected by HTTPS, and monitored so you know when it crashes.

The configuration you deploy to differs from your development environment in four important ways: the port comes from the platform (not hardcoded), HTTPS is handled by the platform (not your code), environment variables are set in a dashboard (not a `.env` file), and `NODE_ENV=production` must be set.

By the end of this lesson you will understand what a PaaS platform does for you, how to structure a Node.js app for deployment, how PM2 keeps a process running, and what graceful shutdown means and why it matters.

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

## Challenge: startup_checks

Write a `validateDeployment(env)` function that checks whether an environment is ready to deploy. It should return an object with `{ ready: boolean, errors: string[] }`.

It is ready (`ready: true`, `errors: []`) only when all of these are true:
- `env.NODE_ENV` is `'production'`
- `env.PORT` is present
- `env.JWT_SECRET` is present and has length >= 32 characters
- `env.DATABASE_URL` is present

For each missing or invalid variable, add a descriptive string to `errors`. `ready` is `false` if `errors.length > 0`.

```javascript
function validateDeployment(env) {
  const errors = []
  // check each requirement, push to errors if violated
  return { ready: errors.length === 0, errors }
}
```

```test
const good = validateDeployment({ NODE_ENV:'production', PORT:'3000', JWT_SECRET:'a'.repeat(32), DATABASE_URL:'postgres://...' })
assert good.ready === true
assert good.errors.length === 0
const bad = validateDeployment({ NODE_ENV:'development', PORT:'3000', JWT_SECRET:'short', DATABASE_URL:'postgres://...' })
assert bad.ready === false
assert bad.errors.length >= 2
const missing = validateDeployment({})
assert missing.ready === false
assert missing.errors.length >= 4
```
