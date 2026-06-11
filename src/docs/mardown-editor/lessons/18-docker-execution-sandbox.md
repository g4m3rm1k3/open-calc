# Lesson 18 — Docker Execution Sandbox

## What You Will Build

Go and Rust code blocks run in the browser via a Docker-backed execution API. Code is
sent to a local Express server at `localhost:3001/api/execute`. The server spawns a Docker
container, runs the code inside it, captures output, destroys the container, and returns
the result. The container has no network access, a 64MB memory cap, and a 10-second timeout.

---

## What You Need to Know First

- Lesson 12: the web shell, networking concepts, `localhost`, ports
- Lesson 6: `ExecutionResult`, `child_process.spawn`, the executor interface
- Lesson 13: `FallbackExecutor`, the chain of responsibility

---

## The Lesson

### Step 1 — What Docker Is

**Containers vs virtual machines:**
A virtual machine (VM) emulates complete hardware — CPU, memory, network, disk — and runs
a full OS inside. Spinning up a VM takes seconds to minutes and uses hundreds of MB of RAM.

A container shares the host OS kernel but has an isolated view of the file system, network,
and process table. Spinning up a container takes milliseconds and uses only the RAM the
contained process actually consumes. A container running `echo hello` and exiting uses
almost no RAM and takes ~50ms.

The key isolation: a container's file system is isolated from the host. Files you create
inside a container do not exist on the host. Processes inside a container cannot see or
communicate with processes outside it (unless explicitly allowed).

**Images and containers:**
A Docker **image** is a read-only template — a recipe for creating a container. An image
contains an OS base layer, the language runtime, and any pre-installed libraries.

A Docker **container** is a running instance of an image. Multiple containers can be created
from the same image simultaneously, each with its own isolated file system and process space.

**CS lens:** Containers use two Linux kernel features:
- **Namespaces** — isolate the container's view of the system (PID namespace: the container
  has its own process table; network namespace: the container has its own network stack)
- **Cgroups (control groups)** — limit and account for resource usage (memory, CPU)

Docker is a user-friendly interface over these kernel primitives.

**SE lens:** The principle of least privilege, applied at the OS level. The container has:
- No network access (`--network none`) — cannot make HTTP requests, cannot phone home
- No host file system access (only the mounted code file is readable)
- Memory cap (`--memory 64m`) — cannot exhaust the server's RAM
- CPU limit (`--cpus 0.5`) — cannot monopolise the CPU
- Process limit (`--pids-limit 50`) — cannot fork-bomb

Each limit is independent. Any one alone is insufficient. Together they form a defence
in depth: multiple layers of containment, any one of which stops a malicious program.

### Step 2 — The Execution API Server

Create `apps/server/`:

```
$ mkdir -p apps/server/src
$ touch apps/server/package.json
```

```json
{
  "name": "@codex/server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.3.0"
  }
}
```

In `apps/server/src/index.ts`:

```typescript
import express from 'express'
import cors from 'cors'
import { executeInDocker } from './dockerExecutor'

const app = express()

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json({ limit: '100kb' }))

app.post('/api/execute', async (req, res) => {
  const { language, code } = req.body

  if (typeof language !== 'string' || typeof code !== 'string') {
    res.status(400).json({ error: 'language and code are required strings' })
    return
  }

  if (code.length > 50_000) {
    res.status(400).json({ error: 'Code exceeds maximum length of 50,000 characters' })
    return
  }

  try {
    const result = await executeInDocker(language, code)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.listen(3001, () => {
  console.log('Execution server running on http://localhost:3001')
})
```

**`express` explained (first appearance):**
Express is a minimal HTTP server framework for Node.js. `app.post('/api/execute', handler)`
registers a handler for `POST /api/execute` requests. `req.body` contains the parsed JSON
request body (enabled by `express.json()` middleware). `res.json(result)` sends a JSON
response.

