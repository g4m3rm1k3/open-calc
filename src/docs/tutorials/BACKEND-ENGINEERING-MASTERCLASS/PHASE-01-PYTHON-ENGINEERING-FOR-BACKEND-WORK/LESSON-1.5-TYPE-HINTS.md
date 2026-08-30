# Lesson 1.5: Python Type Hints

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** No new backend feature - this lesson reads the real type annotations already written throughout `backend/app/services/mastercam_xml_parser.py`, `gitlab_service.py`, `final_parser.py`, and `model_service.py`, isolates each real annotation shape (a plain type, `Optional`, a nested collection type) in small throwaway labs first, then installs and runs `mypy` - a real static type checker, genuinely absent from this project until this lesson - against both a small deliberate mismatch and this backend's own real, already-existing code, to see what a tool that reads annotations without running anything actually catches.

**What you need to know first:** Reading a real, existing file as evidence for what a function actually does; calling a real function and reading its actual return value; installing a real Python package and running it from the command line.

## Terms used in this lesson

- **Type annotation** — Real, optional syntax attached to a parameter or return value - `text: str`, `-> float` - stating what type a value is meant to be. It exists as its own concept because Python itself never checks it: the annotation is stored (real, inspectable metadata) but nothing in the language stops a caller from passing a value of a different type anyway, and nothing in the function's own body is affected by it - the annotation is a real claim a human or a separate tool can check, not a runtime guard the language enforces on its own.
- **Static analysis** — Checking real code for problems by reading its source and its annotations - never by running it. It exists as its own concept because it's a genuinely different kind of check than this curriculum's own `verification` sections have used so far: every real output shown until this lesson came from actually executing code and reading what happened; a static analysis tool instead reads the code's own declared shape and reasons about what could go wrong before a single line of it ever runs - catching a real class of bug (a value that could be the wrong type) that might not show up in any one particular real run, only in some future run this lesson's own labs never happened to try.

## Objects and methods used

- **`typing.Optional`**
  - *What it is:* A real generic alias from Python's standard library `typing` module, meaning 'this type, or `None`.'
  - *Implementation:* `Optional[X]` is exactly `Union[X, None]` - confirmed this session; `typing.Optional` is documented and implemented as shorthand for that specific two-member union, not a separate mechanism.
  - *Its use:* This lesson's second unit reads it on a real parameter with a real `None` default - `gitlab_url: Optional[str] = None` - to state that a caller may genuinely omit this value, not just that its default happens to be `None`.
  - *Type:* A generic alias, imported from the standard library `typing` module.
  - *Responsibility:* State, as real, inspectable metadata, that a value may be the given type or may be `None` - nothing more; it doesn't create the default, doesn't check the value, and doesn't stop a caller from passing a third, unrelated type either.
  - *Depends on:* Being imported (`from typing import Optional`) and applied to a real parameter or return annotation.
  - *Connects to:* This lesson's third unit reads it again as the two-member special case of the more general `Union`, defined immediately below.
  - *Shape:* Takes exactly one real type argument in - `Optional[str]`, never `Optional[str, int]` - because it's fixed shorthand for a union with `None`, not a general multi-type container.

- **`typing.Union`**
  - *What it is:* A real generic alias from the standard library `typing` module, meaning 'one of these types, but genuinely could be any of them.'
  - *Implementation:* `Union[X, Y]` - confirmed this session, along with the equivalent modern syntax `X | Y`, introduced by real language changes this lesson's own lab runs directly rather than only describing.
  - *Its use:* This lesson's third unit uses it because no real annotation anywhere in this backend's own code actually reaches for `Union` with two non-`None` types - the codebase's own real `Optional` usage is the special case; this unit's own lab is what actually shows the general form running.
  - *Type:* A generic alias, imported from the standard library `typing` module (or expressed with the real `|` operator directly on the types themselves, needing no import).
  - *Responsibility:* State, as real, inspectable metadata, that a value may genuinely be any one of the listed types - nothing about which one, and nothing enforced about it at runtime.
  - *Depends on:* Either an import (`from typing import Union`) or, for the `|` form, nothing beyond the real types being combined.
  - *Connects to:* `Optional[X]` (above) is this exact construct, permanently fixed to exactly two members, one of them always `None`.
  - *Shape:* Takes two or more real type arguments; `Union[int, str]` and `int | str` are the identical real construct, confirmed this session to behave the same way when a real function built with either is actually called.

