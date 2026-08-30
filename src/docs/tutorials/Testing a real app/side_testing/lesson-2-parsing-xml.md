# Lesson 2: Parsing Your Setup-Sheet XML into Objects

**Scope note, same as Lesson 1:** full CRC breakdowns and a lab for every
punctuation mark would make this unreadable. I kept problem-first,
isolate-before-real-use, and real executed output; I skipped CRC cards on
trivial things.

**New in this lesson, per your last request:** every code block now opens
with a one-line tag telling you exactly what it is:

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

or

> **→ goes in `setupsheet.py`** (or `test_setupsheet.py`)

If a block doesn't have one of those two tags, that's a bug in this
lesson — tell me and I'll fix it.

I trimmed your real XML down to two operations (1101, 1102) instead of
all four, purely so the file blocks below stay readable — the trimmed
copy is saved as `sample.xml` alongside the code, and it's your real
tags, real values, just fewer repeats of the same shape. Nothing about
the parsing logic changes with the full four-operation file; you'll
prove that yourself when you run it against your own copy.

## What you will build

A second parser, `setupsheet.py`, that turns your Mastercam XML report
into the same kind of validated object tree Lesson 1 built from the
toolpath text file — `SetupSheet` containing `Operation`s, each with an
optional `Tool`. Notice each `Operation` also carries an `nc_number`
(`"1101"`, `"1102"`, pulled out of `<NCFILE-SHORT>1101.NC</NCFILE-SHORT>`)
— that's not incidental. It's the same number as the `1101` folder name
from your toolpath file in Lesson 1. That shared number is the join key
you'll use in Lesson 3 to merge the two sources together.

## What you need to know first

Everything from Lesson 1 (`@dataclass`, `field(default_factory=...)`,
regex basics, the I/O-vs-logic split, error-collecting validation,
`pytest`). This lesson adds one new library: `xml.etree.ElementTree`.

## Terms used in this lesson

- **Element (XML)** — one tag in the parsed tree, along with its text
  content, attributes, and children. It exists as a distinct idea from
  "the tag's name" because one Element bundles the name, the text, and
  the whole subtree beneath it into one object you can navigate.
- **Element tree** — the whole document, once parsed, represented as a
  tree of `Element`s with one root at the top. It exists so "find the
  third `TOOL` inside the second `OPERATION`" is a navigation problem
  (walk the tree) rather than a text-searching problem (regex over raw
  XML text), which is far more fragile for a format this deeply nested.
- **Self-closing tag** — an XML tag with no separate closing tag and no
  text content, written `<TAG/>` (you have one of these in your real
  file: `<BACKPLOT/>`). It exists in the XML spec as shorthand for "this
  tag is present but holds nothing" — important to know about because a
  parser gives you an Element for it, but `.text` on that Element is
  `None`, not an empty string.

## Objects and methods used

- **`xml.etree.ElementTree.parse(filepath)`**
  *What it is:* a standard-library function that reads an XML file from
  disk and parses it into a tree structure.
  *Implementation:* returns an `ElementTree` object; call `.getroot()` on
  it to get the top-level `Element`.
  *Its use:* this is your file's actual I/O boundary — the one place this
  lesson's code touches disk, same role `open()` played in Lesson 1.
