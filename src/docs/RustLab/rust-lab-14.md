# Rust Web Server — LAB 14 — Routing, File Serving, and Content Types

**Prerequisites:** LAB 01–13. You have a working HTTP/1.1 server that accepts TCP connections, parses requests, and returns hand-written HTML responses. You understand the full request-response cycle.

**What this lab adds:**
- A `Router` struct that maps URL paths to handler functions — the Strategy pattern applied to HTTP
- Serving real files from a directory — reading from disk and sending over the wire
- MIME types and the `Content-Type` header — telling the browser what it received
- Path traversal attacks — the security problem with serving files and how to prevent it
- Query strings — parsing `?key=value` parameters from URLs
- Custom 404, 403, and 500 error pages
- The server now serves a real website: HTML, CSS, and a JSON endpoint — from files on disk

**Time:** 5–7 hours

---

> **Quick Check — try to answer before reading further:**
>
> 1. The Lab 13 server has a `match request.path.as_str()` with arms for `/`, `/hello`, and `/about`. What happens as the server grows to 50 routes? What problems does that create?
> 2. A browser requests `/style.css`. Your server opens the file `www/style.css` and sends it. What if the browser requests `/../../../etc/passwd`? What could go wrong?
> 3. When a browser receives bytes from a server, how does it know whether to render them as HTML, display them as an image, or offer them as a download? Where does that information come from?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the server serves a real multi-page website from files on disk:

```
$ cargo run
Listening on http://127.0.0.1:8080
Press Ctrl+C to stop.

[GET] /              → 200 text/html        (1,024 bytes)
[GET] /style.css     → 200 text/css         (487 bytes)
[GET] /about         → 200 text/html        (892 bytes)
[GET] /api/status    → 200 application/json (89 bytes)
[GET] /api/time      → 200 application/json (41 bytes)
[GET] /image.png     → 200 image/png        (14,302 bytes)
[GET] /secret        → 403 text/html        (201 bytes)
[GET] /missing       → 404 text/html        (198 bytes)
```

Open `http://localhost:8080` in your browser and see a styled HTML page — with CSS loaded from a separate file, served by the same Rust server.

---

## Part 1 — The Router

### Concept: Router — Dispatching Requests to Handlers

**What it is:** A router is a data structure that maps URL paths (and optionally HTTP methods) to handler functions. When a request arrives, the router looks up the path, finds the matching handler, calls it, and returns the response.

**The problem before:**

The Lab 13 `handle_request` function is a single `match` on `request.path.as_str()`. Every route is hardcoded. Adding a new route means editing that function. The function knows about every handler. Every handler lives in the same place as the routing logic. As the number of routes grows, the function grows — with no structure separating routing from handling.

**What it hides:** A router hides the dispatch mechanism from the handler functions. Each handler only knows: "I receive a request, I return a response." It does not know how it was selected, what other routes exist, or how the path was matched. The router is the only place that knows the mapping.

The invariant a router protects: **each request is dispatched to exactly one handler, deterministically, based on the request's properties.** Two requests with the same path always go to the same handler. A path with no registered handler always goes to the 404 handler. There is no ambiguity.

**The Strategy pattern — reappearing:**

The router is the Strategy pattern from Lab 08 applied to HTTP. The routing algorithm (try each registered route, call the first match) is fixed inside the router. The strategies — what to do for each route — are injected as closures or function pointers when routes are registered. The router does not know what `/about` does. The handler registered for `/about` does.

---

### Concept: Function Pointer — A Value That Is a Function

**What it is:** A function pointer is a value that holds the address of a function. You can store it in a variable, pass it to another function, or put it in a data structure — then call the function through the pointer later.

**The syntax:**

```rust
fn add(a: i32, b: i32) -> i32 { a + b }
fn multiply(a: i32, b: i32) -> i32 { a * b }

// A function pointer type: fn(i32, i32) -> i32
let operation: fn(i32, i32) -> i32 = add;
println!("{}", operation(3, 4));   // 7

operation = multiply;
println!("{}", operation(3, 4));   // 12
```

**Function pointer vs closure:**

A function pointer (`fn(Args) -> Ret`) refers to a named function defined with `fn`. It has no captured environment — it is just an address. A closure (`impl Fn(Args) -> Ret`) can capture variables from its surrounding scope.

For the router, handlers are functions that take `&HttpRequest` and return `HttpResponse`. They do not need to capture anything — they receive everything they need through the request parameter. Function pointers are the right tool.

**The handler type:**

```rust
type HandlerFn = fn(&HttpRequest) -> HttpResponse;
//               ↑
//               fn(...) -> ... is the function pointer type
//               type creates an alias — HandlerFn is now a shorter name
//               for fn(&HttpRequest) -> HttpResponse
```

**`type` — Type Alias:**

`type Name = ExistingType` creates an alias — a shorter or more descriptive name for an existing type. `HandlerFn` and `fn(&HttpRequest) -> HttpResponse` are completely interchangeable — the compiler treats them as the same type. Type aliases do not create new types; they just name existing ones. This is different from `struct NewType(ExistingType)` which creates a genuinely new type. Aliases are purely for readability.

---

### Concept: Route Matching — Exact vs Prefix vs Pattern

