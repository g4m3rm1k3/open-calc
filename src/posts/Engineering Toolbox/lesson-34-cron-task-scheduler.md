# Lesson 34: Letting the Operating System Remember Instead of You

## What you will build

Nothing written from scratch this time — instead, this lesson hands
Lesson 33's job off to the operating system's own scheduler: `cron` on
Linux/macOS, Task Scheduler (`schtasks`) on Windows, following this
curriculum's Lesson 3 format of building the same real task on both
platforms side by side. The transferable problem this lesson is actually
about: Lesson 33's loop only exists while its Python process is running —
kill the process, reboot the machine, and the schedule is gone with it.
An OS-native scheduler fixes that by moving the responsibility for
"remember to run this" out of any one program and into the operating
system itself, which is running (and being restarted, and being
monitored) long before and after any specific script.

## What you need to know first

- **Lesson 33** — the problem this lesson solves differently: running a
  task on a repeating schedule. Nothing about that lesson's drift-
  correction logic is reused here; this lesson replaces the whole
  approach rather than building on the code.
- **Lesson 3** — the dual-platform (Bash/PowerShell) side-by-side format
  this lesson follows again, and the same honest limitation that lesson
  named: the Windows half below is written correctly from documented
  behavior but not executed this session, since this curriculum's
  environment is Linux-only. The Linux half *is* executed and verified,
  including a real failure case, below.

---

## The Problem, in prose, no code yet

Lesson 33's `run_every_n_seconds` works, but only for as long as its
Python process keeps running. If that process crashes, if the machine
reboots, or if nobody remembers to start it again after a deploy, the
schedule simply stops — silently, with nothing left running to even
notice it stopped. A real scheduled task — a nightly backup, an hourly
report — usually needs to survive all of that. The fix isn't a better
Python loop; it's not using a loop that lives inside a fragile process at
all. Every general-purpose operating system already ships a component
whose entire job is running things on a schedule, independent of any
particular program's lifetime: `cron` on Unix-like systems, Task
Scheduler on Windows.

---

## Concept Unit: The Scheduler Daemon

### The Problem

Lesson 33's schedule only exists as long as one specific Python process
is alive, in memory, actively looping. Something that survives a crash or
a reboot has to live somewhere that isn't "inside one running program" —
it has to be tracked as data, read by a separate, independently-running
piece of system software.

### `cron` (Linux/macOS)

`cron` (**first appearance**) is a background system service —
specifically, a **daemon**: a program the operating system starts once,
typically at boot, that then keeps running indefinitely with no
interactive terminal attached, waiting to act on events (here,
"a minute has passed") rather than on direct user input. It reads a
per-user file called a **crontab** ("cron table") listing what to run and
when, and once a minute, checks whether the current time matches any
line in that file.

Confirming it's actually running, in this session's environment (not
installed by default in this container, so installed first):

```
$ apt-get install -y cron
$ service cron start
 * Starting periodic command scheduler cron
   ...done.
$ ps aux | grep cron
root       807  0.0  0.0   3816  1976 ?        Ss   15:11   0:00 /usr/sbin/cron -P
```

