# SE Masterclass — LAB-25 — Configuration System

**Language: TypeScript (Node.js)** — same module as LAB-21–24.

**Prerequisites:** LAB-17 (interfaces as contracts) and LAB-09 (boundary validation). This lab layers several `ConfigSource` implementations, each satisfying one shared interface, then merges them by PRIORITY.

**What this lab adds:**
- Layered configuration: defaults → config file → environment variables → runtime override, each layer able to override the one below it
- A `ConfigSource` interface (LAB-17) — multiple sources, one shared shape
- Validating configuration at startup — fail LOUDLY and IMMEDIATELY if something required is missing, not silently later
- Type-safe config access instead of stringly-typed `config["someKey"]` everywhere

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A `PORT` is set to `3000` in a config file and `8080` in an environment variable. Which one should win, and why is THAT the conventional choice (not the reverse)?
> 2. If a required config key (`DATABASE_URL`) is missing entirely, should the app start up and fail the first time it tries to connect, or refuse to start at all?
> 3. Environment variables are ALWAYS strings (`process.env.PORT` is `"3000"`, not `3000`). What has to happen before a numeric config value can be used safely?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Layer 1: Defaults Only ===
config: { port: 3000, logLevel: 'info', maxConnections: 100 }

=== Layer 2: Defaults + Config File ===
file overrides: { port: 4000 }
config: { port: 4000, logLevel: 'info', maxConnections: 100 }

=== Layer 3: Defaults + File + Environment ===
env overrides: { PORT: '8080', LOG_LEVEL: 'debug' }
config: { port: 8080, logLevel: 'debug', maxConnections: 100 }
  ← environment beat the file (8080, not 4000) — env wins because it's set CLOSEST to deployment time

=== Layer 4: + Runtime Override (highest priority) ===
runtime override: { logLevel: 'error' }
config: { port: 8080, logLevel: 'error', maxConnections: 100 }
  ← runtime override beat even the environment variable

=== Validation: Missing Required Key ===
Config validation failed: missing required key "databaseUrl"

=== Validation: Type Coercion From Environment Strings ===
process.env.MAX_CONNECTIONS = "250" (a string!)
config.maxConnections: 250 (typeof: number)

=== Type-Safe Access ===
config.get('port'): 8080 (typeof number)
config.get('nonExistentKey'): compile-time error — see comment in source
```

---

### Concept: Layered Configuration

**What it is:** Real applications get their configuration from MULTIPLE sources, layered by priority: hardcoded **defaults** (lowest priority — always present, but easiest to override), a **config file** (checked into or deployed with the app), **environment variables** (set by whoever is deploying/running the app, without touching code), and sometimes a **runtime override** (highest priority — set by a command-line flag or admin action).

**The problem before:** A single hardcoded `const PORT = 3000` means changing the port requires editing and redeploying code — completely impractical for something that legitimately differs between a developer's laptop, a staging server, and production.

**The solution:** Merge multiple sources, in a fixed priority order, so each layer can OVERRIDE the one before it, but nothing REQUIRES every layer to specify everything.

**Canonical example (General Explanation):** Think of a recipe with a default ingredient list, a handwritten note taped to it changing one ingredient for this week's grocery availability, and a verbal "actually, skip the salt today" from whoever's cooking right now. Each layer only needs to mention what it's CHANGING — everything else falls through to the layer below.

**Project Application (The "Why" here):** This is LAB-14's dependency-graph merge idea and LAB-17's interface pattern combined: each config SOURCE implements a shared `ConfigSource` interface, and they're combined in a fixed, documented priority order.

---

## Step 1 — Defaults

```ts
// config-schema.ts
export interface AppConfig {
  port: number
  logLevel: string
  maxConnections: number
  databaseUrl?: string       // optional — Step 5 makes this REQUIRED and validated
}

export const defaults: AppConfig = {
  port: 3000,
  logLevel: 'info',
  maxConnections: 100,
}
```

```ts
// main.ts
import { defaults } from './config-schema'

console.log('=== Layer 1: Defaults Only ===')
console.log('config:', defaults)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Layer 1: Defaults Only ===
config: { port: 3000, logLevel: 'info', maxConnections: 100 }
```

---

## Step 2 — Layer a Config File Over Defaults

```ts
// merge.ts
export function mergeConfig<T extends object>(base: T, override: Partial<T>): T {
  return { ...base, ...override }     // ← add: spread — override's keys win, base's keys fill in the rest
}
```

```ts
import { mergeConfig } from './merge'

