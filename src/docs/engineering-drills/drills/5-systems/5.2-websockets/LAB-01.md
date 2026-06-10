# Drill 5.2 — WebSockets: The Upgrade Handshake and Frame Protocol

**Standalone drill. Prerequisite: TCP sockets (Drill 5.1 or basic socket knowledge).**
**Time estimate:** 75–90 minutes
**Environment:** Python 3.8+ — standard library only (`socket`, `hashlib`, `base64`, `struct`, `threading`)
**What you will build:** A WebSocket server and client using raw TCP sockets — HTTP upgrade handshake by hand, then frame encoding/decoding by hand. A multi-client chat room where messages broadcast in real time.
**What you will understand:** What a WebSocket actually is at the wire level, why the upgrade handshake uses a nonce, how frames differ from HTTP, and why this protocol exists instead of polling.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. HTTP is request/response. After the server sends a response, can the server send another message without the client asking first? What does this mean for a chat application built on plain HTTP?

2. The WebSocket upgrade request includes a header `Sec-WebSocket-Key: <base64 value>`. The server responds with a derived key. What is this for — why can't the client just say "upgrade me please"?

3. WebSocket frames have a masking bit. Client-to-server frames MUST be masked; server-to-client frames MUST NOT be masked. Why does the protocol specify this asymmetry?

4. How is WebSocket different from Server-Sent Events (SSE)? Name one use case where each is the better choice.

*(Answers at the bottom.)*

---

## The Concept: WebSocket Protocol

### Concept: What WebSocket Actually Is

**What it is:**
WebSocket is a protocol that starts as HTTP and then upgrades to a persistent, full-duplex TCP connection. After the upgrade, both sides can send frames at any time without the request/response constraint of HTTP.

**The problem it solves:**
HTTP is inherently request/response. The client asks, the server answers, the exchange is over. If the server has new data (a chat message, a stock price update, a game event), it must wait for the client to ask again. The workarounds — short polling (ask every second), long polling (hold the request open until data arrives) — are resource-wasting hacks. Long polling requires a thread or connection per waiting client. Short polling drowns the server in empty responses.

**The mechanism — three phases:**

Phase 1: HTTP Upgrade (one-time handshake)
```
Client → Server (HTTP GET):
  GET /chat HTTP/1.1
  Host: localhost:8765
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
  Sec-WebSocket-Version: 13

Server → Client (HTTP 101):
  HTTP/1.1 101 Switching Protocols
  Upgrade: websocket
  Connection: Upgrade
  Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```
After the 101 response, the HTTP protocol ends. The same TCP connection is now a WebSocket connection.

Phase 2: Frame exchange
Both sides exchange binary frames. A frame is not text — it is a binary structure with a header and a payload. The header encodes: FIN bit (is this the last fragment?), opcode (text, binary, ping, pong, close), mask bit, and payload length (7 bits, or 7+16, or 7+64 for large payloads).

Phase 3: Close handshake
Either side sends a Close frame. The other side echoes a Close frame. Then both close the TCP connection.

**The Sec-WebSocket-Key mechanism:**
The client sends a random 16-byte value (base64-encoded). The server appends the magic string `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` (a fixed GUID from the RFC), hashes with SHA-1, base64-encodes, and returns it as `Sec-WebSocket-Accept`. This proves the server is a real WebSocket server — not an HTTP cache or proxy that accidentally returned a cached "101" response. It is not encryption; it is identity verification.

**Frame structure (simplified):**
```
Byte 0:  FIN(1) RSV(3) OPCODE(4)
Byte 1:  MASK(1) PAYLOAD_LEN(7)
Bytes 2-9: Extended payload length (if PAYLOAD_LEN == 126 or 127)
Bytes N-N+3: Masking key (if MASK == 1)
Bytes N+4...: Payload (XOR'd with masking key if masked)
```

Opcodes:
- `0x1` = text frame
- `0x2` = binary frame
- `0x8` = close
- `0x9` = ping
- `0xA` = pong

