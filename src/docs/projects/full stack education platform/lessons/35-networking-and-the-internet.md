# Lesson 35 — Networking and the Internet

## What You Will Build

Build a network diagnostics view in the Electron app: ping a server, trace the route,
test DNS resolution, and display the results. Implement connection quality detection
in the React Native app (show an "offline" banner when connectivity drops). These
features require understanding what happens between your app and the server.

---

## What You Need to Know First

- Lesson 11: HTTP, ports, TCP
- Lesson 29: Electron IPC, main process access to Node.js APIs

---

## The Lesson

### Step 1 — The Network Stack

Data from your React component to your PostgreSQL database passes through multiple layers.
Each layer adds headers, routes, and guarantees.

**The TCP/IP model (simplified to four layers):**

| Layer | Protocol | What it does |
|-------|----------|-------------|
| Application | HTTP, WebSocket, TLS | Your app's data: JSON, HTML, binary |
| Transport | TCP, UDP | Reliable delivery, ports, connections |
| Network (Internet) | IP | Addressing (IP addresses), routing between networks |
| Link | Ethernet, Wi-Fi | Physical transmission on the local network |

**IP addresses:**
Every device on a network has an IP address. IPv4 addresses are 32-bit numbers written
as four octets: `192.168.1.1`. There are ~4.3 billion IPv4 addresses — exhausted in 2011.
IPv6 uses 128-bit addresses (e.g., `2001:db8::1`), providing ~340 undecillion addresses.

