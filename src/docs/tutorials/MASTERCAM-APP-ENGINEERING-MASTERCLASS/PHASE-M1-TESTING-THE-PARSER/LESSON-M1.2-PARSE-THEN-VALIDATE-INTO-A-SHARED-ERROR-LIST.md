# Lesson M1.2: Parse, Then Validate, Into a Shared Error List

*File paths under mastercam-app/... refer to the real manufacturing-platform repository's mastercam-app folder. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A throwaway proof that a real Python list, passed into a function, gets mutated in place - the caller's own list really changes, with nothing returned and reassigned. Then this app's own real `Tool` class (mastercam-app/mastercam_app/parsing/parser.py:76-168), whose real `from_xml` doesn't just parse - it builds the object first, then runs nine real, separate checks against it, appending a real, readable message to one shared list for every one that fails - backed by 14 real, already-passing tests (mastercam-app/tests/test_tool.py). The transferable problem: a real object can be genuinely valid Python and still represent bad real-world data (a tool with no diameter, still a real, constructible `Tool`) - this lesson is about the real mechanism this app uses to notice that difference and report it, without ever refusing to build the object at all.

**What you need to know first:** Lesson M1.1 - specifically the classmethod/`from_xml` pattern and `Assembly`'s own composition of `Holder`, since `Tool` composes an `Assembly` the identical real way.

## Terms used in this lesson

- **mutable, passed by reference** — A real, defining property of Python's own list type (and dict, and any real, ordinary class instance): passing one into a function doesn't hand the function a real copy - it hands the function the identical real object the caller already has. A change made to it *inside* the function (appending to it, for example) is visible to the caller afterward, with nothing returned or reassigned. It exists as a real, load-bearing fact about how Python's own object model works, not a design choice this app made - `Tool.from_xml`, below, depends on it directly.
- **parse-then-validate** — A real, deliberate ordering: build the real object first, from whatever real data is actually present, then run real checks against the already-built object afterward - rather than refusing to build it at all the moment one real check fails. It exists so one real, malformed tool doesn't silently make an entire real part un-loadable; the object still exists, still gets returned, and every real problem with it gets recorded as a real message instead of a crash.

## Objects and methods used

- **`Tool`**
  - *What it is:* A real, larger dataclass than `Holder`/`Assembly` - sixteen real fields describing one real cutting tool, plus the real `Assembly` it's mounted in.
  - *Implementation:* `@dataclass class Tool:` at mastercam-app/mastercam_app/parsing/parser.py:76-168. `number: int` and `assembly: Assembly` (both real, required fields), plus thirteen more real, defaulted string fields (`coolant`/`diameter`/`corner_radius`/etc.). A real `from_xml(cls, tool_xml, errors)` classmethod - taking a second real argument, `errors`, that `Holder.from_xml`/`Assembly.from_xml` (Lesson M1.1) never needed. A real `to_dict(self)`.
  - *Its use:* The first real class in this parser whose own `from_xml` does genuinely more than read child elements - it runs real checks against what it just built, appending to `errors` along the way.
  - *Type:* A real, module-level dataclass, composed of a real `Assembly`.
  - *Responsibility:* Hold sixteen real fields describing one real tool, know how to build itself from real XML the identical composed way `Assembly` builds itself from a `Holder` (Lesson M1.1), and, while doing so, append one real, readable message to a real, shared list for every real, separate problem it finds with what it just built.
  - *Depends on:* A real, possibly-`None` `tool_xml` element, and a real, mutable `list` (Terms, above) to append real error messages into.
  - *Connects to:* Called from this app's own real `parse_mastercam_xml` (a later lesson) with that function's own real, running `validation_errors` list passed straight through - every real message `Tool.from_xml` appends ends up in the exact same real list the rest of this app's parser reports to.
  - *Shape:* Returns one real `Tool` (or `None`, only when `tool_xml` itself is `None`) - never a tuple, never a second return value for errors; every real problem found goes into the real `errors` list argument instead, confirmed directly by mastercam-app/tests/test_tool.py's own real, passing tests.

## Concept Unit: A List Passed Into a Function Is the Same Real List, Not a Copy

### The Problem

`Tool.from_xml` (Objects and methods, above) takes a real `errors` list as an argument and appends to it nine separate real times, but never returns it. Given nothing shown yet: if a real Python function appends to a list it was handed, does the caller's own original list actually change, or does the caller need the function to return something and reassign it?

Before reading on:

- If a function does `errors.append("x")` on a list it received as an argument, and returns nothing at all - does the list the caller already had change, or not?
- Contrast that with `errors = errors + ["x"]` inside the same function - would that change the caller's own original list the same way, or something different?
- Given your answer, why might Tool.from_xml prefer .append() over building and returning a brand-new list of its own errors?

### Project Change

- **Reference Source:** No reference counterpart - a from-scratch, throwaway example proving the one real mechanism `Tool.from_xml` (the unit right after this one) depends on.
- **Files affected:** `verification/mastercam-phase-01/lab_mutable_list_arg.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Nothing beyond Python's own standard library.

### The New Code

One small, real, throwaway function, typed fresh, appending to a real list it receives, called three real times against the identical real list:

**File:** `verification/mastercam-phase-01/lab_mutable_list_arg.py` (new)

```python
def check_positive(value, errors):
    if value <= 0:
        errors.append(f"{value} is not positive")


my_errors = []
check_positive(5, my_errors)
check_positive(-3, my_errors)
check_positive(0, my_errors)
print("my_errors after three calls:", my_errors)
```

### Mechanical Walkthrough

- `def check_positive(value, errors):` — An already-familiar real function definition - two real parameters, `value` and `errors`, neither given a default.
- `if value <= 0: errors.append(...)` — An already-familiar `if`, guarding a real call to `errors`'s own real, built-in `.append()` method - adds one real string to the end of whatever real list `errors` currently refers to. Nothing is returned from this function at all.
- `my_errors = []` — Creates one real, empty list, bound to the real name `my_errors`, in the outer, real top-level scope - not inside the function above.
- `check_positive(5, my_errors) / check_positive(-3, my_errors) / check_positive(0, my_errors)` — Three real, separate calls, all passing the identical real `my_errors` object - not three separate copies of it. Full treatment above (Terms, mutable/passed by reference): inside each call, `errors` is a second real name for the exact same real list `my_errors` already names outside it - there is only ever one real list object here, referred to by two real names depending on which real scope is asking.
- `print("my_errors after three calls:", my_errors)` — Reads `my_errors` directly, in the outer scope, after all three real calls - proving, in Verification below, that the two real, failing calls (`-3` and `0`) both actually changed it, with nothing ever returned or reassigned to make that true.

### CS Lens

This is **pass-by-object-reference** (Python's own real parameter- passing model for every mutable object, not copy-by-value the way some languages default to for compound data). Also recognized in: a shared real whiteboard in a meeting room (everyone writing on it is editing the identical real surface, not a personal copy each person later merges back), a real shared spreadsheet multiple people edit live, and a real building's single, shared blueprint revised in place by every contractor working from it, rather than each holding a private copy no one else's edits reach.

### SE Lens

The real alternative not chosen: having `check_positive` (and `Tool.from_xml`, in the unit below) build and *return* its own, separate list of errors, leaving the caller to merge every real returned list together by hand. That alternative genuinely works, but the real, honest cost it carries and this app's own real design avoids: merging real lists from nine separate real checks, across sixteen real fields, by hand, at every real call site, is real, repetitive bookkeeping a shared, mutated list removes entirely - every real check just appends to the one list every caller already has, and nothing needs merging afterward. The real cost this design *does* carry instead: nothing in a real function's own signature visibly warns that `errors` will be changed in place - a reader has to already know the real convention, or read the real body, to know `check_positive(value, errors)` mutates its second real argument rather than just reading it.

### Commands needed

- `python verification/mastercam-phase-01/lab_mutable_list_arg.py` — Runs the real, throwaway file directly with the real Python interpreter, from inside manufacturing-platform's own repo root.

### Verification

```text
my_errors after three calls: ['-3 is not positive', '0 is not positive']
```

Full saved run: `verification/mastercam-phase-01/lab_mutable_list_arg_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: Tool.from_xml Builds First, Then Runs Nine Real Checks Against What It Built

### The Problem

`Tool` has sixteen real fields - far more than `Holder`'s six or `Assembly`'s three (Lesson M1.1) - and some of them (`diameter`, `flutes`) are real, physical measurements a malformed real XML export could easily leave missing, blank, or nonsensical. Given the unit above already proved a shared list really does change in place: what real, concrete problems would be worth checking for, specifically, once a real `Tool` has just been built from real XML - and should finding one of them stop the tool from existing at all, or just get noted?

Before reading on:

- A real tool with an empty diameter is still a real, constructible Tool object - every field defaults to something. What would actually break, later in this app, if that empty diameter went completely unnoticed?
- Given the unit above's own proof, once Tool.from_xml has built a real tool and has a real errors list available, what's the smallest real change needed to record "this tool's diameter is missing" without stopping the function from returning the tool anyway?
- Tool.from_xml runs nine separate real checks, not one big one. Why might keeping them as nine separate real if-blocks be better than one combined real condition covering all nine?

### Project Change

- **Reference Source:** mastercam-app/mastercam_app/parsing/parser.py:96-156 (quoted,
the real, whole classmethod - the six always-read fields'
assignment omitted here for length; the real, complete
assignment list is identical in shape to Lesson M1.1's own
Holder.from_xml, just sixteen real fields instead of six):
@classmethod
def from_xml(cls, tool_xml, errors: list):
    if tool_xml is None:
        return None
    def sg(tag):
        e = tool_xml.find(tag)
        return e.text.strip() if e is not None and e.text else ""
    assembly = Assembly.from_xml(tool_xml.find("spAssembly"), tool_xml.find("spHolder"))
    number = parse_int(sg("NUMBER"), f"[TOOL > {tool_xml}]", errors, "NUMBER", 0)
    tool = cls(
        number=number, assembly=assembly,
        code=sg("CODE"), comment=sg("COMMENT"), coolant=sg("COOLANT"),
        diameter=sg("DIAMETER"), corner_radius=sg("CORNER-RADIUS"),
        # ... ten more real sg(...) calls, one per remaining field
    )
    if not tool.coolant:
        errors.append(f"[TOOL {tool.number}] Missing coolant — tool may not function properly.")
    if not tool.diameter:
        errors.append(f"[TOOL {tool.number}] Missing diameter.")
    else:
        try:
            dia = float(tool.diameter)
            if dia <= 0:
                errors.append(f"[TOOL {tool.number}] Invalid diameter '{tool.diameter}' — must be positive.")
        except ValueError:
            errors.append(f"[TOOL {tool.number}] Non-numeric diameter '{tool.diameter}'.")
    # ... six more real, separate checks, each appending its own
    # real message on its own real condition
    return tool
- **Files affected:** `mastercam-app/mastercam_app/parsing/parser.py` (existing), `mastercam-app/tests/test_tool.py` (new)
- **Change type:** none
- **Location:** mastercam-app/mastercam_app/parsing/parser.py already exists. mastercam-app/tests/test_tool.py is a new, real, permanent test file, already written and passing this session - 14 real tests, one real function, `make_tool_xml`, building a real, minimal but complete `<TOOL>` element per test, with only the one real field under test overridden away from a known-good real default.
- **Dependencies:** The unit above's own real proof that a shared list changes in place - every one of `Tool.from_xml`'s nine checks depends on exactly that fact.

### The Updated Project

Two of `Tool.from_xml`'s own nine real checks, already existing, read directly (the diameter check, already quoted above in full; and the endmill/corner-radius check, shown here for the first time):

**File:** `mastercam-app/mastercam_app/parsing/parser.py` (already exists — read-only, nothing to type)

```python
if tool.type.lower() in ["endmill"] and not tool.corner_radius:
    errors.append(f"[TOOL {tool.number}] Type '{tool.type}' missing corner radius.")
```

### Mechanical Walkthrough

- `if tool_xml is None: return None` — Unlike `Holder.from_xml`/`Assembly.from_xml` (Lesson M1.1), which each return a real, empty instance of themselves when given `None`, `Tool.from_xml` returns real `None` itself - confirmed directly by `test_tool_from_xml_none_returns_none`. A tool that genuinely doesn't exist in the source XML isn't represented as an empty real `Tool`; it's represented as no tool at all.
- `tool = cls(number=number, assembly=assembly, ...)` — Full treatment already established in Lesson M1.1 (the generated `__init__`, called through `cls(...)`) - the real, complete object gets built here, all sixteen fields at once, *before* any of the nine real checks below it ever run.
- `if not tool.coolant: errors.append(...)` — The first of nine real, separate checks - reads `tool.coolant` directly off the real object just built, and appends one real, specific message, naming the real tool number, when it's empty. Confirmed directly by `test_missing_coolant_appends_error`.
- `if not tool.diameter: ... else: try: dia = float(tool.diameter) ...` — A real, three-way check, not a two-way one: missing diameter is its own real message; a present-but-non-numeric diameter (caught by the real `except ValueError`) is a second, different real message; a present, numeric, but zero-or-negative diameter is a third. All three are proven real and separate by `test_missing_diameter_appends_error`/`test_non_numeric_diameter_appends_error`/`test_negative_diameter_appends_error` - three real tests, because this one real field has three real, genuinely different ways to be wrong.
- `if tool.type.lower() in ["endmill"] and not tool.corner_radius:` — A real, conditional check - only tools whose real `type` field, lower-cased, is `\"endmill\"` get checked for a missing corner radius at all; a real drill or a real tap with no corner radius is never flagged, confirmed directly by `test_non_endmill_missing_corner_radius_is_fine`. Not every one of these nine checks applies to every real tool unconditionally.
- `return tool` — The real, final line - returns the real `Tool` built at the very top of this method, regardless of how many of the nine real checks above it appended a real message. Full treatment above (Terms, parse-then-validate): building and returning the object, and reporting problems with it, are two real, separate outcomes of the same real call, never one blocking the other.

