# Lesson 6: XML — Trees, Attributes, and Reading Without Loading Everything

**What you will build:** an `xml_source` module added to `recordkeeper`
with `load_contacts_xml`, `write_contacts_xml`, and a streaming
`iter_contacts_xml`, using the standard library's
`xml.etree.ElementTree` to convert `Contact` objects to and from a real
`data/contacts.xml` file. The transferable problem: XML represents a
record as a *tree* — elements nested inside elements, values that can
live as either attributes or child-element text — which is a genuinely
different, less rigid shape than JSON's dict/list mapping; and XML
files, unlike a single JSON value, are commonly processed as an
in-memory tree (DOM-style, via `ET.parse`) or as a live stream of
open/close events (via `ET.iterparse`), which is a real, load-bearing
choice this lesson makes concrete.

**What you need to know first:** Lesson 4 — `@dataclass`, `Contact`,
and the from-source conversion-function pattern (`contact_from_row` /
`contact_to_row`). Lesson 5 — `asdict`/keyword-unpacking as the same
pattern applied to JSON, and the streaming-vs-whole-load distinction
first raised for files in Lesson 1 and for buffered reads in Lesson 2.

**Terms used in this lesson**

- **Element** — a single XML tag, along with its attributes, its text
  content, and its own nested child elements. It exists as XML's one
  and only structural unit — every part of an XML document, from the
  root down, is built out of nested elements, unlike JSON's several
  distinct native shapes (object, array, string, number, ...).
- **Attribute** — a `name="value"` pair written inside an element's
  opening tag, such as `id="1"` in `<contact id="1">`. It exists as a
  second, separate place to put a value, alongside an element's own
  text content or child elements — a modeling choice XML offers that
  JSON has no direct equivalent for, since a JSON object has only one
  kind of "slot" (a key) for any value.
- **DOM-style parsing (whole-document)** — parsing that builds one
  complete, navigable in-memory tree representing the entire document
  before any of it is processed. It exists because having the whole
  structure available at once makes navigating freely — parent to
  child, sibling to sibling, back and forth — straightforward, at the
  cost of holding the entire document's tree in memory simultaneously.
- **Streaming (event-based) parsing** — parsing that reports each
  element's start and/or end as a live sequence of events while still
  reading through the document, without ever building the whole tree
  in memory at once. It exists for exactly the same reason Lesson 1's
  and Lesson 2's line-by-line and buffered file reading did: a
  document too large to comfortably hold in memory all at once can
  still be processed correctly, at the cost of never having the whole
  structure available to navigate freely.
- **Generator function (`yield`)** — a function that, instead of
  computing and returning one final value, produces a sequence of
  values one at a time, pausing after each `yield` until the next
  value is asked for. It exists to let one function definition describe
  a whole lazy sequence — the same "produce values on demand" idea
  Lesson 1 named as streaming, now as a reusable language construct
  rather than something only a file object does.

**Objects and methods used**

- **`xml.etree.ElementTree.parse`**
  - *What it is:* A function that reads an entire XML file and builds
    a complete in-memory tree of `Element` objects representing it.
  - *Implementation:* `ET.parse(path) -> an ElementTree`; call
    `.getroot()` on the result to get the document's top-level
    `Element`.
  - *Its use:* What `load_contacts_xml` uses to read the whole
    `contacts.xml` file at once, when there's no reason not to.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function; responsible for reading a well-formed
    XML file fully and building a navigable tree of `Element` objects
    from it, raising `ET.ParseError` for malformed XML; depends on a
    file path and a syntactically valid XML document at that path;
    called directly by `load_contacts_xml`, whose `.getroot()` result
    is walked with `.findall()`; shape is one path in, one
    `ElementTree` object out, wrapping one root `Element` and its
    entire nested tree.

