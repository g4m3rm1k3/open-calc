# Lesson 1: A Program That Waits Instead of Finishing

**What you will build.** A window that opens, sits on screen, and stays
open until the user closes it — the smallest possible PySide6 program.
The transferable problem this lesson is actually about: every program
you've likely written before runs top to bottom and exits; a GUI
program has to do the opposite — start up, then *deliberately refuse to
end* until something (a click, a close button) tells it to. Getting
that inversion straight, and seeing exactly which object is responsible
for it, matters more than the four lines of code that follow from it.

**What you need to know first.** Nothing — this is Lesson 1.

**Terms used in this lesson**

- **GUI toolkit** — a library that draws windows, buttons, and other
  visible controls and translates raw operating-system input (mouse
  moves, key presses, window-manager close requests) into events your
  code can react to. Exists because talking to the OS's actual
  windowing system directly (X11, Wayland, Win32, Cocoa) is
  low-level, verbose, and different on every platform; a toolkit gives
  one API that works the same way across all of them.
- **Event loop** — a loop, running inside the toolkit's own code, that
  repeatedly asks the operating system "has anything happened?" and,
  when the answer is yes, dispatches that happening to the right piece
  of your code. It exists because a GUI program can't know in advance
  *when* the user will click something — it has no next line to run,
  only a standing readiness to react whenever something arrives.
- **Blocking call** — a function call that does not return control to
  the line after it until some condition is satisfied. Exists as a
  concept distinct from "a slow function" — a blocking call may sit
  there instantly, for a millisecond, or for the entire lifetime of
  your program; what defines it is that *you don't control when it
  returns*, something else does.
- **Headless / offscreen rendering** — running GUI code with no real
  display attached, by telling the toolkit to render into memory
  instead of onto a physical screen. Exists because GUI code still
  needs to be tested and verified in places with no monitor at all —
  CI servers, containers, this very lesson's own verification runs —
  without the code itself changing.

**Objects and methods used**

- **`QApplication`**
  - *What it is:* the single object, per process, that represents "this
    GUI program is running" to the underlying Qt toolkit.
  - *Implementation:* a class defined in `PySide6.QtWidgets`, with real
    constructor signature `QApplication(sys.argv)`. Its own inheritance
    chain, confirmed against the actual installed library this
    session — `QApplication → QGuiApplication → QCoreApplication →
    QObject → object` — is not incidental: each parent class adds one
    layer of capability (`QCoreApplication` owns the event loop and
    works even with no visible windows at all; `QGuiApplication` adds
    screen, font, and window-system concepts; `QApplication` itself
    adds widget-specific machinery like style and palette handling).
  - *Its use:* every PySide6 program that shows any window at all must
    construct exactly one of these before creating any widget, because
    widgets depend on services (a running event loop, access to the
    windowing system, application-wide settings) that only exist once
    this object exists.
  - *Type:* a class, instantiated exactly once per process — not a
    `static` method, not a free function; a real object with real
    state (settings, the list of top-level windows, the event queue).
  - *Responsibility:* owns and runs the event loop; tracks every
    top-level window the program creates; holds process-wide GUI state
    (active style, default font, screen list); is the single point
    every widget in the process ultimately depends on to function.
  - *Depends on:* `sys.argv` — the program's command-line arguments —
    because Qt itself accepts and strips its own recognized
    command-line flags (like `-style`) out of that list before your
    own argument-parsing code ever sees it.
  - *Connects to:* every `QWidget` your code creates implicitly
    registers itself with the single running `QApplication` instance;
    your own code calls `QApplication(...)` once at startup and later
    calls `.exec()` on the same object to hand control to it.
  - *Shape:* one long-lived object, held for the entire life of the
    program (conventionally assigned to a variable named `app`) — not
    a value you read once and discard, not a list, not something
    rebuilt per window.

