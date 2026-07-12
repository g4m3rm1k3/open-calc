---
series: software-construction
level: 5
title: Configuration
lang: javascript
---

# Configuration

Configuration is the set of values that control how a program behaves without changing its code. The database URL, the API key, the number of retry attempts, the feature flags that enable or disable functionality — all of these are configuration. What makes them configuration rather than code is that they change between environments (development, staging, production) or between deployments, while the logic stays the same.

A program with no concept of configuration is a program that hardcodes its environment. Every environment change requires a code change. Credentials appear in source code. The same binary cannot run in both staging and production. These are not minor inconveniences — they are architectural failures that create security vulnerabilities and make deployment dangerous.

By the end of this lesson you will understand what belongs in configuration and what belongs in code, know how to separate configuration from logic, and be able to design a configuration system that is safe, predictable, and testable.

## What belongs in configuration

The test: would this value need to change if the program ran in a different environment, or for a different customer, or at a different time?

```text
BELONGS IN CONFIGURATION:
  Database URLs            → different for dev, staging, production
  API keys and secrets     → never in code — versioned files are public
  Port numbers             → dev uses 3000, production uses 80
  Feature flags            → enable search for 10% of users, 100% for employees
  Rate limits              → 100 requests/minute for free tier, 10000 for enterprise
  Log levels               → DEBUG in development, ERROR in production
  Third-party service URLs → staging Stripe, production Stripe

BELONGS IN CODE:
  Business rules           → "orders over $100 get free shipping" — this is a rule,
                             not a deployment variable
  Algorithm choices        → "use binary search for sorted arrays"
  Data validation rules    → "email must contain @ and ."
  Default values           → defaults that never change between environments

The boundary: if an operator could tune it without understanding the code, it is
configuration. If a developer must understand the logic to change it, it is code.
```

## Separating configuration from logic

```javascript
// BAD: configuration hardcoded into logic

async function sendWelcomeEmail(user) {
  const apiKey = 'sk_live_abc123xyz'           // credential in code
  const fromAddress = 'welcome@myapp.com'       // environment-specific
  const retries = 3                             // deployment variable

  const client = new EmailClient(apiKey)
  await client.send({
    from: fromAddress,
    to: user.email,
    subject: 'Welcome!',
    body: `Hello ${user.name}, welcome aboard.`
  })
}
```

```javascript
// GOOD: configuration separated from logic

// config.js — reads all configuration at startup
export function loadConfig() {
  return {
    email: {
      apiKey: process.env.EMAIL_API_KEY,
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'welcome@myapp.com',
      maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || '3', 10),
    },
    database: {
      url: process.env.DATABASE_URL,
    },
  }
}

// email-service.js — receives configuration, does not read from environment
async function sendWelcomeEmail(user, config) {
  const client = new EmailClient(config.email.apiKey)
  await client.send({
    from: config.email.fromAddress,
    to: user.email,
    subject: 'Welcome!',
    body: `Hello ${user.name}, welcome aboard.`
  })
}
```

```text
What changed:

  config.js reads from the environment — this is the ONE place that knows
  about process.env. The rest of the program never touches it.

  sendWelcomeEmail() receives the config it needs as a parameter.
  It can be tested with any config values without setting environment variables.
  It has no knowledge of where config comes from.

  Staging: set EMAIL_API_KEY=sk_test_... in the staging environment.
  Production: set EMAIL_API_KEY=sk_live_... in production.
  Same code. Different config. Same binary.
```

**CS lens:** Separating configuration from code is an application of the **open/closed principle** — software should be open to extension (adding new configuration) but closed to modification (changing the code) for environmental variation. It is also related to **parameterisation**: making a function configurable by passing parameters rather than reading from global state. A program that reads all configuration at startup and passes it downward is a parameterised system. A program that reads from the environment at every call site is a hidden-dependency system.

## Configuration sources and precedence

A real program typically reads configuration from multiple sources. The sources have a precedence order — later sources override earlier ones.