**Masking:**
Client-to-server frames must be masked. The client generates a random 4-byte key and XORs each payload byte: `payload[i] ^= mask[i % 4]`. The server unmasks using the same operation (XOR is its own inverse). Server-to-client frames must NOT be masked. This asymmetry prevents cache poisoning attacks on HTTP proxies that sit between client and server — a proxy that sees a masked frame cannot interpret it as an HTTP response.

**Constraints:**
- WebSocket requires HTTP/1.1 (not HTTP/2 or HTTP/3, which have their own stream multiplexing)
- The close handshake must be completed before the TCP connection closes — a bare TCP close is an error
- Ping/pong is built into the protocol for keep-alive — you don't need to implement application-level heartbeats
- Maximum frame payload: 2^63 bytes (extended 64-bit length field)

**Tradeoffs:**
- WebSocket vs SSE: SSE is server-to-client only, uses plain HTTP, text-only. WebSocket is bidirectional, binary-capable, requires the upgrade. Use SSE for dashboards, news feeds (one direction). Use WebSocket for chat, games, collaborative editing (two directions).
- WebSocket vs HTTP polling: WebSocket has lower latency and no per-message HTTP overhead. Polling is simpler and works through any HTTP proxy.

**Failure modes:**
- Forgetting to unmask client frames: you get garbage payload bytes (XOR with zero = identity, but XOR with a non-zero mask = corrupted)
- Not completing the close handshake: the other side sees a TCP RST and may log errors
- Not handling fragmented frames: large messages can arrive as multiple frames (FIN=0) followed by a final fragment (FIN=1) — you must reassemble
- Forgetting the magic GUID in the accept key: client rejects the handshake with a "wrong Sec-WebSocket-Accept" error

**Operational reality:**
In production, you use a library (`websockets`, `fastapi` with WebSocket support, Socket.IO). But every production issue — why does the connection drop after 60 seconds? why does my reverse nginx proxy close idle connections? why do large messages arrive in pieces? — requires understanding the frame protocol. This drill gives you that foundation.

**You will see this again in:**
FastAPI's `@app.websocket()` decorator, Socket.IO, real-time game servers, collaborative editors (Figma, Google Docs), financial trading UIs, live sports dashboards.

**Watch for:**
The masking/unmasking step. Client frames arriving at your server are masked — read the 4-byte mask key, then XOR every payload byte before interpreting the payload as text. Skip this and every client message looks like binary garbage.

---

## Step 1 — Implement the Upgrade Handshake

Create `ws_server.py`:

```python
import socket
import hashlib
import base64
import threading

MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def compute_accept_key(client_key: str) -> str:
    combined = client_key.strip() + MAGIC
    sha1 = hashlib.sha1(combined.encode()).digest()
    return base64.b64encode(sha1).decode()

def do_handshake(conn: socket.socket) -> bool:
    data = conn.recv(4096).decode("utf-8", errors="replace")
    
    if "Upgrade: websocket" not in data:
        conn.close()
        return False
    
    # Extract Sec-WebSocket-Key from headers
    key = None
    for line in data.split("\r\n"):
        if line.startswith("Sec-WebSocket-Key:"):
            key = line.split(":", 1)[1].strip()
            break
    
    if not key:
        conn.close()
        return False
    
    accept = compute_accept_key(key)
    
    response = (
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept}\r\n"
        "\r\n"
    )
    conn.sendall(response.encode())
    return True

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("localhost", 8765))
    server.listen(5)
    print("WebSocket server on ws://localhost:8765")
    
    while True:
        conn, addr = server.accept()
        print(f"TCP connection from {addr}")
        if do_handshake(conn):
            print(f"WebSocket handshake complete with {addr}")
            # For now, just close after handshake
            conn.close()
        else:
            print(f"Handshake failed for {addr}")

if __name__ == "__main__":
    main()
```

Create `ws_test_client.py` to verify the handshake:

```python
import socket
import hashlib
import base64
import os

def make_client_key() -> str:
    return base64.b64encode(os.urandom(16)).decode()

def verify_accept_key(client_key: str, accept: str) -> bool:
    magic = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    expected = base64.b64encode(
        hashlib.sha1((client_key.strip() + magic).encode()).digest()
    ).decode()
    return expected == accept

def main():
    client_key = make_client_key()
    
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("localhost", 8765))
    
    request = (
        "GET /chat HTTP/1.1\r\n"
        "Host: localhost:8765\r\n"
        "Upgrade: websocket\r\n"
        "Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {client_key}\r\n"
        "Sec-WebSocket-Version: 13\r\n"
        "\r\n"
    )
    s.sendall(request.encode())
    
    response = s.recv(4096).decode()
    print("Server response:")
    print(response)
    
    # Extract accept key
    accept = None
    for line in response.split("\r\n"):
        if line.startswith("Sec-WebSocket-Accept:"):
            accept = line.split(":", 1)[1].strip()
            break
    
    if accept and verify_accept_key(client_key, accept):
        print("Handshake verified. Server computed the accept key correctly.")
    else:
        print(f"Handshake FAILED. Accept key mismatch.")
    
    s.close()

if __name__ == "__main__":
    main()
```

### SAVE AND TRY

Terminal 1:
```
python ws_server.py
```

Terminal 2:
```
python ws_test_client.py
```

Expected server output:
```
WebSocket server on ws://localhost:8765
TCP connection from ('127.0.0.1', <port>)
WebSocket handshake complete with ('127.0.0.1', <port>)
```

Expected client output:
```
Server response:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: <some base64 string>

Handshake verified. Server computed the accept key correctly.
```

**Change something:** Remove the magic GUID from `compute_accept_key` (just hash the key alone). The client will print `Handshake FAILED`. This is exactly what a real WebSocket client does when it connects to a non-WebSocket server.

---

## Step 2 — Frame Encoding and Decoding

The handshake is HTTP. After the 101, the protocol switches to binary frames. Add these functions to `ws_server.py`:

```python
import struct

def decode_frame(conn: socket.socket) -> tuple[int, bytes] | None:
    """
    Read one WebSocket frame. Returns (opcode, payload) or None on error/close.
    Client frames are always masked — we must unmask before returning payload.
    """
    # Read first 2 bytes: FIN+opcode, MASK+length
    header = conn.recv(2)
    if len(header) < 2:
        return None
    
    # Byte 0: FIN bit (0x80) and opcode (0x0F mask)
    opcode = header[0] & 0x0F
    
    # Byte 1: mask bit (0x80) and payload length (0x7F mask)
    masked = bool(header[1] & 0x80)
    payload_len = header[1] & 0x7F
    
    # Extended payload length
    if payload_len == 126:
        # Next 2 bytes are the real length (big-endian uint16)
        payload_len = struct.unpack(">H", conn.recv(2))[0]
    elif payload_len == 127:
        # Next 8 bytes are the real length (big-endian uint64)
        payload_len = struct.unpack(">Q", conn.recv(8))[0]
    
    # Read masking key (4 bytes) if masked
    mask_key = conn.recv(4) if masked else b""
    
    # Read payload
    payload = conn.recv(payload_len)
    
    # Unmask: XOR each byte with mask_key[i % 4]
    if masked:
        payload = bytes(b ^ mask_key[i % 4] for i, b in enumerate(payload))
    
    return opcode, payload


def encode_frame(opcode: int, payload: bytes) -> bytes:
    """
    Build one WebSocket frame. Server-to-client frames are NOT masked.
    """
    length = len(payload)
    
    # Byte 0: FIN=1 (0x80) + opcode
    header = bytes([0x80 | opcode])
    
    # Byte 1 onward: payload length (no mask bit — server doesn't mask)
    if length <= 125:
        header += bytes([length])
    elif length <= 65535:
        header += bytes([126]) + struct.pack(">H", length)
    else:
        header += bytes([127]) + struct.pack(">Q", length)
    
    return header + payload
```

