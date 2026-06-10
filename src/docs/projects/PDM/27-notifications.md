# Vault PDM — Lesson 27 — In-App Notifications

## What You Will Build

When a file is checked in, a notification appears in every connected Vault instance:
"[username] checked in housing-v3.step." The notification is delivered via
**server-sent events (SSE)** — a persistent HTTP connection from the renderer to
the Express server. A notification bell icon shows unread count. Notifications
are dismissed by clicking them.

## What You Need to Know First

Lessons 01–26. The check-in flow is complete. This lesson adds the real-time
notification channel on top of it.

---

## The Problem

Without notifications, an engineer waiting for a file to be checked in must
repeatedly refresh the file tree to check its status. This is **polling** — making
repeated requests to check for changes. Polling is wasteful (every request is usually
a "nothing changed" response) and slow (the user finds out about a change after up to
one polling interval).

The alternative: the server pushes an event to the client the moment something changes.

---

## Step 1 — SSE vs WebSockets vs Long-Polling

**Three approaches for server-to-client real-time communication:**

**Polling:**
Client makes a request every N seconds. Simple to implement. Wasteful — most requests
find no changes. Latency = half the polling interval on average.

**Long-polling:**
Client makes a request; server holds it open until it has something to send (or a
timeout). When the response arrives, the client immediately makes another request.
More efficient than polling — fewer empty responses. More complex to implement.
HTTP/1.1 compatible.

**Server-sent events (SSE) — first appearance:**
A single persistent HTTP connection where the server can push text messages to the
client at any time. The client uses the `EventSource` API. SSE uses standard HTTP
(no protocol upgrade needed). One-directional: server → client only. For two-
directional communication (user sends AND receives events), use WebSockets.

**WebSockets:**
A persistent bi-directional TCP connection between client and server. Both sides can
send at any time. More complex to implement. Required for chat, collaborative editing,
live cursor tracking. Overkill for notifications (one direction only).

**Why SSE for Vault notifications:**
Notifications flow only from server to client (server → renderer). SSE is simpler
than WebSockets for this use case. SSE reconnects automatically if the connection
drops. SSE uses standard HTTP — no new protocol, no load-balancer configuration
changes. SSE is the correct tool.

---

## Step 2 — The SSE Endpoint

**SSE protocol — how it works:**
The client connects to an endpoint with `Accept: text/event-stream`. The server:
1. Sets `Content-Type: text/event-stream`
2. Sets `Cache-Control: no-cache`
3. Keeps the connection open indefinitely
4. Sends messages in the format: `data: {json}\n\n`

Each message ends with two newlines. The `EventSource` API fires an event for each
message.

### Add a notification registry to `src/api/server.ts`

```typescript
import type { Response } from 'express'

const notificationClients = new Map<string, Set<Response>>()

export function sendNotification(userId: string, event: NotificationEvent): void {
  const clients = notificationClients.get(userId)
  if (clients === undefined) return

  const data = `data: ${JSON.stringify(event)}\n\n`
  for (const client of clients) {
    try {
      client.write(data)
    } catch {
      clients.delete(client)
    }
  }
}

export function broadcastNotification(event: NotificationEvent): void {
  for (const clients of notificationClients.values()) {
    for (const client of clients) {
      try {
        client.write(`data: ${JSON.stringify(event)}\n\n`)
      } catch {
        clients.delete(client)
      }
    }
  }
}
```

**`Map<string, Set<Response>>`:**
`notificationClients` maps a `userId` to the set of open SSE connections for that
user (they may have multiple Vault windows open). `Set<Response>` holds Express
`Response` objects. When the user's window connects, their `Response` is added.
When the connection closes, it is removed.

```typescript
export interface NotificationEvent {
  type:     'checkin' | 'checkout' | 'info'
  filePath: string
  username: string
  message:  string
  timestamp: string
}

app.get('/api/notifications/stream', (request, response) => {
  const userId = String(request.query.userId ?? '')

  response.set({
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  response.flushHeaders()

  response.write('data: {"type":"connected"}\n\n')

  if (!notificationClients.has(userId)) {
    notificationClients.set(userId, new Set())
  }
  notificationClients.get(userId)!.add(response)

  request.on('close', () => {
    notificationClients.get(userId)?.delete(response)
  })
})
```

**`response.flushHeaders()` — first appearance:**
Normally, Express buffers response headers and sends them with the first `write()`.
For SSE, the client needs to know it is connected immediately — before the first event.
`flushHeaders()` sends the headers now, before any `write()` calls. Without it, the
client appears to hang until the first event arrives.

**`'X-Accel-Buffering': 'no'`:**
Nginx (a common reverse proxy) buffers responses by default. For SSE, buffering
breaks the real-time delivery — messages are batched and delivered all at once when
the buffer flushes. `X-Accel-Buffering: no` tells Nginx to disable buffering for
this response.

