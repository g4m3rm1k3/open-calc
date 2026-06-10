# Rust Web Server — LAB 13 — TCP Sockets and Raw HTTP

**Prerequisites:** LAB 01–12. You understand all of Phase 1 and Phase 2: Rust fundamentals, the OS, system calls, file descriptors, processes, pipes, strings, slices, and lifetimes. You know that a TCP connection is a file descriptor, and that reading from it uses the same `BufReader` patterns as reading from a file.

**What this lab adds:**
- What TCP is — the protocol, the three-way handshake, and what "reliable" means
- IP addresses and ports — the addressing system of the internet
- `TcpListener` — binding to a port and accepting connections
- `TcpStream` — reading from and writing to a network connection
- The HTTP/1.1 wire format — exactly what bytes travel between browser and server
- Parsing an HTTP request line by line using the tools from Labs 09 and 11
- Constructing a valid HTTP response the browser accepts
- A working web server: open your browser, visit `http://localhost:8080`, see a response

**Time:** 6–8 hours. This is the pivot lab — everything before it was preparation. Read Parts 1 and 2 fully before writing any code.

---

> **Quick Check — try to answer before reading further:**
>
> 1. When your browser visits `http://localhost:8080/index.html`, what do you think happens between the moment you press Enter and the moment the page appears? How many separate steps are involved?
> 2. TCP is described as a "reliable" protocol. The internet is inherently unreliable — packets get lost, reordered, and corrupted. How do you think TCP achieves reliability on top of an unreliable network?
> 3. You have used `BufReader` to read lines from files. A TCP connection is also a file descriptor. What do you predict will be different — and what will be the same — when reading HTTP request lines from a socket instead of a file?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, this works:

```
$ cargo run
Listening on http://localhost:8080
Press Ctrl+C to stop.

[2024-01-15 10:23:45] GET / HTTP/1.1 → 200 OK (312 bytes)
[2024-01-15 10:23:46] GET /hello HTTP/1.1 → 200 OK (287 bytes)
[2024-01-15 10:23:47] GET /about HTTP/1.1 → 200 OK (301 bytes)
[2024-01-15 10:23:48] GET /favicon.ico HTTP/1.1 → 404 Not Found (198 bytes)
```

Open your browser. Visit `http://localhost:8080`. See a real HTML page served by your Rust program. Visit `http://localhost:8080/hello`. Visit `http://localhost:8080/about`. Each path returns a different HTML page. Visit a path that does not exist — see a proper 404 response.

This is not a toy. This is a real HTTP/1.1 server that speaks the actual protocol a browser expects.

---

## Part 1 — The Network Stack

### Concept: The Network Stack — Layers of Abstraction

**What it is:** Network communication is organized as a stack of protocols, each layer building on the one below it. Each layer solves one specific problem and hides the complexity from the layer above.

**The four layers you need to understand:**

```
Layer 4: Application layer — HTTP, DNS, SMTP, FTP
          "GET /index.html HTTP/1.1" — what your web server speaks

Layer 3: Transport layer — TCP, UDP
          Reliable (TCP) or unreliable (UDP) delivery of data streams

Layer 2: Internet layer — IP
          Routing packets between machines on different networks

Layer 1: Link layer — Ethernet, WiFi
          Moving bits between machines on the same local network
```

Each layer wraps the layer below in a header — extra bytes prepended to the data describing routing, sequencing, error detection. By the time an HTTP request reaches the wire, it looks like:

```
[Ethernet header][IP header][TCP header][HTTP data]
```

Your Rust code only ever sees the HTTP data — the OS and network hardware handle everything else invisibly.

**The key insight:** You are building at Layer 4. TCP (Layer 3) handles all the complexity of reliability, ordering, and flow control. You hand data to TCP and it arrives at the destination, in order, without corruption — or TCP tells you the connection failed. You never deal with lost packets, reordered segments, or checksums.

---

### Concept: IP Address — The Network Identifier

**What it is:** An IP address is a number that uniquely identifies a machine (or network interface) on a network. It is the mailing address of the internet.

**IPv4 — the version you will use:**

An IPv4 address is 32 bits — 4 bytes — written as four decimal numbers separated by dots:

```
192.168.1.100
↑   ↑   ↑ ↑
Each number is 0–255 (one byte)
Together they are a 32-bit integer: 3232235876
```

**Special addresses:**

| Address | Meaning |
|---|---|
| `127.0.0.1` | Loopback — the machine talking to itself. `localhost` resolves to this. |
| `0.0.0.0` | Wildcard — listen on all network interfaces |
| `192.168.x.x` | Private network — local network, not routable on the internet |

**IPv4 address space exhaustion:** 32 bits gives only ~4 billion addresses. The internet ran out of IPv4 addresses around 2011. IPv6 (128-bit addresses) solves this, with 340 undecillion addresses. Your server will bind to `127.0.0.1:8080` — loopback — which works the same on both IPv4 and IPv6. We will handle IPv6 binding in a later lab.

---

### Concept: Port — The Service Identifier

**What it is:** A port is a 16-bit number (0–65535) that distinguishes different services running on the same machine. Where an IP address identifies the machine, a port identifies the specific program on that machine.

**The analogy:** An IP address is a building's street address. A port is the apartment number. The mail goes to the building (IP), then to the specific apartment (port).

**Well-known ports:**

| Port | Protocol | Service |
|---|---|---|
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 22 | TCP | SSH |
| 25 | TCP | SMTP (email sending) |
| 53 | UDP | DNS |
| 5432 | TCP | PostgreSQL |
| 8080 | TCP | HTTP (development, alternate) |

Ports below 1024 are **privileged ports** — on Unix, only programs running as root can bind to them. That is why development servers use 8080 instead of 80: you can bind to 8080 without root privileges.

**Socket address:** A complete network address is an IP + port pair: `127.0.0.1:8080`. This uniquely identifies one service on one machine. This is what `TcpListener::bind("127.0.0.1:8080")` uses.

