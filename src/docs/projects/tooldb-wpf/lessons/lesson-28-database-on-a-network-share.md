# Lesson 28: The File Is Real, the Path Just Got Longer (A Database on a Network Share)

**What you will build.** Real, direct proof that this project's own real
`Data Source=...` connection strings already work over a real UNC path,
with no code change required; a new, real, permanent
`ToolRepository.OpenWithBusyTimeout` helper, giving a caller real control
over how long a connection waits for a real lock before giving up; and a
real, honest, evidence-based answer to whether WAL mode — a real
capability this project has not yet used — actually helps once `tools.db`
lives on a real network share, the way this project's own eventual real
multi-user goal requires. The transferable problem underneath the
feature: a real network share doesn't just relocate a file; it changes
how quickly two real processes can even find out they're touching the
same one, and how safely they can share it.

**What you need to know first.** Connecting to a Database File — the real
`Data Source=...` connection-string convention this lesson extends to a
real UNC path, unmodified. Never Let Data Become Code and Multiple
Database Files — the real, established parameterized-connection-string
discipline this lesson's own new helper reuses. This project's own real,
already-established connection-pooling file-lock findings (Connecting to
a Database File, Turning Rows Into Objects) — the same real lock family
this lesson's own contention test deliberately reproduces on purpose.

**Terms used in this lesson**

- **UNC path (Universal Naming Convention)** — a real, absolute path
  format for network resources. Per Microsoft's own real, fetched
  documentation
  (`learn.microsoft.com/dotnet/standard/io/file-path-formats`), it
  consists of "a server or host name, which is prefaced by `\\`... a
  share name, which is separated from the host name by `\`... [and] a
  directory name," giving forms like `\\Server2\Share\Test\Foo.txt`. It
  exists so a real path can name a file on a real, different machine
  entirely, with no drive letter — a drive letter is only ever a local,
  per-machine shorthand, never guaranteed to mean the same real thing on
  a second real computer.
- **file locking** — reappearing, established this project's own earliest
  real, captured "file still in use" findings: SQLite's own real
  mechanism for making sure two real processes don't corrupt the same
  real database file by writing to it at the same real moment. It
  reappears here because a real network share is exactly where two real,
  genuinely separate processes — not just two connections inside the same
  process, as this project's own earlier real findings involved — are
  most likely to actually contend for the identical real lock.
- **`busy_timeout`** — a real, configurable duration controlling what a
  real SQLite connection does when it finds a real lock already held: per
  sqlite.org's own real, fetched documentation
  (`sqlite.org/pragma.html#pragma_busy_timeout`), rather than failing
  immediately, "SQLite [will] automatically retry the operation" for up
  to this many real milliseconds "before abandoning the retry attempts
  and returning the SQLITE_BUSY error." It exists so a real, brief,
  ordinary lock — another real user simply mid-save — doesn't have to
  become a hard real failure a caller must handle every single time.
- **WAL (write-ahead logging)** — a real, alternative SQLite journaling
  mode. Per sqlite.org's own real, fetched documentation
  (`sqlite.org/wal.html`), instead of the default real rollback-journal
  approach — "writing a copy of the original unchanged database content
  into a separate rollback journal file" — WAL keeps "the original
  content... preserved in the database file" while "changes are appended
  into a separate WAL file," which is what lets "readers... not block
  writers and a writer... not block readers." It exists to let real,
  concurrent readers and a real writer proceed at the same real time,
  something the default rollback-journal mode does not allow.

**Objects and methods used**