- **`xml.etree.ElementTree.fromstring(xml_text)`**
  *What it is:* the same parser, but taking XML already in memory as a
  string, rather than a file path.
  *Implementation:* returns the root `Element` directly (no `.getroot()`
  needed, since there's no `ElementTree` wrapper).
  *Its use:* every isolated lab below uses this — small XML strings typed
  right into the lab, no file needed to prove the concept.
- **`Element.find(tag)`**
  *What it is:* a method on any `Element` that searches its direct
  children for the first one matching a tag name.
  *Implementation:* returns the matching child `Element`, or `None` if
  none exists — it does not raise an exception on a miss.
  *Its use:* pulling out one specific field, like `<COMPANY>` or
  `<NAME>`, from whatever Element you're currently looking at.
- **`Element.findall(tag)`**
  *What it is:* the plural version of `find` — all matching direct
  children, not just the first.
  *Implementation:* returns a plain Python `list` of `Element`s (empty
  list, not `None`, if there are no matches).
  *Its use:* this is how repeated siblings — your file's many `<NCFILE>`
  blocks, one per operation — become a Python list you can loop over.
- **`Element.text`**
  *What it is:* not a method — a plain attribute holding the text content
  directly inside an Element, before any child tags.
  *Implementation:* a `str`, or `None` if the tag is empty/self-closing.
  *Its use:* the actual value you want, once `find` has located the right
  Element — `root.find("COMPANY").text` is "navigate to the tag, then
  read what's inside it," two separate steps.

---

## Concept Unit 1: Navigating a tree instead of scanning lines

### The Problem

Lesson 1's file was flat text, so "which line am I on" and "what does
this line mean" were the same question, answered line by line. XML isn't
line-oriented at all — `<COMPANY>My company name</COMPANY>` could be
written on one line or spread across five, and it wouldn't change what it
means. Given that, what does "find the value of `COMPANY`" actually
require, if not "look for a specific line"? What do you already know
about trees (parent, child, sibling) that might apply here?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
import xml.etree.ElementTree as ET

xml_text = "<PERSON><NAME>Alex</NAME><AGE>30</AGE></PERSON>"
root = ET.fromstring(xml_text)
print("root tag:", root.tag)
print("NAME element:", root.find("NAME"))
print("NAME text:", root.find("NAME").text)
print("missing element:", root.find("NOPE"))
```

Real output:

```
root tag: PERSON
NAME element: <Element 'NAME' at 0x7f7297f12ca0>
NAME text: Alex
missing element: None
```

This proves three things: `.tag` gives you the plain tag name as a
string; `.find("NAME")` returns an `Element` object (not the text itself
— note the weird `<Element 'NAME' at 0x...>` printout, that's the object,
not the value), and you need `.text` as a second step to get "Alex" out
of it; and critically, `.find()` on a tag that doesn't exist returns
`None` rather than raising an error — meaning `root.find("NOPE").text`
would crash with `AttributeError: 'NoneType' object has no attribute
'text'` if you forgot to check for `None` first. That last point matters
a lot for your real file, where not every `<OPERATION>` has every
possible sub-tag filled in.

This is called **tree navigation** via the `ElementTree` API.

### Discard the throwaway example

`PERSON`/`NAME`/`AGE` don't appear again.

### Project Change

- **Reference Source:** the `<COMPANY>`, `<DESCRIPTION>`, `<UNITS>` tags
  in your real XML, top level of `<SETUPSHEET>`.
- **Files affected:** new file, `setupsheet.py`.
- **Change type:** add.
- **Location:** top of the file.
- **Dependencies:** `xml.etree.ElementTree`, standard library.

### The New Code

> **→ goes in `setupsheet.py`**

```python
from dataclasses import dataclass, field
from typing import List, Optional
import xml.etree.ElementTree as ET

def text_of(element, tag):
    """find a child by tag and return its .text, or None if the child is missing."""
    child = element.find(tag)
    return child.text if child is not None else None
```

### The Updated Project

```python
1  from dataclasses import dataclass, field
2  from typing import List, Optional
3  import xml.etree.ElementTree as ET  # ← new
4
5  def text_of(element, tag):          # ← new
6      """find a child by tag and return its .text, or None if the child is missing."""  # ← new
7      child = element.find(tag)       # ← new
8      return child.text if child is not None else None  # ← new
```

### Mechanical walkthrough

- `import xml.etree.ElementTree as ET` — imports the standard-library XML
  module under a shorter alias, `ET`, purely so later code reads
  `ET.parse(...)` instead of the full module path every time.
- `text_of(element, tag)` — a small helper wrapping exactly the two-step
  "find, then read `.text`, guarding against `None`" pattern the lab just
  proved is necessary. This exists so every later piece of code that
  wants one field's text doesn't repeat the same `None`-check inline,
  the same motivation as pulling `parse_cpu`/`parse_ram` out as their own
  functions in Lesson 1.
- `element.find(tag)` — same call from the lab, generalized to work on
  whatever Element is passed in, not just a hardcoded `root`.
- `child.text if child is not None else None` — a conditional expression
  (an inline `if`/`else` that evaluates to a value): if `find` found
  something, return its text; otherwise, return `None` instead of
  crashing.

### CS lens

This is **defensive programming against a partial/incomplete tree** —
treating "this branch might not exist" as an expected, handled case
rather than an exceptional one. Also recognized in: optional-chaining
operators in newer languages (`obj?.field?.subfield` in JavaScript/C#,
doing exactly what `text_of` does by hand here), database queries over
nullable columns, and, closer to home, any of your real file's
`<OPERATION>` tags where a field like `<STOCK-TO-LEAVE>` sometimes holds
one number and sometimes two ("0.0" vs "0.0 0.01" in your real sample) —
inconsistent-but-real data is the norm, not the exception, in exported
files like this.

### SE lens

The alternative — writing `root.find("COMPANY").text` directly, every
place you need a field — works fine until the first field that's
actually missing in some real file, at which point it crashes with an
`AttributeError` that gives you no clue *which* field was the problem. A
wrapping helper costs one extra function and one extra level of
indirection, in exchange for every call site becoming safe by
construction, and, later, one place to change if you ever want missing
fields logged instead of silently returned as `None`.

### Run it

Output pasted above, from a real run.

### Connect

You can now safely pull one field's text out of any Element. Next: your
real file doesn't have one `<NCFILE>`, it has several — you need the
plural version of this idea.

---

## Concept Unit 2: Many siblings, one shape

### The Problem

Your real XML has four `<NCFILE>` elements, one per toolpath operation,
all direct children of `<SETUPSHEET>`. `find()` only gets you the
*first* match. Before reading on — given what `find` already does, what
would you guess the plural version is named, and what would you expect
it to return: another single Element, or something you can loop over?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
import xml.etree.ElementTree as ET

xml_text = "<ORDER><ITEM><SKU>A1</SKU></ITEM><ITEM><SKU>B2</SKU></ITEM><ITEM><SKU>C3</SKU></ITEM></ORDER>"
root = ET.fromstring(xml_text)
items = root.findall("ITEM")
print("count:", len(items))
for item in items:
    print(item.find("SKU").text)
```

Real output:

```
count: 3
A1
B2
C3
```

This proves `findall` returns a plain Python `list` of `Element`s — you
can call `len()` on it and loop over it with an ordinary `for`, exactly
like any other list, and each item in that list is itself a full
`Element` you can call `.find()` on again to reach *its* children. That
last part matters: `findall` only searches one level (direct children),
so getting `SKU` out of each `ITEM` still needs its own `.find("SKU")`
call per item, same as Concept Unit 1.

### Discard the throwaway example

`ORDER`/`ITEM`/`SKU` don't appear again.

### Project Change

- **Reference Source:** the four `<NCFILE>` elements, direct children of
  `<SETUPSHEET>`, in your real XML.
- **Files affected:** `setupsheet.py`, appended.
- **Change type:** add.
- **Location:** after `text_of`.
- **Dependencies:** none new.

### The New Code

> **→ goes in `setupsheet.py`**

```python
@dataclass
class Tool:
    number: Optional[int] = None
    name: Optional[str] = None
    diameter: Optional[float] = None
    tool_type: Optional[str] = None
    material: Optional[str] = None
    flutes: Optional[int] = None

@dataclass
class Operation:
    name: Optional[str] = None
    nc_number: Optional[str] = None
    depth: Optional[float] = None
    feedrate_ipm: Optional[float] = None
    spindle_rpm: Optional[float] = None
    tool: Optional[Tool] = None

@dataclass
class SetupSheet:
    company: Optional[str] = None
    description: Optional[str] = None
    units: Optional[str] = None
    operations: List[Operation] = field(default_factory=list)
```

### The Updated Project

```python
 1  def text_of(element, tag):
 2      child = element.find(tag)
 3      return child.text if child is not None else None
 4
 5  @dataclass
 6  class Tool:                                    # ← new
 7      number: Optional[int] = None               # ← new
 8      name: Optional[str] = None                 # ← new
 9      diameter: Optional[float] = None           # ← new
10      tool_type: Optional[str] = None            # ← new
11      material: Optional[str] = None             # ← new
12      flutes: Optional[int] = None                # ← new
13
14  @dataclass
15  class Operation:                               # ← new
16      name: Optional[str] = None                 # ← new
17      nc_number: Optional[str] = None            # ← new
18      depth: Optional[float] = None              # ← new
19      feedrate_ipm: Optional[float] = None       # ← new
20      spindle_rpm: Optional[float] = None        # ← new
21      tool: Optional[Tool] = None                # ← new
22
23  @dataclass
24  class SetupSheet:                              # ← new
25      company: Optional[str] = None              # ← new
26      description: Optional[str] = None          # ← new
27      units: Optional[str] = None                # ← new
28      operations: List[Operation] = field(default_factory=list)  # ← new
```

### Mechanical walkthrough

- `Tool` — mirrors your real `<TOOL>` block's fields (`NUMBER`, `NAME`,
  `DIAMETER`, `TYPE`, `MATERIAL`, `FLUTES`), same `Optional[...] = None`
  pattern as Lesson 1's `Server`, for the same reason: not yet parsed
  should be a valid, representable state.
