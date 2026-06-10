# Junior to Senior — T11·L4 — React `useWebSocket` Pattern

**Prerequisites:** T11·L3 (ProcessPoolExecutor). You have the backend job runner.
This lesson builds the WebSocket hook by explaining the stale closure problem —
which is WHY `setMessages(prev => [...prev, msg])` is required, not `setMessages([...messages, msg])`.

**What this lab adds:**
- WHY `socket.close()` in `useEffect` cleanup is not optional — the memory leak demonstrated
- THE stale closure problem: why callbacks created in `useEffect` can't use `useState` values directly
- HOW exponential backoff works — doubling the delay each attempt
- WHAT `shouldReconnect.current` does — a ref flag that persists across renders
- Building the hook step by step, testing the stale closure failure first

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `useEffect` runs once (empty deps). Inside it: `socket.onmessage = () => console.log(messages)`.
>    `messages` is state. After 10 state updates, `messages` has 10 items. What does
>    the console show? Why?
> 2. `useRef(false)` vs `useState(false)` for the `shouldReconnect` flag. The flag changes
>    from `false` to `true`. With `useRef`: does the component re-render? With `useState`?
> 3. Reconnect with delays: 1s, 2s, 4s, 8s. What is the pattern? What prevents it from
>    growing to 1024s?
>
> *(Answers at the end of this lab)*

---

## Step 1 — See the Stale Closure Problem First

The stale closure is the most common `useEffect` bug. See it before fixing it:

```tsx
// src/components/StaleClosureDemo.tsx
import { useState, useEffect } from 'react';

export function StaleClosureDemo() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // This callback is created ONCE when the component mounts.
    // It captures the value of `messages` AT THAT TIME — an empty array.
    // Even when messages updates, this callback still sees the old empty array.
    const socket = new WebSocket('ws://localhost:8000/ws/demo');

    socket.onmessage = (event) => {
      // BUG: messages is ALWAYS [] here — the stale closure
      setMessages([...messages, event.data]);
      //           ↑ always the empty array from when this callback was created
    };

    return () => socket.close();
  }, []);   // empty deps → callback created once, messages never updates inside it

  return <div>{messages.length} messages</div>;
}
```

### SAVE AND TRY

Add `<StaleClosureDemo />` to the app. Connect a WebSocket and send 3 messages.
Expected: the component shows "1 message" no matter how many you send — each message
overwrites with `[...[], newMessage]` = one-item array.

**The fix:**

```tsx
socket.onmessage = (event) => {
  // Use the functional update form — prev is always the CURRENT value:
  setMessages(prev => [...prev, event.data]);
  //           ↑ prev is injected by React at call time, not captured by the closure
};
```

With `prev =>`, React passes the current state value when it calls your updater.
The updater does not need to "see" `messages` — React provides it.

---

### Concept: The Stale Closure Problem in useEffect

**What it is:** When a function is created inside `useEffect`, it captures the values
of all variables at creation time. If those variables change later (via `useState`), the
function still sees the old values — its "stale" snapshot.

**The mechanism:**

```ts
let x = 1;
const fn = () => console.log(x);   // captures x = 1
x = 2;
fn();   // logs 1, not 2 — fn captured the old x
```

React's `useState` updates `messages` to a new array on each render. But `onmessage`
was created in `useEffect` with empty deps — it was created on the first render, where
`messages` was `[]`. It never re-runs, so it never captures the updated value.

**The functional update form bypasses this:** `setMessages(prev => ...)` does not READ
`messages` — it calls a function that RECEIVES the current value from React. No stale closure.

**You will see this again in:**
- `setTimeout` inside components that use state — classic stale closure bug
- Event listeners in `useEffect` — same problem
- React's exhaustive-deps ESLint rule tries to catch this automatically

---

## Step 2 — Build `useWebSocket`

Create `src/hooks/useWebSocket.ts`:

```ts
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'reconnecting';

export interface WebSocketMessage {
  type:   string;
  [key: string]: unknown;
}

export function useWebSocket(url: string | null) {
  const socketRef       = useRef<WebSocket | null>(null);
  const reconnectDelay  = useRef(1000);       // start at 1 second
  const reconnectTimer  = useRef<number | null>(null);
  const shouldReconnect = useRef(true);       // set to false on intentional disconnect

  const [status,   setStatus]   = useState<WebSocketStatus>('closed');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const connect = useCallback(() => {
    if (!url) return;

    socketRef.current?.close();
    const socket = new WebSocket(url);
    socketRef.current = socket;
    setStatus('connecting');

    socket.onopen = () => {
      setStatus('open');
      reconnectDelay.current = 1000;   // reset backoff on successful connection
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        // Functional update — avoids stale closure:
        setMessages(prev => [...prev, data]);
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };

    socket.onclose = () => {
      setStatus('closed');
      if (shouldReconnect.current && url) {
        setStatus('reconnecting');
        reconnectTimer.current = window.setTimeout(() => {
          connect();
          // Exponential backoff: 1s → 2s → 4s → 8s → ... capped at 30s:
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30_000);
        }, reconnectDelay.current);
      }
    };

    socket.onerror = () => {
      // onerror always fires before onclose — let onclose handle reconnect:
    };
  }, [url]);

  useEffect(() => {
    if (!url) return;

    shouldReconnect.current = true;
    connect();

    return () => {
      // Cleanup: prevent reconnection, close the socket:
      shouldReconnect.current = false;
      if (reconnectTimer.current !== null) {
        clearTimeout(reconnectTimer.current);
      }
      socketRef.current?.close();
    };
  }, [url, connect]);

  const sendMessage = useCallback((msg: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { status, messages, sendMessage, clearMessages };
}
```

### SAVE AND TRY

Add this component to the app to verify:

```tsx
import { useWebSocket } from '../hooks/useWebSocket';

function WebSocketDemo() {
  const { status, messages, sendMessage } = useWebSocket('ws://localhost:8000/ws/demo');

  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={() => sendMessage({ type: 'ping' })}>Ping</button>
      <p>{messages.length} messages received</p>
      {messages.map((m, i) => (
        <p key={i}>{JSON.stringify(m)}</p>
      ))}
    </div>
  );
}
```

```bash
npm run dev
```

Open the app. Click "Ping". Expected: status shows "open", and the server's pong response appears.

**In React DevTools:**
Watch `messages` state. Each click adds ONE message to the array (not replacing previous ones).
This confirms the functional update form works — no stale closure.

---

## Step 3 — Build the Progress UI

Create `src/components/JobRunner.tsx`:

```tsx
// src/components/JobRunner.tsx
import { useState, useEffect } from 'react';
import { useWebSocket }         from '../hooks/useWebSocket';

const WS_URL = `ws://localhost:8000/ws/${Math.random().toString(36).slice(2)}`;

