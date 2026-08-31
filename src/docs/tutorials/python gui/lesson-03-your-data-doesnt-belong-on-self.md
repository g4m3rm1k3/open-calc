# Lesson 3: Your Data Doesn't Belong on `self` of the App Class

**What you will build:** the same window from Lesson 2, restructured
into a class — `class App(ctk.CTk)` — the shape almost every real
CustomTkinter app eventually takes, including yours. Along the way this
lesson deliberately makes the exact mistake you described making in
your own app (putting parsed data directly onto `self`, right next to
the widgets), *proves*, with real inspected output, exactly what that
costs you, and then fixes it with the smallest possible tool: a plain
Python object — a `@dataclass` — that has never heard of CustomTkinter,
holding the data instead. By the end, `self` on your app class holds
exactly three things, each a genuinely different, inspectable type,
instead of an undifferentiated pile.

**What you need to know first:** Lesson 1 (the `CTk` root window, the
event loop, the widget tree, `.pack()`) and Lesson 2 (first-class
functions, callbacks, `ctk.CTkButton`'s `command=`, and
`.configure()`). This lesson restructures Lesson 2's finished file
rather than adding to it in place — see Concept Unit 1's Project Change
for exactly what changes shape.

**Terms used in this lesson**

- **class definition (`class Name(Base):`)** — declares a new type,
  built by extending an existing one named in the parentheses. This
  exists because a CustomTkinter application window is almost always
  more than a generic `CTk` — you need it to also remember its own
  widgets and, soon, its own data, and a plain `ctk.CTk()` instance has
  nowhere built in to keep that; a subclass gives you exactly that
  extra room while still being, underneath, a completely real `CTk`.
- **inheritance** — a class built with `class App(ctk.CTk):` doesn't
  just resemble `CTk`; it *is* one, plus whatever additional behavior
  or storage `App` itself adds. This exists so you don't have to
  reimplement everything `CTk` already knows how to do (being a real
  window, running an event loop, hosting a widget tree) just to add
  your own behavior on top of it.
- **`super()`** — a way to reach "the version of this from the parent
  class," used almost always to call the parent's own `__init__` from
  inside a subclass's `__init__`. This exists because when `App`
  defines its own `__init__`, that new `__init__` *replaces* `CTk`'s —
  Python doesn't automatically run both; `super().__init__()` is you
  explicitly asking for the parent's setup to still happen, before your
  own additions run.
- **bound method** — a method, accessed through a specific instance
  (`self.on_click`, or, from outside the class, `app.on_click`), that
  already has that instance "baked in" as its own `self` — calling it
  needs no separate step to say *which* object's method you mean. This
  matters here because `command=self.on_click` (contrast Lesson 2's
  plain `command=on_click`) is how a widget event gets wired to a
  specific object's own behavior rather than a free-floating function.
- **cohesion** — how closely the things stored on one object actually
  belong together, conceptually. This exists as a real, named
  engineering idea — not just a personal taste — because an object
  whose stored attributes have nothing to do with each other (a widget
  reference next to a dollar amount next to a customer's name) is
  measurably harder to reason about than one where every attribute
  serves the same single purpose; Concept Unit 4, below, is what makes
  this concrete instead of abstract.
- **data class** — a class whose entire purpose is holding a fixed set
  of named values, with no widgets, no event loop, and no dependency on
  any GUI library at all. This exists so that "what data does my
  program have" and "how is that data currently displayed" can be two
  completely separate questions, answerable by reading two completely
  separate, much smaller pieces of code.

**Objects and methods used**

- **`super`**
  - *What it is:* a built-in function that, called with no arguments
    inside a method, returns a special proxy object standing in for
    "the next class up in this object's inheritance chain" — here,
    `CTk`.
  - *Implementation:* part of Python itself, not CustomTkinter;
    `super().__init__()` inside `App.__init__` resolves, at runtime, to
    `ctk.CTk.__init__(self)` — the real constructor whose own full
    signature and body were already quoted in Lesson 1's Header, under
    `ctk.CTk`.
  - *Its use:* this lesson's code calls it exactly once, as the very
    first line of `App.__init__`, specifically so every piece of setup
    a real `CTk` needs (the actual OS window, the widget tree root, the
    event-loop machinery) happens before this lesson's own additions
    (a label, a button, a data object) try to build on top of it.
  - *Type:* a built-in function; `super()` itself returns a proxy
    object, and `.init__()` is then called on that proxy.
  - *Responsibility:* to find and call the correct parent-class version
    of a method being overridden, without you having to name the parent
    class directly (writing `ctk.CTk.__init__(self)` would work too,
    but breaks if `App`'s own base class is ever changed later, whereas
    `super()` does not).
  - *Depends on:* being called from inside a method of a class that
    actually has a base class to delegate to — `App(ctk.CTk)`'s own
    declaration is what makes `super()` resolve to `CTk` specifically.
  - *Connects to:* called from inside `App.__init__`; it reaches
    directly into `ctk.CTk.__init__`, the exact method Lesson 1's
    Header already quoted in full.
  - *Shape:* the seam between "setup my parent class already knows how
    to do" and "setup specific to this subclass" — everything before
    the `super().__init__()` call in a correctly-written `__init__` is
    nothing; everything after it can safely assume the parent is fully
    ready.

- **`dataclasses.dataclass`**
  - *What it is:* a decorator — a function that takes a class and
    returns a modified version of it — that automatically writes a
    handful of standard methods for a class whose entire job is holding
    named data.
  - *Implementation:* part of Python's own standard library, in the
    `dataclasses` module. Its real signature, read from the installed
    Python 3.12 standard library this session, is
    `def dataclass(cls=None, /, *, init=True, repr=True, eq=True, order=False, ...)`
    — every option defaults to something sensible; this lesson uses
    only the plain `@dataclass` form, with no arguments, which uses
    every one of those defaults. Its own docstring, quoted directly
    from the installed source, confirms what that default form actually
    does: "If init is true, an `__init__()` method is added to the
    class. If repr is true, a `__repr__()` method is added." — both
    true by default, which is why this lesson's own code below never
    writes an `__init__` for `InvoiceData` by hand, and yet
    constructing one with keyword arguments, and printing one, both
    work.
  - *Its use:* this lesson's code writes
    `@dataclass` directly above `class InvoiceData:`, with two
    annotated fields underneath and no body beyond that — the smallest
    possible data class.
  - *Type:* a decorator — syntactically, a name preceded by `@`,
    written on the line directly above a `class` (or `def`) statement,
    that wraps the thing beneath it.
  - *Responsibility:* to inspect a class's own type-annotated fields
    (`customer_name: str`, `invoice_total: float`, in this lesson's
    code) and generate real methods from them — most importantly a
    constructor that accepts each field as a keyword argument, and a
    readable `__repr__` so printing an instance shows its actual field
    values instead of a bare memory address.
  - *Depends on:* a class body consisting of type-annotated field
    names, with no explicit `__init__` already written — writing your
    own `__init__` on a class decorated with plain `@dataclass` would
    conflict with the one this decorator generates.
  - *Connects to:* it transforms the `InvoiceData` class definition
    directly beneath it, before that class is ever instantiated; every
    later `InvoiceData(...)` call in this lesson's code uses the
    constructor this decorator generated, not one anyone wrote by hand.
  - *Shape:* this is the actual mechanical tool behind this lesson's
    entire fix — the class it produces has no `ctk` import anywhere
    near it, on purpose; it's usable, testable, and readable with zero
    GUI code running at all.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`ctk.CTk`**
  - *What it is:* the root window class — see Lesson 1 for full
    treatment.
  - *Implementation:* `class CTk(CTK_PARENT_CLASS, ...)` where
    `CTK_PARENT_CLASS = tkinter.Tk`; constructor
    `def __init__(self, fg_color=None, **kwargs)`.
  - *Its use:* this lesson's `App` class no longer calls `ctk.CTk()`
    directly — instead, `App` *is* one, by inheritance (Terms, above),
    and reaches its constructor only indirectly, through `super()`.
  - *Type:* a class — and, starting this lesson, `App`'s own base
    class.
  - *Responsibility:* unchanged from Lesson 1 — owns the real window,
    the widget-tree root, and the event loop.
  - *Depends on:* nothing required to construct.
  - *Connects to:* `App` inherits from it directly; `super().__init__()`
    inside `App.__init__` is what actually calls its constructor.
  - *Shape:* still the outermost class in the whole program's
    inheritance chain — now with `App` sitting directly on top of it,
    instead of a bare instance sitting in a module-level variable.

- **`ctk.CTkLabel` / `ctk.CTkButton` / `Widget.pack` /
  `CTkLabel.configure` / `command=` callbacks**
  - *What they are:* the label, button, geometry manager, mutation
    method, and callback-wiring pattern fully covered in Lessons 1 and
    2.
  - *Implementation:* unchanged — see Lesson 1's Header for
    `CTkLabel` and `.pack()`, and Lesson 2's Header for `CTkButton`,
    `command=`, and `.configure()`, all with real quoted source.
  - *Its use:* this lesson's code still builds one label and one
    button, still wires the button's `command=` to a callback, and
    still mutates the label's text from inside that callback — the
    only two things that change are *where* they're built (inside
    `App.__init__`, not a bare script) and *what* the callback is now
    (a bound method, Concept Unit 3, below, instead of a plain
    function).
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    unchanged from Lessons 1 and 2 in every respect not specifically
    called out in this lesson's own Concept Units.