---

### Concept: TCP — Transmission Control Protocol

**What it is:** TCP is a transport-layer protocol that provides reliable, ordered, bidirectional byte-stream communication between two endpoints.

**What "reliable" means:**
- Every byte sent is guaranteed to arrive (or the connection is declared broken)
- Bytes arrive in the same order they were sent
- Duplicate bytes are discarded
- Data is not corrupted (checksums detect corruption; corrupted segments are retransmitted)

**How TCP achieves reliability — the key mechanisms:**

**Acknowledgments (ACKs):** Every byte sent must be acknowledged by the receiver. The sender keeps track of what has been acknowledged. Unacknowledged bytes are retransmitted after a timeout.

**Sequence numbers:** Every byte in a TCP stream has a sequence number. The receiver uses these to detect missing bytes (gaps in the sequence) and to reorder out-of-order segments.

**Flow control:** The receiver tells the sender how much buffer space it has available. The sender never sends more than the receiver can accept.

**Congestion control:** TCP monitors the network for signs of congestion (packet loss, increasing delay) and reduces its sending rate to avoid overwhelming the network.

**The three-way handshake — how a TCP connection is established:**

Before any data can flow, two endpoints must establish a connection:

```
Client                              Server
  │                                   │
  │──── SYN (seq=x) ────────────────► │  "I want to connect, my starting sequence is x"
  │                                   │
  │ ◄── SYN-ACK (seq=y, ack=x+1) ─── │  "OK, my starting sequence is y, I got your x"
  │                                   │
  │──── ACK (ack=y+1) ──────────────► │  "Got your y"
  │                                   │
  │    [connection established]        │
  │                                   │
  │──── HTTP request ───────────────► │
  │ ◄── HTTP response ──────────────── │
```

SYN means "synchronize sequence numbers." The three messages are called the three-way handshake. After the handshake, both sides have agreed on starting sequence numbers and the connection is established.

**For your server:** The OS handles the handshake completely. When `TcpListener::accept()` returns a `TcpStream`, the handshake is already complete. You get a fully established connection, ready for data.

---

## Part 2 — HTTP/1.1

### Concept: HTTP — HyperText Transfer Protocol

**What it is:** HTTP is an application-layer protocol that defines how web browsers and web servers communicate. It is a text-based request-response protocol: the client sends a request, the server sends a response.

**HTTP/1.1 wire format — exactly what travels over the socket:**

**Request format:**

```
GET /index.html HTTP/1.1\r\n
Host: localhost:8080\r\n
User-Agent: Mozilla/5.0\r\n
Accept: text/html\r\n
\r\n
```

Breaking this down:
- Line 1: the **request line** — method, path, version
- Lines 2–N: **headers** — key: value pairs
- One blank line: **\r\n** — the header terminator (carriage return + newline)
- Optional body (for POST/PUT requests — not present in GET)

**Response format:**

```
HTTP/1.1 200 OK\r\n
Content-Type: text/html\r\n
Content-Length: 48\r\n
\r\n
<html><body>Hello from Rust!</body></html>
```

Breaking this down:
- Line 1: the **status line** — version, status code, reason phrase
- Lines 2–N: **response headers**
- One blank line: the header terminator
- Optional body: the actual content (HTML, JSON, bytes, etc.)

**`\r\n` — why two characters?**

HTTP uses `\r\n` (carriage return + newline, bytes 0x0D 0x0A) as its line terminator — not just `\n`. This comes from teletype history: `\r` moved the print head to the left margin; `\n` advanced the paper one line. HTTP inherited this from early internet protocols. Your parser must handle `\r\n` line endings, not just `\n`.

**The blank line is critical:**

The server reads headers line by line until it sees a blank line (`\r\n` on its own — or just `\n` for lenient parsers). Everything after that blank line is the request body. For GET requests, the body is empty — the blank line is the end of the request.

---

### Concept: HTTP Status Codes — The Server's Response Summary

**What they are:** A three-digit number in the response that tells the client whether the request succeeded and what happened.

**The five classes:**

| Range | Class | Meaning |
|---|---|---|
| 1xx | Informational | Request received, continuing |
| 2xx | Success | Request succeeded |
| 3xx | Redirection | Client must take further action |
| 4xx | Client error | The client made an error |
| 5xx | Server error | The server made an error |

**The codes your server will use:**

| Code | Text | When |
|---|---|---|
| 200 | OK | Request succeeded, body contains the response |
| 301 | Moved Permanently | Resource is at a new URL permanently |
| 302 | Found | Resource is at a new URL temporarily |
| 400 | Bad Request | The request is malformed |
| 403 | Forbidden | Server refuses to serve this — no permission |
| 404 | Not Found | The requested resource does not exist |
| 500 | Internal Server Error | The server crashed handling this request |

---

### Concept: HTTP Headers — Metadata About the Request or Response

**What they are:** Key-value pairs that carry metadata alongside the request or response body.

**The format:** `Header-Name: Header-Value\r\n`

Header names are case-insensitive. Values are case-sensitive. A single header can have multiple values (comma-separated). Headers end at the blank line.

**Essential request headers:**

| Header | Example | Meaning |
|---|---|---|
| `Host` | `localhost:8080` | Which server the client is talking to (required in HTTP/1.1) |
| `User-Agent` | `Mozilla/5.0 ...` | Which browser/client is making the request |
| `Accept` | `text/html,*/*` | What content types the client accepts |
| `Content-Length` | `48` | How many bytes in the request body |
| `Connection` | `keep-alive` | Whether to keep the TCP connection open after this request |

**Essential response headers:**

| Header | Example | Meaning |
|---|---|---|
| `Content-Type` | `text/html; charset=utf-8` | What type of content is in the body |
| `Content-Length` | `312` | How many bytes in the response body |
| `Connection` | `close` | Close the TCP connection after this response |