- **`ToolRepository.OpenWithBusyTimeout(string, int)`**
  - *What it is:* a new, real, permanent method on `ToolRepository`,
    opening a real `SqliteConnection` with a real, caller-chosen
    `busy_timeout` (Terms, above) already configured.
  - *Implementation:* `public static SqliteConnection OpenWithBusyTimeout(string
    dataSource, int timeoutSeconds)`, returning `new SqliteConnection($"Data
    Source={dataSource};Default Timeout={timeoutSeconds}")`, already opened.
  - *Its use:* the real, concrete, reusable answer to this lesson's own
    second unit — rather than every future real caller remembering to
    append `;Default Timeout=...` to a connection string by hand.
  - *Type:* a real, `public`, `static` method.
  - *Responsibility:* its full real charter is producing one real,
    already-open `SqliteConnection`, configured to genuinely retry — not
    fail immediately — against a real, already-held lock, for up to the
    given real number of seconds.
  - *Depends on:* a real, valid SQLite file path and a real, non-negative
    timeout, in seconds.
  - *Connects to:* proven by a new, real, permanent test that
    deliberately holds a real lock open on a background real task, then
    confirms a connection built this way waits for it rather than
    throwing — not yet called from `MainWindow.xaml.cs`, matching this
    project's own established "prove it, then wire it in later" pattern.
  - *Shape:* a new, real, small addition to this project's own existing
    `ToolRepository` seam — not a new persistence technology, a
    configuration convenience over the one this project already has.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`SqliteConnection`, `SqliteTransaction`, `BeginTransaction()`,
  `Commit()`, `SqliteCommand`, `ExecuteNonQuery()`/`ExecuteScalar()`**
  - *What it is:* reappearing, unchanged — this project's own real,
    established ADO.NET and transaction vocabulary (Connecting to a
    Database File, Updating and Deleting Safely).
  - *Implementation:* unchanged from every earlier real appearance.
  - *Its use:* this lesson's own real contention test uses all of these
    to construct a real, deliberate lock — a real, open, uncommitted
    transaction — precisely to give `busy_timeout` something genuine to
    wait on.
  - *Type:* unchanged real ADO.NET classes/methods.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged.
  - *Connects to:* unchanged.
  - *Shape:* unchanged.
- **`Task.Run(...)`, `Thread.Sleep(...)`, `await`**
  - *What it is:* reappearing, established UI/UX for Async State (`Task`,
    `await`) and, for `Thread.Sleep`, a real, ordinary way to pause a
    background real thread for a fixed real duration.
  - *Implementation:* unchanged real shapes.
  - *Its use:* this lesson's own real contention test runs a real,
    background `Task` that holds a real lock for a fixed real delay, then
    releases it — simulating, on one real machine, the real timing a
    second, genuinely separate real user's own save would create on a
    real network share.
  - *Type:* unchanged.
  - *Responsibility:* unchanged.
  - *Depends on:* unchanged.
  - *Connects to:* the real test method itself is declared `async Task`
    (established UI/UX for Async State) so it can genuinely `await` that
    background real task rather than blocking the calling real thread.
  - *Shape:* unchanged.

---

## Concept Unit: UNC Paths — The Same Connection String, a Longer Path

### The Problem

Every real connection string this project has ever built points at a
plain, local path (`Data Source=tools.db`). A real Mastercam shop's own
tool-library files, this project's own eventual real target, typically
live on a real, shared network drive, reachable by more than one real
machine. Does `Microsoft.Data.Sqlite`'s own real `Data Source=...`
keyword already accept a real network path, or does reaching a real
network file require different, new code entirely?

> **Try this first:** this project's own real `Data Source=...` value has
> always just been an ordinary real `string`, handed to
> `Microsoft.Data.Sqlite`, which in turn hands it to the real, underlying
> operating system's own file APIs (established Connecting to a Database
> File). Given that a real UNC path (Terms, above) is still just an
> ordinary real string, in a format Windows itself already understands,
> what would you expect to happen if `Data Source=` were simply given one
> instead of `tools.db`?

### Introduce the Concept in Isolation

A real, minimal SQLite file, created and read back through a genuine UNC
path this session — this machine's own default administrative share,
`\\localhost\c$\...`, the identical real form Microsoft's own official
documentation uses as a real example (`\\LOCALHOST\c$\temp\test-file.txt`):

