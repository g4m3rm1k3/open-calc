# Lesson M1.3: Pulling Structured Values Out of One Combined String

*File paths under mastercam-app/... refer to the real manufacturing-platform repository's mastercam-app folder. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A throwaway proof of `re.search` finding a real pattern inside a real string and handing back a real match object - or real `None` when nothing matches. Then this app's own real `Operation.from_xml` (mastercam-app/mastercam_app/parsing/parser.py:194-231), which reaches for exactly that mechanism three real times to pull real A/B/C rotation values back out of one real, combined plane string like `"1 A-90 B45"` - and a second real fact this same method depends on: an `Operation`'s own real `number` field is never read from the `<OPERATION>` element itself, only from a real, separate sibling element passed in alongside it. Backed by 9 real, already-passing tests (mastercam-app/tests/test_operation.py). The transferable problem: real XML doesn't always keep one real fact in its own dedicated element - sometimes several real facts arrive pre-combined in one real string, and pulling them back apart correctly is its own real skill.

**What you need to know first:** Lesson M1.1's real `from_xml`/nested-closure pattern; nothing about regular expressions is assumed yet.

## Terms used in this lesson

- **regular expression (regex)** — A real, separate, small pattern language - not Python syntax itself - for describing a real *shape* of text to search for, rather than one exact, literal substring. `A-?\d+(?:\.\d+)?` (Objects and methods, below) is a real regex, not Python code being executed directly. It exists because "find the letter A, followed by an optional minus sign, followed by one or more real digits, optionally followed by a real decimal portion" has no real way to be expressed with `.find()` or `in` alone - those only ever match one exact, literal string.
- **match object** — A real, structured object `re.search` (Objects and methods, below) hands back the moment its own real pattern actually matches somewhere in the string - or real `None`, the same real `None`-on-failure shape `xml.find()` already uses (Lesson M1.1). It carries the real, matched text itself, retrievable through its own real `.group()` method, along with real position information this lesson doesn't need.

## Objects and methods used

- **`re.search`**
  - *What it is:* A real, standard-library function - not a method on the string being searched; the string is its own second real argument.
  - *Implementation:* `re.search(pattern: str, string: str) -> re.Match | None`. Scans `string` for the first real place `pattern` (Terms, above) matches anywhere inside it - not only at the very start, the way `re.match` (a real, different, unused-in-this-app function) would.
  - *Its use:* `Operation.from_xml`'s own real `extract_plane` closure (Concept Unit 1, below) calls this exactly once per real rotation letter - three real calls, for A, B, and C, against the identical real plane string.
  - *Type:* A real, standard-library function, imported via `import re`.
  - *Responsibility:* Given one real pattern and one real string, find the first real place they actually match, and hand back a real, structured match object describing exactly what matched - or real `None` when they never do.
  - *Depends on:* A real, valid regex pattern string, and a real string to search.
  - *Connects to:* Its own real return value's `.group()` method (below) is what `extract_plane` actually reads to get the real matched text back out as a plain string.
  - *Shape:* Either a real `re.Match` object, or real `None` - never a plain string directly, and never raises just because nothing matched.

- **`Match.group`**
  - *What it is:* A real, ordinary method on a real match object (Objects and methods, above) - not on the original string being searched.
  - *Implementation:* `match.group() -> str`, called with no arguments here - returns the entire real substring that matched the pattern, exactly as it appeared in the original string.
  - *Its use:* `extract_plane` calls this immediately after confirming a real match exists, to get the real matched text (e.g. `"A-90"`) back as a plain string, before stripping the letter off it.
  - *Type:* A real, instance method on `re.Match`.
  - *Responsibility:* Hand back the real, literal text a successful match actually consisted of.
  - *Depends on:* A real, already-successful match - calling this on `None` (a real failed search) raises a real `AttributeError`, which is exactly why `extract_plane`, below, checks `if m` first.
  - *Connects to:* Called directly on `re.search`'s own real return value; its own real return value is immediately passed to `.strip(strip_char)` (an already-familiar real string method) to remove the letter.
  - *Shape:* Always a real, plain string when called - never `None`, since calling it on a real `None` match raises instead of returning anything.

## Concept Unit: re.search Finds a Real Pattern Inside a String, or Returns None

### The Problem