- **`Element.findall` / `Element.find`**
  - *What they are:* Methods on an `Element` for locating its direct
    child elements matching a given tag name.
  - *Implementation:* `elem.findall(tag) -> list[Element]` (every
    matching direct child); `elem.find(tag) -> Element or None` (the
    first matching direct child, or `None` if there isn't one).
  - *Their use:* `root.findall("contact")` gets every `<contact>`
    element under the root; `contact_el.find("name")` (and similarly
    for `"email"`/`"notes"`) gets one specific named child of a single
    contact element.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Instance methods on `Element`; responsible for searching one
    element's direct children by tag name and returning either all
    matches or the first one; depend on an already-parsed `Element`
    tree already being in memory; called throughout
    `contact_from_element`; shape is a tag-name `str` in, either a
    `list[Element]` or a single `Element`-or-`None` out, never
    searching grandchildren or deeper.

- **`ET.iterparse`**
  - *What it is:* A function that parses an XML file incrementally,
    yielding `(event, element)` pairs as it encounters each element's
    start and/or end tag, rather than building one complete tree first.
  - *Implementation:* `ET.iterparse(path, events=(...)) -> an iterator
    of (event, element) tuples`; `events` selects which of `"start"`
    (opening-tag reached) and `"end"` (closing-tag reached, element and
    all its children fully parsed) to report; an element handed back on
    an `"end"` event is complete and safe to read fully.
  - *Its use:* What `iter_contacts_xml` uses to yield one `Contact` at a
    time from a file, without ever holding the whole document's tree in
    memory.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    standard-library function returning an iterator; responsible for
    reporting each element's start/end as it's reached during a single
    incremental read through the file, rather than after the whole file
    is read; depends on a file path and, again, well-formed XML;
    consumed by a `for event, elem in ...:` loop inside
    `iter_contacts_xml`; shape is one `(str, Element)` tuple per event,
    lazily, one at a time.

- **`Element.clear`**
  - *What it is:* A method that discards an element's attributes, text,
    and children, without removing the element from its parent.
  - *Implementation:* `elem.clear() -> None`; mutates `elem` in place.
  - *Its use:* Called on each fully-processed `<contact>` element
    inside `iter_contacts_xml`'s loop, right after that contact's data
    has already been extracted, so the element's memory can be freed
    even though `iterparse` still keeps a reference to the tree
    structure built so far.
  - *Type / Responsibility / Depends on / Connects to / Shape:* An
    instance method on `Element`; responsible for freeing one already-
    processed element's own content so it doesn't sit in memory for the
    rest of the parse; depends on the element already being fully
    built (only safe to call on an `"end"`-event element, one already
    known to be complete); called once per `<contact>` inside
    `iter_contacts_xml`, immediately after `contact_from_element` has
    already read everything it needs from that element; shape takes no
    arguments and returns `None` — its effect is entirely the mutation
    it performs.

---

## Concept Unit: A record as a tree, not a dict

### The Problem

`recordkeeper` has represented a contact as a flat dict (Lesson 3) and
a flat dataclass (Lesson 4) — one level, four named values, no
nesting. JSON (Lesson 5) mapped onto that shape almost directly: a JSON
object's keys became a dict's keys. XML has no single, obvious mapping
like that — an XML document is fundamentally a tree of nested elements,
and even a single contact's own `id` can legitimately be represented
two different ways: as an attribute on the `<contact>` tag itself, or
as a separate child element with its own text, with nothing in XML
itself forcing one choice over the other.

> **Stop and think:** If `<contact id="1"><name>Alice</name></contact>`
> and `<contact><id>1</id><name>Alice</name></contact>` can both
> represent the same logical contact, what does that tell you about
> what "parsing XML" actually has to do, compared to `json.loads` -
> which always produces one, single, predictable Python shape for a
> given JSON value? Would a single, generic `xml_to_dict` function
> work as directly here as `json.loads` did for JSON?

### Introduce the concept in isolation

```python
import xml.etree.ElementTree as ET

root = ET.Element("contacts")
c1 = ET.SubElement(root, "contact", id="1")
ET.SubElement(c1, "name").text = "Alice Smith"
ET.SubElement(c1, "email").text = "alice@example.com"
ET.SubElement(c1, "notes").text = "Prefers email, not calls"

c2 = ET.SubElement(root, "contact", id="2")
ET.SubElement(c2, "name").text = "Bob Lee"
ET.SubElement(c2, "email").text = "bob@example.com"
ET.SubElement(c2, "notes").text = "Referred by Alice\nFollow up in June"

tree = ET.ElementTree(root)
ET.indent(tree, space="  ")
tree.write("scratch_contacts.xml", encoding="utf-8", xml_declaration=True)

with open("scratch_contacts.xml", encoding="utf-8") as f:
    print(f.read())

tree2 = ET.parse("scratch_contacts.xml")
root2 = tree2.getroot()
for contact_el in root2.findall("contact"):
    cid = contact_el.attrib["id"]
    name = contact_el.find("name").text
    email = contact_el.find("email").text
    notes = contact_el.find("notes").text
    print(cid, name, email, repr(notes))

bad_xml = '<contacts><contact id="1"><name>Alice</contact></contacts>'
try:
    ET.fromstring(bad_xml)
except ET.ParseError as e:
    print(f"{type(e).__name__}:", e)
```

Real output:

```
<?xml version='1.0' encoding='utf-8'?>
<contacts>
  <contact id="1">
    <name>Alice Smith</name>
    <email>alice@example.com</email>
    <notes>Prefers email, not calls</notes>
  </contact>
  <contact id="2">
    <name>Bob Lee</name>
    <email>bob@example.com</email>
    <notes>Referred by Alice
Follow up in June</notes>
  </contact>
</contacts>
1 Alice Smith alice@example.com 'Prefers email, not calls'
2 Bob Lee bob@example.com 'Referred by Alice\nFollow up in June'
ParseError: mismatched tag: line 1, column 39
```

This one document uses *both* of XML's ways to attach a value: `id` is
an attribute, read back with `contact_el.attrib["id"]`, while `name`,
`email`, and `notes` are child elements, each read back with
`.find(tag).text`. Getting a specific value back out means knowing, in
advance, which of those two places it lives — unlike `json.loads`,
which needed no such per-field knowledge to produce a usable Python
value. The `ParseError` at the end shows XML's own different failure
mode from Lesson 5's `json.JSONDecodeError`: this document's `<name>`
tag was opened but closed with `</contact>` instead of `</name>` — a
**mismatched tag** — and `ET.fromstring` catches that structural
mismatch specifically, naming it in the error rather than producing
any output at all.

### Discard the throwaway example

`scratch_contacts.xml` and this lab's code are discarded; they exist to
show both of XML's value-placement styles together, and one concrete,
real parse failure.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — new file `recordkeeper/ingest/xml_source.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `xml.etree.ElementTree` (standard library),
  `recordkeeper.models.Contact` (Lesson 4).

### The New Code

```python
import xml.etree.ElementTree as ET

from recordkeeper.models import Contact


def contact_from_element(elem):
    return Contact(
        id=elem.attrib["id"],
        name=elem.find("name").text,
        email=elem.find("email").text,
        notes=elem.find("notes").text,
    )
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`import xml.etree.ElementTree as ET`** — an import with an alias:
  brings the standard library's `xml.etree.ElementTree` module into
  scope under the shorter local name `ET`, so every reference below it
  can write `ET.something` instead of the full module path.
- **`from recordkeeper.models import Contact`** — the same import
  pattern used in `csv_source.py` (Lesson 4) and `json_source.py`
  (Lesson 5), bringing `Contact` into scope here too.
- **`def contact_from_element(elem):`** — a function definition, the
  same conversion-function pattern as `contact_from_row` (Lesson 4)
  and the reconstruction step in `contacts_from_json` (Lesson 5), this
  time converting from an `Element` instead of a dict.
- **`elem.attrib["id"]`** — full treatment of attribute access above,
  in Terms; `elem.attrib` is a dict-like mapping of this specific
  element's own attributes, and `["id"]` looks up the attribute named
  `id` on it directly — a plain dict-style key lookup, not a method
  call.
- **`elem.find("name").text`, `.find("email").text`, `.find("notes").text`**
  — full treatment of `Element.find` above, in Objects and methods
  used; each call locates one specific direct child element by tag
  name and reads `.text` — the text content sitting between that
  child's opening and closing tags.

### CS lens

Choosing between an attribute and a child element to represent the
same logical value is a real, human design decision XML leaves open —
an instance of a format offering more than one **structural
representation** for equivalent data, unlike a format whose grammar
pins each kind of value to exactly one shape.

```
Also recognized in: relational databases choosing a normalized
multi-table schema vs. a single wide table for the same data,
HTTP APIs choosing a resource's ID as part of the URL path vs. a query
parameter, configuration formats offering both inline and referenced
("include") styles for the same setting
```

### SE lens

The alternative not chosen for `recordkeeper`'s own `contacts.xml` is
representing every value — including `id` — as a child element instead
of mixing attributes and child elements. That would be more uniform,
and arguably easier for a generic tool to walk without special-casing
which fields are attributes. The actual tradeoff is idiomatic
convention, not correctness: a short, single, identifying value (an ID)
is commonly modeled as an attribute in real-world XML, while free-form
or potentially-multi-line content (like `notes`) is commonly modeled as
element text, partly because XML attribute values can't contain a
literal newline the way `notes` needs to. Mixing both styles here
matches that common convention rather than fighting it, at the cost of
`contact_from_element` needing to know, field by field, which access
pattern applies to which one — exactly the knowledge `json.loads`
never required.

### Commands needed

None new.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

This unit shows that reading an XML value means already knowing
whether it's an attribute or a child element's text, and gives
`contact_from_element` that knowledge for each of `Contact`'s four
fields — the next unit adds the reverse direction and finishes the
module, then turns to *how* a whole file gets read: all at once, or as
a stream.

---

## Concept Unit: Writing XML back out, and reading it two different ways

### The Problem

`load_contacts_xml`, once finished, will call `ET.parse` — full
treatment above — which reads and builds the *entire* document's tree
before `contact_from_element` ever runs on a single contact. For a
three-contact file that's irrelevant. Lesson 1 and Lesson 2 already
established that "read the whole thing first" has a real memory cost
proportional to input size; nothing so far in this lesson has shown
whether XML has an equivalent to the line-by-line, streamed reading
those lessons used for text files.

> **Stop and think:** `ET.parse` needs the whole file to build one
> complete, navigable tree. If a caller only ever wants to process one
> `<contact>` at a time, and never needs to jump back and forth between
> different contacts, what would it take for a parser to hand back each
> `<contact>` as soon as its own closing tag is reached — without first
> finishing the entire rest of the file?

### Introduce the concept in isolation

First, in isolation, the language construct `iter_contacts_xml` will
need — a generator function — before seeing it applied to XML at all:

```python
def count_up_to(n):
    for i in range(1, n + 1):
        yield i

gen = count_up_to(3)
print("type(gen) ->", type(gen))
print("next(gen) ->", next(gen))
print("next(gen) ->", next(gen))
print("next(gen) ->", next(gen))
try:
    next(gen)
except StopIteration:
    print("next(gen) -> raised StopIteration: generator is exhausted")

print("list(count_up_to(3)) ->", list(count_up_to(3)))
```

Real output:

```
type(gen) -> <class 'generator'>
next(gen) -> 1
next(gen) -> 2
next(gen) -> 3
next(gen) -> raised StopIteration: generator is exhausted
list(count_up_to(3)) -> [1, 2, 3]
```

Calling `count_up_to(3)` doesn't run the function's body at all yet —
it returns a `generator` object. Each `next(gen)` call resumes the
function from wherever it last paused, runs until the next `yield`,
and returns that value; the function's own local state (here, `i`'s
current value in the `for` loop) is preserved across those pauses. The
fourth `next(gen)` call finds nothing left to `yield` and raises
`StopIteration` — the exact same signal Lesson 1's file-object
iteration protocol uses internally when a file is exhausted, proving
this is the same underlying mechanism, not a separate one. This
construct is called a **generator function**, named here in full: any
function containing `yield` becomes one, automatically, the moment
`yield` appears anywhere in its body.