Update `main()` to echo messages back:

```python
def handle_client(conn: socket.socket, addr):
    if not do_handshake(conn):
        return
    print(f"Client {addr} connected")
    
    try:
        while True:
            result = decode_frame(conn)
            if result is None:
                break
            
            opcode, payload = result
            
            if opcode == 0x8:  # Close frame
                print(f"Client {addr} sent close")
                # Echo the close frame back
                conn.sendall(encode_frame(0x8, payload))
                break
            elif opcode == 0x9:  # Ping
                conn.sendall(encode_frame(0xA, payload))  # Pong
            elif opcode == 0x1:  # Text frame
                message = payload.decode("utf-8")
                print(f"[{addr}] {message}")
                # Echo back
                conn.sendall(encode_frame(0x1, f"Echo: {message}".encode()))
    except Exception as e:
        print(f"Client {addr} error: {e}")
    finally:
        conn.close()
        print(f"Client {addr} disconnected")


def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("localhost", 8765))
    server.listen(5)
    print("WebSocket server on ws://localhost:8765")
    
    while True:
        conn, addr = server.accept()
        t = threading.Thread(target=handle_client, args=(conn, addr), daemon=True)
        t.start()
```

Update `ws_test_client.py` to send and receive frames:

```python
import socket, hashlib, base64, os, struct

MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def make_client_key():
    return base64.b64encode(os.urandom(16)).decode()

def encode_client_frame(opcode: int, payload: bytes) -> bytes:
    """Client frames MUST be masked."""
    mask_key = os.urandom(4)
    masked_payload = bytes(b ^ mask_key[i % 4] for i, b in enumerate(payload))
    length = len(payload)
    
    header = bytes([0x80 | opcode])
    if length <= 125:
        header += bytes([0x80 | length])  # mask bit set
    elif length <= 65535:
        header += bytes([0x80 | 126]) + struct.pack(">H", length)
    else:
        header += bytes([0x80 | 127]) + struct.pack(">Q", length)
    
    return header + mask_key + masked_payload

def decode_server_frame(s: socket.socket) -> tuple[int, bytes] | None:
    """Server frames are NOT masked."""
    header = s.recv(2)
    if len(header) < 2:
        return None
    opcode = header[0] & 0x0F
    payload_len = header[1] & 0x7F
    if payload_len == 126:
        payload_len = struct.unpack(">H", s.recv(2))[0]
    elif payload_len == 127:
        payload_len = struct.unpack(">Q", s.recv(8))[0]
    payload = s.recv(payload_len)
    return opcode, payload

def main():
    client_key = make_client_key()
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("localhost", 8765))
    
    request = (
        "GET /chat HTTP/1.1\r\nHost: localhost:8765\r\n"
        "Upgrade: websocket\r\nConnection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {client_key}\r\n"
        "Sec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(request.encode())
    s.recv(4096)  # consume 101 response
    print("Connected. Sending messages...")
    
    messages = ["Hello, WebSocket!", "This is frame 2", "Goodbye"]
    for msg in messages:
        s.sendall(encode_client_frame(0x1, msg.encode()))
        result = decode_server_frame(s)
        if result:
            opcode, payload = result
            print(f"  Server: {payload.decode()}")
    
    # Send close frame
    s.sendall(encode_client_frame(0x8, b""))
    s.close()
    print("Done.")

if __name__ == "__main__":
    main()
```

### SAVE AND TRY

Restart the server, run the client:

```
python ws_server.py
```
```
python ws_test_client.py
```

Expected client output:
```
Connected. Sending messages...
  Server: Echo: Hello, WebSocket!
  Server: Echo: This is frame 2
  Server: Echo: Goodbye
Done.
```

