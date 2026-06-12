# Lesson 25 — Real-Time Features with WebSockets

## What You Will Build

Live viewer count: the lesson screen shows how many users are currently viewing that
lesson. Notifications when a lesson is updated by an admin. Open the app on two browser
tabs — the count updates in real time. Close one — it drops to 1.

---

## What You Need to Know First

- Lesson 11: HTTP, the request/response model
- Lesson 17: JWT tokens for authentication

---

## The Lesson

### Step 1 — The Limitations of HTTP Polling

**Polling:** To check for updates, the client asks the server every N seconds.
```typescript
// Polling every 5 seconds
setInterval(async () => {
  const response = await fetch('/api/lessons/5/viewers')
  setViewerCount(response.viewers)
}, 5000)
```

**Problems:**
- **Latency:** Updates arrive up to N seconds late. For a live viewer count, 5 seconds is
  perceptible. For chat messages, it is unacceptable.
- **Waste:** 99% of polls return the same data. Every poll is a round trip even when
  nothing changed.
- **Scale:** 1,000 users polling every 5 seconds = 200 requests per second with no user
  activity. All waste.

### Step 2 — WebSockets

A **WebSocket** is a persistent, bidirectional connection between client and server.

**How the WebSocket handshake works:**
The connection starts as an HTTP request with an `Upgrade` header:
```
GET /ws HTTP/1.1
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
```

The server responds with `101 Switching Protocols`, and from that point, the TCP connection
is used for WebSocket frames — not HTTP requests.

**What frames are:** WebSocket communication is divided into **frames** — small units of
data with a header (opcode, length, masking key) and a payload. Frames are more efficient
than HTTP requests: no headers per message, persistent connection, no TLS handshake overhead.

**Bidirectional:** Both the client and server can send messages at any time. HTTP is
request/response — the client initiates, the server responds. WebSockets are symmetric.

### Step 3 — The Publish/Subscribe Pattern

With many clients connected and watching different lessons, direct notification is complex.
The **publish/subscribe (pub/sub)** pattern simplifies this:

- A client **subscribes** to a topic (e.g., `lesson:5:viewers`)
- The server **publishes** an event to a topic
- All subscribers receive the event

```
Client A subscribes to 'lesson:5:viewers'
Client B subscribes to 'lesson:5:viewers'
Client C subscribes to 'lesson:8:viewers'

Server publishes 'lesson:5:viewers': viewerCount: 2
→ Client A receives: viewerCount: 2
→ Client B receives: viewerCount: 2
→ Client C does not receive (different topic)
```

This decouples publishers (who sends events) from subscribers (who receives them).
Pub/sub appears everywhere: Redis pub/sub, message queues (RabbitMQ, Kafka), browser
`EventEmitter`, React's context updates.

### Step 4 — Setting Up Socket.io

**What Socket.io is:** A library for real-time bidirectional communication. It uses
WebSockets when available and falls back to HTTP long-polling otherwise. It adds:
- Automatic reconnection
- Room/namespace management
- Acknowledgements
- Broadcasting

```bash
$ npm install socket.io
$ npm install socket.io-client
```

**Server-side setup:**

```typescript
import { createServer } from 'http'
import { Server as SocketServer, type Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

const httpServer = createServer(app)
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env['APP_URL'] ?? 'http://localhost:8081',
    credentials: true,
  },
})

// Track viewers per lesson: lessonId → Set of socket IDs
const lessonViewers = new Map<number, Set<string>>()

// Auth middleware for Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth['token']
  if (typeof token !== 'string') {
    return next(new Error('Authentication required'))
  }

  try {
    const payload = jwt.verify(token, process.env['JWT_SECRET']!) as { userId: number }
    socket.data.userId = payload.userId
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join-lesson', (lessonId: number) => {
    const viewerRoom = `lesson:${lessonId}:viewers`
    socket.join(viewerRoom)

    // Track this viewer
    if (!lessonViewers.has(lessonId)) {
      lessonViewers.set(lessonId, new Set())
    }
    lessonViewers.get(lessonId)!.add(socket.id)

    // Broadcast updated count to all viewers of this lesson
    const viewerCount = lessonViewers.get(lessonId)!.size
    io.to(viewerRoom).emit('viewer-count', { lessonId, count: viewerCount })
  })

  socket.on('leave-lesson', (lessonId: number) => {
    const viewerRoom = `lesson:${lessonId}:viewers`
    socket.leave(viewerRoom)
    lessonViewers.get(lessonId)?.delete(socket.id)

    const viewerCount = lessonViewers.get(lessonId)?.size ?? 0
    io.to(viewerRoom).emit('viewer-count', { lessonId, count: viewerCount })
  })

  socket.on('disconnect', () => {
    // Clean up all lessons this socket was viewing
    for (const [lessonId, viewers] of lessonViewers.entries()) {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id)
        const viewerRoom = `lesson:${lessonId}:viewers`
        io.to(viewerRoom).emit('viewer-count', { lessonId, count: viewers.size })
      }
    }
  })
})

httpServer.listen(PORT)
```