- `Operation` — one field is new in kind, not just name: `tool:
  Optional[Tool] = None`. This is a dataclass field whose type is
  *another dataclass*, not a plain `str`/`int`/`float`. Nothing extra is
  needed to make this legal — a dataclass field can hold any type,
  including another dataclass — but it's worth naming explicitly: this is
  the same composition idea from Lesson 1's `Rack` holding `Server`s,
  just one object instead of a list of them.
- `nc_number: Optional[str] = None` — deliberately a plain field on
  `Operation`, not something read from inside `<OPERATION>` itself; your
  real file's `<NCFILE-SHORT>1101.NC</NCFILE-SHORT>` sits as a *sibling*
  of `<OPERATION>`, not inside it, which is exactly why this needs its
  own concept unit — extracting it is a slightly different shape of
  problem than reading `<NAME>` from directly inside `<OPERATION>`. That
  wiring happens in Concept Unit 3.
- `SetupSheet` — the top-level object, composing a `List[Operation]`,
  same `default_factory=list` reasoning as every list field so far.

### CS lens

Building a nested object structure whose shape mirrors the source
document's own nesting — element for element — is the core idea behind
**deserialization**: turning a serialized format (XML, JSON, YAML) back
into native language objects. Also recognized in: any ORM mapping
database rows to model objects, JSON API clients turning HTTP responses
into typed objects, and Lesson 1's own toolpath parser, which did the
identical thing for indentation-based nesting instead of tag-based
nesting.

