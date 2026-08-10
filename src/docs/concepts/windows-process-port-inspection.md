# Concept: Finding Which Process Holds a Port (Windows/PowerShell)

**What you'll understand by the end:** how to go from "something is using
port 5180" to "here is the exact, real process — its PID, its name, its
executable path — that's holding it," using two real PowerShell cmdlets,
on a machine where you have no idea in advance what's running.

**Prerequisites:** `network-port.md`.

## Setup

Windows 10/11, PowerShell (built in, no install). No project code needed —
these are OS inspection commands, run directly in a terminal.

## The Problem

`network-port.md` already established that a port can only be bound by one
program at a time — a second attempt fails with "address already in use."
That fact alone doesn't say *which* program is holding it. A developer
staring at a failed `EADDRINUSE` needs a real, concrete next step: find the
actual process occupying that port, see what it is, and decide whether to
kill it or use a different port.

## The Isolated Example

```powershell
Get-NetTCPConnection -LocalPort 5180 -State Listen |
    Select-Object OwningProcess

Get-Process -Id 28424 | Select-Object Id, ProcessName, Path, StartTime
```

**Real output, run this session, against an actual stray dev server:**
```
OwningProcess
-------------
        28424

Id          : 28424
ProcessName : node
Path        : C:\nvm4w\nodejs\node.exe
StartTime   : 7/19/2026 1:12:32 PM
```

**What this proves:** a port number alone resolved to one real, specific
operating-system process — not a guess, a name pulled from an actual
running `node.exe`, started two days before this check, with an exact PID
(`28424`) that can now be acted on directly (inspected further, or
terminated).

## Mechanical Walkthrough

- `Get-NetTCPConnection -LocalPort 5180 -State Listen` — **(a) first
  appearance** — a PowerShell cmdlet querying the OS's real network-stack
  state (the same information `netstat -ano` reports in older tooling),
  filtered to exactly one local port and one connection state
  (`Listen` — a socket bound and waiting for incoming connections, as
  opposed to `Established`, an already-connected pair).
- `OwningProcess` — **(a) first appearance** — a real property on the
  connection object: the PID of the process that currently holds this
  socket. The OS tracks this itself; the cmdlet is just surfacing it.
- `Select-Object OwningProcess` — **(b) reappearing** — PowerShell's own
  object-pipeline projection, already implicit in every `Select-Object`
  used earlier in this project's own diagnostic work this session.
- `Get-Process -Id 28424` — **(a) first appearance** — looks up one
  process by its numeric PID and returns a real object describing it (as
  opposed to `Get-Process -Name node`, which would return *every* process
  with that name — not useful when several unrelated `node.exe` processes
  are running at once, which turned out to be exactly the case on this
  machine).
- `Path` — **(a) first appearance** — the real, on-disk executable path
  the OS launched for this PID, confirming exactly which installed copy
  of `node` is running (there can be more than one on a machine using a
  version manager).

## CS Lens

This is **reverse lookup through OS-maintained state**: the operating
system already tracks the full mapping from every open socket to the
process that owns it (it has to, to deliver incoming packets to the right
program); `Get-NetTCPConnection` and `Get-Process` are just two different
read-only views into state the kernel was maintaining regardless of
whether anyone asks.

Also recognized in: `lsof -i :PORT` (the same lookup on macOS/Linux, a
different tool over identical underlying kernel state), any process
explorer GUI's own "which process owns this handle/port/file" search, and
a database's own reverse index (going from a value back to the row that
contains it, rather than the row forward to its values).

## SE Lens

The real alternative — restarting the machine, or guessing which of
several running dev-server processes to kill — is slower and destroys
more state than necessary. Two read-only queries, chained by one shared
value (the PID), get to the exact right process with nothing else
disturbed — the same "narrow first, act second" discipline as a
`WHERE`-clause query before an `UPDATE`, rather than scanning and editing
by hand.

## Connection

Builds on `network-port.md`'s "one program per port" fact — this is the
real tool for the question that fact immediately raises: *which* program,
specifically, right now. Directly relevant to this project's own next
concept, `os-process-tree-and-orphaned-processes.md`: the same
`Get-Process` cmdlet is how an orphaned child process actually gets
discovered in the first place, not just reasoned about abstractly.

## Try It Yourself

1. Run `Get-NetTCPConnection -LocalPort <port> -State Listen` against a
   port you know is free (pick a high, unused number) and read the real
   error — confirm it fails loudly rather than silently returning nothing
   useful.
2. Chain both commands into one line using `$()` subexpression syntax —
   `Get-Process -Id (Get-NetTCPConnection -LocalPort 5180 -State Listen).OwningProcess`
   — and confirm it produces the same real result as the two separate
   calls above.
3. Look up `Get-CimInstance Win32_Process -Filter "ParentProcessId=<pid>"`
   and use it to list a process's real children — the same shape of
   query, one level down the process tree instead of from a port.
