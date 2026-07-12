---
series: devops-concepts
level: 5
title: DevOps — Putting It Together
lang: javascript
---

# DevOps — Putting It Together

The four concepts you have learned — environment variables, CI pipelines, containers, and deployment strategies — do not stand alone. In a real project, they form an interlocking system: a container image is built in the CI pipeline, secrets are injected via environment variables, and the image is deployed using a strategy matched to the application's risk tolerance.

This capstone lesson integrates all four into a single realistic pipeline: a complete path from a developer's `git push` to a running server in production, with health checks, rollback, and incident response built in.

## The complete DevOps pipeline

```text
FULL PIPELINE: git push → production

  DEVELOPER'S LAPTOP:
    git push origin main
    → GitHub receives the push

  GITHUB ACTIONS CI:
    Trigger: push to main
    Steps:
      1. checkout code
      2. npm ci
      3. eslint (linter)
      4. tsc --noEmit (type check)
      5. npm test (unit + integration tests — uses TEST_DATABASE_URL secret)
      6. docker build -t my-registry/my-app:$GITHUB_SHA .
      7. docker push my-registry/my-app:$GITHUB_SHA
    If any step fails: pipeline stops. No image is pushed. Slack alert fires.

  DEPLOYMENT (CD — triggered after CI passes):
    Steps:
      1. Pull the new image: docker pull my-registry/my-app:$GITHUB_SHA
      2. Run a canary: route 5% of traffic to the new version
      3. Wait 5 minutes. Monitor error rate and latency.
      4. If healthy: roll out to 100%
      5. If unhealthy: rollback (route all traffic back to previous image)

  PRODUCTION:
    Container running with injected env vars:
      DATABASE_URL, JWT_SECRET, NODE_ENV=production, PORT=3000
    Health check endpoint: GET /health → 200 OK
    Logs flowing to Datadog
    Alerts configured: error rate > 1% → page on-call
```

## A production-ready Node.js server structure

```javascript
// server.js — startup sequence that reflects DevOps discipline

import 'dotenv/config'   // loads .env in development; no-op in production (env vars are injected)

// 1. Validate configuration immediately — fail fast if misconfigured
const config = {
  port:        parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv:     process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret:   process.env.JWT_SECRET,
}

const required = ['databaseUrl', 'jwtSecret']
const missing = required.filter(k => !config[k])
if (missing.length > 0) {
  console.error('FATAL: missing required env vars:', missing.join(', '))
  process.exit(1)   // exit code 1 = failure; the platform will restart and alert
}

// 2. Connect to database
const db = await connectDatabase(config.databaseUrl)

// 3. Create and configure the server
const app = createApp({ db, config })

// 4. Health check endpoint — used by the platform and load balancer
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1')   // verify database is reachable
    res.json({ status: 'ok', version: process.env.RENDER_GIT_COMMIT ?? 'unknown' })
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' })
  }
})

// 5. Start listening
const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} (${config.nodeEnv})`)
})

// 6. Graceful shutdown: finish in-flight requests before stopping
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully')
  server.close(() => {
    db.close()
    process.exit(0)
  })
})
```

```text
WHY EACH PART EXISTS IN DEVOPS:

  dotenv/config:    No-op in production (env vars come from platform).
                    In development, reads .env for local secrets.

  fail fast:        exit(1) on startup lets the platform detect misconfiguration
                    immediately. The process manager restarts it and triggers alerts.
                    Without this, the server appears healthy until the first DB call fails.

  /health endpoint: The platform polls /health every 30 seconds.
                    If it returns 503, the platform stops routing traffic to this instance.
                    Rolling updates wait for /health to return 200 before considering
                    the new instance healthy.

  SIGTERM handler:  When deploying, the platform sends SIGTERM to the old process.
                    Graceful shutdown means: stop accepting new requests, finish current
                    ones, close DB connections, exit cleanly.
                    Without it: in-flight requests are dropped (error 502 for users).
```

**CS lens:** The `SIGTERM` signal is the operating system's standard way to ask a process to shut down. It is the "please stop" signal — unlike `SIGKILL` ("stop now, no negotiation"). The graceful shutdown pattern is a well-known distributed systems technique: a process receiving `SIGTERM` should drain its work queue (finish current requests), release its resources (close database connections, flush write buffers), and then exit. This prevents data corruption and user-visible errors during rolling deployments.

## The .dockerignore and security posture

```text
.dockerignore (prevents secrets and large directories from entering the image):
  node_modules
  .env
  .git
  dist
  *.log
  coverage
  .nyc_output
  README.md
  .github

