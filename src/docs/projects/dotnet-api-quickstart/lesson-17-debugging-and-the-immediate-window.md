# Lesson 17: Debugging and the Immediate Window

**What this covers:** breakpoints, hovering to inspect a real, live
value, and the Immediate Window — the real, closest C# equivalent to
your own stated Python habit: "I just print stuff and look at it."

**What you need first:** [Lesson 04](lesson-04-discovering-an-api-in-visual-studio.md).

---

## Breakpoints: pausing a real, running program

Click in the real, left margin next to any real line of code (or put
your cursor on the line and press `F9`) — a real, red dot appears.
Press `F5` to run with the debugger attached, and the moment execution
real, reaches that line, everything real, freezes: your program is
genuinely still running, paused mid-statement, and every real, local
variable still holds its real, actual, current value.

## Hovering: a real value, without writing a print statement

While paused, hover your mouse over any real variable, parameter, or
property anywhere in view — a real, live tooltip shows its real,
current value, live object and all, no `Console.WriteLine` required
anywhere. This is genuinely the most-used, real debugging action there
is.

## The Locals and Watch windows: a real, standing list

The **Locals** window (Debug → Windows → Locals) automatically lists
every real, in-scope variable and its real, current value, updating
each time you real, step. The **Watch** window (Debug → Windows →
Watch) is the identical real idea, but for expressions *you* real,
choose to pin and keep watching across multiple, real pauses — useful
for a specific, real property several calls deep you don't want to
keep re-navigating to find.

## Stepping: moving one real line, or one real call, at a time

```
F10        Step Over -- run the current real line, don't enter any real method it calls
F11        Step Into -- enter the real method being called, line by line
Shift+F11  Step Out  -- finish the current real method, pause back in its real caller
```

`F11` (Step Into) is the real, direct way to watch a real, unfamiliar
method's own internals execute, line by line, if real source is
available for it (Lesson 04's Go To Definition tells you whether it
is).

## The Immediate Window: the real, closest thing to a Python REPL

**Debug → Windows → Immediate** (`Ctrl+Alt+I`) opens a real, small,
plain text panel — but only while your program is real, actually
paused at a breakpoint. Type any real, valid C# expression and press
Enter, and it real, genuinely executes, right then, using the real,
live, current state of your paused program:

```
> part.Name
"Bracket"
> part.HasHoles()
true
> part.GetFeatures().Count
3
> depth = 10.0
10.0
```

This is the real, direct answer to your own stated Python workflow —
"I print stuff and look at it, then try methods" — except here, you
already know a real object's members from Lesson 02, 03, or 04's
IntelliSense, and the Immediate Window lets you real, call any of them
and see a real, live result immediately, with no need to add a
`Console.WriteLine`, rebuild, and rerun just to check one thing. Typing
`part.` inside the Immediate Window even gives you the identical, real
IntelliSense dropdown Lesson 04 covered.

## One, real, honest limitation

Unlike Python's REPL, the Immediate Window only real, works while a
breakpoint has genuinely paused your program somewhere — there's no
real, standalone, always-running C# shell, because C# is a real,
compiled language, not interpreted. The real, practical habit this
creates: put a real breakpoint right after the line that gets you a
real, unfamiliar object back from a host API call, then explore it
live from there.

## Definition of done

- [ ] You set a real breakpoint, ran with the debugger attached, and
      hovered over a real, live variable to see its value.
- [ ] You used Step Into to watch a real method's own internals run.
- [ ] You opened the Immediate Window while paused and called a real
      method on a real, live object to see its result, without
      modifying your source code.
- [ ] You can state, in your own words, why the Immediate Window isn't
      always available the way Python's REPL is.

## Next

[Lesson 18 — Async and Await: Just Enough to Read It](lesson-18-async-and-await.md)
covers the last, real, common shape you'll run into reading an
unfamiliar API's method signatures.
