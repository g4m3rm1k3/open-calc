# Lesson 16: Broken Access Control — Insecure Direct Object References

## What you will build

A real HTTP diary server with a `/diary/<username>` endpoint, protected by the session
mechanism from Lesson 14 — and then a single URL edit that lets Ada read Grace's private
diary despite never touching Grace's password, cookie, or anything belonging to her at
all. The transferable problem: an identifier taken straight from a request and used
directly as a database lookup, with no check that the requester actually owns the thing
that identifier points to.

## What you need to know first

Lesson 3 (Authentication vs. Authorization) — today's vulnerability is the exact bug from
that lesson's `read_diary` function, rebuilt as a real HTTP endpoint instead of a bare
Python function call. Lesson 14 (Sessions and Cookies) — today's server issues and checks
session cookies exactly as that lesson built them; if any of that feels unfamiliar, that
lesson is the prerequisite, not this one. Lesson 15 (CSRF) — today reuses `parse_qs` and
the same `http.server.BaseHTTPRequestHandler` pattern without re-explaining them.

---

## Concept Unit: The Object Reference

### The Problem

`/diary/ada` and `/diary/grace` need to route to two different pieces of data using the
same endpoint code — the server has to pull *which* diary is being requested out of the
URL itself, as a piece of data, before it can look anything up. That extracted piece of
data is called a **direct object reference**: a value, taken straight from the request,
that identifies exactly one specific resource with no indirection in between.

### Introduce the Concept in Isolation

```python
path = "/products/42"
segments = path.split("/")
print("segments:", segments)
product_id = segments[2]
print("product_id:", product_id)

path2 = "/products/9999-do-not-exist"
segments2 = path2.split("/")
print("segments2:", segments2)
print("product_id2:", segments2[2])
```

Run it:

```
segments: ['', 'products', '42']
product_id: 42
segments2: ['', 'products', '9999-do-not-exist']
product_id2: 9999-do-not-exist
```

This output proves two things. First, `"/products/42".split("/")` produces a **leading
empty string** as `segments[0]` — because the path starts with the separator character
itself, everything before the first `/` is an empty string, not nothing. This is why the
real identifier lands at index `2`, not index `1` or `0` — a detail that's easy to get
wrong on a first attempt and worth verifying by running it rather than assuming. Second,
and more important for today: `product_id2` became the literal string
`"9999-do-not-exist"`, taken from the URL with **no validation of any kind** — `split` and
list indexing have no concept of "does this ID correspond to something real, and does the
requester have any right to it." They are purely mechanical string operations. Whatever
appears after the second `/` becomes `product_id`, unconditionally.

### Discard

This `path`/`path2` example is deleted now. It never appears in the diary server — it
existed only to isolate what a direct object reference actually is, mechanically, before
any authorization logic gets layered on top of it.

### Where This Lives

This lesson builds one file, `diary_server.py`, across all four Concept Units below —
each unit adds to the same `do_GET` method rather than starting a new file, since there's
no multi-lesson project for this to slot into; the file is complete and runnable at the
end of this lesson and discarded, like every lab in this course, once the concept is
learned.

### CS Lens

A direct object reference is the mechanism underneath nearly every REST-style URL you've
ever used — `/users/17`, `/orders/A4F2`, `/diary/grace`. It's not inherently dangerous;
it's how resources are addressed at all. The danger, which the next Concept Unit makes
concrete, is entirely about what happens — or doesn't happen — *after* that reference is
extracted.

---

## Concept Unit: The Vulnerable Endpoint

### The Problem

