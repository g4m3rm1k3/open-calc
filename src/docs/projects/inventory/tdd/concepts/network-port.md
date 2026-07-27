# Concept: Network Port

**What you'll understand by the end:** why a server needs a port number, not just an IP address, and what happens when two programs try to claim the same one.

**Prerequisites:** none.

## Setup

Python 3, standard library only (`socketserver`, `http.server`). Two terminals.

## The Problem

One machine can run many networked programs at once — a web server, a database, a chat client — all reachable at the same IP address. Something has to identify *which* program on that machine a given piece of incoming traffic is meant for.

## The Isolated Example

Terminal 1:
```python
import socketserver
import http.server

with socketserver.TCPServer(("127.0.0.1", 9001), http.server.SimpleHTTPRequestHandler) as server:
    print("bound port 9001 successfully")
    server.serve_forever()
```

Terminal 2, while the first is still running, same code, same port:
```python
import socketserver
import http.server

with socketserver.TCPServer(("127.0.0.1", 9001), http.server.SimpleHTTPRequestHandler) as server:
    print("this should fail")
```

**Real output, second attempt:**
```
OSError: [Errno 48] Address already in use
```

**What this proves:** a second program cannot bind the exact same (address, port) pair while the first still holds it — a port can only be claimed by one listening program at a time. This is exactly why two servers both trying to use the same default port on one machine collide, and why development tools often let a port be configured.

## Mechanical Walkthrough

- `("127.0.0.1", 9001)` is an (address, port) pair — the address identifies *which machine* (or, via loopback, "this machine"), the port identifies *which program on it*.
- `TCPServer(...)` performs the actual "claim this port" operation (technically called *binding*) when it's constructed — that's the step that fails the second time.
- Port numbers range 0–65535. Ports below 1024 are reserved and typically require elevated system privileges to bind (port 80 for HTTP, 443 for HTTPS) — a long-standing security convention so an unprivileged program can't impersonate a well-known system service.

## Execution Trace

Two real, sequential attempts to construct a `TCPServer` on the same
`(address, port)` pair:

```
Terminal 1: TCPServer(("127.0.0.1", 9001), ...) constructed
  → the OS successfully binds port 9001 to this process
  → prints "bound port 9001 successfully"
  → server.serve_forever() — this process now holds the port indefinitely

Terminal 2 (while Terminal 1 is still running): TCPServer(("127.0.0.1", 9001), ...) constructed
  → the OS checks: is (127.0.0.1, 9001) already bound? → yes, by Terminal 1's process
  → the constructor itself raises: OSError: [Errno 48] Address already in use
  → "this should fail" is never reached — the exception happens during
    construction, before the with-block's own body even starts
```

Both attempts run the identical code — the only real difference is
*when* each one runs relative to the other; the second one fails purely
because the first one still holds the port at the moment it tries.

## CS Lens

A port is part of a **multiplexing** scheme — letting one physical network connection point (one IP address) serve many independent logical channels (many programs), distinguished by a number carried in every packet.

Also recognized in: Docker's `-p` port-mapping flag (solving this exact "many programs, one machine" problem across container boundaries), and any addressing scheme that layers a finer-grained identifier on top of a coarser one (a building's street address plus an apartment number is the same shape).

## SE Lens

Development tools default to high, unreserved ports (5000, 5173, 8080, and similar) specifically to avoid needing elevated privileges just to run something locally — a real, practical convenience tradeoff against the "well-known ports" convention real production services still follow (a public web server binds 80/443 specifically so clients don't need to be told a nonstandard port).

## Connection

Builds on `localhost-loopback-address.md` — the two together (address, port) form the complete thing a client actually connects to.

## Try It Yourself

1. Change the second terminal's port to `9002` instead of `9001` and confirm both servers can run simultaneously with no conflict.
2. Stop the first server (Ctrl+C) and immediately retry binding `9001` again. Does it succeed right away, or does it sometimes still report "address already in use" for a few seconds? (This is a real, common operating-system behavior worth encountering — look up `SO_REUSEADDR` if you want to understand why.)
3. Try binding port `80` directly (not through a framework) on your machine, with no elevated privileges. Read the real permission error, and confirm binding a high port (like `8080`) from the same unprivileged terminal works fine.