Now, the DOM-vs-streaming contrast itself, against the real
`scratch_contacts.xml` from the previous unit:

```python
tree = ET.parse("scratch_contacts.xml")
root = tree.getroot()
print("ET.parse: whole tree already in memory, type:", type(root), "children:", len(root))

for event, elem in ET.iterparse("scratch_contacts.xml", events=("start", "end")):
    print(event, elem.tag)
    if event == "end" and elem.tag == "contact":
        cid = elem.attrib["id"]
        name = elem.find("name").text
        print(f"  -> processed contact {cid}: {name}, then clearing it")
        elem.clear()
```

Real output:

```
ET.parse: whole tree already in memory, type: <class 'xml.etree.ElementTree.Element'> children: 2
start contacts
start contact
start name
end name
start email
end email
start notes
end notes
end contact
  -> processed contact 1: Alice Smith, then clearing it
start contact
start name
end name
start email
end email
start notes
end notes
end contact
  -> processed contact 2: Bob Lee, then clearing it
end contacts
```

`ET.parse`'s result already has both `<contact>` children accessible
via `len(root)` the instant the call returns — the whole tree exists at
once. `ET.iterparse`, by contrast, reports a real, live sequence of
`start`/`end` events as it works through the file, in document order:
every element gets a `start` event when its opening tag is reached and
an `end` event once its closing tag — and everything nested inside
it — has been fully parsed. The code only acts on `"end"` events for
`<contact>` specifically, because only then is that contact's full
data (its `id` attribute, its `name`/`email`/`notes` children)
guaranteed complete; calling `elem.clear()` right after processing each
one frees that contact's content before the next one is even reached,
which is exactly what keeps this approach's memory use from growing
with the file's size.

