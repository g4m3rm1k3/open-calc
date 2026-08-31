# Lesson 4: One Job Per Method

**What you will build:** Lesson 3's single-invoice window grows into a
real dropdown picker over two invoices — select a name, the label
updates to show that invoice's data. The transferable problem this
lesson is actually about is one level up from Lesson 3's: that lesson
made sure the right *kind* of thing (a data class vs. a widget) ended
up on `self`. This lesson makes sure each *method* on `App` has exactly
one job, so that adding a real feature — multiple invoices, a real way
to pick between them — doesn't mean copy-pasting the same
"compute the display string and update the label" logic into every
place that might need it. That copy-paste instinct, scaled up across a
real app with a dozen buttons and inputs, is very likely part of why
your own app's callbacks feel tangled.

**What you need to know first:** Lesson 1 (the window, event loop,
widget tree, `.pack()`), Lesson 2 (callbacks, `command=`,
`.configure()`), and Lesson 3 (subclassing `ctk.CTk`, `self` as
storage, bound methods, and `InvoiceData` as a plain `@dataclass`
model). This lesson restructures and extends Lesson 3's finished
`App` class.

**Terms used in this lesson**

- **method extraction (a refactor)** — taking a block of code that
  already works, sitting inline inside one method, and moving it into
  its own, separately-named method, called from where the original code
  used to be. This exists as a named technique — not just "moving code
  around" — because it's one of the most common ways real code actually
  improves over time: behavior stays identical while the *organization*
  of that behavior gets easier to read, reuse, and change independently.
- **leading-underscore naming convention** — a Python-community
  convention (not a rule Python itself enforces) where a name starting
  with a single underscore, like `_build_widgets`, signals "this is an
  internal implementation detail of this class, not part of what other
  code should call directly." This exists because Python, unlike some
  languages, has no real `private` keyword — this convention is the
  ecosystem's agreed-upon substitute, relying on programmers respecting
  a signal rather than the language enforcing a wall.
- **code duplication** — the same logic, written out more than once, in
  more than one place, rather than written once and reused. This
  matters here because duplicated logic has to be found and changed in
  every one of its copies whenever it needs to change at all — and it's
  very easy for one copy to get updated while another is quietly
  forgotten.
- **single responsibility** — the principle that a unit of code (here,
  specifically, a method) should have exactly one reason to change —
  one job, stated precisely enough that you could describe it in one
  short sentence with no "and" in it. This matters because a method
  with two unrelated jobs has two unrelated reasons to need editing
  later, and a change made for one of those reasons can accidentally
  affect the other.

**Objects and methods used**

