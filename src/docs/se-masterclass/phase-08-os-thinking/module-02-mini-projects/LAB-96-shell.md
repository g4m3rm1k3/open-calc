# SE Masterclass — LAB-96 — Shell

**Prerequisites:** LAB-95 (Memory Management)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What has to happen, mechanically, for a shell to run `ls -la` — what OS primitive from LAB-92 does that reduce to?
2. Why does `cmd1 | cmd2` need each command spawned as a *separate* process, rather than running both inside the shell's own process?
3. Why must environment variables set with `export` persist across commands typed later in the same shell session, but not leak into a completely different terminal window?

## What You Will Build

A working REPL shell in Node.js that parses typed commands, spawns them as child processes (LAB-92), wires up the pipe operator between multiple commands (LAB-93), and supports environment variables — a real, if minimal, command-line shell.

```
$ echo hello
hello
$ export NAME=world
$ echo "hello $NAME"
hello world
$ echo "line one" | wc -l
1
```

## Concept: Shell Architecture — Command Parsing and Process Spawning

**What it is:** A shell is a REPL (read-eval-print loop) whose "eval" step means: parse the typed line into a command and its arguments, spawn that command as a child process (LAB-92), wire up its stdio appropriately, and wait for it to finish before prompting again. Everything else a shell does — pipes, environment variables, `cd`, globbing — is built on top of that core loop.

**The problem before:** LAB-92 and LAB-93 built the primitives (spawning, piping, IPC) in isolation, each with its inputs hardcoded in the script itself. A real shell needs those exact same primitives, but driven by whatever a human types at a prompt, in real time — which means adding a parsing layer (turn `"echo hello | wc -l"` into structured commands) between user input and the spawn/pipe machinery LAB-92/93 already built.

**The solution:** Read a line from stdin, tokenize it (LAB-80's lexer technique, simplified to shell syntax: words, quoted strings, the `|` operator), spawn the resulting command(s) via `child_process.spawn` (LAB-92), and — when a pipe operator is present — connect each command's stdout to the next command's stdin exactly as LAB-93 Step 1 demonstrated, then loop back to read another line.

**Canonical example:**

```typescript
import readline from "readline"
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "$ " })
rl.on("line", (line) => { runCommand(line); rl.prompt() })
rl.prompt()
```

**Project Application:** LAB-97's process manager extends this shell's command-spawning core with lifecycle tracking (start/stop/restart); LAB-98's file watcher can be wired to re-run a shell command on every file change, directly reusing this lab's `runCommand`.

**Watch for:** Forgetting to handle a command that isn't found (`spawn` emits an `"error"` event, not a thrown exception, when the executable doesn't exist) — an unhandled `"error"` event on an `EventEmitter` in Node.js crashes the entire process, which would take down the whole shell over one typo'd command name.

## Step 1: The read-eval-print loop

```typescript
import readline from "readline"
import { spawn } from "child_process"

function startShell(): void {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "$ " })

  rl.on("line", (line) => {
    const trimmed = line.trim()
    if (trimmed.length > 0) runCommand(trimmed)
    rl.prompt()
  })

  rl.prompt()
}

function runCommand(line: string): void {
  const tokens = tokenizeShellLine(line) // Step 2
  if (tokens.length === 0) return
  const [command, ...args] = tokens

  const child = spawn(command, args, { stdio: "inherit" }) // Step 3 explains "inherit"
  child.on("error", (err) => console.error(`command not found: ${command}`))
}

startShell()
```

This is the shell's outer loop, structurally: read a line, parse it, spawn it, wait implicitly (via `stdio: "inherit"`, explained in Step 3), prompt again. `child.on("error", ...)` is the fix the concept section's "watch for" demanded — without it, typing a nonexistent command would throw an unhandled error and crash the whole shell process, taking down every future command along with it.

### SAVE AND TRY

Run `startShell()` and type `echo hello` — it should spawn `echo` as a real child process and print `hello`. Type a nonsense command like `zzz-not-a-real-command` — it should print `command not found: zzz-not-a-real-command` and the shell should keep running, prompting again, rather than crashing.

## Step 2: Tokenizing shell syntax — words, quotes, and the pipe operator

```typescript
function tokenizeShellLine(line: string): string[] {
  const tokens: string[] = []
  let current = ""
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      i++
      continue
    }
    if (ch === " " && !inQuotes) {
      if (current.length > 0) { tokens.push(current); current = "" }
      i++
      continue
    }
    if (ch === "|" && !inQuotes) {
      if (current.length > 0) { tokens.push(current); current = "" }
      tokens.push("|")
      i++
      continue
    }
    current += ch
    i++
  }
  if (current.length > 0) tokens.push(current)
  return tokens
}
```

`inQuotes` is the sliding-window-style state LAB-80's lexer relied on, applied to a much simpler grammar: a space or `|` only ends a token when it's *outside* quotes — `echo "hello world"` correctly produces one token `hello world`, not two, because the space between them is swallowed while `inQuotes` is `true`. `|` is tokenized as its own distinct token (not absorbed into a word), which is what Step 4's pipe-handling logic below splits the command list on.

### SAVE AND TRY

```typescript
console.log(tokenizeShellLine('echo "hello world" | wc -l'))
// ["echo", "hello world", "|", "wc", "-l"]
```

`"hello world"` correctly stays as one token despite the internal space, and `|` is correctly its own separate token — confirming both the quoting and pipe-detection logic work together on the same line.

## Step 3: `stdio: "inherit"` — connecting the child directly to the terminal

```typescript
// stdio: "inherit" tells Node: don't create pipes for this child's stdin/stdout/stderr at all --
// instead, let the child use the SAME file descriptors the shell process itself is using,
// which are (usually) the actual terminal. This is why `echo hello` prints directly to the
// screen with no manual `child.stdout.on("data", ...)` wiring needed in Step 1.
const child = spawn("echo", ["hello"], { stdio: "inherit" })
```