**What it is:** Route matching is the algorithm for deciding which registered route applies to an incoming request path.

**Three common strategies:**

**Exact match:** `/about` matches only requests for `/about`. Fast — just a string equality check. Used for API endpoints where precision matters.

**Prefix match:** `/api/` matches any path starting with `/api/` — `/api/users`, `/api/posts`, etc. Useful for grouping routes under a namespace.

**Pattern match:** `/users/:id` matches `/users/42`, `/users/alice`, etc. and extracts `id` from the path. Used by frameworks like Axum and Actix. Requires a proper parser.

**For this lab:** Exact match and prefix match. Pattern matching (`:id` style) comes in Lab 17 when we build the REST API.

---

### Step 1 — Define the Router

Continue extending the `http_server` project from Lab 13. Add the type alias and `Router` struct above the existing type definitions:

```rust
// ── Router ────────────────────────────────────────────────────────────────────

/// A function that handles an HTTP request and produces a response.
type HandlerFn = fn(&HttpRequest) -> HttpResponse;

/// A registered route: a path pattern and the handler to call.
struct Route {
    path:         String,      // the path to match — e.g. "/about"
    method:       Option<HttpMethod>, // None = match any method
    handler:      HandlerFn,   // the function to call when this route matches
    exact:        bool,        // true = exact match, false = prefix match
}

/// Maps incoming requests to handler functions.
struct Router {
    routes:          Vec<Route>,       // registered routes, checked in order
    not_found:       HandlerFn,        // called when no route matches (404)
    internal_error:  HandlerFn,        // called when a handler panics (500)
}

impl Router {

    fn new() -> Router {
        Router {
            routes:         Vec::new(),
            not_found:      default_not_found,      // default handlers — defined below
            internal_error: default_internal_error,
        }
    }

    /// Register an exact-match route for any HTTP method.
    fn get(&mut self, path: &str, handler: HandlerFn) -> &mut Router {
        self.routes.push(Route {
            path:    path.to_string(),
            method:  Some(HttpMethod::Get),
            handler,
            exact:   true,
        });
        self  // return &mut self — enables method chaining
    }

    /// Register a prefix-match route (path starts_with).
    fn prefix(&mut self, path: &str, handler: HandlerFn) -> &mut Router {
        self.routes.push(Route {
            path:    path.to_string(),
            method:  None,          // prefix routes match any method
            handler,
            exact:   false,
        });
        self
    }

    /// Set a custom 404 handler.
    fn not_found_handler(&mut self, handler: HandlerFn) -> &mut Router {
        self.not_found = handler;
        self
    }

    /// Dispatch a request: find the first matching route and call its handler.
    fn dispatch(&self, request: &HttpRequest) -> HttpResponse {
        for route in &self.routes {
            // Check method match (if the route specifies one)
            if let Some(ref method) = route.method {
                if *method != request.method {
                    continue;   // wrong method — skip this route
                }
            }

            // Check path match
            let path_matches = if route.exact {
                request.path_without_query() == route.path
                //       ↑ we will add this method to HttpRequest shortly
            } else {
                request.path_without_query().starts_with(&route.path)
            };

            if path_matches {
                return (route.handler)(request);  // call the handler
                //      ↑
                //      (route.handler) is a function pointer
                //      calling it: (fn_ptr)(args)
            }
        }

        // No route matched
        (self.not_found)(request)
    }

}

// Default error handlers — can be overridden
fn default_not_found(_req: &HttpRequest) -> HttpResponse {
    HttpResponse::new(404, "Not Found",
        r#"<!DOCTYPE html>
<html><head><title>404</title></head>
<body><h1>404 — Not Found</h1><p>The page you requested does not exist.</p>
<a href="/">← Home</a></body></html>"#)
}

fn default_internal_error(_req: &HttpRequest) -> HttpResponse {
    HttpResponse::new(500, "Internal Server Error",
        r#"<!DOCTYPE html>
<html><head><title>500</title></head>
<body><h1>500 — Internal Server Error</h1>
<p>Something went wrong. Please try again later.</p></body></html>"#)
}
```

**Why routes are checked in order:**

The `for route in &self.routes` loop checks routes in the order they were registered. The first match wins. This means registration order matters: more specific routes must be registered before less specific ones. Registering `/api/` (prefix) before `/api/status` (exact) would mean `/api/status` is never reached — the prefix catches it first. Registration order is the programmer's responsibility — it is documented behavior, not a bug.

---

### Step 2 — Add `path_without_query` to `HttpRequest`

The URL path can contain a query string: `/search?q=rust&page=2`. The router should match on just `/search`, not the full string including `?`. Add this method to `impl HttpRequest`:

```rust
impl HttpRequest {
    fn method_str(&self) -> &str { /* ... existing ... */ }

    /// Return the path portion of the URL, stripping any query string.
    /// "/search?q=rust" → "/search"
    /// "/about"         → "/about"
    fn path_without_query(&self) -> &str {
        match self.path.find('?') {
            Some(pos) => &self.path[..pos],   // slice up to the '?'
            None      => &self.path,          // no '?' — return the whole path
        }
    }

    /// Return the query string portion, if present.
    /// "/search?q=rust" → Some("q=rust")
    /// "/about"         → None
    fn query_string(&self) -> Option<&str> {
        self.path.find('?').map(|pos| &self.path[pos + 1..])
        //                  ↑
        //                  .map() on Option: if Some(pos), apply the closure
        //                  return Some(&self.path[pos + 1..]) — everything after '?'
        //                  if None, return None
    }
}
```

