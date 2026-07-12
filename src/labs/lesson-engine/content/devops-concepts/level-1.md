---
series: devops-concepts
level: 1
title: Environment Variables and Configuration
lang: javascript
---

# Environment Variables and Configuration

Every non-trivial program needs some information that varies between environments: a database password in production is different from the one on a developer's laptop; an API key for the payment provider is different in test mode versus live mode; the port a server listens on might be 3000 locally and 8080 in a container.

This information must not be hardcoded in source code (it would leak into Git history), must not be different for different developers checking out the repo (it would cause "works on my machine" bugs), and must change between environments without requiring a code change. Environment variables are the standard solution to all three problems. By the end of this lesson you will know how to use environment variables in Node.js, why they exist, what should and should not be stored in them, and how to manage them safely across environments.

## What environment variables are

An environment variable is a named string value that the operating system makes available to every process it runs. Every program — not just Node.js — can read the environment variables set before it was started.

```javascript
// In Node.js, environment variables are on process.env:
console.log(process.env.PATH)           // the OS's executable search path
console.log(process.env.HOME)           // home directory (/Users/alice on macOS)
console.log(process.env.NODE_ENV)       // 'development', 'test', or 'production'
console.log(process.env.DATABASE_URL)   // set by deployment configuration
console.log(process.env.PORT)           // port for the server to listen on

// process.env values are ALWAYS strings (or undefined if not set):
const port = parseInt(process.env.PORT ?? '3000', 10)   // parse with a default
```

```text
HOW ENVIRONMENT VARIABLES ARE SET:

  Terminal (temporary — only lasts for that process):
    PORT=8080 node server.js          ← sets PORT for this run only

  Shell session (lasts until the shell closes):
    export PORT=8080
    node server.js

  .env file (read by libraries like 'dotenv' — for local development):
    # .env
    PORT=3000
    DATABASE_URL=postgres://localhost:5432/mydb
    JWT_SECRET=dev-secret-not-real

  CI/CD platform (set in platform UI — for automated pipelines):
    GitHub Actions → repository Settings → Secrets and Variables
    Heroku, Fly.io, Render → app environment settings

  Docker or container orchestration (passed to container at start time):
    docker run -e PORT=8080 -e DATABASE_URL=... my-image
```

**CS lens:** Environment variables are a form of **configuration injection** — the program's behaviour is determined not only by its source code but by the environment it runs in. This is the same principle as dependency injection (injecting the database instead of hardcoding it), applied at the process level rather than the function level. The operating system provides the injection point; the program reads from `process.env`; no source code changes are needed to change the configuration.

## The dotenv pattern for local development

The `dotenv` library is the standard way to manage local environment variables. It reads a `.env` file and populates `process.env` from it when the application starts.

```javascript
// At the very top of your entry point (server.js, index.js):
import 'dotenv/config'   // reads .env, adds variables to process.env

// Now all your .env variables are available:
const db = new Database(process.env.DATABASE_URL)
const server = createServer({ port: parseInt(process.env.PORT ?? '3000', 10) })
```

```text
.env FILE RULES:

  ✓ Create .env for local development
  ✓ Add .env to .gitignore — IMMEDIATELY, BEFORE the first commit
  ✓ Create .env.example (committed to Git) showing the NAMES of required vars, no values:
      PORT=
      DATABASE_URL=
      JWT_SECRET=
      STRIPE_SECRET_KEY=
  ✓ In the README: "copy .env.example to .env and fill in the values"
  ✓ In CI/production: set variables in the platform's secret manager, not in a file

  ✗ NEVER commit .env to Git (leaks secrets into Git history forever)
  ✗ NEVER put real secrets in .env.example (it IS committed)
  ✗ NEVER store API keys, passwords, or tokens in source code
```

## What belongs in environment variables

```text
SHOULD BE IN ENV VARS:
  ✓ Database connection strings (host, port, credentials)
  ✓ API keys for third-party services (Stripe, SendGrid, AWS, etc.)
  ✓ Secrets: JWT signing secrets, encryption keys, OAuth client secrets
  ✓ URLs for external services that differ between environments
  ✓ Feature flags that differ between environments
  ✓ PORT, HOST, NODE_ENV

SHOULD NOT BE IN ENV VARS:
  ✗ Application logic or business rules — these belong in code
  ✗ Data that changes at runtime (use a database instead)
  ✗ Very large configuration (use a config file, loaded by code)
  ✗ Anything that is the same in every environment (hardcode it in config)

SECURITY RULES:
  Env vars are accessible to all code in the process (including dependencies).
  A compromised npm package can read process.env.
  Use secret managers (AWS Secrets Manager, Doppler, Vault) for production secrets.
  Rotate secrets regularly. Never log process.env — it may print secrets to logs.
```