export function JobRunner() {
  const { status, messages, sendMessage, clearMessages } = useWebSocket(WS_URL);
  const [jobRunning, setJobRunning] = useState(false);
  const [progress,   setProgress]   = useState(0);

  // Process incoming messages:
  useEffect(() => {
    const latest = messages[messages.length - 1];
    if (!latest) return;

    if (latest.type === 'progress' && typeof latest.percent === 'number') {
      setProgress(latest.percent);
    }
    if (latest.type === 'complete') {
      setJobRunning(false);
      setProgress(100);
    }
    if (latest.type === 'cancelled') {
      setJobRunning(false);
      setProgress(0);
    }
  }, [messages]);

  const startJob = () => {
    clearMessages();
    setProgress(0);
    setJobRunning(true);
    sendMessage({ type: 'start_job', job_id: `job-${Date.now()}` });
  };

  return (
    <div style={{ padding: 24 }}>
      <p>Connection: <strong>{status}</strong></p>

      {!jobRunning
        ? <button onClick={startJob} disabled={status !== 'open'}>Start Job</button>
        : <button onClick={() => sendMessage({ type: 'cancel' })}>Cancel</button>
      }

      {(jobRunning || progress > 0) && (
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 20, background: '#eee', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width:  `${progress}%`,
              background: progress === 100 ? 'green' : '#2196f3',
              transition: 'width 0.3s',
            }} />
          </div>
          <p style={{ textAlign: 'center' }}>{progress}%</p>
        </div>
      )}
    </div>
  );
}
```

### SAVE AND TRY

With the backend running, add `<JobRunner />` to the app and open the browser.

**You should see:** "Start Job" button (disabled until connected). Once the connection shows
"open", click Start Job. The progress bar fills. The server sends progress events; the hook
dispatches them; the component updates.

---

## 🎯 Challenge: Persist the Job ID Across Page Reloads

**You know:** `useWebSocket`, `sessionStorage`, `useEffect`.

**The mechanism:**

When the page reloads, the WebSocket reconnects automatically (exponential backoff).
But the component's state is lost — it doesn't know a job was running.
`sessionStorage` persists across page reloads within the same browser tab.

**Task:** Store the current `job_id` in `sessionStorage` when a job starts.
When the WebSocket reconnects (`status === 'open'`), read the stored job_id and
send `{ type: 'resume', job_id }` to the server.

Write 2 tests verifying the job_id is stored and the resume message is sent.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
const [currentJobId, setCurrentJobId] = useState<string | null>(
  () => sessionStorage.getItem('current_job_id')
);

// When connected, resume any in-progress job:
useEffect(() => {
  if (status === 'open' && currentJobId) {
    sendMessage({ type: 'resume', job_id: currentJobId });
  }
}, [status, currentJobId]);

const startJob = () => {
  const jobId = `job-${Date.now()}`;
  setCurrentJobId(jobId);
  sessionStorage.setItem('current_job_id', jobId);
  sendMessage({ type: 'start_job', job_id: jobId });
  setJobRunning(true);
};

// Clear on completion or cancel:
const onComplete = () => {
  setCurrentJobId(null);
  sessionStorage.removeItem('current_job_id');
  setJobRunning(false);
};
```

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| Stale closure bug | Without `prev =>`, sending 3 messages shows "1 message" |
| Functional update fix | With `prev =>`, each message accumulates correctly |
| `shouldReconnect.current` prevents leak | Set `url = null`, verify no reconnect attempts |
| Exponential backoff | Log `reconnectDelay.current` — doubles each attempt |
| Cleanup on unmount | Unmount component — `socket.close()` called, no reconnect |

---

## Quick Check Answers

**1. `onmessage` created in `useEffect` with `[]`. After 10 updates, what does `console.log(messages)` show?**

An empty array `[]`. The `onmessage` callback was created when the component first mounted —
at that point `messages` was `[]`. The closure captured `[]`. Even as `messages` updates to 1,
2, 3... items, the `onmessage` callback still holds a reference to the original empty array.
This is the stale closure. The fix: `setMessages(prev => [...prev, newItem])` — React provides
the current value as `prev` at call time.

**2. `useRef(false)` vs `useState(false)` for `shouldReconnect`. Does changing it trigger a re-render?**

`useRef(false)`: NO re-render. `ref.current = true` mutates the ref directly — React does
not track ref mutations. The value persists across renders but changing it doesn't cause a
render. This is exactly what you want for the reconnect flag — it should persist but not
trigger renders.

`useState(false)`: YES re-render when changed. Every `setShouldReconnect(true)` triggers a
re-render — wasteful for a flag that only controls internal logic.

**3. Delays: 1s, 2s, 4s, 8s. Pattern? How to cap at 30s?**

Exponential backoff: each attempt doubles the previous delay. `reconnectDelay *= 2`.
Without a cap: 1→2→4→8→16→32→64→128s. The cap: `Math.min(delay * 2, 30_000)` — once
the delay would exceed 30 seconds, it stays at 30 seconds. This prevents indefinitely
long delays for persistent failures while still backing off from rapid reconnections.
