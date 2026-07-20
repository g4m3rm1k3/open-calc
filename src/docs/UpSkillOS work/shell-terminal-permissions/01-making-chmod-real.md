# Making `chmod` Real in `ShellTerminal.jsx`

## What You Will Build

`ShellTerminal.jsx` (`src/courses/command-line-interface/viz/`) is a
hand-written, ~2000-line virtual shell — a real filesystem `Map` and real
implementations of `ls`, `cat`, `grep`, `g++`, `make`, and dozens more —
already reused as-is by the C++ course (`CppLab.jsx` wraps it directly).
Its `chmod` command was purely decorative: it printed
`"mode of 'X' changed to Y"` but never stored anything, and `ls -l`
always showed a hardcoded `-rw-r--r--` no matter what you ran. This
lesson makes permissions real — `chmod` actually changes what `cat`,
writes, and `./binary` execution are allowed to do — while keeping every
existing lesson in two different courses working exactly as before.

## What You Need to Know First

- This file is already covered elsewhere for its general shape (a big
  `switch` over parsed command tokens, mutating a `Map`-based virtual
  filesystem). This lesson is only about the one new concern: permission
  state and enforcement.
- "Real, not simulated" is a standard this whole session's other work
  (the Cyber Lab course) already holds itself to for cryptography —
  applied here to a completely different kind of primitive.

## The Lesson

### Concept Unit 1: A Parallel Map, Not a Restructured One

`fs` is a `Map<path, "DIR" | string>` — a path either holds the marker
`"DIR"` or its literal file contents, nothing else. Recording a
permission per path could have meant changing every entry to
`{content, mode}` — but `fs.get`/`fs.set` are called in more than 40
places across this file. Touching all of them, in a component two other
courses already depend on working correctly, is a lot of blast radius
for one new feature.

Instead, permissions live in a second, parallel `Map<path, "644">`
(three-digit octal strings), threaded alongside `fs` everywhere `fs`
already goes — same shape, same lifecycle, zero changes to any of the
40+ existing `fs.get`/`fs.set` call sites:

```js
const [fsMap, setFsMap] = useState(() => initFs(initialFiles));
const [modesMap, setModesMap] = useState(() =>
  initModes(initFs(initialFiles), initialModes),
);
```

The rule of thumb this follows: when you need to attach one new piece of
data to entries in an existing collection, and touching every existing
read/write site of that collection is the expensive part, a parallel
keyed-by-the-same-identity structure is often cheaper and safer than
restructuring the original — provided every *new* piece of logic reads
both, which the next three units are about getting right.

### Concept Unit 2: Numeric and Symbolic Modes, and a Bug Only Real Modes Could Expose

The shell's own `help chmod` text already advertised two input forms —
`chmod 755 script.sh` (numeric) and `chmod +x program` (symbolic) — so
both needed to actually work, not just the one that was easier:

```js
function parseMode(modeStr, currentMode = "644") {
  if (/^[0-7]{3,4}$/.test(modeStr)) return modeStr.slice(-3);
  const m = modeStr.match(/^[ugoa]*([+-])([rwx]+)$/);
  if (m) {
    const [, sign, bits] = m;
    const bitVal =
      (bits.includes("r") ? 4 : 0) +
      (bits.includes("w") ? 2 : 0) +
      (bits.includes("x") ? 1 : 0);
    const apply = (n) => (sign === "+" ? n | bitVal : n & ~bitVal);
    return [...currentMode].map((d) => apply(parseInt(d, 10) || 0)).join("");
  }
  return currentMode;
}
```

Verified live, this session, a real bug this exposed: the *pre-existing*
`chmod` case filtered its arguments with
`args.filter((a) => !a.startsWith("-"))` — written back when `chmod` did
nothing real, presumably to skip hypothetical flags like `-R`. The moment
`chmod` started actually parsing its mode argument, this filter became a
real bug: `chmod -x a.out` failed with `chmod: missing operand`, because
the filter stripped `-x` itself, mistaking a legitimate *decrement*
mode spec for a flag (`+x` was never affected, since `+` doesn't match
`startsWith("-")`  — only the "remove a permission" form was broken).
Confirmed by actually running `chmod -x a.out` in the live app before
concluding this was real, not assuming symbolic modes worked from reading
the regex alone. Fixed by dropping the filter entirely — this command
never had any real flags to filter in the first place.

### Concept Unit 3: Three Enforcement Points, One Permissive Default

Permissions only matter if something actually checks them. Three
chokepoints cover the meaningful cases: reading (`cat`), writing
(redirection `>`/`>>` and `tee`), and running (`./binary`):

```js
if (!canRead(effectiveMode(fs, modes, target))) {
  segErr(`cat: ${a}: Permission denied`);
  continue;
}
```

The default matters as much as the check: a path nobody ever ran
`chmod` on must behave exactly as it did before this change, in *both*
courses already using this component — otherwise "add permissions"
quietly becomes "break every existing lesson's file operations."
`canExecute` defaults an unset path to executable; `canRead`/`canWrite`
default to readable/writable. Restriction is opt-in, triggered only by
an explicit `chmod` call (or a lesson author seeding `initialModes`) —
never a side effect of this feature existing.

### Concept Unit 4: One Function, Not Three Copies of the Same Default