### Discard the throwaway example

`count_up_to` and this unit's own DOM-vs-streaming lab code are
discarded; the `yield`-based pattern they prove carries forward into
`iter_contacts_xml` below.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/ingest/xml_source.py` (modified,
  completing the module); new sample data file `data/contacts.xml`.
- **Change type** — add (finishing `contact_to_element`,
  `load_contacts_xml`, `write_contacts_xml`, and `iter_contacts_xml`).
- **Location** — after `contact_from_element`, already added in the
  previous unit.
- **Dependencies** — none new.

### The New Code

```python
def contact_to_element(contact):
    elem = ET.Element("contact", id=contact.id)
    ET.SubElement(elem, "name").text = contact.name
    ET.SubElement(elem, "email").text = contact.email
    ET.SubElement(elem, "notes").text = contact.notes
    return elem


def load_contacts_xml(path):
    tree = ET.parse(path)
    root = tree.getroot()
    return [contact_from_element(el) for el in root.findall("contact")]


def write_contacts_xml(path, contacts):
    root = ET.Element("contacts")
    for contact in contacts:
        root.append(contact_to_element(contact))
    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    tree.write(path, encoding="utf-8", xml_declaration=True)


def iter_contacts_xml(path):
    for event, elem in ET.iterparse(path, events=("end",)):
        if elem.tag == "contact":
            yield contact_from_element(elem)
            elem.clear()
