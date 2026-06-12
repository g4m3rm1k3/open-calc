# Lesson 36 — Memory Management and Performance

## What You Will Build

Profile the React Native app for memory leaks, fix three common leak patterns (event
listeners not removed, intervals not cleared, WebSocket connections not closed), and
implement a memory monitor in the Electron app that shows heap usage over time.

---

## What You Need to Know First

- Lesson 08: `useEffect`, cleanup functions
- Lesson 25: WebSocket connections, cleanup
- Lesson 29: Electron main process, IPC

---

## The Lesson

### Step 1 — How JavaScript Memory Management Works

**Garbage collection (GC):**
JavaScript uses automatic memory management. When you create an object (`const user = { ... }`),
the runtime allocates memory. When no code can reference the object, the garbage collector
frees the memory.

**The mark-and-sweep algorithm:**
1. Start from "roots" (global variables, the current call stack)
2. Mark every object reachable from roots as live
3. Any object not marked is unreachable — sweep (free) it

**CS lens — reachability:**
An object is alive if and only if it is reachable from a root. "Reachable" means some chain
of references connects a root to the object. Cut all chains, and the object becomes garbage.
This is a graph reachability problem — the GC is a reachability algorithm on the object graph.

**Memory leaks in garbage-collected languages:**
A leak occurs when an object that should be dead remains reachable — something still holds a
reference to it. The GC correctly keeps it alive (it is reachable), but the program logic
intended for it to be freed. Classic causes in JavaScript:
- Event listeners registered but never removed
- Timers (`setInterval`) not cleared
- Closures capturing large objects
- References in external systems (WebSocket handlers, global stores)

### Step 2 — The Three Common Leak Patterns

**Pattern 1: Event listeners not removed.**

```typescript
// LEAKS: the listener is added on every render, never removed
function LessonScreen({ lessonId }: Props) {
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    // Missing return () => window.removeEventListener('resize', handleResize)
  }, [])
}
```

Every time `LessonScreen` mounts, a new `handleResize` listener is added. When the
component unmounts (navigating away), the listener is not removed. `window` holds a
reference to `handleResize`, which closes over the component's state and refs. The
component's memory is never freed. Navigate to the lesson screen 10 times: 10 listeners,
10 copies of the component's closed-over state.

**Fix:**
```typescript
function LessonScreen({ lessonId }: Props) {
  useEffect(() => {
    const handleResize = () => { /* ... */ }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)  // cleanup
  }, [])
}
```

**Pattern 2: Intervals not cleared.**
```typescript
// LEAKS: setInterval continues after unmount
function StreakTimer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)   // without this, the interval fires forever
  }, [])
}
```

Without `clearInterval(id)`, the interval fires even after the component unmounts.
Each tick calls `setSeconds` on an unmounted component — React logs a warning
("Can't perform a React state update on an unmounted component") and the closure
keeps the component's state referenced.

**Pattern 3: WebSocket not closed.**
```typescript
// LEAKS: socket connection stays open after component unmounts
function LessonViewerCount({ lessonId }: Props) {
  useEffect(() => {
    const socket = io(API_URL, { auth: { token } })
    socket.emit('join-lesson', lessonId)
    socket.on('viewer-count', handleCount)

    return () => {
      socket.emit('leave-lesson', lessonId)
      socket.off('viewer-count')
      socket.disconnect()   // without this, the connection stays open
    }
  }, [lessonId, token])
}
```

Without `socket.disconnect()`, the socket connection persists. The server holds a
connection entry; the client holds the socket object and its closures; the WebSocket
keepalive packets continue. For a single-page app navigating between many lessons,
accumulated open sockets exhaust connection pools and memory.

### Step 3 — Detecting Leaks with Chrome DevTools