This app's own real plane strings look like `"1 A-90 B45"` - one real operation number and up to three real rotation values, all combined into one real string with no fixed, guaranteed position for any of them. Before any real tool is shown: could an ordinary, already-familiar method like `.find()` or the `in` operator pull a real rotation value like `"-90"` back out of a string like that on its own, or does it need something that understands a *shape* of text rather than one exact, literal substring?

Before reading on:

- "1 A-90 B45".find("A") would find the real letter A - but could .find() alone tell you where the real number after it ends?
- If a real plane string were "1 A-90.5 B45" instead - a decimal rotation - would a fixed-length slice (like taking exactly 3 characters after the A) still work?
- Given both of those, what would a real tool need to understand about the *shape* of "a letter, then digits, maybe with a minus sign, maybe with a decimal" that .find() alone doesn't?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch, throwaway example proving the one real mechanism `Operation.from_xml`'s own `extract_plane` (the unit right after this one) depends on.
- **Files affected:** `verification/mastercam-phase-01/lab_regex_extract.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Nothing beyond Python's own standard library.

### The New Code

One small, real, throwaway script, typed fresh, against the identical real shape of plane string this app's own parser actually receives:

**File:** `verification/mastercam-phase-01/lab_regex_extract.py` (new)

```python
import re

plane = "1 A-90 B45"

match = re.search(r"A-?\d+(?:\.\d+)?", plane)
print("match object:", match)
print("match.group():", match.group())
print("stripped of the letter A:", match.group().strip("A"))

no_match = re.search(r"C-?\d+(?:\.\d+)?", plane)
print("no C in this string, match is:", no_match)
```

### Mechanical Walkthrough

- `import re` — A real, ordinary import from Python's own standard library - brings in `re.search` (Objects and methods, above) and nothing else this lesson needs.
- `r"A-?\d+(?:\.\d+)?"` — Full treatment above (Terms, regex) - a real, raw string (the leading `r` stops Python's own string escaping from interfering with the regex's own separate escaping, e.g. `\\d`) describing: the letter `A`, then an optional `-` (`-?`), then one or more real digits (`\\d+`), then an optional, non-captured decimal portion (`(?:\\.\\d+)?`) - this is the identical real pattern `Operation.from_xml`'s own `extract_plane` (the unit right after this one) uses for the letter `A`.
- `re.search(pattern, plane)` — Full treatment above (Objects and methods) - scans `plane` for the first real place the pattern above actually matches, confirmed in Verification, below, to find `\"A-90\"` starting partway through the real string, not only at its very beginning.
- `match.group()` — Full treatment above (Objects and methods) - hands back the real, literal matched text, `\"A-90\"`, as a plain string.
- `.strip("A")` — An already-familiar real string method - removes the literal character `\"A\"` from either end of the string if present, leaving `\"-90\"` - the real rotation value alone, with its own real letter prefix removed.
- `re.search(r"C-?\d+(?:\.\d+)?", plane)` — The identical real mechanism, searched against the identical real string, for a letter that genuinely isn't present in it - proving, in Verification below, that `re.search` hands back real `None` rather than raising or returning an empty string when nothing matches.

### CS Lens

This is **pattern matching over a shape, not a literal value** - the real search target is "a letter followed by an optionally signed, optionally decimal number," a real category of text, not one fixed string. Also recognized in: a real postal service validating "does this look like a real ZIP code" (a shape - five digits, maybe a dash and four more) rather than checking against a real, fixed list of every valid ZIP, a real compiler's own lexer recognizing "this is a real numeric literal" from its shape before it ever knows the specific real value, and a real spreadsheet program auto-detecting "this typed text looks like a real date."

### SE Lens

The real alternative not chosen anywhere in this app's own real plane-parsing code: splitting the real plane string apart with plain, ordinary string methods alone (`.split(\" \")`, checking each real piece's first character by hand). That alternative is genuinely possible for this specific real shape, and this app's own real `modify_xml` function (a later lesson) actually does use plain string methods for a related, simpler real task - the real, honest tradeoff regex adds here instead: one real pattern (`A-?\\d+(?:\\.\\d+)?`) expresses "letter, optional sign, digits, optional decimal" in one real line, where the equivalent plain string-method logic would need several real, nested conditionals to express the identical real rule - at the real cost that regex syntax itself (`-?`, `\\d+`, `(?:...)?`) is its own small, separate real language a reader has to already know, layered on top of Python itself.