## The NODE_ENV convention

`NODE_ENV` is the universal convention for indicating which environment a program is running in. It affects behaviour throughout the application and its dependencies.

```javascript
const env = process.env.NODE_ENV ?? 'development'

// Database configuration based on environment:
const dbConfig = {
  development: { url: process.env.DATABASE_URL, pool: 2, logging: true },
  test:        { url: process.env.TEST_DATABASE_URL, pool: 1, logging: false },
  production:  { url: process.env.DATABASE_URL, pool: 10, logging: false },
}[env]

// Express example: detailed error messages in development, minimal in production
if (env === 'production') {
  app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal server error' })   // no stack trace to user
  })
} else {
  app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message, stack: err.stack })   // full details for debugging
  })
}
```

```text
Standard NODE_ENV values:
  'development' — local developer machine. Verbose errors, hot reload, no optimisations.
  'test'        — running automated tests. Separate database, no console output.
  'production'  — live server. Optimisations, minimal logging, secrets from env vars.
  'staging'     — production-like environment for final testing. Sometimes used.

Many libraries (React, Express, webpack, etc.) change their behaviour based on NODE_ENV:
  React:   development builds include prop-type warnings; production builds are minified.
  Express: different error formats.
  webpack: production mode enables tree-shaking and minification.
```

**SE lens:** The `NODE_ENV` pattern is a specific application of the principle of **environment-specific configuration**. Its power is that it is a convention: every library, framework, and tool recognises `NODE_ENV`. This single variable orchestrates a cascade of environment-appropriate behaviour across your entire dependency tree. The cost: it conflates several distinct concerns (debugging verbosity, database target, security posture) into a single variable. In large codebases, explicit feature flags per concern are often clearer — but `NODE_ENV` is the standard starting point.

**Common mistakes:**
- Not setting a default for `process.env.PORT` — if the environment variable is not set, `process.env.PORT` is `undefined`. `parseInt(undefined, 10)` returns `NaN`. `app.listen(NaN)` throws. Always provide a fallback: `parseInt(process.env.PORT ?? '3000', 10)`.
- Using string comparison without normalising — `process.env.NODE_ENV === 'Production'` (capital P) is false when the value is `'production'`. Normalise: `process.env.NODE_ENV?.toLowerCase()`.
- Accidentally logging secrets — `console.log('Config:', process.env)` logs every environment variable, including secrets, to the console (and therefore to the log aggregation system). Log specific non-secret values instead.

**Debug tip:** When a server starts and crashes with "connection refused" or "invalid database URL", the first check is: is `DATABASE_URL` set in the environment? Run `node -e "console.log(process.env.DATABASE_URL)"` in the same terminal/environment where you start the server. If it prints `undefined`, the variable is not set. Check whether `.env` exists, whether `dotenv/config` is imported at the top of the entry point, and whether you are running the command from the right directory.

## Challenge: config_loader

Implement a configuration loader that reads environment variables with defaults and type coercion.

```challenge
function loadConfig(env) {
  // env: an object (like process.env) containing string values
  //
  // Returns a validated config object with:
  //   port: number (default 3000)
  //   nodeEnv: string (default 'development')
  //   databaseUrl: string (required — throw Error('DATABASE_URL is required') if missing)
  //   maxConnections: number (default 10)
  //   debug: boolean (true if env.DEBUG === 'true', false otherwise)
}
```

```test
const config = loadConfig({
  PORT: '8080',
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://localhost/mydb',
  MAX_CONNECTIONS: '20',
  DEBUG: 'true',
})

assert config.port === 8080
assert config.nodeEnv === 'production'
assert config.databaseUrl === 'postgres://localhost/mydb'
assert config.maxConnections === 20
assert config.debug === true

const defaults = loadConfig({ DATABASE_URL: 'postgres://localhost/mydb' })
assert defaults.port === 3000
assert defaults.nodeEnv === 'development'
assert defaults.maxConnections === 10
assert defaults.debug === false

let threw = false
try { loadConfig({}) } catch (e) {
  threw = true
  assert e.message === 'DATABASE_URL is required'
}
assert threw
```