Lesson 3 already showed this exact failure once, as a bare function call:
`read_diary(session_token, requested_username)` checked whether a session was valid, but
never checked whether the session's *owner* matched `requested_username`. Today's question
is narrower: does that same missing check survive the move to a real HTTP server with a
real URL, or does something about HTTP accidentally fix it? (It doesn't. Watch.)

### Skip: Concept Already Lab'd

Session issuance and the `Cookie` header lookup (`get_session_token`) are unchanged from
Lesson 14 and reused here without a new lab, per the Repetition Rule — only a brief
restatement follows, in the walkthrough below, of what that function already does.

### Where This Lives

**File:** `diary_server.py` (new file for this lesson). **Location:** the `do_GET` method
of a `BaseHTTPRequestHandler` subclass, in the branch handling any path starting with
`/diary/`. **Dependencies:** Python's standard library only — `http.server`, `secrets`,
`urllib.parse` — nothing to install.

### The New Code

```python
if parsed.path.startswith("/diary/"):
    requested_username = parsed.path.split("/")[2]
    session_token = get_session_token(self)
    requesting_username = sessions.get(session_token)

    if not requesting_username:
        self.send_response(401)
        self.end_headers()
        self.wfile.write(b"not logged in")
        return

    self.send_response(200)
    self.end_headers()
    self.wfile.write(users[requested_username]["diary"].encode())
    return
```

### The Updated Project

This branch sits inside `do_GET`, alongside the `/login` branch that issues sessions
exactly as in Lesson 14:

```python
class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/login":
            query = parse_qs(parsed.query)
            username = query.get("username", [""])[0]
            password = query.get("password", [""])[0]
            if username in users and users[username]["password"] == password:
                session_token = secrets.token_hex(16)
                sessions[session_token] = username
                self.send_response(200)
                self.send_header("Set-Cookie", f"session={session_token}")
                self.end_headers()
                self.wfile.write(b"logged in")
            else:
                self.send_response(401)
                self.end_headers()
                self.wfile.write(b"invalid credentials")
            return

        if parsed.path.startswith("/diary/"):            # ← new
            requested_username = parsed.path.split("/")[2]          # ← new
            session_token = get_session_token(self)                 # ← new
            requesting_username = sessions.get(session_token)       # ← new

            if not requesting_username:                              # ← new
                self.send_response(401)                              # ← new
                self.end_headers()                                   # ← new
                self.wfile.write(b"not logged in")                   # ← new
                return                                                # ← new

            self.send_response(200)                                  # ← new
            self.end_headers()                                       # ← new
            self.wfile.write(users[requested_username]["diary"].encode())  # ← new
            return                                                    # ← new

        self.send_response(404)
        self.end_headers()
```

`do_GET` now handles two distinct requests: `/login`, which authenticates a user and
issues a session cookie, and anything starting with `/diary/`, which is meant to return
one specific user's diary — but, as written, returns *whichever* diary the URL asks for,
to anyone holding *any* valid session, regardless of whose diary was requested.

### Mechanical Walkthrough
Enumerating every element of the new branch, in order:

- `parsed.path.startswith("/diary/")` — **(c) already basic**: `startswith` was
  implicitly available since Lesson 4's string handling; string-prefix checking needs no
  further explanation.
- `parsed.path.split("/")[2]` — **(a) first appearance in this file**, but reusing the
  exact mechanism from this lesson's own throwaway lab above: index `2` is the segment
  after the second `/`, i.e., the username.
- `get_session_token(self)` — **(b) hard concept reappearing**: this is Lesson 14's cookie
  parser, unchanged, reading the `Cookie` request header and extracting the `session=...`
  value.
- `sessions.get(session_token)` — **(b) hard concept reappearing**: Lesson 3 and Lesson
  14's lookup-table pattern — mapping an opaque session token to the username it belongs
  to, returning `None` if the token isn't a key in the dictionary.
- `if not requesting_username` — **(c) already basic**: truthiness of `None` vs. a
  non-empty string, established since early lessons.
- `self.send_response(401)` / `self.end_headers()` / `self.wfile.write(...)` — **(b) hard
  concept reappearing** (the HTTP response-writing sequence from Lesson 14 and 15), except
  for `401` specifically, which is **(a) first appearance as a named concept**: `401
- Unauthorized` is the HTTP status code meaning "you have not proven who you are at all" —
  no valid credentials or session were presented. It was *used* without explanation in
  Lesson 15; today is its first full definition, and it matters here because the very next
  Concept Unit introduces a status code with a meaningfully different meaning.
- `users[requested_username]["diary"]` — **(a) first appearance of the actual bug**: this
- is a direct dictionary lookup using `requested_username` — the value pulled straight out
  of the URL in this unit's first line — with nothing between extracting it and using it
  to fetch data. No comparison against `requesting_username` occurs anywhere in this
  branch.

### CS Lens

This is precisely Lesson 3's missing-authorization-check pattern, and the reappearance is
worth naming explicitly rather than trusting memory: the code correctly answers *"is this
a valid session?"* (authentication) and never asks the separate question *"does this
session's owner have any right to the specific resource named in the request?"*
(authorization). The bug is invisible to a test that only ever requests one's own data —
`ada` reading `/diary/ada` looks completely correct, which is exactly why this class of
bug survives so often into production.

```
Also recognized in: file servers that serve any path requested without checking
directory ownership, cloud storage APIs that accept a bucket/object ID directly
from the client, mobile banking apps that fetch "your" transaction history by an
account number embedded in the request rather than derived from the
authenticated session, and API endpoints shaped like /api/orders/{id} across
virtually every framework and language, which is why Broken Access Control has
consistently ranked among the most frequently found serious vulnerability classes
in real-world security audits.
```

### SE Lens

The alternative not chosen here is to derive `requested_username` from the *session*
itself rather than from the URL at all — for an endpoint that only ever means "show me my
own diary," the route could simply be `/diary` with no username in the URL, reading the
identity entirely from `requesting_username`. That alternative eliminates this
vulnerability by construction, but it also eliminates a legitimate feature this endpoint's
shape suggests was intended: letting a URL address *any* diary, for cases where sharing or
moderation might one day be legitimate. The real fix, in the next unit, keeps that
flexibility and adds the missing check explicitly, which costs one comparison and one new
branch — cheap engineering, easy to skip under time pressure, which is exactly how this
bug class ends up in real, shipped systems so often.

### Run It

```bash
python3 diary_server.py &
python3 attack_client.py
```

```
Login: b'logged in'
Ada reads her own diary: b"Ada's private thoughts: meeting notes for Friday"
Ada reads Grace's diary (should NOT be allowed): b"Grace's private thoughts: compiler bug on line 42"
```

Ada's own session token — issued for *her* login, nothing forged or stolen — successfully
retrieves Grace's private diary. The only thing that changed between the two requests is
the URL.

This unit connects directly to the very lab above it: `requested_username`, extracted
exactly the way the throwaway `product_id` example demonstrated, flows unchecked into a
real data lookup with real consequences.

---

## Concept Unit: 401 vs. 403 — Two Different Kinds of "No"

### The Problem

The fix in the next unit needs to refuse Ada's request for Grace's diary — but refuse it
*differently* than the "not logged in" case already handles, because they're not the same
fact. Reusing `401` for both would tell Ada "you're not authenticated," which is false —
she's fully authenticated, just not authorized for this specific resource. HTTP has a
status code for exactly this distinction, and using the wrong one is itself a small
information-accuracy bug worth avoiding.

### Introduce the Concept in Isolation

```python
# 401 Unauthorized: "I don't know who you are, or your credentials are invalid."
#   -- correct when no session, or an invalid session token, is presented.
# 403 Forbidden: "I know exactly who you are, and you are not allowed to do this."
#   -- correct when a valid session belongs to someone without permission for
#      the specific resource or action being requested.
```

There's no code to run for this one — it's a definition, not a construct — but the
distinction is checkable directly against the HTTP specification's own wording, and it
matters mechanically in the next unit: the fix's new branch has to run *after* confirming
a session exists (otherwise `requesting_username` would be `None`, and comparing `None !=
requested_username` would incorrectly return `403` for someone who isn't logged in at all,
misreporting "you're logged in but not allowed" to someone who isn't logged in in the
first place).

### CS Lens

```
Also recognized in: nearly every REST API's error-response conventions, cloud
provider IAM systems (a request that is correctly authenticated as a real
identity but denied by a policy returns a 403-equivalent, never a 401-equivalent),
and any API client library's error-handling code, which typically branches on
this exact distinction to decide whether to prompt for re-login (401) or simply
report "you don't have access" (403).
```

---

## Concept Unit: The Fix — Ownership Check

### The Problem

The vulnerable branch has every fact it needs to prevent this bug already sitting in local
variables — `requesting_username` and `requested_username` are both computed before the
lookup happens. Nothing new needs to be fetched or looked up; a comparison that already has
both of its operands is missing.

### Where This Lives

**File:** `diary_server.py`, same file as the previous units. **Change type:** insert a
new branch inside the existing `if parsed.path.startswith("/diary/"):` block, between the
`401` check and the final lookup.

### The New Code

```python
if requesting_username != requested_username:
    self.send_response(403)
    self.end_headers()
    self.wfile.write(b"forbidden: you may only read your own diary")
    return
```

### The Updated Project

```python
        if parsed.path.startswith("/diary/"):
            requested_username = parsed.path.split("/")[2]
            session_token = get_session_token(self)
            requesting_username = sessions.get(session_token)

            if not requesting_username:
                self.send_response(401)
                self.end_headers()
                self.wfile.write(b"not logged in")
                return

            if requesting_username != requested_username:      # ← new
                self.send_response(403)                        # ← new
                self.end_headers()                              # ← new
                self.wfile.write(b"forbidden: you may only read your own diary")  # ← new
                return                                           # ← new

            self.send_response(200)
            self.end_headers()
            self.wfile.write(users[requested_username]["diary"].encode())
            return
```

The `/diary/` branch now performs two distinct checks in sequence, in the correct order:
first, is there any valid session at all (authentication); second, given who that session
belongs to, do they match the specific diary being requested (authorization). Only a
request that passes both reaches the actual data lookup.

### Mechanical Walkthrough
- `requesting_username != requested_username` — **(a) first appearance of the actual
  fix**: a direct string comparison between the identity the session proves and the
  identity the URL names. Because this line runs only after the `401` branch has already
  returned for a missing session, `requesting_username` is guaranteed to be a real
- username here, not `None` — which is exactly why ordering these two checks correctly
  matters, as flagged in the previous unit.
- `self.send_response(403)` — **(b) hard concept just introduced**, applied for the first
  time: this is precisely the case the previous unit defined it for — a real, valid
  session that simply isn't allowed this particular resource.

### CS Lens

This is Lesson 3's fix, verbatim in shape: `(identity, resource) → allow or deny`, with
identity coming from the session and resource coming from the URL, evaluated as two
genuinely separate steps rather than one conflated check.

### SE Lens

An alternative worth naming: instead of comparing usernames directly, a system with
richer sharing needs (Ada wants to let Grace read one specific entry) would replace this
single equality check with a permissions lookup — `has_permission(requesting_username,
requested_username, "read")` — that could return `True` for more than just
"requester equals owner." The tradeoff is real: today's simple equality check is easy to
read and audit at a glance, but hard-codes "you may only ever see your own resources,"
which will need to be revisited the moment any legitimate sharing feature is requested.
Choosing the simple check today and refactoring later, once sharing is a real requirement
rather than a hypothetical one, is a reasonable engineering call — but it should be a
deliberate one, not an accident of never having written the check at all.

### Commands Needed

No new tools — same standard-library server as the previous units, run with `python3
diary_server.py`.

### Run It

```bash
python3 diary_server.py &
python3 attack_client.py
```

```
Login: b'logged in'
Ada reads her own diary: b"Ada's private thoughts: meeting notes for Friday"
Ada attempts Grace's diary -- status: 403 body: b'forbidden: you may only read your own diary'
```

Same attacker, same valid session, same URL edit that succeeded in the previous unit — now
refused, with a status code that accurately reports *why*: not "you aren't logged in," but
"you are logged in, and this specific request is not permitted."

This unit closes the gap the first Vulnerable Endpoint unit opened: the exact same code
path, given the exact same inputs, now produces a `403` instead of silently returning
Grace's private data.

---

## Connect the Pieces

Trace one concrete request end to end: Ada logs in via `/login?username=ada&password=hunter2`,
receives a session cookie tying her token to `"ada"` in `sessions`. She requests
`/diary/ada` — `requested_username` becomes `"ada"`, `requesting_username` (looked up from
her session) is also `"ada"`, the ownership check passes, and she receives her own diary.
She then requests `/diary/grace`, changing only the URL — `requested_username` becomes
`"grace"`, but `requesting_username` is still `"ada"`, from the very same still-valid
session. The ownership check added in the final unit catches exactly this mismatch and
returns `403` before the diary lookup ever runs. Nothing about her session changed between
the two requests; only the object reference in the URL did, which is exactly what this
lesson's opening Concept Unit named as the entire attack surface.

## What Breaks Without This

Delete the ownership-check branch and rerun `attack_client.py` — this reproduces the
Vulnerable Endpoint unit's exact output: `b"Grace's private thoughts: compiler bug on
line 42"` returned to Ada's session. Restoring the four-line `if requesting_username !=
requested_username` block brings back the `403` response. The entire fix for this lesson's
vulnerability lives in those four lines; everything else in the file is unchanged between
the vulnerable and fixed versions.

## Exercises

1. Add a third user, `"eve"`, and confirm that Eve's session, too, is refused access to
   both Ada's and Grace's diaries — the fix should generalize to any pair, not just the
   one pair tested above.
2. Change the ownership check to allow a hardcoded `"moderator"` account to read any
   diary, and explain, in your own words, why this is now a *permissions lookup* rather
   than a simple equality check, in the sense the SE Lens described.
3. Trigger the `401` branch on purpose (omit the `Cookie` header entirely from a request to
   `/diary/ada`) and confirm the response is `401`, not `403` — verifying the two status
   codes are still being used correctly, not just present in the code.

## Definition of Done

- [ ] You ran the vulnerable server and reproduced Ada successfully reading Grace's diary
- [ ] You added the ownership check and reproduced the `403` rejection
- [ ] You completed Exercise 3 and confirmed `401` and `403` are each returned in the
      correct circumstance, not interchangeably
- [ ] You can state, in one sentence, the difference between what `401` and `403` each
      assert about the requester
- [ ] You can point to the exact line that is present in the fixed server and absent from
      the vulnerable one
- [ ] `git add .` and `git commit -m "Lesson 16: broken access control -- IDOR as a real
      HTTP endpoint, and the ownership check that closes it"` in your `security-labs/`
      folder

**Next:** Lesson 17 opens Module F — Systems Security — with Buffer Overflows, where the
course leaves the web layer entirely and goes underneath it, into memory itself.
