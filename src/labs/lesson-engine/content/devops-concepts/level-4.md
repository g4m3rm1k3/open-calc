---
series: devops-concepts
level: 4
title: Deployment — Getting Code to Production
lang: javascript
---

# Deployment — Getting Code to Production

Deployment is the moment your code leaves the safety of your development environment and becomes the thing real users interact with. It is the most consequential step in the development cycle — and historically, the most feared. Deployments failed unpredictably, required manual steps that different people performed differently, and took the site offline for maintenance windows.

Modern deployment practices make deployment routine: small changes, automated, frequent, with fast rollback. By the end of this lesson you will understand deployment strategies (how to move from old code to new code without downtime), what hosting platforms do, and how to reason about production incidents.

## What deployment means at each layer

```text
WHAT CHANGES IN A DEPLOYMENT:

  Code:
    New version of the application is available (built and tested).

  Deployment step:
    The running process is replaced with the new version.
    For a Node.js server, this means: stop the old process, start the new one.
    OR: for zero-downtime deployments, new processes start BEFORE old ones stop.

  The goal:
    Users must not notice. No requests should fail. No data should be lost.
    The transition from old version to new version should be seamless.
```

## Deployment strategies

```text
STRATEGY 1: RECREATE (simplest, has downtime)
  Stop all old instances. Start all new instances.
  → Brief downtime between stop and start.
  → Simple to implement.
  → Only acceptable for development/staging or for services with no real users.

STRATEGY 2: ROLLING UPDATE (most common)
  Replace instances one at a time (or a few at a time).
  At any moment, some instances run the old version, some the new.
  → No downtime (traffic is always being served).
  → Risk: old and new versions run simultaneously — be careful with breaking changes.
  → Used by: Kubernetes (default), most PaaS platforms.

STRATEGY 3: BLUE-GREEN
  Two identical environments: "blue" (current production) and "green" (new version).
  Deploy to green. Test green. Switch traffic from blue to green (instant load balancer flip).
  Keep blue running for fast rollback.
  → No downtime. Instant rollback (flip back to blue).
  → More expensive (two environments).
  → Best for high-traffic, low-risk-tolerance systems.

STRATEGY 4: CANARY
  Route a small percentage of traffic (e.g. 1%, 5%) to the new version.
  Monitor error rates and performance.
  Gradually increase the percentage if metrics are healthy.
  Roll back if metrics degrade.
  → Limits blast radius of a bad deployment.
  → Used by: Netflix, Google, Amazon for large-scale services.
```

**CS lens:** These deployment strategies are all variants of **state transition with invariant preservation**. The invariant is: "at least one healthy instance is serving traffic at all times." Recreate violates this invariant (there is a gap). Rolling update, blue-green, and canary preserve it. The tradeoff is complexity vs. risk. Violating the invariant is only acceptable when the service is not mission-critical or when the window of downtime is planned and communicated.

## Hosting platforms

You do not need to manage your own servers to deploy. Platform-as-a-Service (PaaS) providers manage the infrastructure; you provide the code or container.

```text
HOSTING OPTIONS (roughly in order of abstraction):

  BARE METAL / VPS (e.g. DigitalOcean Droplet, Hetzner):
    You provision a virtual machine, install the OS, Node.js, configure nginx, etc.
    Full control. Full responsibility. Steep operational overhead.

  PLATFORM AS A SERVICE (e.g. Heroku, Render, Railway, Fly.io):
    You push code or a container. The platform handles OS, networking, scaling.
    Simple deployments. Limited configuration. Higher cost at scale.
    Render: git push → auto-deploy. Docker support. Free tier.
    Fly.io:  docker build → fly deploy. Global anycast networking.

  CONTAINER ORCHESTRATION (e.g. AWS ECS, Kubernetes, Google Cloud Run):
    You provide a container image. The platform schedules and runs it.
    Scales to many instances. More configuration. Used for production at scale.

  SERVERLESS (e.g. AWS Lambda, Cloudflare Workers, Vercel Edge Functions):
    You provide a function. The platform runs it on demand (per request).
    No servers to manage. Scales to zero (no cost when idle).
    Cold starts, execution time limits, stateless-only.
```

## A deployment to Render (example)

Render is a common PaaS for Node.js applications. Connecting it to GitHub enables automatic deployments on push.

```text
SETUP:
  1. Connect repository: Render → New Web Service → Connect GitHub repo
  2. Configure:
     Runtime: Node
     Build command: npm ci && npm run build
     Start command: node dist/server.js
     Environment variables: set DATABASE_URL, PORT, NODE_ENV in Render dashboard
  3. Every push to 'main' triggers:
     → Render clones the repo
     → Runs the build command
     → Starts the new process (rolling update)
     → Old process is stopped when the new one is healthy

FOR DOCKER DEPLOYMENTS:
  Build command: docker build -t my-app .
  Start: docker run -p 3000:3000 my-app
  OR:   push the image to a registry, configure Render to pull it
```

