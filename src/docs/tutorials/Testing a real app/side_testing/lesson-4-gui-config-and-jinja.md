# Lesson 4: A Fake GUI's Rules as Data, and Rendering with Jinja

Same rules as Lessons 1-3: every block tagged `SCRATCH` or `→ goes in
<file>`, every output actually run this session, CRC-lite on Header
entries.

## What you will build

Two things, in order. First: your real GUI's rules (allowed tool types,
feedrate limits, whatever it checks) get represented as a plain
`GuiConfig` dataclass instead of hardcoded `if` statements — the same
object could later be built *from* your real GUI's widgets, but the
validation logic itself never needs to know that; it just reads a config
object. Second: the merged, validated result from Lesson 3 gets rendered
into a human-readable report through a real Jinja template, the same
tool you said you already use to pass data through.

## What you need to know first

Everything from Lessons 1-3: dataclasses, the I/O-vs-logic split, regex,
`ElementTree`, error-collecting validation, dict/set comprehensions,
`pytest`.

## Terms used in this lesson

- **Config-driven validation** — validation whose *thresholds* (not just
  the values being checked) come from an external object, rather than
  being written as literal numbers inside the check itself. It exists so
  the same validation function serves multiple rule sets — a
  looser-for-prototyping config and a strict-for-production config — with
  zero code changes, only a different config object passed in.
- **Template** — a text file containing both literal text and small
  placeholders that get replaced with real values at render time. It
  exists to separate "what the output should look like" (the template,
  which a non-programmer could plausibly edit) from "how to compute the
  values that go into it" (your Python code, which shouldn't need to
  change every time someone wants the report's wording tweaked).
- **Render (templating)** — the act of combining a template with a
  concrete set of values (a "context") to produce final text. It exists
  as its own verb because the same template can be rendered many times
  with different contexts, producing different output text each time
  from one unchanging template file.
- **Environment (Jinja)** — a Jinja object that knows *where* to find
  template files and holds shared configuration (custom functions,
  autoescaping rules) for every template loaded through it. It exists
  because a single `Template(...)` object (as used in this lesson's
  first lab) only handles one inline string; real projects load
  templates from files, and something has to know which directory to
  look in.

## Objects and methods used

- **`jinja2.Template(string)`**
  *What it is:* the simplest way to compile one template directly from a
  Python string, with no file involved.
  *Implementation:* `Template("Hello {{ name }}").render(name="Alex")`
  → `"Hello Alex"`.
  *Its use:* the isolated labs below, where a tiny inline string is
  enough to prove Jinja's substitution and loop syntax without needing a
  real file on disk yet.
- **`jinja2.Environment(loader=...)`**
  *What it is:* the real-project way to work with templates that live in
  files rather than inline strings.
  *Implementation:* `Environment(loader=FileSystemLoader("."))` then
  `env.get_template("name.jinja")` returns a `Template` object, same
  `.render(...)` method as above.
  *Its use:* loading your actual `report.txt.jinja` file from disk.
- **`jinja2.FileSystemLoader(directory)`**
  *What it is:* a loader telling an `Environment` where on disk to look
  for template files by name.
  *Implementation:* `FileSystemLoader(".")` means "look in the current
  directory."
  *Its use:* passed into `Environment(loader=...)` — the two are always
  used together in this lesson.

---

## Concept Unit 1: Rules as data, not as `if` statements

### The Problem

Lesson 3's `validate_merged_operation` hardcoded its thresholds directly
in the code: `if op.feedrate_ipm <= 0`. A real GUI presumably lets
someone configure what counts as "too low" or "too high," per shop, per
material, whatever. If those numbers are baked into the function itself,
what has to happen every time someone wants to change a limit? What
would you want to be true instead?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
from dataclasses import dataclass

@dataclass
class Limits:
    min_value: float
    max_value: float

def hardcoded_check(x):
    if x < 0.1 or x > 200.0:
        return False
    return True

def config_driven_check(x, limits):
    if x < limits.min_value or x > limits.max_value:
        return False
    return True

loose = Limits(min_value=0.0, max_value=1000.0)
strict = Limits(min_value=0.1, max_value=200.0)