**Why `&str` return instead of `String`:**

Both methods return slices into `self.path` — no allocation needed. The returned `&str` borrows from `self`, so it lives as long as the `HttpRequest`. This is the zero-cost slice pattern from Lab 09: views into existing data, no copying.

---

### SAVE AND TRY

```
cargo build
```

The router compiles but is not yet wired into `main`. Proceed to the next step — we will wire it after adding more features.

---

## Part 2 — Query String Parsing

### Concept: Query String — URL Parameters

**What it is:** A query string is the portion of a URL after the `?` character. It contains key-value pairs separated by `&`, with each pair separated by `=`:

```
/search?q=rust+programming&page=2&sort=date
         ↑                  ↑      ↑
         q = "rust programming"   page = "2"   sort = "date"
```

**URL encoding:**

Some characters are not allowed in URLs (spaces, `&`, `=`, `/`, non-ASCII). They are **percent-encoded** — replaced with `%XX` where `XX` is the hexadecimal byte value:

```
space → %20  (or + in query strings — historical convention)
&     → %26
=     → %3D
/     → %2F
é     → %C3%A9  (UTF-8 bytes, percent-encoded)
```

For this lab, we handle the `+` → space convention and skip full percent-decoding (which comes in Lab 17 with a proper URL parser).

**Query string grammar:**

```
query  = pair ('&' pair)*
pair   = key '=' value | key          (value-less keys are boolean flags)
key    = [^=&]+
value  = [^&]*
```

### Step 3 — Write the Query String Parser

Add above `main()`:

```rust
/// Parse a query string into a HashMap of key → value pairs.
/// "q=rust&page=2" → {"q": "rust", "page": "2"}
/// "verbose" → {"verbose": ""}  (key with no value)
fn parse_query_string(query: &str) -> HashMap<String, String> {
    let mut params = HashMap::new();

    if query.is_empty() {
        return params;
    }

    for pair in query.split('&') {
        //                ↑
        //                split on '&' to get individual key=value pairs

        if pair.is_empty() {
            continue;   // "a=1&&b=2" has an empty pair between the &&
        }

        match pair.find('=') {
            Some(eq_pos) => {
                let key   = decode_url_component(&pair[..eq_pos]);
                let value = decode_url_component(&pair[eq_pos + 1..]);
                params.insert(key, value);
            }
            None => {
                // Key with no value — treat as boolean flag with empty value
                params.insert(decode_url_component(pair), String::new());
            }
        }
    }

    params
}

/// Minimal URL component decoder: converts '+' to space.
/// Full percent-decoding comes in Lab 17.
fn decode_url_component(s: &str) -> String {
    s.replace('+', " ")   // '+' in query strings means space (historical convention)
}
```

**`s.replace('+', " ")`:**

`.replace(pattern, replacement)` returns a new `String` with all occurrences of `pattern` replaced. The first argument can be a `char`, a `&str`, or a closure — here we use a `char` (`'+'`). This is an O(n) scan of the string, allocating a new `String` only if any replacements are made. For ASCII-heavy query strings, this is efficient.

---

### SAVE AND TRY

Add a quick test call in `main()` temporarily:

```rust
let params = parse_query_string("q=rust+programming&page=2");
println!("{:?}", params);
```

```
cargo run
```

**You should see:**

```
{"q": "rust programming", "page": "2"}
```

Remove the test call. Query string parsing works.

---

## Part 3 — MIME Types and File Serving

### Concept: MIME Type — Telling the Browser What It Received

**What it is:** A MIME type (Multipurpose Internet Mail Extensions) is a string that identifies the format of the data in an HTTP response body. It tells the browser whether to render the bytes as HTML, display them as an image, play them as audio, or offer them as a download.

**The format:** `type/subtype` — optionally followed by parameters:

```
text/html; charset=utf-8
text/css
application/json
image/png
image/jpeg
application/pdf
application/octet-stream    ← generic "binary data" — browser offers download
```

**Why it matters:**

The browser does not look at file extensions to decide how to display content — it looks at `Content-Type`. If you send HTML bytes with `Content-Type: application/octet-stream`, the browser offers a download instead of rendering. If you send JSON with `Content-Type: text/html`, the browser tries to render it as a webpage. Getting `Content-Type` wrong is one of the most common bugs in web servers.

**Security implication — MIME sniffing:**

Some old browsers (and IE in particular) would "sniff" the content — examine the bytes and guess the type, ignoring `Content-Type`. This created security vulnerabilities: an attacker could upload an image containing HTML, and the browser might render it as HTML (executing scripts). The `X-Content-Type-Options: nosniff` response header tells browsers not to sniff — trust only `Content-Type`. Your server will send this header.

### Concept: File Extension to MIME Type Mapping

**What it is:** A lookup table that maps a file's extension to its MIME type.

**Your server's mapping table:**