## Concept Unit: Annotations and Return Types - Real Metadata, Not a Runtime Guard

### The Problem

`mastercam_xml_parser.py`'s own real `parse_float` function is written with `text: str` and `-> float` - real, visible claims about what goes in and what comes back. Whether Python actually stops a caller from breaking either claim is a real, separate question this unit's own lab can just run and check, rather than assume from how confident the syntax looks.

Before reading on:

- Given `def parse_float(text: str) -> float:`, what real, concrete thing would you expect to happen if this exact function were called as `parse_float(42)` - an `int`, not a `str` - before you're told the actual answer?
- If nothing stops that call from running, what real, different kind of tool would you need to catch this mismatch - one that runs the code, or one that only reads it?

### Project Change

- **Reference Source:** `backend/app/services/mastercam_xml_parser.py:119-123`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_annotations.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** None - no import beyond the copied real function itself.

`parse_float` is a small, real, already-annotated helper, nested inside `_parse_operations`, converting real XML attribute text into a real `float` (or `None` if the text is empty or unparseable). Its own two annotations - `text: str`, `-> float` - are exactly what this unit needs to test directly: call it with the type it claims to want, then with a type it doesn't, and read what actually happens either way.

### The New Code

The real function, copied verbatim into a throwaway file, called three real ways - matching its own annotation, violating it with a type that still happens to work, and violating it with one that doesn't:

**File:** `verification/phase-01/lab_annotations.py` (new)

```python
def parse_float(text: str) -> float:
    try:
        return float(text) if text else None
    except (ValueError, TypeError):
        return None

print(parse_float("3.14"))
print(parse_float(42))
print(parse_float([1, 2]))
```

### Mechanical Walkthrough

- `def parse_float(text: str) -> float:` — `text: str` and `-> float` are real annotations, stored as inspectable metadata on the function object itself - but nothing about writing them changes what the function's own body actually does, or what values a caller is allowed to pass in.
- `print(parse_float("3.14"))` — Matches the real annotation - a genuine `str` in, a genuine `float` out, exactly as claimed.
- `print(parse_float(42))` — A real `int`, not a `str` - directly violates `text: str`. Nothing in Python stops this call from happening at all; `if text` is true for a nonzero int, and `float(42)` succeeds (`float` accepts an `int` just fine), so this runs to completion and returns a real `float`, `42.0` - the annotation was never consulted.
- `print(parse_float([1, 2]))` — A real `list`, also violating `text: str` - this one does fail, but not because of the annotation: `float([1, 2])` itself raises a real `TypeError`, caught by the function's own `except (ValueError, TypeError):` and turned into `None`. The failure comes from what the code inside actually does with an incompatible value, the same as it would for any ordinary, unannotated function - the annotation itself still did nothing, checked nothing, and stopped nothing.

### CS Lens

A type annotation is metadata, not a runtime check - real, inspectable data attached to a function object (available at `parse_float.__annotations__`), never consulted by the interpreter while the function actually runs. Also recognized in: a database column's declared type, which a badly-configured database can sometimes still let a mismatched value slip past; an API specification (OpenAPI/Swagger) describing a request's real shape without the server necessarily enforcing every field; and a function's own docstring, another real, inspectable piece of metadata Python stores but never acts on.

### SE Lens

The real cost of an annotation nobody checks is exactly what this unit's own lab just demonstrated: `parse_float(42)` ran to completion, silently, producing `42.0` - a real value, handed back to a real caller, despite directly violating the function's own stated contract. Nothing crashed, nothing warned - the mismatch simply happened and went unnoticed. The real alternative this curriculum's own final unit below actually reaches for is a separate tool that reads the same annotations and reports the mismatch itself, before the code is ever run - annotations alone are only ever as useful as something is actually checking them.

