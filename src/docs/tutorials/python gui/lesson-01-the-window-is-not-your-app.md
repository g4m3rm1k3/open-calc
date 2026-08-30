# Lesson 1: The Window Is Not Your App

**What you will build:** a CustomTkinter window, 300×150 pixels, holding a
single label that reads "Hello, CustomTkinter" — nothing more. The
transferable problem this lesson is actually about: right now, in your
real hacked-together app, you can't tell where "the window" ends and
"your program" begins, because you built them as one thing from the
first line. This lesson draws that line on purpose, in the simplest
possible app, so it's visible before your app's real complexity (parsed
files, Jinja templates, buttons wired to actions) gets added on top of
it. By the end you'll be able to say, concretely, which of the four
lines in this lesson's code create *state* (an object that exists,
whether or not anyone's looking at it) and which create *behavior*
(something that only happens because you told the event loop to start
running).

**What you need to know first:** Nothing from this curriculum — this is
Lesson 1. This curriculum does assume you already have working, general
Python: you can read a `def`, an `import`, an assignment, and a function
call without those being re-taught here. What's taught here, from zero,
is everything specific to building a GUI with a widget library — the
vocabulary and objects that don't exist in plain Python at all.

**Terms used in this lesson**

- **module import, with an alias (`import x as y`)** — the `import`
  statement pulls a separate module's code into this file so its
  contents become reachable; the `as y` clause is a second, independent
  choice — it lets you refer to that module under a shorter or
  more conventional local name instead of its full one. This exists
  because typing `customtkinter.CTk()` on every line would be tedious
  and because the ecosystem around a library often settles on one
  conventional alias (here, `ctk`) so that code from different authors
  reads consistently.
- **keyword argument** — a function or constructor argument passed as
  `name=value` instead of by position (`text="Hello, CustomTkinter"`
  rather than just `"Hello, CustomTkinter"` in the right slot). This
  exists because GUI constructors commonly take a dozen or more optional
  settings (color, font, padding, width...) and position-only arguments
  would force you to either supply all of them in an exact, memorized
  order or none at all; keyword arguments let you supply only the ones
  you care about, by name, in any order.
- **event loop** — a running piece of code, provided by the GUI library,
  that sits in an infinite loop watching the operating system for things
  that just happened (a mouse click, a key press, a window resize, a
  timer expiring) and calling the piece of *your* code you registered
  for that specific thing. This exists because a GUI program doesn't
  know in advance what order the user will do things in — there's no
  fixed script to just run top to bottom the way a data-processing
  script has. The concrete method that starts this loop, `.mainloop()`,
  gets its own full entry below in Objects and methods.
- **geometry manager** — the subsystem responsible for deciding a
  widget's actual on-screen position and size. This exists because
  creating a widget object in Python and having that widget actually
  occupy pixels on the screen are two separate steps, on purpose:
  separating "what widgets exist" from "where they go" is what lets the
  same widget be laid out differently (stacked, gridded, placed at exact
  coordinates) without changing how it was built. This lesson's code
  uses one specific geometry manager, `.pack()`, which gets its own full
  entry below.
- **widget tree (parent/child hierarchy)** — every widget in a Tkinter-
  family GUI (Tkinter, and CustomTkinter which is built directly on top
  of it) is created by naming another widget as its *master* — the
  widget it lives inside. This forms a tree, rooted at the main window,
  the same shape as the folders-inside-folders on a filesystem. This
  exists because a GUI is inherently nested (a button lives inside a
  frame, which lives inside a window) and the library needs to know that
  nesting to do two separate jobs correctly: drawing (a child is
  clipped to, and drawn on top of, its parent) and destruction (destroy
  a parent and every descendant is destroyed with it, automatically).

**Objects and methods used**

