# Concept: Node's `process.platform`

**What you'll understand by the end:** how a Node.js program tells, at runtime, which real operating system it's currently running on, and why some behavior genuinely needs to differ by platform.

**Prerequisites:** none.

## Setup

Any Node.js install — `process` is a global, available in every Node.js program with no `require`/`import` needed.

## The Problem

Some real behavior is only correct on one operating system and wrong (or simply different) on another — how an app should behave when its last window closes is a real example: macOS convention keeps an app running, visible in the dock, until the user quits it directly, while Windows and Linux convention quits the app once its last window closes. Code that wants to match real platform convention needs a real, reliable way to know which platform it's currently running on.

## The Isolated Example

```javascript
console.log("process.platform:", process.platform);
if (process.platform === "darwin") {
  console.log("running on macOS");
} else if (process.platform === "win32") {
  console.log("running on Windows");
} else {
  console.log("running on:", process.platform);
}
```

**Real output, run this session (on macOS):**
```
process.platform: darwin
running on macOS
```

**What this proves:** `process.platform` returned a real, specific string identifying the actual machine this ran on — `"darwin"` (macOS's underlying kernel name, used as the value for historical reasons even though the OS itself is called macOS), not a generic "unix-like" label. The same code, run unchanged on Windows, would print `"win32"` and take the other branch.

## Mechanical Walkthrough

- `process` — **(a) first appearance** — a global object Node.js provides to every program automatically, with no `require`/`import`, representing the currently-running Node process itself (its environment, its arguments, its platform) — conceptually similar to `__name__` (Lesson 1) being automatically supplied by the interpreter, here supplying information about the OS process instead of the current module.
- `process.platform` — **(a) first appearance** — a read-only string property, fixed for the lifetime of the process (checked once here, but never changes mid-run, since the OS a program is running on cannot change while it runs) — real values include `"darwin"` (macOS), `"win32"` (Windows), `"linux"`.
- `if (process.platform === "darwin")` — **(c) already established** string equality comparison and `if`/`else if`/`else`, applied to a new real value.

## CS Lens

This is **platform detection** — branching real behavior based on the actual runtime environment rather than assuming one specific environment always applies. The same general idea as feature detection in browser JavaScript (checking whether a browser API exists before using it) or a compiler's own target-platform conditionals (`#ifdef _WIN32` in C) — code that has to run correctly across more than one real environment needs some real, checkable signal to branch on, rather than a single hardcoded assumption.

Also recognized in: any cross-platform desktop or CLI tool (file-path separators, default install locations, keyboard-shortcut conventions all commonly differ by platform), and Python's own `sys.platform`/`platform.system()` — the identical need, a different language's real answer to it.

## SE Lens

The alternative — writing one behavior and assuming it's correct everywhere — is real, simpler code that quietly becomes wrong the moment the same program runs somewhere else. `process.platform` costs one property read and a real branch; skipping it doesn't remove the platform difference, it just means the wrong behavior for other platforms ships silently, discovered later by whoever runs the program somewhere other than wherever it was written and tested.

## Connection

Directly relevant to any Node.js or Electron code whose correct behavior genuinely differs by operating system — used in this project specifically to decide whether the app should quit when its last window closes, matching each platform's own real convention rather than picking one and applying it everywhere.

## Try It Yourself

1. Look up what `process.platform` actually reports on Linux (`"linux"`) and on Windows (`"win32"` — not `"windows"`, a real, easy-to-guess-wrong detail) without running either — from Node's own documentation, then reason about why relying on memory instead of checking would be a real, plausible source of a platform-detection bug.
2. Add a fourth, more specific check using `process.arch` (a sibling property, the CPU architecture — e.g. `"arm64"`, `"x64"`) alongside `process.platform`, and print both together — confirming a single machine can be identified by *both* its OS and its architecture, two independent facts.
3. Wrap the `if`/`else if`/`else` chain in a small function returning just the platform-appropriate string, and call it from two different places — reasoning about why centralizing a platform check in one function, rather than repeating the same `if` chain at every call site, matters more as a codebase grows.
