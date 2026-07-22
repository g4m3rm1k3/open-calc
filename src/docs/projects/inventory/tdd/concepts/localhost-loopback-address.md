# Concept: `127.0.0.1` / Localhost (Loopback Address)

**What you'll understand by the end:** why a server bound to `127.0.0.1` is reachable from the same machine and nowhere else, with zero network configuration.

**Prerequisites:** `client-server-architecture.md`.

## Setup

Python 3, standard library only (`http.server`).

## The Problem

During development, a server needs to be reachable for testing without being reachable from the rest of the internet, or even the rest of a local network — exposing an unfinished, unsecured server more broadly than that is a real risk, not a hypothetical one.

## The Isolated Example

```python
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"reachable")

HTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
```

Then, from the same machine:
```
curl http://127.0.0.1:8000/
```

**Real output:**
```
reachable
```

**What this proves:** this worked immediately, with no firewall rule, no router configuration, and no public IP involved — because the request never actually left the machine. The operating system recognizes `127.0.0.1` as a special case and routes it straight back to a program listening on this same machine, entirely in software, before it would ever reach a real network interface.

## Mechanical Walkthrough

- `HTTPServer(("127.0.0.1", 8000), Handler)` binds the server specifically to the loopback address — not `0.0.0.0` (which would mean "any interface, including the real network one," reachable from other machines on the same network).
- Every networked computer has a virtual loopback network interface, distinct from its real Wi-Fi/Ethernet interface, permanently assigned `127.0.0.1` (the whole `127.0.0.0/8` block is technically reserved for this).
- Traffic to `127.0.0.1` is handled entirely inside the operating system's own networking stack — it never touches any physical wire or radio.

## CS Lens

This is a reserved address performing **address-based routing scope control** — the destination address itself, not a separate permission system, determines whether traffic can possibly leave the machine.

Also recognized in: `::1` (IPv6's equivalent loopback address), and Unix domain sockets (an even more restricted same-machine-only communication channel that bypasses the network stack's IP layer entirely).

## SE Lens

Binding to `127.0.0.1` during development, rather than `0.0.0.0` or a real network IP, is a deliberate default: it guarantees nothing outside the machine can reach the server, independent of any firewall or application-level authentication. This matters directly for anything running with elevated risk during development — a debug console (see `dev-server-debug-mode-risk.md`) is only as safe as "unreachable from outside" actually makes it.

## Connection

Builds on `client-server-architecture.md` and `network-port.md` — the full address a client connects to is (loopback address, port) together.

## Try It Yourself

1. Change the bind address from `"127.0.0.1"` to `"0.0.0.0"`, restart the server, and try reaching it from another device on the same network using the machine's real local IP address (find it with `ipconfig`/`ifconfig`). Confirm it's now reachable from outside — the exact exposure `127.0.0.1` was preventing.
2. Try `curl http://localhost:8000/` instead of the literal IP. Confirm it resolves to the same place — `localhost` is a hostname that (by convention, configured in every OS's own name resolution) maps to `127.0.0.1`.
3. Start two servers, one bound to `127.0.0.1` and one to `0.0.0.0`, on different ports. From another machine on the same network, confirm only the second one is reachable.