Expected server output:
```
WebSocket server on ws://localhost:8765
Client ('127.0.0.1', <port>) connected
[('127.0.0.1', <port>)] Hello, WebSocket!
[('127.0.0.1', <port>)] This is frame 2
[('127.0.0.1', <port>)] Goodbye
Client ('127.0.0.1', <port>) sent close
Client ('127.0.0.1', <port>) disconnected
```

**Change something:** In `decode_frame`, comment out the unmasking line. Send a message from the client. The server will receive garbled bytes and print garbage or crash with a UnicodeDecodeError. This is the masking failure mode in action.

---

## Step 3 — Multi-Client Chat Room

Real value of WebSocket: the server can push to all connected clients simultaneously. Add a broadcast-capable chat room:

```python
import socket
import hashlib
import base64
import threading
import struct
import os

MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

# Shared state: all connected clients
clients: list[socket.socket] = []
clients_lock = threading.Lock()


def compute_accept_key(client_key: str) -> str:
    combined = client_key.strip() + MAGIC
    sha1 = hashlib.sha1(combined.encode()).digest()
    return base64.b64encode(sha1).decode()


def do_handshake(conn: socket.socket) -> bool:
    data = conn.recv(4096).decode("utf-8", errors="replace")
    if "Upgrade: websocket" not in data:
        conn.close()
        return False
    key = None
    for line in data.split("\r\n"):
        if line.startswith("Sec-WebSocket-Key:"):
            key = line.split(":", 1)[1].strip()
            break
    if not key:
        conn.close()
        return False
    accept = compute_accept_key(key)
    response = (
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\nConnection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept}\r\n\r\n"
    )
    conn.sendall(response.encode())
    return True


def decode_frame(conn: socket.socket) -> tuple[int, bytes] | None:
    header = conn.recv(2)
    if len(header) < 2:
        return None
    opcode = header[0] & 0x0F
    masked = bool(header[1] & 0x80)
    payload_len = header[1] & 0x7F
    if payload_len == 126:
        payload_len = struct.unpack(">H", conn.recv(2))[0]
    elif payload_len == 127:
        payload_len = struct.unpack(">Q", conn.recv(8))[0]
    mask_key = conn.recv(4) if masked else b""
    payload = conn.recv(payload_len)
    if masked:
        payload = bytes(b ^ mask_key[i % 4] for i, b in enumerate(payload))
    return opcode, payload


def encode_frame(opcode: int, payload: bytes) -> bytes:
    length = len(payload)
    header = bytes([0x80 | opcode])
    if length <= 125:
        header += bytes([length])
    elif length <= 65535:
        header += bytes([126]) + struct.pack(">H", length)
    else:
        header += bytes([127]) + struct.pack(">Q", length)
    return header + payload


def broadcast(message: str, exclude: socket.socket = None):
    frame = encode_frame(0x1, message.encode())
    with clients_lock:
        dead = []
        for c in clients:
            if c is exclude:
                continue
            try:
                c.sendall(frame)
            except Exception:
                dead.append(c)
        for c in dead:
            clients.remove(c)


def handle_client(conn: socket.socket, addr):
    if not do_handshake(conn):
        return
    
    name = f"User-{addr[1]}"
    with clients_lock:
        clients.append(conn)
    
    print(f"{name} joined. Total clients: {len(clients)}")
    broadcast(f"*** {name} joined the room ***", exclude=conn)
    
    try:
        while True:
            result = decode_frame(conn)
            if result is None:
                break
            opcode, payload = result
            if opcode == 0x8:
                conn.sendall(encode_frame(0x8, payload))
                break
            elif opcode == 0x9:
                conn.sendall(encode_frame(0xA, payload))
            elif opcode == 0x1:
                message = payload.decode("utf-8")
                print(f"[{name}] {message}")
                broadcast(f"{name}: {message}", exclude=conn)
    except Exception as e:
        print(f"{name} error: {e}")
    finally:
        with clients_lock:
            if conn in clients:
                clients.remove(conn)
        conn.close()
        broadcast(f"*** {name} left the room ***")
        print(f"{name} left. Total clients: {len(clients)}")


def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("localhost", 8765))
    server.listen(10)
    print("Chat server on ws://localhost:8765")
    print("Connect multiple clients to see broadcast in action")
    
    while True:
        conn, addr = server.accept()
        t = threading.Thread(target=handle_client, args=(conn, addr), daemon=True)
        t.start()


if __name__ == "__main__":
    main()
```