print("hardcoded, x=500:", hardcoded_check(500))
print("config-driven, x=500, loose limits:", config_driven_check(500, loose))
print("config-driven, x=500, strict limits:", config_driven_check(500, strict))
```

Real output:

```
hardcoded, x=500: False
config-driven, x=500, loose limits: True
config-driven, x=500, strict limits: False
```

This proves the whole point directly: the exact same value, `500`,
produces two *different, both-correct* answers depending only on which
`Limits` object is passed in — `hardcoded_check` could never do that, no
matter what you passed it, because its thresholds are frozen into the
function's own source code.

### Discard the throwaway example

`Limits`/`hardcoded_check`/`config_driven_check` don't appear again —
only the shape (a small dataclass of thresholds, passed into a check
function as a parameter) carries forward.

### Project Change

- **Reference Source:** none — a fake GUI's rules, by definition, since
  you don't have the real ones yet.
- **Files affected:** new file, `gui_config.py`.
- **Change type:** add.
- **Location:** whole new file.
- **Dependencies:** `dataclasses`.

### The New Code

> **→ goes in `gui_config.py`**

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class GuiConfig:
    """Stands in for whatever your real GUI lets someone configure/toggle."""
    allowed_tool_types: List[str] = field(default_factory=lambda: ["Bull endmill", "Flat endmill", "Drill"])
    min_feedrate: float = 0.1
    max_feedrate: float = 200.0
    min_spindle_rpm: float = 100.0
    max_spindle_rpm: float = 20000.0
    require_tool_name: bool = True
```

### The Updated Project

Brand-new file — full contents shown above, same exemption as every
first-file-of-a-lesson so far.

### Mechanical walkthrough

- `GuiConfig` — one field per rule your fake GUI "exposes." Each field
  has a real default, so `GuiConfig()` with no arguments produces a
  sensible baseline — the same role Lesson 1's `Optional[...] = None`
  defaults played, just with real starting values instead of "unknown"
  ones, since these represent settings, not yet-to-be-parsed data.
- `allowed_tool_types: List[str] = field(default_factory=lambda: [...])`
  — the mutable-default fix from Lesson 1 again, but with a twist: the
  default isn't just `list()` (empty), it's a *specific* starting list.
  `default_factory` accepts any zero-argument callable, not only `list`
  itself — `lambda: [...]` is a tiny anonymous function returning that
  specific list, called fresh each time a `GuiConfig` is constructed
  without overriding this field, so two different `GuiConfig()` instances
  still don't share the same list object.
- `min_feedrate: float = 0.1` (and the other plain-number fields) — for
  contrast with `allowed_tool_types`: a plain literal default is fine
  here, with no `field(...)` wrapper needed, precisely because a `float`
  isn't mutable — there's no shared-object risk to guard against, the
  same distinction from Lesson 1's mutable-default trap, now showing up
  as "some fields need the guard, some don't," rather than a rule
  applied uniformly.
- `require_tool_name: bool = True` — a plain boolean toggle, representing
  the kind of on/off checkbox a real GUI plausibly has.

### CS lens

This is a lightweight instance of the **Strategy pattern** — behavior
(here, validation thresholds) supplied from outside a function as data or
an object, rather than fixed inside it, so the same function can behave
differently per caller. Also recognized in: application config files
(`.env`, `config.yaml`), feature flags, and any settings screen in real
software — a settings screen is, structurally, a GUI for editing exactly
this kind of config object.

### SE lens

The alternative — keep validation thresholds as literals inside
`if`-statements — is simpler to read for a fixed, never-changing rule.
It stops working the moment two different runs need two different
thresholds (a looser config while prototyping, a strict one before
sending to the machine) — you'd need two nearly-identical copies of the
validation function, one per rule set, which is a maintenance trap: a bug
fixed in one copy has to be remembered and fixed in the other by hand.

### Run it

Real output pasted above.

### Connect

You have a config object. Next: a validator that actually reads from it
instead of its own hardcoded numbers.

---

## Concept Unit 2: Validation that reads the config

### The Problem

Lesson 3's `validate_merged_operation` and this lesson's `GuiConfig` are
still two separate, unconnected things. Given the shape of
`validate_merged_operation` from Lesson 3 (a loop of independent `if`s,
each calling `result.add`), what changes if every literal number in it
gets replaced with `config.some_field`?

### The New Code

> **→ goes in `gui_validate.py`**