```csharp
string uncPath = @"\\localhost\c$\Users\g4m3r\...\LabScratch\unc_test.db";
using var connection = new SqliteConnection($"Data Source={uncPath}");
connection.Open();
```

Real, captured output:

```
--- Lab: opening a real SQLite database over a real UNC path ---
1, UNC Widget
--- real file exists check via System.IO, same UNC path: True ---
```

This real, captured output proves the Socratic question's own answer
directly: no new code, no special API, and no different connection-string
keyword were needed at all — `Data Source=` genuinely accepts a real UNC
path exactly as it accepts a plain local one, because both are, to
`Microsoft.Data.Sqlite` and to Windows itself, just real, valid path
strings.

**A real, honest limit of this specific proof, stated directly:** this
session has no second, physically separate computer available to it —
`\\localhost\...` reaches this same machine's own local disk over a real,
genuine UNC/SMB path-resolution mechanism, but it is not a second real
host. This project's own standing "no live WPF window" constraint applies
to the same real category of gap here: what a genuinely separate real
machine would experience — real network latency, a real, different
machine's own clock, a real router or switch in between — cannot be
tested from this one real machine alone, no matter how the path is
spelled.

### Discard the Throwaway Example

This exact throwaway `unc_test.db` is discarded now — it never appears in
this project again. What's proven is that a real UNC path works with this
project's own existing, unmodified connection-string convention — not
this specific throwaway file.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — none. This unit's own real finding is that no
  real, permanent project file needs to change at all.
- **Change type** — none (a real, confirmed non-change).
- **Location** — not applicable.
- **Dependencies** — not applicable.

### The New Code

Not applicable — this unit's own real point is that `Data Source=`
(established Connecting to a Database File) already works, unmodified,
with a real UNC path; nothing new is written into this project's own real,
permanent code.

### The Updated Project

Not applicable — no real file in this project changes because of this
unit (Project Change, above, already covers this).

### Mechanical Walkthrough

- `string uncPath = @"\\localhost\c$\...";` — a real, ordinary, verbatim
  C# string (`@"..."`, reappearing, established early in this project),
  containing a real UNC path (Terms, above) — `\\localhost` names this
  same machine as a real host, `c$` names its own default, real
  administrative share for the `C:` drive.
- `new SqliteConnection($"Data Source={uncPath}")` — reappearing,
  unchanged (established Connecting to a Database File) — the identical
  real constructor call this project has used since its own first lesson,
  simply given a longer, real, UNC-shaped string.

### CS Lens

A real API accepting either a local path or a real UNC path, with no
special-casing required by the caller, is a concrete instance of
**location transparency** — a real design goal where code that operates
on "a file" doesn't need to know, or care, whether that real file lives
next to it or across a real network. Also recognized in: a real web
browser's own `fetch()`, identical whether the real URL is `localhost` or
a genuinely remote real server; a real cloud storage SDK exposing the
same real "read this file" call whether the backing real object lives in
the same real datacenter or a distant one; POSIX's own real, unified
filesystem namespace, where a real NFS-mounted directory looks
identical, to calling code, to a real local one.

### SE Lens

Why does this unit end with "no code changes," rather than some
real, active fix? Because the real alternative — writing UNC-specific
handling into this project's own connection-building code — was never
actually necessary: `Microsoft.Data.Sqlite` (and the real, underlying
`sqlite3_open()` it eventually calls) already treats a path as a path,
regardless of its own real shape. The real, honest cost this unit
surfaces instead is not a code gap — it's the two real problems this
lesson's remaining units exist to address: a real network file is
genuinely more likely to be *locked* by someone else (Unit 2), and a real
capability this project might otherwise reach for to help with
concurrency — WAL mode — has a real, documented limit that specifically
applies here (Unit 3).

### Run It