SECURITY CHECKLIST FOR A PRODUCTION CONTAINER:
  ✓ .env is in .dockerignore (secrets not in the image)
  ✓ Image runs as non-root user (USER node in Dockerfile)
  ✓ No development dependencies in the image (npm ci --omit=dev)
  ✓ Base image is pinned (node:20.11.0-alpine not node:latest — latest can change)
  ✓ No secrets in Dockerfile (use ENV with runtime injection, not baked values)
  ✓ Image is scanned for vulnerabilities (docker scout, Snyk, Trivy in CI)
```

**SE lens:** Pinning the base image (`node:20.11.0-alpine` rather than `node:20-alpine`) applies the same principle as the package lock file: the exact version is recorded so that rebuilding the image next month uses the same base, not a newer one that might have breaking changes or new vulnerabilities. The tradeoff: you must manually update the pin to get security patches. Most teams automate this with Dependabot or Renovate, which opens a PR when a new Node.js image is available.

**Common mistakes in production:**
- Not handling SIGTERM — the platform sends SIGTERM when deploying. If the process ignores it (the default Node.js behaviour kills the process immediately after a 30-second grace period), in-flight requests are dropped. Always handle SIGTERM.
- Health check that always returns 200 — a health check that does not verify the database connection hides DB outages. The platform thinks the instance is healthy, keeps routing traffic, and all requests fail. Make the health check actually check dependencies.
- Leaking environment variables in logs — `console.log('Starting with config:', config)` logs `jwtSecret` to the log aggregation system. Log only non-secret fields: `console.log('Starting with port:', config.port, 'env:', config.nodeEnv)`.

**Debug tip:** To simulate the production environment locally:
```text
  docker build -t my-app .
  docker run \
    -p 3000:3000 \
    -e DATABASE_URL=postgres://localhost:5432/mydb \
    -e JWT_SECRET=test-secret \
    -e NODE_ENV=production \
    my-app

  Then: curl http://localhost:3000/health
  Expected: {"status":"ok","version":"unknown"}
```
Running the container locally with production env vars is the closest you can get to reproducing a production issue without actually having access to production. Many "works locally, breaks in production" bugs are caught this way.

## Challenge: production_startup

Implement a production server startup sequence with validation, health check logic, and graceful shutdown.

```challenge
function createProductionServer(env, deps) {
  // env: object (like process.env) — contains config vars
  // deps: { listen(port, cb), close(cb), checkDb() } — platform abstractions
  //
  // Returns: { start(), stop(), getHealth() }
  //
  // start():
  //   Validate: PORT (default 3000), DATABASE_URL (required), NODE_ENV (default 'production')
  //   If DATABASE_URL is missing: throw Error('DATABASE_URL is required')
  //   Call deps.listen(port, cb) to start the server
  //   Return { port, nodeEnv }
  //
  // stop():
  //   Call deps.close(cb) to stop the server gracefully
  //   Return: Promise that resolves when close() calls its callback
  //
  // getHealth():
  //   Call deps.checkDb() — returns true if healthy, false if not
  //   Return: { status: 'ok' } if checkDb() returns true
  //   Return: { status: 'error', message: 'Database unavailable' } if false
}
```

```test
const startLog = []
const deps = {
  listen(port, cb) { startLog.push(`listen:${port}`); cb() },
  close(cb) { startLog.push('close'); cb() },
  checkDb: () => true,
}

const server = createProductionServer(
  { PORT: '8080', DATABASE_URL: 'postgres://localhost/db', NODE_ENV: 'production' },
  deps
)

const result = await server.start()
assert result.port === 8080
assert result.nodeEnv === 'production'
assert startLog.includes('listen:8080')

const health = server.getHealth()
assert health.status === 'ok'

await server.stop()
assert startLog.includes('close')

// Missing DATABASE_URL throws:
let threw = false
try {
  const bad = createProductionServer({ PORT: '3000' }, deps)
  await bad.start()
} catch (e) {
  threw = true
  assert e.message === 'DATABASE_URL is required'
}
assert threw
```