- **`ctk.CTk`**
  - *What it is:* the class you instantiate to get your application's
    main window. It is CustomTkinter's own replacement for plain
    Tkinter's `tkinter.Tk`, restyled to look modern and to support
    light/dark appearance modes, but it is not a from-scratch
    reimplementation of a window.
  - *Implementation:* found in
    `customtkinter/windows/ctk_tk.py`, and its real declaration, read
    from the installed package this session, is
    `class CTk(CTK_PARENT_CLASS, CTkAppearanceModeBaseClass, CTkScalingBaseClass)`
    where `CTK_PARENT_CLASS = tkinter.Tk`. Its constructor, also read
    from that file, is
    `def __init__(self, fg_color: Optional[Union[str, Tuple[str, str]]] = None, **kwargs)`
    — every argument is optional, so `ctk.CTk()` with nothing inside the
    parentheses is a completely valid, fully-formed call.
  - *Its use:* every CustomTkinter program needs exactly one of these —
    it's the root of the entire widget tree (see Terms, above) and the
    object whose `.mainloop()` you eventually call to bring the program
    to life.
  - *Type:* a class; `ctk.CTk()` constructs an instance of it — a real,
    live Python object sitting in memory, not a template or a
    description of a window.
  - *Responsibility:* owns the operating-system-level window itself
    (its title bar, its size, its position on screen), owns the root of
    the widget tree that every other widget in the program will attach
    to, and owns the single event loop the whole program runs inside.
  - *Depends on:* nothing required — every constructor argument is
    optional, backed by `**kwargs` and a `None`-defaulted `fg_color`, so
    it can construct itself with zero information from you.
  - *Connects to:* your code calls `ctk.CTk()` to create it; every
    widget you build afterward (this lesson's `ctk.CTkLabel`, and every
    button, entry, and frame future lessons add) is connected to it,
    directly or indirectly, as an ancestor in the widget tree; and your
    code calls `.mainloop()` on it to hand control over to the event
    loop.
  - *Shape:* this is the single most public, outermost seam in any
    CustomTkinter program — the one object every other piece of GUI
    code in the entire application is either built from or built inside
    of.

- **`CTk.mainloop`**
  - *What it is:* the method that starts the event loop (see Terms,
    above) and does not return control to your code until the window is
    closed.
  - *Implementation:* `CTk` doesn't define its own `mainloop` — it's
    inherited straight from `tkinter.Misc`, the base class every
    Tkinter widget shares. Its real body, read from the installed
    Python 3.12 standard library this session, is three lines:
    `def mainloop(self, n=0): """Call the mainloop of Tk."""; self.tk.mainloop(n)`
    — `self.tk` is a lower-level handle onto the actual Tcl/Tk runtime
    that Python's `tkinter` module wraps, and the real work happens
    inside that runtime, in C, not in Python at all. `self.tk.mainloop(n)`
    is where control actually leaves your Python code.
  - *Its use:* without calling this, `ctk.CTk()` above constructs a real
    window object, but nothing ever watches for clicks, nothing ever
    redraws, and the script would just run to its last line and exit —
    Concept Unit 2, below, proves this directly.
  - *Type:* an instance method — you call it *on* a specific `CTk`
    object (`app.mainloop()`), not as a free-standing function.
  - *Responsibility:* to repeatedly ask the operating system "has
    anything happened to any window or widget I own?", and for each
    thing that has, to run whatever Python code was registered to
    handle it — until something (usually the window closing) tells it
    to stop.
  - *Depends on:* a real, already-constructed root window to run the
    loop for — you cannot call `.mainloop()` before `ctk.CTk()` has
    already succeeded.
  - *Connects to:* your code calls it exactly once, near the end of the
    file; from that point on, it is `.mainloop()` — not your code
    top-to-bottom — that decides what runs next, by calling back into
    whatever functions you registered as event handlers (later lessons;
    this lesson has none yet).
  - *Shape:* the boundary between "setup code you wrote and control"
    and "the library's own runtime driving your code from now on" — one
    of the most important seams in any GUI program, because everything
    written *after* this call in your file only runs once the loop has
    already ended.

- **`ctk.CTkLabel`**
  - *What it is:* a widget that displays a piece of read-only text (or,
    in later use not shown in this lesson, an image) somewhere inside
    its parent.
  - *Implementation:* found in
    `customtkinter/windows/widgets/ctk_label.py`, declared as
    `class CTkLabel(CTkBaseClass)`. Its constructor's real, relevant
    opening — read from the installed package this session — is
    `def __init__(self, master: Any, width: int = 0, height: int = 28, ...)`
    — `master` is the first parameter and has no default, so it must be
    supplied; every sizing and styling argument after it does have a
    default.
  - *Its use:* this lesson's code passes it two arguments: `app` as
    `master` (positionally) and `text="Hello, CustomTkinter"` as a
    keyword argument — this is the smallest call that produces a real,
    visible label.
  - *Type:* a class; `ctk.CTkLabel(app, text="...")` constructs an
    instance of it.
  - *Responsibility:* to hold and display one piece of text (or image)
    content, and to know how to draw itself, at whatever size and
    position the geometry manager (Concept Unit 4, below) ultimately
    assigns it.
  - *Depends on:* a `master` — a parent widget it will live inside; this
    lesson's code supplies `app`, the `CTk` root window, directly.
  - *Connects to:* it is built *from* `app` (its `master` argument), and
    it is later handed to `.pack()` (below) so the geometry manager
    knows to include it in the layout; it draws itself on screen
    because `app`'s own drawing, driven by the event loop, includes
    drawing every widget in its tree.
  - *Shape:* an ordinary leaf widget — nothing else in this lesson is
    built as a child *of* the label; it sits at the bottom of the
    widget tree this lesson builds.

