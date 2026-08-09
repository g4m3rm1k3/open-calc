# Lesson 0: Servers, Clients, and the Interface Between Them

## What you will build

Nothing runnable in this project yet — no project code exists before
this lesson, and none is added by it. This is the foundation Lesson 1.1
depends on and never re-explains: what a server actually is, what a
client and server literally exchange over a network, how a program
decides which of its own functions should answer a given request, and
what standard interface lets a framework's code run under any real web
server at all. Today's real subject is client-server communication and
the interface between an application and the server running it — Flask,
starting next lesson, is the case study; it is not the subject itself.

## What you need to know first

Nothing — this is the first lesson.

## Terms introduced

- **Server** — a long-running program that starts, then waits —
  indefinitely — for another program to contact it, reacting each time
  something arrives rather than running once and exiting.
- **Client** — the program that initiates contact with a server.
- **Request / response** — the client's message asking for something,
  and the server's message answering it; in HTTP specifically, both
  have a fixed, text-based structure.
- **Status code** — a three-digit number in an HTTP response stating
  the outcome category: `2xx` success, `4xx` the client's request was
  invalid, `5xx` the server itself failed while handling it.
- **Routing / dispatch table** — the mechanism that looks up which
  piece of code should handle a given request path, rather than a long
  chain of manual comparisons.
- **Web framework** — a library that solves request-parsing and
  response-building once, so an application only has to answer "given
  this request, what's the response?" instead of re-implementing HTTP
  handling from raw bytes every time.
- **WSGI** (Web Server Gateway Interface) — the standard contract that
  lets any WSGI-speaking web server run any WSGI-speaking Python web
  application, without either one needing to know the other's internal
  code.
- **Development server / production server** — a framework's own
  built-in server, convenient for one person's machine while building,
  versus a separate, hardened server meant to actually face real
  traffic; the same application code runs under either, because both
  agree on WSGI.

---

## Concept Unit: Why a Server Waits Instead of Running Once

### The Problem

Every program in this curriculum's future is going to be a *server* —
something that starts once and then answers many separate requests over
time, rather than a script that runs top to bottom and exits. Before
building one, it's worth being precise about what that actually means
mechanically, and why it's a different shape from an ordinary program.

### Concepts reused, 100% match — not re-taught here

- `concepts/client-server-architecture.md` — the full treatment: a real,
  runnable example of a server blocking on `mailbox.get()`, reacting
  only when a client puts something in, with a real, traced sequence of
  events across two threads.

### Project Change

- **Reference Source** — no reference counterpart. This is foundational
  material with no project code of its own; the reference application
  this curriculum ports from is itself just such a server, but nothing
  from it is quoted here — that starts in Lesson 1.1.
- **Files affected** — none.

### What this means for what's coming

Every lesson in this curriculum from 1.1 onward builds a program that
follows exactly the shape `client-server-architecture.md` already
proved in isolation: start, then wait, then react, forever, until
stopped. `python run.py` in Lesson 1.1 is the moment this project's own
version of that `while True: mailbox.get()` loop starts running for
real — the same shape, a real network socket standing in for the
in-memory queue.

---

## Concept Unit: What a Request and a Response Actually Are

### The Problem

"The client sends a request, the server sends a response" is true but
vague — vague enough to hide real, concrete questions this project will
depend on answering correctly from Lesson 1.1 onward: what does a
request actually look like, on the wire? How does a response state
whether it succeeded? How does either side know where one message ends
and the next begins?

### Concepts reused, 100% match — not re-taught here

- `concepts/http-request-response.md` — the full treatment: a real,
  raw HTTP exchange captured with `curl -v` against a minimal server
  built from Python's own `http.server`, no framework hiding any of it.

### Project Change

- **Reference Source** — no reference counterpart; foundational
  material, as above.
- **Files affected** — none.

### What this means for what's coming

Lesson 1.1's own `/health` route returns a Python `dict`; Flask
converts it to JSON and sends it back inside exactly this same
request/response shape — a status line, headers, a blank line, then a
body — automatically. Knowing that structure already exists is what
makes Lesson 1.1's own real, captured `curl` output legible as more
than "it printed the right words" — every part of it (the status code,
the JSON body) is a specific, structured piece of the same message
format `http-request-response.md` already showed in full.

---

## Concept Unit: Deciding Which Code Handles Which Request

### The Problem

A server that only ever has one possible response is trivial. A real
server has many different routes, each needing different code to
handle it — and something has to decide, for any given incoming
request, which specific function actually runs.

### Concepts reused, 100% match — not re-taught here

- `concepts/http-routing-dispatch-table.md` — the full treatment: a
  real, hand-built routing table using a plain Python dict and a
  decorator, with no framework — the exact mechanism a framework's own
  `@app.route(...)` automates.

### Project Change

- **Reference Source** — no reference counterpart; foundational
  material, as above.
- **Files affected** — none.

### What this means for what's coming

`@app.route('/health')` in Lesson 1.1 is this identical dispatch-table
pattern — a real dict, keyed by path, mapping to a handler function —
except the dict and the lookup code both live inside Flask's own
already-written source instead of being built by hand. Lesson 1.1's own
Mechanical Walkthrough says exactly this when the decorator first
appears; this unit is what makes that claim something you can already
verify yourself, rather than take on faith.

---

## Concept Unit: Why a Framework at All — WSGI

### The Problem