```python
from gui_config import GuiConfig
from merge import ValidationResult


def validate_against_gui_config(op, config, result):
    """Same shape as merge.py's validate_merged_operation, but every
    threshold comes from config instead of being hardcoded."""
    path = op.op_id

    if config.require_tool_name and op.tool_name is None:
        result.add(path, "no tool name from either source")

    if op.tool_type is not None and op.tool_type not in config.allowed_tool_types:
        result.add(path, f"tool type '{op.tool_type}' not in allowed types {config.allowed_tool_types}")

    if op.feedrate_ipm is not None:
        if not (config.min_feedrate <= op.feedrate_ipm <= config.max_feedrate):
            result.add(
                path,
                f"feedrate {op.feedrate_ipm} outside allowed range "
                f"[{config.min_feedrate}, {config.max_feedrate}]",
            )

    if op.spindle_rpm is not None:
        if not (config.min_spindle_rpm <= op.spindle_rpm <= config.max_spindle_rpm):
            result.add(
                path,
                f"spindle speed {op.spindle_rpm} outside allowed range "
                f"[{config.min_spindle_rpm}, {config.max_spindle_rpm}]",
            )


def validate_all_against_gui_config(merged_ops, config):
    result = ValidationResult()
    for op in merged_ops:
        validate_against_gui_config(op, config, result)
    return result
```

### Small addition needed in `merge.py`

To check tool *type* (not just tool name) against `allowed_tool_types`,
`MergedOperation` needs a `tool_type` field, populated from the XML
side's `Tool.tool_type` — the same field Lesson 2's `Tool` dataclass
already carries, just not previously copied into the merged result.

> **→ change in `merge.py`**

```python
@dataclass
class MergedOperation:
    op_id: str
    op_type: Optional[str] = None
    tool_name: Optional[str] = None
    tool_type: Optional[str] = None        # ← new field
    feedrate_ipm: Optional[float] = None
    spindle_rpm: Optional[float] = None
    depth: Optional[float] = None
```

And inside `merge_operation`, alongside where `tool_name` is set from
`xml_op.tool.name`:

```python
tool_type = xml_op.tool.tool_type   # ← new, set right next to tool_name
```

### Mechanical walkthrough

- `def validate_against_gui_config(op, config, result):` — identical
  parameter shape to Lesson 3's `validate_merged_operation`, with one
  addition: `config` is now a required parameter, not implied by
  hardcoded literals.
- `if config.require_tool_name and op.tool_name is None:` — the boolean
  toggle from `GuiConfig` now actually gates whether this check runs at
  all, not just what threshold it uses; `and` short-circuits, so
  `op.tool_name` is never even evaluated as a concern when
  `require_tool_name` is `False`.
- `if op.tool_type is not None and op.tool_type not in config.allowed_tool_types:`
  — `not in` tests set/list membership; guarding with
  `op.tool_type is not None` first means an operation with no tool at
  all (already caught by the tool-name check above) doesn't also
  generate a confusing second error about tool *type*.
- `if not (config.min_feedrate <= op.feedrate_ipm <= config.max_feedrate):`
  — Python's chained comparison syntax: `a <= b <= c` is a single
  readable expression meaning "b is between a and c, inclusive," rather
  than writing `a <= b and b <= c` by hand. `not (...)` around the whole
  chain reads as "outside this range," matching the plain-English rule
  more directly than double-negating each half separately.
- `validate_all_against_gui_config(merged_ops, config)` — the small
  orchestration function looping the whole merged list through one
  config, same shape as `merge_and_validate`'s own loop in Lesson 3.

### Run it

Same merged data from Lesson 3, checked against two different configs:

```python
merged = [...]  # from merge_by_id, real sample data
default_config = GuiConfig()
result = validate_all_against_gui_config(merged, default_config)
print('default config, is_valid:', result.is_valid)

strict_config = GuiConfig(min_feedrate=10.0, allowed_tool_types=['Drill'])
result2 = validate_all_against_gui_config(merged, strict_config)
print('strict config, is_valid:', result2.is_valid)
for e in result2.errors:
    print(' -', e.path, ':', e.message)
```

Real output:

```
default config, is_valid: True
strict config, is_valid: False
 - 1101 : tool type 'Bull endmill' not in allowed types ['Drill']
 - 1102 : feedrate 7.9456 outside allowed range [10.0, 200.0]
```