**`Content-Length` is critical:** Without it, the client does not know when the response body ends. For HTTP/1.1 with `Connection: keep-alive` (where the TCP connection is reused), the client reads exactly `Content-Length` bytes after the blank line. For our server, we will always include `Content-Length` and use `Connection: close` — simpler to implement correctly.

---

## Part 3 — Building the Server

### Step 1 — Create the Project

```
cargo new http_server
cd http_server
```

Open `src/main.rs`. Replace everything:

```rust
use std::net::TcpListener;

fn main() {
    let address = "127.0.0.1:8080";

    let listener = TcpListener::bind(address)
        .expect("Could not bind to address — is port 8080 already in use?");
    //   ↑
    //   .bind() calls the bind() + listen() system calls
    //   It registers with the OS: "this program owns port 8080"
    //   Returns Err if the port is already in use by another program

    println!("Listening on http://{}", address);
    println!("Press Ctrl+C to stop.");
    println!();
}
```

**What `TcpListener::bind` does at the OS level:**

1. Calls `socket(AF_INET, SOCK_STREAM, 0)` — creates a TCP socket fd
2. Calls `bind(fd, addr, addrlen)` — registers the socket with the OS at `127.0.0.1:8080`
3. Calls `listen(fd, backlog)` — tells the OS to start accepting connections into a queue (the `backlog` is how many pending connections the OS will hold before refusing new ones)

After `bind()`, the OS owns port 8080. No other program can bind to it until your server closes. If you try to run two copies simultaneously, the second fails with "address already in use."

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Listening on http://127.0.0.1:8080
Press Ctrl+C to stop.

```

The program waits — it is not hanging, it is listening. Open your browser and visit `http://localhost:8080`. The browser will likely show "Connection refused" or spin forever — because our server is not accepting connections yet. Press Ctrl+C to stop it.

**Change something:** Change `"127.0.0.1:8080"` to `"127.0.0.1:80"`. On Linux/macOS, you should get "Permission denied" — port 80 requires root. On Windows, you may get "Access denied." Change it back to `8080`. This demonstrates privileged ports.

---

### Step 2 — Accept One Connection

Add the accept loop:

```rust
use std::net::TcpListener;

fn main() {
    let address = "127.0.0.1:8080";

    let listener = TcpListener::bind(address)
        .expect("Could not bind to address");

    println!("Listening on http://{}", address);
    println!("Press Ctrl+C to stop.");
    println!();

    for stream_result in listener.incoming() {
        //                         ↑
        //                         .incoming() returns an iterator of incoming connections
        //                         each element is Result<TcpStream, io::Error>
        //                         the iterator blocks waiting for the next connection
        //                         it never returns None — it runs forever (or until error)

        match stream_result {
            Ok(stream) => {
                println!("Connection from: {}",
                    stream.peer_addr()          // ← get the client's IP:port
                        .map(|a| a.to_string())
                        .unwrap_or_else(|_| "unknown".to_string())
                );
                // We will handle the connection here in the next step
                // For now, just acknowledge it and let the stream drop (closes the connection)
            }
            Err(e) => {
                eprintln!("Connection error: {}", e);
                // Individual connection errors do not stop the server
                // Log and continue accepting
            }
        }
    }
}
```

**`listener.incoming()` — the accept loop:**

`.incoming()` is a method that internally calls the `accept()` system call on each iteration. `accept()` blocks until a client connects, then returns a new socket fd for that connection and the client's address. The original listening socket remains open, ready for the next connection. This is the fundamental server pattern: one listening socket, one new stream socket per connection.

**The stream drops at the end of the `Ok` arm:** When `stream` goes out of scope, `TcpStream`'s `Drop` implementation calls `close()` on the fd. The TCP connection is closed. The client receives a TCP FIN packet and knows the server closed the connection. This is why the browser shows a response even before we send anything — it sees the connection close immediately.

---

### SAVE AND TRY

```
cargo run
```

Open your browser, visit `http://localhost:8080`. The browser will show an error (we sent nothing), but your terminal should print:

```
Connection from: 127.0.0.1:54832
```

The port number on the client side (54832) is an **ephemeral port** — a temporary port assigned by the OS to identify this specific client connection. It is different each time you refresh. The server's port (8080) is fixed. The client's port is random.

**Visit the page several times.** Each refresh produces a new "Connection from" line with a different client port. The server keeps running — the `for` loop continues.

**Change something:** Open two browser tabs and visit the server simultaneously. You should see two "Connection from" lines in quick succession. The server handles each connection sequentially for now — one at a time. In Lab 15, threading will make this concurrent.

---

### Step 3 — Define the Request and Response Types

Add the data structures above `main()`. These are the types the parser will produce and the builder will consume:

```rust
use std::net::TcpListener;
use std::collections::HashMap;

// ── HTTP Method ───────────────────────────────────────────────────────────────

#[derive(Debug, PartialEq)]
enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Head,
    Options,
}

impl HttpMethod {
    fn from_str(s: &str) -> Option<HttpMethod> {
        match s {
            "GET"     => Some(HttpMethod::Get),
            "POST"    => Some(HttpMethod::Post),
            "PUT"     => Some(HttpMethod::Put),
            "DELETE"  => Some(HttpMethod::Delete),
            "HEAD"    => Some(HttpMethod::Head),
            "OPTIONS" => Some(HttpMethod::Options),
            _         => None,
        }
    }
}

// ── HTTP Request ──────────────────────────────────────────────────────────────

#[derive(Debug)]
struct HttpRequest {
    method:  HttpMethod,          // GET, POST, etc.
    path:    String,              // /index.html
    version: String,              // HTTP/1.1
    headers: HashMap<String, String>, // Host: localhost, etc.
    body:    Vec<u8>,             // raw request body bytes (empty for GET)
}

// ── HTTP Response ─────────────────────────────────────────────────────────────

struct HttpResponse {
    status_code: u16,             // 200, 404, 500, etc.
    status_text: String,          // "OK", "Not Found", "Internal Server Error"
    headers:     HashMap<String, String>,
    body:        Vec<u8>,         // raw response body bytes
}

impl HttpResponse {

    fn new(status_code: u16, status_text: &str, body: &str) -> HttpResponse {
        let body_bytes = body.as_bytes().to_vec();  // convert &str to Vec<u8>
        let mut headers = HashMap::new();

        headers.insert(
            "Content-Length".to_string(),
            body_bytes.len().to_string()  // critical: tell client how many bytes are coming
        );
        headers.insert(
            "Content-Type".to_string(),
            "text/html; charset=utf-8".to_string()  // we are sending HTML
        );
        headers.insert(
            "Connection".to_string(),
            "close".to_string()  // close TCP connection after this response — simplest correct behavior
        );

        HttpResponse {
            status_code,
            status_text: status_text.to_string(),
            headers,
            body: body_bytes,
        }
    }

    fn to_bytes(&self) -> Vec<u8> {
        // Assemble the complete HTTP response as a sequence of bytes
        let mut response = Vec::new();

        // Status line: "HTTP/1.1 200 OK\r\n"
        let status_line = format!(
            "HTTP/1.1 {} {}\r\n",
            self.status_code,
            self.status_text
        );
        response.extend_from_slice(status_line.as_bytes());
        //        ↑
        //        .extend_from_slice() appends all bytes from a slice to a Vec
        //        more efficient than pushing one byte at a time

        // Headers: "Key: Value\r\n" for each
        for (key, value) in &self.headers {
            let header_line = format!("{}: {}\r\n", key, value);
            response.extend_from_slice(header_line.as_bytes());
        }

        // Blank line: "\r\n" — separates headers from body
        response.extend_from_slice(b"\r\n");
        //                          ↑
        //                          b"\r\n" is a byte string literal — &[u8], not &str
        //                          b"..." creates a byte slice from the ASCII characters

        // Body bytes
        response.extend_from_slice(&self.body);

        response
    }

}
```

**`Vec<u8>` for the body — why not `String`?**

HTTP response bodies can be any bytes: HTML text, binary images, compressed data, raw file content. `Vec<u8>` holds any bytes. `String` requires valid UTF-8. A server that can only send `String` bodies cannot serve images, PDFs, or compressed responses. `Vec<u8>` is the correct type for raw HTTP wire data.

**`b"\r\n"` — byte string literals:**

The `b` prefix before a string literal produces `&[u8]` — a slice of raw bytes — instead of `&str`. `b"\r\n"` is the two bytes `[0x0D, 0x0A]`. It is equivalent to `"\r\n".as_bytes()` but more concise. Byte literals are used whenever you are working with raw binary data rather than text.

---

### SAVE AND TRY

```
cargo build
```

Clean compile. The types are defined but not yet used. Proceed.

---

### Step 4 — Write the HTTP Request Parser

This is the most important function in the server. Add above `main()`, after the type definitions:

```rust
use std::io::{BufRead, BufReader, Read};
//                                ↑
//                                Read trait: provides .read() and .read_exact()
//                                needed for reading the request body

use std::net::TcpStream;

/// Parse an HTTP/1.1 request from a TcpStream.
/// Returns None if the request is malformed or the connection closed.
fn parse_request(stream: &TcpStream) -> Option<HttpRequest> {

    let mut reader = BufReader::new(stream);
    //               ↑
    //               BufReader wraps TcpStream — the same pattern as wrapping File
    //               BufReader borrows stream — stream still owns the fd
    //               This is why we take &TcpStream, not TcpStream: we need to
    //               write back to stream after parsing (writing borrows it mutably)

    // ── Parse the request line ────────────────────────────────────────────────

    let mut request_line = String::new();
    reader.read_line(&mut request_line).ok()?;
    //     ↑                            ↑
    //     .read_line() reads until \n  .ok() converts Result to Option
    //     into request_line            ? returns None if reading failed

    let request_line = request_line.trim();
    //                              ↑
    //                              removes \r\n from the end — HTTP line endings

    if request_line.is_empty() {
        return None;  // empty request line — malformed or connection closed immediately
    }

    // Parse "GET /path HTTP/1.1" into three parts
    let mut parts = request_line.splitn(3, ' ');

    let method_str = parts.next()?;
    let path       = parts.next()?.to_string();
    let version    = parts.next()?.to_string();

    let method = HttpMethod::from_str(method_str)?;
    //                                ↑
    //                                unknown method → None → return None from parse_request

    // Validate: path must start with /, version must be HTTP/
    if !path.starts_with('/') || !version.starts_with("HTTP/") {
        return None;
    }

    // ── Parse headers ─────────────────────────────────────────────────────────

    let mut headers: HashMap<String, String> = HashMap::new();

    loop {
        let mut line = String::new();
        match reader.read_line(&mut line) {
            Ok(0) | Err(_) => break,  // Ok(0) means EOF — connection closed
            Ok(_)          => {}      // bytes read — continue
        }

        let line = line.trim();

        if line.is_empty() {
            break;  // blank line = end of headers
        }

        // Parse "Header-Name: Header-Value"
        if let Some(colon_pos) = line.find(':') {
            //                         ↑
            //                         .find(':') returns Option<usize> — byte position of ':'
            //                         None if ':' is not in the string

            let name  = line[..colon_pos].trim().to_lowercase();
            //                ↑                  ↑
            //                slice up to colon  normalize to lowercase for case-insensitive matching
            let value = line[colon_pos + 1..].trim().to_string();
            //               ↑
            //               slice from after colon to end

            headers.insert(name, value);
        }
        // Lines without ':' are malformed headers — skip silently
    }

    // ── Parse the body (if Content-Length is present) ─────────────────────────

    let body = if let Some(length_str) = headers.get("content-length") {
        //                                                ↑
        //                                                headers are lowercase — remember the .to_lowercase() above

        match length_str.parse::<usize>() {
            Ok(length) if length > 0 => {
                let mut body_bytes = vec![0u8; length];
                //                   ↑
                //                   vec![0u8; length] creates a Vec of `length` zero bytes
                //                   pre-allocates the exact space needed

                reader.read_exact(&mut body_bytes).ok()?;
                //      ↑
                //      .read_exact() reads EXACTLY `length` bytes — or returns Err
                //      Unlike .read() which may return fewer bytes, .read_exact() loops
                //      internally until it has the full count

                body_bytes
            }
            _ => Vec::new(),  // no body or invalid length
        }
    } else {
        Vec::new()  // no Content-Length header → no body
    };

    Some(HttpRequest { method, path, version, headers, body })
}
```

