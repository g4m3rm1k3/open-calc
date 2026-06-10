# Junior to Senior — T11·L4 — React `useWebSocket` Pattern

**Prerequisites:** T11·L3 (ProcessPoolExecutor). You have the backend job runner.
This lesson builds the React side — the `useWebSocket` custom hook that manages
the connection lifecycle, reconnection, and message dispatch.

**What this lab adds:**
- `useEffect` with `new WebSocket(url)`: setup and cleanup
- `onopen`, `onmessage`, `onclose`, `onerror` — the four event handlers
- Connection state: `'connecting' | 'open' | 'closing' | 'closed'`
- Reconnection with exponential backoff
- `useWebSocket` custom hook

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A React component mounts and opens a WebSocket. It unmounts. What happens
>    if you don't call `socket.close()` in the cleanup?
> 2. Your `onmessage` handler calls `setMessages(prev => [...prev, msg])`. The
>    `onmessage` callback is created once in `useEffect`. After 10 re-renders,
>    does `setMessages` still work? Why?
> 3. The WebSocket connection drops. The user is still on the page. How should
>    the app respond?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `useWebSocket` hook that:

```tsx
const { status, messages, sendMessage, connect, disconnect } = useWebSocket(url);

// status: 'connecting' | 'open' | 'closed' | 'reconnecting'
// messages: Array of received message objects
// sendMessage: function to send JSON
// connect/disconnect: manual control
```

---

### Concept: WebSocket in `useEffect`

```tsx
import { useEffect, useRef, useState } from 'react';

function useWebSocket(url: string) {
  const socketRef  = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('closed');

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;
    setStatus('connecting');

    socket.onopen  = ()    => setStatus('open');
    socket.onclose = ()    => setStatus('closed');
    socket.onerror = (err) => console.error('WebSocket error', err);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle message...
    };

    return () => {
      socket.close();  // CRITICAL: cleanup on unmount or url change
    };
  }, [url]);  // Re-run only when URL changes

  return { status, socketRef };
}
```

---

### Concept: Reconnection With Exponential Backoff

```tsx
const reconnectDelay = useRef(1000);

const reconnect = useCallback(() => {
  // Don't reconnect if the user intentionally disconnected:
  if (!shouldReconnect.current) return;

  setTimeout(() => {
    connect();
    // Increase delay for next attempt (cap at 30 seconds):
    reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30_000);
  }, reconnectDelay.current);
}, [connect]);

// In onclose:
socket.onclose = () => {
  setStatus('closed');
  reconnect();  // auto-reconnect
};

// Reset delay on successful connection:
socket.onopen = () => {
  setStatus('open');
  reconnectDelay.current = 1000;  // reset
};
```

---

## Step 1 — Build the `useWebSocket` Hook

Create `src/hooks/useWebSocket.ts`:

```ts
import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'reconnecting';

export interface WebSocketMessage {
  type:   string;
  [key: string]: unknown;
}

export interface UseWebSocketReturn {
  status:      WebSocketStatus;
  messages:    WebSocketMessage[];
  sendMessage: (msg: WebSocketMessage) => void;
  clearMessages: () => void;
}

export function useWebSocket(url: string | null): UseWebSocketReturn {
  const socketRef       = useRef<WebSocket | null>(null);
  const reconnectTimer  = useRef<number | null>(null);
  const reconnectDelay  = useRef(1000);
  const shouldReconnect = useRef(true);

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
      reconnectDelay.current = 1000;  // reset backoff
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        setMessages(prev => [...prev, data]);
      } catch (e) {
        console.error('Failed to parse WebSocket message', e);
      }
    };

    socket.onclose = () => {
      setStatus('closed');
      if (shouldReconnect.current && url) {
        setStatus('reconnecting');
        reconnectTimer.current = window.setTimeout(() => {
          connect();
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30_000);
        }, reconnectDelay.current);
      }
    };

    socket.onerror = () => {
      // onclose fires after onerror — let onclose handle reconnect
    };
  }, [url]);

  useEffect(() => {
    if (!url) return;

    shouldReconnect.current = true;
    connect();

    return () => {
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
    } else {
      console.warn('WebSocket not open — message dropped');
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { status, messages, sendMessage, clearMessages };
}
```

---

## Step 2 — Build the Job Progress UI

Create `src/components/JobRunner.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useWebSocket }         from '../hooks/useWebSocket';

const WS_URL = `ws://localhost:8000/ws/${Math.random().toString(36).slice(2)}`;