### Commands needed

- `python verification/mastercam-phase-01/lab_regex_extract.py` — Runs the real, throwaway file directly with the real Python interpreter, from inside manufacturing-platform's own repo root.

### Verification

```text
match object: <re.Match object; span=(2, 6), match='A-90'>
match.group(): A-90
stripped of the letter A: -90
no C in this string, match is: None
```

Full saved run: `verification/mastercam-phase-01/lab_regex_extract_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: extract_plane Runs the Identical Real Search Three Times, Once Per Rotation Letter

### The Problem

The unit above proved `re.search` finds one real pattern in isolation. This app's own real plane string can carry up to three real rotation values at once - `A`, `B`, and `C` - not just one. Given the unit above's own real proof: would one single, combined real pattern trying to match all three at once be simpler than three real, separate searches, or would three separate searches actually handle a real plane string missing one or two of the three letters more cleanly?

Before reading on:

- A real plane string might contain A and B but not C, or only B, or all three. If one real pattern tried to match all three letters in a fixed order in one go, what would happen the moment one of them was genuinely absent?
- Given that, why might three real, separate re.search calls - one per letter - handle a real plane string with any real combination of A/B/C present more reliably than one combined pattern?
- Operation's own real number field also isn't read from the <OPERATION> element's own COMMENT or NAME - where else would a real subprogram number for one operation actually be recorded in the source XML, given each real NCFILE groups several real operations together?

### Project Change

- **Reference Source:** mastercam-app/mastercam_app/parsing/parser.py:194-231 (quoted in
full, the real, whole classmethod):
@classmethod
def from_xml(cls, operation_xml, ncfile):
    def sg(tag, xml=operation_xml):
        e = xml.find(tag)
        return e.text.strip() if e is not None and e.text else ""

    def extract_plane(plane_str, pattern, strip_char):
        m = re.search(pattern, plane_str)
        return m.group().strip(strip_char) if m else None

    try:
        prog_num = sg("NCFILE-NAME", ncfile) or ""
    except Exception:
        prog_num = ""

    plane_value = sg("TPLANE-PLANE")

    return cls(
        number=prog_num,
        comment=sg("COMMENT"),
        plane=plane_value,
        # ... eleven more real sg(...) calls, one per remaining
        # plain field, identical in shape to Lesson M1.1's own
        # Holder.from_xml
        op=plane_value.split(" ")[0].strip().replace("OP", "") if plane_value else "",
        force_tool_change=sg("FORCE-TC"),
        A=extract_plane(plane_value, r"A-?\d+(?:\.\d+)?", "A"),
        B=extract_plane(plane_value, r"B-?\d+(?:\.\d+)?", "B"),
        C=extract_plane(plane_value, r"C-?\d+(?:\.\d+)?", "C"),
    )
- **Files affected:** `mastercam-app/mastercam_app/parsing/parser.py` (existing), `mastercam-app/tests/test_operation.py` (new)
- **Change type:** none
- **Location:** mastercam-app/mastercam_app/parsing/parser.py already exists. mastercam-app/tests/test_operation.py is a new, real, permanent test file, already written and passing this session.
- **Dependencies:** The unit above's own real proof of `re.search`/`.group()` - both of `extract_plane`'s own real lines depend on them directly.

### The Updated Project

`extract_plane` itself, and the three real calls to it, already existing, read directly:

**File:** `mastercam-app/mastercam_app/parsing/parser.py` (already exists — read-only, nothing to type)

```python
def extract_plane(plane_str, pattern, strip_char):
    m = re.search(pattern, plane_str)
    return m.group().strip(strip_char) if m else None