```

### The Updated Project

```python
 1  import xml.etree.ElementTree as ET
 2
 3  from recordkeeper.models import Contact
 4
 5
 6  def contact_from_element(elem):
 7      return Contact(
 8          id=elem.attrib["id"],
 9          name=elem.find("name").text,
10          email=elem.find("email").text,
11          notes=elem.find("notes").text,
12      )
13
14
15  def contact_to_element(contact):                          # ← new
16      elem = ET.Element("contact", id=contact.id)            # ← new
17      ET.SubElement(elem, "name").text = contact.name        # ← new
18      ET.SubElement(elem, "email").text = contact.email      # ← new
19      ET.SubElement(elem, "notes").text = contact.notes      # ← new
20      return elem                                            # ← new
21
22
23  def load_contacts_xml(path):                               # ← new
24      tree = ET.parse(path)                                  # ← new
25      root = tree.getroot()                                  # ← new
26      return [contact_from_element(el) for el in root.findall("contact")]  # ← new
27
28
29  def write_contacts_xml(path, contacts):                    # ← new
30      root = ET.Element("contacts")                          # ← new
31      for contact in contacts:                                # ← new
32          root.append(contact_to_element(contact))            # ← new
33      tree = ET.ElementTree(root)                             # ← new
34      ET.indent(tree, space="  ")                             # ← new
35      tree.write(path, encoding="utf-8", xml_declaration=True)  # ← new
36
37
38  def iter_contacts_xml(path):                                # ← new
39      for event, elem in ET.iterparse(path, events=("end",)):  # ← new
40          if elem.tag == "contact":                           # ← new
41              yield contact_from_element(elem)                # ← new
42              elem.clear()                                    # ← new
```

The module now offers three ways to get `Contact` data in or out of
XML: `write_contacts_xml` builds a fresh tree from a list of `Contact`
objects and writes it, `load_contacts_xml` reads a whole file into
memory via `ET.parse` and converts every `<contact>` at once, and
`iter_contacts_xml` — a generator function, per this unit's own
isolated lab — yields one `Contact` at a time via `ET.iterparse`,
never holding the full document tree in memory, clearing each
`<contact>` element immediately after converting it.

### Mechanical walkthrough

- **`ET.Element("contact", id=contact.id)`** — constructs a new,
  standalone `Element` with tag `"contact"` and one attribute, `id`,
  set from `contact.id`; keyword arguments to `ET.Element` beyond the
  tag name become that element's attributes directly.
- **`ET.SubElement(elem, "name").text = contact.name`** — `ET.SubElement`
  creates a new child element under `elem` with the given tag and
  returns it; `.text = ...` then sets that new child's text content —
  this one line both creates the `<name>` child and fills in its text
  in a single expression.
- **`root.findall("contact")`** — full treatment of `Element.findall`
  above; here applied to the whole document's root, gathering every
  top-level `<contact>` element.
- **`ET.indent(tree, space="  ")`** — reformats the tree's whitespace
  in place so `.write()` produces human-readable, indented XML rather
  than one unbroken line; purely cosmetic, affecting only how the
  output looks on disk, not the data it represents.
- **`tree.write(path, encoding="utf-8", xml_declaration=True)`** —
  writes the tree to `path` as real XML text, with `xml_declaration=True`
  producing the `<?xml version='1.0' encoding='utf-8'?>` line seen at
  the top of this lesson's own sample output.
- **`for event, elem in ET.iterparse(path, events=("end",)):`** — full
  treatment of `ET.iterparse` above; here requesting only `"end"`
  events, since `iter_contacts_xml` only ever needs a `<contact>` once
  it's fully parsed, never partway through.
- **`yield contact_from_element(elem)`** — full treatment of `yield`
  above, in this unit's own isolated lab; produces one `Contact` and
  pauses `iter_contacts_xml` right here until the next value is asked
  for.
- **`elem.clear()`** — full treatment above, in Objects and methods
  used; called immediately after `contact_from_element` has already
  extracted everything needed from `elem`, freeing that element's
  content before the loop moves on to the next one.

### CS lens

`iter_contacts_xml` is a real instance of the same **lazy
evaluation**/streaming idea Lesson 1 introduced for file lines and
Lesson 2 measured directly for buffered byte reads — here expressed
through a language-level generator function instead of a file object's
own built-in iteration.

```
Also recognized in: database cursors yielding rows one at a time
instead of materializing a full result set, Python's own `range()`
producing values on demand instead of a pre-built list, reactive
programming frameworks modeling a UI event stream the same way a
generator models a value stream
```

### SE lens

The alternative not chosen for `recordkeeper`'s current three-contact
file is skipping `iter_contacts_xml` entirely and always using
`load_contacts_xml`. For data this small, that's honestly the right
call — `ET.parse`'s whole-tree approach is simpler to write against
(free navigation, no event-ordering to reason about) and the memory
cost is negligible. `iter_contacts_xml` is included now, deliberately,
the same way `recordkeeper` chose to stream file lines back in Lesson
1 before it had a large file to actually justify it: the cost of
writing it today is small, and the alternative — discovering, only once
a real multi-gigabyte contacts export shows up, that `load_contacts_xml`
can't handle it without a rewrite — is exactly the kind of debt this
curriculum has been treating streaming as cheap insurance against
since Lesson 1.

### Commands needed

None new.

### Run it

Real output, from an actual run against `recordkeeper`'s own
`data/contacts.csv` (Lesson 3), loaded through `Contact` (Lesson 4),
written to XML and read back both ways:

```python
from recordkeeper.ingest.csv_source import load_contacts_csv
from recordkeeper.ingest.xml_source import write_contacts_xml, load_contacts_xml, iter_contacts_xml