**`socket.join(room)` and `io.to(room).emit(...)`:**
Socket.io **rooms** are named channels. `socket.join('lesson:5:viewers')` subscribes
the socket to that room. `io.to('lesson:5:viewers').emit('viewer-count', data)` sends
an event to all sockets in that room. This is the pub/sub pattern implemented in Socket.io.

**`socket.data.userId`:** Socket.io's `socket.data` is a type-safe, per-socket store.
Setting `socket.data.userId` in the auth middleware makes the user ID available in all
event handlers for that socket.

**CS lens — concurrency:**
Multiple WebSocket connections are handled concurrently in Node.js's event loop. "Concurrently"
means the event loop processes one event at a time, but switches between active connections
quickly — it is not parallel (multiple threads) but cooperative multitasking (one thread,
non-blocking I/O). A WebSocket message from client A and a message from client B are
processed sequentially but so quickly that they appear simultaneous.

### Step 5 — Client-Side

Install on the React app:
```bash
$ npm install socket.io-client
```

Create a custom hook `src/hooks/useSocket.ts`:

```typescript
import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    if (token === null) return

    const socket = io(process.env['EXPO_PUBLIC_API_URL']!, {
      auth: { token },
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [token])

  return socketRef.current
}

export function useLessonViewers(lessonId: number): number {
  const socket = useSocket()
  const [viewerCount, setViewerCount] = useState(1)

  useEffect(() => {
    if (socket === null) return

    socket.emit('join-lesson', lessonId)
    socket.on('viewer-count', ({ lessonId: id, count }) => {
      if (id === lessonId) setViewerCount(count)
    })

    return () => {
      socket.emit('leave-lesson', lessonId)
      socket.off('viewer-count')
    }
  }, [socket, lessonId])

  return viewerCount
}
```

**Reconnection with exponential backoff:**
Network connections drop. Socket.io reconnects automatically by default. The reconnection
strategy: wait 1s, then 2s, then 4s, then 8s, then 16s (doubling each time). This is
**exponential backoff** — the wait time grows exponentially, reducing load on the server
during an outage.

**Jitter:** Adding random variation to the reconnection delay. If 1,000 clients all
reconnect simultaneously after a server restart, they create a **thundering herd** —
a sudden spike in connections. Adding random jitter (±500ms to each delay) spreads the
reconnections over time.

---

## Connect the Pieces

The pub/sub pattern in Socket.io rooms is the same as the observer pattern in React:
a component subscribes to state (`useSelector`, `useContext`) and receives updates when
the state changes. The implementation differs (event bus vs React reconciliation), but
the concept is identical.

WebSockets solve the same problem as the streaming output in the code runner (Lesson 09)
— both need to push updates from server to client without polling. The code runner uses
`postMessage` within the same origin; WebSockets communicate across the network.

Exponential backoff with jitter is a production pattern used by AWS SQS, Google Cloud
Pub/Sub, Redis reconnection, and every robust distributed system. The "thundering herd"
problem it solves would affect your app the moment you have more than a few hundred users.

---

## What Breaks Without This

Without the `disconnect` event handler, a user who closes their browser tab remains in
`lessonViewers` forever. After 100 users each browse several lessons and close their
tabs, `lessonViewers` has thousands of stale entries. The viewer count grows without
bound. The real count is invisible behind the phantom count.

Without exponential backoff jitter, every client reconnects at exactly the same time
after a server restart. The server receives thousands of simultaneous connection requests
while it is still warming up. It crashes again. The clients reconnect again. The cycle
continues until all clients are manually restarted.

---

## Definition of Done

- [ ] Opening the lesson screen on two browser tabs shows viewer count = 2
- [ ] Closing one tab updates the count to 1 in the remaining tab
- [ ] WebSocket auth rejects connections without a valid JWT
- [ ] The Socket.io reconnection is tested by stopping and restarting the server
- [ ] You can answer: what is the WebSocket handshake and how does it start as HTTP?
- [ ] You can answer: what is pub/sub and how do Socket.io rooms implement it?
- [ ] You can answer: what is exponential backoff with jitter and what problem does jitter solve?
- [ ] You can answer: what is the thundering herd problem?
- [ ] `git commit` with a message explaining why — "Add WebSocket viewer count with Socket.io and pub/sub room pattern"