**What happens when you fetch `https://api.codexapp.io/api/health`:**
1. DNS lookup: `api.codexapp.io` → `104.21.32.14` (the server's IP)
2. TCP connection: 3-way handshake with the server's port 443
3. TLS handshake: negotiate cipher, verify certificate, derive session keys
4. HTTP request: send the GET request over the encrypted TLS connection
5. HTTP response: receive the JSON response
6. Connection kept alive for subsequent requests (HTTP keep-alive)

**CS lens — layering and encapsulation:**
Each layer encapsulates the layer below. TCP does not know about HTTP; IP does not know
about TCP payloads. Each layer adds a header (metadata), processes its concern, and
passes to the next layer. Protocols are contracts between layers. This layering
principle is the same as React's component tree: each layer has defined inputs/outputs
and does not need to know how inner layers work.

### Step 2 — DNS

**DNS (Domain Name System):**
DNS is a distributed database that maps domain names to IP addresses. Without DNS,
you would type IP addresses in the browser.

**DNS resolution process:**
1. Check local cache (browser cache, OS cache)
2. Ask the **recursive resolver** (usually your router or ISP's DNS server, e.g., `1.1.1.1`)
3. Recursive resolver asks the **root nameserver** (there are 13 root nameservers globally)
4. Root nameserver returns the **TLD nameserver** for `.io` domains
5. TLD nameserver returns the **authoritative nameserver** for `codexapp.io`
6. Authoritative nameserver returns the A record: `104.21.32.14`
7. Result cached at each step with the TTL from the DNS record

**DNS record types:**
- `A` record: domain → IPv4 address
- `AAAA` record: domain → IPv6 address
- `CNAME` record: alias → another domain name
- `MX` record: email routing
- `TXT` record: verification strings (used by Google to verify domain ownership, SPF for email)

**Adding a DNS record for the app:**
In your domain registrar (Cloudflare, Namecheap), add:
```
Type: A
Name: api
Value: 104.21.32.14 (your VPS IP)
TTL: 300
```

This creates `api.codexapp.io` pointing to your VPS.

### Step 3 — Electron Network Diagnostics

```typescript
// main/ipc/network.ts
import { ipcMain } from 'electron'
import { exec } from 'child_process'
import dns from 'dns/promises'
import net from 'net'

export function registerNetworkHandlers() {
  ipcMain.handle('network:ping', async (_, host: string) => {
    if (typeof host !== 'string' || !/^[a-zA-Z0-9.-]+$/.test(host)) {
      throw new Error('Invalid host')
    }

    return new Promise<{ alive: boolean; ms: number }>((resolve) => {
      const start = Date.now()
      const cmd = process.platform === 'win32'
        ? `ping -n 1 ${host}`
        : `ping -c 1 ${host}`

      exec(cmd, (error) => {
        resolve({ alive: error === null, ms: Date.now() - start })
      })
    })
  })

  ipcMain.handle('network:dns', async (_, domain: string) => {
    if (typeof domain !== 'string' || !/^[a-zA-Z0-9.-]+$/.test(domain)) {
      throw new Error('Invalid domain')
    }

    const addresses = await dns.resolve4(domain)
    return { addresses }
  })

  ipcMain.handle('network:tcpConnect', async (_, host: string, port: number) => {
    if (typeof host !== 'string' || !/^[a-zA-Z0-9.-]+$/.test(host)) {
      throw new Error('Invalid host')
    }
    if (typeof port !== 'number' || port < 1 || port > 65535) {
      throw new Error('Invalid port')
    }

    return new Promise<{ connected: boolean; ms: number }>((resolve) => {
      const start = Date.now()
      const socket = net.createConnection({ host, port }, () => {
        socket.end()
        resolve({ connected: true, ms: Date.now() - start })
      })
      socket.on('error', () => {
        resolve({ connected: false, ms: Date.now() - start })
      })
      socket.setTimeout(3000, () => {
        socket.destroy()
        resolve({ connected: false, ms: 3000 })
      })
    })
  })
}
```

**Input validation for `host`:**
`/^[a-zA-Z0-9.-]+$/` allows only letters, digits, dots, and hyphens — a valid hostname
pattern. Without this, a `host` argument of `; rm -rf ~` would execute shell commands
via the `exec` call. This is **shell injection** — the same category as SQL injection.
The fix is the same: validate and reject input that contains special characters.

**`net.createConnection` explained:**
Node.js's `net` module provides raw TCP connections. `createConnection({ host, port })`
opens a TCP connection to the specified host and port. The `connect` callback fires when
the TCP handshake completes. This is exactly what a browser does for every HTTPS request,
before the TLS handshake and HTTP request.

### Step 4 — Connection Quality Detection in React Native

```typescript
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'
import { useState, useEffect, useCallback } from 'react'

interface ConnectionStatus {
  readonly isConnected: boolean
  readonly connectionType: string | null
  readonly isInternetReachable: boolean | null
}

export function useNetworkStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: true,
    connectionType: null,
    isInternetReachable: null,
  })

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      })
    })

    return unsubscribe   // removes the listener on cleanup
  }, [])

  return status
}

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus()

  if (isConnected && isInternetReachable !== false) return null

  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineText}>
        {isConnected ? 'Limited connectivity' : 'No internet connection'}
      </Text>
    </View>
  )
}
```

**`isConnected` vs `isInternetReachable` explained:**
- `isConnected: true` means the device has a network interface that is up (Wi-Fi connected,
  cellular signal present)
- `isInternetReachable: true` means the device can reach the public internet (not just
  the local network — handles "connected to Wi-Fi but no internet" scenarios)

A device connected to a hotel Wi-Fi that requires a login portal is `isConnected: true`
but `isInternetReachable: false`.

---

## Connect the Pieces

DNS TTL is the same concept as the Redis cache TTL in Lesson 26. Both are "how long should
this cached mapping remain valid before checking the source of truth?" DNS TTL is set by
the domain owner; Redis TTL is set by the application. Both trade staleness risk for
performance.

The TCP connection in `net.createConnection` is the same connection that WebSockets
upgrade (Lesson 25). The WebSocket handshake starts as HTTP over TCP — the same TCP
connection creation seen here, followed by the HTTP `Upgrade` request.

Input validation in `network:ping` (rejecting special characters to prevent shell injection)
is the same defence as parameterised SQL queries in Lesson 12 (rejecting SQL metacharacters
to prevent SQL injection) and content-type validation in Lesson 24 (rejecting non-image
files). The threat model is the same: user-controlled data reaching a powerful API
(shell/SQL/filesystem). The fix is the same: validate before using.

---

## What Breaks Without This

Without hostname validation in `network:ping`, a user with access to the Electron app
(or an attacker who can inject input into the diagnostic UI) can execute arbitrary shell
commands by passing `; malicious-command` as the host. The `exec()` call passes the
entire string to the shell. On macOS/Linux, this runs as the user's account. This is
a critical remote code execution vulnerability in a desktop app.

Without `isInternetReachable` check, `isConnected: true` shows the app as "connected"
in a hotel lobby where the Wi-Fi portal has not been authenticated yet. API calls fail
with network errors; the app shows errors rather than "No internet connection". The user
does not understand why the app is broken when their device is "connected to Wi-Fi".

---

## Definition of Done

- [ ] The Electron diagnostics panel shows ping time, DNS resolution, and TCP connectivity for a test host
- [ ] An invalid hostname (containing `;`, `|`, or `$`) is rejected before reaching `exec()`
- [ ] The React Native app shows "No internet connection" when the device goes offline
- [ ] The offline banner disappears automatically when connectivity is restored
- [ ] A DNS record for `api.codexapp.io` resolves to the VPS IP (verify with `dig api.codexapp.io`)
- [ ] You can answer: what are the four layers of the TCP/IP model and what does each do?
- [ ] You can answer: what is the DNS resolution process for `api.codexapp.io`?
- [ ] You can answer: what is `isInternetReachable` and how does it differ from `isConnected`?
- [ ] You can answer: what is shell injection and how does hostname validation prevent it?
- [ ] `git commit` with a message explaining why — "Add network diagnostics in Electron and offline detection in React Native"