console.log('\n=== Layer 2: Defaults + Config File ===')
const fileConfig = { port: 4000 }              // simulates reading a config.json that only sets 'port'
console.log('file overrides:', fileConfig)
let config = mergeConfig(defaults, fileConfig)
console.log('config:', config)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Layer 2: Defaults + Config File ===
file overrides: { port: 4000 }
config: { port: 4000, logLevel: 'info', maxConnections: 100 }
```

**Confirm the merge is shallow and targeted:** `logLevel` and `maxConnections` STILL come from `defaults` — `fileConfig` only mentioned `port`, and `{ ...base, ...override }` only overwrites keys that `override` actually specifies; everything else falls through untouched, exactly like LAB-12's environment only remembers what was explicitly `STORE`d.

---

## Step 3 — Layer Environment Variables Over the File

```ts
// env-source.ts
export function readEnvConfig(env: NodeJS.ProcessEnv): Partial<import('./config-schema').AppConfig> {
  const result: Partial<import('./config-schema').AppConfig> = {}
  if (env.PORT) result.port = Number(env.PORT)          // ← add: env vars are ALWAYS strings — must convert (LAB-01's Number())
  if (env.LOG_LEVEL) result.logLevel = env.LOG_LEVEL
  return result
}
```

Add to `main.ts`:

```ts
import { readEnvConfig } from './env-source'

console.log('\n=== Layer 3: Defaults + File + Environment ===')
process.env.PORT = '8080'
process.env.LOG_LEVEL = 'debug'
console.log('env overrides:', { PORT: process.env.PORT, LOG_LEVEL: process.env.LOG_LEVEL })

const envConfig = readEnvConfig(process.env)
config = mergeConfig(config, envConfig)      // layer ON TOP of the already-merged defaults+file config
console.log('config:', config)
console.log('  ← environment beat the file (8080, not 4000) — env wins because it\'s set CLOSEST to deployment time')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Layer 3: Defaults + File + Environment ===
env overrides: { PORT: '8080', LOG_LEVEL: 'debug' }
config: { port: 8080, logLevel: 'debug', maxConnections: 100 }
  ← environment beat the file (8080, not 4000) — env wins because it's set CLOSEST to deployment time
```

**Confirm the conventional priority order makes sense:** A config FILE is usually checked into or shipped WITH the code — changing it means a new deployment. An ENVIRONMENT VARIABLE is set by whoever is RUNNING the deployed app right now (a Docker `-e` flag, a Kubernetes ConfigMap, a `.env` file loaded at startup) — it's the layer CLOSEST to "this specific running instance," which is exactly why it should win over something baked further back in the pipeline.

---

## Step 4 — Runtime Override (Highest Priority)

```ts
console.log('\n=== Layer 4: + Runtime Override (highest priority) ===')
const runtimeOverride = { logLevel: 'error' }     // simulates a CLI flag like --log-level=error
console.log('runtime override:', runtimeOverride)
config = mergeConfig(config, runtimeOverride)
console.log('config:', config)
console.log('  ← runtime override beat even the environment variable')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Layer 4: + Runtime Override (highest priority) ===
runtime override: { logLevel: 'error' }
config: { port: 8080, logLevel: 'error', maxConnections: 100 }
  ← runtime override beat even the environment variable
```

**Confirm the full chain by tracing `logLevel` alone:** `defaults.logLevel = 'info'` → overridden by nothing in `fileConfig` (still `'info'`) → overridden by `envConfig.logLevel = 'debug'` → overridden by `runtimeOverride.logLevel = 'error'`. Four layers, one value, each layer only needing to mention it if it actually wants to CHANGE it.

---

### Concept: Fail Loudly at Startup, Not Silently Later

**What it is:** If a REQUIRED piece of configuration is missing (a database URL, an API key), the application should refuse to start AT ALL, with a clear error naming exactly what's missing — not start up successfully and then fail confusingly the first time that missing config is actually used.

**The problem before:** An app that starts fine but crashes with `Cannot read property 'url' of undefined` deep inside a database connection function, minutes or requests later, forces someone to trace the crash BACKWARD to "oh, `DATABASE_URL` was never set" — the exact same "far from the source" problem LAB-09's boundary validation was designed to prevent.

**The solution:** Validate ALL required config immediately after merging every layer, before the application does anything else.

---

## Step 5 — Validate Required Keys

```ts
// validate.ts
export function validateConfig(config: Record<string, unknown>, required: string[]): void {
  for (const key of required) {
    if (config[key] === undefined) {
      throw new Error(`missing required key "${key}"`)     // ← add: fail immediately, name the EXACT problem
    }
  }
}
```

Add to `main.ts`:

```ts
import { validateConfig } from './validate'

console.log('\n=== Validation: Missing Required Key ===')
try {
  validateConfig(config, ['port', 'databaseUrl'])    // 'databaseUrl' was never set in any layer
} catch (err) {
  console.log(`Config validation failed: ${(err as Error).message}`)
}
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Validation: Missing Required Key ===
Config validation failed: missing required key "databaseUrl"
```

**Confirm the error names the EXACT missing key, not just "config is invalid":** This is the same precision LAB-10's lexer errors and LAB-11's parser errors aimed for — a message that tells you exactly what to fix, not just that something is wrong somewhere.

---

## Step 6 — Type Coercion From Environment Strings

```ts
// Add MAX_CONNECTIONS handling to env-source.ts's readEnvConfig:
if (env.MAX_CONNECTIONS) result.maxConnections = Number(env.MAX_CONNECTIONS)
```

Add to `main.ts`:

```ts
console.log('\n=== Validation: Type Coercion From Environment Strings ===')
process.env.MAX_CONNECTIONS = '250'
console.log(`process.env.MAX_CONNECTIONS = "${process.env.MAX_CONNECTIONS}" (a string!)`)

