# Lesson 40: Correct on Paper Is Not the Same as Running

## What you will build

A `systemd` service file that would launch Lesson 36's daily report
script automatically every time the machine starts — checked for real
correctness using `systemd-analyze verify`, a tool that can validate a
service file's syntax and structure even on a machine with no running
`systemd` instance to actually launch it — plus `cron`'s own
`@reboot` mechanism as a second, more portable approach to the same
problem. The transferable problem this lesson is actually about: a
configuration file can be genuinely, verifiably correct without ever
having been run for real, and knowing the difference between "verified
correct" and "verified to work" matters, especially — as this lesson's
own environment turned out to demonstrate directly — when "run it for
real" isn't actually possible where the checking is happening.

## What you need to know first

- **Lesson 34** — `cron`, crontab syntax, and the real, installed,
  working `cron` daemon this lesson's environment already has running
  from that lesson. Today extends that exact setup with one new special
  syntax.
- **Lesson 36** — `send_report.py`, used here as the real program being
  scheduled to start automatically, without re-explaining anything about
  what it does.

---

## The Problem, in prose, no code yet

Lesson 34's `cron` and Task Scheduler both run something on a
*schedule*. "Run this once, automatically, the moment the computer
starts" is a related but genuinely different problem: it's not about
repeating on an interval, it's about hooking into the machine's own
startup sequence, which on a modern Linux system almost always means
`systemd` — the same "init system" (**first appearance of this exact
term, though the underlying idea was named back in Lesson 34's daemon
unit**) responsible for starting essentially everything else on the
machine, including, as it happens, `cron` itself. This lesson builds a
real `systemd` service file for exactly that purpose — and then runs
directly into an honest, informative wall: this curriculum's own sandbox
environment does not run `systemd` as its actual init system at all,
which turns out to be worth understanding in its own right rather than
working around silently.

---

## Concept Unit: A Systemd Service File

### The Problem

Telling `systemd` to run a program automatically means describing that
program to it in a format it understands: what to run, when relative to
the rest of the system's startup, and whether it should be restarted if
it fails.

### Reference Source

No reference counterpart — the fields used below follow `systemd.service`'s
own real, documented format (`man systemd.service`), not a specific
external codebase.

### The New Code

```ini
[Unit]
Description=Daily report scheduler
After=network.target

[Service]
Type=oneshot
ExecStart=/home/claude/lesson36/.venv/bin/python3 /home/claude/lesson36/send_report.py

[Install]
WantedBy=default.target
```

### Mechanical Walkthrough

- The file is `.ini`-style: square-bracketed section headers
  (`[Unit]`, `[Service]`, `[Install]`) followed by `Key=Value` lines —
  **first appearance of this specific configuration file format** in
  this curriculum, distinct from JSON (Lesson 29/39) or `.env`-style
  files.
- `[Unit]` — metadata about the unit itself, not how to run it.
  `Description` (**first appearance**) is a free-text human-readable
  label, shown by tools like `systemctl status`. `After=network.target`
  (**first appearance**) tells `systemd` this unit should only start
  *after* the system's networking is up — relevant here specifically
  because `send_report.py` needs a working network connection to reach
  an SMTP server at all; starting it before networking exists would mean
  its very first run fails every time.