Create `chat_client.py` — an interactive client:

```python
import socket, hashlib, base64, os, struct, threading, sys

MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

def make_key():
    return base64.b64encode(os.urandom(16)).decode()

def encode_frame(opcode, payload):
    mask_key = os.urandom(4)
    masked = bytes(b ^ mask_key[i % 4] for i, b in enumerate(payload))
    ln = len(payload)
    hdr = bytes([0x80 | opcode])
    if ln <= 125:
        hdr += bytes([0x80 | ln])
    elif ln <= 65535:
        hdr += bytes([0x80 | 126]) + struct.pack(">H", ln)
    else:
        hdr += bytes([0x80 | 127]) + struct.pack(">Q", ln)
    return hdr + mask_key + masked

def decode_frame(s):
    hdr = s.recv(2)
    if len(hdr) < 2:
        return None, None
    opcode = hdr[0] & 0x0F
    ln = hdr[1] & 0x7F
    if ln == 126:
        ln = struct.unpack(">H", s.recv(2))[0]
    elif ln == 127:
        ln = struct.unpack(">Q", s.recv(8))[0]
    payload = s.recv(ln) if ln else b""
    return opcode, payload

def recv_loop(s):
    while True:
        opcode, payload = decode_frame(s)
        if opcode is None or opcode == 0x8:
            print("\n[disconnected]")
            break
        if opcode == 0x1:
            print(f"\r{payload.decode()}          ")

def main():
    key = make_key()
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("localhost", 8765))
    
    req = (
        "GET /chat HTTP/1.1\r\nHost: localhost:8765\r\n"
        "Upgrade: websocket\r\nConnection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(req.encode())
    s.recv(4096)
    print("Connected to chat. Type messages and press Enter. Ctrl+C to quit.")
    
    t = threading.Thread(target=recv_loop, args=(s,), daemon=True)
    t.start()
    
    try:
        while True:
            msg = input()
            s.sendall(encode_frame(0x1, msg.encode()))
    except KeyboardInterrupt:
        s.sendall(encode_frame(0x8, b""))
        s.close()

if __name__ == "__main__":
    main()
```

### SAVE AND TRY

Terminal 1:
```
python ws_server.py
```

Terminal 2:
```
python chat_client.py
```

Terminal 3 (open a second client):
```
python chat_client.py
```

Type a message in terminal 2. It appears in terminal 3 with the sender's name. Type in terminal 3. It appears in terminal 2. The server pushes to all connected clients without any of them polling.

Expected server output (with two clients connected):
```
Chat server on ws://localhost:8765
Connect multiple clients to see broadcast in action
User-<port1> joined. Total clients: 1
User-<port2> joined. Total clients: 2
[User-<port1>] hello from client 1
[User-<port2>] hi back from client 2
```

**Change something:** Open 5 client terminals simultaneously. Send a message from one. Watch it appear in all four others instantly. Then close one with Ctrl+C and observe the "left the room" announcement in the remaining clients.

---

## Challenge

**No solution provided. Requirements checklist only.**

Add a username negotiation protocol: the first message a client sends must be `JOIN:<username>`. The server rejects connections that send anything else first. After joining, messages broadcast as `<username>: <message>`.

**Requirements checklist:**