### Commands needed

- `python verification/phase-01/lab_annotations.py` — Run from the manufacturing-platform repository root.

### Verification

```text
3.14
42.0
None
```

Full saved run: `verification/phase-01/lab_annotations_output.txt`.

### Connection to the previous unit

There is no previous unit - this is the first one in this lesson.

## Concept Unit: Optional - Stating That a Value May Genuinely Be Absent

### The Problem

`GitLabService.__init__` accepts `gitlab_url: Optional[str] = None` - a real, explicit claim that this parameter may be a string, or may genuinely be nothing at all. A plain `str` annotation with a `None` default would still run the exact same way at call time; `Optional` is what actually states the second case is expected, not accidental.

Before reading on:

- If `gitlab_url: str = None` (no `Optional`) ran exactly the same way as the real `gitlab_url: Optional[str] = None`, what real, different audience is `Optional` actually for, if not the interpreter itself?
- Given `Optional[str]`, what are the two real, different types a value annotated this way is allowed to be?

### Project Change

- **Reference Source:** `backend/app/services/gitlab_service.py:1-13`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_optional.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's own standard library `typing` module only.

`GitLabService.__init__` takes two real, optional credentials, each annotated `Optional[str] = None` - a caller may construct this real service with explicit credentials, or omit them entirely and let the constructor's own body fall back to real environment variables (`os.getenv(...)`, on the very next line).

### The New Code

A small, real, throwaway function with the identical real shape as `GitLabService.__init__`'s own credential parameters, called three ways - omitted, given a real value, and given `None` explicitly:

**File:** `verification/phase-01/lab_optional.py` (new)

```python
from typing import Optional

def greet(name: Optional[str] = None) -> str:
    if name is None:
        return "Hello, stranger"
    return f"Hello, {name}"

print(greet())
print(greet("Ada"))
print(greet(None))
```

### The Updated Project

The real project code this lab's own shape reproduces - two real constructor parameters, each optional the identical way:

**File:** `backend/app/services/gitlab_service.py (lines 5-16)` (already exists — read-only, nothing to type)

```python
import os
import gitlab
from typing import Optional, List, Dict, Any
from datetime import datetime

class GitLabService:
    """Service for interacting with GitLab API for CAM file versioning"""

    def __init__(self, gitlab_url: Optional[str] = None, gitlab_token: Optional[str] = None):
        # Accept per-user credentials or fall back to .env
        self.gitlab_url = gitlab_url or os.getenv('GITLAB_URL', 'https://gitlab.com')
        self.gitlab_token = gitlab_token or os.getenv('GITLAB_TOKEN')
        self.base_group = os.getenv('GITLAB_BASE_GROUP')  # Optional: None = use personal namespace
```

### Mechanical Walkthrough

- `from typing import Optional` — Imports the real generic alias from the standard library `typing` module - needed before it can be used in any real annotation.
- `def greet(name: Optional[str] = None) -> str:` — `Optional[str]` states this parameter may be a real `str`, or may genuinely be `None` - the `= None` default is a separate, ordinary real Python default value; nothing about writing `Optional[str]` creates that default on its own, the same way nothing about a plain `str` annotation would have stopped one from being written either.
- `print(greet())` — No argument given - `name` takes its real default, `None`, so `if name is None:` is true, and the function returns the fallback string.
- `print(greet("Ada"))` — A real `str` passed explicitly - the type `Optional[str]` actually names as its main case.
- `print(greet(None))` — `None` passed explicitly, not merely defaulted to - runs identically to `greet()` above, since the real default was `None` to begin with; `Optional[str]`'s whole point is that this call is exactly as legitimate as passing a real string.
- `def __init__(self, gitlab_url: Optional[str] = None, gitlab_token: Optional[str] = None):` — The real, identical shape as this unit's own lab, twice over - two real credentials, each allowed to be a genuine `str` or genuinely absent, each defaulting to `None` when omitted.
- `self.gitlab_url = gitlab_url or os.getenv('GITLAB_URL', 'https://gitlab.com')` — The real reason this parameter is allowed to be `None` at all: when it is, `gitlab_url or ...` (basic Python) falls through to a real environment variable instead, with its own real fallback default if that's absent too - `Optional[str]` on the parameter is what makes this fallback line make sense in the first place, rather than being unreachable dead code.