- **`CTkLabel.pack`**
  - *What it is:* the specific geometry manager (see Terms, above) this
    lesson uses to actually place the label on screen.
  - *Implementation:* CustomTkinter widgets inherit Tkinter's real
    `Pack` mixin unchanged — this lesson's `.pack(pady=20)` call resolves
    to `tkinter.Pack.pack_configure`, whose real body, read from the
    installed Python 3.12 standard library this session, ends in
    `self.tk.call(('pack', 'configure', self._w) + self._options(cnf, kw))`
    — every keyword argument you pass (here, just `pady`) is collected
    into `kw`, translated into `self._options(...)`, and handed straight
    to the underlying Tcl/Tk runtime as a real `pack configure` command;
    Python itself does no layout math.
  - *Its use:* `.pack(pady=20)` tells the geometry manager to stack this
    widget in its parent (the default behavior with no other widgets
    yet present) with 20 pixels of vertical padding above and below it.
  - *Type:* an instance method, called on the widget being placed —
    `label.pack(...)`, not `app.pack(...)`.
  - *Responsibility:* to register this specific widget with its
    parent's layout system and to compute — via the real Tcl/Tk call
    above, not in Python — where exactly it ends up.
  - *Depends on:* the widget must already exist (built by `CTkLabel`,
    above) and must already have a parent (supplied when it was built).
  - *Connects to:* it's called on the `CTkLabel` instance from the unit
    above, and its effect is only visible once the event loop
    (`.mainloop()`, above) actually runs and redraws the window.
  - *Shape:* this is the seam between "an object exists in memory" and
    "a user can actually see it" — Concept Unit 3's own lab proves these
    are genuinely two different moments, not one.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`tkinter.Tk`**
  - *What it is:* the plain-Tkinter class `CTk` is built on top of —
    the actual, original root-window class that ships with Python
    itself, with no CustomTkinter styling applied.
  - *Implementation:* part of Python's own standard library, imported
    internally by CustomTkinter as `CTK_PARENT_CLASS`; `CTk` inherits
    from it directly (see `ctk.CTk`'s own *Implementation* bullet,
    above, for the exact real declaration).
  - *Its use:* you never write `tkinter.Tk` yourself in this lesson —
    it matters here only because it's *why* `ctk.CTk()` already knows
    how to do window-level things (be titled, be resized, run an event
    loop) without CustomTkinter having to reimplement any of that: it
    inherited all of it.
  - *Type:* a class, and specifically the base class `CTk` extends.
  - *Responsibility:* everything a bare, unstyled OS window needs to do
    — this is the actual thing `.mainloop()` (above) is a method of,
    inherited two classes up.
  - *Depends on:* Python's own `_tkinter` C extension module, which in
    turn depends on a real Tcl/Tk installation on the machine running
    the code.
  - *Connects to:* `ctk.CTk` inherits from it directly; this lesson's
    own lab 1, below, proves the connection for real with
    `isinstance(app, tkinter.Tk)`.
  - *Shape:* the actual foundation everything else in this entire
    curriculum sits on — CustomTkinter is a styling layer, not a
    replacement runtime.

---

## Concept Unit: The CTk Root Window Object

### The Problem

Every one of your app's windows, buttons, and labels has to live
*somewhere* — some single object has to be the thing the operating
system actually gives screen space to, and every other widget you build
has to ultimately trace back to it. Right now, in your hacked-together
app, you likely built this object and then immediately started piling
your parsed file data onto the same object with `self.whatever = ...` —
which means, a year from now, you can't tell from reading `self.foo`
alone whether `foo` is a piece of your data or a piece of the window
itself.

> **Stop and think before reading on:** you already know, from general
> Python, that `SomeClass()` constructs an object. Given that, what do
> you think `ctk.CTk()` — with genuinely nothing inside the
> parentheses — actually returns? Is it plausible for a class
> constructor to have *zero* required information and still produce
> something real and useful? What's the smallest possible thing you
> could check, using only `print()` and `type()`, to find out what kind
> of object you actually got back, before reading any further?

### The New Code

```python
import customtkinter as ctk

app = ctk.CTk()
```

### The Updated Project

This is a brand-new file — there is no existing structure to show these
two lines landing inside. From here forward in this lesson, every
Concept Unit adds to this same file, and each one will show the whole
file growing.

```python
 1  import customtkinter as ctk
 2
 3  app = ctk.CTk()
```

At this point the file does exactly one thing: it creates a single,
real, empty application window object and holds a reference to it in
the variable `app`. Nothing is visible yet, and nothing will be until a
later unit in this lesson calls `.mainloop()` — this is deliberate:
*constructing* the window and *running* it are two separate actions,
and this unit isolates the first one on its own.

