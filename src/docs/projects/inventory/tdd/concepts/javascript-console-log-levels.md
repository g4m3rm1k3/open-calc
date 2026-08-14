# Concept: `console.debug`/`info`/`warn`/`error` Are Different Methods, Not Aliases

**What you'll understand by the end:** that the browser console has real,
separate severity levels built in, and that reaching for the matching
method (not always `console.log`) is what makes those levels actually
useful — to DevTools' own filtering, and to anything else reading the
console.

**Prerequisites:** `logging-and-observability.md`.

## Setup

Any browser, or Node.js (`console` is a global in both). No install
needed.

## The Problem

`logging-and-observability.md` already established that a log needs a
real severity, not just text, so a reader (human or tool) can tell
"routine" from "something's wrong" without reading every line. JavaScript
code across this whole project so far has used `console.log` for
everything — which works for a human glancing at output during
development, but carries no severity at all: a browser's own DevTools
console has no way to let someone filter "show me only the errors" if
every message was logged through the exact same method.

## The Concept, Isolated

```javascript
console.debug("routine detail, usually hidden by default");
console.info("something routine happened");
console.warn("something worth a second look");
console.error("something actually went wrong");
```

**Real output, captured this session via Playwright reading a live
browser's console** (each line's real, distinct type, not four identical
`"log"` entries):
```
[browser info] ...fetchState succeeded: spindle 1000rpm
[browser error] ...fetchState failed: Failed to fetch
```

**What this proves:** the exact same kind of message — one about a
successful fetch, one about a failed one — arrived at Playwright's own
console listener tagged with a genuinely different, real `type()`
(`"info"` vs. `"error"`), because the code called a different method for
each, not because of anything in the message text itself. A tool
reading console output (DevTools' own severity filter, or, here,
Playwright) can separate them without parsing a single word of the
message.

## Mechanical Walkthrough

- `console.log` — **(b) reappearing**, used constantly since early
  lessons — the default, severity-less method.
- `console.debug` — **(a) first appearance** — intended for detail only
  worth seeing while actively debugging; several browsers hide `debug`-level
  messages by default unless a "Verbose" filter is turned on.
- `console.info` — **(a) first appearance** — routine, worth-knowing
  information; DevTools typically renders this with a plain info icon,
  visually distinct from a warning or error.
- `console.warn` — **(a) first appearance** — DevTools renders this with
  a yellow warning icon and (in most browsers) its own stack trace,
  automatically, with no extra code.
- `console.error` — **(a) first appearance** — DevTools renders this with
  a red error icon and a full stack trace automatically; several
  browsers also surface `console.error` calls in an aggregate "N errors"
  counter elsewhere in the UI (the tab icon, a DevTools badge).

## CS Lens

This is the same **severity-as-metadata** idea `logging-and-observability.md`
already covers for Python's `logging` module — level filtering there
happens inside application code (a configured threshold); here, the
browser's own DevTools does the equivalent filtering natively, because
the four methods are already distinct at the platform level, not just by
convention.

Also recognized in: syslog's own numeric severity levels (0–7, the
original source most languages' `DEBUG`/`INFO`/`WARN`/`ERROR` naming
descends from), and any GUI framework's own distinct toast/notification
styles for info versus error messages — same signal, different surface.

## SE Lens

The real, easy alternative — `console.log` for everything, distinguishing
severity only by reading the message text — throws away information a
tool could otherwise use for free: DevTools' own error/warning counters,
its severity filter dropdown, and (as this project's own `logger.ts` now
relies on) any code that wants to *dispatch* on level, not just print it.
The cost of calling the right one of four near-identical methods instead
of always reaching for `console.log` is genuinely zero extra typing once
it's a habit — which is exactly why skipping it, project-wide, is a debt
worth naming rather than a neutral style choice.

## Connection

Builds on `logging-and-observability.md`. Directly relevant to
`cnc-web/src/logger.ts` — the small hand-rolled leveled logger this
project's own frontend needed, since JavaScript ships no built-in module
equivalent to Python's `logging` (no standard way to set a minimum level
and have it filter automatically) — mapping each of this project's own
log levels to the one browser method DevTools already treats specially,
rather than reinventing severity rendering from scratch.

## Try It Yourself

1. Open a real browser's DevTools console, call all four methods, and
   use the console's own "Default levels" filter dropdown to hide
   `Verbose`/`Info` and show only `Warnings`/`Errors` — confirm the
   `console.log`/`console.info` lines disappear while `console.warn`/
   `console.error` remain, with zero code changes.
2. Call `console.error(new Error("real error object"))` (an `Error`
   instance, not a string) and compare the resulting DevTools entry
   against `console.error("just a string")` — note the automatic stack
   trace the `Error` object triggers.
3. Look up why several style guides discourage leaving `console.debug`/
   `console.log` calls in committed production code but consider
   `console.warn`/`console.error` acceptable — reasoning about the
   difference between a developer's own transient debugging aid and a
   real, permanent operational signal.