**`request.on('close', ...)` — cleanup:**
When the client disconnects (app closes, network drops, user navigates away), the
`close` event fires on the request. Removing the client from `notificationClients`
prevents write attempts to a closed connection (which would throw).

---

## Step 3 — Triggering Notifications on Check-in

### Update `src/domain/checkin.ts`

```typescript
import { broadcastNotification } from '../api/server.js'

// At the end of checkinFile, after completeCheckin:
broadcastNotification({
  type:     'checkin',
  filePath: filePath,
  username: '', // populated in a real system from the user lookup
  message:  `${filePath.split('/').pop()} has been checked in`,
  timestamp: new Date().toISOString(),
})
```

**Domain importing from API — the exception:**
The domain layer normally does not import from the API layer. Here, `broadcastNotification`
is the notification dispatcher — logically a cross-cutting concern. In a production
system, this would be an event bus (the domain emits an event; the API layer listens
and dispatches SSE). For this learning project, the direct import communicates the
concept without adding the event bus complexity.

---

## Step 4 — The Renderer SSE Client

### Create `src/renderer/hooks/useNotifications.ts`

```typescript
import { useState, useEffect } from 'react'
import type { NotificationEvent } from '../../api/server.js'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:3001/api/notifications/stream?userId=${userId}`
    )

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as NotificationEvent
      if (data.type === 'connected') return

      setNotifications((prev) => [data, ...prev])
      setUnreadCount((count) => count + 1)
    }

    eventSource.onerror = () => {
      console.warn('SSE connection error — EventSource will auto-reconnect')
    }

    return () => {
      eventSource.close()
    }
  }, [userId])

  function markAllRead(): void {
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAllRead }
}
```

**`EventSource` — first appearance:**
`new EventSource(url)` opens a persistent HTTP connection to the given URL. The
browser automatically reconnects if the connection drops. Event handlers:
- `onmessage` — fires for each `data: ...` message received
- `onerror` — fires on connection error (EventSource reconnects automatically)
- `onopen` — fires when the connection is established

`eventSource.close()` — called in the useEffect cleanup. Closes the SSE connection
when the component unmounts. Without this, the connection would remain open and the
browser would retry to reconnect indefinitely, even after the user logs out.

**Auto-reconnect:**
`EventSource` reconnects automatically after a disconnection — the browser implements
this internally using the `Retry` header. This is a significant advantage over
manually managing WebSocket reconnection logic.

### Add notification bell to the toolbar:

```typescript
const { notifications, unreadCount, markAllRead } = useNotifications(currentUser.vaultUserId)

// In toolbar JSX:
<div className="notification-bell" onClick={markAllRead}>
  🔔
  {unreadCount > 0 && (
    <span className="notification-badge">{unreadCount}</span>
  )}
</div>

{notifications.length > 0 && (
  <div className="notification-list">
    {notifications.slice(0, 5).map((n, i) => (
      <div key={i} className="notification-item">
        <strong>{n.type}</strong>: {n.message}
        <span className="notification-time">
          {new Date(n.timestamp).toLocaleTimeString()}
        </span>
      </div>
    ))}
  </div>
)}
```

---

## Connect the Pieces

The notification flow:

```
checkinFile() completes
  → broadcastNotification({ type: 'checkin', filePath, ... })
  → for each SSE client: response.write('data: {...}\n\n')
  → Renderer EventSource.onmessage fires
  → setNotifications updated, unreadCount incremented
  → notification bell badge appears
```

SSE is the only feature in Vault that is truly bidirectional-feeling — the server
pushes to the client without the client asking. In production, this would scale to a
message broker (Redis Pub/Sub, PostgreSQL NOTIFY/LISTEN) so multiple Express instances
could broadcast to each other's connected clients.

---

## Definition of Done

- [ ] Opening two Vault windows: checking in a file in one shows a notification in the other
- [ ] The notification bell shows the unread count
- [ ] Clicking the bell marks notifications as read (count resets)
- [ ] Closing the app does not leave open SSE connections (verify with server logs)
- [ ] You can explain SSE vs WebSockets — when to use each
- [ ] You can explain `response.flushHeaders()` and why it is needed for SSE
- [ ] You can explain EventSource auto-reconnect and why it is valuable
- [ ] You can explain the `Map<userId, Set<Response>>` structure and why `Set` instead of `Array`
- [ ] Run:
      ```
      git add src/api/ src/domain/ src/renderer/
      git commit -m "Add SSE notifications: EventSource client, per-user client registry, broadcastNotification on check-in"
      ```

---

*Next: Lesson 28 — Audit Log. Every checkout, check-in, and WIP save is recorded in
an append-only `audit_log` table. An admin screen shows the full history.*