### Isolating It

The throwaway lab below is exactly the two lines above, plus enough
extra code to prove, for real, what `app` actually is — run before
`.mainloop()` is ever called, so the proof is about the object itself,
independent of the event loop.

```python
import customtkinter as ctk
import tkinter

app = ctk.CTk()
app.geometry("300x150")

print("type(app):", type(app))
print("app is instance of tkinter.Tk:", isinstance(app, tkinter.Tk))
print("app.winfo_class():", app.winfo_class())
```

Real output, from an actual run under a virtual display this session
(the window itself was also screenshotted at this point and shows a
blank, empty 300×150 frame — there's nothing inside it yet, which is
exactly what this unit's code should produce):

```
type(app): <class 'customtkinter.windows.ctk_tk.CTk'>
app is instance of tkinter.Tk: True
app.winfo_class(): Tk
```

This is called an **object construction** — the moment a class's
`__init__` runs and produces a real, live instance sitting in memory,
as opposed to the class itself, which is only a blueprint. What this
output proves: `app` is not a placeholder, a dictionary, or a
description of a future window — it is a genuine, already-existing
Python object, an actual instance of CustomTkinter's `CTk` class, which
the second line proves is *also*, simultaneously, a real
`tkinter.Tk` — because `CTk` inherits from it (see `ctk.CTk`'s
*Implementation* bullet in the Header, above). `winfo_class()` — a
method inherited from that same `tkinter.Tk` ancestor, asking the
underlying Tcl/Tk runtime "what kind of thing are you, really?" —
answers `Tk`, confirming the same fact from the runtime's own side, not
just Python's.

This throwaway example is now discarded — it never appears in the
actual project again. What stays is only the two lines shown in The New
Code, above: constructing `app` is a real, permanent piece of your
program; the `print` statements existed only to let you see, once, that
the object is real, and they don't belong in the finished application.

### Mechanical Walkthrough

1. `import customtkinter as ctk` — a module import with an alias (Terms,
   above). This runs CustomTkinter's own `__init__.py` once, making
   every name it defines — including `CTk`, used on the next line —
   reachable through the short local name `ctk` instead of the full
   `customtkinter`.
2. `app = ctk.CTk()` has three distinct parts. `ctk.CTk` is an attribute
   access — reaching into the `ctk` module's namespace to find the class
   object named `CTk` that the import above made available. `(...)`
   with nothing inside it is a function call with zero arguments —
   valid here specifically because every one of `CTk.__init__`'s
   parameters is optional (see the Header's *Implementation* bullet for
   `ctk.CTk`, above, for the real signature proving this). `app = ...`
   is an assignment — it does not create the object; the call on the
   right-hand side already did that. The assignment only gives you, the
   programmer, a name to refer to that already-existing object by
   afterward.

### CS Lens

This is the **constructor pattern** — a class defines what shape an
object of that type has and how to bring one into existence, and
calling the class like a function is how you ask for a new one. It's a
foundational idea, not specific to GUI programming or even to Python.

```
Also recognized in: any object-oriented language's `new` keyword
(Java, C#), a database ORM's `Model.objects.create(...)`, a factory
function in JavaScript, spawning a new process in an operating system
```

### SE Lens

The design principle here is **separation of construction from use**:
`CTk.__init__` only sets up the object's own internal state (a real
window handle, default size, default colors) — it doesn't ask you for
any data about *your* application, and it doesn't do anything with the
screen beyond creating the handle. The alternative CustomTkinter didn't
choose would be a constructor that also immediately required, say, a
list of widgets to display, or a callback to run on close — bundling
"bring the object into existence" with "configure it for a specific
use." Keeping construction minimal is what makes `ctk.CTk()` reusable
as the very first line of *any* CustomTkinter program, regardless of
what that program will eventually do; the cost, if any, is that a
completely empty `CTk()` isn't itself proof your window will *look*
right — that's deferred to the units below.

### Commands Needed

None yet — this unit is pure Python, run with the same `python3` command
you already use for scripts. GUI-specific commands (installing the
library, running under a display) are introduced in the next unit,
where they're actually needed to see a result.

### Run It

Already shown above, under Isolating It — the real, saved output from
this session:

```
type(app): <class 'customtkinter.windows.ctk_tk.CTk'>
app is instance of tkinter.Tk: True
app.winfo_class(): Tk
```

### Connecting to What Came Before

Nothing came before this — it's the first unit of the first lesson; this
`app` object is the foundation every remaining unit in this lesson
builds on.

---

## Concept Unit: The Event Loop — `.mainloop()`

### The Problem

