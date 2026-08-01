# SE Masterclass — LAB-98 — File Watcher

**Prerequisites:** LAB-97 (Process Manager)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why can a single file save trigger multiple raw filesystem change events instead of exactly one?
2. What problem does debouncing solve that simply reacting to every event immediately doesn't?
3. Why does watching a directory recursively need special handling for newly created subdirectories?

## What You Will Build

A file watcher that monitors a directory tree for changes, debounces rapid-fire events from a single save into one action, and triggers a configurable command (reusing LAB-97's process-spawning) — a minimal, from-scratch version of what tools like `nodemon` or `webpack --watch` do.

```
Watching ./src for changes...
[10:32:01] Change detected: src/index.ts
[10:32:01] Change detected: src/index.ts  (same event, arrived twice -- raw noise)
[10:32:01] Change detected: src/index.ts  (raw noise continues)
[10:32:01] Debounced -- running: npm test
  ✓ 12 tests passed
```

## Concept: File System Events — Reacting to External Changes

**What it is:** Operating systems expose a mechanism for a program to be notified when files or directories change — created, modified, deleted, renamed — without that program having to repeatedly poll and compare directory listings itself. Node.js exposes this via `fs.watch`. The raw events this API delivers are noisy and low-level: a single logical "I saved this file" action from an editor can produce two, three, or more raw change events in rapid succession (many editors write to a temp file, then rename it over the original — two separate filesystem operations, two separate events).

**The problem before:** Naively reacting to every raw `fs.watch` event by immediately re-running a build or test command means a single file save can trigger the expensive action three or four times in the space of a few milliseconds — wasteful at best, and at worst, racing multiple overlapping builds against each other if the triggered command takes longer to run than the gap between duplicate events.

**The solution:** **Debounce** — instead of acting on every event immediately, reset a short timer every time a new event arrives, and only actually act once the timer finally elapses without being reset again. This collapses a burst of 3 raw events arriving 5ms apart into exactly 1 action, fired shortly after the *last* event in the burst rather than the first.

**Canonical example:**

```typescript
let debounceTimer: NodeJS.Timeout | null = null

function onFileChange(path: string): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => runAction(path), 100)
}
```

**Project Application:** LAB-100's job scheduler could trigger scheduled jobs off file-watch events using this exact debounce pattern; more directly, this lab's `triggerCommand` reuses LAB-97's `startProcess` to actually run the watched command as a managed child process.

**Watch for:** Debouncing per-event instead of per-batch when *multiple different files* change together (as happens with a `git checkout` swapping many files at once) — a naive single global timer is usually fine for a "rebuild everything" trigger, but a watcher that needs to know *which* files changed must accumulate the set of changed paths across the debounce window, not just remember the single most recent one.

## Step 1: Raw filesystem events — observing the noise directly

```typescript
import fs from "fs"

function watchRaw(directory: string): void {
  fs.watch(directory, (eventType, filename) => {
    console.log(`[raw] ${eventType}: ${filename}`)
  })
  console.log(`Watching ${directory} (raw, unfiltered)...`)
}

watchRaw("./src")
```

`fs.watch`'s callback fires once per underlying OS-level filesystem event — no filtering, no deduplication, no debouncing, exactly the raw noise the concept section described. This step exists specifically to *see* the noise before building anything to handle it, the same "reproduce the bug on purpose first" discipline LAB-94's Step 1 used for race conditions.

### SAVE AND TRY

Run `watchRaw("./src")` and save a file in that directory using a real text editor (not a one-line `fs.writeFileSync`, which produces cleaner output — use an actual editor like VS Code). Count how many `[raw]` lines print for that single save — it's very likely more than one, confirming the concept section's claim directly rather than taking it on faith.

## Step 2: Debouncing — collapsing a burst into one action

```typescript
function watchDebounced(directory: string, delayMs: number, onSettled: (changedFiles: Set<string>) => void): void {
  let debounceTimer: NodeJS.Timeout | null = null
  const changedFiles = new Set<string>()

  fs.watch(directory, (eventType, filename) => {
    if (!filename) return
    changedFiles.add(filename)

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      onSettled(new Set(changedFiles)) // copy -- so the caller's set isn't mutated by the next batch
      changedFiles.clear()
      debounceTimer = null
    }, delayMs)
  })

  console.log(`Watching ${directory} (debounced, ${delayMs}ms)...`)
}

watchDebounced("./src", 200, (files) => {
  console.log(`Debounced -- ${files.size} file(s) changed:`, [...files])
})
```

`changedFiles` is the "watch for" fix from the concept section made concrete: instead of a single timer tracking one most-recent filename, every event within the debounce window adds its filename to a `Set` (deduplicating repeats of the same file automatically, since `Set` ignores duplicate values), and `onSettled` receives the *whole batch* of files that changed during that window — correct for both a single noisy save and a `git checkout` touching many files at once. `clearTimeout`/`setTimeout` on every event is the debounce mechanism itself: each new event pushes the "fire" moment further into the future, so the callback only runs once events have genuinely stopped arriving for `delayMs`.

### SAVE AND TRY

Save the same file 3 times in quick succession (within less than 200ms of each other — a fast series of Ctrl+S). Confirm `onSettled` fires exactly *once*, reporting 1 file changed — not three separate calls — proving the burst collapsed into a single action as designed.

## Step 3: Recursive watching — handling new subdirectories

```typescript
import path from "path"

function watchRecursive(rootDirectory: string, onSettled: (changedFiles: Set<string>) => void): void {
  const watchedDirs = new Set<string>()
  let debounceTimer: NodeJS.Timeout | null = null
  const changedFiles = new Set<string>()

  function watchDir(dir: string): void {
    if (watchedDirs.has(dir)) return
    watchedDirs.add(dir)

    fs.watch(dir, (eventType, filename) => {
      if (!filename) return
      const fullPath = path.join(dir, filename)
      changedFiles.add(fullPath)

      // a NEW subdirectory appearing needs its own fs.watch call -- fs.watch is not
      // automatically recursive on every platform, so this must be handled explicitly
      if (eventType === "rename" && fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        watchDir(fullPath)
      }

      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        onSettled(new Set(changedFiles))
        changedFiles.clear()
      }, 200)
    })
  }

  function watchExistingSubdirs(dir: string): void {
    watchDir(dir)
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) watchExistingSubdirs(path.join(dir, entry.name))
    }
  }

  watchExistingSubdirs(rootDirectory)
  console.log(`Watching ${rootDirectory} recursively...`)
}
```

`watchExistingSubdirs` walks the tree once at startup, calling `watchDir` on every existing subdirectory — a separate `fs.watch` call per directory, since (on Linux especially) `fs.watch`'s `recursive` option isn't reliably supported everywhere. The check inside the event handler — "did a `rename` event produce a path that's now a directory?" — is what catches *newly created* subdirectories after the initial walk and starts watching them too; without it, a folder created after the watcher started would be invisible to every future change inside it.

### SAVE AND TRY

Start `watchRecursive("./src", ...)`, then create a brand-new subdirectory (`mkdir src/newfolder`) and immediately create a file inside it (`echo test > src/newfolder/file.txt`). Confirm the watcher reports the new file's change — proving the dynamically-added `fs.watch` call for the newly created directory is actually active, not just the directories that existed when watching started.

## Step 4: Triggering a command — reusing LAB-97's process spawning

```typescript
import { startProcess, stopProcess } from "./process-manager" // LAB-97

function triggerCommand(command: string, args: string[]): void {
  stopProcess("watch-triggered") // kill any still-running previous invocation before starting a new one
  startProcess("watch-triggered", command, args)
}

watchDebounced("./src", 200, (files) => {
  console.log(`[${new Date().toTimeString().slice(0, 8)}] Debounced -- running: npm test`)
  triggerCommand("npm", ["test"])
})
```

`stopProcess("watch-triggered")` before every `startProcess` call handles the case a naive watcher misses: if a file changes again *while* the triggered command (`npm test`) from the previous change is still running, this ensures the stale run is killed and a fresh one started, rather than letting two overlapping test runs race against each other — directly reusing LAB-97's lifecycle management (`stopRequested` correctly suppresses any restart-on-crash logic for this intentional stop) instead of building new process-tracking logic from scratch.

### SAVE AND TRY

Set up `watchDebounced` triggering a deliberately slow command (`sleep 3 && echo done`), save a file to trigger it, then save again after 1 second (while the first `sleep 3` is still running). Confirm the first invocation gets killed (via `stopProcess`) and a fresh one starts, rather than both running to completion independently and printing `done` twice.

## 🎯 Challenge

Add a `.watchignore`-style exclusion list (an array of filename patterns, like `node_modules` or files ending in `.log`) that gets checked before adding a changed path to `changedFiles` — so changes inside `node_modules` (extremely common, extremely noisy, and almost never what a developer wants to trigger a rebuild) never reach `onSettled` at all.

<details>
<summary>Solution</summary>

```typescript
const IGNORE_PATTERNS = ["node_modules", ".git", ".log"]

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern))
}

function watchDebouncedFiltered(directory: string, delayMs: number, onSettled: (changedFiles: Set<string>) => void): void {
  let debounceTimer: NodeJS.Timeout | null = null
  const changedFiles = new Set<string>()

  fs.watch(directory, (eventType, filename) => {
    if (!filename || shouldIgnore(filename)) return // filtered BEFORE it ever reaches changedFiles

    changedFiles.add(filename)
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      onSettled(new Set(changedFiles))
      changedFiles.clear()
    }, delayMs)
  })
}
```

Filtering happens as the very first check inside the event handler, before the path ever touches `changedFiles` or resets the debounce timer — an ignored file changing doesn't just get excluded from the final batch, it doesn't even *count* toward keeping the debounce window open, so a flurry of `node_modules` writes (common during an `npm install`) won't perpetually delay a real, relevant change from ever settling.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| One file save | Exactly one filesystem event | Often multiple raw events for the same logical save |
| Reacting to changes | Run the action on every raw event | Debounce: wait for events to stop, then act once |
| New subdirectories | `fs.watch` picks them up automatically | Must explicitly detect and `fs.watch` them as they appear |
| Overlapping triggered runs | Let both run to completion | Kill the previous run before starting a new one |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does a single editor save often produce more than one raw `fs.watch` event? | |
| 2 | Why does `watchDebounced` use a `Set<string>` for changed files instead of just remembering the single most recent filename? | |
| 3 | Why must `triggerCommand` stop any previous triggered run before starting a new one? | |

## Quick Check Answers

1. Many editors don't write directly to the target file — they write to a temporary file and then rename it over the original, which is two separate filesystem operations (and often two separate raw events) for what feels to the user like one save.
2. Immediately re-running an expensive action on every single raw event means a burst of 3–4 events from one save triggers the action 3–4 times in rapid succession — wasteful, and risky if the action takes longer to run than the gap between the duplicate events, since multiple runs can then overlap and race each other.
3. Because `fs.watch` doesn't automatically watch subdirectories that didn't exist yet when watching started — a new folder created afterward needs its own explicit `fs.watch` call, which requires detecting its creation via a `rename` event and checking whether the resulting path is a directory.

*Next: [LAB-99 — Memory Visualizer](LAB-99-memory-visualizer.md)*