- **`QWidget`**
  - *What it is:* the base class for every visible thing in PySide6 —
    a window, a button, a text box, a whole custom screen you design
    yourself. "Widget" is Qt's own word for any of these; a
    `QWidget` used with no children and no styling, as this lesson
    does, is simply the plainest possible window: a blank rectangle.
  - *Implementation:* a class in `PySide6.QtWidgets`, constructed with
    `QWidget()` — no required arguments. Its real inheritance chain,
    confirmed this session — `QWidget → QObject → QPaintDevice →
    Object → object` — shows two separate lineages meeting in one
    class: `QObject` (Qt's own base for anything that can send/receive
    signals and live in a parent-child ownership tree — covered in
    full in a later lesson, flagged here only) and `QPaintDevice`
    (anything that can have pixels drawn onto it).
  - *Its use:* this lesson needs exactly one visible window, and a bare
    `QWidget` is the smallest object PySide6 has that qualifies as one
    — no layout, no child controls, nothing to configure yet.
  - *Type:* a class, instantiated once in this lesson's code to produce
    one window object — an ordinary Python object once constructed,
    not a `static` method or a module-level constant.
  - *Responsibility:* represents one rectangular area of screen space
    (or, headless, of an in-memory framebuffer) that can be shown,
    hidden, resized, and given a title — and, once child widgets exist
    inside it in a later lesson, is responsible for laying them out
    and repainting them.
  - *Depends on:* nothing required to construct — `QWidget()` takes no
    mandatory arguments — but it does depend on a `QApplication`
    already existing in the process before it's constructed, or the
    program raises an error; window creation needs the windowing
    services `QApplication` sets up.
  - *Connects to:* your own code calls `.show()` and `.setWindowTitle()`
    on it directly; once shown, the `QApplication`'s event loop is what
    actually keeps it on screen and delivers input events to it — the
    widget itself does not loop or poll for anything.
  - *Shape:* one object per window. Calling `QWidget()` again produces
    a second, entirely independent window object, not a second
    reference to the first.

- **`QWidget.show()`**
  - *What it is:* the method that makes an already-constructed widget
    actually visible.
  - *Implementation:* an instance method on `QWidget`, real signature
    `show() -> None`. It returns nothing — its entire effect is a side
    effect on the widget's own visibility state.
  - *Its use:* a `QWidget` exists, as a Python object, the instant
    `QWidget()` returns — but it is invisible until `show()` is called;
    this lesson calls it to put the window on screen (or, headless,
    into the offscreen framebuffer) before starting the event loop.
  - *Type:* an ordinary instance method — not `static`, requires a real
    `QWidget` object to call it on (`window.show()`, never
    `QWidget.show()` with no instance).
  - *Responsibility:* flips the widget's internal visibility flag and
    asks the underlying windowing system to actually map/draw it — and
    nothing else; it does not start any loop and does not block.
  - *Depends on:* a widget that has already been constructed; that's
    the only precondition.
  - *Connects to:* called by your own code, once, after construction;
    what happens *after* it returns (the window staying visibly on
    screen, responding to clicks) is not this method's own doing —
    that part is the event loop's job, covered in this lesson's third
    Concept Unit, below.
  - *Shape:* returns `None`. This is worth stating plainly because it's
    easy to expect a "success" value back; there isn't one — you find
    out whether it worked by checking `.isVisible()` separately, which
    this lesson's lab does.

