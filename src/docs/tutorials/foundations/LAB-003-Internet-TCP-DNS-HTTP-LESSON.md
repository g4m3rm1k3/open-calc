# FOUNDATIONS — LAB-003 — How the Internet Works: TCP/IP, DNS, and HTTP

**Prerequisites:** LAB-002 (event loop, non-blocking I/O — why network calls don't block)

**What this lab adds:**
- You will trace exactly what happens between typing a URL and a server receiving your request
- You will see DNS resolution happen live in your terminal
- You will read the raw bytes of an HTTP request and response
- You will understand why a failed CORS request fails before your code even runs

**Time:** 45–55 minutes

**Environment:** Browser DevTools (F12) — Network tab and Console tab. Terminal for DNS lookups.

---

> **Quick Check — try to answer before reading:**
>
> 1. When you type `google.com` in the browser, the computer needs an IP address, not a name. How does it get one?
> 2. What does it mean for a connection to be "stateless"?
> 3. If you make two requests to the same server, does the server remember the first one?
>
> *(Answers at the end of this lab)*

---

## What You Will Be Able To Do

When this lab is complete, you can open the Network tab in DevTools and read every field in a request/response, explain what happened before the browser even sent the request (DNS, TCP handshake), and diagnose whether a failed request is a DNS failure, a connection failure, or an HTTP error — three completely different problems.

---

## Step 1 — See What Actually Happens When You Load a Page

Open your browser. Press F12. Click the **Network** tab. Now clear it (the circle with a slash icon). Type `https://example.com` in the address bar and press Enter.

---

### SAVE AND TRY

After the page loads, look at the Network tab.

**You should see:** A list of requests. Click the first one (the HTML document request). A panel opens on the right. Look at the **Headers** tab. Read every section:

- **General:** The URL, HTTP method (`GET`), status code (`200`)
- **Response Headers:** What the server sent back — `content-type`, `content-length`, `server`
- **Request Headers:** What your browser sent — `host`, `user-agent`, `accept`

Then click the **Timing** tab for the same request. You will see bars for:
- **DNS Lookup** — how long it took to resolve `example.com` to an IP address
- **Initial Connection** — TCP handshake
- **SSL** — TLS handshake (the "S" in HTTPS)
- **Waiting (TTFB)** — time until the first byte of the response arrived
- **Content Download** — how long receiving the full response took

**Change something:** Go to `http://example.com` (no S). Compare the Timing — there is no SSL bar. The connection is faster but unencrypted. Change it back to HTTPS.

---

All of those timing phases correspond to real protocols with real mechanics. Let's understand each one.

---

### Concept: IP Addresses and Packets

**What it is:** Every device on the internet has an IP address — a number that identifies it. Data travels as **packets** — small chunks (typically 1,500 bytes each), each labelled with a source address and a destination address, routed independently through the network.

**The problem before:**

You want to send a 5MB file from New York to Tokyo. A direct circuit between the two cities would need to be reserved for your exclusive use for the entire transfer duration — unusable by anyone else. Early telephone networks worked this way (circuit switching). This is wasteful: most of a voice call's "time" is silence.

**The solution:**

Chop the data into packets. Label each packet with where it came from and where it is going. Let routers — computers at network intersections — read the label and forward each packet toward the destination. Different packets from the same file can take different routes. If one route is congested, packets take another. The network is used efficiently by everyone simultaneously.

**What it hides:**

Physical network topology. You write `fetch("https://api.example.com")` and receive data. Behind the scenes: your packet left your machine, was forwarded by your router to your ISP, forwarded to a backbone router, crossed the country via fiber optic cable, arrived at the destination ISP, and reached the server — all in under 50ms. You saw none of it.

The invariant it protects: every packet is routed toward its destination independently. The network does not need to know about your entire connection — just the next hop for each packet. This makes the internet resilient: if a router fails, packets route around it.

**Canonical example:**

Sending a book via postal mail, but tearing out each chapter and mailing them separately in different envelopes, all addressed to the same person. Each envelope is a packet. The postal system (routers) reads the address and forwards each envelope through the fastest available route. They might arrive out of order. TCP (next concept) reassembles them.

**Smallest possible example** — see real routing:

Open your terminal (not the browser console — the system terminal):

```bash
# Trace the route your packets take to google.com:
traceroute google.com          # Mac/Linux
# or
tracert google.com             # Windows
```

Each line is one router your packets passed through. Each has an IP address and a round-trip time. You are watching packet routing happen in real time.

**Why it matters here:** When you diagnose a slow API call, you need to know whether the delay is in DNS resolution, TCP connection, SSL negotiation, server processing, or data transfer. The Network tab's Timing breakdown maps to these exact packet-level phases.

**You will see this again in:**
- CDNs (Content Delivery Networks) — they put servers geographically close to users so packet travel time is short
- Network latency in games — "ping" is the round-trip time for a small packet
- API timeouts — if a packet is lost and not resent (TCP handles this), the server never received the request
- Docker networking — containers have virtual IP addresses; `docker-compose` creates a virtual network where containers find each other by name

**Watch for:** An IP address like `192.168.1.1` is a private address — visible only inside your local network. Public addresses (like `142.250.80.36`) are globally routable. Your home router has one public IP shared by all devices in your house via NAT (Network Address Translation).

---

### SAVE AND TRY

In your system terminal:

```bash
ping google.com
```

**You should see:** Lines like `64 bytes from 142.250.80.36: icmp_seq=0 ttl=117 time=14.2 ms`. The IP address after "from" is Google's server IP. The `time` is the round-trip time for a single packet. Press Ctrl+C to stop.

**Change something:** Run `ping 8.8.8.8` — the same Google server by IP address instead of name. Compare the time. It should be identical — you skipped DNS lookup but reached the same destination.

---

### Concept: DNS — The Internet's Phone Book

**What it is:** DNS (Domain Name System) is a distributed database that maps human-readable domain names (`google.com`) to IP addresses (`142.250.80.36`). It is a lookup system: give it a name, get back a number.

**The problem before:**

Computers route by IP address, but humans remember names. In 1983, the entire internet ran on a single file (`HOSTS.TXT`) that listed every hostname and IP address — downloaded periodically to every machine. With 4 billion internet-connected devices today, this approach would require downloading a multi-gigabyte file millions of times per second.

**The solution:**

A hierarchical distributed system. Your browser asks your local DNS resolver (usually your router). If it doesn't know, it asks a root nameserver. The root delegates to the `.com` nameserver. The `.com` nameserver delegates to Google's nameserver. Google's nameserver returns `142.250.80.36`. The answer is cached at each level so future lookups skip most of the chain.

```
Browser → Local resolver → Root nameserver
                        ← "ask .com nameserver"
         → .com nameserver
                        ← "ask google.com nameserver"
         → google.com nameserver
                        ← "142.250.80.36"
Browser gets IP address. Cache it for TTL seconds.
```

**What it hides:**

The entire distributed system. You type `google.com` and get bytes. The whole resolution chain — potentially 4+ network round-trips — happens transparently. Caching means subsequent requests to the same domain are instant (no lookup needed).

The invariant it protects: domain names remain stable while IP addresses can change. If Google moves servers, they update their DNS record. All browsers, after their cache expires, pick up the new address. Your bookmarks still work. You do not need to update a phone book on your machine.

**Canonical example:**

You want to call a company. You do not know their phone number, so you call directory assistance (local DNS resolver). They look it up for you. They give you the number. You write it in your address book (cache) so you do not need to call directory assistance again. The number is good for a while — until the company moves (TTL expires) and you need to look it up again.

**Smallest possible example:**

```bash
# In your terminal — look up any domain's IP address:
nslookup google.com

# More detail:
nslookup -type=any google.com

# See the TTL (how long to cache this answer):
dig google.com
```

**Why it matters here:** DNS failures look like connection failures. If DNS cannot resolve a name, your request never even gets to TCP. In the Network tab, a DNS failure shows a long "DNS Lookup" bar followed by nothing. In code, it throws a `TypeError: Failed to fetch` — the same error as a CORS failure or a server being down. Knowing these are three different problems tells you where to look.

**You will see this again in:**
- Custom domains for deployed apps — you buy `myapp.com`, point its DNS record at your server's IP, and after propagation (TTL expiry), traffic reaches your server
- Docker Compose — service names in `docker-compose.yml` are resolved by Docker's internal DNS
- Environment variables for database URLs — `DATABASE_URL=postgresql://db:5432/myapp` where `db` is resolved by Docker's DNS
- CDN setup — pointing a CNAME record at a CDN so all traffic routes through edge servers
- Debugging "works on my machine" failures — DNS caching means you might see an old IP address that a colleague doesn't

**Watch for:** DNS changes do not propagate instantly. The TTL (Time to Live) value in the DNS record controls how long caches keep the old answer. A TTL of 3600 means it can take up to 1 hour for a DNS change to reach everyone.

---

### SAVE AND TRY

In your terminal:

```bash
nslookup jsonplaceholder.typicode.com
```

**You should see:** A "Non-authoritative answer" with an IP address. Write the IP address down.

Now in the browser console:

```js
// Fetch by domain name (requires DNS lookup):
await fetch("https://jsonplaceholder.typicode.com/todos/1").then(r => r.json())
```

Expected: A JSON object with `userId`, `id`, `title`, `completed`. The DNS lookup happened automatically and invisibly.

**Change something:** Open DevTools → Network tab → find the `todos/1` request → click Timing. Find the DNS Lookup time. It is probably 0ms — because the resolver cached the answer from a previous lookup. Try clearing the browser cache (Settings → Clear browsing data → Cached images and files) and fetching again. The DNS Lookup bar will be non-zero the first time.

---

### Concept: TCP — Reliable Delivery

**What it is:** TCP (Transmission Control Protocol) is a protocol layered on top of IP that guarantees packets are delivered in order, without corruption, and without loss — automatically retransmitting any packet that doesn't arrive.

**The problem before:**

IP packets can arrive out of order, get duplicated, or be lost entirely — routers drop packets when their buffers are full. For a webpage, out-of-order HTML would display gibberish. Missing packets would leave holes. IP alone provides no guarantees.

**The solution:**

Before sending data, TCP does a **handshake**:
1. Your machine sends SYN (synchronize)
2. Server responds with SYN-ACK (acknowledge)
3. Your machine sends ACK

Now the connection is established. Every packet sent in either direction gets a sequence number. The receiver acknowledges each packet. If no acknowledgment arrives within a timeout, the sender retransmits. Packets are buffered and reordered at the receiver. The application sees a clean, ordered byte stream — no gaps, no duplicates.

**What it hides:**

All packet-level complexity. You write `fetch(url)` and get bytes. Behind the scenes: 3-way handshake, sequence numbers, acknowledgments, retransmissions, flow control (don't overwhelm the receiver), congestion control (don't overwhelm the network). None of this is visible. You receive a complete, ordered byte stream.

The invariant it protects: the application sees bytes in exactly the order they were sent, with no missing bytes and no duplicates. The network layer can drop and reorder packets freely — TCP repairs all of it.

**Canonical example:**

Sending a book page by page via certified mail where you need a signed receipt for each page before sending the next. If a receipt doesn't arrive (packet lost), you resend that page. The recipient arranges received pages in order before reading. The reader always gets a complete, ordered book — even if the postal service lost and re-delivered some pages.

**Smallest possible example:**

You already saw this in the Timing tab: "Initial Connection" is the TCP 3-way handshake. It adds one round-trip time (RTT) before any data is sent. If your server is 100ms away, the handshake takes 100ms — just to establish the connection. This is why HTTPS connections are slower than HTTP (TLS adds another 1–2 RTTs), and why HTTP/2 multiplexes multiple requests over one TCP connection.

**Why it matters here:** When a fetch call hangs forever, it might be waiting for TCP acknowledgments that never arrive (server crashed mid-response). When a WebSocket disconnects, the TCP connection dropped. When a server is "slow," part of that slowness may be TCP retransmissions from a lossy network.

**You will see this again in:**
- WebSockets — a TCP connection held open for bidirectional messaging
- Database connections — `postgresql://host:5432` is a TCP connection to port 5432
- Connection pools — reusing TCP connections because the 3-way handshake is expensive
- gRPC — a high-performance RPC protocol that multiplexes over TCP (HTTP/2)
- SSH — the terminal connection to a server is a TCP connection on port 22

**Watch for:** TCP connections are stateful — both sides remember the connection state. HTTP is stateless — each request is independent. These are different layers: TCP maintains a persistent connection, but HTTP treats each request as isolated. Cookies and sessions are how HTTP adds state on top of TCP's connection.

---

### Concept: HTTP — The Request-Response Protocol

**What it is:** HTTP (HyperText Transfer Protocol) is a text-based request-response protocol: the client sends a **request** with a method, URL, headers, and optional body; the server sends a **response** with a status code, headers, and body.

**The problem before:**

TCP gives you a reliable byte stream. Now you need an agreement on the format of messages — what bytes mean "here is my request" and what bytes mean "here is my response." Without a format agreement, you are just exchanging raw bytes with no meaning.

**The solution:**

HTTP defines a simple text format:

```
Request:
GET /todos/1 HTTP/1.1          ← method, path, version
Host: jsonplaceholder.typicode.com  ← required header in HTTP/1.1
Accept: application/json       ← optional header
                               ← blank line ends the headers
                               ← (no body for GET)
```

```
Response:
HTTP/1.1 200 OK                ← version, status code, reason phrase
Content-Type: application/json ← header
Content-Length: 83             ← header
                               ← blank line ends the headers
{                              ← body starts here
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

**What it hides:**

The TCP connection management and byte framing. You call `fetch()` with a URL and headers. The browser formats the HTTP request as bytes, sends them over the TCP connection, receives the response bytes, parses the headers, and gives you the body as a `Response` object. You never see the raw bytes unless you look in the Network tab.

The invariant it protects: both client and server agree on message boundaries. The `Content-Length` header tells the receiver exactly how many bytes to expect in the body. Without this, neither side knows when one message ends and the next begins.

**Methods and their meanings:**

| Method | What it means | Idempotent? | Has body? |
|--------|--------------|-------------|-----------|
| GET | Retrieve a resource | Yes | No |
| POST | Create a resource | No | Yes |
| PUT | Replace a resource entirely | Yes | Yes |
| PATCH | Modify part of a resource | No | Yes |
| DELETE | Remove a resource | Yes | No |

**Idempotent** means: sending the same request twice has the same effect as sending it once. `GET /users/1` twice returns the same user twice — the server state is unchanged. `POST /users` twice creates two users — not idempotent.

**Status code families:**

```
1xx — Informational (100 Continue)
2xx — Success (200 OK, 201 Created, 204 No Content)
3xx — Redirect (301 Moved Permanently, 302 Found)
4xx — Client error — YOUR fault (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found)
5xx — Server error — THEIR fault (500 Internal Server Error, 503 Service Unavailable)
```

**Smallest possible example** — send a raw HTTP request and read the response:

```js
// In the browser console — see the raw status and headers:
const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");

console.log(response.status);        // 200
console.log(response.statusText);    // "OK"
console.log(response.headers.get("content-type")); // "application/json; charset=utf-8"

const body = await response.json();
console.log(body);
```

**Why it matters here:** Every API you call — every fetch in every frontend, every HTTP endpoint in every backend — uses this format. Reading a status code tells you immediately: is this my bug (4xx) or their bug (5xx)? Reading headers tells you: is this JSON (`content-type: application/json`) or HTML? Is the response cached (`cache-control`)?

**You will see this again in:**
- Every `fetch()` call in JavaScript — this is what it wraps
- Every FastAPI route — `@app.get("/users/{id}")` maps to an HTTP GET request
- curl in the terminal — the most direct way to test an API without a browser
- REST API design (LAB-098) — the semantics of methods and status codes are the entire foundation
- Authentication headers — `Authorization: Bearer <token>` is just an HTTP header with a JWT

**Watch for:** `response.json()` throws if the body is not valid JSON — even if the status is 200. Always check `response.ok` (true for 2xx) before calling `.json()`, because a 404 with an HTML body will crash your `.json()` parse.

---

### SAVE AND TRY

In the browser console:

```js
// Make a bad request on purpose — see the 404:
const response = await fetch("https://jsonplaceholder.typicode.com/todos/99999");

console.log(response.status);    // 404
console.log(response.ok);        // false — ok is only true for 2xx

// THIS is the right pattern:
if (!response.ok) {
  throw new Error(`HTTP error: ${response.status}`);
}
const data = await response.json();
```

Expected: `404`, `false`, then an error thrown.

**Now make a POST:**

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "My Post", body: "Content", userId: 1 })
});

const data = await response.json();
console.log(response.status); // 201 — Created (not 200 OK)
console.log(data.id);         // the server assigned an ID to the new resource
```

Expected: Status `201`, a new object with an `id`.

**Change something:** Remove the `"Content-Type": "application/json"` header and try again. Observe that the server may return a 400 or an empty object — it did not know to parse the body as JSON. Add the header back.

---

### Concept: CORS — Cross-Origin Resource Sharing

**What it is:** CORS is a browser security mechanism that blocks JavaScript from reading responses to requests made to a different **origin** (scheme + domain + port). The browser enforces this; servers can opt in to cross-origin access by sending `Access-Control-Allow-Origin` headers.

**The problem before:**

You visit `evil.com`. JavaScript on that page makes a request to `yourbank.com/api/transfer` with your cookies automatically attached (browsers send cookies with every request to the matching domain). Without CORS, the script could read your bank balance or initiate a transfer.

**The solution:**

For **simple** requests (GET, POST with certain content types), the browser sends the request and blocks JavaScript from reading the response if the server's `Access-Control-Allow-Origin` header does not include the requesting origin.

For **preflight** requests (PUT, DELETE, or POST with `application/json`), the browser first sends an OPTIONS request asking "is this cross-origin request allowed?" The server either grants or denies. Only if granted does the actual request go through.

**What it hides:**

Nothing — CORS errors are very visible. What matters is understanding: CORS is enforced by the **browser**, not the server. A server that has no CORS headers is not "broken" — it just refuses cross-origin browser JavaScript access. curl, your backend server, and Postman bypass CORS entirely because they are not browsers.

The invariant it protects: malicious JavaScript on `evil.com` cannot read responses from `yourbank.com` using the victim's cookies, even though the browser sends those cookies with every request to `yourbank.com`.

**Canonical example:**

A library (the server) has a rule: books can be borrowed by members (same origin). A stranger (different origin JavaScript) walks in and tries to borrow a book. The librarian (browser) checks whether the library has posted a sign saying "visitors from this address may borrow books." If no such sign exists, the librarian blocks the stranger from leaving with the book — even though the book was retrieved from the shelf and the stranger is standing there holding it.

**Smallest possible example** — trigger a real CORS error:

```js
// This will fail with a CORS error in the browser:
// (run it — you will see the error message in red in the console)
await fetch("https://google.com/api/data");
```

Expected: A red error like `Access to fetch at 'https://google.com/api/data' from origin 'null' has been blocked by CORS policy`. The request reached Google's servers (check the Network tab — you'll see the OPTIONS preflight or the GET), but the browser refused to give your JavaScript the response.