### CS Lens

`Optional[X]` names a real, common special case of a broader concept - a value that may or may not be present - the same real idea as a database column allowing `NULL`, an HTML form field with no `required` attribute, or a JSON key that may legitimately be absent from a real response object rather than present with an empty value.

### SE Lens

The real alternative this codebase didn't choose - `gitlab_url: str = None`, with no `Optional` - would run identically (Python still wouldn't stop it), but it actively misleads a reader into thinking only real strings are expected here, when the very next line's own `or os.getenv(...)` fallback only makes sense if `None` is a real, anticipated case. The real cost of leaving `Optional` off here would be a false claim sitting directly next to code that contradicts it - exactly the kind of mismatch a static-analysis tool, this lesson's own closing unit, is built to catch.

### Commands needed

- `python verification/phase-01/lab_optional.py` — Run from the manufacturing-platform repository root.

### Verification

```text
Hello, stranger
Hello, Ada
Hello, stranger
```

Full saved run: `verification/phase-01/lab_optional_output.txt`.

### Connection to the previous unit

The unit above showed that an annotation is never enforced, whatever it claims; this unit reads a real, specific annotation shape - `Optional[str]` - that states a value may genuinely be absent, and connects that claim directly to real code on the very next line that depends on the absence actually being possible.

## Concept Unit: Unions - When a Value Is Genuinely One of Several Real Types

### The Problem

`Optional[str]` is really just "`str`, or `None`" - a union of exactly two types, one of them always `None`. Nothing in this real backend's own code actually reaches for the fully general form, a real value that could be any one of two or more genuine, non-`None` types - so this unit builds a small, real, throwaway example instead, using the same construct `Optional` already turned out to be a special case of.

Before reading on:

- Given that `Optional[str]` is confirmed to be `Union[str, None]`, what real, general shape would `Union[int, str]` state about a value - and is `None` one of the real options it allows?
- Python's own newer `X | Y` syntax and `Union[X, Y]` are claimed to be the identical real construct - what real, concrete test would actually confirm that, rather than just trusting the claim?

### Project Change

- **Reference Source:** No reference counterpart - searched this session across all of `backend/app` for `Union[` and for the `X | Y` union syntax; neither appears anywhere in this codebase's real annotations. `Optional`, already read in the unit above, is the only real union this backend's own code actually uses.
- **Files affected:** `verification/phase-01/lab_union.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's own standard library `typing` module for the `Union[...]` form only - the `|` form needs no import.

With no real project code to cite for the fully general case, this unit builds a small, real, standalone function accepting either a real `int` or a real `str`, written both ways real Python actually supports - the older `typing.Union[int, str]` and the newer `int | str` - and calls it with values of both real types to confirm they're genuinely the same construct, not just similar-looking syntax.

### The New Code

A small, real, throwaway function accepting a genuine two-type union, written both real ways Python supports, each called with both real member types:

**File:** `verification/phase-01/lab_union.py` (new)

```python
from typing import Union

def format_id(value: Union[int, str]) -> str:
    return str(value)

print(format_id(42))
print(format_id("ABC-7"))

def format_id2(value: int | str) -> str:
    return str(value)