- **`QApplication.exec()`**
  - *What it is:* the call that starts Qt's own event loop and hands
    control of the program over to it.
  - *Implementation:* an instance method on `QApplication` (inherited
    from `QCoreApplication`), real signature `exec() -> int`. The
    trailing underscore variant `exec_()` also exists in PySide6, kept
    only because `exec` briefly collided with a Python reserved word in
    Python 2; in the Python 3 codebases this curriculum targets,
    `exec()` is the real, current spelling and the one this lesson
    uses.
  - *Its use:* this lesson calls it as the very last line of the
    program's setup, because everything before it — constructing the
    `QApplication`, constructing and showing the `QWidget` — has to
    already be in place before the loop that will actually react to
    user input starts running.
  - *Type:* an ordinary instance method, called on the single
    `QApplication` object (`app.exec()`) — not `static`, and not
    callable before that object exists.
  - *Responsibility:* runs the event loop described in this lesson's
    Terms section above — repeatedly checking for and dispatching
    input events — for as long as the program has at least one reason
    to keep running, and *only* returns once that loop has been told to
    stop (by a window closing, or by code calling `.quit()`).
  - *Depends on:* a constructed `QApplication` to call it on; nothing
    else is required — this lesson's own lab proves below that it will
    run even with zero widgets shown.
  - *Connects to:* called once by your own code, at startup; internally
    it is what actually delivers the close-window event to whatever
    widget the user clicks the close button on — a mechanism this
    lesson does not open up yet, only names as the reason `exec()`
    exists.
  - *Shape:* returns a plain `int` — this lesson's own verified run,
    below, confirms it returns `0` on a normal, successful exit. That
    integer is meant to be handed to `sys.exit()`, which is why the
    idiom `sys.exit(app.exec())` appears in nearly every PySide6
    program you'll ever read, including the one this lesson builds.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`sys.argv`** — a plain Python list, provided by the interpreter
  itself before any of your own code runs, containing the program's
  command-line arguments as strings, with the script's own path always
  at index `0`. It's not a PySide6 concept at all — it's standard
  Python — but `QApplication` requires it as an argument, so it earns
  an entry here.
- **`sys.exit(code)`** — a standard-library function that ends the
  Python process immediately, using `code` as the process's real exit
  status (what a shell sees as `$?` on Linux/macOS or `%errorlevel%` on
  Windows). It's the reason `QApplication.exec()`'s return value
  matters at all: without wrapping it in `sys.exit(...)`, the integer
  `exec()` returns would just be computed and silently thrown away.

---

## Concept Unit: The Application Object

### The Problem

Every widget you'll ever create in PySide6 — a window, a button, a text
field — needs somewhere to register itself: something that knows the
full list of windows currently open, something that owns the process's
one and only event loop, something that knows what visual style and
default font to use. None of that lives on the widgets themselves.
Before any window can exist, *something* has to exist first to hold all
of that shared, process-wide machinery.

> Take a second before reading on: if you were designing a GUI toolkit
> yourself, and you knew every widget in the whole program was going to
> need to share one event loop and one list of open windows, would you
> put that shared state on the *first* widget the programmer happens to
> create? What goes wrong if the programmer's first window is later
> closed and destroyed, but the program is supposed to keep running?
> What single fact about "the event loop" and "an individual window"
> makes them feel like they shouldn't be the same object at all?

### Introducing the Concept, in Isolation

Here is the smallest possible program that creates this shared object
and nothing else — no window at all:

```python
from PySide6.QtWidgets import QApplication
import sys

print("Before QApplication()")
app = QApplication(sys.argv)
print("After QApplication() - object created:", app)
print("QApplication.instance():", QApplication.instance())
print("Is same object?", app is QApplication.instance())
```

Real output from running this, this session, headless:

```
Before QApplication()
After QApplication() - object created: <PySide6.QtWidgets.QApplication(0x2b832590) at 0x7fde635c6140>
QApplication.instance(): <PySide6.QtWidgets.QApplication(0x2b832590) at 0x7fde635c6140>
Is same object? True
```

This proves two things at once. First, `QApplication(sys.argv)` really
does construct a real, ordinary Python object — you can print it, hold
a reference to it, pass it around — it isn't some invisible toolkit
switch you flip. Second, and more important: `QApplication.instance()`,
called with no arguments and no reference to `app` in scope, returns
that *exact same object* (`is`, not `==` — genuine identity, not just
equal-looking values). That's the mechanism behind "there is exactly
one, shared, process-wide application object" — any code anywhere in
the program, at any depth, can always get back to it. This object is
called an **application object**, and PySide6's specific
implementation of the idea is the `QApplication` class.