The first working version of this fix had the "what's the mode if
nobody set one" default written in three different places: inline in
`ls -l`, inline in `stat`, and inline in `chmod`'s own before-value —
each one a slightly different ad hoc expression (`isDir ? "755" : "644"`
here, `fs.get(tp) === "DIR" ? "755" : "644"` there). They happened to
agree on every case this lesson's own live test tried
(`chmod -x` on a freshly-compiled, never-chmod'd binary landed on `644`
either way, since `"755"` minus the execute bit and `"644"` unchanged are
numerically identical) — but that was luck, not correctness: `chmod +w`
on the same never-touched binary would have produced a *different*
result depending on which of the three copies of the default happened to
run. Consolidated into a single function, used everywhere a "what mode
does this path effectively have" question is asked:

```js
function defaultModeFor(fs, path) {
  const entry = fs.get(path);
  if (entry === "DIR") return "755";
  if (typeof entry === "string" && (entry.startsWith("__ELF__:") || entry.startsWith("__SYMLINK__:")))
    return "755";
  return "644";
}
function effectiveMode(fs, modes, path) {
  return modes.get(path) ?? defaultModeFor(fs, path);
}
```

`ls -l`, `stat`, `chmod`'s before-value, and all three enforcement checks
now all call this one function — there is exactly one place in the file
that decides what an un-chmod'd path's permissions are, not three places
that are each trying to agree with each other by coincidence.

### Concept Unit 5: Threading New State Through Four Call Sites, Not One

`runCommand` isn't called from a single place — it recurses for `$(...)`
subshells, is called once per line for `make` recipe steps and
`bash`/`sh` script execution, and once per statement from the component's
own submit handler. Every one of those four call sites builds its own
options object and reads back a `newFs` to persist. Adding `modes`/
`newModes` meant updating the function signature, its final return
statement, *and* all four call sites and their corresponding
`currentFs`/`currentModes`-style accumulator variables — miss one, and
that specific code path (say, permissions set inside a `make` recipe)
would silently fail to persist, while everything else worked. This is
the general shape of adding one new piece of threaded state to a
recursive function with more than one entry point: grep every call site
before considering the change done, not just the one you were looking at
when you started.

## Connect the Pieces

`initModes`, `parseMode`, `modeToRwx`, `defaultModeFor`, `effectiveMode`,
and the three `can*` checks are all new, small, single-purpose functions
living beside `initFs` — none of them touch `fs` itself. `CppLab.jsx`
needed zero changes to inherit this: it passes `params` straight through
to `ShellTerminal`, so its `g++`/`./a.out` flow keeps working (verified
live: compiling and running a fresh binary succeeds by default, then
`chmod -x` on that same binary makes it fail with
`Permission denied` — both confirmed in the actual running app, in that
order, in one session).

## What Breaks Without This

Verified live, this session: before the fix, `chmod 000 secret.txt`
followed by `cat secret.txt` printed the file's contents anyway — chmod
was theater. After the fix, the identical sequence produces
`Error: cat: secret.txt: Permission denied`, and `chmod 644` afterward
restores read access — confirmed both directions, not just the
restrictive one. Without the `args.filter` fix, `chmod -x` (but not
`chmod +x`) on any file fails outright with `missing operand`, silently
breaking exactly half of the shell's own documented symbolic-mode
syntax. Without consolidating to `effectiveMode`, `ls -l`, `stat`, and
`chmod`'s own notion of "current mode" could disagree with each other
and with what `cat`/execution actually enforce, for any path nobody had
explicitly `chmod`'d yet.

## Exercises

- Run `chmod 000 file.txt` then `cat file.txt`, then `chmod 644 file.txt`
  and `cat` it again. Confirm both the denial and the recovery yourself.
- Compile a C++ file, run it, then `chmod -x` it and try running it
  again. Confirm you get a real `Permission denied`, not a silent no-op.
- Find the three call sites (`ls -l`, `stat`, `chmod`) that used to each
  compute their own "default mode" inline, and confirm all three now
  call `effectiveMode` instead.
- Trace all four places `runCommand` is called from (subshell, `make`
  recipe, `bash`/`sh` script, main submit handler) and confirm every one
  now threads `modes` in and `newModes` back out.

## Definition of Done

- [x] `chmod` (numeric and symbolic) actually stores a mode per path,
      verified live via `ls -l` and `stat` reflecting the real value
- [x] `cat`, `tee`/redirection, and `./binary` execution all enforce
      real read/write/execute checks — verified live, both the denial
      and the restore-then-succeed cases
- [x] Every existing lesson's default behavior (readable/writable files,
      executable compiled binaries) is unchanged for any path nobody
      ever ran `chmod` on — verified live via a fresh `g++`/`./a.out`
      compile-and-run with zero `chmod` calls
- [x] `chmod -x` (previously broken by an arg-filter bug) now works
      identically to `chmod +x`, verified live
- [x] `ls -l`, `stat`, and `chmod`'s own before-value all resolve an
      unset path's mode through the single `effectiveMode` function —
      not three separately-written copies of the same default
- [x] All four `runCommand` call sites (subshell, make recipe, script
      execution, main loop) thread `modes`/`newModes` correctly
- [ ] `git commit` with a message explaining why — for example: "Make
      ShellTerminal's chmod real (stored, enforced modes instead of
      decorative text); fixes a real -x argument-parsing bug and
      consolidates three divergent default-mode implementations into one"