---

## Concept Unit: Subclassing `ctk.CTk`

### The Problem

Lesson 2's finished file works, and for a two-widget program, a flat
script is genuinely fine. But your real app has more than two widgets,
plus parsed data, plus file-writing logic — and a flat script has
nowhere natural to put any of that except a slowly growing pile of
module-level variables, or, as you described, everything crammed onto
whatever object is already sitting there. Almost every real
CustomTkinter app, at some point, turns its window itself into a class
so it has somewhere organized to put things. This unit is that turn —
on its own, before any data is involved at all.

> **Stop and think before reading on:** you already know, from Lessons
> 1–2, that `ctk.CTk()` builds a real window object. If, instead of
> calling it directly, you wanted to build your *own* class that acts
> exactly like a `CTk` but can also carry extra stuff you define — what
> Python feature, already common outside GUI code, lets one class
> "become" another one while adding its own extras on top? You may
> already know this from other Python code you've written, even if you
> haven't used it with a GUI window before.

### The New Code

```python
class App(ctk.CTk):
    def __init__(self):
        super().__init__()
```

### The Updated Project

This unit restructures Lesson 2's flat script rather than adding to it
in place. **Reference Source:** no reference counterpart — this is a
from-scratch structural change to this curriculum's own running
example, not a port of any existing implementation. **Files affected:**
the single running file this curriculum has been building since Lesson
1. **Change type:** refactor. **Location:** replaces the bare
`app = ctk.CTk()` line that has opened this file since Lesson 1.
**Dependencies:** none beyond what Lessons 1–2 already required.

```python
 1  import customtkinter as ctk
 2
 3  class App(ctk.CTk):
 4      def __init__(self):
 5          super().__init__()
 6
 7  app = App()
 8  app.mainloop()
```

The file's shape has changed for the first time since Lesson 1: instead
of one flat sequence of statements, it now defines a class (lines 3–5)
and only afterward creates and runs an instance of it (lines 7–8).
Lines 3–5 alone don't do anything yet — defining a class, like defining
a function in Lesson 2's first unit, doesn't run its body; only line 7,
`App()`, actually constructs a real window. This version, run as shown,
produces an empty window, functionally identical to Lesson 1's very
first result — this unit is deliberately about the restructuring alone,
with the label and button not yet moved over.

### Isolating It

```python
import customtkinter as ctk
import tkinter

class App(ctk.CTk):
    def __init__(self):
        super().__init__()

app = App()
app.geometry("300x150")

print("type(app):", type(app))
print("isinstance(app, ctk.CTk):", isinstance(app, ctk.CTk))
print("isinstance(app, tkinter.Tk):", isinstance(app, tkinter.Tk))
print("app.winfo_class():", app.winfo_class())
```

Real output, from an actual run under a virtual display this session:

```
type(app): <class '__main__.App'>
isinstance(app, ctk.CTk): True
isinstance(app, tkinter.Tk): True
app.winfo_class(): Tk
```