Same merged operations, no code changed between the two calls — only the
`GuiConfig` object passed in changed, and the verdict changed with it.
That's the entire payoff of Concept Unit 1, made concrete.

### CS lens

Passing behavior-shaping data into an otherwise-fixed function, and
getting a different (still correct) result back, is the same idea named
in Concept Unit 1's CS lens — the Strategy pattern — now actually wired
into real validation instead of a toy example.

### SE lens

You could instead have `GuiConfig` hold actual *functions* (one callable
per rule) rather than plain thresholds, letting someone plug in
arbitrary custom logic, not just numeric ranges. That's more powerful and
more flexible — and also harder to build a GUI for (a slider or dropdown
maps naturally to a number or a list of choices; it doesn't map naturally
to "type in a Python function"). Plain-data config is the right choice
specifically because a GUI is the thing generating it.

### Connect

Validation now reads real, swappable rules. Last piece: showing the
result to an actual human, through the templating tool you already use.

---

## Concept Unit 3: Jinja basics, in isolation

### The Problem

You already have a `ValidationResult` full of structured errors and a
list of `MergedOperation` objects. Turning that into readable text by
hand would mean a lot of `print(f"...")` calls mixed into your validation
code. What would you want instead, if you wanted someone who *isn't* a
programmer to be able to change the report's wording or layout without
touching your Python?

### Introduce the concept in isolation

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
from jinja2 import Template

t = Template("Hello {{ name }}, you have {{ count }} item{{ 's' if count != 1 else '' }}.")
print(t.render(name="Alex", count=3))
print(t.render(name="Sam", count=1))
```

Real output:

```
Hello Alex, you have 3 items.
Hello Sam, you have 1 item.
```

This proves `{{ ... }}` is a placeholder — Jinja evaluates whatever
Python-like expression sits inside it (a plain variable, `name`, or a
small conditional expression, `'s' if count != 1 else ''`) using the
values passed to `.render(...)` as keyword arguments, and substitutes the
result directly into the surrounding text. The exact same `Template`
object produced two different strings, once per `.render()` call, with
no re-compiling needed.

Next, loops and conditionals across multiple lines:

> **SCRATCH — run it yourself, then discard it. Never saved anywhere.**

```python
from jinja2 import Template

t = Template("""{% for item in items %}
{{ item.name }}: {{ "OK" if item.ok else "FAIL" }}
{%- endfor %}""")
items = [{"name": "a", "ok": True}, {"name": "b", "ok": False}]
print(t.render(items=items))
```

Real output:

```

a: OK
b: FAIL
```

This proves `{% for ... %}...{% endfor %}` is Jinja's loop syntax
(distinct from `{{ }}`, which only ever produces a value — `{% %}` holds
control-flow statements that don't themselves produce output), and that
`item.name` works on plain Python dicts the same way it would on an
object's attribute — Jinja doesn't distinguish `item["name"]` from
`item.name` inside a template, trying attribute access first and falling
back to key lookup. The leading blank line in the output comes from the
newline right after `{% for item in items %}` in the template source
itself, before the loop body — worth noticing now, since Concept Unit 4's
real template uses `{%- endfor %}`'s `-` (a whitespace-control marker,
stripping the newline immediately before that tag) specifically to avoid
this in the real report.

### Discard the throwaway examples

Neither `t` object nor `items` appear again — only the `{{ }}`/`{% %}`
syntax carries forward into the real template file.

### Connect

You've now proven Jinja's two core pieces — value substitution and
loops — work exactly as expected, using inline strings. Next: the same
syntax, in a real `.jinja` file, fed your actual merged and validated
data.

---

## Concept Unit 4: Rendering the real report

### The Problem

Given everything proven in Concept Unit 3, and given that your merged
operations and validation errors are two *separate* objects
(`merged_ops`, a `ValidationResult`), how would a template loop over
operations while also finding "just the errors that belong to this one
operation" — when the errors list isn't grouped by operation at all,
just one flat list with a `path` field on each?

### The New Code

> **→ goes in `report.txt.jinja`**

```jinja
Setup Sheet Validation Report
==============================
Overall status: {{ "PASS" if result.is_valid else "FAIL" }}

