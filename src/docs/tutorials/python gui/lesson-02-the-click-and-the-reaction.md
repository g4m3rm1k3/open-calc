# Lesson 2: The Click and the Reaction Are Two Different Pieces of Code

**What you will build:** a button added to Lesson 1's window that,
when clicked, changes the label's text from "Hello, CustomTkinter" to
"Button was clicked!" The transferable problem this lesson is actually
about: this is the exact moment, in the smallest possible example,
where "the button" and "the thing that happens when it's clicked"
become two separate pieces of code instead of one. In your real
hacked-together app, this is very likely the seam that's missing — if
a button's callback directly parses a file, builds an object, *and*
updates three widgets all in one function body, you've got the same
problem this lesson isolates, just with more steps crammed into it.

**What you need to know first:** Lesson 1 — specifically, the `CTk`
root window object, the event loop started by `.mainloop()`, the
widget tree (a widget's `master` argument), and the `.pack()` geometry
manager. This lesson builds directly on top of Lesson 1's finished
four-line file.

**Terms used in this lesson**

- **keyword argument** — a function or constructor argument passed as
  `name=value` instead of by position. This exists because GUI
  constructors commonly take many optional settings, and keyword
  arguments let you supply only the ones you care about, by name,
  regardless of their position in the real parameter list. (Reappearing
  from Lesson 1, where it first covered `text=`; this lesson's code
  adds a second one, `command=`, so the concept is restated here in
  full rather than assumed.)
- **first-class function** — a function that can be treated as an
  ordinary value: stored in a variable, passed as an argument to
  another function, or returned from one — not just called directly by
  its own name. This exists because Python draws no hard line between
  "code" and "data" the way some older languages do; a function is a
  real object at runtime, and anything you can do with an object
  (assign it, pass it around) you can do with a function too. This is
  what makes it possible to hand a widget a function to run later,
  rather than being forced to write out what should happen inline at
  the moment the widget is built.
- **callback** — a first-class function you hand to some other piece
  of code — here, a button — to be called back later, at a time you
  don't control, in reaction to something happening. This exists
  because the button itself has no idea what a click should *mean* in
  your specific program; it only knows how to detect that a click
  happened. Keeping "detect the click" (the button's job) and "decide
  what a click means" (your callback's job) as two separate pieces of
  code is what let CustomTkinter write a fully generic `CTkButton`
  class that has no idea your program even has a label in it.
- **mutation (in-place state change)** — changing data that already
  exists, inside an object that already exists, rather than creating a
  brand-new object to hold the new data. This exists because a widget
  that's already on screen, already connected into the widget tree,
  already placed by a geometry manager, would be expensive and clumsy
  to throw away and rebuild from scratch just to change one thing about
  it — mutation lets you change what it displays while it stays the
  exact same object, in the exact same place in the widget tree, with
  the exact same screen position.

**Objects and methods used**

- **`ctk.CTkButton`**
  - *What it is:* a clickable widget — CustomTkinter's restyled
    equivalent of a standard push-button, drawn with rounded corners
    and a hover effect.
  - *Implementation:* found in
    `customtkinter/windows/widgets/ctk_button.py`, declared as
    `class CTkButton(CTkBaseClass)`. Its real constructor, read from the
    installed package this session, opens
    `def __init__(self, master: Any, width: int = 140, height: int = 28, ..., text: str = "CTkButton", ..., command: Union[Callable[[], Any], None] = None, ...)`
    — dozens of styling parameters exist (colors, fonts, corner radius,
    hover behavior) and every one of them defaults to something
    sensible; this lesson's code only ever sets three: `master`
    (positionally), `text`, and `command`.
  - *Its use:* this lesson's code constructs one with
    `ctk.CTkButton(app, text="Click me", command=on_click)` — the
    smallest call that produces a real, clickable, correctly-labeled
    button wired to a real function.
  - *Type:* a class; the call above constructs a real instance of it.
  - *Responsibility:* to draw itself as a clickable button, to detect
    a real mouse click on itself (internally, by binding to the
    `<ButtonRelease-1>` event on its own canvas — a detail of *how* it
    detects a click, not something this lesson's own code has to
    manage), and, when a click is detected, to call whatever function
    was supplied as `command`, with no arguments.
  - *Depends on:* a `master` to belong to (exactly like `CTkLabel` in
    Lesson 1), and, for this lesson's purposes specifically, a
    real, already-defined function to accept as `command` — the button
    is functional without one (a button with no `command` just doesn't
    do anything when clicked), but this lesson's whole point requires
    supplying one.
  - *Connects to:* it's built from `app` (its `master`, the same root
    window Lesson 1 built); Concept Unit 1's `on_click` function is
    handed to it as `command`; when a real click happens, control flows
    *out* of the button and *into* that function — the button itself
    never touches the label directly.
  - *Shape:* this is the first widget in this curriculum that
    initiates action rather than only displaying something — `CTkLabel`
    is passive (it shows what it's told to); `CTkButton` is the seam
    where user interaction first enters the program.

- **`CTkLabel.configure`**
  - *What it is:* the method used to change an already-existing
    widget's settings after it was built, without destroying and
    recreating it.
  - *Implementation:* found in
    `customtkinter/windows/widgets/ctk_label.py`, declared
    `def configure(self, require_redraw=False, **kwargs)`. Its real
    body, read from the installed package this session, handles each
    possible setting individually — the exact branch this lesson's code
    triggers is
    `if "text" in kwargs: self._text = kwargs.pop("text"); self._label.configure(text=self._text)`
    — meaning `label.configure(text="...")` updates the label's own
    internal `_text` attribute *and* pushes the same new value down into
    the real underlying Tkinter label object it wraps, so both stay in
    sync.
  - *Its use:* `on_click`, in Concept Unit 3, calls
    `label.configure(text="Button was clicked!")` — this is the one
    line in the whole lesson that actually changes what the user sees.
  - *Type:* an instance method, called on the specific `label` object
    Lesson 1 already built — not a free function, and not something you
    call on the button or the app.
  - *Responsibility:* to accept any subset of a widget's settings, by
    keyword, and apply each one — updating the widget's own stored
    state and, where the setting affects appearance, triggering a
    redraw so the change is actually visible the next time the event
    loop repaints the window.
  - *Depends on:* a widget that already exists — you cannot configure
    something that hasn't been constructed yet; this lesson's code
    depends on `label` from Lesson 1 still being in scope when
    `on_click` runs.
  - *Connects to:* it's called from inside `on_click`, which is called
    by `CTkButton`'s own click-handling code (above), which only runs
    because the event loop (Lesson 1) is watching for the click in the
    first place — three separate pieces this lesson's code chains
    together, none of which know about the other two's internals.
  - *Shape:* this is the actual point of contact between "something
    happened" (a click) and "the screen changed" — everything else in
    this lesson exists to get execution to this one line.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`ctk.CTk`**
  - *What it is:* the root application window class — see Lesson 1 for
    its full role; it appears again here unchanged.
  - *Implementation:* `class CTk(CTK_PARENT_CLASS, CTkAppearanceModeBaseClass, CTkScalingBaseClass)`
    where `CTK_PARENT_CLASS = tkinter.Tk`; constructed with
    `def __init__(self, fg_color: ... = None, **kwargs)`, every argument
    optional.
  - *Its use:* still the single object every widget in this file —
    including this lesson's new button — is ultimately built from.
  - *Type:* a class; `ctk.CTk()` constructs a real instance.
  - *Responsibility:* owns the actual OS-level window, the root of the
    widget tree, and the event loop the whole program runs inside.
  - *Depends on:* nothing — every constructor argument is optional.
  - *Connects to:* this lesson's new `CTkButton` is built with `app` as
    its `master`, exactly the same way Lesson 1's `CTkLabel` was.
  - *Shape:* unchanged from Lesson 1 — still the outermost object in
    the whole program.

- **`CTk.mainloop`**
  - *What it is:* the method that starts the event loop and blocks
    until the window closes — see Lesson 1 for the full explanation.
  - *Implementation:* inherited from `tkinter.Misc`; real body
    `self.tk.mainloop(n)`.
  - *Its use:* still called exactly once, still the last line of the
    file — and now, for the first time, the thing it's "waiting" for
    while blocked includes a real click on this lesson's new button.
  - *Type:* an instance method, called with zero arguments.
  - *Responsibility:* repeatedly check for anything that's happened to
    any owned widget, and dispatch to whatever was registered to handle
    it — this lesson's `on_click` is the first such registered handler
    this curriculum has actually used.
  - *Depends on:* a real, already-built root window.
  - *Connects to:* it's what actually calls `CTkButton`'s own internal
    click-handling code, which is what calls `on_click`.
  - *Shape:* unchanged from Lesson 1 — the same event-loop boundary,
    now doing real work for the first time.

- **`ctk.CTkLabel`**
  - *What it is:* the text-display widget from Lesson 1.
  - *Implementation:* `class CTkLabel(CTkBaseClass)`, constructed with
    `master` as the required first parameter.
  - *Its use:* unchanged from Lesson 1 — still built once, near the top
    of the file; this lesson never rebuilds it, only mutates it (via
    `.configure()`, above) after the fact.
  - *Type:* a class; already constructed, unchanged, in this lesson's
    file.
  - *Responsibility:* hold and display one piece of text.
  - *Depends on:* a `master` — still `app`.
  - *Connects to:* this lesson adds a new connection to it —
    `on_click` (Concept Unit 3) now reaches into it via `.configure()`,
    something Lesson 1 never did.
  - *Shape:* unchanged as a leaf widget in the tree, but no longer
    untouched after construction — it's now a target other code
    reaches back into.

- **`Widget.pack`** *(the pack geometry manager, reappearing — now used
  on two different widgets)*
  - *What it is:* the geometry manager from Lesson 1, responsible for
    deciding a widget's actual on-screen position.
  - *Implementation:* inherited by every CustomTkinter widget from
    Tkinter's `Pack` mixin; real body ends in
    `self.tk.call(('pack', 'configure', self._w) + self._options(cnf, kw))`.
  - *Its use:* this lesson calls it a second time —
    `button.pack(pady=10)` — on the new button, exactly the same way
    Lesson 1 called `label.pack(pady=20)` on the label. Calling it
    again, on a second widget, is what stacks the button *below* the
    label rather than on top of it — pack's default behavior, with no
    other arguments telling it otherwise, is to place each newly-packed
    widget after the ones already packed into the same parent.
  - *Type:* an instance method, called separately on each widget that
    needs a position — there is no single call that positions every
    widget in a window at once.
  - *Responsibility:* register a specific widget with its parent's
    layout system and compute its real screen position, via the
    underlying Tcl/Tk runtime.
  - *Depends on:* a widget that already exists and already has a
    parent.
  - *Connects to:* called once per widget — once on `label` (Lesson 1,
    unchanged), and now a second time on `button` (this lesson).
  - *Shape:* unchanged — still the seam between "an object exists" and
    "a user can see it," now doing that job for a second widget.

---

## Concept Unit: Functions as Values — Defining a Callback

### The Problem

Lesson 1's window can now sit open, running its event loop, indefinitely
— but nothing has ever happened *in response to* anything, because
nothing in that lesson's code ever reacted to an event. You're about to
add a button. Before you can tell the button what to do when it's
clicked, you need something to actually hand it — and "something to
hand it" is not a value like `5` or `"hello"`; it has to be an action.

> **Stop and think before reading on:** in general Python, you already
> know `def some_name(): ...` creates a function. If you write
> `def on_click(): print("clicked")` and then, on the very next line,
> just write `on_click` by itself with no parentheses — no call — what
> do you think happens? Does anything print? What do you think Python
> considers `on_click`, without the parentheses, actually *to be*?

### The New Code

```python
def on_click():
    print("Button was clicked!")
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
 8  def on_click():
 9      print("Button was clicked!")
10
11  app.mainloop()
```

The file now defines a function between building the label (lines 5–6,
unchanged from Lesson 1) and starting the event loop (line 11). As
written, this function is never actually called by anything yet — it
sits there, fully defined and ready, but inert. Reading the file
top to bottom, `on_click`'s body genuinely does not run — proving that
is exactly this unit's own lab, below.

### Isolating It

```python
def on_click():
    print("on_click() body actually running")

print("Line A: on_click was just defined -- did its body run yet?")

reference = on_click
print("Line B: assigned on_click to `reference`, no parentheses -- did its body run yet?")
print("type(reference):", type(reference))

print("Line C: about to call reference() explicitly")
reference()
print("Line D: after the explicit call")
```

Real output, from an actual run this session:

```
Line A: on_click was just defined -- did its body run yet?
Line B: assigned on_click to `reference`, no parentheses -- did its body run yet?
type(reference): <class 'function'>
Line C: about to call reference() explicitly
on_click() body actually running
Line D: after the explicit call
```

This is called a **first-class function**, named in full in the
Header's Terms, above. What this output proves: `on_click`'s body —
the line that would print `"on_click() body actually running"` — does
not run at Line A, when the function is defined, and it still hasn't
run by Line B, even after assigning `on_click` (with no parentheses) to
a second name, `reference`. `type(reference)` confirms `reference` is a
real object of type `function` — the same kind of "it's a real object"
proof Lesson 1 gave `ctk.CTk()` — not a special kind of statement or a
piece of syntax. The body only runs at Line C, when `reference` is
finally *called*, with parentheses — proven by the printed proof line
landing between Line C's print and Line D's. This is exactly the
distinction `ctk.CTkButton`'s `command=on_click` (next unit) depends
on: passing `on_click` — no parentheses — hands the button the function
itself, to call whenever *it* decides a click happened; writing
`on_click()` — with parentheses — would instead call it immediately,
once, while the file is still being read top to bottom, long before any
button exists to click.

This throwaway example is now discarded. What stays in the real project
is only the two lines shown in The New Code, above — this lab's
`reference =` line and its prints existed only to make the
"defined ≠ called" distinction visible once.

### Mechanical Walkthrough

1. `def on_click():` — a function definition with no parameters. This
   specific detail — zero parameters — is not incidental: the next
   unit's `command=on_click` wiring will call this function with no
   arguments, whatever it happens to be, so the function has to be
   written to expect none.
2. `print("Button was clicked!")` — a call to Python's built-in
   `print`, already assumed as ordinary Python per this curriculum's
   own prerequisite (Header, above); indented one level, making it the
   function's entire body — the only line that runs when, and only
   when, `on_click` is actually called.

### CS Lens

This is the language feature called **first-class functions** —
treating functions as ordinary values, not a special category of
syntax. The specific *use* this unit sets up — handing a first-class
function to another piece of code, to be run later, in reaction to
something — is the **callback pattern**, named in full in the Header's
Terms, above.

```
Also recognized in: a website's addEventListener in JavaScript, a
setTimeout/timer firing later in nearly any language, a sort
function's "key" argument, an SQL trigger, a Unix signal handler
```

### SE Lens

The design principle here is **inversion of control**, viewed from the
caller's side this time (Lesson 1 introduced the same principle from
the library's side, for `.mainloop()` itself): instead of `on_click`
being called directly, by name, from your own top-to-bottom code — the
normal way a function gets used — you're handing it to something else
(the button, next unit) and letting *that* decide when to call it. The
alternative — not using a callback at all, and instead writing one
giant sequence of "wait for a click, then do the thing" checked in a
loop you control yourself — is exactly the kind of manual polling
Lesson 1's SE Lens already described as the thing event-driven
libraries exist to avoid. The cost of the callback style: reading
`on_click`'s definition alone doesn't tell you *when* it runs — that
information lives somewhere else entirely (the next unit's
`command=on_click`), which is a real, permanent readability tradeoff
every event-driven GUI program makes.

### Commands Needed

None new.

### Run It

Already shown above, under Isolating It. As part of the real project
file itself, this function cannot run standalone yet — nothing calls
it — the next unit is what connects it to a real, clickable trigger.

### Connecting to What Came Before

Lesson 1 built a window that could sit open and wait, but nothing was
ever registered for it to react to; this unit writes the first piece of
"what should happen," but deliberately stops short of wiring it to
anything yet — that's the next unit's entire job.

---

## Concept Unit: Wiring a Real Click — `ctk.CTkButton` and `command=`

### The Problem

`on_click` now exists as a real, callable function, sitting unused. You
need an actual, clickable widget on screen, and you need to tell it,
specifically, which function to call when a real click happens.

> **Stop and think before reading on:** you've now built two widgets
> that take a `master` argument — Lesson 1's `CTkLabel`, and, in a
> moment, a button. Given what you already know about keyword arguments
> from Lesson 1's `text=`, what do you think the actual argument name
> is that a button uses to accept "the function to call when clicked"?
> Would you expect it to be called something generic like `action=` or
> `on_click=`, or would a specific, memorable name make more sense for
> a whole library's worth of clickable widgets to agree on?

### The New Code

```python
button = ctk.CTkButton(app, text="Click me", command=on_click)
button.pack(pady=10)
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
 8  def on_click():
 9      print("Button was clicked!")
10
11  button = ctk.CTkButton(app, text="Click me", command=on_click)
12  button.pack(pady=10)
13
14  app.mainloop()
```

The file now builds a second real widget (lines 11–12, new) after
`on_click` is defined (lines 8–9, unchanged from the unit above) and
before the event loop starts (line 14, unchanged from Lesson 1 in
content, moved down only because new lines were inserted above it).
Run exactly as shown, this already produces a real, clickable button —
this unit's own lab, below, proves a real click genuinely reaches
`on_click`, even though this exact version of `on_click` still only
prints, rather than touching the label yet.

### Isolating It

```python
import customtkinter as ctk

app = ctk.CTk()
app.geometry("300x150")

clicks = []

def on_click():
    clicks.append(1)
    print("on_click() ran -- clicks so far:", len(clicks))

button = ctk.CTkButton(app, text="Click me", command=on_click)
button.pack(pady=20)

print("Button built. clicks so far:", len(clicks))
```

(`clicks = []`, growing by one each time `on_click` runs, is scaffolding
—- a plain Python list used here only so the lab can prove, by its
final length, exactly how many times the callback actually ran; it's
not part of what this unit teaches and won't appear in the real
project.) The full lab, run under a virtual display this session, also
calls `button.invoke()` — a real Tkinter method that simulates an
actual mouse click, used here only because this sandboxed environment
has no physical mouse to click with for real; on your own machine, a
real click does the identical thing `invoke()` does here.

Real output, from an actual run under a virtual display this session:

```
Button built. clicks so far: 0
Simulating a real click via button.invoke()...
on_click() ran -- clicks so far: 1
clicks after invoke(): 1
```

A real screenshot taken just before the simulated click shows a real,
rendered "Click me" button, styled with rounded corners and a blue
fill — proof `CTkButton` renders as a real, distinct widget, not just an
object in memory.

This is called **event binding** — connecting a specific, named event
(here, a button click) to a specific callback function, so the library
knows what to call when that event occurs. What this output proves:
`clicks` is `0` immediately after the button is built — confirming,
the same way Lesson 1's Concept Unit 3 proved a label with no `.pack()`
call is invisible, that simply *building* a button wired to a callback
does not run that callback; something has to actually trigger a click
first. Only after the simulated click does `clicks` become `1`, and the
`print` inside `on_click` itself confirms it ran — proof that a real
click genuinely reaches all the way from the button, through
CustomTkinter's own internal event-handling code, into this specific
Python function this lesson's own code wrote.

This throwaway example is now discarded — the `clicks` list and its
prints existed only to make an otherwise invisible fact (did the
callback actually run?) countable and visible. What stays in the real
project is only the two lines shown in The New Code, above.

### Mechanical Walkthrough

1. `ctk.CTkButton` — an attribute access into the `ctk` module's
   namespace, the same kind of access as `ctk.CTk` and `ctk.CTkLabel`
   in Lesson 1, this time finding the class object named `CTkButton`.
2. `(app, text="Click me", command=on_click)` — a function call with
   three arguments. `app` is a **positional argument**, filling
   `CTkButton.__init__`'s first parameter, `master` — the identical
   role `app` played for `CTkLabel` in Lesson 1: this button, too, is
   now a child of the root window in the widget tree (Lesson 1's
   Terms). `text="Click me"` is a **keyword argument** (Terms, above)
   — the same mechanism as `CTkLabel`'s `text=` in Lesson 1, here
   setting the text drawn on the button itself, not a separate label.
   `command=on_click` is also a **keyword argument**, and it's this
   unit's actual new concept: `on_click`, referenced with no
   parentheses, is passed as a **first-class function** (previous
   unit's Terms) — a real, callable object, not the result of calling
   it — so that `CTkButton` can call it itself, later, exactly once
   per real click, as a **callback** (previous unit's Terms).
3. `button = ...` — an assignment, giving you a name to refer to the
   already-constructed button by, the identical mechanism covered in
   Lesson 1's first unit.
4. `button.pack(pady=10)` — an instance method call on the newly-built
   `button`, using the **pack geometry manager** (fully explained in
   the Header's Objects and methods section, above, since it reappears
   unchanged from Lesson 1) with `pady=10` as a keyword argument
   setting 10 pixels of vertical padding — slightly less than the
   label's own `pady=20`, which is a stylistic choice, not a
   requirement.

### CS Lens

Registering a callback with a specific object, to be invoked when that
object detects a specific event, is a concrete implementation of the
**Observer pattern** — an object (the "subject," here the button)
maintains a reference to one or more pieces of code (the "observers")
and notifies them when its own state changes, without needing to know
anything about what those observers actually do.

```
Also recognized in: a spreadsheet cell recalculating every formula that
references it, a stock ticker pushing price updates to every subscribed
display, a filesystem watcher calling your code when a file changes, a
publish/subscribe message queue, React's own event handler props
```

### SE Lens

The design principle at work is **decoupling through indirection**:
`CTkButton` never contains a single line of code that knows what
"Click me" is supposed to *do* — it only knows how to detect a click and
call whatever function it was handed. The alternative CustomTkinter
didn't choose is a button class hard-coded to do one specific thing
(update a label, say) — which would make `CTkButton` far less reusable:
every different button in every different program would need its own
custom button *class*, rather than the same generic class configured
with a different `command=` each time. The cost of this decoupling is
indirection itself: to find out what happens when this specific button
is clicked, you have to go read `on_click`'s own definition separately
— the button's own line of code doesn't tell you the answer by itself,
only where to look for it.

### Commands Needed

None new — same installed library and virtual display as Lesson 1.

### Run It

Real output, from an actual run under a virtual display this session,
already shown in full above under Isolating It.

### Connecting to What Came Before

The previous unit proved `on_click` is a real, callable value, sitting
unused; this unit is what actually connects it to something that will
call it — proven for real, above, with a simulated click that reached
all the way into the function's own body.

---

## Concept Unit: Reaching Back Into the Label — `.configure()`

### The Problem

The button now genuinely calls `on_click` on every real click — this
unit's own lab, above, proved that with a counter. But `on_click`
currently only prints to a console the end user of a real GUI app will
probably never see. The actual goal — the label's text changing, on
screen, in response to the click — still hasn't happened.

> **Stop and think before reading on:** Lesson 1 built `label` by
> calling `ctk.CTkLabel(app, text="Hello, CustomTkinter")` exactly once.
> If you wanted the same label, the same object, still in the same spot
> in the window, to show different text later — would you build a
> *second* label and somehow swap it in for the first one? Or is there
> likely a method on the label itself for changing a setting it was
> already given, without rebuilding it? What would you look for on an
> object if you wanted to change something about it after it already
> exists?

### The New Code

```python
def on_click():
    label.configure(text="Button was clicked!")
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
 8  def on_click():
 9      label.configure(text="Button was clicked!")
10
11  button = ctk.CTkButton(app, text="Click me", command=on_click)
12  button.pack(pady=10)
13
14  app.mainloop()
```

This is a **replace**, not an addition: line 9 — the entire body of
`on_click`, defined in Concept Unit 1, above — is replaced. Everything
else in the file, including the button's own construction (lines
11–12), stays exactly as the previous unit left it; the button doesn't
need to change at all, because it never cared what `on_click` actually
did — only that it's a callable function, which it still is.

This is the complete file this lesson builds toward.

### Isolating It

```python
import customtkinter as ctk

app = ctk.CTk()
app.geometry("300x150")

label = ctk.CTkLabel(app, text="Hello, CustomTkinter")
label.pack(pady=20)

print("label's text before configure():", label.cget("text"))

def do_configure():
    label.configure(text="Button was clicked!")
    print("label's text after configure():", label.cget("text"))
```

(`label.cget("text")` — a real Tkinter method, "get config" — reads
back a widget's current value for one named setting; it's used here
only to print proof of the change and isn't part of what this unit
teaches or what the finished project needs, since the finished project
only ever needs to *set* the text, never read it back.)

Real output, from an actual run under a virtual display this session
(the real lab also scheduled `do_configure` to run automatically and
took a screenshot before and after, shown below):

```
label's text before configure(): Hello, CustomTkinter
label's text after configure(): Button was clicked!
```

Before:

The label reads "Hello, CustomTkinter", identical to Lesson 1's own
finished screenshot.

After:

The exact same label — same position, same padding, same widget object
— now reads "Button was clicked!" in its place.

This is called **mutation**, named in full in the Header's Terms,
above. What this output — and the two screenshots — prove together:
`label.cget("text")` returns the original string before `.configure()`
runs, and the new string after — confirming the change happened to
this specific object's own stored state, not by creating a second,
different label. The screenshots confirm the same fact visually: the
label's position on screen (still padded 20 pixels from the top) never
moved, because `.configure()` never touched the geometry manager at
all — only the text setting was ever mutated.

This throwaway example is now discarded — `cget`, its prints, and the
`do_configure` scheduling all existed only to prove the change happened
and to show it visually. What stays in the real project is only the
one line shown in The New Code, above, inside `on_click`'s real body.

### Mechanical Walkthrough

1. `label.configure(text="Button was clicked!")` — an instance method
   call on `label`, the same object Lesson 1 built and this lesson has
   left untouched until now. `text="Button was clicked!"` is a
   **keyword argument** (Terms, above) — the identical mechanism used
   to set the label's *original* text back in Lesson 1's construction
   call, now used to *change* it instead. `configure`'s real body,
   quoted in full in the Header's Objects and methods section above,
   confirms this single call updates both the label's own internal
   `_text` attribute and the real underlying Tkinter widget it wraps —
   this is the concept named **mutation** in the Header's Terms, above:
   the same `label` object, same identity, same position in the widget
   tree, with different internal content than it had a moment ago.

### CS Lens

Changing an object's own internal state after it was constructed,
rather than constructing a new object to replace it, is the general
idea of **mutable state** — an object whose data can change over its
lifetime, as opposed to an *immutable* object (like a Python string
itself, which can never be changed in place — every "modified" string
is actually a brand-new one).

```
Also recognized in: a spreadsheet cell's value changing without the
cell itself being replaced, a game character's health bar dropping
without the character object being rebuilt, a thermostat's displayed
temperature updating, a bank account's balance changing after a
withdrawal, a video's progress bar advancing as it plays
```

### SE Lens

The tradeoff here is **mutable objects vs. rebuild-and-replace**: this
lesson's code mutates the one, already-existing `label` in place, which
is both the simpler and the cheaper option for a single widget — no
need to remove the old one from the widget tree, rebuild a new one from
scratch, and re-pack it in exactly the same spot. The real cost of
mutable state, which doesn't show up yet in a program this small, is
that it becomes harder to reason about *where* a given object's state
gets changed from once more than one place in a larger program can
call `.configure()` on the same widget — a debugging question ("who
changed this label's text, and when?") that a purely rebuild-based
design would never raise, because every version of the label would be
a distinct, individually traceable object. This is a real cost your
own real app is likely already paying, at a larger scale, if several
different buttons or callbacks all reach into the same widgets.

### Commands Needed

None new.

### Run It

Real output, from an actual run of the complete file shown in this
unit's Updated Project, under a virtual display this session — the
button was clicked via a real, simulated `button.invoke()` call, and a
screenshot was taken both before and after:

```
mainloop exited -- window closed
```

Before the click, the window shows the label reading
"Hello, CustomTkinter" above the "Click me" button. After the
simulated click, the exact same window shows the label now reading
"Button was clicked!" — the button itself unchanged, still labeled
"Click me," proving only the label's state was mutated, exactly as this
unit's own code says it should be.

### Connecting to What Came Before

The previous unit proved a real click genuinely reaches `on_click`;
this unit is what finally makes that arrival mean something a user can
see — replacing a `print` statement nobody using the real app would
ever see with a real, visible change to the exact label Lesson 1 built.

---

## Connect the Pieces

Follow one single action — a real mouse click on the button — through
every unit this lesson built, start to finish:

Before any click happens, `on_click` already exists as a complete,
callable function (Concept Unit 1) — but, per that unit's own lab, its
body has never once executed; it's a real object sitting inert, the
same way Lesson 1's very first `ctk.CTk()` sat inert before
`.mainloop()` was ever called. `ctk.CTkButton(app, text="Click me",
command=on_click)` (Concept Unit 2) hands that same, still-unexecuted
function to the button — not a copy, not a description of it, the
actual function object itself — and `button.pack(pady=10)` makes the
button visible, using the identical geometry manager Lesson 1 used for
the label. Once a real click happens, `CTkButton`'s own internal code
(never written by you, and never shown in this lesson, because it's not
this lesson's subject) detects it and calls `on_click` — with no
arguments, exactly as it was defined. Only then does execution reach
`label.configure(text="Button was clicked!")` (Concept Unit 3) — the
single line, in the entire chain, that actually mutates something a
person looking at the screen can see. Four separate objects (the
button, the callback function, the click event itself, and the label)
each played a strictly separate role in this chain, and — per this
lesson's own opening problem — that separation is exactly what your
real app's callbacks are very likely missing: if parsing a file,
building an object, and updating three widgets all happen inside one
undifferentiated function body, this lesson's four-step chain is what's
been collapsed down to one.
