# Concept: Race Conditions and the Stale-Response Guard

**What you'll understand by the end:** why an asynchronous request that
takes real time to answer can come back *after* the situation that
asked for it has already changed, and the one-line check that stops a
late answer from overwriting something newer.

**Prerequisites:** `javascript-promises-async.md`, `typescript-async-await.md`.

## Setup

Any JavaScript runtime with real asynchronous I/O — this concept is
demonstrated here with a simulated delay (`setTimeout`), but applies
identically to any real network request, file read, or IPC round trip.

## The Problem

Some operations don't return instantly — asking a server for data,
reading a file, or (in this project) asking Electron's main process for
a file's real size and modified time over IPC. Between the moment that
request goes out and the moment its answer comes back, the program
keeps running. If the user does something else in that window — clicks
a different tab, opens a different document — the *situation* the
original request was about has changed by the time the answer arrives.
Applying a stale answer to the *new* situation produces a real, visible
bug: information about document A silently appearing while document B
is on screen.

## The Isolated Example

`race-lab.js` (a disposable host — never touched again after this lab):
```javascript
let currentUser = "alice";

function fetchProfileSlowly(user) {
  const delay = user === "alice" ? 500 : 50;
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${user}'s real profile data`), delay);
  });
}

function loadProfile(user) {
  currentUser = user;
  fetchProfileSlowly(user).then((profile) => {
    if (currentUser !== user) {
      console.log(`DROPPED stale response for ${user}: "${profile}"`);
      return;
    }
    console.log(`Applied response for ${user}: "${profile}"`);
  });
}

loadProfile("alice");
loadProfile("bob");
```

**Real output, this session:**
```
Applied response for bob: "bob's real profile data"
DROPPED stale response for alice: "alice's real profile data"
```

**What this proves:** `loadProfile("alice")` started first, but its
slow (500ms) request finished *second* — after `loadProfile("bob")`
had already started and finished its own fast (50ms) request and
changed `currentUser` to `"bob"`. Without the `currentUser !== user`
check, alice's late-arriving answer would have overwritten bob's
already-correct, already-displayed profile with stale data — the exact
shape of bug this guard exists to prevent.

## Mechanical Walkthrough

- `currentUser = "alice"` — **(a) first appearance**, a single mutable
  variable representing "whichever situation is currently active" —
  the one piece of shared, changing state a late response must be
  checked against.
- `fetchProfileSlowly(user)` returns a Promise (`javascript-promises-async.md`)
  that resolves after a variable delay — standing in for any real slow
  operation (an IPC round trip, a network request) whose completion
  order is not guaranteed to match its start order.
- `loadProfile(user)` sets `currentUser = user` **before** the request
  even goes out — recording, synchronously, what the "current situation"
  is at the moment of asking.
- Inside `.then(...)`, `if (currentUser !== user) { return; }` — **(a)
  first appearance of this specific pattern** — compares the situation
  captured in the closure (the `user` parameter, fixed forever once
  `loadProfile` was called) against whatever `currentUser` has become
  *by the time this callback actually runs*. If they differ, something
  newer has already taken over, and this answer is simply discarded.

## CS Lens

This is a **race condition**: the correctness of the program depends on
the relative *timing* of two independent operations, not just their
*order of initiation*. Alice's request started first but "lost the
race" to bob's faster one. The fix is a form of **optimistic
concurrency check** — rather than preventing the race from happening at
all (which would require blocking, freezing the UI until each request
finishes before allowing another), the code lets both requests run
freely and simply verifies, cheaply, at the one moment it matters
(when a result is about to be applied) whether that result is still
relevant.

Also recognized in: a search-as-you-type box where fast keystrokes fire
overlapping requests and only the response matching the *current* text
box content should update the results list; a video game's network
code discarding an old position update that arrives after a newer one;
any UI framework's built-in request-cancellation or "abort stale
fetch" mechanisms, which solve the identical problem a different way
(cancelling the request itself, rather than discarding its answer).

## SE Lens

The alternative — trusting that responses always arrive in the order
their requests were sent — is a genuinely false assumption for any real
asynchronous system: network latency, OS scheduling, and (in this
project's real case) simply how fast Electron's main process happens to
be able to call `fs.statSync` at that moment, are all real, variable
factors outside the calling code's control. Guarding at the point of
*applying* a result, rather than trying to prevent overlapping requests
from ever happening, keeps the calling code simple (no queue, no
cancellation, no locking) while still being fully correct — the guard
is one `if`, checked against state the code already has to track.

## Connection

Builds on `javascript-promises-async.md` (the asynchronous request
itself) and `electron-contextbridge-preload-ipc.md` (the specific
`ipcRenderer.invoke` round trip this project sends real requests
through). Used directly in `cnc-editor-electron/src/renderer.ts`'s
`refreshProgramSummary`: `window.api.getFileInfo(path).then((info) =>
{ if (getActiveDocument().path !== path || info === null) { return; }
... })` — `path` is the document's path *at the moment the request was
sent*, captured by the closure; `getActiveDocument().path` is whatever
tab is actually active *by the time the answer comes back*. If the
user switched tabs in between, the two differ, and the stale file info
is silently dropped instead of being painted onto the wrong document.

This lab's own code — `race-lab.js` — is deleted now; it was written
only to prove this specific failure mode and its fix before trusting
the pattern inside the real project.

## Try It Yourself

1. Swap the two delays (`alice` fast, `bob` slow) and predict the
   output before running it — confirm whichever response finishes
   *last* is the one compared against a `currentUser` that has already
   moved on, and gets dropped, regardless of which one was requested
   first.
2. Remove the `if (currentUser !== user) { return; }` guard entirely
   and rerun with the original delays. Confirm both responses are now
   applied, in arrival order — with alice's stale data printing *after*
   and overwriting bob's, even though bob is the real, currently active
   user. This is the exact bug the guard exists to prevent, made
   visible.
3. Add a third `loadProfile("carol")` call, with a delay between
   alice's and bob's, and trace by hand which response(s) would survive
   the guard before running it to check your prediction.