This is called **inheritance**, named in full in the Header's Terms,
above. What this output proves: `type(app)` correctly reports `App` —
your own class, not `CTk` — confirming you really do have your own,
distinct type now. And yet `isinstance(app, ctk.CTk)` and
`isinstance(app, tkinter.Tk)` are both `True`, and `winfo_class()` still
reports the real, underlying Tk widget class as `Tk` — proving `app` is
simultaneously and completely a real `App`, a real `CTk`, and a real
`tkinter.Tk`, all three, at once. Inheritance doesn't create a
lookalike; it creates one object that genuinely satisfies every one of
those types.

A second, separate lab makes the *reason* `super().__init__()` matters
concrete instead of assumed — by deliberately leaving it out:

```python
class BrokenApp(ctk.CTk):
    def __init__(self):
        pass  # deliberately never calls super().__init__()

app = BrokenApp()
print("BrokenApp() constructed without error")
app.geometry("300x150")
print("geometry() succeeded too?")
```

Real output, from an actual run this session — and this is a genuine
execution trace, not a values trace, because the entire point is *when*
the failure happens, not what any variable's value was:

1. `app = BrokenApp()` — this succeeds, silently. `BrokenApp.__init__`
   does run, but its body is just `pass` — it never asked `CTk` to do
   any of its own setup, and Python doesn't complain about that at
   construction time; nothing checks that a subclass's `__init__`
   "finishes the job" its parent needed.
2. `print("BrokenApp() constructed without error")` — this genuinely
   prints, proving step 1's object really did come into existence as
   *something* — just not a properly set-up one.
3. `app.geometry("300x150")` — this is where it actually breaks. The
   real, saved output from this session:

   ```
   BrokenApp() constructed without error
   Traceback (most recent call last):
     File ".../lab1b_without_super.py", line 9, in <module>
       app.geometry("300x150")
     File ".../customtkinter/windows/ctk_tk.py", line 201, in geometry
       super().geometry(self._apply_geometry_scaling(geometry_string))
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     File ".../scaling_base_class.py", line 145, in _apply_geometry_scaling
       assert self.__scaling_type == "window"
              ^^^^^^^^^^^^^^^^^^^
     ...
     [Previous line repeated 994 more times]
   RecursionError: maximum recursion depth exceeded
   ```

   `.geometry()` internally needs an attribute (`self.tk`, the real
   handle to the underlying Tcl/Tk runtime) that only ever gets set by
   `CTk.__init__` itself — the exact method `super().__init__()` was
   supposed to call. Because it was skipped, looking up that missing
   attribute falls into Tkinter's own attribute-lookup fallback code,
   which — with nothing real to find — ends up calling itself,
   forever, until Python's own recursion limit stops it.

The real lesson inside this real failure: the error didn't happen at
construction — it happened two lines later, on a completely different
method call, which is exactly the kind of delayed, confusing failure
skipping `super().__init__()` causes in practice. This throwaway
example is now discarded — `BrokenApp` never appears in the real
project. What stays is only the two lines in The New Code, above, with
`super().__init__()` always present as the very first line of `App`'s
own `__init__`.

### Mechanical Walkthrough

1. `class App(ctk.CTk):` — a **class definition** (Terms, above),
   naming the new class `App` and, in the parentheses, its base class,
   `ctk.CTk` — the same attribute access into the `ctk` module's
   namespace covered in Lesson 1, here used as a base class instead of
   being called directly.
2. `def __init__(self):` — a method definition inside the class body.
   `self`, as the first parameter, is what every instance method uses
   to refer to "the specific object this call is happening on" — an
   already-assumed piece of general Python per this curriculum's own
   prerequisite (Header, above), restated here only because it's the
   first method this curriculum has written inside a class.
3. `super().__init__()` — covered in full in the Header's Objects and
   methods section, above: `super()` resolves to a proxy for `CTk`,
   and `.init__()` — called with no extra arguments beyond the
   implicit `self` — runs `CTk`'s own real constructor, doing every
   piece of setup a working `CTk` instance needs before `App` adds
   anything of its own.

### CS Lens

This is the object-oriented concept of **inheritance**, named in full
in the Header's Terms, above — one type extending another, gaining
everything the base type already does while adding or overriding
specific pieces.

```
Also recognized in: a `Car` class extending a `Vehicle` base class in
any OOP language, a `Golden Retriever` being a `Dog` being a `Mammal`
in a biological taxonomy, a checking account being a specific kind of
bank account, an exception hierarchy where `FileNotFoundError` is a
kind of `OSError`
```

### SE Lens

The tradeoff here is **inheritance vs. composition** — this unit has
`App` *become* a `CTk`, by inheriting from it, rather than the
alternative of `App` merely *holding* a `CTk` instance as one of its own
attributes (`self.window = ctk.CTk()`, with every widget built as a
child of `self.window` instead of `self`). Inheritance is the pattern
CustomTkinter itself is built around and expects — it's what lets you
write `self.geometry(...)` or `self.title(...)` directly, inherited for
free, instead of having to write `self.window.geometry(...)` everywhere.
The real cost: `App` is now permanently, unavoidably *both* "my
application's own logic" and "a literal window object," with no way to
separate those two roles later without a much bigger rewrite — which is
exactly why this lesson's later units are so insistent about not also
letting `App` become "my application's *data*," too. One unavoidable
coupling is the price of using CustomTkinter the way it's designed to
be used; piling a second, unrelated kind of coupling on top of it,
voluntarily, is the actual mistake this lesson is about.

### Commands Needed

None new.

### Run It

Both real runs shown above, under Isolating It.

### Connecting to What Came Before

Lessons 1–2 built a real, working window and a real, working button as
a flat sequence of statements; this unit changes nothing about what the
program *does* — it still, right now, just opens an empty window — and
everything about where the code that builds it lives, setting up the
one piece of structure every remaining unit in this lesson depends on.

---

## Concept Unit: `self` as Master — Widgets Live on the Instance

### The Problem

`App` is now a real class, and — proven in the unit above — a real,
complete `CTk` in its own right. Lesson 2's label and button code isn't
inside it yet. Given that `app` itself, the instance, genuinely *is* a
real window now (not just holding one), what should widgets built
inside `__init__` actually use as their `master`?

> **Stop and think before reading on:** Lessons 1–2 always passed
> `app` — a variable holding a separately-built `CTk` instance — as a
> widget's `master`. Now that `App`'s own `__init__` is running *on* the
> instance itself, is there already a name, available right there
> inside `__init__`, that refers to that exact same instance, without
> needing a separately-created variable at all?