print(format_id2(42))
```

### Mechanical Walkthrough

- `from typing import Union` — Imports the real generic alias needed for the older, explicit `Union[...]` spelling.
- `def format_id(value: Union[int, str]) -> str:` — States `value` may genuinely be either a real `int` or a real `str` - unlike `Optional[str]`, neither member here is `None`; this is the fully general two-type union `Optional` turned out to be one specific case of.
- `print(format_id(42)); print(format_id("ABC-7"))` — Both real calls succeed, one with each real member type the annotation names - `str(42)` and `str(\"ABC-7\")` both work fine, confirming the function's own real body already handles either real type this annotation claims to accept.
- `def format_id2(value: int | str) -> str:` — The real, newer syntax - `int | str` directly, no `typing` import needed - stating the identical real union as `Union[int, str]` above.
- `print(format_id2(42))` — Succeeds identically to `format_id(42)` above - real, direct confirmation that `Union[int, str]` and `int | str` behave the same real way when actually called, not just an assumption from how similar the two spellings look.

### CS Lens

A union type names a real, closed set of alternatives a value could be - the same real idea as a database column with a `CHECK` constraint restricting it to a fixed few real values, a function parameter in a language with real algebraic sum types, or an HTML `<input>` whose real value could come from more than one distinct real widget type feeding the same field.

### SE Lens

The real, honest cost of a union, compared to `Optional`'s narrower case: code that receives a `Union[int, str]` value generally still has to check *which* real type it actually got before doing anything type-specific with it (this unit's own `format_id` avoids that only because `str(...)` genuinely accepts either real type unchanged) - a wider real union pushes more of that real responsibility onto every caller and every reader, which is likely the real reason this backend's own code never reaches for the fully general form: every real optional value in this codebase turned out to have exactly one real alternative to `None`, never a genuine choice between two or more non-`None` types.

### Commands needed

- `python verification/phase-01/lab_union.py` — Run from the manufacturing-platform repository root.

### Verification

```text
42
ABC-7
42
```

Full saved run: `verification/phase-01/lab_union_output.txt`.

### Connection to the previous unit

The unit above read `Optional[str]` as a real, specific claim about one parameter; this unit builds the fully general construct `Optional` turns out to be a fixed two-member special case of, since nothing in this backend's own real code reaches for the general form directly.

## Concept Unit: Collection Type Hints - Naming What's Inside, Not Just the Container

### The Problem

`Dict[int, int]` alone couldn't state what `final_parser.py`'s own real `position_counters` actually needs: a dict keyed by a real `(op_number, tool_number)` pair, not a single int. Nesting one real generic type argument inside another - `Dict[Tuple[int, int], int]` - is what actually states the full real shape, not just "some dict."

Before reading on:

- Given `Dict[Tuple[int, int], int]`, what real, concrete Python value would be a valid KEY for a dict annotated this way - and what would NOT be, even though it's still just "a dict key"?
- `List[Dict[str, Any]]` nests a collection type inside another - what real, concrete shape of Python value does that whole annotation, read from the outside in, actually describe?

### Project Change

- **Reference Source:** `backend/app/services/final_parser.py:17-23` and `backend/app/services/model_service.py:52-56`, real, already-existing code, read and quoted verbatim this session.
- **Files affected:** `verification/phase-01/lab_collections_typed.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** Python's own standard library `typing` module only.

`FinalParser.__init__` declares `self.position_counters: Dict[Tuple[int, int], int] = {}` - a real dict whose own keys are themselves a fixed pair of ints, not a single value, matching the class's own adjacent comment naming the real key shape: `(op_number, tool_number)`. `ModelService.get_operation_models` separately declares its own real return type, `List[Dict[str, Any]]` - a real list, each of whose elements is itself a real dict.

### The New Code

A small, real, throwaway pair of nested collection annotations, matching the two real shapes above at minimal scale:

**File:** `verification/phase-01/lab_collections_typed.py` (new)

```python
from typing import Dict, Tuple, List, Any

counts: Dict[Tuple[int, int], int] = {}
counts[(1, 5)] = 1
counts[(1, 5)] += 1
counts[(2, 5)] = 1
print(counts)