```rust
fn mime_type(path: &str) -> &'static str {
    //                        ↑
    //                        &'static str — these strings are baked into the binary
    //                        they live forever — 'static lifetime

    let ext = path.rsplit('.').next().unwrap_or("").to_ascii_lowercase();
    //             ↑
    //             .rsplit('.') splits from the RIGHT — gives the extension first
    //             .next() gets just the extension part — "html" from "index.html"
    //             .unwrap_or("") handles files with no extension
    //             .to_ascii_lowercase() normalizes "HTML" == "html"

    match ext.as_str() {
        "html" | "htm"  => "text/html; charset=utf-8",
        "css"           => "text/css; charset=utf-8",
        "js"            => "application/javascript; charset=utf-8",
        "json"          => "application/json; charset=utf-8",
        "png"           => "image/png",
        "jpg" | "jpeg"  => "image/jpeg",
        "gif"           => "image/gif",
        "svg"           => "image/svg+xml",
        "ico"           => "image/x-icon",
        "txt"           => "text/plain; charset=utf-8",
        "pdf"           => "application/pdf",
        "wasm"          => "application/wasm",
        _               => "application/octet-stream",  // unknown — browser will download
    }
}
```

**`.rsplit('.')` — splitting from the right:**

`.rsplit(pattern)` splits a string from the right instead of the left. For `"archive.tar.gz"`, `.split('.')` produces `["archive", "tar", "gz"]` but `.rsplit('.')` produces `["gz", "tar", "archive"]`. Taking `.next()` from `.rsplit('.')` gives the last component — the actual extension. This correctly handles filenames with multiple dots.

---

### Concept: Path Traversal Attack — The Security Hole in File Serving

**What it is:** A path traversal attack (also called directory traversal) is when an attacker crafts a URL containing `..` components that navigate outside the intended directory.

**The attack:**

```
Intended: serve files from /var/www/html/
Request:  GET /../../../etc/passwd HTTP/1.1
Resolved: /var/www/html/../../../etc/passwd
        = /etc/passwd
Result:   server sends the system's password file to the attacker
```

**Why this is critical:**

If your server simply joins the web root path with the URL path, any `..` in the URL can navigate to parent directories. A malicious user could read config files, private keys, database files — anything the server process has read access to.

**The fix — canonicalization:**

Before opening any file, resolve the full absolute path and verify it starts with the web root:

```rust
use std::path::{Path, PathBuf};

fn safe_path(web_root: &Path, url_path: &str) -> Option<PathBuf> {
    // Step 1: strip the leading '/' and join with web root
    let relative = url_path.trim_start_matches('/');
    let joined   = web_root.join(relative);

    // Step 2: canonicalize — resolve all '..' and symlinks to an absolute path
    let canonical = joined.canonicalize().ok()?;
    //              ↑
    //              .canonicalize() resolves the path fully — returns Err if it does not exist
    //              "/../../../etc/passwd" canonicalizes to "/etc/passwd"
    //              we check below whether that is inside web_root

    // Step 3: verify the canonical path starts with the web root
    let canonical_root = web_root.canonicalize().ok()?;

    if canonical.starts_with(&canonical_root) {
        Some(canonical)  // safe — inside the web root
    } else {
        None             // attack detected — outside the web root
    }
}
```

**`Path` and `PathBuf`:**

`Path` is the unsized, borrowed path type — like `str` for strings. `PathBuf` is the owned, growable path type — like `String`. `Path::join(component)` appends a path component (handling platform separators). `PathBuf::canonicalize()` resolves the full absolute path by asking the OS — it actually reads the filesystem to follow symlinks and resolve `..` components.

**Why `.canonicalize()` is the right tool:**

String manipulation alone (`path.replace("../", "")`) can be bypassed: `..%2F` (URL-encoded slash), `....//` (double dots), `%2e%2e%2f` — attackers have invented dozens of encoding tricks to bypass naive string checks. `.canonicalize()` asks the OS to resolve the path, which cannot be tricked by encoding — the OS always produces one canonical path.

---

### Step 4 — Write the File Handler

Add the file serving infrastructure:

```rust
use std::fs;
use std::path::{Path, PathBuf};

/// Resolve a URL path to a safe filesystem path within the web root.
/// Returns None if the path is outside the web root (attack) or does not exist.
fn safe_path(web_root: &Path, url_path: &str) -> Option<PathBuf> {
    let relative      = url_path.trim_start_matches('/');

    // If the relative path is empty, serve index.html
    let relative      = if relative.is_empty() { "index.html" } else { relative };

    let joined        = web_root.join(relative);
    let canonical     = joined.canonicalize().ok()?;
    let canonical_root = web_root.canonicalize().ok()?;

    if canonical.starts_with(&canonical_root) {
        Some(canonical)
    } else {
        None  // path traversal attempt
    }
}

/// Serve a file from the web root directory.
/// Returns the appropriate HTTP response including correct Content-Type.
fn serve_file(web_root: &Path, url_path: &str) -> HttpResponse {
    match safe_path(web_root, url_path) {
        None => {
            // Either path traversal or file does not exist
            // We return 404 for both — do not reveal which, to avoid information leakage
            default_not_found(&HttpRequest::empty())
            //                  ↑ we will add HttpRequest::empty() below
        }
        Some(path) => {
            // Check it is a regular file — not a directory or device
            if !path.is_file() {
                return default_not_found(&HttpRequest::empty());
            }

            // Read the file into a Vec<u8>
            match fs::read(&path) {
                Err(e) if e.kind() == std::io::ErrorKind::PermissionDenied => {
                    // File exists but we cannot read it — 403 Forbidden
                    HttpResponse::new(403, "Forbidden",
                        "<html><body><h1>403 — Forbidden</h1></body></html>")
                }
                Err(_) => {
                    // Other read error — 500
                    default_internal_error(&HttpRequest::empty())
                }
                Ok(bytes) => {
                    // Determine the MIME type from the file extension
                    let content_type = mime_type(
                        path.to_str().unwrap_or("")
                    );

                    // Build a response with the file's bytes as the body
                    let mut response = HttpResponse::new_raw(
                        200, "OK", bytes, content_type
                    );

                    // Security header: prevent MIME sniffing
                    response.headers.insert(
                        "X-Content-Type-Options".to_string(),
                        "nosniff".to_string()
                    );

                    response
                }
            }
        }
    }
}
```

