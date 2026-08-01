# SE Masterclass — LAB-93 — IPC

**Prerequisites:** LAB-92 (Processes and Threads)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does `stdout`/`stdin` piping (LAB-92) count as a form of IPC, even though it doesn't feel like "messaging"?
2. What's the practical difference between a pipe (one-directional, parent-child only) and a Unix socket (bidirectional, any two processes that know its path)?
3. Why does message-passing IPC need each message to be self-delimiting (a length prefix, a delimiter, or fixed framing) rather than just writing raw bytes?

## What You Will Build

Three IPC mechanisms between separate Node.js processes: a plain pipe (LAB-92's stdin/stdout, formalized), a structured `child_process.fork()` message channel, and a Unix domain socket connecting two *unrelated* processes (not parent-child) — each demonstrating a different point on the "how connected do these processes need to be" spectrum.

```
Pipe:        parent writes to child.stdin -> child reads from stdin
fork():      parent.send({...}) -> child receives "message" event with the SAME object
Unix socket: server listens on a socket file -> any client that knows the path can connect
```

## Concept: Inter-Process Communication — Coordinating Isolated Processes

**What it is:** IPC is the general term for every mechanism that lets separate, memory-isolated processes (LAB-92) exchange information. Different IPC mechanisms trade off structure, connection topology, and overhead: a **pipe** is a one-way byte stream, typically between a parent and its direct child; a **message channel** (Node's `fork()`) automatically serializes and delivers whole JavaScript objects; a **Unix domain socket** is a bidirectional, named connection point that *any* process on the machine can connect to, not just a direct relative.

**The problem before:** LAB-92's `stdin`/`stdout` piping works, but it's the crudest possible IPC — raw, unstructured bytes, and only between a process and the one that directly spawned it. Real systems need richer patterns: a build tool's parent process wants to send structured job objects to worker children, not hand-parse text; a database client needs to talk to a database *server* process that it didn't spawn and has no parent/child relationship with at all.

**The solution:** Choose the IPC mechanism that matches the actual relationship and data shape needed. `child_process.fork()` (Node-specific) automatically serializes JS objects across the parent-child boundary — no manual text parsing required, at the cost of only working between direct relatives. A Unix domain socket (`net.createServer({ path: ... })`) drops the parent-child requirement entirely: any process that knows the socket's file path can connect, making it the right choice for genuinely independent processes that need to find each other.

**Canonical example:**

```typescript
import { fork } from "child_process"
const child = fork("./worker.js")
child.send({ type: "task", payload: 42 })
child.on("message", (result) => console.log("Got result:", result))
```

**Project Application:** LAB-97's process manager uses `fork()`-style structured messaging to send lifecycle commands to managed children; LAB-96's shell uses raw pipes (this lab's Step 1) to connect one command's stdout to the next command's stdin, exactly mirroring a real shell's `|` operator.

**Watch for:** Assuming a Unix socket message arrives whole in one `"data"` event. TCP/Unix sockets are streams, not message queues — a single `write()` on one end can arrive split across multiple `"data"` events on the other, or multiple writes can arrive coalesced into one event; without explicit framing (Step 3), a receiver can't reliably tell where one message ends and the next begins.

## Step 1: Pipes — formalizing what LAB-92 already did

```typescript
import { spawn } from "child_process"

function pipeExample(): void {
  const producer = spawn("node", ["-e", "console.log('line one'); console.log('line two')"])
  const consumer = spawn("node", ["-e", `
    process.stdin.on("data", (data) => {
      const lines = data.toString().trim().split("\\n")
      console.log("consumer received", lines.length, "lines:", lines)
    })
  `])

  producer.stdout.pipe(consumer.stdin) // the pipe: producer's stdout feeds directly into consumer's stdin
  consumer.stdout.on("data", (data) => console.log(data.toString().trim()))
}

pipeExample()
```

`.pipe(...)` is Node's built-in stream-connecting method — it takes every chunk of data the `producer`'s stdout emits and writes it directly to the `consumer`'s stdin, with no manual `on("data", ...)`/`.write(...)` wiring needed. This is the exact mechanism a real shell's `command1 | command2` implements: connect one process's stdout stream directly to another's stdin stream, and let the OS move the bytes.

### SAVE AND TRY

Run `pipeExample()` and confirm the consumer reports receiving 2 lines — then swap `producer.stdout.pipe(consumer.stdin)` for a version with no pipe at all and confirm the consumer hangs waiting for input that never arrives, exactly like LAB-92 Step 1's missing `stdin.write()` case.

## Step 2: `fork()` — structured message passing between parent and child

```typescript
// worker.js (the child)
process.on("message", (msg: { type: string; payload: number }) => {
  if (msg.type === "double") {
    process.send!({ type: "result", value: msg.payload * 2 })
  }
})
```

```typescript
// parent.ts
import { fork } from "child_process"

function forkExample(): void {
  const child = fork("./worker.js")
  child.send({ type: "double", payload: 21 })
  child.on("message", (msg: any) => {
    console.log("Parent received:", msg) // { type: "result", value: 42 }
    child.kill()
  })
}

forkExample()
```

`fork()` is a specialization of `spawn()` built specifically for spawning other Node.js scripts, and it opens an automatic, structured IPC channel alongside the normal stdio streams — `child.send(obj)` and `process.send(obj)` transparently serialize `obj` (via `JSON.stringify` under the hood) and deliver it as a whole object to the other side's `"message"` event, with no manual parsing needed at all. Compare this to Step 1's pipe: there, the consumer had to `.split("\n")` raw text itself; here, `msg` arrives already as a real JavaScript object.

### SAVE AND TRY

Run `forkExample()` and confirm `Parent received: { type: "result", value: 42 }` — then change `worker.js` to `process.send!({ type: "result", value: msg.payload * 2, timestamp: new Date() })` and observe that `timestamp` arrives as a *string*, not a `Date` object, in the parent — a direct, hands-on demonstration that `fork()`'s "automatic" serialization is still JSON underneath, with all of JSON's usual limitations (no native `Date`, no functions, no `undefined`).

## Step 3: Unix domain sockets — IPC between unrelated processes

```typescript
// server.ts -- has no parent/child relationship with the client at all
import net from "net"
import fs from "fs"

const SOCKET_PATH = "/tmp/lab93.sock"
if (fs.existsSync(SOCKET_PATH)) fs.unlinkSync(SOCKET_PATH) // clean up a stale socket file from a previous run

const server = net.createServer((connection) => {
  connection.on("data", (data) => {
    const message = data.toString()
    connection.write(`echo: ${message}`)
  })
})
server.listen(SOCKET_PATH, () => console.log(`Listening on ${SOCKET_PATH}`))
```

```typescript
// client.ts -- run as a completely separate process, launched independently
import net from "net"

const client = net.createConnection("/tmp/lab93.sock", () => {
  client.write("hello from an unrelated process")
})
client.on("data", (data) => {
  console.log("Client received:", data.toString())
  client.end()
})
```

The socket is identified by a **file path** (`/tmp/lab93.sock`) on the filesystem, not by a parent-child process relationship — any process on the machine that knows this path, launched any way at all (not spawned by the server, not related to it in any process tree), can connect. This is the structural difference the concept section named: `fork()`'s messaging only works between direct relatives; a Unix socket's only requirement is "knows the path."

### SAVE AND TRY

Start `server.ts` in one terminal, then run `client.ts` in a *completely separate* terminal (launched with a plain `node client.ts`, not spawned by the server). Confirm the client receives `Client received: echo: hello from an unrelated process` — proving two processes with zero parent-child relationship, started independently, successfully communicated purely through the shared socket file path.

## Step 4: Message framing — why raw byte streams need explicit boundaries

```typescript
// A naive receiver that assumes one "data" event == one complete message (WRONG in general):
connection.on("data", (data) => {
  const message = JSON.parse(data.toString()) // breaks if a message arrives split across two "data" events
})

// A correct receiver using length-prefixed framing:
let buffer = Buffer.alloc(0)

connection.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk])

  while (buffer.length >= 4) {
    const messageLength = buffer.readUInt32BE(0)
    if (buffer.length < 4 + messageLength) break // full message hasn't arrived yet, wait for more data

    const messageBytes = buffer.subarray(4, 4 + messageLength)
    const message = JSON.parse(messageBytes.toString())
    console.log("Framed message received:", message)

    buffer = buffer.subarray(4 + messageLength) // remove the consumed message, keep any leftover bytes
  }
})

function sendFramed(connection: net.Socket, obj: unknown): void {
  const payload = Buffer.from(JSON.stringify(obj))
  const header = Buffer.alloc(4)
  header.writeUInt32BE(payload.length, 0)
  connection.write(Buffer.concat([header, payload]))
}
```

This is a length-prefixed framing protocol: every message is preceded by 4 bytes encoding its length, so the receiver always knows exactly how many more bytes to accumulate before `JSON.parse`-ing anything. The `while (buffer.length >= 4)` loop handles both directions of the concept section's warning: it correctly waits for more data if a message arrived incomplete, *and* correctly processes multiple complete messages if several arrived coalesced into one `"data"` event — neither case is safe to assume away.

### SAVE AND TRY

Modify the client from Step 3 to send two messages back-to-back with no delay (`client.write(...)` called twice immediately) using `sendFramed` on both ends. Without framing, these two writes might arrive as one `"data"` event containing both JSON payloads concatenated, which `JSON.parse` would fail on outright — with framing, the `while` loop correctly extracts both messages from that single event.

## 🎯 Challenge

Build a tiny request-response protocol on top of Step 3's Unix socket: the client sends a framed `{ type: "add", a: number, b: number }` message and the server responds with a framed `{ result: number }` message — using `sendFramed`/the length-prefixed receiver from Step 4 on both sides.

<details>
<summary>Solution</summary>

```typescript
// server.ts
server_connection.on("data", (chunk) => {
  // ...same buffering loop from Step 4, then, inside the "full message parsed" branch:
  if (message.type === "add") {
    sendFramed(connection, { result: message.a + message.b })
  }
})

// client.ts
client.on("connect", () => {
  sendFramed(client, { type: "add", a: 7, b: 35 })
})
// ...same buffering loop from Step 4, then:
console.log("Server computed:", message.result) // 42
```

Reusing the exact same framing helpers (`sendFramed`, the length-prefixed buffering loop) from Step 4 on both the request and the response is the point: once a reliable message-boundary protocol exists, building an actual request-response exchange on top of it is just deciding what the message *contents* mean — the framing problem itself doesn't need solving twice.

</details>

## Mental Model

| Concept | Pipe (Step 1) | `fork()` messaging (Step 2) | Unix socket (Step 3) |
|---|---|---|---|
| Relationship required | Direct parent-child | Direct parent-child | None — any process knowing the path |
| Data shape | Raw bytes/text | Whole JS objects (JSON-serialized) | Raw bytes — framing is your responsibility |
| Typical use | Chaining commands (shell pipes) | Worker task dispatch | Client-server between unrelated processes |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why can `fork()`'s messaging only connect direct parent-child processes, unlike a Unix socket? | |
| 2 | What does a length-prefixed header solve that raw `JSON.parse(data.toString())` on every `"data"` event doesn't? | |
| 3 | Why is `producer.stdout.pipe(consumer.stdin)` considered IPC, even without any JSON or structured messages involved? | |

## Quick Check Answers

1. `stdout`/`stdin` piping moves raw bytes from one process to another, which is exactly what IPC means — coordinating separate, isolated processes by moving data between them — even though the bytes carry no built-in structure or "this is a message" framing.
2. A pipe is inherently one-directional and only exists between a process and the direct child it spawned; a Unix socket is identified by a filesystem path and bidirectional, so any two processes that both know that path can connect and exchange data in either direction, regardless of how either process was started.
3. Because sockets and pipes are streams, not message queues — the underlying transport can split one logical write into multiple delivery events, or coalesce multiple writes into one event, so a receiver that assumes "one event equals one complete message" will eventually either parse a truncated message or fail to parse two messages concatenated together.

*Next: [LAB-94 — Synchronization](LAB-94-synchronization.md)*