records: List[Dict[str, Any]] = [{"id": 1, "name": "a"}, {"id": 2, "name": "b"}]
print(records)
```

### The Updated Project

The two real project lines this lab's own shapes reproduce - a dict keyed by a real fixed pair, and a function whose own real return type is a list of dicts:

**File:** `backend/app/services/final_parser.py (lines 17-23)` (already exists — read-only, nothing to type)

```python
def __init__(self, xml_content: str):
    self.root = ET.fromstring(xml_content)
    # --- STATE ---
    self.active_tool_number: int = -1
    self.tool_call_counts: Dict[int, int] = {}
    # CHANGED: Position counter is per (OP, Tool) not (OP, Position, Tool)
    self.position_counters: Dict[Tuple[int, int], int] = {}  # Key: (op_number, tool_number)
```

**File:** `backend/app/services/model_service.py (lines 52-56)` (already exists — read-only, nothing to type)

```python
@staticmethod
def get_operation_models(
    machine_id: Optional[str] = None,
    part_id: Optional[str] = None,
    cam_file_id: Optional[str] = None
) -> List[Dict[str, Any]]:
```

### Mechanical Walkthrough

- `counts: Dict[Tuple[int, int], int] = {}` — A variable annotation (real Python syntax, not limited to function parameters/returns) - states this real dict's keys are each a real 2-tuple of ints, and its values are each a real int; the `= {}` is an ordinary real assignment, giving the annotation something to describe from the very first line.
- `counts[(1, 5)] = 1; counts[(1, 5)] += 1; counts[(2, 5)] = 1` — Three real dict operations using a real tuple as the key each time, exactly matching `Dict[Tuple[int, int], int]`'s own claim - `(1, 5)` and `(2, 5)` are real, distinct 2-tuples, each hashable (this lesson's own prior unit on tuples already established why a tuple of hashable values can be a real dict key at all).
- `records: List[Dict[str, Any]] = [{"id": 1, "name": "a"}, {"id": 2, "name": "b"}]` — `List[Dict[str, Any]]`, read from the outside in: a real list, each of whose elements is itself a real dict with string keys and values of any real type - exactly the two real dict literals this line actually assigns.
- `self.position_counters: Dict[Tuple[int, int], int] = {}` — The real, identical shape as this unit's own lab's `counts` variable, at real project scale - `FinalParser`'s own adjacent comment, `# Key: (op_number, tool_number)`, states in prose exactly what `Tuple[int, int]` already states in the real annotation itself.
- `-> List[Dict[str, Any]]:` — `ModelService.get_operation_models`'s own real return type - the identical nested shape as this unit's own lab's `records` variable; its real body, `return [op.to_dict() for op in operations]` (a list comprehension, already taught in this lesson's own prior Lists unit), is exactly what actually produces a real value matching this claimed shape.

### CS Lens

A nested generic type states a real, compound structural claim, not just a container name - the same real idea as a database column declared as an array of a specific row type, a function signature in a statically-typed language whose own parameter is itself a generic collection of another generic collection, and a JSON Schema describing an array whose own items must each match a nested object schema.

### SE Lens

The real alternative not chosen here - `position_counters: dict = {}`, with no real type arguments at all - would state nothing at all about what a real key or value actually has to be; a reader (or a static-analysis tool) would have no real way to catch `position_counters[\"bad key\"]` as wrong, since a bare `dict` permits any real key. The real cost of the fuller, nested annotation is only ever how much a reader has to parse before understanding the shape - `Dict[Tuple[int, int], int]` takes longer to read than `dict`, but states something `dict` alone genuinely can't.

### Commands needed

- `python verification/phase-01/lab_collections_typed.py` — Run from the manufacturing-platform repository root.

### Verification

```text
{(1, 5): 2, (2, 5): 1}
[{'id': 1, 'name': 'a'}, {'id': 2, 'name': 'b'}]
```

Full saved run: `verification/phase-01/lab_collections_typed_output.txt`.

### Connection to the previous unit

The unit above built a union of two flat, unrelated types; this unit nests one real generic type argument inside another, stating not just which container a value is, but the real, specific shape of what's inside it too.

## Concept Unit: Static Analysis - A Real Tool That Reads Annotations Without Running Anything

### The Problem

This lesson's first unit proved Python itself never checks `parse_float`'s own `text: str` annotation - `parse_float(42)` ran to completion, silently. Something else has to actually read that annotation and compare it against how the function is really called, without running the program at all, for writing the annotation to catch anything a plain Python run wouldn't.