**`cors` explained:**
Browsers enforce the **Same-Origin Policy** — a web page can only make HTTP requests to
the same origin (`scheme + host + port`) that served the page. `localhost:5173` (Vite) and
`localhost:3001` (the execution server) are different origins. Without CORS (Cross-Origin
Resource Sharing) headers, the browser blocks the request. `cors({ origin: ['http://localhost:5173', ...] })`
adds the `Access-Control-Allow-Origin` header, telling the browser to allow requests from
those origins.

**Input validation:**
`typeof language !== 'string' || typeof code !== 'string'` — we validate the input type
before using it. Without this, `language = undefined` would be passed to `executeInDocker`
and cause a confusing error deep in the function. Validating at the entry point gives a
clear error message to the caller.

`code.length > 50_000` — a 50KB code limit prevents accidentally large submissions
(a student who pastes an entire codebase) from spawning a container that takes minutes.

### Step 3 — The Docker Executor

In `apps/server/src/dockerExecutor.ts`:

```typescript
import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import type { ExecutionResult } from '@codex/executor'

const LANGUAGE_IMAGES: Record<string, { image: string; command: string; extension: string }> = {
  go:   { image: 'codex/go:1.22',   command: 'go run',  extension: 'go' },
  rust: { image: 'codex/rust:1.76', command: 'rustc -o /tmp/out /code/main.rs && /tmp/out', extension: 'rs' },
}

export async function executeInDocker(
  language: string,
  code: string,
  timeoutMs = 10_000
): Promise<ExecutionResult> {
  const config = LANGUAGE_IMAGES[language]
  if (config === undefined) {
    throw new Error(`No Docker image configured for language: ${language}`)
  }

  const tempDir = join(tmpdir(), `codex-docker-${Date.now()}`)
  const codeFile = join(tempDir, `main.${config.extension}`)

  const { mkdir } = await import('fs/promises')
  await mkdir(tempDir, { recursive: true })
  await writeFile(codeFile, code, 'utf-8')

  const dockerArgs = [
    'run',
    '--rm',
    '--network', 'none',
    '--memory', '64m',
    '--cpus', '0.5',
    '--pids-limit', '50',
    '--read-only',
    '--tmpfs', '/tmp:noexec,size=10m',
    '-v', `${codeFile}:/code/main.${config.extension}:ro`,
    '-w', '/code',
    config.image,
    ...config.command.split(' '),
    `/code/main.${config.extension}`,
  ]

  try {
    const startTime = Date.now()
    const result = await runDockerProcess(dockerArgs, timeoutMs)
    return { ...result, durationMs: Date.now() - startTime }
  } finally {
    await unlink(codeFile).catch(() => {})
    await import('fs/promises').then(fs =>
      fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
    )
  }
}

function runDockerProcess(args: string[], timeoutMs: number): Promise<{
  stdout: string[]
  stderr: string[]
  exitCode: number
}> {
  return new Promise((resolve, reject) => {
    const stdout: string[] = []
    const stderr: string[] = []
    let containerId: string | null = null

    const process = spawn('docker', args)
    let isTimedOut = false

    const timeout = setTimeout(() => {
      isTimedOut = true
      process.kill('SIGTERM')
    }, timeoutMs)

    process.stdout.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString('utf-8').split('\n')) {
        if (line.length > 0) stdout.push(line)
      }
    })

    process.stderr.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString('utf-8').split('\n')) {
        if (line.length > 0) stderr.push(line)
      }
    })

    process.on('error', reject)

    process.on('close', (exitCode) => {
      clearTimeout(timeout)
      if (isTimedOut) {
        resolve({
          stdout,
          stderr: [...stderr, '[Execution timed out — container killed]'],
          exitCode: -1,
        })
      } else {
        resolve({ stdout, stderr, exitCode: exitCode ?? -1 })
      }
    })
  })
}
```

**Each Docker flag explained:**

- `--rm` — automatically remove the container when it exits. Without this, stopped
  containers accumulate on disk. Each student Run click creates a container; without `--rm`,
  thousands of stopped containers would pile up.