- [ ] First frame from client must start with `JOIN:` prefix — any other first message closes the connection with a text frame: `ERROR: First message must be JOIN:<username>`
- [ ] Username must be 2–20 characters (letters, numbers, underscores only) — invalid username closes with `ERROR: Invalid username`
- [ ] Duplicate usernames rejected: `ERROR: Username taken`
- [ ] After successful join, server broadcasts `*** <username> joined ***` to all other clients
- [ ] Each message from client is broadcast as `<username>: <message>` to all other clients (not the sender)
- [ ] Server tracks a `users: dict[socket.socket, str]` mapping connection to username
- [ ] `/who` command: server responds to the sender with `Users online: user1, user2, user3`
- [ ] Ping every 30 seconds: server sends a Ping frame to each client; clients that don't respond with Pong within 10 seconds are dropped

**Starter:**
```python
users: dict[socket.socket, str] = {}
users_lock = threading.Lock()

def handle_join(conn: socket.socket) -> str | None:
    """Read first frame, validate JOIN:<username>. Return username or None."""
    result = decode_frame(conn)
    if result is None:
        return None
    opcode, payload = result
    # TODO: validate JOIN: prefix
    # TODO: validate username format
    # TODO: check for duplicate username
    # TODO: register in users dict
```

**When you're done:**
- Open three clients, join as `alice`, `bob`, `charlie`
- `/who` from alice returns `Users online: alice, bob, charlie`
- Alice sending `hello` shows `alice: hello` to bob and charlie but not alice
- Opening a fourth client and sending `hello` immediately (no JOIN) closes that connection with an error message
- Trying to join as `alice` from a fifth client closes with `ERROR: Username taken`

**Stuck?** Ask AI: "In Python with raw sockets and threading, how do I implement a 30-second ping loop that sends WebSocket ping frames (opcode 0x9) to all connected clients and removes any clients that haven't responded with a pong within 10 seconds? I have a `clients` list and a `threading.Lock` to protect it."

---

## Quick Check Answers

**1. Can a plain HTTP server push to the client without a request?**
No. HTTP is strictly request/response. After the server sends a response, the exchange is complete — the server cannot initiate communication. For a chat application, this means the client must poll: "do you have new messages for me?" every N seconds. Short polling (every second) creates constant unnecessary requests. Long polling (hold the connection open until data arrives) is better but requires one server thread per waiting client and still involves HTTP overhead per message. WebSocket eliminates this: after the upgrade, either side can send a frame at any time.

**2. Why does the WebSocket handshake use a nonce key?**
The `Sec-WebSocket-Key` / `Sec-WebSocket-Accept` exchange proves that the server is a genuine WebSocket server, not an HTTP cache or reverse proxy that accidentally returned a stored `101 Switching Protocols` response. The magic GUID (`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`) is not a secret — it's in the RFC. Any server that knows the protocol can compute the correct accept key. Any server that doesn't know the protocol (like an HTTP cache) cannot. This is identity verification, not encryption.

**3. Why must client-to-server frames be masked, but not server-to-client?**
HTTP proxies sit between browsers and servers. If an attacker could get a browser to send a predictable unmasked binary stream, the proxy might interpret part of it as an HTTP response header — a "cache poisoning" attack that makes the proxy store malicious content. Masking with a random 4-byte key prevents this: the binary payload is XOR'd with a random value, so it cannot be crafted to look like HTTP. Servers are not vulnerable to this attack (they don't route through HTTP caches the same way), so server frames are left unmasked. The masking provides no confidentiality — the mask key is sent in plaintext alongside the payload.

**4. WebSocket vs SSE:**
SSE (Server-Sent Events) uses a plain HTTP connection that stays open. The server sends text events; the client cannot send messages back (it uses separate HTTP requests for that). SSE is simpler — it works through HTTP/2, supports automatic reconnect, and has a built-in event ID mechanism. WebSocket is full-duplex binary — both sides send at any time with minimal framing overhead.

Use SSE for: live dashboards, news feeds, notifications — server pushes, client mostly reads. Use WebSocket for: chat, multiplayer games, collaborative editors, trading terminals — both sides send frequently and latency matters.