{% for op in operations -%}
Operation {{ op.op_id }} ({{ op.op_type }})
  Tool: {{ op.tool_name }} [{{ op.tool_type }}]
  Feedrate: {{ op.feedrate_ipm }} in/min
  Spindle: {{ op.spindle_rpm }} RPM
{% for error in errors_for(op.op_id) -%}
  ERROR: {{ error }}
{% endfor -%}
{% endfor %}
```

> **→ goes in `render_report.py`**

```python
from jinja2 import Environment, FileSystemLoader


def render_report(merged_ops, result, template_dir=".", template_name="report.txt.jinja"):
    """Pure-ish: takes already-built data, returns a string. Template file is the only I/O."""
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template(template_name)

    def errors_for(op_id):
        return [e.message for e in result.errors if e.path == op_id]

    return template.render(operations=merged_ops, result=result, errors_for=errors_for)
```

### The Updated Project

Both are new files — full contents shown above.

### Mechanical walkthrough

- `{{ "PASS" if result.is_valid else "FAIL" }}` — a conditional
  expression inside a value placeholder, same shape as Concept Unit 3's
  `count != 1` example, now reading a real attribute
  (`result.is_valid`, the `@property` from `ValidationResult`) instead of
  a plain passed-in variable.
- `{% for op in operations -%}` — the `-` immediately before `%}` is a
  **whitespace-control marker**: it strips the newline that would
  otherwise follow this tag in the rendered output, which is exactly the
  extra-blank-line behavior noticed (and predicted) at the end of Concept
  Unit 3.
- `op.op_id`, `op.op_type`, etc. — real dataclass attribute access, same
  `item.name`-on-a-dict mechanism from Concept Unit 3's second lab, here
  working on real `MergedOperation` instances instead of plain dicts —
  Jinja doesn't care which one it's given, as noted above.
- `{% for error in errors_for(op.op_id) -%}` — this is the answer to the
  Problem above: `errors_for` isn't a Jinja built-in, it's an ordinary
  Python function, defined inside `render_report` and passed into
  `.render(...)` as a keyword argument (`errors_for=errors_for`) exactly
  like `operations` and `result` are. Jinja allows calling any passed-in
  function from inside a template, with normal-looking function-call
  syntax — so `errors_for(op.op_id)` inside the template runs the real
  Python function, filtering `result.errors` down to just the ones whose
  `path` matches this operation's `op_id`, every time the loop reaches a
  new operation.
- `def errors_for(op_id): return [e.message for e in result.errors if
  e.path == op_id]` — a list comprehension with a filter clause (the
  `if e.path == op_id` at the end): build a list of `.message` values,
  but only from errors whose `.path` matches. This closes over
  `result` from the enclosing `render_report` function — a **closure**:
  `errors_for` doesn't need `result` passed to it directly because it
  was defined *inside* a function that already has `result` in scope,
  and it keeps access to that specific `result` value even once called
  from inside the template, elsewhere.
- `Environment(loader=FileSystemLoader(template_dir))` /
  `env.get_template(template_name)` — the two Objects/methods explained
  in the Header, now used together for real: point the loader at a
  directory, ask the environment for a template by filename.

### Real output

Rendering the real merged Lesson-3 data against the strict config from
Concept Unit 2:

```
Setup Sheet Validation Report
==============================
Overall status: FAIL

Operation 1101 (2D High Speed)
  Tool: 0.5 Bull endmill [Bull endmill]
  Feedrate: 48.132 in/min
  Spindle: 4584.0 RPM
ERROR: tool type 'Bull endmill' not in allowed types ['Drill']
Operation 1102 (Drill/Counterbore)
  Tool: .3125 CT 1"LOC [Drill]
  Feedrate: 7.9456 in/min
  Spindle: 3178.0 RPM