- `[Service]` — how to actually run the program. `Type=oneshot` (**first
  appearance**) tells `systemd` this service runs once and exits, rather
  than staying running in the background the way Lesson 25's web server
  or Lesson 34's `cron` daemon itself does — the correct type for a
  script that sends one report and finishes, as opposed to a long-lived
  server process. `ExecStart` (**first appearance**) is the actual
  command to run — deliberately using the *full path* to both the
  virtual environment's own Python interpreter (from Lesson 35/36) and
  the script itself, for the same reason Lesson 34's crontab commands
  used full paths: a service started by `systemd` has no shell, no
  `PATH` lookup, and no `.bashrc` (Lesson 2's territory) to fall back on.
- `[Install]` — controls what "enabling" this unit actually connects it
  to. `WantedBy=default.target` (**first appearance**) means: when the
  system reaches its normal, fully-booted state (`default.target`, the
  standard target most systems boot into), also start this unit.

### CS Lens

This is **declarative configuration**: the file states *what* should be
true (this program should run once networking is available, as part of
normal startup) rather than *how* to make it true step by step — the
"how" (exactly when to fork the process, how to detect network
readiness, what order to start things in relative to everything else on
the system) is `systemd`'s own job, not something this file has to spell
out.

Also recognized in: Kubernetes manifests (declaring desired pod state,
not the steps to reach it — already referenced conceptually back in
Lesson 31/32), Terraform's own configuration files, Docker Compose files
— all cases where a system is told the target state and a separate
engine is trusted to reach it.

### SE Lens

The alternative — a raw shell script invoked by some ad hoc startup hook
— would work, but loses everything `systemd` provides for free once a
service is properly described to it: automatic restart on failure
(configurable, not used in this minimal example), structured logging
integration, correct ordering relative to other services, and a
consistent way to check status (`systemctl status`) across every service
on the machine, not just this one. The cost is exactly what this lesson
is about to run into directly: the file's correctness depends on a real
`systemd` instance to actually interpret and act on it.

---

## Concept Unit: Verifying Correctness Without Running It

### The Problem

This lesson's own sandboxed environment, it turns out, has no running
`systemd` instance to actually enable or start this service with —
confirmed directly, honestly, before working around it:

```
$ systemctl --user status
Failed to connect to bus: No medium found
$ systemctl status
System has not been booted with systemd as init system (PID 1). Can't operate.
Failed to connect to bus: Host is down
```

`systemctl` itself is genuinely installed (the same package-installed-
but-not-actually-running situation Lesson 39 hit with `pynput`'s X11
dependency) — but this container's actual process 1 is something else
entirely, not `systemd`, so there is no running `systemd` "bus" for
`systemctl` to even talk to. This raises a real question worth answering
directly rather than sidestepping: is there *any* way to know whether
the service file above is correct, without a running `systemd` to test
it against?

### Commands needed

```
$ systemd-analyze verify /home/claude/lesson40/daily-report.service
```

`systemd-analyze` (**first appearance**) is a separate tool, bundled with
`systemd`, that can perform **static analysis** (**first appearance of
this term**, though the general idea — checking code without running it
— is the same category as this curriculum's own copyright- and
syntax-checking practices) on a unit file: parsing its structure,
checking every field name is one `systemd` actually recognizes, and even
confirming that the command named in `ExecStart` genuinely exists on
disk and is executable — all without needing a live `systemd` instance
managing the machine at all.

### Run it

Against the correct file from the previous unit:

```
$ systemd-analyze verify /home/claude/lesson40/daily-report.service
```

No output at all, and an exit code of `0` — `systemd-analyze`'s own
convention (a **hard concept reappearing** from every command-line tool
this curriculum has used: silence and a zero exit code mean success,
loudly established since Lesson 1's own command loop) for "found nothing
wrong."

Against a deliberately broken file, with a nonexistent `ExecStart` path:

```ini
[Unit]
Description=Broken example

[Service]
ExecStart=/this/path/does/not/exist
```

```
$ systemd-analyze verify broken.service
broken.service: Command /this/path/does/not/exist is not executable: No such file or directory
```

This is real, meaningful verification: `systemd-analyze` didn't just
check that the `.ini`-style syntax parsed — it actually reached out to
the filesystem and confirmed `/this/path/does/not/exist` genuinely
doesn't exist, catching a mistake that would otherwise only surface the
first time `systemd` tried to actually start this service for real.

### CS Lens

This is the same **static versus dynamic verification** distinction
software testing draws constantly: a type checker or linter (static —
checks the code without running it) versus a unit test (dynamic — runs
the code and checks its behavior). `systemd-analyze verify` is a static
checker for service files specifically; it can catch a missing
executable or a malformed field name, but it cannot catch, for instance,
`send_report.py` itself failing at runtime because the SMTP server it
tries to reach happens to be down that day — that failure mode is only
observable by actually running the service.

Also recognized in: `python -m py_compile` (checks Python syntax without
executing the module's actual logic), a JSON or YAML schema validator,
this curriculum's own `crontab -`'s field-range validation from Lesson
34 (also static — caught `70` as an invalid minute without needing to
wait a minute to see it fail).

### SE Lens

Being able to verify a configuration file's correctness *without* a live
instance of the system that consumes it is a genuinely valuable property
for exactly the situation this lesson is in: a CI pipeline, a code
review, or — here — a sandboxed teaching environment can all check a
`systemd` service file is well-formed before it's ever deployed anywhere
a real `systemd` is running, catching a whole category of mistakes
(typos, wrong paths, invalid field names) long before deployment, at
near-zero cost.

---

## Concept Unit: `cron`'s Own Startup Hook

### The Problem

`systemd` is standard on most modern Linux distributions, but not
universal — and this lesson's own environment is proof that "should be
running `systemd`" and "is actually running `systemd`" aren't always the
same thing. `cron`, already real and running since Lesson 34, offers a
more portable, if less capable, alternative: a special schedule entry
that runs once, specifically when `cron` itself starts.

### The New Code

```
@reboot /usr/bin/python3 /home/claude/lesson36/send_report.py
```

### Mechanical Walkthrough

- `@reboot` (**first appearance**) replaces the five time fields from
  Lesson 34 entirely with a single special keyword — `cron` recognizes a
  small fixed set of these (`@reboot`, `@daily`, `@weekly`, and others,
  each a shorthand for a common five-field pattern; `@reboot` is the one
  exception with no five-field equivalent at all, since "the moment I
  start" isn't expressible as a specific minute/hour/day combination).
- Installing it is the identical `crontab -` operation from Lesson 34;
  it's accepted as valid syntax immediately:

  ```
  $ echo "@reboot /usr/bin/date +%s >> /home/claude/lesson40_reboot_test.log 2>&1" | crontab -
  $ crontab -l
  @reboot /usr/bin/date +%s >> /home/claude/lesson40_reboot_test.log 2>&1
  ```

### An Honest Result From Testing This For Real

The obvious next step is proving `@reboot` actually fires — but this
sandbox can't be rebooted the way a real machine could, so the closest
available test is restarting the `cron` daemon itself and checking
whether the job runs. Doing exactly that:

```
$ service cron restart
$ cat /home/claude/lesson40_reboot_test.log
cat: /home/claude/lesson40_reboot_test.log: No such file or directory
```

It didn't fire — and tracing why turned up something genuinely worth
knowing, not just working around: `cron`'s own binary contains the exact
string `"Skipping @reboot jobs -- not system startup"`, guarded by a
marker file, `/run/crond.reboot`. `cron` deliberately does **not** treat
"the `cron` process itself just started" as equivalent to "the machine
just rebooted" — it checks a marker file first, specifically so that a
`cron` daemon restart (a routine admin action, or a crash-and-recovery)
doesn't accidentally re-run every `@reboot` job a second time within the
same real boot. Removing that marker file and restarting again did cause
`cron` to recreate it, confirming the detection logic is real and active
in this environment — though a fully successful, observed *firing* of
the job itself wasn't reproduced within this session's testing, honestly
reported here rather than staged to look cleaner than it was.

### CS Lens

This is a real, deliberately-implemented **idempotency guard** — a check
that prevents an action (running `@reboot` jobs) from happening more
than once for what should be a single logical event (one real boot), even
though the *process* responsible for that action (the `cron` daemon)
might itself be stopped and restarted multiple times within that single
event.

Also recognized in: database migration tools that track which migrations
have already run so restarting the tool doesn't re-apply them,
distributed systems' "exactly-once" delivery guarantees, this
curriculum's own Lesson 31 reverse proxy design note about
`crontab -`'s full-replace-not-append behavior serving a related
idempotency goal.

### SE Lens

`cron`'s `@reboot` guard is a real design choice with a real cost this
session's own testing surfaced directly: it makes `@reboot` behavior
difficult to test in exactly the situation this lesson is in (a
container, not a real bootable machine), because the very protection
that makes it correct in production (never double-firing after an
ordinary daemon restart) is the same mechanism that makes a container
restart indistinguishable, from `cron`'s point of view, from "the daemon
merely restarted, not the machine." This is worth stating plainly rather
than papering over: some behavior is only observable on the real target
system it was designed for, and a sandboxed teaching environment,
however useful for the rest of this curriculum, is honestly not that
system for this one specific case.

---

## Concept Unit: Windows and macOS, Documented

*(Neither executed this session — this curriculum's environment has no
Windows or macOS host, the same honest limit Lesson 34 named for its own
Windows half.)*

**Windows** offers the same two-tier choice as Linux: Task Scheduler
(Lesson 34's own tool, using a trigger type of "At log on" or "At
startup" instead of a time-based recurrence — `schtasks /create /tn
"DailyReport" /tr "..." /sc onstart`), or, for a simpler per-user case,
placing a shortcut to the program directly in the user's Startup folder
(`shell:startup`), which Windows Explorer runs automatically every login.

**macOS** uses **LaunchAgents** — property-list (`.plist`, an XML-based
format, distinct from `systemd`'s `.ini`-style syntax) files placed in
`~/Library/LaunchAgents/`, loaded automatically by `launchd` (macOS's own
init system, structurally the same role `systemd` plays on Linux) at
login, and managed with the `launchctl` command.

## Connect the pieces

One program, `send_report.py`, and three real routes to the same goal —
run it automatically at startup — each verified as far as this
environment honestly allows: a `systemd` service file, checked for real,
genuine correctness with `systemd-analyze verify` even without a live
`systemd` instance to run it against; a `cron` `@reboot` entry, accepted
as valid syntax by the real, running `cron` daemon this curriculum has
had since Lesson 34, its actual firing behavior guarded by a real,
directly-discovered idempotency mechanism this session traced by hand;
and Windows/macOS equivalents, documented accurately from their own real
formats without execution, following the exact precedent Lesson 34
already set.

## What breaks without this

Already shown directly, with real tool output, in the `systemd-analyze
verify` unit above: an `ExecStart` pointing at a path that doesn't exist
is caught immediately —
`Command /this/path/does/not/exist is not executable: No such file or directory`
— by static verification alone, before any real `systemd` would ever
have tried and failed to start it.

## Definition of done

- [ ] `systemd-analyze verify` against the correct `daily-report.service`
      file produces no output and exits `0`.
- [ ] `systemd-analyze verify` against a version with a broken
      `ExecStart` path produces a specific, real error naming the exact
      problem.
- [ ] `crontab -l` shows a correctly-installed `@reboot` line after
      installing one with `crontab -`.
- [ ] You can explain, without looking back at this lesson, the real
      reason this session's own `@reboot` test didn't produce output
      even after restarting `cron` — not "it doesn't work," but the
      specific idempotency mechanism responsible.
- [ ] You can explain the difference between what `systemd-analyze
      verify` checks and what only a live `systemctl start` would
      actually exercise.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add daily-report.service
  git commit -m "Add systemd service file for the daily report, verified with systemd-analyze — this sandbox has no running systemd, so static verification is the strongest correctness check available here"
  ```

## What's next

Lesson 41's scheduled backup lesson combines `cron`'s scheduling (Lesson
34) with real file operations (Lessons 9–17) — a natural place to also
apply this lesson's static-verification habit: checking a backup
script's correctness (does the destination path exist? is the source
readable?) before trusting it to a schedule, the same way
`systemd-analyze verify` caught a bad path here before anything tried to
actually run it.