**Why `BufReader::new(stream)` takes `&TcpStream` not `TcpStream`:**

If we moved `stream` into the `BufReader`, the calling code could not use `stream` afterward to write the response. By taking `&TcpStream`, `BufReader` borrows the stream while parsing. After parsing, the `BufReader` is dropped (the borrow ends), and the caller can write to `stream` directly. `TcpStream` implements both `Read` (from a shared reference) and `Write` (from a mutable reference or ownership) — the OS socket supports both directions simultaneously.

**`.find(':')` — finding a character's position:**

`.find(char)` returns `Option<usize>` — the byte index of the first occurrence, or `None`. Combined with slice ranges: `line[..colon_pos]` is everything before the colon; `line[colon_pos + 1..]` is everything after. This is the core of delimiter-based parsing — find the separator, slice around it.

---

### SAVE AND TRY

```
cargo build
```

Clean compile. No tests yet — we need the response writer first.

---

### Step 5 — Write the Response Sender

Add above `main()`:

```rust
use std::io::Write;

fn send_response(stream: &mut TcpStream, response: HttpResponse) {
    let bytes = response.to_bytes();

    match stream.write_all(&bytes) {
        Ok(())  => {}
        Err(e) if e.kind() == std::io::ErrorKind::BrokenPipe => {
            // Client disconnected before we could respond — not an error worth logging
        }
        Err(e) => {
            eprintln!("Error sending response: {}", e);
        }
    }

    // No explicit flush needed — TcpStream::write_all writes directly to the kernel buffer
    // which the OS transmits over the network
    // The TCP stack handles actual transmission timing (Nagle's algorithm, ACKs, etc.)
}
```

**`BrokenPipe` — the most common network error:**

When a client sends a request and then immediately disconnects (browser navigating away, connection timeout, `curl` cancelled), the write end of the socket is closed. Writing to a closed socket produces `SIGPIPE` (which we discussed in Lab 12) or `BrokenPipe` error. This is normal — not every request needs a response. We handle it silently.

**Why no `flush()` on `TcpStream`:**

`TcpStream::write_all()` passes bytes directly to the kernel. The kernel buffers them internally and decides when to send based on TCP's Nagle algorithm (which batches small writes for efficiency). There is no user-space buffer to flush. `flush()` on `TcpStream` is a no-op — it exists to satisfy the `Write` trait interface, but does nothing extra. This is different from `BufWriter<TcpStream>` (which does have a user-space buffer to flush) — we are not using `BufWriter` here.

---

### Step 6 — Write the Request Handler

The handler maps request paths to responses. Add above `main()`:

```rust
fn handle_request(request: &HttpRequest) -> HttpResponse {
    match request.path.as_str() {
        "/" => HttpResponse::new(
            200,
            "OK",
            r#"<!DOCTYPE html>
<html>
<head><title>Rust HTTP Server</title></head>
<body>
  <h1>Hello from Rust!</h1>
  <p>You have reached the home page of your hand-built HTTP server.</p>
  <p>Try visiting <a href="/hello">/hello</a> or <a href="/about">/about</a>.</p>
</body>
</html>"#
        ),

        "/hello" => HttpResponse::new(
            200,
            "OK",
            r#"<!DOCTYPE html>
<html>
<head><title>Hello</title></head>
<body>
  <h1>Hello, World!</h1>
  <p>This page is served by a Rust HTTP server built from scratch.</p>
  <p>No frameworks. No magic. Just TCP sockets and the HTTP protocol.</p>
  <a href="/">← Home</a>
</body>
</html>"#
        ),

        "/about" => HttpResponse::new(
            200,
            "OK",
            r#"<!DOCTYPE html>
<html>
<head><title>About</title></head>
<body>
  <h1>About This Server</h1>
  <p>Built in Rust as part of a web server series.</p>
  <ul>
    <li>TCP socket: <code>std::net::TcpListener</code></li>
    <li>HTTP parsing: hand-written, no dependencies</li>
    <li>Response building: raw byte assembly</li>
  </ul>
  <a href="/">← Home</a>
</body>
</html>"#
        ),

        _ => HttpResponse::new(
            404,
            "Not Found",
            r#"<!DOCTYPE html>
<html>
<head><title>404 Not Found</title></head>
<body>
  <h1>404 — Not Found</h1>
  <p>The page you requested does not exist.</p>
  <a href="/">← Home</a>
</body>
</html>"#
        ),
    }
}
```

**`r#"..."#` — raw string literals:**

The `r#"..."#` syntax is a **raw string literal** — the content between `"` delimiters is taken literally, with no escape sequences. Backslashes are just backslashes. Double quotes inside do not terminate the string. This is ideal for HTML, JSON, and other formats that contain special characters. The `#` characters can be repeated (`r##"..."##`) to allow `"#` inside the string if needed.

---

### Step 7 — Wire the Complete Server Loop

Now wire the full server together. Replace `main()`:

```rust
use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let address = "127.0.0.1:8080";

    let listener = TcpListener::bind(address)
        .expect("Could not bind — is port 8080 already in use?");

    println!("Listening on http://{}", address);
    println!("Press Ctrl+C to stop.");
    println!();

    for stream_result in listener.incoming() {
        let mut stream = match stream_result {
            Ok(s)  => s,
            Err(e) => {
                eprintln!("Connection error: {}", e);
                continue;  // ← continue moves to the next iteration of the for loop
                //             skip this failed connection, accept the next one
            }
        };

        // Parse the incoming HTTP request
        let request = match parse_request(&stream) {
            Some(r) => r,
            None    => {
                // Malformed request — send 400 Bad Request
                send_response(
                    &mut stream,
                    HttpResponse::new(400, "Bad Request",
                        "<html><body><h1>400 Bad Request</h1></body></html>")
                );
                continue;
            }
        };

        // Build the response
        let response = handle_request(&request);

        // Log the request
        let status = response.status_code;
        let body_len = response.body.len();

        println!("[{}] {} {} {} → {} ({} bytes)",
            timestamp(),
            request.method_str(),   // we will add this method below
            request.path,
            request.version,
            status,
            body_len
        );

        // Send the response
        send_response(&mut stream, response);

        // stream drops here → close() called → TCP FIN sent → connection closed
    }
}

fn timestamp() -> String {
    // Simple timestamp for logging — not production-grade
    // Full datetime formatting requires the `chrono` crate (Lab 14)
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format!("t={}", secs)  // just show seconds since epoch for now
}
```

Add `method_str()` to `HttpRequest` — a display method for logging:

```rust
impl HttpRequest {
    fn method_str(&self) -> &str {
        match self.method {
            HttpMethod::Get     => "GET",
            HttpMethod::Post    => "POST",
            HttpMethod::Put     => "PUT",
            HttpMethod::Delete  => "DELETE",
            HttpMethod::Head    => "HEAD",
            HttpMethod::Options => "OPTIONS",
        }
    }
}
```

---

The complete `src/main.rs`. All sections assembled:

```rust
use std::collections::HashMap;
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::time::{SystemTime, UNIX_EPOCH};

// ── Types ─────────────────────────────────────────────────────────────────────

#[derive(Debug, PartialEq)]
enum HttpMethod {
    Get, Post, Put, Delete, Head, Options,
}

impl HttpMethod {
    fn from_str(s: &str) -> Option<HttpMethod> {
        match s {
            "GET"     => Some(HttpMethod::Get),
            "POST"    => Some(HttpMethod::Post),
            "PUT"     => Some(HttpMethod::Put),
            "DELETE"  => Some(HttpMethod::Delete),
            "HEAD"    => Some(HttpMethod::Head),
            "OPTIONS" => Some(HttpMethod::Options),
            _         => None,
        }
    }
}

#[derive(Debug)]
struct HttpRequest {
    method:  HttpMethod,
    path:    String,
    version: String,
    headers: HashMap<String, String>,
    body:    Vec<u8>,
}

impl HttpRequest {
    fn method_str(&self) -> &str {
        match self.method {
            HttpMethod::Get     => "GET",
            HttpMethod::Post    => "POST",
            HttpMethod::Put     => "PUT",
            HttpMethod::Delete  => "DELETE",
            HttpMethod::Head    => "HEAD",
            HttpMethod::Options => "OPTIONS",
        }
    }
}

struct HttpResponse {
    status_code: u16,
    status_text: String,
    headers:     HashMap<String, String>,
    body:        Vec<u8>,
}

impl HttpResponse {
    fn new(status_code: u16, status_text: &str, body: &str) -> HttpResponse {
        let body_bytes = body.as_bytes().to_vec();
        let mut headers = HashMap::new();
        headers.insert("Content-Length".to_string(), body_bytes.len().to_string());
        headers.insert("Content-Type".to_string(), "text/html; charset=utf-8".to_string());
        headers.insert("Connection".to_string(), "close".to_string());
        HttpResponse {
            status_code,
            status_text: status_text.to_string(),
            headers,
            body: body_bytes,
        }
    }

    fn to_bytes(&self) -> Vec<u8> {
        let mut response = Vec::new();
        response.extend_from_slice(
            format!("HTTP/1.1 {} {}\r\n", self.status_code, self.status_text).as_bytes()
        );
        for (key, value) in &self.headers {
            response.extend_from_slice(format!("{}: {}\r\n", key, value).as_bytes());
        }
        response.extend_from_slice(b"\r\n");
        response.extend_from_slice(&self.body);
        response
    }
}

// ── Parser ────────────────────────────────────────────────────────────────────

fn parse_request(stream: &TcpStream) -> Option<HttpRequest> {
    let mut reader = BufReader::new(stream);

    let mut request_line = String::new();
    reader.read_line(&mut request_line).ok()?;
    let request_line = request_line.trim();
    if request_line.is_empty() { return None; }

    let mut parts   = request_line.splitn(3, ' ');
    let method_str  = parts.next()?;
    let path        = parts.next()?.to_string();
    let version     = parts.next()?.to_string();
    let method      = HttpMethod::from_str(method_str)?;

    if !path.starts_with('/') || !version.starts_with("HTTP/") {
        return None;
    }

    let mut headers: HashMap<String, String> = HashMap::new();
    loop {
        let mut line = String::new();
        match reader.read_line(&mut line) {
            Ok(0) | Err(_) => break,
            Ok(_)          => {}
        }
        let line = line.trim();
        if line.is_empty() { break; }

        if let Some(colon_pos) = line.find(':') {
            let name  = line[..colon_pos].trim().to_lowercase();
            let value = line[colon_pos + 1..].trim().to_string();
            headers.insert(name, value);
        }
    }

    let body = if let Some(length_str) = headers.get("content-length") {
        match length_str.parse::<usize>() {
            Ok(length) if length > 0 => {
                let mut body_bytes = vec![0u8; length];
                reader.read_exact(&mut body_bytes).ok()?;
                body_bytes
            }
            _ => Vec::new(),
        }
    } else {
        Vec::new()
    };

    Some(HttpRequest { method, path, version, headers, body })
}

// ── Handler ───────────────────────────────────────────────────────────────────

fn handle_request(request: &HttpRequest) -> HttpResponse {
    match request.path.as_str() {
        "/" => HttpResponse::new(200, "OK", r#"<!DOCTYPE html>
<html>
<head><title>Rust HTTP Server</title></head>
<body>
  <h1>Hello from Rust!</h1>
  <p>You have reached the home page of your hand-built HTTP server.</p>
  <p>Try <a href="/hello">/hello</a> or <a href="/about">/about</a>.</p>
</body>
</html>"#),

        "/hello" => HttpResponse::new(200, "OK", r#"<!DOCTYPE html>
<html>
<head><title>Hello</title></head>
<body>
  <h1>Hello, World!</h1>
  <p>Served by a Rust HTTP server built from scratch — no frameworks.</p>
  <a href="/">← Home</a>
</body>
</html>"#),

        "/about" => HttpResponse::new(200, "OK", r#"<!DOCTYPE html>
<html>
<head><title>About</title></head>
<body>
  <h1>About This Server</h1>
  <p>Built in Rust. TCP sockets. Hand-written HTTP parser. Zero dependencies.</p>
  <a href="/">← Home</a>
</body>
</html>"#),

        _ => HttpResponse::new(404, "Not Found", r#"<!DOCTYPE html>
<html>
<head><title>404</title></head>
<body>
  <h1>404 — Not Found</h1>
  <p>That page does not exist.</p>
  <a href="/">← Home</a>
</body>
</html>"#),
    }
}

// ── Sender ────────────────────────────────────────────────────────────────────

fn send_response(stream: &mut TcpStream, response: HttpResponse) {
    let bytes = response.to_bytes();
    match stream.write_all(&bytes) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::BrokenPipe => {}
        Err(e) => eprintln!("Error sending response: {}", e),
    }
}

// ── Entry point ───────────────────────────────────────────────────────────────

fn timestamp() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format!("t={}", secs)
}

fn main() {
    let address = "127.0.0.1:8080";

    let listener = TcpListener::bind(address)
        .expect("Could not bind — is port 8080 already in use?");

    println!("Listening on http://{}", address);
    println!("Press Ctrl+C to stop.");
    println!();

    for stream_result in listener.incoming() {
        let mut stream = match stream_result {
            Ok(s)  => s,
            Err(e) => { eprintln!("Connection error: {}", e); continue; }
        };

        let request = match parse_request(&stream) {
            Some(r) => r,
            None    => {
                send_response(&mut stream,
                    HttpResponse::new(400, "Bad Request",
                        "<html><body><h1>400 Bad Request</h1></body></html>"));
                continue;
            }
        };

        let response      = handle_request(&request);
        let status        = response.status_code;
        let body_len      = response.body.len();

        println!("[{}] {} {} {} → {} ({} bytes)",
            timestamp(),
            request.method_str(),
            request.path,
            request.version,
            status,
            body_len
        );

        send_response(&mut stream, response);
    }
}
```

