# Curriculum Map — "Engineering Toolbox" Series

**How to use this file:** this is the standing plan. Each row is one
lesson, built per `lesson-schema.md` (throwaway labs, no back-to-back
code, full walkthroughs). Paste this whole file into a new chat any time
context gets compacted, and say which lesson number to build next.

**Status legend:** ✅ built · 🔲 not started

**Consolidation note:** the original catalog listed ~250 items. Many are
the same underlying concept with a different surface feature (`cp`,
`mv`, `rm` are one lesson in three small extensions; "encrypt a file"
and "AES demo" are the same concept unit). Consolidated list below is
~70 lessons. Where I merged several catalog items into one lesson, they're
listed after a `—` so you can see what got folded in.

---

## Track 1 — Shell & OS Literacy
*(Foundational — do early. Everything else assumes basic comfort here.)*

| # | Lesson | Folds in |
|---|--------|----------|
| 1 | Mini shell — read a command, run it, loop (`subprocess`, argv parsing) | — |
| 2 | ✅ Environment variables & PATH — how the OS finds a program at all | **Built — Lesson 2** |
| 3 | ✅ Bash vs. PowerShell, same task twice — list files, filter by size/date | **Built — Lesson 3** |
| 4 | ✅ Process manager / task manager — list, inspect, kill a process | **Built — Lesson 4** |
| 5 | ✅ CPU / memory usage viewer | **Built — Lesson 5** |
| 6 | ✅ Command history & a `.bashrc`/`$PROFILE` intro | **Built — Lesson 6** |
| 7 | ✅ Disk usage analyzer + directory tree printer | **Built — Lesson 7** |
| 8 | ✅ Symbolic links, explained and explored | **Built — Lesson 8** |

