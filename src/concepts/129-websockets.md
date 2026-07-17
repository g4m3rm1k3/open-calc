---
concept: 129-websockets
name: WebSockets
---

## Definition

A WebSocket is a persistent, two-way connection between client and server
that stays open after the initial handshake, letting either side send
messages to the other at any time — unlike HTTP's request-response model,
where the server can only ever respond to a request the client already
made.

## Problem

Some applications need the server to push new data to the client the
moment it's available — a chat message, a live price update. With plain
HTTP, the client would have to repeatedly ask "anything new?" (polling),
wasting requests when there's nothing new and adding delay before the
client asks again. A WebSocket keeps one connection open so the server can
push data the instant it exists.

## Execution

Client sends an HTTP request with an "Upgrade: websocket" header
↓
Server agrees, and the SAME connection converts from HTTP into a
WebSocket — no new connection needed
↓
Now either side can send a message at any time, without waiting for the
other to ask first
↓
Client sends 'hello' — server receives it immediately and can reply
whenever it wants, without needing a new request from the client first
↓
Later, server pushes 'new data available!' entirely on its own initiative
— something plain HTTP request-response could never do

## Computer Science

This is a fundamentally different communication model from HTTP's
request-response — WebSockets are full-duplex (both sides can send at any
time, independently), while HTTP is strictly half-duplex request-then-
response. The "Upgrade" handshake is what transitions a connection from
one model to the other on the same underlying TCP connection.

Tags: Full-duplex, Persistent connection, Protocol upgrade, Push notifications

## Software Engineering

WebSockets are the standard choice for chat applications, live
collaborative editing, real-time dashboards, and multiplayer games —
anywhere server-initiated pushes matter and the overhead or latency of
repeated polling would be unacceptable.

Tags: Real-time applications, Chat systems, Live updates, Polling alternative

## Common Mistakes

- Using WebSockets for simple request-response interactions where nothing is ever pushed by the server — plain HTTP is simpler and sufficient when the client always initiates every exchange.
- Forgetting that a WebSocket connection can drop unexpectedly and needs explicit reconnection logic — unlike a single HTTP request, which either succeeds or fails once, a long-lived connection needs ongoing handling.

## Exercises

- Compare how a live "someone is typing..." indicator in a chat app would be implemented with polling versus with WebSockets — which requires far more wasted requests?
- Look up what happens to a WebSocket connection if the underlying network briefly drops — does it recover automatically, or does application code need to handle reconnection?

## javascript

```javascript
// Simulating a WebSocket-style bidirectional exchange (an in-memory event
// emitter standing in for a real socket) to demonstrate that EITHER side
// can send a message at any time, unlike HTTP's request-then-response only.
class FakeSocket {
  #listeners = []
  onMessage(fn) { this.#listeners.push(fn) }
  send(message) { this.#listeners.forEach(fn => fn(message)) }
}

const serverReceived = []
const clientReceived = []
const clientSocket = new FakeSocket()
const serverSocket = new FakeSocket()
clientSocket.onMessage(msg => serverReceived.push(msg))
serverSocket.onMessage(msg => clientReceived.push(msg))

clientSocket.send('hello')          // client-initiated message
serverSocket.send('pushed update')  // server-initiated message, with NO prior client request

console.log(serverReceived)   // [ 'hello' ]
console.log(clientReceived)   // [ 'pushed update' ] — server pushed this on its own, unprompted
```
Walkthrough: `serverSocket.send(...)` fires with no client request
triggering it — exactly the server-initiated push a plain HTTP
request-response cycle could never do, since HTTP only lets a server
reply to a request that already arrived.

## python

```python
class FakeSocket:
    def __init__(self):
        self._listeners = []

    def on_message(self, fn):
        self._listeners.append(fn)

    def send(self, message):
        for fn in self._listeners:
            fn(message)


client_received = []
server_received = []

client_socket = FakeSocket()
server_socket = FakeSocket()
client_socket.on_message(lambda msg: server_received.append(msg))
server_socket.on_message(lambda msg: client_received.append(msg))

client_socket.send('hello')            # client-initiated message
server_socket.send('pushed update')    # server-initiated message, with NO prior client request

print(server_received)   # ['hello']
print(client_received)   # ['pushed update'] -- server pushed this on its own, unprompted
```
Walkthrough: identical bidirectional-push mechanics as the JavaScript
version — `server_socket.send(...)` demonstrates the server speaking
first, entirely on its own initiative.