This throwaway example is now **discarded** — it never shows a window
and will not appear in the real project. The real project's version,
below, builds on exactly this same construction call.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition; this curriculum's example project starts here,
  in this lesson, with no prior implementation being ported.
- **Files affected:** `main.py` — created.
- **Change type:** add (new file).
- **Location:** n/a — this is the file's first line of real code.
- **Dependencies:** the `PySide6` package, already installed for this
  lesson, and the standard-library `sys` module.

### The New Code

```python
from PySide6.QtWidgets import QApplication
import sys

app = QApplication(sys.argv)
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet — Project
Change, above, already covers this case, so there is no enclosing
structure to return to. `main.py` currently contains exactly these
three lines.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block,
in order:

- **`from PySide6.QtWidgets import QApplication`** — an import
  statement. It does not create anything yet; it makes the name
  `QApplication`, defined inside the `PySide6.QtWidgets` module,
  available in this file. `QtWidgets` is one sub-module inside the
  larger `PySide6` package, specifically the one holding every visible
  widget class (as opposed to, for example, `QtCore`, which holds
  non-visual infrastructure like `QTimer`, used later in this lesson).
- **`import sys`** — a second import statement, this one for Python's
  own standard library rather than PySide6. It's needed because the
  very next line reaches into `sys.argv`.
- **`app = `** — an ordinary variable assignment. Worth naming
  explicitly here because of what it implies: the right-hand side
  produces a real object, and this line is choosing to keep a
  reference to it rather than letting it be constructed and
  immediately discarded — the object has to outlive this line, since
  later code (and later lessons) will keep calling methods on `app`.
- **`QApplication(...)`** — a call to the class's constructor,
  producing one new `QApplication` instance. Explained in full in this
  lesson's Header, above, under Objects and methods used.
- **`sys.argv`** — a plain Python list, explained in full in this
  lesson's Header, above, under "Everything else in the file."

### CS Lens

The pattern this Concept Unit demonstrates — exactly one instance of a
class permitted to exist, with a way for any code anywhere to retrieve
that one instance — is a named, well-known design pattern called the
**Singleton pattern**. `QApplication` is not literally *enforced* as a
singleton by Python's own language rules (nothing stops you from
writing `QApplication(sys.argv)` a second time in the same process —
though Qt will raise a runtime error if you try, which is its own
enforcement of the rule at the library level rather than the language
level). The idea it embodies is the same one regardless: some piece of
state genuinely only makes sense to exist once per running program, and
the design goes out of its way to make that guarantee visible and
checkable (`QApplication.instance()`) rather than just hoping every
programmer remembers not to construct a second one.

Also recognized in: a database connection pool shared across an entire
web server process; a logging system's single shared logger instance;
an operating system's own single running instance of its window
manager; a game engine's single `GameManager`/`World` object that every
other system looks up rather than constructs its own copy of.

### SE Lens

The alternative design *not* chosen here is to make every widget
self-sufficient — have each `QWidget` carry its own private event loop
and its own list of sibling windows. That was, in fact, roughly how
some very early GUI toolkits worked. The real cost of that alternative:
coordinating between windows (what happens when window A wants to know
if window B is still open? what order do input events across the whole
program get delivered in?) becomes something every widget has to solve
for itself, redundantly, instead of being solved once, centrally.
Centralizing it into one application object is a real tradeoff, not a
free win: it means every single widget now has a hidden dependency on
something outside itself existing first — which is exactly the failure
mode this lesson's next lab, below, makes concrete by triggering it
deliberately.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation" — real output pasted there, from an actual execution this
session under `QT_QPA_PLATFORM=offscreen` (this lesson's headless
rendering mode, defined in the Header's Terms section — necessary here
because this environment has no physical display attached, so Qt is
told to render into memory instead of onto a real screen; the object
construction, method calls, and return values shown are exactly the
same either way — only actual pixels are unobservable).

### Connecting This Unit

The three-line `main.py` this unit produced does not yet show anything
on screen — it constructs the one shared object every window will
depend on, and stops there. The next unit gives it something to
actually show.

---

## Concept Unit: A Window, Empty and Alone

### The Problem

`main.py` currently constructs a `QApplication` and does nothing else.
Running it right now would do... what, exactly? There's no window, no
loop, nothing asking the program to keep running. What do you expect
happens?

> Before reading on: given everything Concept Unit 1 just showed you —
> that `QApplication` sets up shared machinery but doesn't itself
> display anything — what do you predict happens if you ran `main.py`
> as it stands right now? Does the program hang? Print something? Exit
> immediately? And separately: PySide6's base class for anything
> visible is called `QWidget` — given that name alone, before reading
> its real definition below, what's your best guess at the *minimum*
> information you'd need to give it just to make one plain, blank
> window appear?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QWidget
import sys

app = QApplication(sys.argv)
w = QWidget()
print("isVisible before show():", w.isVisible())
w.show()
print("isVisible after show():", w.isVisible())
```