contacts = load_contacts_csv("data/contacts.csv")
write_contacts_xml("data/contacts.xml", contacts)

loaded = load_contacts_xml("data/contacts.xml")
print("load_contacts_xml round trip matches ->", loaded == contacts)

streamed = list(iter_contacts_xml("data/contacts.xml"))
print("iter_contacts_xml round trip matches ->", streamed == contacts)
```

```
load_contacts_xml round trip matches -> True
iter_contacts_xml round trip matches -> True
```

### Connect

The previous unit established how to read one already-known
`<contact>` element's fields correctly; this unit finishes the round
trip with `contact_to_element`/`write_contacts_xml`, and adds a second,
memory-bounded way to read the same data back — `iter_contacts_xml` —
built on the same generator-function mechanism proven in this unit's
own isolated lab, both verified to produce results identical to the
original `Contact` objects.

---

## Connect the pieces

`recordkeeper.ingest.xml_source.write_contacts_xml` takes the same two
`Contact` objects this curriculum has carried since Lesson 4 — Alice's
comma-containing notes, Bob's newline-containing notes — and builds a
real `data/contacts.xml`, storing each contact's `id` as an attribute
and its `name`/`email`/`notes` as child elements, per this lesson's
first unit. `load_contacts_xml` reads that file back with `ET.parse`,
building the whole tree at once and converting every `<contact>`
through `contact_from_element`; `iter_contacts_xml`, built on the same
`yield`-based generator mechanism this lesson's second unit proved in
isolation, reads the identical file through `ET.iterparse` instead,
producing contacts one at a time and clearing each one's memory
immediately after. Both paths were checked directly against the
original `contacts` list with `==` — both `True` — real, verified proof
that XML's tree-shaped, attribute-or-element representation and its two
different reading strategies both preserve the exact same data,
including Bob's embedded newline, all the way through.