In the web version of the app (or Electron's renderer DevTools):
1. Open DevTools → Memory tab
2. Click "Take heap snapshot" (baseline)
3. Navigate to the lesson screen
4. Navigate away (go back to the lesson list)
5. Click "Take heap snapshot" again
6. Select "Comparison" view between the two snapshots

Look for objects with `+ delta` in the `#Delta` column — objects added in the second
snapshot that did not exist in the first. If `LessonScreen` internals appear in the delta,
the component leaked.

**Forced garbage collection for accurate snapshots:**
Before taking a snapshot, click the garbage can icon ("Collect garbage"). This forces a
GC cycle, ensuring the snapshot reflects only live objects, not objects pending collection.

### Step 4 — Electron Memory Monitor

```typescript
// main/ipc/memory.ts
import { ipcMain, app } from 'electron'
import process from 'process'

export function registerMemoryHandlers() {
  ipcMain.handle('memory:getUsage', async () => {
    const v8 = await import('v8')
    const heapStats = v8.getHeapStatistics()
    const processMemory = process.memoryUsage()

    return {
      heapUsedMB: Math.round(processMemory.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(processMemory.heapTotal / 1024 / 1024),
      rssMB: Math.round(processMemory.rss / 1024 / 1024),
      heapSizeLimit: Math.round(heapStats.heap_size_limit / 1024 / 1024),
    }
  })
}
```

**`process.memoryUsage()` explained:**
Returns memory statistics for the Node.js process:
- `heapUsed`: bytes of V8 heap currently in use (allocated objects)
- `heapTotal`: bytes allocated for the heap (may be larger than `heapUsed`)
- `rss` (Resident Set Size): total memory consumed by the process including code, stack,
  and heap — the number reported by Activity Monitor / Task Manager

**`v8.getHeapStatistics()` explained:**
More detailed V8 heap statistics including `heap_size_limit` — the maximum heap size V8
will allow before throwing "JavaScript heap out of memory". Default is ~1.5GB on 64-bit systems.

**Plotting heap usage over time:**
```typescript
// Renderer component
export function MemoryMonitor() {
  const [history, setHistory] = useState<number[]>([])

  useEffect(() => {
    const id = setInterval(async () => {
      const usage = await window.ipc.invoke('memory:getUsage')
      setHistory(prev => [...prev.slice(-60), usage.heapUsedMB])   // keep last 60 samples
    }, 1000)

    return () => clearInterval(id)
  }, [])

  // Render a simple ASCII sparkline or use a charting library
  return (
    <View>
      <Text>Heap: {history[history.length - 1] ?? 0} MB</Text>
    </View>
  )
}
```

A heap that grows monotonically without bound (new baseline never drops after GC) confirms a leak.

### Step 5 — Weak References

**WeakRef and WeakMap for non-owning references:**
```typescript
// A cache that does not prevent garbage collection
const imageCache = new WeakMap<ImageBitmap, string>()

const bitmap = new ImageBitmap()  // expensive object
imageCache.set(bitmap, 'cached-data')

// When `bitmap` goes out of scope, the WeakMap entry is collected
// even though the WeakMap exists
```

**`WeakMap` vs `Map`:**
A regular `Map` holds strong references to its keys — keys are reachable via the Map,
so they are never collected. A `WeakMap` holds **weak references** — if the key has no
other strong references, the GC collects it and removes the entry from the WeakMap.

This is useful for caches: the cache should not be the reason an object stays alive.

---

## Connect the Pieces

The `useEffect` cleanup function is the solution to all three leak patterns. The cleanup
is a guarantee: "when this component unmounts, run this code." Every allocation made in
a `useEffect` that reaches outside the component (event listeners, intervals, WebSocket
connections) must be freed in the cleanup. This is the JavaScript equivalent of RAII
(Resource Acquisition Is Initialization) in C++: resources are tied to object lifetime.

The heap snapshot comparison technique is the same as diffing two database states before
and after an operation to find what changed. Both detect unintended additions. The technique
is general: whenever you suspect something is accumulating, snapshot state before and after,
compare the diff.

WeakMap/WeakRef in JavaScript are analogous to weak pointers in languages with explicit
memory management (C++, Rust). A weak pointer allows referencing an object without
keeping it alive. The pattern — non-owning reference — is universal across memory models.

---

## What Breaks Without This

Without `clearInterval` in `StreakTimer`, navigating in and out of the screen rapidly
creates one interval per navigation. After 10 navigations, 10 intervals fire per second.
Each fires `setSeconds`, which attempts to update unmounted component state. React 18's
concurrent mode may mask the warning, but 10 callbacks per second accumulate closures.
After extended use (30 minutes, 60 navigations), the app slows and eventually crashes.

Without `socket.disconnect()`, each lesson screen mount opens a WebSocket. The server's
`lessonViewers` map grows with stale entries (Lesson 25's disconnect handler never fires
because the `disconnect` event never fires). After 50 lesson views, the viewer count for
a lesson shows 50+ even if only 1 user is actively watching. The count is garbage data.

---

## Definition of Done

- [ ] Chrome DevTools heap snapshot comparison shows no growing delta after navigate-away
- [ ] All three leak patterns are fixed (event listener, interval, WebSocket cleanup)
- [ ] The Electron memory monitor shows heap usage in MB, updated every second
- [ ] The memory monitor's sparkline is stable (not growing) during normal app use
- [ ] You can answer: what is garbage collection and why do leaks occur in GC languages?
- [ ] You can answer: what is a `WeakMap` and when would you use it instead of a `Map`?
- [ ] You can answer: how does a `useEffect` cleanup function prevent leaks?
- [ ] You can answer: what does `rss` in `process.memoryUsage()` represent?
- [ ] `git commit` with a message explaining why — "Fix three memory leak patterns and add Electron memory monitor"