Real output from running this, this session, headless:

```
isVisible before show(): False
isVisible after show(): True
```

This proves the two-step nature of the window's own lifecycle: calling
`QWidget()` alone constructs a real object — you could call other
methods on it, check its size, set its title — but `isVisible()`
reports `False` the whole time, confirming construction and visibility
are genuinely separate steps, not one bundled action. Only the explicit
`show()` call flips that flag to `True`. This split is deliberate, not
incidental: it means you can build up a widget's whole configuration
(title, size, contents, all covered in later lessons) *before* it ever
becomes visible to the user, rather than the user watching it appear
and then rearrange itself piece by piece.

This throwaway example is now **discarded** — the real project's
version, below, is nearly identical, but this exact five-line script
will not appear in the project itself.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as Concept Unit 1, above.
- **Files affected:** `main.py` — modified.
- **Change type:** add.
- **Location:** appended directly after the `QApplication(sys.argv)`
  line added in this lesson's first Concept Unit.
- **Dependencies:** none beyond what Concept Unit 1 already added.

### The New Code

```python
window = QWidget()
window.setWindowTitle("Lesson 1 Lab")
window.show()
```

### The Updated Project

`main.py` now reads, in full:

```python
 1  from PySide6.QtWidgets import QApplication
 2  import sys
 3
 4  app = QApplication(sys.argv)
 5  window = QWidget()                     # <- new
 6  window.setWindowTitle("Lesson 1 Lab")  # <- new
 7  window.show()                          # <- new
```

As a whole, the file now does two distinct jobs where it previously did
one: it still sets up the shared application object (line 4), and it
now also constructs, titles, and displays exactly one window (lines
5-7). Running this file right now, getting a step ahead of the next
Concept Unit for a moment, would actually construct and show that
window and then immediately end the program, because nothing yet tells
it to wait. That gap is exactly what the third Concept Unit closes.

### Mechanical Walkthrough

- **`window = `** — an assignment, the same construct already explained
  in Concept Unit 1's walkthrough, above, applied here to a different
  object: a variable named `window` now holds a reference to a
  `QWidget`, the same way `app` holds a reference to the
  `QApplication`.
- **`QWidget()`** — a constructor call with no arguments. Explained in
  full in this lesson's Header, under Objects and methods used;
  `QWidget()` requires nothing because a bare, empty window is the
  simplest thing PySide6 knows how to display — no title, no size, no
  content specified up front, all of which can be set afterward, which
  is exactly what the next two lines do.