### CS Lens

This is **fail-soft validation** (as opposed to fail-fast) - real problems get recorded, not thrown; the real program keeps running with the real, imperfect object it has, rather than stopping the instant something's wrong. Also recognized in: a real spell-checker underlining a real misspelled word without refusing to let you keep typing the rest of the document, a real car's dashboard warning light (the engine keeps running; the driver gets told, not stalled), and a real building inspector's own punch list (the building isn't demolished for a bad outlet; every real problem gets written down for someone to fix later).

### SE Lens

The real design principle: **collecting every real problem in one real pass, instead of stopping at the first one**. The real alternative not chosen: raising a real exception the moment `tool.coolant` is found missing, refusing to check the other eight real conditions at all that run. That alternative would mean a real part with three real, separately-broken tools only ever reveals its *first* real problem per run - fix it, reparse, find the second, fix it, reparse again - real, repeated, avoidable round-trips this app's own actual design avoids by collecting every real issue from every real tool in one real pass instead. The real, honest cost: nothing in `Tool.from_xml`'s own signature distinguishes "these fields are safe to trust" from "these fields might be empty, non-numeric, or nonsensical" - every one of the sixteen real fields is still a plain real string, whether every real check passed or three of them failed; a caller has to actually read the real `errors` list to know which case it got.

### Verification

```text
collected 14 items

tests/test_tool.py::test_tool_from_xml_reads_all_real_fields_with_no_validation_errors PASSED
tests/test_tool.py::test_tool_from_xml_none_returns_none PASSED
tests/test_tool.py::test_missing_coolant_appends_error PASSED
tests/test_tool.py::test_missing_diameter_appends_error PASSED
tests/test_tool.py::test_non_numeric_diameter_appends_error PASSED
tests/test_tool.py::test_negative_diameter_appends_error PASSED
tests/test_tool.py::test_non_integer_flutes_appends_error PASSED
tests/test_tool.py::test_zero_flutes_appends_error PASSED
tests/test_tool.py::test_overall_length_not_greater_than_flute_length_appends_error PASSED
tests/test_tool.py::test_endmill_missing_corner_radius_appends_error PASSED
tests/test_tool.py::test_non_endmill_missing_corner_radius_is_fine PASSED
tests/test_tool.py::test_holder_lib_outside_expected_folder_appends_error PASSED
tests/test_tool.py::test_missing_holder_lib_appends_error PASSED
tests/test_tool.py::test_to_dict_includes_nested_assembly PASSED

14 passed in 0.09s
```

Full saved run: `mastercam-app/tests/test_tool.py`.

### Connection to the previous unit

The unit above proved a shared list mutates in place, with nothing returned; this unit showed `Tool.from_xml` leaning on that exact fact nine real, separate times - building one real, complete `Tool` first, then recording every real problem with it into the same real list every other part of this parser already reports to.

## Connect the pieces

One real, empty-diameter tool, followed through both units: the first unit proved, with a tiny, throwaway `check_positive`, that appending to a list argument really changes the caller's own list, with nothing returned. The second unit showed this app's own real `Tool.from_xml` depending on that exact fact nine separate times - building a complete, real `Tool` first, from whatever real XML is actually present, then checking it afterward; an empty real diameter doesn't stop the tool from existing, it adds one real, specific message ("[TOOL 1] Missing diameter.") to the same real, shared `errors` list every other real check in this class - and, later, this app's whole real parser - reports into. All fourteen of this lesson's own real claims about `Tool` are backed by mastercam-app/tests/test_tool.py, not just this lesson's own read-through.

**Next lesson:** Operation - the real dataclass whose own `from_xml` reaches for regular expressions for the first time in this parser, pulling real A/B/C rotation values back out of one real, combined plane string.