**Why it matters here:** Every time you build a frontend that talks to your backend during development, you will hit CORS. The fix is always on the server: add `Access-Control-Allow-Origin: *` (or a specific origin) to the response. Never "fix" CORS by disabling the browser's security checks. The backend must explicitly allow cross-origin access.

**You will see this again in:**
- FastAPI: `from fastapi.middleware.cors import CORSMiddleware` — you will add this in the GEOMETRY backend
- Express.js: the `cors` npm package — same purpose
- Every REST API that serves a frontend on a different domain
- Deployed apps: `api.myapp.com` and `myapp.com` are different origins — CORS required even though it's the same project
- Security reviews: CORS misconfiguration (`Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`) is a real vulnerability

**Watch for:** CORS errors in the browser console always include the word "CORS" and explain which header was missing. The fix is always a server-side change. If you see a CORS error, do not search for "disable CORS in browser" — search for "add CORS headers to [your backend framework]."

---

### SAVE AND TRY

In your browser console — open the Network tab first:

```js
// A request that WILL succeed (server has CORS headers):
const r1 = await fetch("https://jsonplaceholder.typicode.com/todos/1");
console.log(r1.headers.get("access-control-allow-origin")); // "*"
```

Expected: `"*"` — this server allows requests from any origin. That's why your earlier fetches worked.