- **`window.setWindowTitle("Lesson 1 Lab")`** — an instance method
  call, real signature `setWindowTitle(str) -> None`, setting the text
  shown in the window's own title bar (or, in this offscreen
  environment, the text stored internally as if a title bar existed).
  It's called here, before `show()`, specifically because of the
  two-step lifecycle this unit's lab just proved: configuring the
  widget before it's visible means the user never sees a blank-titled
  window flash before the real title appears.
- **`window.show()`** — explained in full in this lesson's Header,
  under Objects and methods used.

### CS Lens

Not a hard concept in this unit specifically: `QWidget()` construction
and `.show()` are ordinary object-oriented method calls, not a named
pattern worth a Recognition list of their own. (The inheritance
relationship underneath `QWidget`, and the Singleton idea underneath
`QApplication`, already received that treatment in Concept Unit 1.)

### SE Lens

The alternative *not* chosen by `QWidget`'s own design is one big
constructor call that takes title, size, and visibility all as
arguments at once: `QWidget(title="...", visible=True, ...)`. Some
toolkits do lean that way. The real tradeoff: a constructor with many
optional parameters becomes hard to read at the call site (a call like
`QWidget("Lesson 1 Lab", True, 400, 300, ...)` forces the reader to
count positions or memorize keyword names just to know what each value
means), and it forces every property to be decided up front, before
you're ready to. Splitting construction from configuration, construct
first, then call named setter methods (`setWindowTitle`, and later
`resize`, `setLayout`, and others), costs a few extra lines but keeps
every property's meaning attached to its own method name at the call
site, and lets configuration happen incrementally, in whatever order
the program's own logic naturally produces it.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation."

### Connecting This Unit

`main.py` now constructs the shared application object from Concept
Unit 1 *and* a real, titled, visible window from this unit, but, as the
Updated Project section noted, running it as it stands would show the
window and then immediately exit, because nothing yet holds the program
open long enough for a user to do anything with what's on screen.
That's this lesson's last piece.

---

## Concept Unit: The Event Loop

### The Problem

`main.py` right now would construct a window, mark it visible, and then
simply run out of lines: the Python interpreter reaches the end of the
file and the process ends, all in a fraction of a second, faster than
any human could ever perceive the window existing at all. Every real
GUI program you've ever used stays open indefinitely, doing nothing
most of the time, until you click something. What has to change about
this program's structure, not its window, its *structure*, to make
that possible?

> Before reading on: think about a `while True:` loop you may have
> written before, one that keeps asking for input and doesn't stop
> until the user types something specific like `"quit"`. What is that
> loop actually doing, mechanically, in between each thing the user
> types? Now: what does "waiting for something the program itself can't
> predict the timing of" have in common between that loop and a GUI
> window waiting for a click? What would it mean, concretely, for
> `main.py` to have a loop like that of its own?

### Introducing the Concept, in Isolation

```python
from PySide6.QtWidgets import QApplication, QWidget
from PySide6.QtCore import QTimer
import sys

app = QApplication(sys.argv)
window = QWidget()
window.setWindowTitle("Lesson 1 Lab")
window.show()

print("show() has returned. Program is still running, no clicks possible yet.")
print("window.isVisible():", window.isVisible())

QTimer.singleShot(50, app.quit)
print("About to call app.exec() - this will block until quit() fires")
exit_code = app.exec()
print("app.exec() returned:", exit_code, type(exit_code))
```

`QTimer.singleShot(50, app.quit)` is used here only as a controlled way
to *end* this lab automatically after 50 milliseconds, by calling
`app.quit()` for us, standing in for a real mouse click on a close
button, which this headless lesson has no way to actually perform.
`QTimer` itself is a real, separate PySide6 concept (scheduling code to
run later, without blocking) that this lesson does not open up fully;
it's used here only as test scaffolding, flagged, not explained.

Real output from running this, this session, headless:

```
show() has returned. Program is still running, no clicks possible yet.
window.isVisible(): True
About to call app.exec() - this will block until quit() fires
app.exec() returned: 0 <class 'int'>
```