**`fs::read(&path)` — reading a whole file into `Vec<u8>`:**

`std::fs::read(path)` reads the entire file into a `Vec<u8>`. It is equivalent to `File::open` + `BufReader` + reading all bytes — but in one call. Use it when you need the entire file in memory (serving files over HTTP). For large files or streaming, use `BufReader` with chunked transfer encoding (Lab 17). For our current server with `Content-Length`, we need the full body in memory anyway to know the size.

Add `HttpResponse::new_raw` to `impl HttpResponse` — a constructor that accepts raw bytes and a custom content type:

```rust
impl HttpResponse {
    fn new(status_code: u16, status_text: &str, body: &str) -> HttpResponse {
        /* ... existing ... */
    }

    /// Create a response with a raw byte body and explicit content type.
    fn new_raw(
        status_code:  u16,
        status_text:  &str,
        body:         Vec<u8>,
        content_type: &str,
    ) -> HttpResponse {
        let mut headers = HashMap::new();
        headers.insert("Content-Length".to_string(), body.len().to_string());
        headers.insert("Content-Type".to_string(), content_type.to_string());
        headers.insert("Connection".to_string(), "close".to_string());
        headers.insert("X-Content-Type-Options".to_string(), "nosniff".to_string());

        HttpResponse {
            status_code,
            status_text: status_text.to_string(),
            headers,
            body,
        }
    }

    fn to_bytes(&self) -> Vec<u8> { /* ... existing ... */ }
}
```

Add `HttpRequest::empty()` — a minimal request for calling handlers that do not use the request:

```rust
impl HttpRequest {
    fn method_str(&self) -> &str { /* ... existing ... */ }
    fn path_without_query(&self) -> &str { /* ... existing ... */ }
    fn query_string(&self) -> Option<&str> { /* ... existing ... */ }

    /// Create an empty request — used when calling error handlers that ignore the request.
    fn empty() -> HttpRequest {
        HttpRequest {
            method:  HttpMethod::Get,
            path:    String::new(),
            version: String::from("HTTP/1.1"),
            headers: HashMap::new(),
            body:    Vec::new(),
        }
    }
}
```

---

### SAVE AND TRY

```
cargo build
```

Clean compile. We have not yet created the web root or wired the router — do that next.

---

## Part 4 — Creating the Website

### Step 5 — Create the Web Root Directory

Create a `www/` directory inside the project (next to `Cargo.toml`):

```
mkdir www
```

Create `www/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Rust HTTP Server</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/api/status">API Status</a>
  </nav>
  <main>
    <h1>Hello from Rust!</h1>
    <p>
      This page is served by a hand-built HTTP/1.1 server written in Rust.
      No frameworks. No dependencies. Just TCP sockets and the HTTP protocol.
    </p>
    <p>
      The CSS on this page is loaded from a separate file —
      <code>/style.css</code> — served by the same server.
    </p>
    <h2>Try these endpoints:</h2>
    <ul>
      <li><a href="/about">/about</a> — About this server</li>
      <li><a href="/api/status">/api/status</a> — Server status (JSON)</li>
      <li><a href="/api/time">/api/time</a> — Current time (JSON)</li>
      <li><a href="/search?q=rust">/search?q=rust</a> — Query string demo</li>
    </ul>
  </main>
</body>
</html>
```

Create `www/style.css`:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #fafafa;
}