```js
// Check whether a server sends CORS headers:
const r2 = await fetch("https://www.google.com");
```

Expected: A CORS error in the console. Look in the Network tab — find the request to google.com. The server responded (you can see the status in the Network tab), but the browser blocked your JavaScript from reading the response because Google's API didn't include `Access-Control-Allow-Origin`.

**Change something:** In the Network tab, find any successful request to `jsonplaceholder.typicode.com`. Click it. Under Response Headers, find `access-control-allow-origin`. This is the header your backend will need to add to allow your frontend to read its responses.

---

## 🎯 Challenge: Read a Full Request in the Network Tab

**You know:** HTTP requests have a method, URL, headers, and optional body. Responses have a status code, headers, and body. DNS lookups, TCP handshakes, and TLS happen before the HTTP exchange.

**Task:** Make this `POST` request in the console, then use the Network tab to answer every question below — without looking at the code again after you run it:

```js
await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Custom-Header": "foundations-lab"
  },
  body: JSON.stringify({ title: "test", userId: 42 })
}).then(r => r.json());
```

**Questions — answer from the Network tab, not from memory:**
1. What was the response status code?
2. What `Content-Type` did the server respond with?
3. Does the response include an `Access-Control-Allow-Origin` header? What is its value?
4. How long did the DNS lookup take? The TCP connection? The server response (TTFB)?
5. Find your `X-Custom-Header` in the request headers. Is it there?
6. Find the request body. Does it match what you sent?