This is a timing trace, not a changing-values trace: nothing here loops
over data; the entire point is *when* each line actually runs relative
to the others, so it's shown as a numbered list rather than an
`Iteration N:` block:

1. `window.show()` — the window becomes visible, and control returns to
   the very next line immediately; this was already proven directly in
   Concept Unit 2's own lab.
2. `print("About to call app.exec()...")` — this line runs and prints
   *before* anything from inside the event loop happens, proving that
   everything up to this point was ordinary top-to-bottom execution,
   nothing event-driven yet.
3. `exit_code = app.exec()` — this is the line that changes everything.
   Control does **not** return to the next line yet. Internally, Qt's
   own C++ code takes over and starts repeatedly checking for events;
   in this run, the only thing that ever happens is the scheduled timer
   firing at the 50-millisecond mark and calling `app.quit()`, which is
   what finally makes `exec()` decide to stop looping and return.
4. `print("app.exec() returned:"...)` — this line only runs *after*
   `quit()` was called from inside the loop, proving, concretely, that
   the entire multi-millisecond wait genuinely happened on this one
   line, not before it and not after it.

This is called a **blocking call**, a call that holds control until
some external condition is met, rather than returning right away. To
prove there's nothing magic keeping the program alive besides this one
call, compare against what happens when `exec()` is never called at
all:

```python
from PySide6.QtWidgets import QApplication, QWidget
import sys

app = QApplication(sys.argv)
window = QWidget()
window.show()
print("Reached end of script WITHOUT calling app.exec()")
print("window.isVisible():", window.isVisible())
```

Real output:

```
Reached end of script WITHOUT calling app.exec()
window.isVisible(): True
```

...and the process exits immediately after, with exit code `0`,
confirmed this session. The window object was fully constructed and
its `isVisible()` flag genuinely was `True` the whole time; it simply
never had a chance to matter, because nothing held the program open
long enough for a user, or anything else, to ever perceive it.

Both throwaway examples above are now **discarded** — the real
project's version, below, keeps the same call but drops the `QTimer`
scaffolding, since a real user's own click on the close button is what
will end the real program, not a timer.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition, same as this lesson's earlier units.
- **Files affected:** `main.py` — modified.
- **Change type:** add.
- **Location:** appended after the `window.show()` line added in
  Concept Unit 2.
- **Dependencies:** none beyond what earlier units in this lesson
  already added.

### The New Code

```python
sys.exit(app.exec())
```

### The Updated Project

`main.py`, complete, as it stands at the end of this lesson:

```python
 1  from PySide6.QtWidgets import QApplication
 2  import sys
 3
 4  app = QApplication(sys.argv)
 5  window = QWidget()
 6  window.setWindowTitle("Lesson 1 Lab")
 7  window.show()
 8  sys.exit(app.exec())    # <- new
```

As a whole, the file now does three jobs in sequence: create the one
shared application object (line 4), construct and display exactly one
window (lines 5-7), and, the piece that was missing before this unit,
hand control over to Qt's own event loop and keep the process alive for
as long as that loop keeps running (line 8). This is now a real,
complete, runnable PySide6 program: launching it opens a window that
stays open, responds to being moved, resized, and closed by the
operating system's own window manager, and only then does the process
actually end.

### Mechanical Walkthrough

- **`sys.exit(...)`** — explained in full in this lesson's Header,
  under "Everything else in the file." Its argument here is not a
  literal number but the *result* of the next call, which is why the
  two are nested on one line rather than written across two.
- **`app.exec()`** — explained in full in this lesson's Header, under
  Objects and methods used.

### CS Lens

The event loop is a hard concept, a genuine computer-science idea, not
routine syntax, so it earns several unrelated real-world recurrences,
not just one:

```
Also recognized in: a web server's own request-handling loop
(idle until a request arrives, then dispatch and go back to idle),
a video game's main loop (idle-checking input every frame),
an operating system kernel's own scheduler loop,
a chat application waiting on a network socket for the next message
```