const finalEnvConfig = readEnvConfig(process.env)
config = mergeConfig(config, finalEnvConfig)
console.log(`config.maxConnections: ${config.maxConnections} (typeof: ${typeof config.maxConnections})`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Validation: Type Coercion From Environment Strings ===
process.env.MAX_CONNECTIONS = "250" (a string!)
config.maxConnections: 250 (typeof: number)
```

**Confirm the conversion happened at the SOURCE, not scattered everywhere it's used:** `Number(env.MAX_CONNECTIONS)` runs ONCE, inside `readEnvConfig` — every other part of the application can trust `config.maxConnections` is genuinely a `number`, never needing to re-check or re-convert it. This is LAB-01's `Number("250")` type coercion lesson, applied at exactly ONE boundary instead of repeated everywhere the value is used.

---

## 🎯 Challenge: Type-Safe Config Access

**You know:** `AppConfig` (Step 1) already defines the exact SHAPE every config value should have.

**Task:** Write a `ConfigStore` class wrapping a merged `AppConfig` object, with a `get<K extends keyof AppConfig>(key: K): AppConfig[K]` method — so `config.get('port')` is typed as `number`, and `config.get('nonExistentKey')` is a COMPILE ERROR, not a runtime `undefined`.

<details>
<summary>▶ Show Solution</summary>

```ts
class ConfigStore {
  constructor(private config: AppConfig) {}

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }
}

const store = new ConfigStore(config as AppConfig)
console.log(`config.get('port'): ${store.get('port')} (typeof ${typeof store.get('port')})`)
// store.get('nonExistentKey')   // ← uncomment: "Argument of type '"nonExistentKey"' is not assignable to parameter of type 'keyof AppConfig'."
console.log("config.get('nonExistentKey'): compile-time error — see comment in source")
```

**Key insight:** `K extends keyof AppConfig` (a generic constrained to the ACTUAL keys of `AppConfig`) means TypeScript checks every `.get()` call against the real schema at COMPILE time — a typo'd config key becomes an immediate red squiggly in your editor, instead of a `undefined` silently flowing through your application until something downstream breaks confusingly. This is LAB-17's interface-as-contract idea, applied to individual config KEYS instead of whole objects.

</details>

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Type-Safe Access ===
config.get('port'): 8080 (typeof number)
config.get('nonExistentKey'): compile-time error — see comment in source
```

---

## Mental Model: Where This Shows Up

| Tool/system | The layers |
|---|---|
| `dotenv` + Node.js apps | `.env` file → `process.env` → defaults in code |
| Docker / Kubernetes | Image defaults → ConfigMap/Secret → `-e` flags at `docker run` time |
| The Twelve-Factor App (LAB-72) | Explicitly mandates config via environment variables — this lab's Layer 3 |
| CLI tools (`git`, `npm`) | Built-in defaults → config file (`.gitconfig`, `.npmrc`) → environment → command-line flags |

**Where you will see this again:** LAB-72 (Twelve-Factor App) makes "config in the environment, not in code" a formal, explicit requirement — this lab already built the layering that satisfies it.

---

## Final Check

| Feature | How to verify |
|---|---|
| Defaults alone produce a complete, valid base config | Step 1 |
| A config file layer overrides only the keys it specifies | Step 2 |
| Environment variables override the file layer | Step 3 |
| A runtime override beats even environment variables | Step 4 |
| A missing required key fails loudly with the exact key name | Step 5 |
| Environment-sourced numeric values are genuinely typed as `number`, not string | Step 6 |
| `ConfigStore.get()` rejects invalid keys at COMPILE time | Challenge |

---

## Quick Check Answers

**1. File says `PORT=3000`, environment says `PORT=8080` — which wins, and why?**

The environment variable (`8080`) — demonstrated in Step 3. Environment variables are set by whoever is RUNNING the deployed instance right now, closest to actual deployment time, while a config file is typically baked into the codebase and requires a new deployment to change. The conventional priority (defaults < file < environment < runtime) reflects "the layer closest to the actual running instance should win," letting operators override behavior without needing a code change.

**2. `DATABASE_URL` missing — start and fail later, or refuse to start?**

Refuse to start immediately, with a clear error — demonstrated in Step 5's `validateConfig`, which throws `missing required key "databaseUrl"` BEFORE the application does anything else. Starting successfully and failing later (the first time something tries to actually use the missing config) produces a confusing crash far from its real cause — exactly the "boundary validation, as early as possible" principle from LAB-09, applied to application startup instead of user input.

**3. Environment variables are always strings — what has to happen before a numeric config value is safe to use?**

Explicit conversion (`Number(env.PORT)`, LAB-01's `Number()` coercion), performed ONCE, at the boundary where the environment variable is first read — Step 6 demonstrated this directly: `"250"` (a string) became `250` (a genuine `number`) inside `readEnvConfig`, so every later piece of code using `config.maxConnections` can trust its TYPE without re-checking, instead of every consumer needing to remember to convert it themselves.

---

*Next: [LAB-26 — Serialization Engine](LAB-26-serialization-engine.md) — TypeScript, same module*