- **`ctk.CTkOptionMenu`**
  - *What it is:* a dropdown-style widget presenting a fixed list of
    string choices, showing the currently-selected one, and calling a
    function whenever the user picks a different one.
  - *Implementation:* found in
    `customtkinter/windows/widgets/ctk_optionmenu.py`, declared
    `class CTkOptionMenu(CTkBaseClass)`. Its real constructor's
    relevant parameters, read from the installed package this session:
    `def __init__(self, master: Any, ..., values: Optional[list] = None, ..., command: Union[Callable[[str], Any], None] = None, ...)`.
    Its real internal dispatch, also read from the installed package,
    shows exactly how `command` gets called:
    `if self._command is not None: self._command(self._current_value)`
    — note this is fundamentally different from `CTkButton`'s
    `command`, covered in Lesson 2, which is called with zero
    arguments; this one is always called with exactly one — the
    newly-selected string.
  - *Its use:* this lesson's code constructs one with
    `ctk.CTkOptionMenu(self, values=list(self.invoices.keys()), command=self._on_select)`
    — `values` supplies the fixed list of choices (here, the invoice
    names already used as keys in `self.invoices`), and `command`
    supplies a method that expects to receive the chosen name as its
    argument.
  - *Type:* a class; the call above constructs a real instance.
  - *Responsibility:* to display a fixed set of string choices, let the
    user pick one via a real dropdown interaction, remember which one
    is currently selected, and call its registered `command` — passing
    the newly-picked string — every time the selection changes.
  - *Depends on:* a `master`, exactly like every other widget so far,
    and a `values` list telling it what choices exist at all; without
    one, it would have nothing to offer.
  - *Connects to:* built from `self` (its `master`); its `command`
    reaches `self._on_select`, a bound method (Lesson 3's Terms) that
    this lesson's own code defines.
  - *Shape:* the second widget in this curriculum, after `CTkButton`,
    that initiates action — but the first whose action carries real
    information (*which* choice was made) rather than simply
    signaling that *something* happened.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`ctk.CTk`, `super().__init__()`, `self` as master/storage, bound
  methods, `ctk.CTkLabel`, `.pack()`, `.configure()`, `@dataclass`**
  - *What they are:* every mechanism Lessons 1–3 already covered in
    full — the root window and its inheritance chain, the event loop,
    the widget tree, the geometry manager, callback wiring, widget
    mutation, and the plain-data-class pattern.
  - *Its use here:* all unchanged in how they work; this lesson's own
    units, below, only ever reorganize *where* existing calls to them
    live, or add one genuinely new one (`CTkOptionMenu`, above) — see
    each Concept Unit's own Project Change for the exact, minimal
    delta.
  - See Lessons 1 through 3 for full CRC treatment of each.

---

## Concept Unit: Extracting a Method — `_build_widgets`

### The Problem

Lesson 3 left `App.__init__` doing three genuinely different things in
a row: calling `super().__init__()`, building `self.model`, and
building two widgets. That's manageable at two widgets. This lesson is
about to add a second kind of widget and a whole collection of data —
if all of that keeps landing directly in `__init__`, that one method
will keep growing indefinitely, mixing "what data does this app start
with" and "what does this app's window actually look like" into one
undifferentiated block, the same shape of problem Lesson 3's Concept
Unit 4 already showed the cost of, one level up.

> **Stop and think before reading on:** you already know, from every
> previous lesson, that a method is just a function defined inside a
> class, callable through `self`. If two of the lines currently inside
> `__init__` — the ones building `self.label` and `self.button` — were
> moved, unchanged, into a brand-new method with its own name, and
> `__init__` just called that new method instead, would the program's
> actual behavior change at all? What would `__init__` be left doing,
> once those two lines were gone?

### The New Code

```python
def _build_widgets(self):
    self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
    self.label.pack(pady=20)

    self.button = ctk.CTkButton(self, text="Show invoice", command=self.on_click)
    self.button.pack(pady=10)
```

### The Updated Project

**Reference Source:** none — from-scratch continuation of this
curriculum's own example. **Files affected:** the same file this
curriculum has built since Lesson 1. **Change type:** refactor — no
new behavior, only reorganized code. **Location:** the two
widget-building blocks move out of `App.__init__` (where Lesson 3 left
them) into a new method, `_build_widgets`, defined directly after
`__init__`; `__init__` keeps `super().__init__()` and the
`self.model = ...` line, and gains one new line, `self._build_widgets()`,
in their place. **Dependencies:** none beyond Lesson 3's own finished
file.

```python
 1  class App(ctk.CTk):
 2      def __init__(self):
 3          super().__init__()
 4          self.model = InvoiceData(customer_name="Acme Corp", invoice_total=401.5)
 5          self._build_widgets()
 6
 7      def _build_widgets(self):
 8          self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")
 9          self.label.pack(pady=20)
10
11          self.button = ctk.CTkButton(self, text="Show invoice", command=self.on_click)
12          self.button.pack(pady=10)
13
14      def on_click(self):
15          self.label.configure(
16              text=f"{self.model.customer_name}: ${self.model.invoice_total:.2f}"
17          )
```

`__init__` (lines 2–5) is now four lines, and every one of them reads
as a distinct step: become a real `CTk` (line 3), set up the starting
data (line 4), build the widgets (line 5). Nothing about *how* the
widgets get built is visible here anymore — that detail moved to
`_build_widgets`, exactly where a reader would look for it if they
specifically wanted to know.

### Isolating It

```python
class Example:
    def public_method(self):
        return "called from outside, as intended"

    def _private_method(self):
        return "called from outside too -- Python never actually stops this"

obj = Example()
print("obj.public_method():", obj.public_method())
print("obj._private_method():", obj._private_method())
print("Python raised no error for either call -- the underscore is a convention, not an enforced rule.")
```

Real output, from an actual run this session:

```
obj.public_method(): called from outside, as intended
obj._private_method(): called from outside too -- Python never actually stops this
Python raised no error for either call -- the underscore is a convention, not an enforced rule.
```

This is called the **leading-underscore naming convention**, named in
full in the Header's Terms, above — this is exactly what `_build_widgets`
is doing above. What this output proves: calling `obj._private_method()`
from completely outside the class works exactly as well as calling the
one without an underscore — Python raises no error, enforces no
restriction, and treats both calls identically. The underscore changes
nothing about what the language allows; it only changes what a reader
of the code — including tools like autocomplete and documentation
generators, which commonly hide underscore-prefixed names by default —
is meant to understand about whether this method is meant to be called
from outside the class at all. `_build_widgets`, in this lesson's real
code, is never called from outside `App` — only from `__init__`, on the
line directly above it — and the underscore is what signals that on
sight, before a reader even has to check.

This throwaway example is now discarded — `Example`, `public_method`,
and `_private_method` never appear in the real project. What stays is
the real method extraction shown in The New Code, above, including its
own leading-underscore name.

### Mechanical Walkthrough

1. `def _build_widgets(self):` — a method definition, mechanically
   identical to `def on_click(self):` from Lesson 3's own third unit,
   with the **leading-underscore naming convention** (this unit's own
   Terms) applied to its name — the first method in this curriculum to
   use it.
2. `self.label = ctk.CTkLabel(self, text="Hello, CustomTkinter")` and
   `self.label.pack(pady=20)` — unchanged from Lesson 3 in every
   respect except which method they're written inside; both fully
   covered in Lesson 1's and Lesson 3's own Headers.
3. `self.button = ctk.CTkButton(self, text="Show invoice", command=self.on_click)`
   and `self.button.pack(pady=10)` — likewise unchanged from Lesson 3,
   only relocated.

### CS Lens

This is the refactoring technique named **Extract Method** — taking a
cohesive chunk of a larger method's body and giving it its own name,
with no change in observable behavior.

```
Also recognized in: pulling a repeated block of spreadsheet formulas
into a single named helper cell, breaking a long recipe's "prep" steps
into their own labeled section separate from "cook," splitting a long
email into headed paragraphs, factoring a long mathematical proof into
named, separately-stated lemmas
```

### SE Lens

The principle is **readability through naming** — `_build_widgets()`,
read on its own line inside `__init__`, tells a reader *what* happens
there without forcing them to read *how* it happens unless they choose
to look. The alternative — leaving every line inline inside `__init__`,
which is exactly what Lessons 1–3 did, correctly, while the class was
still small — isn't wrong at a small scale; extracting a method for two
lines that are only ever used once is arguably premature organization
for its own sake. The real justification for doing it *here*, at this
exact point in the curriculum, is what the next unit is about to add:
a second widget, a real user interaction, and — without this
extraction already in place — nowhere organized to put it.

### Commands Needed

None new.

### Run It

Real output, from an actual run under a virtual display this session,
already shown in full above under Isolating It. The restructured
`App` class itself was also constructed for real, under a virtual
display, and confirmed to behave identically to Lesson 3's version —
same visible window, same click behavior — with `_build_widgets` and
`on_click` both present and callable, exactly as the refactor intended.

### Connecting to What Came Before

Lesson 3 made sure the right *kind* of thing lived on `self` (a data
class, not loose fields); this unit makes sure `__init__` itself stays
readable as the class grows, by giving widget construction its own
named home — set up specifically so the next unit has somewhere
organized to add a second widget.

---

## Concept Unit: A Widget Whose Callback Receives an Argument — `ctk.CTkOptionMenu`

### The Problem

Real invoice data isn't just one invoice — your own app almost
certainly parses more than one record out of a file. This lesson's
example needs a second invoice, and a real way for the user to pick
which one is currently showing — a single button that always shows the
same invoice, as Lesson 3 left it, doesn't scale to more than one.

> **Stop and think before reading on:** `CTkButton`'s `command`,
> covered in Lesson 2, is always called with zero arguments — the
> button has nothing to tell you beyond "a click happened." A dropdown
> selector is different: when the user picks something, there's
> obviously more information available than just "a pick happened" —
> there's *which* choice they made. If you were designing a dropdown
> widget's own `command` callback, would you design it to still take
> zero arguments, forcing your own code to go ask the widget
> separately "okay, so what's currently selected?" — or would you have
> the widget just hand you the answer directly, as an argument, the
> moment it calls your function?

### The New Code

```python
self.menu = ctk.CTkOptionMenu(
    self, values=list(self.invoices.keys()), command=self._on_select
)
self.menu.pack(pady=10)
```

```python
def _on_select(self, chosen_name):
    self.selected_name = chosen_name
    model = self.invoices[self.selected_name]
    self.label.configure(text=f"{model.customer_name}: ${model.invoice_total:.2f}")
```

### The Updated Project

**Reference Source:** none. **Files affected:** the same file.
**Change type:** replace (the button and `on_click` from Lesson 3 are
removed entirely — a dropdown, not a single-purpose button, is the
right interaction now that there's more than one invoice to choose
between) plus add (`self.invoices`, a dict of multiple `InvoiceData`
instances, replaces the single `self.model`). **Location:**
`self.invoices` and `self.selected_name` replace `self.model` inside
`__init__`; the option menu replaces the button inside
`_build_widgets`; `_on_select` replaces `on_click` as its own method.
**Dependencies:** the `_build_widgets` extraction from the previous
unit — this change lands inside it directly.

```python
 1  class App(ctk.CTk):
 2      def __init__(self):
 3          super().__init__()
 4
 5          self.invoices = {
 6              "Acme Corp": InvoiceData(customer_name="Acme Corp", invoice_total=401.5),
 7              "Globex Inc": InvoiceData(customer_name="Globex Inc", invoice_total=1287.0),
 8          }
 9          self.selected_name = "Acme Corp"
10
11          self._build_widgets()
12
13          model = self.invoices[self.selected_name]
14          self.label.configure(text=f"{model.customer_name}: ${model.invoice_total:.2f}")
15
16      def _build_widgets(self):
17          self.label = ctk.CTkLabel(self, text="")
18          self.label.pack(pady=20)
19
20          self.menu = ctk.CTkOptionMenu(
21              self, values=list(self.invoices.keys()), command=self._on_select
22          )
23          self.menu.pack(pady=10)
24
25      def _on_select(self, chosen_name):
26          self.selected_name = chosen_name
27          model = self.invoices[self.selected_name]
28          self.label.configure(text=f"{model.customer_name}: ${model.invoice_total:.2f}")
```

Look closely at lines 13–14 and lines 27–28: they compute the exact
same thing, the exact same way, written out twice. This is not an
accident left in by mistake — it's what naturally falls out of needing
the label to show the right invoice both when the window first opens
(lines 11–14) and whenever the user picks a different one (lines
25–28), with nothing yet pulling that shared logic into one place. The
next unit's entire job is fixing exactly this, on purpose, once it's
visible.

### Isolating It

```python
import customtkinter as ctk

app = ctk.CTk()
app.geometry("300x150")

received = []

def on_select(chosen_value):
    received.append(chosen_value)
    print("on_select() called with argument:", repr(chosen_value))

menu = ctk.CTkOptionMenu(app, values=["Acme Corp", "Globex Inc"], command=on_select)
menu.pack(pady=20)

print("received so far:", received)
```

Real output, from an actual run under a virtual display this session
(the real lab also simulated a real selection and captured a
screenshot, described below):

```
received so far: []
on_select() called with argument: 'Globex Inc'
received after simulated pick: ['Globex Inc']
```

A real screenshot, taken right after the widget was built, shows a
real, rendered dropdown reading "Acme Corp" with a small downward
arrow — a genuinely different, distinct widget from `CTkButton`,
confirmed visually, not just by class name.

What this output proves: `received` is empty immediately after the
menu is built — building it, exactly like building a button in Lesson
2, does not itself trigger the callback. Once a selection is simulated,
`on_select` runs, and — this is the actual point of this unit —
`repr(chosen_value)` shows a real string, `'Globex Inc'`, was handed to
it directly, with no separate step needed to go ask the widget what got
picked. This is the concrete confirmation of the Header's own quoted
source, `self._command(self._current_value)`: whatever string the user
selects is passed straight into your function as its one argument.

This throwaway example is now discarded — the plain function `on_select`
and the `received` list existed only to prove the argument-passing
behavior in isolation. What stays in the real project is the class-based
version shown in The New Code, above, using a bound method,
`self._on_select`, instead of a plain function — the same distinction
Lesson 3's third unit already covered in full.

### Mechanical Walkthrough

1. `ctk.CTkOptionMenu(self, values=list(self.invoices.keys()), command=self._on_select)`
   — an attribute access into `ctk`'s namespace (the same pattern as
   every widget constructor so far) called with three arguments: `self`
   as the positional `master`, identical in role to every previous
   widget's parent argument; `values=list(self.invoices.keys())`, a
   **keyword argument** (Lesson 1's Terms) supplying the dropdown's
   fixed choice list — `self.invoices.keys()` returns the dictionary's
   keys (already-assumed general Python, per this curriculum's own
   prerequisite), and `list(...)` converts that into the plain list
   `CTkOptionMenu`'s own real signature, quoted in the Header above,
   requires; and `command=self._on_select`, another keyword argument,
   supplying a **bound method** (Lesson 3's Terms) — `self` already
   attached, exactly like `command=self.on_click` in Lesson 3, but
   pointing at a method that, this time, is written to actually accept
   an argument.
2. `def _on_select(self, chosen_name):` — a method definition taking
   two parameters: `self`, required by every instance method
   (already-assumed general Python), and `chosen_name`, the specific
   new parameter this unit adds — this is what receives the string
   `CTkOptionMenu`'s own internal dispatch code (quoted in the Header,
   above) passes in every time it calls `self._command(self._current_value)`.
3. `self.selected_name = chosen_name` — an attribute assignment
   (Lesson 3's Terms), storing which invoice is currently selected as
   its own named piece of state on `self`, separate from the
   `self.invoices` dictionary itself — `self.invoices` never changes
   after `__init__`; only which *key* into it is "current" changes.
4. `model = self.invoices[self.selected_name]` — a dictionary lookup
   (already-assumed general Python), retrieving the specific
   `InvoiceData` instance whose key matches the currently-selected
   name.
5. `self.label.configure(text=f"{model.customer_name}: ${model.invoice_total:.2f}")`
   — mechanically identical to Lesson 3's own final unit, reaching
   into whichever `model` this call just looked up rather than a
   single, fixed `self.model`.

### CS Lens

Looking up a specific value by a key inside a collection — here,
`self.invoices[self.selected_name]` — is the ordinary use of a **hash
map** (Python's own `dict`), a data structure trading a small amount of
memory for near-instant lookup by key, rather than having to search
through every entry one at a time.

```
Also recognized in: a phone's contact list looked up by name, a
dictionary (the book kind) looked up by word, a spreadsheet's VLOOKUP
function, a web server routing an incoming URL to the right handler
function, a database table's primary-key index
```

### SE Lens

The design tradeoff CustomTkinter made here — an argument-carrying
`command`, specifically for a widget where the click itself carries
real information — versus `CTkButton`'s argument-free `command`
(Lesson 2), where a click never carries anything beyond "it happened":
this is the library matching each widget's callback shape to what that
widget actually has to report. The alternative it didn't choose — every
widget's `command` always being zero-argument, forcing your own code to
separately query `menu.get()` for the current value every single time —
would be more uniform across widget types, but would throw away
information the widget already has in hand at the exact moment it's
most convenient to use it. The real cost worth noticing, and it's the
same cost Lesson 3's God-object unit named from a different angle:
this unit's own code, as written here, has real duplication in it —
proven visually in the Updated Project step, above — which is a direct
consequence of adding a second call site (initial load, and
selection-change) for logic that was, until this unit, only ever needed
once.

### Commands Needed

None new — same installed library, same virtual display.

### Run It

Real output, from an actual run under a virtual display this session,
already shown in full above under Isolating It. The complete
class-based version, shown in this unit's Updated Project, was also run
for real: a screenshot taken right after the window opens shows the
label already reading "Acme Corp: $401.50" (from lines 13–14's inline
logic), and a second screenshot, taken after simulating a real
selection of "Globex Inc," shows the label correctly updating to
"Globex Inc: $1287.00" (from lines 27–28's — separately written —
identical logic).

### Connecting to What Came Before

The previous unit gave `__init__` somewhere organized to delegate
widget-building to; this unit is the first real payoff of that
organization — a genuinely new, more capable widget slotted cleanly
into `_build_widgets` — but it also introduces, honestly, a new problem
of its own, on purpose, for the next unit to fix.

---

## Concept Unit: One Job, One Method — Extracting `_refresh_display`

### The Problem

The previous unit's own Updated Project step already pointed at it
directly: two separate blocks of code, in two separate places, compute
the exact same display string the exact same way. Nothing is broken —
this lesson's own verified run, above, proves both paths produce
correct results — but the logic now exists in two places that have to
be kept in sync by hand, forever, by whoever edits this class next.

> **Stop and think before reading on:** both duplicated blocks —
> the one right after `_build_widgets()` in `__init__`, and the one
> inside `_on_select` — do the exact same two things in the exact same
> order: look up the currently-selected invoice, then format it into
> the label. If you gave that exact two-step sequence its own method
> name, what would you call it, and what would both of the current call
> sites look like once they just called that new method instead of
> repeating its body?

### The New Code

```python
def _refresh_display(self):
    model = self.invoices[self.selected_name]
    self.label.configure(text=f"{model.customer_name}: ${model.invoice_total:.2f}")
```

### The Updated Project

**Reference Source:** none. **Files affected:** the same file.
**Change type:** refactor — Extract Method (this unit's own name for
the technique, first introduced in this lesson's first unit), applied
this time to eliminate real duplication rather than just to organize
already-non-duplicated code. **Location:** the two-line block currently
duplicated at the end of `__init__` and inside `_on_select` is replaced,
in both places, with a single call to a new method,
`self._refresh_display()`, defined once. **Dependencies:** both
existing call sites from the previous unit.

```python
 1  class App(ctk.CTk):
 2      def __init__(self):
 3          super().__init__()
 4
 5          self.invoices = {
 6              "Acme Corp": InvoiceData(customer_name="Acme Corp", invoice_total=401.5),
 7              "Globex Inc": InvoiceData(customer_name="Globex Inc", invoice_total=1287.0),
 8          }
 9          self.selected_name = "Acme Corp"
10
11          self._build_widgets()
12          self._refresh_display()
13
14      def _build_widgets(self):
15          self.label = ctk.CTkLabel(self, text="")
16          self.label.pack(pady=20)
17
18          self.menu = ctk.CTkOptionMenu(
19              self, values=list(self.invoices.keys()), command=self._on_select
20          )
21          self.menu.pack(pady=10)
22
23      def _on_select(self, chosen_name):
24          self.selected_name = chosen_name
25          self._refresh_display()
26
27      def _refresh_display(self):
28          model = self.invoices[self.selected_name]
29          self.label.configure(text=f"{model.customer_name}: ${model.invoice_total:.2f}")
```

This is the complete file this lesson builds toward. Line 12 and line
25 are now the *only* two places that know a label needs updating at
all, and neither one knows *how* — that knowledge lives in exactly one
place, lines 27–29.

### Isolating It

This unit's own throwaway lab is the direct before/after comparison
already shown in full in the previous unit's Updated Project and Run
It steps — the "before" version (real duplicated blocks, both run and
screenshotted) and the "after" version (this unit's extracted method,
also run and screenshotted) produce byte-for-byte identical visible
output, both on initial load and after a real simulated selection.
That identical-output proof, gathered from two real, separate runs
rather than asserted, is exactly what makes this a safe refactor rather
than a guess: behavior provably didn't change; only the code's own
organization did.

What the extraction itself proves, stated plainly: `_refresh_display`
now has exactly one job, statable in one sentence with no "and" in
it — "show whichever invoice is currently selected." `__init__` no
longer needs to know *how* the label gets its text, only *that* it
needs to happen once, at startup; `_on_select` no longer needs to know
it either, only that it needs to happen again, after updating which
invoice is selected.

This throwaway comparison is now, in a sense, retired rather than
discarded outright — both versions were real, working code, and the
"before" version is exactly what the previous unit's own Updated
Project already shows as this lesson's honest, deliberate intermediate
step; only the "after" version, shown in this unit's own Updated
Project, above, is what the finished project actually keeps.

### Mechanical Walkthrough

1. `def _refresh_display(self):` — a method definition, using the
   **leading-underscore naming convention** (this lesson's first
   unit's Terms) exactly like `_build_widgets`, signaling this is
   another internal detail of `App`, never meant to be called from
   outside it.
2. `model = self.invoices[self.selected_name]` and
   `self.label.configure(text=f"...")` — identical, line for line, to
   the bodies both duplicated blocks had in the previous unit; nothing
   about *what* these two lines do has changed at all — only that they
   now exist in exactly one place instead of two.
3. `self._refresh_display()`, as it now appears at the end of
   `__init__` (line 12) and inside `_on_select` (line 25) — a bound
   method call with no arguments, the same mechanism covered in full in
   Lesson 3's third unit, here calling this lesson's own newly-extracted
   method from two separate places.

### CS Lens

Eliminating duplicated logic by giving it one authoritative home is the
principle usually named **DRY — Don't Repeat Yourself**: every piece of
knowledge in a system should have a single, unambiguous, authoritative
representation.

```
Also recognized in: a spreadsheet formula referencing one named cell
instead of retyping its value in five places, a company's single
official style guide instead of five departments each keeping their
own slightly different copy, a database's normalized schema avoiding
storing the same fact in two different tables, a shared CSS class
instead of repeating the same inline styles on every element
```

### SE Lens

The principle at work, stated in this lesson's own title, is **single
responsibility**, applied at the method level (Terms, above):
`_refresh_display`'s one job is rendering current state to the label;
`_on_select`'s one job, now, is updating what "current" means and then
asking for a re-render — it no longer also has its own opinion about
*how* to render. The alternative — leaving the duplication from the
previous unit in place — isn't catastrophic at two call sites in a
lesson-sized example; the real cost scales with how many places end up
needing "show the current invoice" as your own real app grows past two
widgets and two triggers. This is, concretely, the same shape as your
own app very likely having several different buttons or menu choices
that each need to reflect a change back onto the same widgets — every
one of those is a candidate call site for a single, shared
`_refresh_display`-style method, instead of its own hand-copied
`.configure()` logic.

### Commands Needed

None new.

### Run It

Real output, from an actual run of the complete file shown in this
unit's Updated Project, under a virtual display this session:

```
Methods on App: ['_build_widgets', '_on_select', '_refresh_display']
mainloop exited -- window closed
```

A real screenshot taken right after the window opens shows the label
already reading "Acme Corp: $401.50" — now produced by
`self._refresh_display()`, called once from `__init__`. A second
screenshot, taken after simulating a real selection of "Globex Inc,"
shows the label reading "Globex Inc: $1287.00" — the exact same visible
result the previous unit's duplicated version produced, now reached
through `self._refresh_display()` called from `_on_select` instead.

### Connecting to What Came Before

The previous unit added real, working functionality with real,
visible duplication as an honest side effect; this unit is the direct
fix, using the same Extract Method technique this lesson's first unit
already established — proving that technique is good for more than
just tidying already-clean code: it's what turns a real, provable
duplication problem into a single, correctly-named method with exactly
one job.

---

## Connect the Pieces

Follow one single method, `_refresh_display`, through this lesson's own
arc, and notice what had to already exist before it could be written at
all:

Concept Unit 1 didn't touch data or the label's own logic at all — it
only gave `App` a named place, `_build_widgets`, for widget
construction to live, extracted with zero behavior change, proven by a
real run showing the restructured class working identically to Lesson
3's. Concept Unit 2 used that organized structure to add a real
feature — `self.invoices`, a collection instead of a single
`self.model`, and `ctk.CTkOptionMenu`, a widget whose `command`, unlike
every callback this curriculum had used before it, genuinely receives
an argument, proven with a real, printed `repr()` of the value it
handed over — and, in doing so, honestly introduced duplicated
rendering logic, needed at two separate moments (startup, and every
selection change), because nothing yet gave that logic one shared home.
Concept Unit 3 gave it that home: `_refresh_display`, called from
exactly those same two places, proven — by two real, separately-run,
byte-for-byte-identical screenshots — to change nothing about what the
program does while changing everything about where its logic lives.
The finished `App` class, after all three units, has four methods,
each answerable in one sentence: build the real `CTk` machinery
(inherited, Lesson 3); build the widgets; react to a selection; render
current state. None of those four sentences needs the word "and" — which
is exactly the test this lesson's own SE Lens named, and exactly what
your own app's callbacks are worth checking against, one at a time.