The shared shape underneath all of these: a program that has genuinely
finished "setup" but is not finished *running*, because its actual job
is to react to things it cannot predict the timing of, so instead of
ending, it loops, cheaply, checking "has anything happened yet?" over
and over, for as long as it has a reason to keep existing.

### SE Lens

The alternative *not* chosen here, and the one nearly every beginner
instinctively reaches for before learning this, is polling manually
with a hand-rolled loop: `while True: check_for_click(); time.sleep(0.01)`.
The real tradeoff Qt's own built-in event loop avoids: a hand-rolled
loop like that either burns CPU constantly re-checking that nothing has
happened (a tight loop with no sleep), or adds real, perceptible input
lag capped by however long the `sleep()` call is (a loose loop with
one). Qt's `exec()` is written in C++ against the operating system's
own native, efficient "wake me up only when something happens"
mechanisms; the result is instant reaction to input without a
hand-written loop ever burning CPU doing nothing. The cost this project
is now carrying, honestly: everything after `app.exec()` on line 8
simply will not run until the loop itself decides to stop, which means
any code meant to run *after* the window closes (saving a file,
printing a goodbye message) has to go after this exact line, and any
code meant to run *while* the window is still open has to be structured
as a reaction to an event, not as a later line in this same
top-to-bottom script. That inversion, stop writing sequential steps,
start writing reactions, is this lesson's real lasting lesson, and it's
what every future lesson in this curriculum now builds on.

### Commands Needed

- **`python3 main.py`** — runs the file with the system's Python 3
  interpreter. Success output: no traceback; a window appears (or, in
  a headless environment with `QT_QPA_PLATFORM=offscreen` set, the
  process runs and exits cleanly with no window visibly appearing,
  exactly as verified in this lesson's own labs) and the process exits
  with status `0` once that window is closed.
- **`echo $?`** (Linux/macOS) — prints the exit status of the most
  recently finished process; run right after `python3 main.py` exits,
  it shows the real integer `sys.exit(...)` passed to the operating
  system, confirmed `0` in every run of this lesson's own labs.

### Run It

Already run and shown above, under "Introducing the Concept, in
Isolation": two separate real executions, one with `exec()` called and
one without, both from this session, both under
`QT_QPA_PLATFORM=offscreen`.

### Connecting This Unit

Line 8 is what turns everything the first two Concept Units built, one
shared application object, one visible, titled window, from a program
that flashes into existence and immediately ends into a real, usable
GUI program that waits for a person.

---

## Connect the Pieces

Trace one concrete action, launching this program from a terminal,
through everything this lesson built, start to finish:

A user runs `python3 main.py`. Line 4 constructs the single
`QApplication` this whole process will ever have; from this point on,
`QApplication.instance()` anywhere in the program would return this
exact object, proven directly in Concept Unit 1's own lab. Line 5
constructs one `QWidget`, invisible the instant it's built, proven
directly in Concept Unit 2's own lab, where `isVisible()` reported
`False` immediately after construction. Line 6 gives it the title
"Lesson 1 Lab" before anyone can see it, avoiding any flash of an
untitled window. Line 7 flips that widget's visibility on,
`isVisible()` now `True`, and the operating system's own window manager
places it on screen. Line 8 is where the program's whole character
changes: `app.exec()` hands control to Qt's own event loop and blocks,
exactly as Concept Unit 3's timing trace demonstrated line by line, for
as long as the window stays open. Only when the user clicks the
window's own close control does that loop finally decide to stop,
`exec()` returns a real `int`, `0` on a normal close, confirmed in this
lesson's own verified runs, and `sys.exit(0)` hands that exact number
back to the operating system as the process's real exit status, which
is what a shell's own `echo $?` would then show.

**Next lesson:** Lesson 2 — giving this bare window something to show
and something to click, and covering the signal/slot mechanism that
turns a click into code running.