## Track 2 — File System
| # | Lesson | Folds in |
|---|--------|----------|
| 9 | ✅ Build your own `ls` | **Built — Lesson 9** |
| 10 | Build your own `cat` | — |
| 11 | Build your own `cp` / `mv` / `rm` (recycle-bin style, not permanent delete) | Recycle bin |
| 12 | Search every file in a folder (recursive walk + pattern match) | — |
| 13 | Find duplicate files by hash | — |
| 14 | Directory watcher — detect file changes as they happen | — |
| 15 | Auto-organize a Downloads folder (uses #14) | — |
| 16 | Compare two folders / sync two directories | File backup utility, folder cleanup |
| 17 | Zip an entire directory | — |

## Track 3 — Networking
| # | Lesson | Folds in |
|---|--------|----------|
| 18 | ✅ Send a message between two programs (sockets, TCP) | **Built — Lesson 1** |
| 19 | TCP echo server — loop instead of one-shot `accept()` | — |
| 20 | Simple chat server — multiple clients at once | — |
| 21 | UDP messenger — connectionless, compare to TCP | — |
| 22 | Build your own `ping` | — |
| 23 | Port scanner | — |
| 24 | HTTP client from raw sockets → then compare to `requests` | Download a webpage |
| 25 | Tiny web server (serves a real file over HTTP) | Static file server |
| 26 | File transfer utility (client sends a file, server saves it) | — |
| 27 | Broadcast on LAN / discover computers on the network | — |
| 28 | DNS lookup tool | — |
| 29 | Simple REST API (routes, JSON in/out) | URL router, URL shortener backend |
| 30 | WebSocket chat (compare to #20's plain sockets) | — |
| 31 | Reverse proxy | — |
| 32 | API rate limiter | — |

## Track 4 — Automation & Scheduling
| # | Lesson | Folds in |
|---|--------|----------|
| 33 | Run a script every N seconds — the honest loop + sleep version | — |
| 34 | Cron / Task Scheduler — the real OS-native version, both platforms | — |
| 35 | Auto-rename / batch-process files in a folder | Batch image converter |
| 36 | Auto email report (SMTP basics) | Daily journal generator |
| 37 | Website uptime checker | — |
| 38 | Clipboard history manager | — |
| 39 | Keyboard macro recorder | Mouse automation |
| 40 | Launch a program at OS startup | — |
| 41 | Scheduled backup (uses #34 + #16) | Auto backup utility, scheduled DB backup |

## Track 5 — Security
| # | Lesson | Folds in |
|---|--------|----------|
| 42 | Password hashing & salting | — |
| 43 | Generate secure passwords | — |
| 44 | File checksum generator / verify a download | — |
| 45 | Symmetric encryption — encrypt/decrypt text and files (AES) | Encrypt text, encrypt file, decrypt file |
| 46 | Asymmetric encryption (RSA demo) + digital signatures | — |
| 47 | API key authentication | — |
| 48 | Session cookies vs. JWT auth | — |
| 49 | Two-factor auth demo (TOTP) | — |

## Track 6 — Databases & Small Apps
| # | Lesson | Folds in |
|---|--------|----------|
| 50 | Tiny SQLite browser + SQL query runner | — |
| 51 | CSV importer/exporter into SQLite | — |
| 52 | Database backup & migration tool | — |
| 53 | Password vault (uses #45) | — |
| 54 | Pick-one small CRUD app: notes / expense tracker / contacts / bookmarks | Notes app, inventory tracker, expense tracker, contact manager, bookmark manager |

## Track 7 — Text & Data Formats
| # | Lesson | Folds in |
|---|--------|----------|
| 55 | JSON pretty printer, then a JSON *parser* from scratch | — |
| 56 | CSV / INI / config-file parser | — |
| 57 | Markdown parser (subset) | — |
| 58 | Arithmetic expression parser/evaluator (recursion + grammar) | — |
| 59 | Log analyzer + word frequency counter | — |
| 60 | Search-and-replace engine (intro to regex) | — |

## Track 8 — Compression & Binary Formats
| # | Lesson | Folds in |
|---|--------|----------|
| 61 | ✅ Hex/binary viewer | **Built — Lesson 61** |
| 62 | Run-length encoding | — |
| 63 | Huffman coding | — |
| 64 | Read a BMP file byte-by-byte (real binary format, no library) | Read PNG headers |

## Track 9 — Images & Audio (optional, high fun/effort payoff)
| # | Lesson | Folds in |
|---|--------|----------|
| 65 | Image resizer/cropper + grayscale/brightness filters | Convert PNG↔JPG, contrast |
| 66 | QR code generator + reader | — |
| 67 | Tone generator + metronome (raw audio, no library) | WAV reader |

## Track 10 — Algorithms & Data Structures
*(Language-agnostic core CS — do interleaved with the above, not all at once.)*

| # | Lesson | Folds in |
|---|--------|----------|
| 68 | Stack, queue, linked list from scratch | Dynamic array |
| 69 | Binary search + merge sort, visualized | Quick sort |
| 70 | Hash table from scratch (ties back to #13's hashing) | — |
| 71 | Binary tree + graph traversal / pathfinding | — |
| 72 | LRU cache (ties to real-world caching) | — |
| 73 | Priority queue / heap | — |

## Track 11 — Concurrency
*(After Track 3 & 4 — needs sockets/scheduling context.)*

| # | Lesson | Folds in |
|---|--------|----------|
| 74 | Thread pool + producer/consumer queue | — |
| 75 | Race condition demo → mutex fix | Deadlock simulator |
| 76 | Async task runner (`asyncio` intro) | — |

## Track 12 — Dev Tools (capstone-flavored, reuse everything above)
| # | Lesson | Folds in |
|---|--------|----------|
| 77 | Diff tool (uses #16's comparison logic) | Patch tool |
| 78 | Mini Git — init, add, commit, log only | — |
| 79 | Command-line argument parser (build the thing `argparse` is) | — |
| 80 | Simple logger library with rotating log files | Structured JSON logging |

---

## Track 13 — Systems Programming (C & Rust)
*(New track, added on request. Covers memory, pointers, and manual
allocation — concepts Python deliberately hides. Verified buildable:
`gcc` is preinstalled in this environment, and `rustc` installs cleanly
via `apt` from Ubuntu's own repos, so — unlike Lesson 3's PowerShell
half — everything in this track can be fully compiled and run for real,
not predicted.)*

| # | Lesson | Notes |
|---|--------|-------|
| 81 | Compiling and running C — the step Python skips entirely | source → object code → binary |
| 82 | Variables and memory addresses — pointers, `&` and `*` | — |
| 83 | Manual memory management — `malloc`/`free`, a real leak shown on purpose | — |
| 84 | Arrays, pointers, and C strings — a string is just bytes + a null terminator | ties back to Lesson 61 |
| 85 | Structs — bundling data without a class | — |
| 86 | The stack vs. the heap — where variables actually live, shown via real addresses | — |
| 87 | Undefined behavior — a real buffer overflow, shown safely and explained | — |
| 88 | Use-after-free — a dangling pointer bug, triggered on purpose | — |
| 89 | Rust: the same memory task, no garbage collector, no manual `free` — ownership | mirrors Lesson 3's side-by-side format |
| 90 | Rust: borrowing and the borrow checker catching a real bug at compile time | — |
| 91 | C vs. Rust vs. Python, side by side — the same use-after-free bug attempted in all three | closing/capstone comparison |
| 92 | (optional) Calling real C from Python with `ctypes` | ties this track back to the main curriculum |

**Suggested placement:** do this track *after* a solid chunk of Track 1
(you already have it) — the OS-level comfort there (processes, memory,
signals) makes C's pointer/memory model land as "the same ideas, less
protection," not a cold start. Not otherwise dependent on Tracks 2–12.

**On scope:** GPU/graphics/CUDA is explicitly deferred, not added —
revisit if/when you want it; it's a big enough domain to deserve its
own planning pass rather than being squeezed in here.

**On shell lessons:** no more dedicated bash/PowerShell lessons planned
beyond Lesson 3 — future lessons will use shell commands naturally
where needed (as most already do) rather than teaching the shell itself
again.


Rough order: **Track 1 → interleave Track 3 with Track 10 → Track 4 →
Track 5 → pick freely from 6/7/8/9 → Track 11 → Track 12 as capstones.**
Not a hard rule — pick lesson-by-lesson each session; I'll flag if
something assumes a concept from a lesson you haven't done yet.

## Open questions for you
- Any catalog items I dropped that you actually want back in?
- Anything on here you'd cut entirely?
- Want me to also save `lesson-schema.md` itself into this same
  reference set so a fresh chat has both in one paste?