### The New Code

```python
self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
self.label.pack(pady=20)
```

### The Updated Project

**Reference Source:** none — from-scratch continuation of this
curriculum's own example. **Files affected:** same file. **Change
type:** add. **Location:** inside `App.__init__`, directly after the
`super().__init__()` line from the unit above. **Dependencies:** none
beyond the class structure the previous unit already built.

```python
 1  import customtkinter as ctk
 2
 3  class App(ctk.CTk):
 4      def __init__(self):
 5          super().__init__()
 6
 7          self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
 8          self.label.pack(pady=20)
 9
10  app = App()
11  app.mainloop()
```

Two things happen on the new lines, and both use `self`, for two
different reasons: `ctk.CTkLabel(self, ...)` uses `self` as the
label's *master* — the widget-tree parent, same role `app` played in
Lessons 1–2 — while `self.label = ...` uses `self` as *storage* — a
place to keep a reference to the label so other methods (the next
unit's `on_click`) can reach it later. These are two independent facts
about `self` that happen to be spelled the same way.

### Isolating It

```python
import customtkinter as ctk

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
        self.label.pack(pady=20)

app = App()
app.geometry("300x150")

print("self.label.master is app:", app.label.master is app)
print("app.label in app.winfo_children():", app.label in app.winfo_children())
```

Real output, from an actual run under a virtual display this session:

```
self.label.master is app: True
app.label in app.winfo_children(): True
```

What this output proves: `app.label.master is app` — the label's
parent, from the widget tree's own perspective (Lesson 1's Terms), is
genuinely the exact same object as `app` itself, the instance the
`__init__` method ran on. There is no separate "window object" hiding
behind the scenes anymore — one object, `app`, is both the running
window and the thing storing a reference to its own child widget. The
second line confirms the widget tree connection itself still works
exactly as it did in Lesson 1: `app.label` genuinely shows up in
`app`'s own list of children.

This throwaway example is now discarded. What stays in the real
project is only the two lines shown in The New Code, above.

### Mechanical Walkthrough

1. `ctk.CTkLabel(self, text="Hello, CustomTkinter")` — the same
   constructor call fully covered in Lesson 1's Header, with one
   change: the first, positional argument — `master` — is now `self`
   rather than a separately-built variable. Because `App.__init__` is
   running as a method *on* the already-under-construction `App`
   instance (by the time this line runs, `super().__init__()` has
   already finished, so the instance is a fully real, working `CTk`),
   `self` at this point in the code already *is* a complete, valid
   widget to parent something to — exactly the same as `app` was in
   Lessons 1–2, just reached by a different name because the code
   reaching for it is now running from inside the object itself.