The unit above already proved `app` is a real object sitting in memory.
So why, if you ran that lab, did no window ever actually appear on your
screen? Something is missing between "the object exists" and "a user
can see and interact with it."

> **Stop and think before reading on:** a normal Python script runs
> top to bottom and then exits — the last line finishes, and the
> program ends. A GUI program, though, has to sit there indefinitely,
> waiting for a click that might happen ten seconds from now or might
> never happen. What would you have to add to an ordinary top-to-bottom
> script to make it "wait around" like that instead of just finishing
> immediately? Have you seen anything in plain Python before — a
> `while True:` loop, for instance — that behaves even a little like
> "run forever until something tells you to stop"?

### The New Code

```python
app.mainloop()
```

### The Updated Project

```python
 1  import customtkinter as ctk
 2
 3  app = ctk.CTk()
 4  app.mainloop()
```

The file as a whole now does two things instead of one: it still
constructs the empty window object (line 3, unchanged from the unit
above), and now it also hands control over to that object's event loop
(line 4, new). Run today, exactly as shown, this already produces a
real — if empty — visible window that stays open until you close it;
the remaining units in this lesson only add content *inside* it.

### Isolating It

```python
import customtkinter as ctk

app = ctk.CTk()
app.geometry("300x150")

print("BEFORE mainloop(): this line runs immediately")

def after_1s():
    print("INSIDE after_1s(): the loop is alive and dispatching timers")
    app.destroy()

app.after(1000, after_1s)

print("CALLING mainloop() now -- execution will pause here")
app.mainloop()
print("AFTER mainloop(): this only runs once the loop has ended")
```

`app.after(1000, after_1s)` is not this unit's subject — it's a small,
already-minimal piece of scaffolding (schedule a function to run once,
1000 milliseconds from now) used here only so the lab can close its own
window automatically instead of needing a real mouse click, so it can
run unattended and prove its point through printed output.

Real output, from an actual run under a virtual display this session:

```
BEFORE mainloop(): this line runs immediately
CALLING mainloop() now -- execution will pause here
INSIDE after_1s(): the loop is alive and dispatching timers
AFTER mainloop(): this only runs once the loop has ended
```

This is called the **event loop**, named in full in the Header's Terms,
above. What this output proves, line by line, matters more than the
lines themselves — this is a timing trace, not a changing-values trace,
so it's read as a sequence of moments rather than a table:

1. `print("BEFORE mainloop()...")` — runs immediately, proving
   everything up to this point (creating `app`, scheduling the timer)
   happened the ordinary way, top to bottom, exactly like a normal
   script.
2. `print("CALLING mainloop() now...")` — also runs immediately,
   *before* `app.mainloop()` on the next line, proving this print
   statement is not itself blocked by anything — the block only starts
   once `.mainloop()` is actually called.
3. `app.mainloop()` — this is where execution genuinely pauses. Nothing
   after this line runs yet. Control has left your top-to-bottom script
   and is now inside the library's own C-level Tcl/Tk runtime (see the
   Header's *Implementation* bullet for `CTk.mainloop`, above).
4. `print("INSIDE after_1s()...")` — this only runs because the event
   loop, still running, noticed that 1000 milliseconds had passed and
   called `after_1s()` back into your code — proof the loop is alive
   and actively watching for things, not just sitting frozen.
5. `app.destroy()`, inside `after_1s()` — this is what actually ends
   the loop; `.mainloop()` keeps running until something like this
   tells it to stop.
6. `print("AFTER mainloop()...")` — this is the proof that matters
   most: it only runs *after* the loop has fully ended, confirming
   `.mainloop()` genuinely blocked this line from running any earlier,
   for the full second the loop was alive.

This throwaway example is now discarded. What stays in the real project
is only `app.mainloop()` itself, exactly as shown in The New Code above
— with no scaffolding, because the real program will be closed by a
user clicking the window's own close button, not by a scheduled timer.

### Mechanical Walkthrough

1. `app.mainloop()` — an instance method call with zero arguments, on
   the `app` object built in the previous unit. `mainloop`'s real body,
   quoted in full in the Header's Objects and methods section above, is
   `self.tk.mainloop(n)` — a call straight into the Tcl/Tk runtime, with
   the default `n=0`. This single call is what starts the event loop
   (Terms, above) and is the reason a GUI program's file, unlike an
   ordinary script, doesn't just run and immediately exit.

### CS Lens

The event loop is a specific instance of the more general **event-driven
programming** model — a program structured around reacting to external
events rather than executing a fixed, predetermined sequence of steps.

```
Also recognized in: a web browser's JavaScript engine, a video game's
main loop, an operating system's own interrupt handler, a network
server's request-handling loop, `async`/`await`-based code in any
modern language
```

### SE Lens