ERROR: feedrate 7.9456 outside allowed range [10.0, 200.0]
```

Each operation's error appears directly under that operation, and only
that operation — proof `errors_for` is actually filtering per-operation,
not just dumping every error under every operation.

### CS lens

Separating "what the output looks like" (the `.jinja` file — closer to
a designer/non-programmer's territory) from "what data goes into it"
(Python building `merged_ops`/`result`) is the **separation of
presentation from logic** idea, one of the oldest ideas in software
design for exactly this reason: a report's wording changes far more
often, and far more casually, than the logic computing its numbers does
— coupling them means every wording tweak risks touching code that
actually matters.

### SE lens

You could build the report string with plain Python f-strings instead —
no new dependency, no new file format to learn. That's a real, valid
choice for something this size. Jinja earns its cost (a library
dependency, template-syntax rules to learn) specifically when the report
format itself needs to change often, needs conditionals/loops that would
get unreadable as nested f-strings, or — your actual stated reason —
you're already using it elsewhere, so this report becomes one more
consumer of a tool you've already paid the learning cost for, rather than
a second, different templating approach living alongside it.

### Connect

You now have a full, real pipeline: parse two sources (Lessons 1-2),
merge and structurally validate them (Lesson 3), validate again against
swappable, GUI-shaped rules (this lesson's Units 1-2), and render a
human-readable report from the result (this lesson's Units 3-4) — with
every stage independently tested.

---

## Concept Unit 5: Testing config-driven validation and the report

### The New Code

> **→ goes in `test_gui_and_report.py`**

```python
import pytest
from merge import MergedOperation, ValidationResult
from gui_config import GuiConfig
from gui_validate import validate_against_gui_config, validate_all_against_gui_config
from render_report import render_report


def op(**overrides):
    base = dict(op_id="1101", op_type="2D High Speed", tool_name="0.5 Bull endmill",
                tool_type="Bull endmill", feedrate_ipm=48.0, spindle_rpm=4000.0, depth=0.0)
    base.update(overrides)
    return MergedOperation(**base)


def test_passes_default_config():
    result = ValidationResult()
    validate_against_gui_config(op(), GuiConfig(), result)
    assert result.is_valid

def test_disallowed_tool_type_fails():
    result = ValidationResult()
    config = GuiConfig(allowed_tool_types=["Drill"])
    validate_against_gui_config(op(), config, result)
    assert not result.is_valid
    assert "not in allowed types" in result.errors[0].message

def test_feedrate_below_min_fails():
    result = ValidationResult()
    config = GuiConfig(min_feedrate=100.0)
    validate_against_gui_config(op(feedrate_ipm=48.0), config, result)
    assert not result.is_valid

def test_feedrate_above_max_fails():
    result = ValidationResult()
    config = GuiConfig(max_feedrate=10.0)
    validate_against_gui_config(op(feedrate_ipm=48.0), config, result)
    assert not result.is_valid

def test_spindle_out_of_range_fails():
    result = ValidationResult()
    config = GuiConfig(max_spindle_rpm=1000.0)
    validate_against_gui_config(op(spindle_rpm=4000.0), config, result)
    assert not result.is_valid

def test_missing_tool_name_only_flagged_when_required():
    lenient = GuiConfig(require_tool_name=False)
    strict = GuiConfig(require_tool_name=True)

    result_lenient = ValidationResult()
    validate_against_gui_config(op(tool_name=None), lenient, result_lenient)
    assert result_lenient.is_valid

    result_strict = ValidationResult()
    validate_against_gui_config(op(tool_name=None), strict, result_strict)
    assert not result_strict.is_valid


def test_same_data_different_configs_different_verdicts():
    """The exact point of config-driven validation: identical input, different rules -> different result."""
    same_op = op(feedrate_ipm=48.0)
    loose = validate_all_against_gui_config([same_op], GuiConfig(min_feedrate=0.1, max_feedrate=200.0))
    strict = validate_all_against_gui_config([same_op], GuiConfig(min_feedrate=100.0, max_feedrate=200.0))
    assert loose.is_valid
    assert not strict.is_valid


def test_report_shows_pass_when_valid():
    result = ValidationResult()
    text = render_report([op()], result)
    assert "Overall status: PASS" in text
    assert "1101" in text

def test_report_shows_fail_and_error_text_when_invalid():
    result = ValidationResult()
    result.add("1101", "feedrate too low")
    text = render_report([op()], result)
    assert "Overall status: FAIL" in text
    assert "ERROR: feedrate too low" in text

def test_report_only_shows_errors_under_their_own_operation():
    result = ValidationResult()
    result.add("1101", "only this op's problem")
    ops = [op(op_id="1101"), op(op_id="1102")]
    text = render_report(ops, result)
    op_1102_section = text.split("Operation 1102")[1]
    assert "only this op's problem" not in op_1102_section