Try to answer all six before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

In the Network tab, find the `posts` request. Click it.

**1. Status code:** In the General section or the Headers tab header → `201 Created` (not 200 — POST that creates a resource returns 201).

**2. Response Content-Type:** Response Headers section → `application/json; charset=utf-8`

**3. Access-Control-Allow-Origin:** Response Headers → `*` (jsonplaceholder explicitly allows all origins — that is why fetch works from the console)

**4. Timing:** Timing tab → DNS Lookup, Initial Connection, and Waiting (TTFB) bars. DNS is likely 0ms (cached). TCP connection is ~10–50ms depending on your location. TTFB is the server processing time.

**5. X-Custom-Header:** Request Headers section → `x-custom-header: foundations-lab` (browsers lowercase header names in the display)

**6. Request body:** Payload tab (or Request tab) → `{"title":"test","userId":42}` — the serialized JSON you sent.

**Key insight:** Every `fetch()` call is just these bytes going back and forth. The Network tab shows the exact same information as running `curl -v` in the terminal — it is not magic, it is text formatted according to the HTTP specification. Once you can read these directly, you can diagnose any network problem without needing the JavaScript source code.

</details>

---

## What Just Happened

Typing a URL triggers a chain: DNS resolves the name to an IP address, TCP establishes a reliable connection via 3-way handshake, TLS negotiates encryption, and HTTP sends your request as formatted text. The server responds with a status code and body, TCP delivers the bytes reliably, and the browser gives your JavaScript the result.