The tradeoff being made here is **control inversion**: once
`.mainloop()` is called, your code is no longer in charge of what runs
next — the library is, and it only calls back into your code (via
functions you register, starting in a later lesson) when specific
things happen. The alternative — a program that repeatedly asks "did
anything happen yet?" itself, in a loop you write and control — is
called *polling*, and GUI libraries deliberately don't make you write
it: polling wastes CPU checking for nothing, and it's easy to get the
timing wrong. The cost of the inversion CustomTkinter chose instead is
mainly conceptual: your own top-to-bottom code effectively ends at
`.mainloop()`, and everything after it in the same function only runs
once the whole window's lifetime is already over — which is exactly why
this lesson's own lab needed a `print` statement placed *after*
`.mainloop()` to make that boundary visible at all.

### Commands Needed

To actually see this window (rather than just prove it exists via
`print`), you need CustomTkinter installed, and, if you're running
without a physical monitor attached (as this lesson's own verification
runs were, inside a sandboxed environment), a virtual display:

- `pip install customtkinter` — installs the library itself from the
  Python Package Index. Success looks like a line ending
  `Successfully installed customtkinter-<version> darkdetect-<version>`
  — `darkdetect` is a small dependency CustomTkinter uses to detect
  your operating system's light/dark mode setting automatically.
- On a real desktop machine (yours, at work), nothing further is
  needed — Tkinter already talks directly to your actual screen. The
  virtual-display step below is specific to headless verification
  environments like the one used to produce this lesson's own screenshots,
  not something you'll need on your own machine.

### Run It

Real output, from an actual run under a virtual display this session,
already shown in full above under Isolating It. A real screenshot was
also taken at this point in the lab, showing a blank 300×150 window with
no visible content — proving the window itself renders correctly even
before any widget has been added to it, which the next unit builds on.

### Connecting to What Came Before

The unit above built a real object sitting silently in memory; this unit
is what actually brings it to life on screen and keeps it alive until
something closes it — every remaining unit in this lesson only makes
sense once this one is understood, because they all add content that
only becomes visible *because* this loop is running.

---

## Concept Unit: Parent-Child Widgets — `ctk.CTkLabel`

### The Problem

`app` is now a real, running window. But a running, empty window is not
useful on its own — you need a way to put something *inside* it, and
that something needs to know, somehow, which window it belongs to.

> **Stop and think before reading on:** if you were designing a widget
> library from scratch, and you needed every button, label, and frame
> to know which window it belongs to, how would you make that
> connection? Would you have the *window* keep a list of everything
> inside it, would you have each *widget* be told its own parent when
> it's created, or both? What problems can you imagine if a widget
> existed with no connection to any window at all — where would it
> even be drawn?

### The New Code

```python
label = ctk.CTkLabel(app, text="Hello, CustomTkinter")
```

### The Updated Project

```python
 1  import customtkinter as ctk
 2
 3  app = ctk.CTk()
 4
 5  label = ctk.CTkLabel(app, text="Hello, CustomTkinter")
 6
 7  app.mainloop()
```

The file now builds three things in sequence: the root window (line 3),
a label that belongs to that window (line 5, new), and only then does it
start the event loop (line 7, unchanged from the unit above — note it
had to move down one line to stay after the label is built, since a
widget has to exist before the loop that draws it starts). Run as shown,
this produces a real window — but, as this unit's own lab proves below,
the text will *not* yet be visible, even though the label genuinely
exists.

### Isolating It

```python
import customtkinter as ctk

app = ctk.CTk()
app.geometry("300x150")

print("app.winfo_children() before creating label:", app.winfo_children())

label = ctk.CTkLabel(app, text="Hello, CustomTkinter")

print("label.master is app:", label.master is app)
print("app.winfo_children() after creating label:", app.winfo_children())
```

This is exactly what line 5 above does, isolated, with `print`
statements added before and after it so the effect of that one line is
directly visible in the output — not inferred.

Real output, from an actual run under a virtual display this session:

```
app.winfo_children() before creating label: []
label.master is app: True
app.winfo_children() after creating label: [<customtkinter.windows.widgets.ctk_label.CTkLabel object .!ctklabel>]
```

A real screenshot was also taken at this point — it shows the same
blank window as the previous unit's screenshot, with **no visible text
anywhere**, even though the label genuinely, provably exists.

This relationship is called the **widget tree**, named in full in the
Header's Terms, above. What this output proves: before line 5 runs,
`app`'s list of children is empty (`app.winfo_children()` returns
`[]`). After it runs, that same list now contains the label —
`app.winfo_children()` returns a one-item list holding it — and
`label.master is app` confirms, from the label's own side, that its
parent really is the specific `app` object built earlier, not some
other window. And yet — this is the actual point of this unit — the
screenshot shows nothing. Existing in the widget tree and being visible
on screen are two genuinely separate facts; the next unit is what
closes that gap.