---

### SAVE AND TRY

```
cargo run
```

**You should see:**

```
Listening on http://127.0.0.1:8080
Press Ctrl+C to stop.

```

**Open your browser. Visit `http://localhost:8080`.**

You should see a real HTML page: "Hello from Rust!" with links. Your Rust program served it over a real TCP connection using the real HTTP/1.1 protocol.

**Test each route:**
- `http://localhost:8080/` → Home page
- `http://localhost:8080/hello` → Hello page
- `http://localhost:8080/about` → About page
- `http://localhost:8080/nonexistent` → 404 page

**Watch the terminal** as you visit each page. You should see log lines:

```
[t=1705315425] GET / HTTP/1.1 → 200 (312 bytes)
[t=1705315426] GET /hello HTTP/1.1 → 200 (287 bytes)
[t=1705315427] GET /favicon.ico HTTP/1.1 → 404 (198 bytes)
```

The browser automatically requests `/favicon.ico` (the browser tab icon). Your server returns 404 — which is correct. The browser accepts it and shows a default icon.

**Use `curl` to inspect the raw HTTP:**

```bash
curl -v http://localhost:8080/
```

`curl -v` (verbose) shows the raw HTTP exchange — both the request it sends and the exact response bytes it receives, headers and all. You should see your response headers and body exactly as assembled in `to_bytes()`.

**Change something:** Change the `"/"` response body to include your name: `<h1>Hello from Ada's Rust Server!</h1>`. Restart with `cargo run`. Refresh the browser. See the change. Change it back.

---

## 🎯 Challenge: Add a `/time` Endpoint

**You know:** `handle_request`, `HttpResponse::new`, `SystemTime`, `format!`.

**Task:** Add a `/time` endpoint that returns the current Unix timestamp in an HTML page:

```html
<h1>Current Time</h1>
<p>Unix timestamp: 1705315425</p>
<p>That is seconds since January 1, 1970 (UTC).</p>
```

The timestamp must be computed at request time — each refresh shows a different number.

**Hint:** `SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs()` returns a `u64`. Use `format!` to embed it in the HTML string.

Try it before revealing.

---

<details>
<summary>▶ Show Solution</summary>

In `handle_request`, add a new arm before the `_` catch-all:

```rust
"/time" => {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let body = format!(r#"<!DOCTYPE html>
<html>
<head><title>Server Time</title></head>
<body>
  <h1>Current Time</h1>
  <p>Unix timestamp: <strong>{}</strong></p>
  <p>That is seconds since January 1, 1970 (UTC).</p>
  <p><a href="/time">Refresh</a> to see it change.</p>
  <a href="/">← Home</a>
</body>
</html>"#, secs);

    HttpResponse::new(200, "OK", &body)
}
```