### SE lens

You could skip the dataclasses entirely and just keep working with raw
`Element` objects everywhere, calling `.find(...).text` at the point you
need each value. That avoids writing three small classes — but it means
every later piece of code (validation, merging with Lesson 1's data)
has to know XML's own API and tag names directly, rather than working
with plain, typed, `Optional`-marked Python fields. The dataclasses are
a translation layer, paid for once here, that everything downstream gets
to ignore XML entirely.

### Run it

No output yet — these are plain data containers with nothing inside them
until Concept Unit 3 actually populates one.

### Connect

You now have shapes to fill. Next: the functions that actually walk your
real XML tree and build these objects.

---

## Concept Unit 3: Building the objects, tool number/unit stripping included

### The Problem

Two of your real fields aren't plain values — they're a number glued to a
unit: `<FEEDRATE>48.132 inch/min</FEEDRATE>`, `<SPINDLE-SPEED>4584
RPM</SPINDLE-SPEED>`. `Operation.feedrate_ipm` is typed as
`Optional[float]`, not `Optional[str]`. Given the regex skill from Lesson
1's `parse_cpu`/`parse_ram`, what pattern would pull just the leading
number out of a string like `"48.132 inch/min"`, ignoring everything
after it?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
import re
NUMBER_RE = re.compile(r'([\d.]+)')
for text in ["48.132 inch/min", "4584 RPM", "0.5", "no numbers here", None]:
    if text is None:
        print(repr(text), "-> None (guarded before regex)")
        continue
    m = NUMBER_RE.match(text.strip())
    print(repr(text), "->", float(m.group(1)) if m else None)
```

Real output:

```
'48.132 inch/min' -> 48.132
'4584 RPM' -> 4584.0
'0.5' -> 0.5
'no numbers here' -> None
None -> None (guarded before regex)
```

This proves `[\d.]+` (one or more of: a digit, or a literal `.`) matched
at the *start* of the string correctly stops at the space before "inch"
or "RPM," and correctly returns `None` — not a crash — for text with no
leading number at all. The explicit `if text is None` guard at the top
matters separately: `NUMBER_RE.match(None)` would crash with a `TypeError`
before the regex even ran, since `.match` expects a string, not `None` —
this is the exact same "guard before you trust the input" idea as
`text_of`'s `None` check in Concept Unit 1, just applied one layer
further into the pipeline.

### Discard the throwaway example

This standalone loop doesn't appear again — only the compiled
`NUMBER_RE` pattern and the guard-then-match shape carry forward.

### Project Change

- **Reference Source:** `<FEEDRATE>`, `<SPINDLE-SPEED>`, `<DIAMETER>`
  inside `<OPERATION>`/`<TOOL>` in your real XML; `<NCFILE-SHORT>` as a
  sibling of `<OPERATION>` inside each `<NCFILE>`.
- **Files affected:** `setupsheet.py`, appended.
- **Change type:** add.
- **Location:** after the three dataclasses from Concept Unit 2.
- **Dependencies:** `re`; the `Tool`/`Operation`/`SetupSheet` dataclasses;
  `text_of`.

### The New Code

> **→ goes in `setupsheet.py`**

```python
import re

NUMBER_RE = re.compile(r'([\d.]+)')

def parse_number(text):
    """'48.132 inch/min' -> 48.132 ; '4584 RPM' -> 4584.0 ; None-safe."""
    if text is None:
        return None
    m = NUMBER_RE.match(text.strip())
    return float(m.group(1)) if m else None


def parse_tool(tool_elem):
    if tool_elem is None:
        return None
    number_text = text_of(tool_elem, "NUMBER")
    flutes_text = text_of(tool_elem, "FLUTES")
    return Tool(
        number=int(number_text) if number_text else None,
        name=text_of(tool_elem, "NAME"),
        diameter=parse_number(text_of(tool_elem, "DIAMETER")),
        tool_type=text_of(tool_elem, "TYPE"),
        material=text_of(tool_elem, "MATERIAL"),
        flutes=int(flutes_text) if flutes_text else None,
    )

def parse_operation(ncfile_elem):
    op_elem = ncfile_elem.find("OPERATION")
    nc_short = text_of(ncfile_elem, "NCFILE-SHORT")
    nc_number = nc_short.split(".")[0] if nc_short else None
    return Operation(
        name=text_of(op_elem, "NAME"),
        nc_number=nc_number,
        depth=parse_number(text_of(op_elem, "DEPTH")),
        feedrate_ipm=parse_number(text_of(op_elem, "FEEDRATE")),
        spindle_rpm=parse_number(text_of(op_elem, "SPINDLE-SPEED")),
        tool=parse_tool(op_elem.find("TOOL")),
    )

def parse_setup_sheet(root):
    """Pure logic: an already-parsed Element tree in, a SetupSheet out."""
    sheet = SetupSheet(
        company=text_of(root, "COMPANY"),
        description=text_of(root, "DESCRIPTION"),
        units=text_of(root, "UNITS"),
    )
    for ncfile_elem in root.findall("NCFILE"):
        sheet.operations.append(parse_operation(ncfile_elem))
    return sheet

def parse_setup_sheet_file(filepath):
    """I/O boundary only."""
    tree = ET.parse(filepath)
    return parse_setup_sheet(tree.getroot())
```

### The Updated Project

```python
 1  @dataclass
 2  class SetupSheet:
 3      company: Optional[str] = None
 4      description: Optional[str] = None
 5      units: Optional[str] = None
 6      operations: List[Operation] = field(default_factory=list)
 7
 8  import re                                       # ← new
 9
10  NUMBER_RE = re.compile(r'([\d.]+)')              # ← new
11
12  def parse_number(text):                         # ← new
13      if text is None:                            # ← new
14          return None                              # ← new
15      m = NUMBER_RE.match(text.strip())            # ← new
16      return float(m.group(1)) if m else None      # ← new
```

(`parse_tool`, `parse_operation`, `parse_setup_sheet`, and
`parse_setup_sheet_file` are new, freestanding functions, shown in full
above — same "brand-new function, nothing to nest inside" exemption from
Lesson 1.)

### Mechanical walkthrough

- `re.compile(r'([\d.]+)')` — same mechanism as Lesson 1's `FIELD_RE`,
  compiled once at module load.
- `parse_number` — the guarded, reusable version of the lab above.
- `parse_tool(tool_elem)` — `if tool_elem is None: return None` at the
  top: if the `<TOOL>` element itself is missing (some operations in real
  CAM exports genuinely have none, like a pure move with no cutting tool),
  the whole function short-circuits rather than crashing three lines
  later on `text_of(None, "NUMBER")`.
- `number_text = text_of(tool_elem, "NUMBER")` then
  `int(number_text) if number_text else None` — this two-step shape
  (get the raw text, then convert-if-present) is deliberately explicit
  rather than trying to do it in one line, so a missing `<NUMBER>` tag
  produces `None` instead of `int(None)` crashing with `TypeError`.
- `Tool(number=..., name=..., ...)` — constructing the dataclass using
  keyword arguments, one per field, explicitly naming which value goes
  where rather than relying on positional order — safer here specifically
  because `Tool` has six fields, and getting the order wrong positionally
  would silently put a diameter where a flute count belongs.
- `parse_operation(ncfile_elem)` — `op_elem = ncfile_elem.find("OPERATION")`
  reaches one level down from the `<NCFILE>` element passed in;
  `nc_short.split(".")[0]` takes `"1101.NC"`, splits on the literal `.`
  into `["1101", "NC"]`, and keeps index `0` — the part before the
  extension. This is a plain `str` method, not a regex, because the shape
  here (split once on a fixed character) is simpler than what regex is
  for.
- `tool=parse_tool(op_elem.find("TOOL"))` — passes the *Element* (or
  `None`) straight into `parse_tool`, which is exactly why `parse_tool`
  was written to handle `None` itself, rather than checking for it here
  a second time.
- `parse_setup_sheet(root)` — builds the top-level `SetupSheet` first
  (mirroring Lesson 1's "build the container, then fill it as you walk"
  shape), then loops `root.findall("NCFILE")`, appending one `Operation`
  per sibling — this is the `findall` result from Concept Unit 2, now
  driving real object construction instead of just being printed.
- `parse_setup_sheet_file(filepath)` — the file's actual I/O boundary:
  `ET.parse(filepath)` touches disk; everything else in this unit is pure
  logic taking an already-built tree, same split as Lesson 1's
  `parse_text`/`parse_lines`.

### Execution trace

Tracing `parse_setup_sheet` over your real (trimmed) file's first
`<NCFILE>` block:

1. `root.findall("NCFILE")` returns a list of two `Element`s (your two
   trimmed operations). The loop begins with the first one.
2. `parse_operation(ncfile_elem)` is called on it.
   `op_elem = ncfile_elem.find("OPERATION")` finds the nested
   `<OPERATION>` block.
3. `nc_short = text_of(ncfile_elem, "NCFILE-SHORT")` reads
   `"1101.NC"`. `nc_short.split(".")` produces `["1101", "NC"]`;
   `[0]` keeps `"1101"`.
4. `depth=parse_number(text_of(op_elem, "DEPTH"))` — `text_of` reads
   `"0.0"`; `parse_number` matches `[\d.]+` against it, giving the float
   `0.0`.
5. `feedrate_ipm=parse_number(text_of(op_elem, "FEEDRATE"))` — reads
   `"48.132 inch/min"`; `parse_number` matches only the leading
   `"48.132"`, giving the float `48.132`. The `" inch/min"` suffix is
   simply never reached by `.match`, since `.match` only needs the
   *start* of the string to fit the pattern.
6. `tool=parse_tool(op_elem.find("TOOL"))` — `<TOOL>` is present, so
   `parse_tool` runs its own six `text_of`/`parse_number` calls,
   producing a fully-populated `Tool(number=1, name="0.5 Bull endmill",
   diameter=0.5, tool_type="Bull endmill", material="Carbide", flutes=5)`.
7. The resulting `Operation` is appended to `sheet.operations`; the loop
   repeats for the second `<NCFILE>` (`1102`), then ends.

### Real output from the full pipeline

Running `parse_setup_sheet_file` against your real (trimmed) `sample.xml`
and printing as JSON:

```
{
  "company": "My company name",
  "description": "PART NAME",
  "units": "Inch",
  "operations": [
    {
      "name": "1 - 2D High Speed (2D Dynamic Mill)",
      "nc_number": "1101",
      "depth": 0.0,
      "feedrate_ipm": 48.132,
      "spindle_rpm": 4584.0,
      "tool": {"number": 1, "name": "0.5 Bull endmill", "diameter": 0.5, "tool_type": "Bull endmill", "material": "Carbide", "flutes": 5}
    },
    {
      "name": "2 - Drill/Counterbore",
      "nc_number": "1102",
      "depth": 0.0,
      "feedrate_ipm": 7.9456,
      "spindle_rpm": 3178.0,
      "tool": {"number": 2, "name": ".3125 CT 1\"LOC", "diameter": 0.3125, "tool_type": "Drill", "material": "Carbide", "flutes": 1}
    }
  ]
}
```

(Reformatted for width; values copied verbatim from the real run.)

### CS lens

Splitting "get the raw string" from "convert it to the type I actually
want" is a small instance of **parsing as a pipeline of stages**, each
stage doing one narrow transformation (find → text → strip units →
convert type) rather than one function trying to do all four at once.
Also recognized in: compiler pipelines generally (lex → parse → typecheck
→ codegen, each a separate pass), and Lesson 1's own
recognize-then-dispatch structure.

### SE lens

You could inline all of this — one giant function reading every field
directly with no `parse_tool`/`parse_operation` split. That would work
for a file this size, but every one of the six `Tool` fields, and every
one of the five `Operation` fields, would then be a repeated four-line
"get text, guard `None`, convert type" block sitting inline, with no
name of its own — exactly the "massive function, 10s of near-identical
pieces" shape from your very first question about the toolpath file.
Splitting by *object being built* (one function per dataclass) keeps
each function's job nameable and independently testable, at the cost of
one more function to keep track of per object type.

### Run it

Real output pasted above.

### Connect

You now have a second, complete, independently-tested pipeline: XML file
in, `SetupSheet` tree out. It shares one deliberate thread with Lesson
1's toolpath parser — `nc_number` — which is exactly what the merge
lesson will use to line the two trees up.

---

## Concept Unit 4: Testing the XML pipeline

### The Problem

Same question as Lesson 1's Concept Unit 5, applied to a different
format: which of `parse_number`, `text_of`, `parse_tool`,
`parse_operation` need a real file to test, and which can be proven with
a tiny XML string typed directly into a test?

### The New Code

> **→ goes in `test_setupsheet.py`**

```python
import pytest
from setupsheet import parse_number, text_of, parse_tool, parse_operation, parse_setup_sheet
import xml.etree.ElementTree as ET

@pytest.mark.parametrize("text, expected", [
    ("48.132 inch/min", 48.132),
    ("4584 RPM", 4584.0),
    ("0.5", 0.5),
    ("no numbers here", None),
    (None, None),
])
def test_parse_number(text, expected):
    assert parse_number(text) == expected


def test_text_of_present_child():
    root = ET.fromstring("<A><B>hello</B></A>")
    assert text_of(root, "B") == "hello"

def test_text_of_missing_child_returns_none():
    root = ET.fromstring("<A><B>hello</B></A>")
    assert text_of(root, "NOPE") is None


MINI_TOOL_XML = """
<TOOL>
    <NUMBER>7</NUMBER>
    <NAME>Test Drill</NAME>
    <DIAMETER>0.25</DIAMETER>
    <TYPE>Drill</TYPE>
    <MATERIAL>Carbide</MATERIAL>
    <FLUTES>2</FLUTES>
</TOOL>
"""

def test_parse_tool_reads_all_fields():
    tool_elem = ET.fromstring(MINI_TOOL_XML)
    tool = parse_tool(tool_elem)
    assert tool.number == 7
    assert tool.name == "Test Drill"
    assert tool.diameter == 0.25
    assert tool.tool_type == "Drill"
    assert tool.flutes == 2

def test_parse_tool_handles_missing_element():
    assert parse_tool(None) is None


MINI_NCFILE_XML = """
<NCFILE>
    <NCFILE-SHORT>1103.NC</NCFILE-SHORT>
    <OPERATION>
        <NAME>Test Op</NAME>
        <DEPTH>1.5</DEPTH>
        <FEEDRATE>10.0 inch/min</FEEDRATE>
        <SPINDLE-SPEED>2000 RPM</SPINDLE-SPEED>
        <TOOL>
            <NUMBER>3</NUMBER>
            <NAME>Test Tool</NAME>
            <DIAMETER>0.25</DIAMETER>
            <TYPE>Flat endmill</TYPE>
            <MATERIAL>Carbide</MATERIAL>
            <FLUTES>4</FLUTES>
        </TOOL>
    </OPERATION>
</NCFILE>
"""

def test_parse_operation_extracts_nc_number_from_filename():
    ncfile_elem = ET.fromstring(MINI_NCFILE_XML)
    op = parse_operation(ncfile_elem)
    assert op.nc_number == "1103"
    assert op.depth == 1.5
    assert op.feedrate_ipm == 10.0
    assert op.spindle_rpm == 2000.0
    assert op.tool.number == 3


def test_full_pipeline_on_sample_xml():
    tree = ET.parse("sample.xml")
    sheet = parse_setup_sheet(tree.getroot())
    assert sheet.company == "My company name"
    assert len(sheet.operations) == 2
    assert sheet.operations[0].nc_number == "1101"
    assert sheet.operations[0].tool.name == "0.5 Bull endmill"
    assert sheet.operations[1].nc_number == "1102"
```

### Mechanical walkthrough

- `test_parse_number` — the exact table from the isolated lab, now
  running as real, permanent assertions instead of printed output you
  eyeball once.
- `test_text_of_present_child` / `test_text_of_missing_child_returns_none`
  — two minimal XML strings, one with the child present, one without,
  directly proving the `None`-guard branch from Concept Unit 1 actually
  fires, not just the happy path.
- `MINI_TOOL_XML` — a small, hand-written fixture (same role as Lesson
  1's `MINI_FILE`), used instead of your real file so `parse_tool`'s
  test doesn't depend on disk at all.
- `test_parse_tool_handles_missing_element` — directly tests the
  `if tool_elem is None: return None` guard from Concept Unit 3, calling
  `parse_tool(None)` on purpose.
- `MINI_NCFILE_XML` / `test_parse_operation_extracts_nc_number_from_filename`
  — proves the `"1103.NC"` → `"1103"` extraction specifically, since
  that's the one piece of `parse_operation` most likely to break silently
  (an unexpected filename shape, no `.NC` extension, etc.) without a test
  calling it out by name.
- `test_full_pipeline_on_sample_xml` — the golden test, same role as
  Lesson 1's: real (trimmed) file, through the real parser, asserting on
  a few representative facts rather than every field.

### Run it

Actually run with `python3 -m pytest test_setupsheet.py -v`. Real output:

```
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.1.1, pluggy-1.6.0
collecting ... collected 11 items

test_setupsheet.py::test_parse_number[48.132 inch/min-48.132] PASSED     [  9%]
test_setupsheet.py::test_parse_number[4584 RPM-4584.0] PASSED            [ 18%]
test_setupsheet.py::test_parse_number[0.5-0.5] PASSED                    [ 27%]
test_setupsheet.py::test_parse_number[no numbers here-None] PASSED       [ 36%]
test_setupsheet.py::test_parse_number[None-None] PASSED                  [ 45%]
test_setupsheet.py::test_text_of_present_child PASSED                    [ 54%]
test_setupsheet.py::test_text_of_missing_child_returns_none PASSED       [ 63%]
test_setupsheet.py::test_parse_tool_reads_all_fields PASSED              [ 72%]
test_setupsheet.py::test_parse_tool_handles_missing_element PASSED       [ 81%]
test_setupsheet.py::test_parse_operation_extracts_nc_number_from_filename PASSED [ 90%]
test_setupsheet.py::test_full_pipeline_on_sample_xml PASSED              [100%]

============================== 11 passed in 0.02s ==============================
```

### Connect

Both sources are now independently parsed, validated-shape objects with
full test coverage: Lesson 1's `Datacenter`-shaped toolpath tree (your
real analog: toolpath groups/operations), and this lesson's `SetupSheet`
tree, joined by `nc_number`. Lesson 3 is the merge: taking one
`Operation` from each side sharing the same `nc_number`, combining them
into one object, deciding what happens when they disagree, and validating
the merged result against your GUI's actual rules.

---

## Files for this lesson

`setupsheet.py` and `test_setupsheet.py` are attached, along with
`sample.xml` (your real tags and values, trimmed to two operations so the
lesson stays readable) — run `python3 -m pytest test_setupsheet.py -v`
yourself to see it pass on your machine too.