`ps aux` (reused from Lesson 4's process-manager lesson) confirms
`/usr/sbin/cron` is running as its own independent process, entirely
separate from any Python program — this is what makes it survive a
Python crash: there is no Python process for it to crash *with*.

### Task Scheduler (Windows)

*(Documented from Microsoft's own reference, not executed this session —
this curriculum's environment has no Windows host, exactly the same
honest limit Lesson 3 named for its own PowerShell half.)*

Windows' equivalent is the **Task Scheduler service**
(`schedule`/`Schedule.exe`), a background service started automatically
by Windows itself, viewable and editable either through the graphical
"Task Scheduler" application or the command-line tool `schtasks`, used
below for direct comparison with `crontab`. Functionally, it plays the
identical role `cron` does: a long-running system service, independent of
any user's login session or any specific program, checking a stored list
of scheduled tasks and running each one when its trigger condition is
met.

### CS Lens

This is the **daemon** pattern by name: a long-lived background process
with no controlling terminal, started by the operating system rather
than by direct interactive invocation, that reacts to time or events
rather than to a user typing commands.

Also recognized in: every web server this curriculum has built since
Lesson 25 (once deployed, not run interactively), `sshd` (the SSH server
daemon accepting connections), database server processes, `systemd`
itself on modern Linux (the daemon that starts most other daemons,
including `cron`).

### SE Lens

Lesson 33's approach and `cron`'s approach make opposite tradeoffs. A
process you write and run yourself gives you full control over the
scheduling logic — Lesson 33's drift correction, for example, has no
equivalent lever inside `cron`, which simply checks once a minute — but
it costs you the responsibility of keeping that process alive forever. A
system daemon takes that responsibility off your hands entirely, at the
cost of being limited to whatever scheduling model it offers — for
`cron`, a fixed once-per-minute check, no finer.

---

## Concept Unit: The Crontab Line

### The Problem

`cron` needs to be told, in a format it can parse, both *when* to run
something and *what* to run. That format needs to be compact enough to
write by hand and expressive enough to cover "every minute," "every
weekday at 9am," and "the first of every month" without needing a
different syntax for each.

### The New Code

```
* * * * * /usr/bin/date +%s >> /home/claude/lesson34/cron_fired.log 2>&1
```

### Mechanical Walkthrough

- Five space-separated fields, in fixed order, come before the command:
  **minute** (0–59), **hour** (0–23), **day of month** (1–31), **month**
  (1–12), **day of week** (0–6, where 0 is Sunday). A `*` in any field
  (**first appearance of this meaning**) means "every value of this
  field" — this line's five stars together mean "every minute of every
  hour of every day," i.e., every single minute, unconditionally.
- Everything after the fifth field is the command to run, passed to the
  shell exactly as typed — `/usr/bin/date +%s` (reused from Lesson 6's
  shell work: `date` prints the current time; `+%s` formats it as a Unix
  epoch timestamp), `>>` (reused shell redirection, appending rather than
  overwriting) into a log file, and `2>&1` (reused from Lesson 6: redirect
  standard error into the same place as standard output, so any error
  the command produces is captured in the log too, not silently
  discarded).
- `cron` always invokes commands using absolute paths and a minimal
  environment — no login shell, no `.bashrc`, none of the `PATH` Lesson
  2 covered — which is exactly why `/usr/bin/date` is spelled out in
  full here rather than just `date`: relying on `PATH` inside a cron job
  is a well-known, real source of "it works when I type it, but not in
  cron" bugs.

A more expressive example, showing the other special characters:

```
*/5 9-17 * * 1-5 /usr/bin/echo weekday-business-hours >> /home/claude/lesson34/other.log
```

- `*/5` (**first appearance**) in the minute field means "every 5th
  value starting from the field's minimum" — every 5 minutes:
  `0, 5, 10, 15, ...`
- `9-17` (**first appearance**) is a range: hours 9 through 17 inclusive
  (9am–5pm).
- `1-5` in the day-of-week field: Monday through Friday.
- Read together: "every 5 minutes, but only during business hours, on
  weekdays."

### CS Lens

This is a small, purpose-built **domain-specific grammar** — five fields,
four operators (`*`, `,` for lists, `-` for ranges, `/` for step values),
expressive enough to describe an enormous range of real schedules without
ever needing general-purpose code.

Also recognized in: regular expressions (a different small grammar for a
different domain, already used in earlier lessons' search work), glob
patterns (`*.txt`), CSS selectors — all cases where a tiny, dedicated
syntax beats writing a general program for a narrow, well-understood
problem.

### SE Lens

Five fixed-order numeric fields is a much less forgiving format than,
say, a JSON object with named keys would be — nothing marks which field
is which except position, and a stray extra space or a field written in
the wrong order fails silently or confusingly. `cron`'s design predates
JSON, or really any widely-used structured text format, by decades; it's
a real, historically-explainable rigidity rather than a deliberate design
tradeoff a modern tool would choose to repeat, which is exactly why so
many modern equivalents (Kubernetes `CronJob` resources, for instance)
keep the same five-field string for compatibility while wrapping it in a
more structured surrounding format.

---

## Concept Unit: Installing and Verifying a Real Schedule

### The Problem

Writing a correct crontab line on paper proves nothing on its own — the
actual proof that a scheduler works is watching it fire, unattended, at
the time it was told to.

### Commands needed

- `crontab -l` — **first appearance.** Lists the current user's
  installed crontab. `-l` for "list."
- `crontab -` — **first appearance.** Installs a new crontab by reading
  it from standard input (`-` meaning "read from stdin," a convention
  reused from several Unix tools), replacing whatever crontab already
  existed for this user entirely — not appending to it.
- `crontab -e` — not run this session, but worth knowing: opens the
  current crontab in a text editor (`$EDITOR`) for interactive editing,
  the way a person would normally manage their own crontab day to day,
  as opposed to the scripted `crontab -` install used here for a
  reproducible, non-interactive lesson.
- `crontab -r` — **first appearance.** Removes the current user's
  crontab entirely.

### Run it

Installing the every-minute job from above, then genuinely waiting past
the next minute boundary and checking the log file it should have
written to:

```
$ echo "* * * * * /usr/bin/date +%s >> /home/claude/lesson34/cron_fired.log 2>&1" | crontab -
$ crontab -l
* * * * * /usr/bin/date +%s >> /home/claude/lesson34/cron_fired.log 2>&1
$ date +%s
1784905905
$ sleep 20 && date +%s && cat /home/claude/lesson34/cron_fired.log
1784905931
1784905921
```

What this proves: the crontab was installed at Unix time `1784905905`.
Twenty real seconds later, the wall clock read `1784905931`, and the log
file — written by `cron`, not by anything this lesson's own shell session
touched directly — contained `1784905921`: the moment `cron` woke up on
its own, unprompted, at the next minute boundary, and ran the command
exactly as scheduled, entirely independent of the shell session that
installed it.

### CS Lens

This is the crontab acting as **externalized schedule state** — the
"what to run and when" lives in a file on disk, read by a process that
didn't create it and doesn't need to know anything about the program
that did, which is the entire property that makes it survive a reboot:
`cron` itself restarts on boot (managed by the OS's own service manager)
and simply re-reads the same crontab file it always reads, with no memory
of "was I running before" required at all.

Also recognized in: any configuration-as-data system — a Kubernetes
manifest describing desired state for a controller to reconcile toward,
a systemd unit file, a Docker Compose file — all cases where behavior is
driven by a file a separate long-running process reads, rather than by
code baked directly into one specific running instance.

### SE Lens

`crontab -` replacing the *entire* crontab on every install (rather than
appending) is a deliberate, if occasionally surprising, design choice:
it guarantees the crontab always exactly matches whatever was last
installed, with no risk of accumulating duplicate or stale entries from
repeated installs — the same idempotency concern that showed up when
this curriculum's reverse proxy lesson chose to reconstruct headers
fresh rather than editing them in place.

---

## Concept Unit: A Malformed Schedule Fails Loudly, Not Silently

### The Problem

The five-field format from the earlier unit has real limits — minutes
only go up to 59 — and it's worth knowing, concretely, what happens when
that limit is violated, rather than assuming.

### Run it

```
$ echo "70 * * * * /usr/bin/echo bad" | crontab -
"-":0:  bad minute
errors in crontab file, can't install.
```

What this proves: `crontab` validates the file *before* installing it —
`70` is not a valid minute (the field's range is 0–59), and the install
is rejected outright with a specific, if terse, error naming exactly
which field failed. Critically, the *previous*, valid crontab (the
`*/5 9-17 * * 1-5 ...` line from the earlier unit) was left untouched by
the rejected install — confirmed by listing it again immediately after:
the old entry was still there, unchanged. A failed `crontab -` install
does not clear or corrupt whatever was previously scheduled.

### CS Lens

This is **input validation with atomic replace-or-reject semantics** —
either the entire new crontab is accepted, or none of it is, with no
possibility of ending up with a half-applied, partially-broken schedule.

Also recognized in: database transactions (Track 6's territory later in
this curriculum), configuration file validation in most real deployment
tools, compiler behavior on a syntax error (nothing is compiled at all,
rather than compiling everything except the broken part).

### SE Lens

The alternative — silently accepting `70` and either crashing at runtime
or just never firing that line — would fail in exactly the worst way: at
2am, unattended, with nobody watching, days or weeks after the mistake
was actually made. Rejecting immediately, at install time, while a human
is still there to see the message, is a direct application of "fail
fast" — catching a mistake as close as possible to when it was made,
rather than as far away as possible.

---

## Concept Unit: The Same Job, on Windows

*(Documented from Microsoft's `schtasks` reference; not executed this
session.)*

### The New Code

```
schtasks /create /tn "LogTimestamp" /tr "C:\Windows\System32\cmd.exe /c echo %date% %time% >> C:\logs\cron_fired.log" /sc minute /mo 1
```

### Mechanical Walkthrough, compared field-by-field against `cron`

- `/create` — the subcommand: create a new scheduled task (as opposed to
  `/query`, `/delete`, or `/run`, which list, remove, or immediately
  trigger an existing one).
- `/tn "LogTimestamp"` — **task name**: every scheduled task on Windows
  is identified by an explicit name, unlike `cron`, where a crontab line
  has no name at all — just its position in the file. This is a real
  structural difference, not just a syntax difference: deleting *one*
  specific Windows task later (`schtasks /delete /tn "LogTimestamp"`) is
  a direct, targeted operation; removing one line from a crontab means
  editing the whole file by hand.
- `/tr "..."` — **task run**: the command to execute, equivalent to
  everything after the five time fields in a crontab line.
- `/sc minute /mo 1` — **schedule type and modifier**: `/sc minute` picks
  a minute-based recurrence (Windows also offers `/sc daily`, `/sc
  weekly`, `/sc monthly`, and others, each with its own modifier
  options), and `/mo 1` sets the modifier to "every 1" of that unit —
  together, "every 1 minute," the direct equivalent of `cron`'s five
  stars.

### CS Lens and SE Lens

Both already covered under the "Scheduler Daemon" unit above, which
applies identically to both platforms — this unit is purely the syntax
translation, not a new underlying concept, per the Repetition Rule.

---

## Connect the pieces

One schedule, both platforms: "run this every minute." On Linux, that's
a single line in a crontab, five `*` characters and a command, read once
a minute by the already-running `cron` daemon. On Windows, that's one
`schtasks /create` invocation naming the task, its command, and a
`/sc minute /mo 1` recurrence, read by the Task Scheduler service. Both
routes end at the same place Lesson 33's loop tried to reach on its own —
a task that runs on a fixed cadence — but neither one depends on a
Python process staying alive to make it happen; both depend only on the
operating system itself being up.

## What breaks without this

Already shown directly, with real output, in the malformed-schedule unit
above: a `70` in the minute field is rejected at install time with
`"-":0: bad minute / errors in crontab file, can't install.`, and the
previously-installed valid crontab is left running, undisturbed. No
separate demonstration is needed beyond what was already run and
captured there.

## Definition of done

- [ ] `crontab -l` shows an installed schedule matching what was intended
      to be installed.
- [ ] A real every-minute job, left running for at least a minute, writes
      to its log file at (approximately) a real minute boundary — not
      immediately, and not never.
- [ ] Attempting to install a crontab with an out-of-range field (a
      minute above 59, for instance) is rejected with an error, and the
      previously-working crontab remains installed afterward.
- [ ] You can translate one schedule (e.g. "every 5 minutes during
      business hours on weekdays") between `cron` syntax and `schtasks`
      syntax without looking either up from scratch.
- [ ] Commit with a message explaining why, not just what (this lesson
      has no project code file to add, so the commit instead documents
      the crontab entry itself, in a comment or README):

  ```
  git add README.md
  git commit -m "Document the cron schedule for the timestamp logger — moved off Lesson 33's in-process loop so the schedule survives a process crash or reboot, at the cost of losing that loop's drift-correction logic"
  ```

## What's next

Both `cron` and Task Scheduler assume the machine is on. Neither retries
a run that was missed because the computer was asleep or off at the
scheduled moment (`cron` in particular simply skips it — the next check,
a minute later, only looks at the *current* time, not what was missed).
Lesson 41's scheduled backup lesson will need to account for that gap
directly once it builds something where a silently skipped run is a real
problem, not just a minor inconvenience.