**Key insight:** The response body is constructed at request time — `SystemTime::now()` is called inside the handler, not at server startup. Every request to `/time` gets the current time. This is the fundamental property of dynamic web servers: the response is computed from the current state of the world at the moment of the request. Static file servers (Lab 14) serve pre-existing files; dynamic servers (Lab 17+) compute responses. The `/time` endpoint is the simplest possible dynamic endpoint — no input from the request, just the current OS time.

</details>

---

## 🎯 Challenge 2: Parse and Echo Request Headers

**You know:** `HttpRequest.headers`, `HashMap`, `format!`, iterator chains.

**Task:** Add a `/headers` endpoint that responds with an HTML page listing all the request headers it received. The response should look like:

```html
<h1>Your Request Headers</h1>
<table>
  <tr><td>host</td><td>localhost:8080</td></tr>
  <tr><td>user-agent</td><td>Mozilla/5.0 ...</td></tr>
  <tr><td>accept</td><td>text/html,...</td></tr>
</table>
```

The handler needs access to the request's headers. The current `handle_request` signature is `fn handle_request(request: &HttpRequest) -> HttpResponse` — it already has access to `request.headers`.

Build the HTML body as a `String` using `format!` and iterator chains over `&request.headers`.

---

<details>
<summary>▶ Show Solution</summary>

```rust
"/headers" => {
    let rows: String = request.headers
        .iter()
        .map(|(name, value)| {
            format!("  <tr><td><code>{}</code></td><td>{}</td></tr>\n",
                name, value)
        })
        .collect();   // collect Vec<String> into String — works because String implements Extend<String>

    let body = format!(r#"<!DOCTYPE html>
<html>
<head><title>Request Headers</title></head>
<body>
  <h1>Your Request Headers</h1>
  <table border="1" cellpadding="6">
    <tr><th>Header</th><th>Value</th></tr>
{}  </table>
  <a href="/">← Home</a>
</body>
</html>"#, rows);

    HttpResponse::new(200, "OK", &body)
}
```

**Key insight:** The response is built from the request — the handler reads `request.headers` and reflects them back to the client. This is the first true request-driven dynamic response in the series. Every future endpoint — searching a database, serving user-specific data, processing form submissions — follows this same pattern: read from the request, compute a response, return it. The `/headers` endpoint is a useful debugging tool: visit it with different browsers or `curl` and observe how different clients send different headers.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Server starts without error | `cargo run` — no panic, "Listening on..." appears |
| `http://localhost:8080/` returns 200 | Browser shows home page with links |
| `http://localhost:8080/hello` returns 200 | Browser shows hello page |
| `http://localhost:8080/about` returns 200 | Browser shows about page |
| Unknown path returns 404 | `/nonexistent` shows 404 page |
| Malformed request returns 400 | `echo "GARBAGE" \| nc localhost 8080` returns 400 |
| Log line appears per request | Terminal shows method, path, status, size |
| Browser favicon request handled | `/favicon.ico` appears as 404 in log — not a crash |
| `curl -v` shows correct headers | `Content-Type`, `Content-Length`, `Connection` present |
| Server keeps running after 404 | Visit 404 page, then visit `/` — still works |
| `/time` endpoint changes on refresh | Timestamp increases with each visit (challenge) |
| `/headers` shows browser headers | Table of received headers visible (challenge) |

---

## Quick Check Answers

**1. What happens between pressing Enter on `http://localhost:8080/index.html` and the page appearing?**

At least ten distinct steps. The browser parses the URL and extracts the host (`localhost`), port (`8080`), and path (`/index.html`). It resolves `localhost` to `127.0.0.1` via the local hosts file (no DNS query needed for localhost). It creates a TCP socket and calls `connect(127.0.0.1:8080)` — the OS performs the three-way handshake. With the connection established, the browser formats and sends an HTTP/1.1 request: `GET /index.html HTTP/1.1\r\nHost: localhost:8080\r\n...` followed by the blank line. Your server's `accept()` returns the new socket. `parse_request()` reads the request line by line through `BufReader`. `handle_request()` matches the path and constructs an `HttpResponse`. `to_bytes()` assembles the raw bytes. `write_all()` passes them to the OS. The OS transmits them over the loopback interface. The browser receives the bytes, reads the status line and headers, reads exactly `Content-Length` bytes of body, parses the HTML, renders it, and displays the page. The TCP connection closes when `stream` drops.

**2. How does TCP achieve reliability on an unreliable network?**

Four mechanisms working together. Sequence numbers: every byte is numbered, so the receiver can detect missing bytes and reorder out-of-order segments. Acknowledgments: the receiver confirms every byte received; the sender retransmits any byte that is not acknowledged within a timeout. Checksums: each TCP segment includes a checksum over the data; segments that fail the checksum are discarded (and thus not acknowledged, triggering retransmission). Flow control: the receiver tells the sender how much buffer space it has; the sender never exceeds this limit. Together these mechanisms mean that from the perspective of your code, TCP is a reliable, ordered byte stream — bytes you write arrive at the other end in the same order, without gaps, without duplicates. The complexity of achieving this on a packet-switched network where packets can be lost, reordered, and corrupted is entirely hidden by the TCP layer.

**3. What is different and what is the same when reading from a socket vs a file?**

The same: `BufReader` wraps both. `.read_line()` works on both. The `BufRead` trait's interface is identical. Lines are returned as `String`. EOF is detected the same way (`.read_line()` returns `Ok(0)` when the stream closes). The difference: files always have an end that is determined by the filesystem. Sockets have an end only when the client closes the connection — and between sending the request and closing, the client waits for the server's response. This means a server cannot read "until EOF" to get the full request — the client never closes the connection until it gets a response. Instead, HTTP defines explicit delimiters: the blank line terminates the headers, `Content-Length` tells the server how many body bytes to read. The parsing logic must use these delimiters rather than reading until EOF. This is why `parse_request` stops reading at the blank line and reads exactly `Content-Length` body bytes — not "read until the stream closes."