Before reading on:

- Given a real, standalone script that defines `parse_float(text: str) -> float` and then calls `parse_float(123)`, what would you expect a tool built specifically to check annotations - never running the code - to report about that exact call, before you run it and see?
- This backend has zero static-analysis configuration anywhere in the repository - genuinely never installed or run before this unit. Given that, would you expect running a real type checker against this backend's own, real, already-existing code to find nothing at all, or to find something real?

### Project Change

- **Reference Source:** No reference counterpart for the tool itself - this backend has no `mypy`/`pyright` configuration anywhere (confirmed this session: no `pyproject.toml`, `mypy.ini`, or `.pyrightconfig.json` in the repository, and neither package is listed in `backend/requirements.txt`). `mypy` is installed fresh this session specifically for this unit, then run against both a small, real, deliberate mismatch and this backend's own real, already-existing `mastercam_xml_parser.py` - the same real file this lesson's first unit already read `parse_float` from.
- **Files affected:** `verification/phase-01/lab_type_check.py` (new)
- **Change type:** add
- **Location:** New file, no existing project to place it within.
- **Dependencies:** The real `mypy` package, installed this session via `python -m pip install mypy`.

Installing and running `mypy` doesn't change any real project file - it only reads annotations already there and reports what it finds; nothing here alters `mastercam_xml_parser.py` itself.

### The New Code

A small, real, throwaway script - an annotated function, called once with a real type violation, never actually run as a Python program in this unit, only read by `mypy`:

**File:** `verification/phase-01/lab_type_check.py` (new)

```python
def parse_float(text: str) -> float:
    return float(text)

result = parse_float(123)
```

### Mechanical Walkthrough

- `def parse_float(text: str) -> float:` — The identical real annotation shape as this lesson's first unit - stated, never enforced by Python itself.
- `result = parse_float(123)` — A real `int`, violating `text: str` - the exact same real mismatch this lesson's first unit already showed runs to completion with no error at all. This time, the file is never executed as a Python program in this unit - only handed to `mypy`, below, to read.
- `python -m mypy verification/phase-01/lab_type_check.py` — Runs the real, installed `mypy` package against the file's real source text - reading `parse_float`'s own declared annotation and comparing it against the real argument `123` is called with, entirely without importing or running the file as Python.
- `python -m mypy backend/app/services/mastercam_xml_parser.py --ignore-missing-imports --follow-imports=skip` — The identical real tool, pointed at this backend's own real, already-existing file instead of a throwaway one - `--follow-imports=skip` keeps the check limited to this one real file's own annotations, rather than also analyzing every file it imports; `--ignore-missing-imports` accepts that some of this project's own real dependencies (e.g. `flask`) may have no type stubs `mypy` recognizes, without that stopping the real check on this file itself.

### Mental Model

```text
lab_type_check.py's own real, deliberate mismatch:

  def parse_float(text: str) -> float: ...
  result = parse_float(123)
                         ^^^
  mypy reads this WITHOUT running it:
    "123" is a real int, not a real str
    -> reports a real error, on line 4

mastercam_xml_parser.py:145 (real, already-existing code):

  hours = int(re.search(r'...', time_str, re.I).group(1)) if ...
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  re.search(...) is typed Match[str] | None
  .group(1) is only valid on a real Match, never on None
  -> mypy reports a real error, on line 145

  BUT: this exact call already sits inside a real
  try/except (..., AttributeError): return None
  three lines below - so if re.search really did return
  None here, the program wouldn't crash; it would just
  return None instead, already anticipated by the
  function's own author. mypy's real finding and the
  function's own real runtime safety net are two
  different, both-real facts - not a contradiction.
```

### CS Lens

Static analysis reasons about a real program's possible states without ever running one of them - the same real idea as a compiler's own type checker rejecting a program before it can execute at all, a linter flagging an unreachable real branch by reading control flow rather than running it, and a spell-checker finding a real misspelling by reading text, never by "running" the document.