- `--network none` — disable all network access. The student's code cannot make HTTP
  requests, connect to databases, or exfiltrate data.
- `--memory 64m` — memory limit. If the container exceeds 64MB, the OOM (Out Of Memory)
  killer terminates it. Prevents a student's infinite-list code from exhausting the server.
- `--cpus 0.5` — CPU limit: this container may use at most half a CPU core. Prevents a
  CPU-intensive program from starving other containers.
- `--pids-limit 50` — maximum number of processes (including threads) inside the container.
  Prevents fork bombs (`while True: fork()`) from overwhelming the host.
- `--read-only` — the container's root file system is read-only. The student's code cannot
  write files to unexpected locations. Only `/tmp` (via `--tmpfs`) is writable.
- `--tmpfs /tmp:noexec,size=10m` — mount an in-memory `/tmp` filesystem, maximum 10MB,
  with `noexec` (files in `/tmp` cannot be executed as programs). Allows the container's
  runtime to write temporary files, but limits size and prevents executing downloaded code.
- `-v codeFile:/code/main.ext:ro` — mount the code file into the container at `/code/main.ext`,
  read-only (`:ro`). The container can read the code but cannot modify it.

### Step 4 — The Remote Executor in the Executor Package

In `packages/executor/src/RemoteExecutor.ts`:

```typescript
import type { Executor, ExecutionOptions, ExecutionResult } from './types'

const REMOTE_LANGUAGES = new Set(['go', 'rust'])

export class RemoteExecutor implements Executor {
  readonly name = 'remote'
  private readonly apiUrl: string

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  canHandle(language: string): boolean {
    return REMOTE_LANGUAGES.has(language)
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult> {
    const { language, code } = options
    const startTime = Date.now()

    const response = await fetch(`${this.apiUrl}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Remote executor returned ${response.status}: ${error}`)
    }

    const result = await response.json() as ExecutionResult
    return { ...result, durationMs: Date.now() - startTime }
  }
}
```

Add `RemoteExecutor` to the `FallbackExecutor` chain in the web shell:

```typescript
const executor = new FallbackExecutor([
  new WASMExecutor(),
  new RemoteExecutor('http://localhost:3001'),
])
```

Go and Rust are not in `WASMExecutor.canHandle`, so they fall through to `RemoteExecutor`.
Python, JavaScript, SQL, Lua, Ruby, and C are handled by `WASMExecutor` and never reach
`RemoteExecutor`.

---

## Connect the Pieces

The circuit breaker (Lesson 19) wraps `RemoteExecutor.execute`. The `RemoteExecutor`
itself is unaware of the circuit breaker — the breaker is applied at the `FallbackExecutor`
level.

The Docker image build process is not covered in this lesson — `codex/go:1.22` and
`codex/rust:1.76` are assumed to be pre-built. Building them is a straightforward
`Dockerfile` with `FROM golang:1.22-alpine` and `RUN go version`. The details are in
the project's `Makefile`.

---

## What Breaks Without This

Without `--rm`, running 100 code blocks creates 100 stopped containers. Each stopped
container holds its layer files on disk. After a day of use, the server's disk can fill.
`docker system prune` removes them, but that requires manual intervention. `--rm` keeps
the disk clean automatically.

---

## Definition of Done

- [ ] Start the server: `npm run dev --workspace=apps/server`
- [ ] A Go `fmt.Println("hello from Go")` block runs with output
- [ ] A Rust `println!("hello from Rust")` block runs with output
- [ ] Verify in Docker Desktop that no stopped containers accumulate
- [ ] A Go block that takes > 10 seconds is killed; timeout message appears
- [ ] You can answer: what is the difference between a Docker image and a container?
- [ ] You can answer: why is `--network none` the most important security flag?
- [ ] You can answer: what does CORS prevent and why is it needed here?
- [ ] `git commit` with a message explaining why