Each layer solves a specific problem: IP provides addressing and routing (get packets to the right place), TCP provides reliability (get all packets, in order, without loss), HTTP provides message framing and semantics (what does this message mean?). CORS sits on top — enforced by the browser, not the network — to prevent malicious JavaScript from reading cross-origin responses using the user's credentials.

Understanding the layers tells you where failures happen. "Cannot connect" is a DNS or TCP problem — never got to HTTP. A `4xx` status is an HTTP problem on the client side. A `5xx` is an HTTP problem on the server side. A CORS error is a browser enforcement issue — the request succeeded at the network level, but the browser refused to expose the response to JavaScript.

---

## Final Check

| You can do this | This demonstrates |
|---|---|
| `nslookup google.com` returns an IP address from the terminal | DNS translates domain names to IP addresses before any TCP connection can be made |
| The Network tab's Timing shows DNS → TCP → TLS → TTFB phases | These are distinct protocols, each adding latency before data is transferred |
| `response.status` is `201` after a POST that creates a resource | HTTP status codes have semantic meaning — 201 Created differs from 200 OK |
| `response.ok` is `false` for a 404 response | `ok` is only true for 2xx — the responsibility to check falls on the caller |
| `fetch("https://google.com")` throws a CORS error in the browser | CORS is browser enforcement: same request via curl would succeed |
| `response.headers.get("access-control-allow-origin")` returns `"*"` for jsonplaceholder | Servers opt into cross-origin access by sending this header |
