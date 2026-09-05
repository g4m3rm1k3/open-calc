# Lesson M4.7: State Captured Once, at Process Start

*This lesson is about Windows itself, not mastercam-app code - a direct continuation of Lessons M4.5-M4.6. Every command below was actually run on this real machine; where a claim about LongPathsEnabled itself couldn't be directly tested (because it isn't enabled on this machine yet), that's stated explicitly rather than presented as verified.*

**What you will build:** Nothing added to the app - real, verified understanding of why a registry change doesn't retroactively affect a process that's already running, using a real, directly-observed (and more subtle than expected) experiment with environment variables, then applying that same principle honestly to LongPathsEnabled specifically.

**What you need to know first:** Lesson M4.6's registry structure and per-key ACLs - this lesson is about timing: when a written value actually starts affecting anything.

## Terms used in this lesson

- **Process environment block** — A real, private copy of environment variables a process receives at the moment it's created - copied from its parent process by default, not re-read from the registry every time a variable is referenced.
- **Environment variable inheritance** — A real Windows/CreateProcess behavior - unless a process explicitly builds a fresh environment block, a new child process gets a copy of whatever its parent process's environment already was, at the moment the child is spawned - not a live view of the registry.

## Objects and methods used

None — this lesson introduces no new external class, interface, or method, only Terms.
## Concept Unit: A Real Experiment That Didn't Go the Way It Was Supposed To

### The Problem

The expectation going in: write a registry-backed environment variable, confirm an already-running shell doesn't see it, confirm a brand-new process does. The real result was more interesting than that.

Before reading on:

- setx writes to HKCU\Environment for real - the value below confirms that. A NEW cmd.exe process, spawned fresh from this session, still printed the variable name unexpanded rather than 'before'. What does that mean the new process actually inherited its environment from?
- If a genuinely fresh login session (not a child of this one) had run the same check, Windows documentation says it would see the new value - what real, structural difference would separate that case from spawning a child process the way this test did?

### Project Change

- **Reference Source:** No reference counterpart - real, live experiment run on this machine, whose actual result is the point of this unit.
- **Files affected:** `none` (none)
- **Change type:** none
- **Location:** n/a
- **Dependencies:** none

### Mechanical Walkthrough

- `setx CLAUDE_LESSON_TEST "before" - real write confirmed via Get-ItemProperty afterward, showing the value actually stored` — setx genuinely wrote CLAUDE_LESSON_TEST=before into HKCU:\Environment - confirmed directly afterward by reading it back. The registry write itself was real and succeeded.
- `cmd //c "echo %CLAUDE_LESSON_TEST%" printed the literal text %CLAUDE_LESSON_TEST%, not 'before'` — This is the real surprise: even a brand-new cmd.exe process, spawned fresh, didn't see it. The reason is that this new cmd.exe was a CHILD of the existing bash session - Windows gives a new child process a copy of its parent's already- existing environment block by default, not a fresh read of the registry. The bash session's own environment was captured when IT started, long before setx ran, so every descendant of it inherits that same stale copy.

### Mental Model

```text
bash session starts -> captures env block (no CLAUDE_LESSON_TEST)
  |
  +-- setx writes HKCU\Environment for real (registry updated)
  |
  +-- cmd.exe spawned AS A CHILD of bash
        -> inherits bash's OLD env block (copied, not re-read)
        -> still has no CLAUDE_LESSON_TEST

A genuinely new, top-level session (e.g. a fresh login, or
Explorer relaunching a process after a broadcast settings-changed
message) would build its environment block fresh from the
registry instead, and would see it.
```

### CS Lens

This is real, observed **inheritance versus a fresh read** - almost every "restart the app and it'll pick up the change" claim in real systems hides this exact distinction: does the new thing actually re-read the source of truth, or does it inherit a cached copy from whatever spawned it? A child process is not automatically the same as a fresh one.

### SE Lens

The real, practical alternative once you know this - closing every terminal window and opening a genuinely new one (not just running a new command inside the same shell) - is the actual reliable way to get a fresh environment block, precisely because a new top-level terminal window is not a child of the old one in the way this test's cmd.exe was a child of bash.

### Commands needed

- `setx CLAUDE_LESSON_TEST "before"` — Run in this session - writes a real value to HKCU:\Environment
- `cmd /c "echo %CLAUDE_LESSON_TEST%"` — Run as a child of the same session immediately after