## Environment variables in production

```javascript
// On any PaaS:
//   You set environment variables in the platform's dashboard (NOT in .env).
//   The platform injects them into the process at runtime.
//   Your code reads them as always: process.env.DATABASE_URL

// The critical ones for a Node.js server in production:
const requiredVars = [
  'DATABASE_URL',      // where the database is
  'JWT_SECRET',        // long random string for signing tokens
  'NODE_ENV',          // 'production'
  'PORT',              // usually set automatically by the platform
]

// On startup, validate all required env vars exist:
function validateEnv() {
  const missing = requiredVars.filter(name => !process.env[name])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

validateEnv()   // call before doing anything else — fail fast if misconfigured
```

**SE lens:** The "fail fast" principle applied to environment variables means that a misconfigured server crashes immediately on startup with a clear error message, rather than running for 30 minutes and then crashing when it first tries to connect to the database. Fast failures are easier to diagnose and fix than slow failures. In production, a quick restart with a clear log entry beats a prolonged degraded state with cryptic errors.

## Production incidents: what happens when things break

```text
THE PRODUCTION INCIDENT LIFECYCLE:

  DETECTION:
    Monitoring detects elevated error rates (> 1% of requests returning 500).
    OR: a user reports a problem.
    OR: a health check endpoint (/health) starts returning a non-200 status.

  RESPONSE:
    On-call engineer is paged (PagerDuty, OpsGenie, Slack alert).
    Incident channel is opened. Others are notified.

  DIAGNOSIS:
    Check logs: what errors are appearing? (log aggregation: Datadog, Logtail, Papertrail)
    Check metrics: which service is affected? Is it the DB, the API, a specific endpoint?
    Check recent deployments: was there a deploy in the last hour?

  MITIGATION (stop the bleeding):
    If a bad deployment: ROLLBACK immediately (deploy the previous version).
    If a dependency outage: enable a fallback or disable the affected feature.
    Prioritise restoring service over diagnosing the root cause.

  ROOT CAUSE ANALYSIS (after service is restored):
    What happened? Why? What did we miss?
    Write a blameless post-mortem: facts only, no blame, systemic improvements.
```

**Common mistakes:**
- Not testing the production deployment process before needing it for real — practice rollbacks when things are calm, not during an incident.
- Not having a health check endpoint — a `/health` route that returns `200 OK` (or `503 Service Unavailable` if the DB is down) lets the platform detect unhealthy instances and restart them automatically. Without it, the platform may route traffic to a broken process.
- Deploying too many changes at once — large deployments are harder to diagnose when they break. Small, frequent deployments are easier to roll back and easier to diagnose.

**Debug tip:** When a production deployment breaks and you need to diagnose it quickly: first look at logs from around the deployment time. Look for the first error — that is likely the root cause, not subsequent errors that cascade from it. Then compare the diff: `git diff <previous-tag> <new-tag>` shows exactly what changed. The combination of "first error in logs" and "what changed in the code" almost always points to the cause within a few minutes.

## Challenge: deployment_reasoning

Reason about deployment strategies and production operations.

```challenge
function deploymentDecision(scenario) {
  // scenario: string describing a deployment situation
  // Returns: an object with your recommendation

  if (scenario === 'ecommerce-deploy') {
    // Deploying a checkout feature to an e-commerce site.
    // The old and new versions are API-compatible (no breaking changes).
    // The team wants zero downtime and a fast rollback option.
    // Options: 'recreate', 'rolling', 'blue-green', 'canary'
    return {
      strategy: '',        // your recommended strategy
      reason: '',          // one sentence
    }
  }

  if (scenario === 'database-migration-deploy') {
    // A deployment includes a database migration that drops a column.
    // The old version of the app reads that column; the new version does not.
    // A rolling update will run old and new app versions simultaneously.
    // Is a rolling update safe here?
    return {
      isSafe: false,   // true or false
      reason: '',      // one sentence
    }
  }

  if (scenario === 'health-check') {
    // A server's /health endpoint returns 200 normally.
    // After a deployment, it starts returning 503.
    // The platform is routing traffic to this instance.
    // What should the platform do?
    return {
      action: '',   // 'keep routing traffic', 'stop routing traffic and restart'
    }
  }
}
```

```test
const ecommerce = deploymentDecision('ecommerce-deploy')
assert ['blue-green', 'rolling', 'canary'].includes(ecommerce.strategy)
assert ecommerce.reason.length > 20

const dbMigration = deploymentDecision('database-migration-deploy')
assert dbMigration.isSafe === false
assert dbMigration.reason.length > 20

const health = deploymentDecision('health-check')
assert health.action === 'stop routing traffic and restart'
```