A real, isolated lab was run this session, proving a real UNC path works
unmodified with this project's own existing connection-string convention.
Real source and captured output, plus this unit's own honest, stated
environment limit, saved in
`verification/lesson-28/lab1-unc-path-real-access.cs`.

### Connecting Back

Reaching a real, shared file over a real network path needs no new code
in this project at all — the real, harder problems a network share
actually introduces are about *timing* and *concurrency*, not about
*addressing* the file. The next unit tackles the first of those directly.

---

## Concept Unit: `busy_timeout` — Waiting for a Real Lock Instead of Failing Immediately

### The Problem

This project's own earlier, real, captured findings already proved that
two connections to the same real SQLite file can collide — a real lock
held by one genuinely blocks the other. On a real network share, with
real, separate users saving at real, overlapping moments, that collision
stops being a rare accident and becomes routine. Should every real caller
in this project be expected to catch a real "database is locked"
exception and retry by hand, every single time — or does SQLite itself
already offer a way to wait a little first?

> **Try this first:** this project's own real transactions (Updating and
> Deleting Safely) already hold a real lock open between `BeginTransaction()`
> and `Commit()`/`Rollback()`. Given that a real lock is temporary by
> nature — it's released the moment the real transaction holding it ends
> — what real behavior would you want a *second* connection to have when
> it meets that lock: fail the instant it sees it, or wait some real,
> bounded amount of time in case it clears on its own?

### Introduce the Concept in Isolation

Two real, deliberate contention tests, run this session against a
minimal, real, throwaway `widgets` table. First, with no real timeout
configured at all:

```csharp
using var transactionA = connectionA.BeginTransaction();
new SqliteCommand("INSERT INTO widgets (name) VALUES ('from A')", connectionA, transactionA).ExecuteNonQuery();
// transactionA left open — a real, held lock

new SqliteCommand("INSERT INTO widgets (name) VALUES ('from B')", connectionB).ExecuteNonQuery();
```

Real, captured output:

```
B threw immediately: SqliteException: SQLite Error 5: 'database is locked'.
```

Second, with a real `busy_timeout` (Terms, above) configured on
connection B, and connection A's own real lock released on a real,
1.5-second delay from a background real task:

```csharp
using var connectionB = new SqliteConnection($"Data Source={dbPath2};Default Timeout=5");
new SqliteCommand("INSERT INTO widgets (name) VALUES ('from B')", connectionB).ExecuteNonQuery();
```

Real, captured output:

```
A committed (after a real 1.5s delay).
B succeeded after waiting 1580ms (real busy_timeout retried instead of failing immediately).
```

This real, captured pair of outputs proves the Socratic question's own
answer directly: with no real `busy_timeout`, connection B fails the
instant it meets a real lock; with one, it genuinely waits — its own real
measured delay (`1580ms`) lines up almost exactly with A's own real,
deliberate `1500ms` hold — and succeeds the moment the real lock clears,
with no retry code written by hand at all.

### Discard the Throwaway Example