# ...
A=extract_plane(plane_value, r"A-?\d+(?:\.\d+)?", "A"),
B=extract_plane(plane_value, r"B-?\d+(?:\.\d+)?", "B"),
C=extract_plane(plane_value, r"C-?\d+(?:\.\d+)?", "C"),
```

### Mechanical Walkthrough

- `def extract_plane(plane_str, pattern, strip_char):` — A real, nested closure (the identical real pattern established in Lesson M1.1) - genuinely generic across all three real letters, since which letter it's checking for is entirely determined by whatever real `pattern` and `strip_char` it's called with, not hard-coded inside it.
- `m = re.search(pattern, plane_str)` — Full treatment above (Objects and methods) - the identical real mechanism from the unit above, now reading its own pattern from a real parameter instead of a literal.
- `return m.group().strip(strip_char) if m else None` — A real conditional expression (the identical real shape already established in Lesson M1.1's own `Holder.from_xml`) - when `m` is a real match, returns the real matched text with its own letter stripped off; when `m` is real `None` (Terms, above), returns real `None` directly, rather than calling `.group()` on it and raising.
- `A=extract_plane(plane_value, r"A-?\d+(?:\.\d+)?", "A")` — The first of three real, independent calls - confirmed by `test_B_rotation_extracted_without_A_or_C_present` that when a real plane string has only `B`, this real call for `A` genuinely returns `None` on its own, with no effect on the separate real `B`/`C` calls.
- `prog_num = sg("NCFILE-NAME", ncfile) or ""` — Reads `\"NCFILE-NAME\"` from `ncfile` - a real, separate element passed into this whole method as its own second argument, never from `operation_xml` itself. Confirmed directly by `test_number_comes_from_the_ncfile_sibling_not_the_operation_itself` - a real `Operation`'s own `number` field genuinely comes from outside its own primary XML element, since the source XML records one real subprogram number per group of operations (the `<NCFILE>`), not per individual real `<OPERATION>`.

### CS Lens

This is the same real regex-matching concept from the unit above, applied three real, independent times over the identical real input - proving a real shape can be searched for repeatedly, with each real search's own success or failure never affecting the others.

### SE Lens

The real design principle: **reading a value from wherever it's actually recorded, not from wherever it would be convenient for it to be**. The real alternative not chosen: requiring every real `<OPERATION>` element to carry its own real subprogram number directly, duplicated across every operation in the same real group. That alternative isn't available here at all - it's not how the real source XML this app parses is actually structured; `Operation.from_xml` has to reach into its own second, real argument (`ncfile`) specifically because that's where Mastercam itself actually records it. The real, honest cost: a reader looking only at `<OPERATION>`'s own real child elements, with no knowledge of this method's own real signature, would have no way to guess that its `number` field comes from somewhere else entirely.

### Verification

```text
collected 9 items

tests/test_operation.py::test_number_comes_from_the_ncfile_sibling_not_the_operation_itself PASSED
tests/test_operation.py::test_plane_and_op_extracted_from_OP_prefixed_plane PASSED
tests/test_operation.py::test_op_extracted_from_bare_number_plane_with_no_OP_prefix PASSED
tests/test_operation.py::test_B_rotation_extracted_without_A_or_C_present PASSED
tests/test_operation.py::test_A_and_B_rotation_both_extracted_together PASSED
tests/test_operation.py::test_C_rotation_extracted_alone PASSED
tests/test_operation.py::test_plain_fields_read_directly PASSED
tests/test_operation.py::test_next_defaults_to_none PASSED
tests/test_operation.py::test_to_dict_excludes_next_pointer PASSED

9 passed in 0.09s
```

Full saved run: `mastercam-app/tests/test_operation.py`.

### Connection to the previous unit

The unit above proved `re.search`/`.group()` as a raw mechanism, once; this unit showed `extract_plane` reusing that identical real mechanism three real, independent times over one real string, plus a second, separate real fact - `Operation`'s own `number` comes from a sibling element, not its own.

## Connect the pieces

One real plane string, `"1 A-90 B45"`, followed through both units: the first unit proved `re.search` finds a real pattern's shape inside a string and hands back a real match object, or real `None` when nothing matches. The second unit showed this app's own real `extract_plane` running that identical real mechanism three separate times over that same real string - once each for A, B, and C - correctly returning `"-90"` for A, `"45"` for B, and real `None` for C, since this real string never contained one. Alongside it, this same real method reads its own `number` field from a genuinely different, real sibling element, `ncfile`, not from the operation's own XML at all. All nine of this lesson's own real claims about `Operation` are backed by mastercam-app/tests/test_operation.py.

**Next lesson:** Sequence - the first real dataclass in this parser whose own methods mutate a *different* object's field as a side effect, building an implicit, real linked list of operations one `.next` pointer at a time.