### SE Lens

Running `mypy` against this backend's own real, already-existing file for the first time surfaced a real, honest finding worth being precise about: three real calls to `.group(1)` on a value `mypy` correctly types as possibly `None` (`re.search(...)` can genuinely return `None` if nothing matches). That's a real static-type gap - but the same real code already wraps this in a broad `except (..., AttributeError):` three lines below, so the actual runtime consequence, if it ever happened, is already handled, not a live crash waiting to happen. `mypy`'s real finding and the function's own real defensive coding are both true at once: a static checker finds real gaps in a program's stated types, whether or not this particular codebase's own separate runtime habits already happen to cover for them - the value of running it at all is turning an accidentally-safe pattern into a visibly, deliberately-checked one, not a claim that the code was broken before.

### Commands needed

- `python -m pip install mypy` — Installs the real mypy package into this session's Python environment - genuinely absent from the project before this unit.
- `python -m mypy verification/phase-01/lab_type_check.py` — Run from the manufacturing-platform repository root, against the small, deliberate mismatch above - run first, before the real project file below.
- `python -m mypy backend/app/services/mastercam_xml_parser.py --ignore-missing-imports --follow-imports=skip` — Run second, from the same root, restricted to this one real file so the output stays about this file's own real annotations, not every file it imports.

### Verification

```text
=== lab_type_check.py ===
verification\phase-01\lab_type_check.py:4: error: Argument 1 to "parse_float" has incompatible type "int"; expected "str"  [arg-type]

=== mastercam_xml_parser.py (real project file) ===
backend\app\services\mastercam_xml_parser.py:145: error: Item "None" of "Match[str] | None" has no attribute "group"  [union-attr]
backend\app\services\mastercam_xml_parser.py:146: error: Item "None" of "Match[str] | None" has no attribute "group"  [union-attr]
backend\app\services\mastercam_xml_parser.py:147: error: Item "None" of "Match[str] | None" has no attribute "group"  [union-attr]
backend\app\services\mastercam_xml_parser.py:227: error: Need type annotation for "sequences" (hint: "sequences: list[<type>] = ...")  [var-annotated]
backend\app\services\mastercam_xml_parser.py:306: error: Value of type "dict[str, Any] | None" is not indexable  [index]
backend\app\services\mastercam_xml_parser.py:312: error: Value of type "dict[str, Any] | None" is not indexable  [index]
backend\app\services\mastercam_xml_parser.py:343: error: Need type annotation for "assemblies" (hint: "assemblies: dict[<type>, <type>] = ...")  [var-annotated]
```

Full saved run: `verification/phase-01/lab_type_check_output.txt`.

### Connection to the previous unit

Every earlier unit in this lesson wrote a real annotation and proved, by actually running code, that Python itself never checks it; this unit is the first time in this lesson anything actually does check one - and the very first real run against this backend's own code already found something real, on the exact file this lesson's own first unit started with.

## Connect the pieces

One real function, `parse_float`, moving through every construct this lesson built: its own real `text: str -> float` annotation (Annotations and Return Types) is shown to be pure metadata by calling it with a real `int` and watching it succeed anyway; its sibling functions in the same real file use `Optional[int]` return types (Optional) for exactly the same reason `GitLabService`'s own constructor uses `Optional[str]` parameters - a real, legitimate "or nothing" case, the fixed two-member special case of the fully general `Union` (Unions) this lesson's own lab built directly, since nothing in this backend's real code needed the general form. The same file's own `position_counters: Dict[Tuple[int, int], int]` (Collection Type Hints) states a real, compound shape a bare `dict` couldn't. And finally, `mypy` (Static Analysis) - installed fresh this session, genuinely new to this project - reads every one of these real annotations without running a single line of the program they belong to, and on its very first real run against this exact file, finds a real, live gap between what three lines claim and what they actually risk.

**Next lesson:** When a bundle of related values - built so far as loose parameters, a plain dict, or a bare tuple - is worth turning into its own real, named type, and what that choice actually buys over the shapes this lesson and the one before it already used.