nav {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

nav a {
  text-decoration: none;
  color: #0066cc;
  font-weight: 500;
}

nav a:hover { text-decoration: underline; }

h1 { color: #cc3300; margin-bottom: 1rem; font-size: 2rem; }
h2 { margin: 1.5rem 0 0.75rem; color: #444; }

p   { margin-bottom: 1rem; }
ul  { margin-left: 1.5rem; }
li  { margin-bottom: 0.4rem; }

code {
  background: #f0f0f0;
  padding: 0.15em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

a { color: #0066cc; }
```

Create `www/about.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>About — Rust HTTP Server</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/api/status">API Status</a>
  </nav>
  <main>
    <h1>About This Server</h1>
    <p>Built in Rust as part of a web server series.</p>
    <h2>Technical Details</h2>
    <ul>
      <li>Language: Rust (no async — synchronous, single-threaded)</li>
      <li>Transport: TCP via <code>std::net::TcpListener</code></li>
      <li>Protocol: HTTP/1.1 — hand-written parser</li>
      <li>File serving: <code>std::fs::read</code> with path traversal protection</li>
      <li>Routing: custom <code>Router</code> struct with exact and prefix matching</li>
    </ul>
    <p><a href="/">← Home</a></p>
  </main>
</body>
</html>
```

---

### Step 6 — Wire the Router and Handler Functions

Now write the route handlers and wire everything into `main()`. Replace `handle_request` and `main()`:

```rust
use std::time::{SystemTime, UNIX_EPOCH};

// ── Route handlers ────────────────────────────────────────────────────────────

/// Serve files from the www/ directory.
/// This handler is used for prefix "/" — catches everything not matched earlier.
fn handle_static(request: &HttpRequest) -> HttpResponse {
    let web_root = Path::new("www");
    serve_file(web_root, request.path_without_query())
}

/// Serve index.html for the root path explicitly.
fn handle_home(request: &HttpRequest) -> HttpResponse {
    let web_root = Path::new("www");
    serve_file(web_root, "/index.html")
}

/// API endpoint: server status as JSON.
fn handle_api_status(_request: &HttpRequest) -> HttpResponse {
    let uptime = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let json = format!(
        r#"{{"status":"ok","uptime_epoch":{},"version":"0.1.0"}}"#,
        uptime
    );
    //  ↑
    //  r#"..."# raw string — no escape needed for "
    //  {{ and }} are escaped braces in format! — produce literal { and }
    //  In format! strings, { starts a placeholder and } ends it
    //  To get a literal brace, double it: {{ → {  and  }} → }

    HttpResponse::new_raw(200, "OK", json.into_bytes(), "application/json")
    //                                   ↑
    //                                   .into_bytes() converts String to Vec<u8>
    //                                   — takes ownership, no allocation
}

/// API endpoint: current time as JSON.
fn handle_api_time(_request: &HttpRequest) -> HttpResponse {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let json = format!(r#"{{"unix_timestamp":{}}}"#, secs);
    HttpResponse::new_raw(200, "OK", json.into_bytes(), "application/json")
}

/// Demo handler: echo the query string parameters.
fn handle_search(request: &HttpRequest) -> HttpResponse {
    let params = match request.query_string() {
        Some(qs) => parse_query_string(qs),
        None     => HashMap::new(),
    };

    let query = params.get("q").map(|s| s.as_str()).unwrap_or("(none)");
    //                          ↑
    //                          HashMap::get returns Option<&String>
    //                          .map(|s| s.as_str()) converts Option<&String> to Option<&str>

    let body = format!(r#"<!DOCTYPE html>
<html>
<head><title>Search</title><link rel="stylesheet" href="/style.css"></head>
<body>
  <nav><a href="/">Home</a></nav>
  <main>
    <h1>Search Results</h1>
    <p>You searched for: <strong>{}</strong></p>
    <p>Query string: <code>{}</code></p>
    <p>All parameters: <code>{:?}</code></p>
  </main>
</body>
</html>"#,
        query,
        request.query_string().unwrap_or("(none)"),
        params
    );

    HttpResponse::new(200, "OK", &body)
}

// ── Main ──────────────────────────────────────────────────────────────────────

fn main() {
    let address = "127.0.0.1:8080";

    let listener = TcpListener::bind(address)
        .expect("Could not bind — is port 8080 already in use?");

    // Verify the www/ directory exists before starting
    if !Path::new("www").is_dir() {
        eprintln!("Error: 'www' directory not found.");
        eprintln!("Create it and add index.html before starting the server.");
        std::process::exit(1);
    }

    // Build the router
    let mut router = Router::new();
    router
        .get("/",           handle_home)      // exact: root → index.html
        .get("/about",      handle_static)    // exact: /about → www/about.html
        .get("/search",     handle_search)    // exact: /search?q=... → search handler
        .get("/api/status", handle_api_status)// exact: JSON status
        .get("/api/time",   handle_api_time)  // exact: JSON time
        .prefix("/",        handle_static);   // prefix: everything else → static files
    //   ↑
    //   The prefix "/" catches anything not matched by earlier exact routes.
    //   Because exact routes are registered first and checked first, they take
    //   priority. The prefix "/" is the fallback for all remaining paths —
    //   including /style.css, /favicon.ico, and any other static files.

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

        let response = router.dispatch(&request);

        // Log the request
        let content_type = response.headers
            .get("Content-Type")
            .map(|s| s.as_str())
            .unwrap_or("unknown");

        println!("[{}] {} {} → {} {} ({} bytes)",
            timestamp(),
            request.method_str(),
            request.path,
            response.status_code,
            content_type,
            response.body.len()
        );

        send_response(&mut stream, response);
    }
}

fn timestamp() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format!("t={}", secs)
}
```

**`{{` and `}}` in `format!` strings:**

In `format!`, curly braces `{` and `}` mark format placeholders. To include a literal brace in the output, double it: `{{` produces `{` and `}}` produces `}`. So `format!(r#"{{"key":"value"}}"#)` produces the JSON string `{"key":"value"}`. This is only relevant inside `format!` and related macros — in regular string literals, braces are just braces.

**`.into_bytes()`:**

`String::into_bytes()` consumes the `String` and returns its underlying `Vec<u8>` — zero allocation, zero copying. The `String` is moved into its byte representation. Use `.into_bytes()` when you are done with the `String` as text and need its bytes. Use `.as_bytes()` when you want a `&[u8]` slice and need to keep the `String`.

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

You should see a styled page — "Hello from Rust!" with a navigation bar, styled links, and a proper font. The CSS is loaded from `/style.css`, served by the same Rust process through the prefix router.

**Test every route:**
- `http://localhost:8080/` → styled home page
- `http://localhost:8080/about` → about page with the same styling
- `http://localhost:8080/api/status` → browser shows raw JSON: `{"status":"ok",...}`
- `http://localhost:8080/api/time` → JSON with current timestamp
- `http://localhost:8080/search?q=rust+programming` → search echo page
- `http://localhost:8080/style.css` → browser shows the raw CSS text
- `http://localhost:8080/nonexistent` → 404 page

**Watch the terminal log:**

```
[t=...] GET /              → 200 text/html; charset=utf-8 (1024 bytes)
[t=...] GET /style.css     → 200 text/css; charset=utf-8 (487 bytes)
[t=...] GET /favicon.ico   → 404 text/html; charset=utf-8 (198 bytes)
[t=...] GET /api/status    → 200 application/json (89 bytes)
```

The browser automatically requests `/style.css` after loading the HTML — observe both requests in the log. The browser also requests `/favicon.ico` — your server returns 404, which is correct.

**Use `curl` to inspect the raw response:**

```bash
curl -v http://localhost:8080/api/status
```

You should see the response headers including `Content-Type: application/json` and `X-Content-Type-Options: nosniff`.

**Test path traversal protection:**

```bash
curl http://localhost:8080/../../../etc/passwd
```

You should get a 404 response. The `safe_path` function rejected the traversal attempt. On Linux, also try:

```bash
curl http://localhost:8080/%2e%2e%2f%2e%2e%2fetc/passwd
```

Still 404 — `.canonicalize()` handles encoded paths because the OS resolves the actual path.

**Change something:** Add a new page `www/contact.html` with any HTML content. Visit `http://localhost:8080/contact.html`. It should be served automatically — no code change needed. The prefix "/" router passes it to `handle_static` which calls `serve_file`. This is the power of file-based routing: adding a file adds a route.

---

## 🎯 Challenge: Add a Redirect Handler

**You know:** `HttpResponse`, the router, handler functions, `HashMap`.

**Task:** HTTP redirects work by sending a `301` or `302` response with a `Location` header. The browser automatically follows the redirect to the new URL.

```
HTTP/1.1 301 Moved Permanently\r\n
Location: /about\r\n
Content-Length: 0\r\n
\r\n
```

Write a handler `handle_redirect_to_about` that returns a `301 Moved Permanently` response redirecting `/old-about` to `/about`. Register it in the router.

Test with:

```bash
curl -v http://localhost:8080/old-about
```

You should see the `301` response with the `Location` header. Then:

```bash
curl -L http://localhost:8080/old-about
```

The `-L` flag tells curl to follow redirects — you should see the `/about` page content.

**Hint:** `HttpResponse::new_raw` takes a `Vec<u8>` body — for a redirect, the body is empty: `Vec::new()`. You need to insert the `Location` header into the response's `headers` map after constructing it.

---

<details>
<summary>▶ Show Solution</summary>

```rust
fn handle_redirect_to_about(_request: &HttpRequest) -> HttpResponse {
    let mut response = HttpResponse::new_raw(
        301,
        "Moved Permanently",
        Vec::new(),              // empty body — redirect has no content
        "text/plain",           // content-type irrelevant for empty body
    );
    response.headers.insert(
        "Location".to_string(),
        "/about".to_string(),   // where the browser should go
    );
    // Content-Length is already 0 from new_raw(Vec::new())
    response
}
```

In `main()`, register before the prefix route:

```rust
router
    .get("/old-about", handle_redirect_to_about)
    // ... other routes ...
    .prefix("/", handle_static);
```

**Key insight:** A redirect is just a response with a specific status code and a `Location` header. The browser does the work — it reads the `Location` header and makes a new GET request to that URL. The server sends nothing but the headers. This is how all redirects work: `301` (permanent — browser caches it), `302` (temporary — browser always re-checks), `307` (temporary, preserves method), `308` (permanent, preserves method). The web server you are building handles all of them identically — just a different status code and a `Location` header.

</details>

---

## 🎯 Challenge 2: Add a POST Handler

**You know:** `HttpMethod`, `Router`, `HttpRequest.body`, `Vec<u8>`, `parse_query_string`.

**Task:** Add a `POST /echo` endpoint that reads the request body, interprets it as a URL-encoded form (`key=value&key2=value2` — the format HTML forms use by default), and echoes the parsed parameters back as a JSON response.

An HTML form sends data like this:

```
POST /echo HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Content-Length: 19

name=Ada&language=Rust
```

The body (`name=Ada&language=Rust`) has exactly the same format as a query string.

To add a POST route to the router, add a `post` method to `Router`:

```rust
fn post(&mut self, path: &str, handler: HandlerFn) -> &mut Router {
    self.routes.push(Route {
        path:    path.to_string(),
        method:  Some(HttpMethod::Post),
        handler,
        exact:   true,
    });
    self
}
```

Test with:

```bash
curl -X POST -d "name=Ada&language=Rust" http://localhost:8080/echo
```

Expected response:

```json
{"name":"Ada","language":"Rust"}
```

---

<details>
<summary>▶ Show Solution</summary>

```rust
fn handle_echo(request: &HttpRequest) -> HttpResponse {
    // Parse the body as URL-encoded form data (same format as query strings)
    let body_str = String::from_utf8_lossy(&request.body);
    let params   = parse_query_string(&body_str);

    // Build a JSON object from the parsed parameters
    let json_fields: Vec<String> = params.iter()
        .map(|(k, v)| format!(r#""{}":{:?}"#, k, v))
        //                               ↑
        //                               {:?} on a &str adds surrounding quotes
        //                               and escapes any special characters inside
        //                               — not a full JSON encoder, but works for
        //                               simple ASCII values
        .collect();

    let json = format!("{{{}}}", json_fields.join(","));

    HttpResponse::new_raw(200, "OK", json.into_bytes(), "application/json")
}
```

Register in `main()`:

```rust
router
    .get("/",           handle_home)
    .post("/echo",      handle_echo)   // ← add this
    // ... other routes ...
```

**Key insight:** HTTP method and path together define a route — `/echo` for GET and `/echo` for POST are different routes that can do different things. REST API design formalizes this: `GET /users` lists users; `POST /users` creates one; `PUT /users/42` updates user 42; `DELETE /users/42` deletes them. The same path, four different behaviors, four different handlers. The router dispatches based on both method and path. This is the design you will implement fully in Lab 17 when building the REST API layer.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Home page loads with CSS styling | `http://localhost:8080` — styled page with nav |
| CSS served with correct Content-Type | Log shows `text/css` for `/style.css` |
| `/about` serves `www/about.html` | About page appears with nav and styling |
| `/api/status` returns JSON | Browser shows `{"status":"ok",...}` |
| `/api/time` changes each request | Refresh — timestamp increments |
| `/search?q=rust` echoes query | Query parameter visible in response |
| Unknown path returns 404 | `/nonexistent` → 404 page |
| Path traversal blocked | `/../../../etc/passwd` → 404, not file contents |
| `X-Content-Type-Options` header set | `curl -v` shows the header |
| New file auto-served | Add `www/test.html` — visit it — no code change |
| Redirect works (challenge) | `curl -L /old-about` follows to `/about` |
| POST /echo works (challenge) | `curl -X POST -d "name=Ada" /echo` → JSON |

---

## Quick Check Answers

**1. What problems arise from a `match request.path.as_str()` growing to 50 routes?**

Three interconnected problems. First, the function becomes a wall of arms — impossible to read, navigate, or reason about as a unit. Adding a route means finding the right place in a 200-line match statement. Second, all routes are equally visible to each other — a handler for `/admin` and a handler for `/favicon.ico` live in the same function, even though they have nothing to do with each other. Third, there is no structure enforcing routing rules. Two arms could accidentally overlap. A handler could be accidentally shadowed by an earlier arm. The router fixes all three: routes are registered data, checked in defined order, with explicit priority rules. Each handler is a separate function that only knows about its own job. The routing logic lives in one place — `Router::dispatch` — and every route benefit from the same matching rules automatically.

**2. What could go wrong if the server opens files by joining the web root with the URL path without validation?**

An attacker requests `GET /../../../etc/passwd HTTP/1.1`. The server joins `www/` with `/../../../etc/passwd`, producing `www/../../../etc/passwd`. The OS resolves this to `/etc/passwd` — completely outside the `www/` directory. The server reads `/etc/passwd` and sends it to the attacker. On a Linux system, this file contains usernames and (historically) password hashes — useful for further attacks. More severe: `/etc/shadow` (actual password hashes), `/home/user/.ssh/id_rsa` (private SSH key), or application config files containing database passwords or API keys. The `safe_path` function prevents this by canonicalizing the full path and verifying it begins with the canonicalized web root — any `..` sequences are resolved by the OS before the check, so encoding tricks cannot bypass it.

**3. How does the browser know whether to render bytes as HTML, display them as an image, or offer a download?**

The `Content-Type` header in the HTTP response. The browser reads this header before processing the body — it tells the browser the MIME type of the data: `text/html` means render as a webpage, `image/png` means display as an image, `application/pdf` means hand to the PDF viewer plugin, `application/octet-stream` means unknown binary — offer a download dialog. The browser does not rely on file extensions at all (though it may use them as a fallback hint). Getting `Content-Type` wrong produces incorrect behavior: sending an image with `text/html` causes the browser to display the raw bytes as text; sending HTML with `application/octet-stream` causes the browser to offer a download instead of rendering the page. The `X-Content-Type-Options: nosniff` header additionally tells the browser not to override the declared type by examining the bytes — preventing a class of security vulnerabilities where malicious content is disguised as a safe type.