`http-request-response.md` already showed the raw shape of an HTTP
message using Python's own `http.server`. Building a real application
directly against that module means hand-rolling the same plumbing for
every route, in every project: parsing the path, checking the method,
building the status line, setting `Content-Length` correctly, encoding
the body. None of that is specific to any one application — which is
exactly the kind of repeated, non-domain-specific work a library should
solve once. But for a solution to that problem to work across *many*
different real web servers — not just whichever one a particular
framework happens to ship — Python needed a standard, agreed-upon
contract for handing a request from any server to any application.
That agreement is WSGI, and it's what makes "swap the framework, or
swap the server, without rewriting the other side" possible at all.

### New concept, no match: WSGI

Full treatment in `concepts/wsgi-application-interface.md` — not
repeated here. That file's own isolation lab builds a complete, working
web application with no framework at all — a single Python function,
`application(environ, start_response)` — run through Python's own
standard-library WSGI server, and proves, with real captured `curl`
output, that a server and an application talking only through this one
narrow contract is enough to serve real HTTP requests correctly.

### Discard the throwaway example

`concepts/wsgi-application-interface.md`'s own lab is discarded, per
its own file — the literal `application` function and port `8001`
never appear in this project.

### Project Change

- **Reference Source** — no reference counterpart; foundational
  material, as above. Flask's own real use of WSGI is internal to
  Flask's own source, not something this project's code calls directly
  — this project only ever calls `Flask(__name__)` and `app.run(...)`,
  never `environ`/`start_response` themselves.
- **Files affected** — none.

### What this means for what's coming

Lesson 1.1's own `Flask(__name__)` object is, underneath, a real WSGI
application — the same shape `concepts/wsgi-application-interface.md`'s
own bare `application` function demonstrates directly, just built and
registered through Flask's own nicer `@app.route` API instead of by
hand. `app.run(port=5000)` is Flask handing that object to its own
built-in, development-only WSGI server — the exact relationship the
concept file's own SE Lens explains, including why Flask's real startup
output warns, unprompted, not to use that same server in production.
`concepts/dev-server-debug-mode-risk.md` — cited here for the first
time, full treatment there — covers the specific, real security
tradeoff behind that warning, relevant the moment `debug=True` is ever
considered for this project's own backend.

---

## Connect the pieces

A server exists to wait, then react (`client-server-architecture.md`).
What it waits for and reacts with has a fixed, real shape — HTTP's own
request/response format (`http-request-response.md`). Deciding which
of the server's own functions should react to a given request is a
lookup, not a guess (`http-routing-dispatch-table.md`). And the reason
a framework like Flask can implement all three of those ideas *for*
you, while still running under whichever real server a deployment
chooses, is that both sides agree on one narrow, standard interface —
WSGI (`wsgi-application-interface.md`) — instead of the framework and
the server needing to know each other's internals directly. Lesson 1.1
builds the smallest real thing that puts all four of these ideas to
work at once: a genuine server, answering a genuine HTTP request, via a
genuine dispatch table, through a genuine WSGI application object.

## What breaks without this

Not applicable in the usual sense — no project code exists yet for
something to break. The real, honest failure this lesson prevents is a
different kind: reaching Lesson 1.1 and typing `@app.route('/health')`
correctly, getting the right output, and still not being able to
explain *why* that line works — what a route decorator actually is
underneath, what "the server" is even waiting for, or why a `curl`
request gets back exactly the text it does.
`concepts/http-request-response.md`'s own Try It Yourself (removing
`Content-Type` from a raw
response and observing what a client does with an unlabeled body) is a
good concrete way to feel that gap directly, right now, before Flask
hides it behind a framework's own convenience.

## Exercises

1. Run `concepts/client-server-architecture.md`'s own isolated example
   yourself if you haven't already, then explain in your own words why
   `mailbox.get()` is described as "blocking" rather than "checking."
2. Run `concepts/http-request-response.md`'s own isolated example,
   then use `curl -v` (not a browser) against it a second time with a
   path that doesn't exist. Read the real status line you get back and
   explain, using this lesson's own Terms, which digit tells you the
   general category of what happened.
3. Run `concepts/wsgi-application-interface.md`'s own isolated example.
   Add a second real route to it, then explain, in your own words, what
   specifically would have to change in that file if you swapped
   `wsgiref`'s `make_server` for a real production WSGI server like
   Gunicorn — and what would *not* need to change, and why.

## Definition of done

- [ ] You can explain, without looking, the difference between a
      client and a server in terms of who initiates contact.
- [ ] You ran `client-server-architecture.md`'s own example and saw its
      real output yourself.
- [ ] You ran `http-request-response.md`'s own example and read a real,
      raw HTTP response with `curl -v` yourself.
- [ ] You ran `wsgi-application-interface.md`'s own example and can
      explain, in your own words, what `environ` and `start_response`
      each are for.
- [ ] You can explain why the exact same Flask application object can
      run under Flask's own development server *or* a real production
      WSGI server with no code changes.

Stage and commit the lesson file itself — no project code exists yet
for this lesson to affect:

```
git add curriculum/lesson-0-servers-clients-and-the-interface-between-them.md
git commit -m "Lesson 0: Servers, Clients, and the Interface Between Them"
```

This message states *why* the commit exists — the reader now has the
real, concrete foundation Lesson 1.1 depends on and never re-derives:
what a server is, what it exchanges with a client, how it decides which
code answers a request, and what standard interface lets a framework's
code run under any real server at all.

---

**Next lesson:** Lesson 1.1 — the first real piece of this project's own
backend, a genuinely running Flask process answering a real HTTP
request, built directly on every concept this lesson just established.