interface ProgressMessage {
  type:    string;
  percent?: number;
  job_id?: string;
}

export function JobRunner() {
  const { status, messages, sendMessage, clearMessages } = useWebSocket(WS_URL);
  const [jobRunning, setJobRunning] = useState(false);
  const [progress, setProgress]     = useState(0);

  // Process incoming messages:
  useEffect(() => {
    const latest = messages[messages.length - 1] as ProgressMessage | undefined;
    if (!latest) return;

    if (latest.type === 'progress' && latest.percent !== undefined) {
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

  const cancelJob = () => {
    sendMessage({ type: 'cancel' });
  };

  const statusColor = {
    open:         'green',
    connecting:   'orange',
    reconnecting: 'orange',
    closed:       'red',
  }[status];

  return (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <h2>Job Runner</h2>
      <p>WebSocket: <span style={{ color: statusColor }}>{status}</span></p>

      <div style={{ margin: '16px 0' }}>
        {!jobRunning ? (
          <button onClick={startJob} disabled={status !== 'open'}>
            Start Job
          </button>
        ) : (
          <button onClick={cancelJob}>Cancel</button>
        )}
      </div>

      {jobRunning || progress > 0 ? (
        <div>
          <div style={{
            height: 20, background: '#eee', borderRadius: 10, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: progress === 100 ? 'green' : '#2196f3',
              transition: 'width 0.3s',
            }} />
          </div>
          <p>{progress}%</p>
        </div>
      ) : null}
    </div>
  );
}
```

### SAVE AND TRY

Start the FastAPI server and the React dev server. Open the app and click "Start Job."
Expected: progress bar fills to 100%, then the button returns to "Start Job."

---

## 🎯 Challenge: Add Message History Display

**You know:** `useWebSocket`, message array, React rendering.

**Task:** Below the progress bar, show the last 5 messages received in a scrollable list.
Show the message type and any relevant data.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
{/* Add below the progress bar: */}
<div style={{ marginTop: 16 }}>
  <h3 style={{ fontSize: 12, color: '#666' }}>Last 5 messages:</h3>
  <div style={{
    fontFamily: 'monospace', fontSize: 11, background: '#f5f5f5',
    padding: 8, borderRadius: 4, maxHeight: 120, overflow: 'auto',
  }}>
    {messages.slice(-5).map((msg, i) => (
      <div key={i} style={{ marginBottom: 4 }}>
        <span style={{ color: '#666' }}>{msg.type}:</span>{' '}
        {msg.percent !== undefined ? `${msg.percent}%` : ''}
        {msg.job_id ? ` (${msg.job_id})` : ''}
      </div>
    ))}
    {messages.length === 0 && (
      <span style={{ color: '#999' }}>No messages yet</span>
    )}
  </div>
</div>
```

</details>

---

## Final Check

| Concern | Solution |
|---|---|
| Cleanup on unmount | `socket.close()` in `useEffect` return |
| Reconnection | Exponential backoff in `onclose` |
| Stale closure in `onmessage` | `setMessages(prev => [...prev, data])` (functional update) |
| Message parsing | `try/catch` around `JSON.parse` |
| Status display | Track `status` state from socket events |

---

## Quick Check Answers

**1. Component unmounts without `socket.close()`. What happens?**

The WebSocket connection stays open on the server until it times out or the user
closes the browser tab. More critically, the `onmessage` handler still fires —
it calls `setMessages` on an unmounted component, causing React to log a warning
and potentially a memory leak. Always close the socket in the `useEffect` cleanup.

**2. `setMessages` from a callback created in `useEffect` — after 10 re-renders, does it still work?**

Yes, because it uses the functional update form `setMessages(prev => [...prev, msg])`.
The `prev` parameter is always the current state, regardless of when the callback was
created. If it used `setMessages([...messages, msg])` (capturing `messages` by
closure), it would use a stale snapshot of `messages` from when the callback was created.
Functional updates bypass the stale closure problem.

**3. WebSocket drops — user still on the page. How should the app respond?**

Attempt automatic reconnection with exponential backoff. Show a "Reconnecting..."
status. After reconnection, the user should not have to do anything — the job
state is restored from the `messages` array. The `onclose` handler schedules a
`connect()` call after a delay. The delay doubles on each failure (backoff) to
avoid overwhelming the server during an outage.
