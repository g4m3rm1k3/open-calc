# Lesson 5: Seeing the Numbers — a Scatter Plot

## What you will build

`datatools.py` gains a plotting step: a scatter plot of house size
against Lesson 4's predicted prices, saved as a real image file on
disk. Getting there introduces `matplotlib.pyplot`'s three most
load-bearing pieces — `scatter`, which places one point per pair of
values; `xlabel`/`ylabel`/`title`, which attach meaning to a plot that
would otherwise be unlabeled dots; and `savefig`, which turns an
in-memory plot into a real file a reader can actually open. The
transferable problem this lesson is actually about: `final_predictions`,
from Lesson 4, is four numbers sitting in a variable — correct, but
invisible; a relationship like "bigger houses predict higher prices"
is far easier to see in a picture than to read out of four raw
integers, and every later lesson touching real data will lean on that
same fact.

## What you need to know first

Lesson 1's `np.array`, and Lesson 4's `houses`, `weights`, `bias`, and
the resulting `final_predictions` array — this lesson plots that exact
array against house size, and assumes the vector-math that produced it
is already understood, not re-derived here.

## Terms used in this lesson

- **figure** — Matplotlib's term for the entire drawable canvas a plot
  is built on — axes, labels, title, and every plotted point together,
  as one unit. It exists as a concept because a single plotting
  session can, in principle, hold more than one such canvas at once (a
  grid of several subplots, for instance); "figure" is the name for
  one complete one, even in this lesson's case, where only one is ever
  built.
