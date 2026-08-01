# Lesson 1: Speaking HTTP

**What you will build:** a C++ program that listens on a port, accepts a `POST /evaluate`
HTTP request, pulls the raw text out of its body, and echoes it back as a valid HTTP
response — verified with `curl`. The transferable problem this lesson is actually about:
how a running program becomes reachable over a network at all, and how "text arrives" turns
into "a function gets called." Nothing here computes math yet — that's Lesson 2's job on
purpose, so this lesson isn't secretly two lessons wearing one trench coat.

**What you need to know first:** nothing from this curriculum — this is Lesson 1. From
Python, you already know functions, strings, and loops; you do not yet know that C++ is
compiled, that it has no built-in HTTP support, or what a socket is. All three get taught
below.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → ... → HTTP Response
      ▲
      └── this lesson lives entirely here — everything after "HTTP Request" is untouched
          until Lesson 2. The concrete value carried through this lesson is the body text
          "42", which arrives, and leaves, completely unchanged.
```

---

## A choice made before any code: raw sockets, not a library

Doc: real HTTP servers are almost always built on a library (doc1 says "sockets **or** an
HTTP library"). This curriculum uses raw POSIX sockets instead, for one concrete reason: no
external dependency needs to be fetched or installed, so the project stays buildable with
nothing but `g++`. The tradeoff, honestly: a library like `cpp-httplib` would handle
malformed requests, chunked encoding, and keep-alive correctly, and production code should
almost always prefer that over hand-rolled parsing. This project's HTTP layer will stay
deliberately naive — it only ever needs to understand requests this project itself sends it
— and that's a real limitation you're choosing, not one you don't know about.

---

## Concept Unit 1: Compiling — a program that doesn't run itself

### The Problem

In Python, `python3 script.py` reads and runs your code in one step. C++ doesn't work that
way, and the entire rest of this project assumes you're comfortable with the two-step
version: turn source code into a program, then run that program.

### The New Code — type it yourself

```cpp
#include <iostream>

int main() {
    std::cout << "hello from the math engine\n";
    return 0;
}
```

### Commands needed

```
g++ -std=c++17 -Wall -o hello hello.cpp
./hello
```

- `g++` — the GNU C++ compiler. It reads `hello.cpp` and produces a standalone binary.
- `-std=c++17` — which version of the C++ language rules to compile against. This project
  pins one version explicitly rather than trusting whatever the compiler defaults to.
- `-Wall` — turn on the compiler's full set of warnings. Not treated as errors yet, but
  worth seeing from the first command onward.
- `-o hello` — name the output binary `hello`. Without it, `g++` names the binary `a.out`.
- `./hello` — run the binary. This is a separate step from compiling — `g++` alone never
  executes your code, it only translates it.

### Run it. Real output.

```
$ g++ -std=c++17 -Wall -o hello hello.cpp
$ ./hello
hello from the math engine
```

### Mechanical walkthrough

- `#include <iostream>` — **(a) first appearance.** Pulls in the declarations for
  `std::cout` and friends. C++ has no automatic access to I/O the way Python's `print` is
  always available — you explicitly import the piece of the standard library you need,
  every time.
- `int main()` — **(a) first appearance.** Every C++ program has exactly one `main`
  function, and the operating system calls it to start the program — there is no
  "top-level script body" the way there is in a Python file; `main` *is* the entry point,
  by name, always.
- `std::cout << "..."` — **(a) first appearance.** `std::cout` is the standard output
  stream; `<<` here is the *stream insertion operator*, sending the string into that
  stream. It looks like a bit-shift because it's an overloaded operator — the same `<<` you
  might expect to shift bits means something entirely different in this context, which is
  your first hint that C++ lets you redefine what operators mean for a given type (this
  comes back for real in Stage 5, when `A + B` on matrices works because of exactly this
  mechanism).
- `return 0;` — **(a) first appearance.** `main`'s return value is the program's *exit
  code*, reported to the operating system, not to any caller in your own code — `0`
  conventionally means "success." This is why later, when the server needs to keep
  running forever, `main` simply never reaches this line.

### CS lens