2. `self.label = ...` — this is an **attribute assignment**, not a
   plain variable assignment: it stores the newly-built label as a
   named attribute directly on the `App` instance, reachable afterward
   as `self.label` from any other method on the same instance (the
   next unit's `on_click` depends on exactly this), or as `app.label`
   from outside the class, as this unit's own lab just did.
3. `self.label.pack(pady=20)` — the pack geometry manager, fully
   covered in Lesson 1's Header and restated in Lesson 2's, called here
   through the freshly-stored `self.label` attribute rather than a
   bare local variable — mechanically identical to Lesson 1's
   `label.pack(pady=20)` in every respect except which name reaches the
   object.

### CS Lens

Using the same name (`self`) for two genuinely different roles — "the
widget-tree parent to build against" and "the place to store a
reference for later" — is possible here because of a broader idea:
**object identity** — the fact that a single object in memory can be
referred to by more than one name, or reached through more than one
path, and still be the exact one object, not a copy.

```
Also recognized in: two variables pointing at the same list in Python
(mutating one is visible through the other), a shared pointer in C++,
a symbolic link on a filesystem pointing at the same underlying file,
two people holding the same physical key to the same physical door
```

### SE Lens

The alternative design CustomTkinter didn't force on you here would be
requiring a *separate* attribute — something like
`self.window = self` set up manually, then always parenting widgets to
`self.window` instead of `self` directly — which would add an extra,
redundant name for something that's already reachable. The actual
tradeoff worth noticing is narrower and more important: **using `self`
as master works here specifically because `App` inherits from `CTk`**
(previous unit) — if `App` had instead only *held* a `CTk` as an
attribute (the composition alternative the previous unit's SE Lens
described), `self` would not be a valid `master` at all, and every
widget would need `self.window` instead. This unit's clean
`ctk.CTkLabel(self, ...)` is a direct, visible consequence of the
inheritance choice made one unit ago — a good illustration of how an
early structural decision keeps shaping what the rest of the code looks
like, for better here, and, as the next two units show, for worse if
the same convenience (attaching things to `self`) gets used carelessly.

### Commands Needed

None new.

### Run It

Real output, from an actual run under a virtual display this session,
already shown in full above under Isolating It.

### Connecting to What Came Before

The previous unit proved `app` is a genuine `CTk`; this unit is the
first place that fact actually gets *used* — as the parent for a real
widget — while simultaneously introducing the second, separate job
`self` is about to be asked to do throughout the rest of this lesson:
remembering things.

---

## Concept Unit: Bound Methods as Callbacks — `command=self.on_click`

### The Problem

Lesson 2's callback was a plain, module-level function,
`command=on_click`. Now that the button and its handler both live
inside the same class, does the callback still need to be a
free-floating function sitting outside the class — or can it be a
method that already has direct access to everything else on `self`,
including the label from the unit above?

> **Stop and think before reading on:** if `on_click` becomes a method
> defined inside `App` — `def on_click(self): ...` — then, exactly like
> every other method on the class, calling it for real requires an
> instance to call it *on* (`app.on_click()`, not just `on_click()` by
> itself). Given that a widget's `command=` argument just wants *some*
> callable with no arguments (Lesson 2), what do you think
> `command=self.on_click` — no parentheses, referenced from inside
> `__init__`, where `self` is already the specific instance under
> construction — actually hands the button? Is it possible that
> `self.on_click`, unlike the plain `on_click` from Lesson 2, already
> knows which object it belongs to, without needing to be called with
> an instance explicitly?

### The New Code

```python
def on_click(self):
    self.label.configure(text="Button was clicked!")
```

### The Updated Project

**Reference Source:** none. **Files affected:** same file. **Change
type:** add (a new method on `App`) plus a modification to the
`CTkButton` construction to reference it. **Location:** the method
itself goes inside the `App` class body, after `__init__`; the button
construction goes inside `__init__`, after the label built in the
previous unit. **Dependencies:** the `self.label` attribute the
previous unit already created.

```python
 1  import customtkinter as ctk
 2
 3  class App(ctk.CTk):
 4      def __init__(self):
 5          super().__init__()
 6
 7          self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
 8          self.label.pack(pady=20)
 9
10          self.button = ctk.CTkButton(self, text="Click me", command=self.on_click)
11          self.button.pack(pady=10)
12
13      def on_click(self):
14          self.label.configure(text="Button was clicked!")
15
16  app = App()
17  app.mainloop()
```

This is the complete file this lesson's GUI structure builds toward —
the next unit changes what happens *inside* `on_click`, but not the
overall shape shown here.

### Isolating It

```python
import customtkinter as ctk

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.clicks = 0
        self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
        self.label.pack(pady=20)

    def on_click(self):
        self.clicks += 1
        print("on_click ran, self.clicks:", self.clicks)

app = App()
app.geometry("300x150")

print("type(app.on_click):", type(app.on_click))
print("type(App.on_click):", type(App.on_click))

app.on_click()  # bound method: no explicit self needed

try:
    App.on_click()
except TypeError as e:
    print("App.on_click() with no args failed:", e)

App.on_click(app)  # unbound function: self must be supplied explicitly
print("after explicit App.on_click(app), self.clicks:", app.clicks)
```

Real output, from an actual run under a virtual display this session:

```
type(app.on_click): <class 'method'>
type(App.on_click): <class 'function'>
on_click ran, self.clicks: 1
App.on_click() with no args failed: App.on_click() missing 1 required positional argument: 'self'
on_click ran, self.clicks: 2
after explicit App.on_click(app), self.clicks: 2
```

This is called a **bound method**, named in full in the Header's
Terms, above. What this output proves, working through it in order:
`type(app.on_click)` — reached *through a specific instance*, `app` —
reports `method`, while `type(App.on_click)` — reached through the
*class itself*, with no instance involved — reports plain `function`.
Those are genuinely different objects, not two names for the same
thing: `app.on_click()` runs successfully with zero arguments, because
the instance `app` is already baked into it; calling `App.on_click()`
the same way, with zero arguments, fails with a real, saved
`TypeError` — `self` was never supplied, because reaching the method
through the bare class, not an instance, never bound one. The final
line, `App.on_click(app)`, proves the two forms are really doing the
same underlying work: supplying `app` *explicitly*, as an ordinary
first argument, to the unbound function form produces the identical
result — `self.clicks` incrementing — as calling the bound form did.
`self.on_click`, written from inside `__init__`, is exactly the bound
form: `self` at that point already refers to the specific instance
under construction, so `self.on_click` is already a complete, callable
object with nothing further needed — precisely what `command=` (Lesson
2) requires.

This throwaway example is now discarded — the `clicks` counter and the
explicit `App.on_click(app)` comparison existed only to make the
binding mechanism provable. What stays in the real project is only the
two pieces shown in The New Code, above.

### Mechanical Walkthrough

1. `ctk.CTkButton(self, text="Click me", command=self.on_click)` — the
   same constructor fully covered in Lesson 2's Header, with two
   changes from that lesson's version: `self` replaces `app` as the
   positional `master` argument, for the identical reason the previous
   unit's label used `self`; and `command=self.on_click` replaces
   Lesson 2's `command=on_click` — still a **keyword argument** (Lesson
   1's Terms, reappearing), still handing the button a **first-class
   function** (Lesson 2's Terms, reappearing) with no parentheses so it
   isn't called immediately — but this specific first-class function is
   now a **bound method** (this unit's Terms) rather than a
   module-level function, meaning it already carries its own `self`
   with it.
2. `def on_click(self):` — a method definition, the second one this
   curriculum has written (after `__init__`), taking `self` as its only
   parameter — required, per general Python's own method-definition
   rules (assumed prerequisite, Header, above), even though nothing
   about calling it through `command=` will ever need to supply that
   argument explicitly; the binding mechanism this unit's lab proved is
   exactly what fills it in automatically.
3. `self.label.configure(text="Button was clicked!")` — mechanically
   identical to Lesson 2's own `label.configure(...)` call, with one
   real difference worth naming: this line only works *because*
   `on_click` is a method with access to `self`, and `self.label` was
   already set up by `__init__` before this method could ever run —
   a module-level function, as in Lesson 2, would have had no
   equivalent way to reach `label` unless it were a global variable.

### CS Lens

A bound method — a function value with its owning instance already
attached — is a specific, real instance of the more general idea of a
**closure**: a callable that carries some of its own context around
with it, rather than depending entirely on arguments supplied at call
time.

```
Also recognized in: a JavaScript arrow function capturing a variable
from its enclosing scope, Python's own `functools.partial` pre-filling
some of a function's arguments, a C# delegate bound to a specific
object instance, an event handler in almost any object-oriented GUI
framework, not just this one
```

### SE Lens

The design tradeoff is **encapsulation**: by making `on_click` a method
rather than a free function, it gains direct, natural access to
`self.label` (and, later in this lesson, `self.model`) without either
needing to be passed in as an argument or reached as a global variable
— the two alternatives Lesson 2's flat-script version would have been
forced into as soon as more than one callback needed to share data. The
real cost, and it's worth being honest about it since it's exactly the
shape of your own app's actual problem: methods on a class can reach
*anything else* on `self`, not just the specific things they actually
need — `on_click` could, with nothing stopping it, just as easily read
or write a dozen unrelated attributes on the same object. Encapsulating
behavior inside a class buys convenient access; it does not, by itself,
buy discipline about which access is actually appropriate — that
discipline is what the next two units are about.

### Commands Needed

None new.

### Run It

Real output, from an actual run under a virtual display this session,
already shown in full above under Isolating It. The complete file
shown in this unit's Updated Project runs identically to Lesson 2's own
finished example — same visible behavior, restructured internals.

### Connecting to What Came Before

The previous unit put a widget on `self`, purely for storage; this unit
puts a second, different kind of thing on `self` in spirit — a bound
method reaching back into that same storage — which is exactly the
convenience that makes it tempting, in the next unit, to put a third,
very different kind of thing there too, without stopping to ask whether
it belongs.

---

## Concept Unit: The Trap — Data Mixed Directly Onto `self`

### The Problem

Your real app, by your own description, parses a file, builds an
object from it, and stores that object — or its individual pieces —
directly on the same class already holding `self.label` and
`self.button`. This unit does that on purpose, in this lesson's tiny
example, so the cost is something you can actually see rather than
just take on faith.

> **Stop and think before reading on:** if you added
> `self.customer_name = "Acme Corp"` inside `App.__init__`, right next
> to `self.label = ctk.CTkLabel(...)`, would the program still run?
> Would anything visibly break? If nothing breaks and nothing looks
> wrong, what exactly would you say the actual problem *is* — and how
> would you convince someone who says "it works, so what's the issue?"
> that there's a real cost here at all?

### The New Code

```python
self.customer_name = "Acme Corp"
self.invoice_total = 401.5
```

### The Updated Project

**Reference Source:** none — this is a deliberate demonstration of the
anti-pattern this lesson exists to fix, not a piece of the curriculum's
own ongoing example; it will be replaced, not built on, by the next
unit. **Files affected:** none, really — this unit's code is not
folded into the curriculum's own running file at all, for the reason
just given; it's shown here, isolated, as a complete but temporary
class. **Change type:** N/A. **Location:** N/A.

```python
 1  class App(ctk.CTk):
 2      def __init__(self):
 3          super().__init__()
 4
 5          self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
 6          self.label.pack(pady=20)
 7
 8          self.customer_name = "Acme Corp"        # ← new
 9          self.invoice_total = 401.5              # ← new
```

Lines 8–9 are new here, added directly alongside the widget-building
code from earlier units — with nothing about their own syntax
signaling that they're doing something different in kind from lines
5–6 just above them. That similarity is the entire problem this unit
exists to make visible.

### Isolating It

```python
class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
        self.label.pack(pady=20)

        # the anti-pattern this unit is about:
        self.customer_name = "Acme Corp"
        self.invoice_total = 401.5

app = App()
app.geometry("300x150")

print("Everything sitting on self, all mixed together:")
for name, value in vars(app).items():
    if not name.startswith("_"):
        print(f"  self.{name!r} -> {type(value).__name__}")
```

Real output, from an actual run under a virtual display this session:

```
Everything sitting on self, all mixed together:
  self.'master' -> NoneType
  self.'children' -> dict
  self.'tk' -> tkapp
  self.'focused_widget_before_widthdraw' -> NoneType
  self.'label' -> CTkLabel
  self.'customer_name' -> str
  self.'invoice_total' -> float
```

What this output proves is not that anything crashes — nothing does,
which is exactly why this pattern is so easy to fall into without
noticing — but what `vars(app)` (a real, built-in way to inspect every
attribute currently stored on an object) actually shows: your own
`self.label`, `self.customer_name`, and `self.invoice_total` sit in the
exact same flat list, presented identically, as `CTk`'s *own* internal
bookkeeping attributes (`master`, `children`, `tk`,
`focused_widget_before_widthdraw`) — things you never wrote and don't
control. Reading this list top to bottom, with no other context, there
is no way to tell, from the attribute itself, which of these seven
things is a widget you need to update the screen, which is business
data from a parsed file, and which is CustomTkinter's own internal
state that you should never touch directly at all. This is the concept
named **cohesion**, in full, in the Header's Terms, above: `App`, as a
class, is now responsible for two conceptually unrelated jobs — being a
window, and knowing about a specific customer's invoice — and nothing
in the code marks that seam.

This throwaway example is now discarded — per its own Project Change,
above, it was never folded into the curriculum's own file to begin
with. The next unit replaces this pattern entirely, rather than
building on it.

### Mechanical Walkthrough

1. `self.customer_name = "Acme Corp"` — an ordinary attribute
   assignment, mechanically identical to `self.label = ...` in an
   earlier unit — Python's own attribute-assignment syntax draws no
   distinction whatsoever between storing a widget and storing a
   string; the distinction, if it exists at all, has to come from how
   the programmer organizes the code, not from anything the language
   itself enforces.
2. `self.invoice_total = 401.5` — the same mechanism again, this time
   storing a `float`. Two lines, two completely unrelated pieces of
   information, made to look — deliberately, in this demonstration —
   exactly as similar as two lines really can look in Python.

### CS Lens

The failure this unit demonstrates is a named, recognized one in
software design: the **God object** anti-pattern — a single object that
accumulates responsibility for too many unrelated things, becoming a
de facto dumping ground because it's already there and already
reachable from everywhere that needs it.

```
Also recognized in: a single massive "Utils" class in a Java codebase
that ends up doing everything, a web app's session object slowly
accumulating unrelated flags over years of feature additions, a
spreadsheet's single "Sheet1" holding five unrelated departments' data
because nobody ever split it, a shared global config object in a large
codebase that every module ends up reading and writing
```

### SE Lens

There is no alternative design being weighed here, on purpose — this
unit's entire point is that the *convenience* of `self` (proven, unit
by unit, over the last three units to genuinely and correctly hold
widgets, and to give methods natural access to them) creates zero
friction against also using it for something that doesn't belong,
which is precisely why it happens so often in real code, including
yours. The honest cost, stated plainly: nothing about `vars(app)`'s
output, above, tells you anything is wrong. The cost only shows up
later — when a second developer (or you, in six months) has to read
`App` and figure out which of a dozen attributes are safe to read from
a totally different part of the program, which are private
implementation details of the GUI, and which would break the window
itself if touched. That cost is deferred, not absent — and deferred
costs are exactly the kind that are easiest to keep paying without
ever deciding to.

### Commands Needed

None new.

### Run It

Real output, from an actual run under a virtual display this session,
already shown in full above under Isolating It.

### Connecting to What Came Before

Every previous unit in this lesson used `self` correctly — for a real
widget, and for a bound method needing access to it. This unit used the
exact same mechanism, in the exact same way, for something that isn't
either of those things — proving, concretely, that Python itself will
never stop you from doing this, which is exactly why the next unit's
fix has to be a deliberate choice, not something the language enforces
for you.

---

## Concept Unit: The Fix — A Plain Data Class, Held as One Attribute

### The Problem

The previous unit proved the cost is real but invisible: two unrelated
kinds of information, sitting side by side on `self`, indistinguishable
from each other and from CustomTkinter's own internals. The data itself
— a customer's name, an invoice total — is completely real and
completely needed; the problem was never that it exists, only where it
was put and how it was put there.

> **Stop and think before reading on:** what is the smallest possible
> Python object that could hold a customer's name and an invoice total
> together, *without* mentioning `ctk`, `CTk`, or anything about a
> window at all? If you stripped away every GUI concept this curriculum
> has taught so far, what would be left, if all you needed was
> somewhere to put two related pieces of data with names attached to
> them?

### The New Code

```python
from dataclasses import dataclass

@dataclass
class InvoiceData:
    customer_name: str
    invoice_total: float
```

### The Updated Project

**Reference Source:** none. **Files affected:** the same file, plus a
new import at the top. **Change type:** add — a completely new class,
defined above `App`, plus one new line inside `App.__init__`
constructing an instance of it and storing it as `self.model`, and one
changed line inside `on_click`, reading from that same `self.model`
instead of a hard-coded string. **Location:** `InvoiceData` goes above
`class App`, since `App` will depend on it; `self.model = ...` goes
inside `__init__`, alongside — but not mixed into the individual
fields of — the widget-building lines already there. **Dependencies:**
Python's own standard-library `dataclasses` module — no installation
needed, it ships with Python itself.

```python
 1  import customtkinter as ctk
 2  from dataclasses import dataclass
 3
 4
 5  @dataclass
 6  class InvoiceData:
 7      customer_name: str
 8      invoice_total: float
 9
10
11  class App(ctk.CTk):
12      def __init__(self):
13          super().__init__()
14
15          self.model = InvoiceData(customer_name="Acme Corp", invoice_total=401.5)
16
17          self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
18          self.label.pack(pady=20)
19
20          self.button = ctk.CTkButton(self, text="Show invoice", command=self.on_click)
21          self.button.pack(pady=10)
22
23      def on_click(self):
24          self.label.configure(
25              text=f"{self.model.customer_name}: ${self.model.invoice_total:.2f}"
26          )
27
28  app = App()
29  app.mainloop()
```

This is the complete file this lesson builds toward. Compare line 15
against the previous unit's lines 8–9: instead of two separate,
loose attributes sitting directly on `self`, there is now exactly one —
`self.model` — and everything about the invoice lives *inside* that one
object instead of spreading across `self`'s own namespace.

### Isolating It

First, completely alone, with no GUI code anywhere near it:

```python
from dataclasses import dataclass

@dataclass
class InvoiceData:
    customer_name: str
    invoice_total: float

model = InvoiceData(customer_name="Acme Corp", invoice_total=401.5)

print("model:", model)
print("model.customer_name:", model.customer_name)
print("model.invoice_total:", model.invoice_total)
print("type(model):", type(model))
print("vars(model):", vars(model))
```

Real output, from an actual run this session — note this required no
`import customtkinter`, no display, no window of any kind:

```
model: InvoiceData(customer_name='Acme Corp', invoice_total=401.5)
model.customer_name: Acme Corp
model.invoice_total: 401.5
type(model): <class '__main__.InvoiceData'>
vars(model): {'customer_name': 'Acme Corp', 'invoice_total': 401.5}
```

This is called a **data class**, named in full in the Header's Terms,
above. What this output proves: `InvoiceData(customer_name=..., invoice_total=...)`
works as a real constructor, accepting keyword arguments, even though
no one wrote an `__init__` for this class by hand — exactly the
behavior the `@dataclass` decorator's own real docstring, quoted in the
Header's Objects and methods section, promised. `print(model)` shows
readable field values, not a bare memory address, because the decorator
also generated a real `__repr__`. And `vars(model)`, run against this
object, contains *only* `customer_name` and `invoice_total` — compare
this directly against the previous unit's `vars(app)`, which mixed
seven unrelated things together; `vars(model)` has exactly two things
in it, and both of them belong together by definition, because
`InvoiceData` was never asked to be anything else.

A second lab confirms the fix as it actually lands inside `App`:

```python
class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.model = InvoiceData(customer_name="Acme Corp", invoice_total=401.5)
        self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
        self.label.pack(pady=20)
        self.button = ctk.CTkButton(self, text="Show invoice", command=self.on_click)
        self.button.pack(pady=10)

    def on_click(self):
        self.label.configure(
            text=f"{self.model.customer_name}: ${self.model.invoice_total:.2f}"
        )

app = App()
for name, value in vars(app).items():
    if not name.startswith("_") and name not in ("master", "children", "tk", "focused_widget_before_widthdraw"):
        print(f"  self.{name!r} -> {type(value).__name__}")
```

Real output, from an actual run under a virtual display this session
(with CustomTkinter's own internal attributes filtered out, the same
way the previous unit's raw list included them):

```
self.'model' -> InvoiceData
self.'label' -> CTkLabel
self.'button' -> CTkButton
```

This is the entire point of this lesson, made concrete: `self` now
holds exactly three things, and every one of them is a different,
specific, meaningful type — a data object, a label widget, a button
widget — not two loose primitive values sitting unexplained next to
widget references. Nothing about *reading data* got harder — line 25's
`self.model.customer_name` is barely longer than the previous unit's
bare `self.customer_name` — but now the fact that it's *data*, not a
*widget*, is visible in the code itself, every single time it's used,
because you have to go through `self.model` to reach it.

A real screenshot, taken before any click, shows the original label
text and a button reading "Show invoice." A second real screenshot,
taken after a real simulated click, shows the label now reading
"Acme Corp: $401.50" — proving the data flows correctly from
`self.model`, through the f-string on line 25, into the same
`.configure()` mutation Lesson 2 already covered in full.

This throwaway example is now discarded in the sense that the
standalone `model = InvoiceData(...)` line (with no `App` around it at
all) never appears in the real project — but, unlike every previous
unit's lab, most of *this* lab's code is not thrown away: it's already
identical to what's shown in The New Code and Updated Project, above,
because this concept's fix and its real use are the same few lines.

### Mechanical Walkthrough

1. `from dataclasses import dataclass` — an import, the same mechanism
   as `import customtkinter as ctk` from Lesson 1, here pulling a
   single specific name, `dataclass`, out of Python's own standard
   library `dataclasses` module, rather than importing the whole module
   under an alias.
2. `@dataclass` — the decorator covered in full in the Header's
   Objects and methods section, above, written directly above the
   class it applies to.
3. `class InvoiceData:` — an ordinary **class definition** (this
   lesson's own Terms, first unit), with no base class named in
   parentheses — unlike `App(ctk.CTk)`, `InvoiceData` inherits from
   nothing in particular; it's a plain, standalone type.
4. `customer_name: str` and `invoice_total: float` — type-annotated
   class-level names, with no `self.` and no assignment. This is the
   specific syntax the `@dataclass` decorator's own real implementation
   inspects (per its docstring, quoted in the Header, above:
   "Examines... `__annotations__` to determine fields") to know which
   fields to generate a constructor and a `__repr__` for — this is not
   an assignment creating a value right now; it's a declaration the
   decorator reads afterward.
5. `self.model = InvoiceData(customer_name="Acme Corp", invoice_total=401.5)`
   — an attribute assignment, the same mechanism this lesson's second
   unit used for `self.label`, here storing a single `InvoiceData`
   instance, built with two **keyword arguments** (Lesson 1's Terms,
   reappearing) supplying the decorator-generated constructor's two
   fields.
6. `f"{self.model.customer_name}: ${self.model.invoice_total:.2f}"` —
   an f-string (already assumed as ordinary Python, per this
   curriculum's own prerequisite) reaching through two attribute
   accesses in a row: `self.model` retrieves the `InvoiceData` instance
   stored in the previous step, and `.customer_name`, `.invoice_total`
   each retrieve one of its own two fields; `:.2f` is a format
   specifier telling the f-string to show the float with exactly two
   decimal places, the conventional way to display a currency amount.

### CS Lens

Grouping related data into its own dedicated structure, and giving the
class that holds it no responsibility beyond holding it, is the general
idea behind the **data transfer object** (or, in plainer terms, a
**plain data holder**) — a type whose entire purpose is carrying a
fixed bundle of related values from one part of a program to another,
with no behavior of its own beyond that.

```
Also recognized in: a `struct` in C, a row fetched from a SQL database
before it's turned into anything else, a JSON object passed between a
web server and a browser, a Java "POJO" (Plain Old Java Object), a
record type in most modern statically-typed languages
```

### SE Lens

The design principle this whole lesson has been building toward is
**separation of concerns**, applied specifically to *what an object is
responsible for knowing*, not just — as Lesson 1's SE Lens first used
this same principle for — *where a widget appears on screen*. `App`'s
job, after this unit, is exactly what it was before any data was
involved: be a window, hold widgets, react to events. `InvoiceData`'s
job is exactly and only to hold an invoice's data. The alternative this
lesson has spent four units demonstrating the cost of — flattening
every individual field directly onto `self` of the app class — trades
away that separation for what feels, in the moment of writing
`self.customer_name = ...`, like slightly less typing. The real,
compounding cost, stated honestly: a flat pile of attributes on a GUI
class has no natural place to grow a second invoice, a list of past
invoices, or validation logic for what makes an invoice's data valid in
the first place — every one of those needs somewhere that isn't `App`
to live, and `InvoiceData` is exactly that somewhere, ready before it's
needed. This is the single change most directly relevant to your own
real app: whatever your parser currently builds and drops onto `self`
piece by piece, Lesson 5 will have it build one of these instead.

### Commands Needed

None new — `dataclasses` ships with Python itself; nothing to install.

### Run It

Real output, from an actual run of the complete file shown in this
unit's Updated Project, under a virtual display this session:

```
mainloop exited -- window closed
```

(As in Lesson 2's own finished example, the single line above is the
only printed output from the real, finished program — the `vars()`
inspection shown under Isolating It was lab-only scaffolding, not part
of the finished file.) A real screenshot taken before the simulated
click shows the original label text and a "Show invoice" button; a
second, taken after, shows the label reading "Acme Corp: $401.50" —
proof the data genuinely flows from `self.model` onto the screen.

### Connecting to What Came Before

The previous unit proved the cost of loose data on `self` is real but
invisible; this unit doesn't remove data from `self` — `self.model`
is still, honestly, an attribute on the app class, and that's fine —
it changes *what kind* of thing sits there: one single, purposeful
object instead of an unbounded, undifferentiated pile that grows one
loose attribute at a time, exactly the way your own real app's `self`
did.

---

## Connect the Pieces

Follow one single class, `App`, through everything this lesson built,
start to finish, and notice what each unit added *to* it versus what
each unit was careful *not* to add directly:

Concept Unit 1 turned `App` from a bare `ctk.CTk()` instance into a real
subclass — `super().__init__()` is the one line making sure everything
`CTk` itself needs still happens, proven, concretely, by watching a
version that skips it fail two lines later with a real
`RecursionError`, not at the point of the mistake itself. Concept Unit
2 put the first thing on `self` that belongs there without question —
`self.label`, a real widget, parented to `self` because, after Unit 1,
`self` genuinely *is* a valid parent. Concept Unit 3 put a second kind
of thing on `self`, in spirit rather than as a new attribute — a bound
method, `self.on_click`, reaching back into `self.label` — proven, with
a real `TypeError`, to depend on being reached *through an instance*
specifically, not through the bare class. Concept Unit 4 deliberately
broke the pattern the first two units built correctly, adding
`self.customer_name` and `self.invoice_total` directly, and then used a
real, inspected `vars(app)` to prove — not assert — that doing so makes
your own data indistinguishable from CustomTkinter's own internal
bookkeeping. Concept Unit 5 is the only unit in this lesson that removed
something rather than adding it: two loose attributes collapsed into
one, `self.model`, an instance of a class — `InvoiceData` — that has
never once imported `customtkinter` and never will. The finished
`App` still has exactly three things on `self` — `self.model`,
`self.label`, `self.button` — the same count of *concepts* as before
Unit 4 ever ran, because a data class and a widget are still two
genuinely different kinds of thing; what changed is that the code now
says so, every time either one is touched, instead of leaving you to
remember it yourself. This is, concretely and directly, the fix for the
exact problem you described your own app having.
