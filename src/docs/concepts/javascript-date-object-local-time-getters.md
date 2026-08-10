# Concept: `Date`, Epoch Milliseconds, and Local-Time Getters

**What you'll understand by the end:** how a single number (milliseconds
since a fixed point in time) becomes a real calendar date and
wall-clock time, in the viewer's own timezone, without a formatting
library.

**Prerequisites:** `typescript-type-annotations.md`.

## Setup

Any JavaScript runtime. No install needed. `Date` is a real, built-in
global — always available, no import required.

## The Problem

A file's "last modified" time, read from the real filesystem
(`node-fs-statsync-file-metadata.md`), arrives as a single number:
milliseconds since the Unix epoch (midnight, January 1, 1970, UTC —
the same fixed reference point every Unix-derived system measures time
from). That number is exact and unambiguous, but not human-readable —
`1785907200123` means nothing to a person looking at a "Modified"
field. It has to be converted into the real calendar date and clock
time a person would recognize, in *their* local timezone, not UTC.

## The Isolated Example

```javascript
const epochMs = 1735689600000;
const date = new Date(epochMs);

console.log("getFullYear():", date.getFullYear());
console.log("getMonth():", date.getMonth());
console.log("getDate():", date.getDate());
console.log("getHours():", date.getHours());
console.log("toISOString():", date.toISOString());
```

**Real output, this session (a machine set to US Eastern time):**
```
getFullYear(): 2024
getMonth(): 11
getDate(): 31
getHours(): 19
toISOString(): 2025-01-01T00:00:00.000Z
```

**What this proves:** the exact same instant in time (`epochMs`) reads
as "December 31, 2024, 7 PM" in local getters, but as "January 1, 2025,
00:00 UTC" via `toISOString()` — real, visible proof that `getFullYear`/
`getMonth`/`getDate`/`getHours` report the **local** calendar date and
time (whatever timezone the running machine is actually set to), while
`toISOString()` always reports UTC, regardless of local timezone. The
same number produces two different-looking, both-correct answers,
depending only on which method reads it.

## Mechanical Walkthrough

- `new Date(epochMs)` — **(a) first appearance** — constructs a `Date`
  object from a single number of milliseconds since the epoch. This is
  the *inverse* of what `fs.statSync`'s `mtimeMs` already produced
  (`node-fs-statsync-file-metadata.md`) — that gave a plain number
  specifically so it could cross an IPC boundary; `new Date(...)`
  is where the receiving code turns that plain number back into a real
  date object to read from.
- `.getFullYear()` — the four-digit year, in local time. Named
  "`Full`Year" specifically to distinguish it from a legacy,
  two-digit-year method (`getYear()`, not used here or anywhere
  current) that is deprecated for exactly the "Y2K" ambiguity a
  two-digit year invites.
- `.getMonth()` — **(a) first appearance, a real, deliberate quirk**:
  zero-indexed — January is `0`, December is `11`. This is why the
  real project code (below) writes `date.getMonth() + 1` rather than
  using the raw value directly.
- `.getDate()` — the day of the month (`1`–`31`). Note the name: this
  is *not* the same as `.getDay()` (a different, real method, not used
  here, that returns the day of the *week*, `0`–`6`) — a real, easy
  mix-up worth naming explicitly.
- `.getHours()` / `.getMinutes()` / `.getSeconds()` — reappearing shape
  of the same local-time-getter family, for the clock-time portion.

## CS Lens

This is **representation conversion between two equivalent forms** of
the same underlying value: a single linear number (milliseconds since
a fixed epoch — easy to store, compare, and transmit) and a structured,
human-readable calendar representation (year/month/day/hour/minute/
second — easy to read, hard to compare directly). Neither form is more
"correct" than the other; each is suited to a different consumer.
Storing time as one number and converting to structured form only when
displaying it is the same principle behind storing an angle in radians
internally and converting to degrees only for display, or storing a
color as one packed integer and unpacking to R/G/B only when rendering.

Also recognized in: Unix's own `time_t` (seconds since the epoch,
the C-language ancestor of this same idea), database `TIMESTAMP`
columns typically stored as one number internally and formatted only
at query/display time, and any logging system that stores an epoch
timestamp per line but renders human-readable dates in its UI.

## SE Lens

Converting `mtimeMs` to a `Date` and reading its *local* getters,
rather than displaying the raw millisecond number or a UTC string,
means the displayed "Modified" time always matches what the file
manager, terminal, and every other local tool on the *same machine*
would show — because they all ultimately read the same local timezone
setting. Using `toISOString()` instead would show UTC everywhere,
technically correct but confusing for someone in any other timezone
comparing this panel against their own file manager's timestamp.

## Connection

Builds on `node-fs-statsync-file-metadata.md` (the `mtimeMs` number
this `Date` is built from) and reuses `.padStart(2, "0")`
(`javascript-hex-color-blending.md`'s `rgbToHex` already established
this exact zero-padding pattern for a different value — the same
construct, same language, same purpose: force a number into a
fixed-width, zero-padded string) to keep single-digit months, days,
hours, minutes, and seconds two characters wide (`"05"`, not `"5"`).
Used directly in `cnc-editor-electron/src/renderer.ts`'s
`formatModified`, which builds a `"YYYY-MM-DD HH:MM:SS"` string —
deliberately matching the real reference's own
`info.modified.strftime("%Y-%m-%d %H:%M:%S")` format, in `gui/program_summary_panel.py`,
byte-for-byte, so the same file shows the identical timestamp text in
both the original and the ported application.

## Try It Yourself

1. Change `epochMs` to a value exactly at a month boundary (the first
   millisecond of a month) and confirm `.getMonth()` reports the *new*
   month, zero-indexed, and `.getDate()` reports `1` — not `0`, since
   `.getDate()` (unlike `.getMonth()`) is one-indexed.
2. Remove `+ 1` from `date.getMonth() + 1` in a copy of `formatModified`
   and compare the output for a date in, say, March — confirm it now
   reads `"02"` instead of `"03"`, a real, easy-to-introduce off-by-one
   bug this concept's zero-indexing quirk causes if forgotten.
3. Run `new Date(0)` and read its `.toISOString()` — confirm it prints
   exactly `1970-01-01T00:00:00.000Z`, the literal definition of the
   epoch this whole numbering system counts forward from.