- **pyplot's implicit current figure** — `matplotlib.pyplot` (imported
  as `plt` in this lesson) keeps track of "the figure currently being
  built" behind the scenes, so that a sequence of calls like
  `plt.scatter(...)`, then `plt.xlabel(...)`, then `plt.title(...)`
  all apply to the *same* figure without any of them needing to be
  told which one — each call implicitly means "on whichever figure is
  currently active." It exists so that building a simple, single plot
  doesn't require explicitly creating and naming a figure object
  first; the cost of that convenience, covered in this lesson's SE
  Lens, is that "current figure" is a hidden, implicit reference,
  where more advanced Matplotlib code (not this lesson's own) makes it
  explicit instead.

## Objects and methods used

### `matplotlib.pyplot.scatter`

- **What it is:** a function in the `matplotlib.pyplot` module that
  draws one point per pair of `x`/`y` values onto the current figure.
- **Implementation:** `matplotlib.pyplot.scatter(x, y) ->
  matplotlib.collections.PathCollection`. `x` and `y` are two
  equal-length sequences (this lesson passes NumPy arrays); position
  `i` of `x` is paired with position `i` of `y` to place one point.
  The `PathCollection` it returns represents the drawn points
  themselves as a Matplotlib object, though this lesson never uses
  that return value directly.
- **Its use:** it's how this lesson turns two parallel arrays — house
  sizes and their predicted prices — into a visible picture of their
  relationship, instead of two lists of numbers read side by side.
- **Type:** a free function in the `matplotlib.pyplot` module, called
  through the `plt` alias, not a method on an object this lesson
  already holds a reference to.
- **Responsibility:** given two equal-length sequences of numbers, add
  one point per matched pair onto the pyplot module's current figure —
  it does not create a new figure itself if one doesn't already exist;
  pyplot creates one implicitly the first time any plotting function
  in this module is called, per the "current figure" concept defined
  under Terms, above.
- **Depends on:** two sequences of matching length; here, two NumPy
  arrays, `sizes` and `final_predictions`.
- **Connects to:** called first in this lesson's plotting sequence; the
  points it draws are what `xlabel`, `ylabel`, and `title`, called
  afterward, add context to, and what `savefig`, called last, writes
  to disk.
- **Shape:** part of `pyplot`'s core public interface — the same
  function every later lesson building a simple scatter plot from two
  arrays will call.

### `matplotlib.pyplot.xlabel` / `ylabel` / `title`

- **What it is:** three functions in `matplotlib.pyplot`, each adding
  one piece of text to the current figure — `xlabel` below the
  horizontal axis, `ylabel` beside the vertical axis, `title` above
  the whole plot.
- **Implementation:** `matplotlib.pyplot.xlabel(text) ->
  matplotlib.text.Text` (and identically shaped signatures for
  `ylabel` and `title`) — each takes a single string and returns a
  `Text` object representing the label itself, though, as with
  `scatter`'s return value, this lesson doesn't use that return value
  directly.
- **Its use:** it's how this lesson makes the scatter plot's two axes
  and overall subject legible to a reader who wasn't in the room when
  it was built — without these calls, a saved plot is just dots with
  numbers along two unlabeled edges.
- **Type:** three separate free functions in the `matplotlib.pyplot`
  module, called through the `plt` alias.
- **Responsibility:** each is responsible for exactly one piece of
  text, in one fixed position on the current figure — `xlabel` never
  touches the vertical axis, and `title` never touches either axis
  directly; there's no overlap between the three.
- **Depends on:** a string to display, and an already-existing current
  figure to attach that text to — here, the one `scatter` implicitly
  created moments before.
- **Connects to:** called directly after `scatter` in this lesson's
  own code, adding text to the same figure `scatter` just drew points
  onto; nothing consumes their `Text` return values further.
- **Shape:** part of `pyplot`'s core public interface, alongside
  `scatter` — the standard way any simple pyplot figure in this
  curriculum gets labeled.

### `matplotlib.pyplot.savefig`

- **What it is:** a function in `matplotlib.pyplot` that writes the
  current figure to an image file on disk.
- **Implementation:** `matplotlib.pyplot.savefig(fname) -> None`.
  `fname` is a file path; the image format is inferred from that
  path's extension — `.png` in this lesson.
- **Its use:** it's how this lesson turns an in-memory figure, which
  otherwise exists only for the duration of the running Python
  process, into a real file that persists after the program ends and
  can be opened, shared, or embedded elsewhere.
- **Type:** a free function in the `matplotlib.pyplot` module, called
  through the `plt` alias.
- **Responsibility:** render whatever is currently on the current
  figure — every point, label, and title added by earlier calls — into
  the image format matching the given file extension, and write that
  rendered image to the given path; it is not responsible for
  creating the figure's content itself, only for capturing whatever
  content already exists at the moment it's called.
- **Depends on:** an already-built current figure with something drawn
  on it, and a writable file path.
- **Connects to:** called last in this lesson's plotting sequence,
  after `scatter`, `xlabel`, `ylabel`, and `title` have all already
  added their content to the same current figure.
- **Shape:** part of `pyplot`'s core public interface — the standard
  way this curriculum turns a built figure into a real, inspectable
  file, rather than a plot that vanishes the moment the script ends.

---

## Concept Unit: Plotting Two Arrays Against Each Other

### The Problem

`final_predictions`, from Lesson 4, is a NumPy array of four numbers —
correct, and already proven correct in that lesson's own "Run It"
step, but read as a bare list of integers, it says nothing about how
those predictions relate to house size beyond what you can work out in
your head from four pairs of numbers. A relationship — "as size goes
up, does predicted price go up smoothly, in clumps, or not at all?" —
is exactly the kind of pattern eyes catch instantly in a picture and
strain to catch in a printed list.

Given two equal-length sequences — `sizes = np.array([1400, 1850, 900,
2200])` and `final_predictions = np.array([207000, 269000, 139000,
311000])` — and given that neither Python nor NumPy alone has ever
drawn anything onto your screen in this curriculum so far, what do you
think a function meant to "plot two sequences against each other"
would need as its inputs? Would one sequence be enough, or does
placing a point at a specific horizontal *and* vertical position
require exactly two, matched position by position?

### Isolated Example

```python
>>> import matplotlib.pyplot as plt
>>> plt.scatter([1, 2, 3], [10, 40, 20])
<matplotlib.collections.PathCollection object at 0x...>
>>> plt.savefig('example_scatter.png')
```

Run for real, this session:

```
>>> import matplotlib.pyplot as plt
>>> result = plt.scatter([1, 2, 3], [10, 40, 20])
>>> type(result)
<class 'matplotlib.collections.PathCollection'>
>>> plt.savefig('example_scatter.png')
```

This proves `plt.scatter` accepts two plain sequences directly — no
conversion to a NumPy array required first, though this lesson's own
real data already is one — and places one point per matched pair:
`(1, 10)`, `(2, 40)`, `(3, 20)`. Saving and viewing the actual file
confirms three points at exactly those coordinates, rising then
falling, matching the three `y` values `10, 40, 20` in order. This
`example_scatter.png` file and its plot are discarded now; they exist
only to prove `scatter` places one point per matched `x`/`y` pair, and
will not appear in the final `datatools.py` output.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from Lesson 4's end state.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended after `final_predictions = predictions +
  bias`, added in Lesson 4's third Concept Unit.
- **Dependencies:** the `matplotlib` package must be installed (see
  Commands, below); `houses` and `final_predictions`, both already
  built in Lesson 4.

### The New Code

```python
import matplotlib.pyplot as plt

sizes = houses[:, 0]
plt.scatter(sizes, final_predictions)
```

### The Updated Project

This is a self-contained addition to the file's growing script — a new
import at the top and three lines using data already built by Lesson
4 — so the new block, on its own, is:

```
1  import matplotlib.pyplot as plt
2
3  sizes = houses[:, 0]
4  plt.scatter(sizes, final_predictions)
```

As a whole, this block makes `pyplot` available under the name `plt`,
pulls the size column back out of `houses` using the column-slicing
syntax from Lesson 2, and plots it against Lesson 4's
`final_predictions` — one point per house, though nothing is saved to
a file yet.

### Mechanical Walkthrough

- **`import matplotlib.pyplot as plt`** — the `import` statement and
  `as` alias, both explained in full in Lesson 1 and, per the
  Repetition Rule, restated here: `import` loads the `pyplot` module's
  code, and `as plt` rebinds it to the shorter name `plt` — the same
  community-wide convention `np` is for NumPy and `pd` is for Pandas.
- **`houses[:, 0]`** — the column-slicing syntax explained in full in
  Lesson 2 and, per the Repetition Rule, restated here: a bare `:` in
  the row position selects every row, and `0` in the column position
  selects only the size column, returning a new one-dimensional array
  holding every house's size and none of its bedroom count.
- **`sizes = ...`** — assignment, already-familiar syntax, binding the
  name `sizes` to that extracted column.
- **`plt.scatter(sizes, final_predictions)`** — the function explained
  in full under Objects and methods, above, called with two
  equal-length arrays: `sizes` (four values) and `final_predictions`
  (also four values, built across Lesson 4's three Concept Units). It
  places one point per house, at horizontal position equal to that
  house's size and vertical position equal to that house's predicted
  price, onto pyplot's current figure — created implicitly by this
  being the first plotting call, per the "current figure" concept
  defined under Terms, above.

### CS Lens

Plotting one variable against another to look for a relationship
between them is the concrete visual form of a **correlation** —
whether, and how strongly, two quantities tend to move together. The
same underlying question — "does one thing changing predict the other
one changing" — recurs across a scientific experiment's own scatter
plots, an analyst's stock-price-versus-trading-volume chart, and,
directly ahead in the Hands-On Machine Learning book, an entire chapter
on exploring a dataset visually before ever training a model on it —
because a relationship a scatter plot makes obvious in seconds can take
much longer to notice from raw numbers alone.

### SE Lens

The alternative not chosen here is skipping the plot entirely and
inspecting `final_predictions` by printing it, the way every previous
lesson's "Run It" step already did. That's not wrong for four numbers
— this lesson's own earlier "Run It" steps did exactly that. It stops
scaling the moment a dataset has hundreds or thousands of rows: four
printed integers are readable at a glance, but a thousand printed
integers are not, while a thousand points on a scatter plot are still
just as readable as four — the human eye's ability to spot a pattern
in a picture doesn't degrade with more data the way reading a list of
raw numbers does. The cost being accepted is that a plot, unlike a
printed number, can't be copy-pasted into another program or compared
for exact equality the way `254000 == 254000` can — a plot is for a
human to look at, not for code to consume further.

### Commands Needed

If `import matplotlib.pyplot as plt` raises `ModuleNotFoundError: No
module named 'matplotlib'`, install it the same way NumPy and Pandas
were installed in earlier lessons:

```
pip install matplotlib
```

Success looks like a `Successfully installed matplotlib-<version>`
line with no red error text above it.

### Run It

Already run and shown above, under Isolated Example — `plt.scatter([1,
2, 3], [10, 40, 20])` really does return a `PathCollection`, and the
saved image really does show three points at `(1, 10)`, `(2, 40)`, and
`(3, 20)`. The New Code block itself builds a scatter plot from
`sizes` and `final_predictions` on pyplot's current figure, but
doesn't yet save or otherwise display anything — that comes in the
next two Concept Units.

### Connection

This unit placed four points on a figure that exists only in memory
so far — nothing labeled and nothing saved. The next unit adds
context to those same points before the following one turns the whole
figure into a real file.

---

## Concept Unit: Labeling the Plot

### The Problem

The scatter plot from the previous unit has four points at real
coordinates, but nothing on the figure itself says what either axis
means or what the plot is even showing — a reader seeing only the
saved image, with no access to the code that built it, would have no
way to know the horizontal axis is house size, the vertical axis is
predicted price, or what dataset this even is. Correct data plotted
without labels is barely more informative than the same data left as
four unlabeled numbers.

Given that `plt.xlabel(...)`, `plt.ylabel(...)`, and `plt.title(...)`
are three separate functions rather than one combined call, and given
that pyplot's own "current figure" concept — introduced under Terms,
above — means every pyplot call implicitly applies to whatever figure
is already active, what do you predict happens if these three calls
are made *after* `plt.scatter(...)` from the previous unit, in the
same script, with no figure explicitly passed to any of them? Do they
create three separate new figures, or add three pieces of text onto
the one figure `scatter` already started?

### Isolated Example

```python
>>> import matplotlib.pyplot as plt
>>> plt.scatter([1, 2, 3], [10, 40, 20])
>>> plt.xlabel('Trial number')
>>> plt.ylabel('Score')
>>> plt.title('Example Trial Results')
>>> plt.savefig('example_labeled.png')
```

Run for real, this session, and inspected visually after saving:
confirms all three text elements — an x-axis label reading "Trial
number," a y-axis label reading "Score," and a title reading "Example
Trial Results" — appear on the exact same figure as the three points
from the previous unit's isolated example, not on three separate,
empty figures. This proves pyplot's current-figure behavior: calling
`xlabel`, `ylabel`, and `title` with no figure argument applies each
one to whatever figure is already active — here, the one `scatter`
implicitly created. This `example_labeled.png` file and its plot are
discarded now; they exist only to prove labeling calls attach to the
current figure, and will not appear in the final `datatools.py`
output.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after `plt.scatter(sizes,
  final_predictions)`, added in the previous unit.
- **Dependencies:** the current figure already started by the previous
  unit's `plt.scatter(...)` call.

### The New Code

```python
plt.xlabel('Size (square feet)')
plt.ylabel('Predicted price (dollars)')
plt.title('Predicted House Price vs. Size')
```

### The Updated Project

`datatools.py`'s plotting block now reads, in full:

```
1  import matplotlib.pyplot as plt
2
3  sizes = houses[:, 0]
4  plt.scatter(sizes, final_predictions)
5  plt.xlabel('Size (square feet)')      # ← new
6  plt.ylabel('Predicted price (dollars)')  # ← new
7  plt.title('Predicted House Price vs. Size')  # ← new
```

As a whole, this block now produces a fully labeled scatter plot on
pyplot's current figure — four points, a labeled horizontal axis, a
labeled vertical axis, and a title — though the figure still exists
only in memory, not yet written to a file.

### Mechanical Walkthrough

- **`plt.xlabel('Size (square feet)')`** — the function explained in
  full under Objects and methods, above: given a string, it attaches
  that text below the horizontal axis of pyplot's current figure —
  the same figure `plt.scatter` implicitly created in the previous
  unit, confirmed by the isolated example proving these calls don't
  create separate figures of their own.
- **`plt.ylabel('Predicted price (dollars)')`** — the same function
  family, this time attaching text beside the vertical axis instead of
  below the horizontal one; otherwise identical in mechanism to
  `xlabel`.
- **`plt.title('Predicted House Price vs. Size')`** — the same
  function family again, attaching text above the entire figure rather
  than beside either individual axis.

### CS Lens

Attaching metadata — text describing what data means — directly
alongside the data itself, rather than leaving that meaning to live
only in a comment or a separate document, is the same underlying idea
as a **self-describing artifact**: something that carries enough
context to be understood on its own, without needing its original
creator or source code present. The same idea recurs in a CSV file's
own header row (naming what each column holds), an image file's EXIF
metadata (recording when and how a photo was taken), and a `DataFrame`
column's own name, from Lesson 3 — in every case, the artifact itself
carries the explanation, rather than requiring a separate reference to
make sense of it.

### SE Lens

The alternative not chosen here is leaving the plot from the previous
unit unlabeled — saving four dots on two bare, numbered axes with no
title. That version is less code, and for a plot you're looking at
immediately after writing it, in the same session, the missing labels
cost nothing, because the context is still fresh in your own memory.
That cost is deferred, not avoided: the moment this same image is
saved, shared, or looked at again days later, "which axis was size and
which was price" stops being something the image itself can answer,
and becomes a question only the original code — if it's even still
around — can settle. Three extra function calls now are the entire
price of never needing to ask that question of a saved image later.

### Commands Needed

None new.

### Run It

Already run and shown above, under Isolated Example. The New Code
block itself adds three text elements to the same figure the previous
unit's `scatter` call started, but — like that unit — produces no file
on disk yet; that's the final unit's job.

### Connection

This unit made the previous unit's four points legible on their own —
axes and a title, not just dots. The next unit turns that fully
labeled, in-memory figure into a real file that persists after the
script finishes running.

---

## Concept Unit: Saving the Figure to a File

### The Problem

Every plot built so far in this lesson exists only inside a running
Python process — the moment that process ends, without anything else
happening, the labeled scatter plot from the previous two units simply
disappears; there is no image anywhere on disk to open, attach to a
message, or look at again later. A figure that only exists in memory,
for the duration of one script run, isn't yet a deliverable — it's
just a step on the way to one.

Given that `np.array` earlier lessons introduced returns a value you
can hold in a variable, and given that `plt.scatter`, `plt.xlabel`,
`plt.ylabel`, and `plt.title` have all, so far, only modified pyplot's
current figure with no file appearing anywhere — what kind of function
call do you think is needed to actually produce a file on disk?
Would you expect it to need the whole figure's data passed in
explicitly as an argument, given everything so far has relied on
pyplot's own implicit "current figure" tracking instead — or would you
expect that same implicit tracking to carry over here too?

### Isolated Example

```python
>>> import matplotlib.pyplot as plt
>>> plt.scatter([1, 2], [3, 4])
>>> plt.savefig('proof.png')
```

Run for real, this session, then inspected on disk: a file named
`proof.png` actually exists after this call, at the path given, and
opening it shows the two plotted points — confirming `savefig`, like
`xlabel` and `title` before it, needs no figure passed in explicitly;
it captures whatever pyplot's current figure already holds, the same
implicit tracking every other call in this lesson has relied on. This
`proof.png` file and its plot are discarded now; they exist only to
prove `savefig` writes the current figure to a real file with no
figure argument required, and will not appear in the final
`datatools.py` output.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py` from the previous unit.
- **Files affected:** `datatools.py` — modified; `house_price_plot.png`
  — created (as output when the script is actually run, not as source
  code).
- **Change type:** add.
- **Location:** appended after `plt.title('Predicted House Price vs.
  Size')`, added in the previous unit — this is the very last line of
  the file.
- **Dependencies:** the fully labeled current figure built across this
  lesson's first two Concept Units.

### The New Code

```python
plt.savefig('house_price_plot.png')
```

### The Updated Project

`datatools.py`'s plotting block now reads, in full — its final state
for this lesson:

```
1  import matplotlib.pyplot as plt
2
3  sizes = houses[:, 0]
4  plt.scatter(sizes, final_predictions)
5  plt.xlabel('Size (square feet)')
6  plt.ylabel('Predicted price (dollars)')
7  plt.title('Predicted House Price vs. Size')
8  plt.savefig('house_price_plot.png')   # ← new
```

As a whole, this block now does everything this lesson set out to
build: plot house size against Lesson 4's predicted prices, label both
axes and the plot's title, and write the finished, fully labeled
figure to a real file, `house_price_plot.png`, that persists after the
script finishes running.

### Mechanical Walkthrough

- **`plt.savefig('house_price_plot.png')`** — the function explained
  in full under Objects and methods, above: given a file path ending
  in `.png`, it renders whatever pyplot's current figure currently
  holds — the four points from the first unit, and the three text
  labels from the second — into PNG image data, and writes that data
  to a new file at the given path, creating the file if it doesn't
  already exist or overwriting it if it does.

### CS Lens

Rendering an in-memory representation into a persistent file on disk
is an instance of **serialization** — converting a program's live,
in-memory state into a stored form that outlives the process that
created it. The same idea, applied to different kinds of data, recurs
in saving a `DataFrame` to a CSV file, saving a game's progress to a
save file, and compiling source code into a binary executable — in
every case, something that exists only transiently, inside a running
program, becomes something that survives after that program ends.

### SE Lens

The alternative not chosen here — and the more common one in an
interactive session rather than a saved script — is
`matplotlib.pyplot.show()`, which opens the current figure in an
on-screen window instead of writing it to a file. `show()` is the
right call when a human is sitting at the keyboard, watching the
script run, and wants to see the plot immediately; it produces no file
at all, and the plot disappears the moment that window is closed.
`savefig()` is the right call here specifically because `datatools.py`
is meant to be run and re-run as this curriculum grows, possibly with
no one watching it run at all — a saved file is inspectable after the
fact, attachable to a message, and reproducible on demand, none of
which an ephemeral on-screen window offers. The cost of `savefig()`
over `show()` is that nothing appears automatically; a reader has to
know to go open `house_price_plot.png` themselves after running the
script, rather than having the plot appear unprompted.

### Commands Needed

Running the finished script produces the image file directly:

```
python3 datatools.py
```

Success looks like the command completing with no error output, and a
new file named `house_price_plot.png` appearing in the same directory
`datatools.py` was run from.

### Run It

Run for real, this session, as the complete plotting block:

```python
import numpy as np
import matplotlib.pyplot as plt

houses = np.array([[1400, 3], [1850, 4], [900, 2], [2200, 4]])
weights = np.array([120, 8000])
bias = 15000
final_predictions = houses @ weights + bias

sizes = houses[:, 0]
plt.scatter(sizes, final_predictions)
plt.xlabel('Size (square feet)')
plt.ylabel('Predicted price (dollars)')
plt.title('Predicted House Price vs. Size')
plt.savefig('house_price_plot.png')
```

Running this produces a real `house_price_plot.png` file. Opened, it
shows four points rising from lower-left to upper-right — smaller
houses at lower predicted prices, larger houses at higher ones — a
labeled horizontal axis reading "Size (square feet)," a labeled
vertical axis reading "Predicted price (dollars)," and the title
"Predicted House Price vs. Size" above the plot.

### Connection

This unit turned the fully labeled figure built across this lesson's
first two units into a real, persistent file — completing the whole
sequence from "four raw numbers in a variable" to "a saved, labeled
picture of the relationship between them."

---

## Connect the Pieces

Follow the same house from Lessons 2 through 4 — size `1850`, `4`
bedrooms, final predicted price `269000` — through everything this
lesson built, start to finish:

1. `sizes = houses[:, 0]` pulls this house's size, `1850`, out of row
   `1` of `houses`, alongside every other house's size, into a new
   one-dimensional array — the same column-slicing operation from
   Lesson 2, reused here rather than re-derived.
2. `plt.scatter(sizes, final_predictions)` places one point for this
   house at horizontal position `1850` and vertical position `269000`
   — the same `269000` Lesson 4's own "Connect the Pieces" traced this
   exact house's prediction to.
3. `plt.xlabel(...)`, `plt.ylabel(...)`, and `plt.title(...)` add no
   new data about this house specifically — they apply once, to the
   whole figure — but they're what make this house's point
   interpretable at all to anyone looking at the saved image without
   the code that produced it: without them, `(1850, 269000)` would be
   a dot at an unlabeled position on an unlabeled axis.
4. `plt.savefig('house_price_plot.png')` writes this house's point,
   along with the other three, and every label, into a real file —
   the first artifact this entire curriculum has produced that exists
   independently of any running Python process at all.

Every number that reached this house's plotted point — its size, its
weighted feature total, its bias-adjusted prediction — was carried
forward, unchanged, from Lesson 2 through Lesson 4; this lesson's own
contribution was never new data, only making that already-computed
relationship visible.