### Verification

```text
current shell sees (should be empty, this shell started before setx ran):

---
a brand-new process sees:
%CLAUDE_LESSON_TEST%
```

Full saved run: `verification/mastercam-phase-04/lab_env_var_inheritance_output.txt`.

### Connection to the previous unit

Lesson M4.6 established that LongPathsEnabled's value is real, stored state; this unit is the first real proof that writing a value and having something new see it are two separate events, using a directly observable, if more subtle than expected, case.

## Concept Unit: Why LongPathsEnabled Specifically Needs a Genuinely Fresh Process

### The Problem

LongPathsEnabled isn't an environment variable - it's a kernel/API- level flag, checked by a different mechanism than the environment- inheritance case above. The real question is whether the same underlying principle (captured once, not live) still applies, and why.

Before reading on:

- Microsoft's own documentation states enabling LongPathsEnabled doesn't require a full reboot, only a new process - given the unit above's real finding that a mere child process can still inherit stale state, what real, different kind of process would actually need to start for pip to see the new setting?
- python.exe's own manifest is what declares it longPathAware - if a hypothetical program's manifest did NOT declare that, would setting LongPathsEnabled=1 change anything for it at all, no matter how fresh the process?

### Project Change

- **Reference Source:** No reference counterpart - this unit states what is documented, real Windows/Win32 behavior for LongPathsEnabled specifically, distinct from what was directly observed in the unit above. LongPathsEnabled has not been enabled on this machine as of this lesson, so its own exact propagation timing has not been directly executed and observed here - that distinction is deliberate, not an oversight.
- **Files affected:** `none` (none)
- **Change type:** none
- **Location:** n/a
- **Dependencies:** none

### Mechanical Walkthrough

- `Requires: a genuinely new top-level process (a fresh terminal window, not a child of one that predates the registry change)` — Consistent with the unit above's real finding: pip running inside a terminal that was already open before LongPathsEnabled is set would be a descendant of a session whose own process (and everything it inherited or cached at its own start) predates the change. A newly opened terminal window is not a child of the old one - it's a new top-level process the OS builds fresh state for.
- `Requires: the running executable's own manifest declares longPathAware (python.exe's does, as of the Python versions in real current use)` — This is the second, separate condition Lesson M4.5 named: LongPathsEnabled changes what the OS *permits*; the process's own manifest is what has to *ask* for that permission. A program whose manifest never asks would stay MAX_PATH-limited regardless of the machine-wide setting - the two conditions are independent, and this lesson doesn't have direct, executed proof of that second condition either, since testing it would require a real manifest-declared and a real non-declared binary compared side by side.

### CS Lens

This is the same **capture point** question as the unit above, applied one level lower - not "does this process's environment block include it," but "does this process's own binary manifest, fixed at compile time, opt into the newer OS behavior at all." Two independent gates, both real, both have to be satisfied.

### SE Lens

The real, honest alternative to guessing here is exactly what this unit does: state plainly which parts are directly observed (the environment-inheritance experiment above) and which parts are documented Windows behavior this lesson hasn't independently executed (LongPathsEnabled's own exact propagation), rather than blur the two together as if both were equally verified.

### Verification

LongPathsEnabled is not yet enabled on this machine, so its own propagation timing genuinely cannot be executed and observed here - stating that honestly is the point of this unit, not a gap to paper over with a plausible-sounding but unexecuted claim.

### Connection to the previous unit

The unit above proved the general "captured once, not live" principle with a real, directly observed case; this unit applies the same principle to LongPathsEnabled specifically, while being explicit about which parts of that application are documented versus independently verified here.

## Connect the pieces

Trace the same real principle through both units: writing CLAUDE_LESSON_TEST didn't reach a child process spawned from an already-running session (unit one, directly observed) - and LongPathsEnabled, by the same structural logic plus one additional, documented condition (the executable's own manifest), needs a genuinely fresh, top-level process before pip would ever see it (unit two, stated honestly as documented rather than independently executed here).

**Next lesson:** Once LongPathsEnabled is set to 1 in an elevated session, and a genuinely new terminal window is opened (not a new command in an old one), retrying `pip install PySide6-Addons` is the real next step before the browser-embedding lesson.