```javascript
// Common precedence order (later = higher priority):
// 1. Hardcoded defaults (lowest)
// 2. Config file (e.g. config.json, .env file)
// 3. Environment variables
// 4. Command-line arguments (highest)

function loadConfig(argv = process.argv, env = process.env) {
  // 1. Defaults
  const config = {
    port: 3000,
    logLevel: 'info',
    maxConnections: 10,
  }

  // 2. Environment variables override defaults
  if (env.PORT)            config.port = parseInt(env.PORT, 10)
  if (env.LOG_LEVEL)       config.logLevel = env.LOG_LEVEL
  if (env.MAX_CONNECTIONS) config.maxConnections = parseInt(env.MAX_CONNECTIONS, 10)

  // 3. Validate — fail fast at startup if config is invalid
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid PORT: "${env.PORT}". Must be a number between 1 and 65535.`)
  }

  return config
}
```

```text
loadConfig({}, {})
  → { port: 3000, logLevel: 'info', maxConnections: 10 }   (all defaults)

loadConfig({}, { PORT: '8080', LOG_LEVEL: 'debug' })
  → { port: 8080, logLevel: 'debug', maxConnections: 10 }  (env overrides)

loadConfig({}, { PORT: 'not-a-number' })
  → throws Error: Invalid PORT: "not-a-number". Must be a number between 1 and 65535.

Key: validate at startup, not at use time.
If PORT is invalid, the program should refuse to start — not silently use 3000
and confuse the operator who set PORT expecting it to take effect.
```

**SE lens:** The single most important security practice for configuration is: secrets never go in source code or config files that are checked into version control. API keys, database passwords, and encryption keys belong in environment variables, secret managers (AWS Secrets Manager, HashiCorp Vault, GitHub Secrets), or encrypted config files — never in `.env` files that are committed to the repository. The number of leaked API keys discovered in GitHub repositories every year is large enough to be a category of security incidents. The `.gitignore` entry for `.env` is not optional.

**Common mistakes:**
- Mixing configuration and defaults — a default value hardcoded in ten different functions is not a default, it is a duplication. Collect defaults in one place, let configuration override them.
- Not validating at startup — discovering that the database URL is malformed when the first request arrives is worse than discovering it at startup. Validate all required configuration before the program begins accepting work.
- Config objects that grow without structure — a flat object with 50 keys is hard to navigate. Group related configuration: `config.database`, `config.email`, `config.auth`.

**Debug tip:** When a program behaves differently in staging than in production, configuration is the first thing to check. Log the resolved configuration (with secrets redacted) at startup: `console.log('Config:', { ...config, email: { ...config.email, apiKey: '[REDACTED]' } })`. This makes the "which environment is this actually using?" question instantly answerable without accessing the server.

## Challenge: design_config

Design a configuration system for a file upload service.

The service needs: a maximum file size (in MB), allowed file types (an array of extensions), a storage path, and an API key for a virus scanning service.

```challenge
function loadUploadConfig(env) {
  // env is an object like process.env
  // Build and return a validated config object.
  // Defaults: maxFileSizeMb = 10, allowedTypes = ['jpg', 'png', 'pdf']
  // Required (throw if missing): storagePath, virusScanApiKey
}
```

```test
const basic = loadUploadConfig({ STORAGE_PATH: '/uploads', VIRUS_SCAN_KEY: 'key123' })
assert basic.maxFileSizeMb === 10
assert Array.isArray(basic.allowedTypes) && basic.allowedTypes.includes('pdf')
assert basic.storagePath === '/uploads'
assert basic.virusScanApiKey === 'key123'
const custom = loadUploadConfig({ STORAGE_PATH: '/data', VIRUS_SCAN_KEY: 'k', MAX_FILE_SIZE_MB: '25' })
assert custom.maxFileSizeMb === 25
let threw = false
try { loadUploadConfig({ VIRUS_SCAN_KEY: 'k' }) } catch { threw = true }
assert threw
```