```

### Mechanical walkthrough

- `op(**overrides)` — a factory function, same "known-good baseline,
  override one field" role as Lesson 1's `valid_server()` and Lesson 3's
  `xml_op()`/`toolpath_op()`, now written slightly differently:
  `**overrides` collects any keyword arguments the caller passes into a
  dict, `base.update(overrides)` merges them over the defaults, so
  `op(feedrate_ipm=10.0)` overrides just that one field while everything
  else keeps its baseline value.
- The six `validate_against_gui_config` tests each isolate exactly one
  rule from Unit 2, the same "one baseline, one field changed, one
  assertion" pattern throughout.
- `test_same_data_different_configs_different_verdicts` — this is the
  test that most directly proves Concept Unit 1's entire premise:
  literally the same `op()` object, passed through the same validation
  function, produces opposite verdicts purely because of which
  `GuiConfig` was passed alongside it.
- `test_report_only_shows_errors_under_their_own_operation` —
  `text.split("Operation 1102")[1]` splits the rendered report string at
  that literal marker and keeps everything *after* it, then asserts the
  1101-specific error text doesn't leak into that section — directly
  testing `errors_for`'s filtering, through the rendered text itself,
  not by calling `errors_for` directly.

### Run it

Actually run with `python3 -m pytest test_gui_and_report.py -v`. Real
output:

```
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.1.1, pluggy-1.6.0
collecting ... collected 10 items

test_gui_and_report.py::test_passes_default_config PASSED                          [ 10%]
test_gui_and_report.py::test_disallowed_tool_type_fails PASSED                     [ 20%]
test_gui_and_report.py::test_feedrate_below_min_fails PASSED                       [ 30%]
test_gui_and_report.py::test_feedrate_above_max_fails PASSED                       [ 40%]
test_gui_and_report.py::test_spindle_out_of_range_fails PASSED                     [ 50%]
test_gui_and_report.py::test_missing_tool_name_only_flagged_when_required PASSED   [ 60%]
test_gui_and_report.py::test_same_data_different_configs_different_verdicts PASSED [ 70%]
test_gui_and_report.py::test_report_shows_pass_when_valid PASSED                   [ 80%]
test_gui_and_report.py::test_report_shows_fail_and_error_text_when_invalid PASSED  [ 90%]
test_gui_and_report.py::test_report_only_shows_errors_under_their_own_operation PASSED [100%]

============================== 10 passed in 0.04s ==============================
```

---

## Connect the pieces

One config field, `allowed_tool_types=["Drill"]`, traced end to end:
`GuiConfig` (Unit 1) holds it as a plain field. `validate_against_gui_config`
(Unit 2) reads `config.allowed_tool_types` and checks
`op.tool_type not in config.allowed_tool_types` for operation `1101`,
whose `tool_type` (set during merging back in Lesson 3, extended this
lesson to also copy `tool_type`) is `"Bull endmill"` — not in the
list — so `result.add("1101", "tool type 'Bull endmill' not in allowed
types ['Drill']")` fires. That error, with its `path` of `"1101"`, sits
in `result.errors` as one entry among possibly many. `render_report`
(Unit 4) passes `result` and `errors_for` into the template;
`{% for op in operations %}` reaches operation `1101`;
`errors_for("1101")` filters `result.errors` down to just this one
message; the template prints it directly under that operation's own
block, nowhere else. `test_disallowed_tool_type_fails` and
`test_report_only_shows_errors_under_their_own_operation` (Unit 5) each
independently reprove pieces of this same chain, without trusting that
the other layers got it right.

---

## Files for this lesson

`gui_config.py`, `gui_validate.py`, `report.txt.jinja`, `render_report.py`,
`test_gui_and_report.py`, and the updated `merge.py` (with the new
`tool_type` field) are attached, along with `requirements.txt` for the
one new dependency. `pip install -r requirements.txt` then
`python3 -m pytest test_gui_and_report.py -v` runs everything.

## Where this goes from here

Once you have your real GUI's actual widgets and rules, `GuiConfig`
becomes the object your GUI code builds from whatever the user picked —
same validation functions, same report template, no changes needed to
either. If you want, the next lesson can cover building that config
object *from* a real GUI framework (Tkinter, PyQt, whatever you're
using) instead of constructing it by hand in Python like this lesson did.