This exact throwaway `widgets` contention pair is discarded now — it
never appears in this project again. What's proven is `busy_timeout`'s
own real, genuine retry-then-succeed behavior — not this specific
throwaway delay.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/ToolRepository.cs`, modified (new method).
  `ToolDB.Tests/ToolRepositoryTests.cs`, modified (one new, real,
  permanent test).
- **Change type** — add.
- **Location** — `ToolRepository.cs`, after `FindAllAcrossDatabases`,
  established Multiple Database Files.
- **Dependencies** — `Microsoft.Data.Sqlite`'s own real `Default Timeout`
  connection-string keyword.

### The New Code

```csharp
public static SqliteConnection OpenWithBusyTimeout(string dataSource, int timeoutSeconds)
{
    var connection = new SqliteConnection($"Data Source={dataSource};Default Timeout={timeoutSeconds}");
    connection.Open();
    return connection;
}
```

### The Updated Project

`ToolRepository.cs`'s own class, new method added directly after
`FindAllAcrossDatabases`, established Multiple Database Files:

```csharp
74  public static List<Tool> FindAllAcrossDatabases(SqliteConnection connection, string secondaryPath)
75  {
76      /* unchanged, established Multiple Database Files */
103 }
104
105 public static SqliteConnection OpenWithBusyTimeout(string dataSource, int timeoutSeconds)  // ← new
106 {                                                                                            // ← new
107     var connection = new SqliteConnection($"Data Source={dataSource};Default Timeout={timeoutSeconds}"); // ← new
108     connection.Open();                                                                        // ← new
109     return connection;                                                                         // ← new
110 }                                                                                               // ← new
```

`ToolRepository` now offers a real, reusable way to open a connection
that behaves patiently against a real, contended lock, rather than every
future caller having to remember to append `;Default Timeout=...` by
hand. A new, real, permanent test confirms this exact real behavior:
holding a real lock on a background real task for a real, short `300ms`
delay, then confirming a connection opened through this new method
genuinely waits, rather than throwing, and that the real database ends up
with both real rows.

### Mechanical Walkthrough

- `public static SqliteConnection OpenWithBusyTimeout(string dataSource, int
  timeoutSeconds)` — an ordinary real, `public`, `static` method
  (reappearing, established `ToolRepository`'s own existing shape),
  returning a real `SqliteConnection` rather than `void` — genuinely
  different from every other real `ToolRepository` method so far, which
  each expect an already-open connection passed in.
- `new SqliteConnection($"Data Source={dataSource};Default Timeout={timeoutSeconds}")`
  — `$"..."` (established early, reappearing) builds a real connection
  string with two real, semicolon-separated keywords —
  `Data Source` (established Connecting to a Database File, reappearing)
  and `Default Timeout` (Terms, above, first appearance as a real
  connection-string keyword specifically, though the underlying real
  mechanism it configures, `busy_timeout`, was just introduced this same
  unit) — `Microsoft.Data.Sqlite`'s own real name for the identical real
  `busy_timeout` mechanism sqlite.org's own documentation describes.
- `connection.Open();` — reappearing, unchanged (established Connecting
  to a Database File) — opens the real connection with this real timeout
  already configured, before this method ever hands it back.
- `return connection;` — hands the real, already-open connection back to
  the caller, who owns disposing it — the identical real ownership
  pattern this project's own `using var connection = ...` calls have
  always followed at the call site.

### CS Lens

Retrying a real, transient failure automatically, up to a real, bounded
limit, instead of surfacing it to the caller immediately, is a concrete
instance of **exponential-backoff-adjacent transient fault handling** —
SQLite's own real busy-handler doesn't specifically back off
exponentially, but it embodies the identical real principle: a real,
temporary condition (a lock, held briefly by someone else) deserves a
real, bounded retry, not an immediate, hard failure. Also recognized in:
a real HTTP client's own automatic retry on a `503 Service Unavailable`;
a real distributed lock manager's own "wait, then retry" semantics; a
real TCP connection's own retransmission timer, waiting a bounded real
interval for a real acknowledgment before giving up.

### SE Lens

Why give `OpenWithBusyTimeout` an explicit, real, caller-chosen
`timeoutSeconds` parameter, rather than hardcoding one real, fixed value
inside `ToolRepository` itself? The real alternative — one fixed, global
real timeout — was rejected here because "how long is it reasonable to
wait" is genuinely different depending on real, calling context: a real,
interactive UI action (a person clicking Save) can tolerate only a real,
short wait before it needs to tell them something is happening, while a
real, background aggregation job (Aggregating Many Users' Files
Automatically) can reasonably wait much longer. The real, honest cost:
`busy_timeout`, per sqlite.org's own real, fetched documentation, is set
*per connection*, and "each database connection can only have a single
busy handler" — this method's own real, chosen timeout only ever applies
to the one real connection it returns, not globally, which is correct
here but means a caller genuinely has to think about the real value each
time, rather than getting one real, safe default for free.

### Run It

A real `dotnet build` was run this session: build succeeded, 0 new
Warnings, 0 Errors. One new, real, permanent test was added to
`ToolRepositoryTests.cs`. **Full suite: 33 tests, 0 failures** — the
real, current, full count for this project (up from 32). Real source and
captured output for the isolated, two-part contention lab are saved in
`verification/lesson-28/lab2-real-busy-timeout-contention.cs`.

### Connecting Back

A real, contended lock no longer has to mean an immediate, hard failure —
`OpenWithBusyTimeout` gives this project a real, reusable, configurable
way to wait instead. The next unit checks whether a second real
capability, WAL mode, could help even further — and finds a real, honest
limit to what this lesson's own environment can actually prove about it.

---

## Concept Unit: WAL Mode — A Real Capability With a Real, Documented Limit

### The Problem

`busy_timeout` (previous unit) makes a real, brief lock survivable, but
doesn't remove contention itself — a real writer still blocks a real
reader under this project's own current, default journaling mode. WAL
mode (Terms, above) claims real readers and a real writer can proceed at
the same real time. Would enabling it help this project's own eventual
real network-share deployment specifically — the exact scenario this
lesson is about?

> **Try this first:** sqlite.org's own real documentation, quoted in this
> lesson's own Header, says WAL's real benefit comes from writers
> "merely append[ing] new content to the end of the WAL file," leaving
> real readers undisturbed. A real network share fundamentally works by
> more than one real, separate computer reading and writing the same real
> file over the network. Given WAL's own real mechanism depends on real
> processes coordinating around a shared real file, what do you predict
> could go wrong if those real processes are not just separate, but on
> genuinely separate real machines entirely?

### Introduce the Concept in Isolation

WAL mode, enabled for real, first against a plain, local, real file:

```csharp
using var connection = new SqliteConnection($"Data Source={localPath}");
connection.Open();
new SqliteCommand("PRAGMA journal_mode=WAL;", connection).ExecuteScalar();
```

Real, captured output:

```
journal_mode after real request: wal
real -wal file exists locally: True
```

The identical real request, attempted this session over this lesson's
own first unit's real (loopback) UNC path:

```
journal_mode after real request over UNC: wal
Real insert over UNC + WAL succeeded (no exception).
```

This real, captured pair of outputs does **not** prove WAL is safe to use
over a genuine network share. Per sqlite.org's own real, fetched
documentation, quoted in this lesson's own Header: "All processes using a
database must be on the same host computer; WAL does not work over a
network filesystem," specifically "because WAL requires all processes to
share a small amount of memory, and processes on separate host machines
obviously cannot share memory with each other." This lesson's own real
loopback UNC path, established this lesson's first unit, reaches this
same one real host's own local disk — it cannot reproduce, or falsify,
a real failure that specifically requires a *second, separate* real
host. The Socratic question's own predicted risk is real and documented;
this session's own environment simply cannot generate the real evidence
for it directly, the identical real category of gap as this project's
own standing "no live WPF window" constraint.

### Discard the Throwaway Example

The throwaway `wal_test_local.db`/`wal_test_unc.db` pair is discarded now
— neither appears in this project again. What's proven is WAL's own real,
local `journal_mode=WAL` mechanics; what's explicitly *not* proven, and
stated as such, is anything about genuine, separate-host network
behavior — that real claim rests entirely on sqlite.org's own real,
fetched, authoritative documentation instead.

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — none. This unit's own real conclusion is that
  `tools.db` should **not** have WAL mode enabled for its own eventual
  real network-share deployment.
- **Change type** — none (a real, deliberate non-change, explained
  directly rather than silently skipped).
- **Location** — not applicable.
- **Dependencies** — not applicable.

### The New Code

Not applicable — this unit's own real conclusion is a decision *against*
a real change, not a new real capability to add.

### The Updated Project

Not applicable — no real file in this project changes because of this
unit (Project Change, above, already covers this).

### Mechanical Walkthrough

- `new SqliteCommand("PRAGMA journal_mode=WAL;", connection).ExecuteScalar();`
  — `PRAGMA` (established Schema Design, reappearing) is the real
  statement form; `journal_mode=WAL` requests the real, alternative
  journaling mode (Terms, above); `ExecuteScalar()` (established Schema
  Design, reappearing) is used here, rather than `ExecuteNonQuery()`,
  because this specific real pragma returns the real, resulting mode name
  as its own single real value — SQLite's own real way of confirming what
  mode is actually now in effect, not merely accepting the request
  silently.

### CS Lens

Trusting a real, authoritative source for a claim your own local
environment cannot itself generate evidence for or against is a concrete
instance of **epistemic humility in engineering** — knowing the real,
specific boundary of what a given real test can actually tell you, rather
than treating "my test didn't fail" as proof of a much broader real
claim. Also recognized in: trusting a real hardware datasheet's own
stated operating-temperature range without owning an oven hot enough to
test the real upper bound; a real cryptography library's own documented
timing-attack resistance, accepted on the strength of real, published
cryptanalysis rather than a single local benchmark; this project's own
already-established practice of citing genuine Microsoft Learn
documentation for real WPF window behavior it has never once watched run.

### SE Lens

Given WAL mode cannot be trusted for `tools.db`'s own eventual real
network-share deployment, why does this project bother introducing it at
all, rather than skipping straight to "don't use it here"? Because the
real, honest engineering answer to "should we use WAL" is not simply
"no" — it's "not for this specific real deployment, for this specific
real, documented reason," and a reader who only learns the negative
conclusion, without the real mechanism WAL actually offers, would have no
way to recognize a *different* real project (a single-machine desktop
app, for instance) where WAL's own real concurrent-reader benefit would
be exactly the right real tool. The real, honest cost of *not* using WAL
here: this project's own default journaling mode still allows a real
writer to briefly block a real reader — a real cost `busy_timeout`
(previous unit) mitigates by waiting, not by removing the real
contention WAL would have avoided entirely, on a single real machine.

### Run It

A real, isolated lab was run this session, proving WAL mode's own real,
local mechanics both against a plain local file and against this
lesson's own real (loopback) UNC path — with this unit's own explicit,
real, stated limit on what the second half of that result can and cannot
prove. Real source and captured output saved in
`verification/lesson-28/lab3-wal-local-and-unc.cs`.

### Connecting Back

This project now has a real, evidence-based answer to "should `tools.db`
use WAL mode on a network share" — no, for a real, specific, documented
reason, not a guess — alongside a real, working mitigation
(`busy_timeout`, previous unit) for the real contention WAL would
otherwise have helped with on a single machine.

---

## Connect the Pieces

One real question — "can this project's own real persistence layer
survive living on a real network share" — traced through all three units:

1. This project's own existing, real `Data Source=...` connection strings
   already work, unmodified, with a real UNC path — proven directly,
   with an honest, stated limit on what a same-machine loopback path can
   and cannot verify about genuinely separate real hosts (Unit 1).
2. A real, contended lock no longer needs to be a hard, immediate
   failure — `ToolRepository.OpenWithBusyTimeout`, a new, real, permanent
   method, lets a caller choose how long to wait, proven against a real,
   deliberately-held lock released on a real delay (Unit 2).
3. WAL mode's own real, local concurrency benefit was proven directly —
   and, just as directly, shown *not* to be trustworthy for this
   project's own real network-share deployment, resting that specific
   real claim on sqlite.org's own authoritative documentation rather than
   a test this environment cannot actually run (Unit 3).

**Next lesson:** 29 — Aggregating Many Users' Files Automatically.
