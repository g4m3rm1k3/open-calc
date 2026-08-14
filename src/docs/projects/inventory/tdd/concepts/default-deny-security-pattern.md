# Concept: Default-Deny

**What you'll understand by the end:** a general security design principle — reject everything except what's explicitly allowed, rather than allowing everything except what's explicitly forbidden — and why it's the safer default across very different kinds of systems.

**Prerequisites:** none.

## Setup

No install needed — this is a design principle demonstrated with small, runnable examples in any language. Python is used below.

## The Problem

Any system that decides "is this request/input/connection allowed?" has exactly two possible default postures when it encounters something it has no specific rule for: allow it (**default-allow** / **default-permit**), or reject it (**default-deny**). The choice matters enormously for anything security-relevant, because it determines what happens for every case nobody thought to write a rule for — which, in any real system, is most of the space of possible inputs.

## The Isolated Example

Default-allow (permissive) version:
```python
BLOCKED_COMMANDS = {"DELETE_ALL", "SHUTDOWN"}

def handle(command):
    if command in BLOCKED_COMMANDS:
        return f"REJECTED: {command}"
    return f"executing {command}"

print(handle("MOVE_X"))
print(handle("DELETE_ALL"))
print(handle("MOVE_X_BUT_TYPO"))
```

**Real output:**
```
executing MOVE_X
REJECTED: DELETE_ALL
executing MOVE_X_BUT_TYPO
```

Default-deny version:
```python
ALLOWED_COMMANDS = {"MOVE_X", "MOVE_Y", "STOP"}

def handle(command):
    if command in ALLOWED_COMMANDS:
        return f"executing {command}"
    return f"REJECTED: {command}"

print(handle("MOVE_X"))
print(handle("DELETE_ALL"))
print(handle("MOVE_X_BUT_TYPO"))
```

**Real output:**
```
executing MOVE_X
REJECTED: DELETE_ALL
REJECTED: MOVE_X_BUT_TYPO
```

**What this proves:** both versions correctly block the known-dangerous `DELETE_ALL`. They diverge on `MOVE_X_BUT_TYPO` — a command nobody wrote a specific rule for. The default-allow version silently executes an unrecognized, possibly-malformed or malicious command; the default-deny version rejects anything not specifically vetted, including this one.

## Mechanical Walkthrough

- A default-**allow** system maintains a blocklist — a set of specifically-known-bad things — and permits everything else; its safety depends entirely on the blocklist staying complete, forever, against every future bad input, including ones that don't exist yet.
- A default-**deny** system maintains an allowlist — a set of specifically-known-good things — and rejects everything else; new, unanticipated input fails safe (rejected) rather than fails open (executed).
- The cost is symmetric but opposite: default-deny requires proactively adding new legitimate cases to the allowlist as they arise (a real, ongoing maintenance cost, and a real risk of over-restricting legitimate use), while default-allow requires proactively anticipating every dangerous case in advance (a much harder, open-ended, arguably impossible task).

## CS Lens

This is a foundational access-control design decision, formally described as **fail-safe defaults** in classic computer security literature (one of Saltzer & Schroeder's original design principles for secure systems, 1975): a system should default to a state that denies access, requiring explicit, positive permission to allow it, so that a gap in the rules produces a safe outcome rather than a dangerous one.

Also recognized in: firewall configuration (allow specific ports/IPs, deny everything else — the standard recommended posture), file permission systems (a new file typically isn't world-writable by default), TypeScript/compiler strictness settings (rejecting anything not explicitly typed correctly, rather than silently allowing), and `cors-same-origin-policy.md` — a browser refusing to release a cross-origin response unless a server specifically allows that exact origin.

## SE Lens

Default-deny is the right default specifically when the cost of a false negative (wrongly allowing something dangerous) is much higher than the cost of a false positive (wrongly rejecting something legitimate, which a user can typically notice and report). It's the wrong default when the opposite is true — a system whose job is maximizing availability/permissiveness with low individual-failure stakes might reasonably choose default-allow instead. Recognizing which failure mode is worse for a specific system is the actual engineering judgment; "always default-deny" isn't universally correct, but it is the correct default whenever the un-anticipated case is a security-relevant one.

## Connection

This is the general pattern `cors-same-origin-policy.md` (a browser denying cross-origin reads unless a server explicitly allows a specific origin) and a G-code parser's `UnsupportedCodeError` (rejecting any command not specifically recognized, rather than guessing at unrecognized ones) both instantiate — two very different systems, the identical underlying design choice.

## Try It Yourself

1. Add a new, legitimate command (`"MOVE_Z"`) to both versions above without updating either list, and confirm both versions currently reject it — then fix only the default-deny version by adding it to `ALLOWED_COMMANDS`, and reason about why this maintenance step (remembering to update the allowlist) is the real, ongoing cost default-deny imposes in exchange for its safety.
2. Write a third version that logs every rejected command to a list instead of just returning a string, and after running several inputs through it, inspect the log — reason about how this log is exactly the kind of visibility a default-deny system provides "for free" that a default-allow system, which only logs things it already suspected, does not.
3. Think of (or find in a real codebase) one real system you interact with regularly that uses default-allow rather than default-deny, and reason about whether that choice is appropriate given what a false negative would cost in that specific system.