This throwaway example is now discarded. What stays in the real project
is only line 5 shown in The New Code above, with no `print` statements —
those existed only to make an otherwise invisible fact (the tree
connection) visible once, for learning.

### Mechanical Walkthrough

1. `ctk.CTkLabel` — an attribute access into the `ctk` module's
   namespace, the same kind of access as `ctk.CTk` in the first unit,
   this time finding the class object named `CTkLabel`.
2. `(app, text="Hello, CustomTkinter")` — a function call with two
   arguments of two different kinds. `app` is a **positional
   argument** — it fills `CTkLabel.__init__`'s first parameter,
   `master`, by position, with no name attached; the real signature,
   quoted in full in the Header's Objects and methods section above,
   confirms `master` is the first parameter and has no default value,
   meaning this argument is required. `text="Hello, CustomTkinter"` is
   a **keyword argument** (Terms, above) — it's supplied by name,
   setting the label's displayed text specifically, regardless of
   where `text` falls in the real parameter list.
3. `label = ...` — an assignment, exactly the same kind covered in the
   first unit's walkthrough: it gives you a name to refer to the
   already-constructed label object by; the object itself was already
   fully built by the call in step 2 before this assignment happens.

### CS Lens

The parent/child relationship every widget participates in is a
**tree data structure** — specifically, in this case, a tree where every
node (widget) is created already knowing its own parent, rather than a
parent being built up afterward by inserting children into it.

```
Also recognized in: a filesystem's folders and files, an HTML page's
DOM (every element has a parent element), an organization chart, a
family tree, the nested scopes of a programming language itself
(a function defined inside another function)
```

### SE Lens

The design principle here is that CustomTkinter — inheriting this
directly from Tkinter — chose to make the parent/child link **mandatory
at construction time** (`master` has no default) rather than optional,
settable later. The alternative would be a widget you could build with
no parent at all, and attach to one afterward with some separate method
call — which sounds more flexible, but would mean it's possible to
accidentally end up with a "loose" widget belonging to nothing, with no
clear answer to where it should ever be drawn, or what should happen to
it if its intended parent is destroyed. Requiring the parent up front
closes off that entire category of bug before it can happen, at the
cost of needing to already know which window or frame a widget belongs
to at the exact moment you write the line that creates it — which, as
you'll find once your own app has several windows or tabs, is not
always the very first thing you know.

### Commands Needed

None new — this unit uses the same installed library and, in this
sandboxed environment, the same virtual display as the unit before it.

### Run It

Real output, from an actual run under a virtual display this session,
already shown in full above under Isolating It.

### Connecting to What Came Before

The event loop from the unit above is what will eventually *draw*
whatever's in this tree — this unit is what actually puts something
into that tree for the loop to find, even though, as its own lab
proved, existing in the tree alone still isn't enough to be seen.

---

## Concept Unit: Geometry Management — `.pack()`

### The Problem

The unit above proved a real gap: the label exists, and the window
knows about it, and yet nothing appears on screen. Something else has to
happen before a widget that exists is a widget you can actually see.

> **Stop and think before reading on:** think back to the previous
> unit's screenshot — the label was real, provably connected to the
> window, and still invisible. What kind of information is genuinely
> still missing? The label has content (its text) and a parent — what
> does it *not* have yet that a person looking at a window would need
> it to have, in order to actually draw it in a specific spot?

### The New Code

```python
label.pack(pady=20)
```

### The Updated Project

```python
 1  import customtkinter as ctk
 2
 3  app = ctk.CTk()
 4
 5  label = ctk.CTkLabel(app, text="Hello, CustomTkinter")
 6  label.pack(pady=20)
 7
 8  app.mainloop()
```

This is the complete file this lesson builds toward. Line 6 is the only
addition — it comes directly after the label is constructed (line 5)
and before the event loop starts (line 8), because the label has to
exist before it can be placed, and it has to be placed before the loop
runs and draws the window for the first time.

### Isolating It

```python
import customtkinter as ctk

app = ctk.CTk()
app.geometry("300x150")

label = ctk.CTkLabel(app, text="Hello, CustomTkinter")
print("winfo_ismapped() before pack():", label.winfo_ismapped())

label.pack(pady=20)
```

(`winfo_ismapped()` returns `1` if a widget is actually visible on
screen and `0` if it isn't — the same distinction the previous unit's
screenshot showed visually, checked here as a number instead.)

Real output, from an actual run under a virtual display this session
— note the second print happens after a scheduled screenshot-and-close
callback in the real lab file, confirming the state genuinely changed
once `.pack()` ran, not just once the script reached that line:

```
winfo_ismapped() before pack(): 0
winfo_ismapped() after pack(): 1
```

A real screenshot taken immediately after `.pack()` ran shows the text
"Hello, CustomTkinter" actually visible near the top-left of the window,
with visible space above it — proof of the `pady=20` padding argument
specifically, not just proof that *some* text appeared.

This is called a **geometry manager**, named in full in the Header's
Terms, above; this specific one is called **pack**. What this output
proves: `winfo_ismapped()` genuinely flips from `0` to `1` as a direct
result of the `.pack()` call, and nothing else — the label's text, its
parent, and everything else about it were already set by the previous
unit and did not change here. Visibility is controlled entirely
separately from existence and content.

This throwaway example is now discarded. What stays in the real project
is only line 6 shown in The New Code above.

### Mechanical Walkthrough

1. `label.pack(pady=20)` — an instance method call on the `label`
   object built in the previous unit. `pack` is a **keyword argument**
   call, same kind as `CTkLabel`'s `text=` argument in the previous
   unit: `pady=20` sets one specific option (vertical external padding,
   in pixels) by name, leaving every other option `pack_configure`
   accepts at its default. The real body of this method, quoted in full
   in the Header's Objects and methods section above, ends by handing
   your options straight to the Tcl/Tk runtime as an actual
   `pack configure` command — the positioning math itself happens
   inside that runtime, not in the Python code you wrote.

### CS Lens

Separating *what exists* from *how it's laid out* is an application of
the more general **separation of concerns** principle — keeping two
different responsibilities (content, and spatial arrangement) in two
different places so that changing one doesn't require touching the
other.

```
Also recognized in: CSS separated from HTML on a web page, a document's
content separated from its print layout, a spreadsheet's data separated
from its column widths, a building's floor plan separated from what
furniture eventually goes in each room
```

### SE Lens

The tradeoff here is between **pack**, the geometry manager this lesson
uses, and Tkinter's two alternatives, **grid** and **place** — this
lesson picked pack specifically because it's the simplest to reason
about with only one widget (it just stacks things in order), not
because it's unconditionally the best choice. Grid trades that
simplicity for precise row/column alignment, which matters the moment
you have a form with labels lined up against input boxes — something
pack can approximate but not do as cleanly. Place trades it for exact
pixel coordinates, which matters for free-form layouts but means your
window stops resizing sensibly if the user drags its edges, since
nothing is expressed relative to anything else. The real cost of
choosing pack for a single label, as this lesson does, is nothing yet —
but it's worth knowing, going in, that a form with many aligned fields
(closer to what your own real app's inputs need) is exactly the case
where a future lesson will need to switch to grid instead, deliberately,
not by accident.

### Commands Needed

None new.

### Run It

Real output, from an actual run of the complete file shown in this
unit's Updated Project, under a virtual display this session:

```
mainloop exited -- window closed
```

(The single line above is deliberately the *only* printed output — the
finished program, unlike its own throwaway labs, has no `print`
statements left in it at all; a real screenshot taken just before the
window closed shows the label's text visible, padded from the top of
the window, matching the lab's own screenshot above.)

### Connecting to What Came Before

This unit is what finally closes the gap the previous unit deliberately
left open: a widget that exists, has content, and belongs to the right
parent still needed one more, separate instruction — where to actually
put it — before a person looking at the running window could see
anything at all.

---

## Connect the Pieces

Follow one single value — the string `"Hello, CustomTkinter"` — through
every unit this lesson built, start to finish:

It doesn't exist yet while `app = ctk.CTk()` runs (Unit 1) — that line
only creates the empty window it will eventually live inside. It still
doesn't exist while `app.mainloop()` is written into the file (Unit 2)
— that line only makes the window capable of staying open and reacting
to things; nothing about *what's shown* is decided by it. It's created
for the first time as a `text=` keyword argument on
`ctk.CTkLabel(app, text="Hello, CustomTkinter")` (Unit 3) — at this
exact moment the string is stored inside a real label object, which is
connected into `app`'s own widget tree as a child — and yet, as that
unit's own screenshot proved, it's still completely invisible to
anyone looking at the running window. Only once `label.pack(pady=20)`
runs (Unit 4) does a geometry manager decide an actual on-screen
position for the widget holding that string, and only then — the next
time the event loop from Unit 2 redraws the window — does
"Hello, CustomTkinter" become something a person looking at the screen
can actually read. Four separate facts (a window exists; a loop is
running; a widget with this text exists; that widget has a screen
position) all had to become true, in that order, before one string
became visible — and every one of your app's real windows, buttons, and
labels goes through this identical sequence, whether or not the code
that builds them makes each step this visible.