This is a deliberate contrast with LAB-92/93, where every example manually wired `child.stdout.on("data", ...)` to capture and relay output — useful when the parent needs to *process* the child's output. A shell usually doesn't; it just wants the child's output to appear on the terminal exactly as if the child had been run directly, and `stdio: "inherit"` is the option that says exactly that, skipping the pipe-and-relay dance entirely.

### SAVE AND TRY

Run a command that produces a lot of output, like spawning `node -e "for (let i=0;i<5;i++) console.log(i)"` with `stdio: "inherit"` versus with the default (piped) stdio and manual relaying. Both should show the same five lines, but `inherit` requires zero relay code — confirm by removing any `child.stdout.on(...)` and observing output still appears.

## Step 4: Wiring up the pipe operator between commands

```typescript
function runCommand(line: string): void {
  const tokens = tokenizeShellLine(line)
  if (tokens.length === 0) return

  const commandGroups = splitOnPipe(tokens)
  if (commandGroups.length === 1) {
    const [command, ...args] = commandGroups[0]
    const child = spawn(command, args, { stdio: "inherit" })
    child.on("error", () => console.error(`command not found: ${command}`))
    return
  }

  runPipeline(commandGroups)
}

function splitOnPipe(tokens: string[]): string[][] {
  const groups: string[][] = [[]]
  for (const token of tokens) {
    if (token === "|") groups.push([])
    else groups[groups.length - 1].push(token)
  }
  return groups
}

function runPipeline(commandGroups: string[][]): void {
  const children = commandGroups.map((group, i) => {
    const [command, ...args] = group
    const isFirst = i === 0
    const isLast = i === commandGroups.length - 1
    return spawn(command, args, {
      stdio: [isFirst ? "inherit" : "pipe", isLast ? "inherit" : "pipe", "inherit"],
    })
  })

  for (let i = 0; i < children.length - 1; i++) {
    children[i].stdout!.pipe(children[i + 1].stdin!) // LAB-93 Step 1's exact technique, chained across N commands
  }
}
```

`splitOnPipe` turns `["echo", "hello world", "|", "wc", "-l"]` into `[["echo", "hello world"], ["wc", "-l"]]` — one array per pipeline stage. `runPipeline` spawns every stage up front (matching LAB-92's Challenge — all children running concurrently), with only the *first* stage's stdin and the *last* stage's stdout left as `"inherit"` (connected to the real terminal); every stage in between gets `"pipe"` on both ends, specifically so `.pipe()` can wire it to its neighbor, exactly LAB-93's single-pipe technique generalized to a chain of arbitrary length.

### SAVE AND TRY

Run `runCommand('echo "line one" | wc -l')` inside the shell. It should print `1` — `echo`'s output flows into `wc -l`'s input via the pipe, and `wc -l`'s own output (since it's the last stage) goes to `"inherit"`, appearing directly on the terminal.

## 🎯 Challenge

Add environment variable support: `export NAME=value` sets a variable in the shell's own tracked environment (not the real OS environment), and `$NAME` inside a later command line gets substituted with its value before tokenizing — reusing this lab's own persistent state (a `Map`) across multiple `"line"` events, the way a real shell session remembers exports for its lifetime.

<details>
<summary>Solution</summary>

```typescript
const shellEnv = new Map<string, string>()

function expandVariables(line: string): string {
  return line.replace(/\$(\w+)/g, (_, name) => shellEnv.get(name) ?? "")
}

function runCommand(line: string): void {
  if (line.startsWith("export ")) {
    const [, assignment] = line.split(/^export\s+/)
    const [name, value] = assignment.split("=")
    shellEnv.set(name, value)
    return
  }

  const expanded = expandVariables(line)
  const tokens = tokenizeShellLine(expanded)
  // ...rest unchanged from Step 4...
}
```

`shellEnv` is a plain `Map` living in the shell process's own memory — declared once, outside `runCommand`, so it persists across every `"line"` event for the lifetime of this one shell process, exactly matching the concept section's Quick Check about exports persisting within a session but not leaking to a different terminal (a different terminal is a *different* shell process, with its own separate `shellEnv`, never touching this one).

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Running a typed command | Something magic the OS does | Parse it, then `spawn()` it — LAB-92's primitive, driven by user input |
| `cmd1 \| cmd2` | Both commands run inside the shell itself | Two separate child processes, stdout piped to stdin (LAB-93) |
| Command not found | Let it throw and crash | Handle the child's `"error"` event explicitly |
| `export` variables | Set a real OS environment variable | Track in the shell's own in-memory state, scoped to that session |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `stdio: "inherit"` remove the need for manual `child.stdout.on("data", ...)` relaying? | |
| 2 | Why does `runPipeline` spawn every command in the pipeline before wiring up any `.pipe()` calls? | |
| 3 | Why would a shell without a `child.on("error", ...)` handler be fragile? | |

## Quick Check Answers

1. It reduces to spawning a new OS process (LAB-92) running the `ls` executable, with its stdout connected back to the shell's own terminal so the output appears where the user can see it.
2. Because each side of a pipe needs to be a genuinely separate, independently-scheduled process — if both ran inside the shell's own single process, one command finishing wouldn't let the other continue running concurrently, and connecting real OS-level stdout/stdin streams between two commands requires two actual processes to connect.
3. A shell's own `export`s are simply variables tracked in that one shell process's private memory — a different terminal runs an entirely separate shell process with its own separate memory, so nothing needs to be manually scoped; the isolation is automatic because processes don't share memory (LAB-92) unless explicitly connected.

*Next: [LAB-97 — Process Manager](LAB-97-process-manager.md)*