A compiled binary vs. an interpreted script is the same distinction as: a translated book
you can hand to anyone (compiled) vs. a live interpreter standing next to you translating
sentence by sentence (interpreted, what Python's doing). Also recognized in: Java compiling
to bytecode and then being interpreted *again* by the JVM — a hybrid of both.

### SE lens

Pinning `-std=c++17` explicitly instead of trusting the compiler's default is a small
example of a large principle: **reproducibility.** The alternative — no flag, whatever
version happens to be the compiler's current default — works fine until a teammate's
compiler defaults to a different version and code that compiled for you doesn't compile for
them. The cost of pinning it: you have to remember to update it if you deliberately want a
newer language feature later.

### Connect

That `hello` binary is thrown away now — real project code starts in Concept Unit 2, but
it's still just C++ being compiled and run the same way.

---

## Concept Unit 2: A socket — a file descriptor for a network conversation

### The Problem

`hello` runs and exits immediately. For another program (`curl`, a browser) to send this
program data over the network, the operating system needs to hand it a *channel* to
receive that data on. That channel is a socket.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <cstring>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>

int main() {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);

    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(8080);

    bind(server_fd, (struct sockaddr*)&address, sizeof(address));
    listen(server_fd, 5);

    std::cout << "socket lab listening on port 8080, waiting for one connection...\n";

    int client_fd = accept(server_fd, nullptr, nullptr);

    char buffer[2048] = {0};
    ssize_t bytes_read = read(client_fd, buffer, sizeof(buffer) - 1);

    std::cout << "read " << bytes_read << " bytes:\n";
    std::cout << buffer << "\n";

    close(client_fd);
    close(server_fd);
    return 0;
}
```

Run it, then from another terminal:

```
$ curl -X POST http://localhost:8080/evaluate -d "1+2*3"
```

Real output from the server's terminal:

```
socket lab listening on port 8080, waiting for one connection...
read 159 bytes:
POST /evaluate HTTP/1.1
Host: localhost:8080
User-Agent: curl/8.5.0
Accept: */*
Content-Length: 5
Content-Type: application/x-www-form-urlencoded

1+2*3
```

This proves two things at once: `curl` really does send plain, readable text over the
network (no hidden binary protocol to reverse-engineer), and this program really did
receive it, byte for byte, with nothing in between.

### Discard

This file's job was to prove a socket can receive real bytes from a real HTTP client. It's
deleted now — the real project file, written next, keeps the same socket calls but actually
does something with what it reads instead of just printing it.

### Mechanical walkthrough (new items only — socket calls, in order)

- `socket(AF_INET, SOCK_STREAM, 0)` — **(a) first appearance.** Asks the OS for a new
  socket and returns a small integer, the *file descriptor*, that every later call uses to
  refer to it — the same idea as a variable holding a handle, except the "object" lives in
  the kernel, not your process. `AF_INET` means "use IPv4 addressing"; `SOCK_STREAM` means
  "a reliable, ordered byte stream" (TCP) rather than the fire-and-forget alternative
  (`SOCK_DGRAM`, UDP).
- `setsockopt(..., SO_REUSEADDR, ...)` — **(a) first appearance.** Without this, restarting
  the server quickly after stopping it fails with "address already in use," because the OS
  holds a port briefly after a socket closes. This line tells the OS to skip that wait —
  purely a development-convenience setting, not something a production server would
  necessarily want on unconditionally.
- `sockaddr_in address{}` — **(a) first appearance.** A plain C struct describing "which
  address family, which IP, which port" — the `{}` zero-initializes every field, which
  matters because `bind` will read whichever fields you don't explicitly set.
- `htons(8080)` — **(a) first appearance.** "Host to network short" — converts the port
  number into the specific byte order network protocols require, which may or may not match
  your CPU's native byte order. You don't need to know *which* byte order your machine uses;
  that's exactly the problem this function exists to make irrelevant.
- `bind(...)` — **(a) first appearance.** Associates the socket with the address/port
  described above — this is the step that actually claims port 8080 for this process.
- `listen(server_fd, 5)` — **(a) first appearance.** Marks the socket as ready to accept
  incoming connections; `5` is the maximum number of connections allowed to queue up
  waiting for `accept` before the OS starts rejecting new ones.
- `accept(server_fd, nullptr, nullptr)` — **(a) first appearance.** Blocks — the program
  stops here and does nothing else — until a client connects, then returns a *new* file
  descriptor representing that specific connection, separate from `server_fd`. This is the
  detail that explains why the real server (next unit) can serve many clients: `server_fd`
  keeps listening: it's `client_fd` that's specific to one conversation.
- `read(client_fd, buffer, sizeof(buffer) - 1)` — **(b) reappearing concept, new context.**
  You've used `read`-shaped operations conceptually in Python (`file.read()`); here it reads
  raw bytes off the *socket* into a fixed-size C-style buffer, and returns how many bytes it
  actually got — which can be less than the buffer size, and you have to check that
  (`bytes_read`), because network data doesn't arrive in one guaranteed chunk.

### CS lens

The blocking `accept()` call — the program doing nothing until a client shows up — is the
simplest possible version of an idea that recurs everywhere in systems programming: waiting
on I/O. Also recognized in: a GUI's event loop waiting for a click, a database connection
pool waiting for an available connection, `select`/`epoll` (what real servers use to wait on
*many* sockets at once instead of just one).

### SE lens

This lab handles exactly one connection and then exits — deliberately, to keep the lab
isolated to "what is a socket," not "how do I serve many clients." The real project code
below wraps `accept` in a loop instead. The tradeoff of a loop like that: it serves clients
one at a time, in sequence — a second `curl` request has to wait for the first to finish.
That's a real limitation this project is accepting for now; concurrency (threads, or an
event loop) is future debt, not solved here.

---

## Concept Unit 3: Finding the body inside a raw request

### The Problem

The captured output above shows the whole request is one blob of text — headers, then a
blank line, then the body (`1+2*3`). The project only cares about the part after that blank
line.

### Project Change

- **Reference Source:** no reference counterpart — this is a from-scratch addition, since
  the project isn't porting an existing HTTP parser, just extracting what it needs.
- **Files affected:** new file, `server.cpp`.
- **Change type:** add.
- **Location:** new file — nothing to locate a position within yet.
- **Dependencies:** none beyond what Concept Unit 2 already used.

### The New Code — type it yourself

```cpp
std::string extract_body(const std::string& request) {
    std::size_t separator = request.find("\r\n\r\n");
    if (separator == std::string::npos) {
        return "";
    }
    return request.substr(separator + 4);
}
```

### The Updated Project

This is a brand-new, freestanding function — nothing surrounds it yet, so there's nothing
larger to show it inside of (it gets called from `main` in the next unit).

### Mechanical walkthrough

- `std::string` as a parameter type, `const ... &` — **(a) first appearance.** Passing the
  request "by reference" (`&`) instead of by value means this function doesn't copy the
  entire request text just to look at it; `const` promises the function won't modify the
  caller's string. Every HTTP request could in principle be large, so copying it
  unnecessarily on every call is exactly the kind of cost this avoids.
- `request.find("\r\n\r\n")` — **(a) first appearance.** `\r\n` is a *carriage return +
  line feed* — the specific two-character line ending HTTP requires between header lines
  (not just `\n`, which is what C++ string literals otherwise use day to day). Two of them
  back to back is HTTP's actual, specified way of marking "headers are over, body starts
  here" — this isn't a guess, it's the protocol's real rule, visible in the captured output
  above as the blank line right before `1+2*3`.
- `std::string::npos` — **(a) first appearance.** The sentinel value `find` returns when the
  search text isn't present at all — checking against it is how you tell "found at position
  0" apart from "not found," since 0 is also a valid found-position.
- `request.substr(separator + 4)` — **(a) first appearance.** Returns everything from that
  position to the end of the string; `+ 4` skips past the four characters of `\r\n\r\n`
  itself, landing exactly on the first character of the body.

### CS lens

Treating the blank line as a hard *delimiter* between two sections of one text stream is the
same idea as a CSV file's comma, or a shell command's `--` separating flags from arguments —
a single reserved sequence whose only job is to mark where one section ends and the next
begins.

---

## Concept Unit 4: The real server

### Project Change

- **Reference Source:** no reference counterpart — hand-rolled HTTP layer, by design (see
  the choice explained at the top of this lesson).
- **Files affected:** `server.cpp` (continuing the same file as Concept Unit 3).
- **Change type:** add — wraps the socket calls from Concept Unit 2 and the function from
  Concept Unit 3 into one running program.
- **Location:** new `main()`, in the same file, below `extract_body`.
- **Dependencies:** `extract_body`, and the socket headers from Concept Unit 2.

### The New Code — type it yourself

```cpp
void log_request(const std::string& body) {
    std::time_t now = std::time(nullptr);
    char timestamp[20];
    std::strftime(timestamp, sizeof(timestamp), "%H:%M:%S", std::localtime(&now));
    std::cout << "[" << timestamp << "] POST /evaluate body=\"" << body << "\"" << std::endl;
}
```

### The Updated Project

```cpp
#include <iostream>
#include <string>
#include <cstring>
#include <ctime>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>

std::string extract_body(const std::string& request) {
    std::size_t separator = request.find("\r\n\r\n");
    if (separator == std::string::npos) {
        return "";
    }
    return request.substr(separator + 4);
}

void log_request(const std::string& body) {                            // ← new
    std::time_t now = std::time(nullptr);                               // ← new
    char timestamp[20];                                                 // ← new
    std::strftime(timestamp, sizeof(timestamp), "%H:%M:%S",             // ← new
                  std::localtime(&now));                                // ← new
    std::cout << "[" << timestamp << "] POST /evaluate body=\""         // ← new
              << body << "\"" << std::endl;                             // ← new
}                                                                        // ← new

int main() {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);

    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in address{};
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(8080);

    bind(server_fd, (struct sockaddr*)&address, sizeof(address));
    listen(server_fd, 5);

    std::cout << "math engine listening on port 8080\n";

    while (true) {                                                      // ← new
        int client_fd = accept(server_fd, nullptr, nullptr);

        char buffer[4096] = {0};
        read(client_fd, buffer, sizeof(buffer) - 1);
        std::string request(buffer);                                    // ← new

        std::string body = extract_body(request);                       // ← new
        log_request(body);                                              // ← new

        std::string response_body = body;                               // ← new
        std::string response =                                          // ← new
            "HTTP/1.1 200 OK\r\n"                                        // ← new
            "Content-Type: text/plain\r\n"                               // ← new
            "Content-Length: " + std::to_string(response_body.size())    // ← new
            + "\r\n\r\n" + response_body;                                // ← new

        write(client_fd, response.c_str(), response.size());            // ← new
        close(client_fd);                                               // ← new
    }

    close(server_fd);
    return 0;
}
```

The server now: binds and listens once, then loops forever — for each connection, it reads
the raw request, pulls out the body, logs it with a timestamp, wraps that same body in a
valid HTTP response, sends it, and closes that one connection before waiting for the next.

### Mechanical walkthrough (new items only)

- `std::time(nullptr)` / `std::localtime` / `std::strftime` — **(a) first appearance.**
  C++'s C-inherited time API: `time(nullptr)` gets the current time as a raw count of
  seconds, `localtime` converts that into a broken-out struct (hour, minute, second, ...),
  and `strftime` formats that struct into a string using a format string (`%H:%M:%S`) — the
  same three-step shape as Python's `time.strftime`, just spelled out explicitly instead of
  hidden behind one convenience call.
- `std::string request(buffer)` — **(b) reappearing, new context.** Wraps the raw
  `char[4096]` buffer from `read` into a real `std::string` — from this line on, the request
  can use `.find()`, `.substr()`, and every other string method already used in Concept
  Unit 3, instead of raw C-array indexing.
- `while (true)` — **(a) first appearance in this project's server context.** The loop that
  turns "handle one connection and exit" (the lab) into "keep serving forever" (the real
  server) — `main` never reaches its own `return 0;` in normal operation; the process is
  stopped from outside instead (Ctrl-C, or later, a real shutdown signal).
- `"Content-Length: " + std::to_string(...)` — **(a) first appearance.** HTTP requires the
  response to declare its own body length up front so the client knows exactly when the
  response ends — `std::to_string` converts the integer byte count into text to build that
  header. Get this wrong (as many first attempts do) and `curl` either truncates the
  response or hangs waiting for bytes that never come.
- `write(client_fd, response.c_str(), response.size())` — **(b) reappearing concept.** The
  mirror image of `read` from Concept Unit 2 — sends bytes out instead of in.
  `.c_str()` hands `write` a raw pointer to the string's underlying character data, since
  the C-style `write` function has no idea what a `std::string` is.
- `close(client_fd)` — **(a) first appearance.** Releases this one connection's file
  descriptor back to the OS. Skipping this would leak a file descriptor per request — the
  process would eventually hit the OS's limit and stop being able to accept new
  connections, a real bug class ("file descriptor leak"), not a hypothetical one.

### CS lens

The whole loop — accept a request, do a small fixed amount of work, respond, repeat — is the
**request-response cycle**, the same shape underneath every web framework you've ever used
in Python (Flask, Django), just with none of it hidden from you this time.

### SE lens

`log_request` writes to `std::cout`, unconditionally, on every request — the simplest
possible form of logging, and already more than many first attempts have (a server with
zero visibility into what it's doing). The real gap being accepted here: there's no log
*level* (info vs. warning vs. error) and no way to turn it off — both come back explicitly
in Stage 10's hardening pass, once there's actually something worth distinguishing an error
from.

### Commands

```
g++ -std=c++17 -Wall -o server server.cpp
./server
```

In a second terminal:

```
curl -X POST http://localhost:8080/evaluate -d "42"
curl -X POST http://localhost:8080/evaluate -d "1+2*3"
```

### Run it. Real output.

Server terminal:

```
math engine listening on port 8080
[08:50:30] POST /evaluate body="42"
[08:50:30] POST /evaluate body="1+2*3"
```

Client terminal, first request:

```
$ curl -X POST http://localhost:8080/evaluate -d "42"
42
```

Client terminal, second request:

```
$ curl -X POST http://localhost:8080/evaluate -d "1+2*3"
1+2*3
```

Both echoed back exactly, proving the full loop — read, extract, log, respond — works for
more than one request without restarting the server.

### Connect

The body arriving as plain, unvalidated text and leaving unchanged is exactly the seam
Lesson 2 opens up: instead of `response_body = body;`, that line becomes "hand `body` to a
lexer, then a parser, then evaluate the result" — everything built here (the socket loop,
the logging, the response-writing) stays completely untouched.

---

## Closing

### Connect the pieces

Trace the value `"1+2*3"`, start to finish, through everything built in this lesson: `curl`
sends it as the HTTP request body → the OS delivers it as raw bytes into this program's
`buffer` via `read` → `std::string request(buffer)` gives it a real string interface →
`extract_body` finds the `\r\n\r\n` marker and slices out exactly `"1+2*3"` → `log_request`
prints it with a timestamp → it's assigned unchanged to `response_body` → wrapped in a valid
HTTP response with the correct `Content-Length` → sent back over the same `client_fd` →
`curl` prints `1+2*3` to your terminal. Nothing about that value's *meaning* was touched
anywhere in this chain — only its transport. That's the point of this lesson, and exactly
what changes starting in Lesson 2.

### What breaks without this

Comment out the `Content-Length` header line and rebuild:

```cpp
        std::string response =
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: text/plain\r\n"
            // "Content-Length: " + std::to_string(response_body.size()) + "\r\n"
            "\r\n" + response_body;
```

Rebuild and hit it with `curl -v` — the client either hangs briefly waiting for more bytes
it thinks are coming, or (depending on your `curl` version) reports the body length as
unreliable, because nothing told it when the response actually ends. Restore the header
before moving on.

### Exercises

- Change the port from `8080` to `9090` in one place and confirm `curl` on `8080` now fails
  to connect, proving the port number is doing real work, not decoration.
- Send a request with an empty body (`curl -X POST http://localhost:8080/evaluate -d ""`)
  and confirm the server doesn't crash — trace through `extract_body` by hand for this case.
- Add a second `std::cout` line inside the loop that prints the *number of bytes read* by
  `read`, and confirm it matches `Content-Length` in curl's own request (visible with
  `curl -v`).

### Definition of done

- [ ] `server.cpp` compiles with `g++ -std=c++17 -Wall` and produces no warnings.
- [ ] The server starts, prints its listening message, and accepts more than one request in
      a row without restarting.
- [ ] Two different bodies sent via `curl` are each echoed back exactly, and each is logged
      with a timestamp.
- [ ] The `Content-Length` exercise above was actually run and reverted.
- [ ] Commit:

```
git init
git add server.cpp
git commit -m "Add raw-socket HTTP server that echoes a request body

Handles one connection at a time via a blocking accept() loop.
No parsing of the body's meaning yet - that starts in Lesson 2
with a lexer and recursive-descent parser. Chose raw POSIX
sockets over a library to keep the project dependency-free."
```

Next lesson: a lexer and recursive-descent parser, so `2*(3+4)` stops being an inert string
and starts being a number.
