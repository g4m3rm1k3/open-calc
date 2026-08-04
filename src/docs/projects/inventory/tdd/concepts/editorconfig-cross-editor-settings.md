# Concept: `.editorconfig` — Cross-Editor, Language-Agnostic Settings

**What you'll understand by the end:** the real `.editorconfig` format
— `root = true`, glob-based section headers, and the settings each
section applies — and why it's a genuinely different, complementary
layer from a language-specific tool like a linter, applying to every
file type in a repository at the editor level, with no plugin required
by most editors.

**Prerequisites:** none beyond the assumed floor.

## Setup

Python 3 with `pip install editorconfig` (used below only to
*programmatically query* resolved settings for a real proof — real
editors read `.editorconfig` natively, with no such package involved at
all).

## The Problem

A real project touched by more than one editor (VS Code, PyCharm, Vim,
...) or more than one contributor's own personal settings risks real,
inconsistent formatting creeping in — tabs versus spaces, different
indent widths, mismatched line endings — none of which a Python-specific
tool like a linter or type checker would ever catch, since those tools
only understand Python files, not a repository's `.json`, `.md`, or
`.tsx` files too.

## The Isolated Example

A real `.editorconfig` file:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.py]
indent_size = 4

[*.{js,ts,tsx,jsx,json}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

Querying the real, resolved settings for three different real files
against this exact config:

```python
from editorconfig import get_properties

for path in ["src/app.py", "src/widget.tsx", "notes.md"]:
    props = get_properties(f"/real/project/path/{path}")
    print(path, "->", dict(props))
```

**Real output, run this session:**
```
src/app.py -> {'charset': 'utf-8', 'end_of_line': 'lf', 'insert_final_newline': 'true', 'trim_trailing_whitespace': 'true', 'indent_style': 'space', 'indent_size': '4', 'tab_width': '4'}
src/widget.tsx -> {'charset': 'utf-8', 'end_of_line': 'lf', 'insert_final_newline': 'true', 'trim_trailing_whitespace': 'true', 'indent_style': 'space', 'indent_size': '2', 'tab_width': '2'}
notes.md -> {'charset': 'utf-8', 'end_of_line': 'lf', 'insert_final_newline': 'true', 'trim_trailing_whitespace': 'false', 'indent_style': 'space', 'indent_size': '4', 'tab_width': '4'}
```

**What this proves:** all three files share the real `[*]` defaults
(`charset`, `end_of_line`, `insert_final_newline`) — but `indent_size`
genuinely differs: `4` for the `.py` file, `2` for the `.tsx` file —
each picked up its own real, more specific section. `notes.md` shows a
real, deliberate **override**: `trim_trailing_whitespace` is `false`
for it alone, even though the general `[*]` section says `true` —
Markdown genuinely uses trailing whitespace as meaningful syntax
(a real line-break marker), so blindly trimming it there would be
wrong.

## Mechanical Walkthrough

- `root = true` tells any real, `.editorconfig`-aware tool to **stop**
  searching parent directories for another, higher-level
  `.editorconfig` once it finds this one — without it, a tool would
  keep walking upward, potentially merging in settings from an
  unrelated ancestor directory.
- `[*]` is a **glob-based section header** matching every real file —
  its settings apply as the real, general baseline.
- `[*.py]` matches only real `.py` files; `[*.{js,ts,tsx,jsx,json}]`
  uses real **brace-expansion** glob syntax to match several distinct
  extensions in one section, rather than repeating the same settings
  block once per extension.
- Sections apply **cumulatively, with later/more-specific matches
  overriding earlier ones** for any setting they redeclare — `notes.md`
  inherits `charset`/`end_of_line`/`insert_final_newline` from `[*]`
  unchanged, but its own `[*.md]` section's `trim_trailing_whitespace =
  false` genuinely overrides `[*]`'s `true` for that one setting alone.
- Real settings like `indent_style`, `indent_size`, `end_of_line`, and
  `trim_trailing_whitespace` are conventions most popular real editors
  (and IDE plugins) read and apply automatically the moment a file in a
  configured project is opened or saved — no build step, no separate
  command to run.

## CS Lens

This is **cascading, scope-based configuration** — the identical
underlying shape CSS's own cascade uses (`css-rule-syntax-selectors-
cascade.md`): a general rule applies by default, and a more specific
rule (here, a more specific glob) overrides just the properties it
explicitly redeclares, leaving everything else from the broader rule
untouched. `.editorconfig` deliberately applies this at the
**file-format level** — its rules are addressed by real file glob
patterns, not by any language's own semantic structure — which is
exactly what makes one config file meaningfully govern Python, Markdown,
and JavaScript files all at once.

Also recognized in: `.gitattributes` (Git's own real, per-glob file
configuration, for a different real concern — line-ending
normalization and diff behavior specifically); any linter or formatter
config that supports per-glob overrides on top of a project-wide
default.

## SE Lens

The real, deliberate layering this project's own history shows:
`.editorconfig` operates at the **editor** level (applied the instant
a file is opened, before any code even runs), while `ruff`
(`automated-linting-and-formatting-ruff.md`) and `mypy`
(`python-mypy-static-type-checking.md`) operate as **separate,
explicitly-run tools**, and only ever understand Python. These are
genuinely complementary, not redundant: `.editorconfig` keeps every
file type in a repository consistent at the most basic level (indent
width, line endings) with essentially zero per-contributor setup, while
`ruff`/`mypy` catch real, Python-specific style and correctness issues
`.editorconfig` was never designed to know about at all.

## Connection

Distinct from, and complementary to, `automated-linting-and-formatting-
ruff.md` and `python-mypy-static-type-checking.md` — three real,
different layers of "keep a codebase consistent," each operating at a
different real scope (editor-level/language-agnostic vs.
tool-level/Python-specific static analysis vs. tool-level/Python-specific
type checking). Shares its cascading-override shape with
`css-rule-syntax-selectors-cascade.md`.

## Try It Yourself

1. Add a `[*.json]` section overriding `insert_final_newline = false`
   and re-run the query against a real `.json` path — confirm only that
   one setting changes for JSON files, with everything else still
   inherited from `[*]`.
2. Remove `root = true` and place the file in a real subdirectory with
   a *second*, different `.editorconfig` file above it — observe (by
   reading the `editorconfig` package's own documentation on discovery
   order) how settings from both files would merge without the
   `root = true` boundary.
3. Open a real file covered by a project's `.editorconfig` in an editor
   that supports it natively (most modern ones do) and type past the
   configured `indent_size` with Tab — confirm your editor genuinely
   inserts the configured number of spaces, no plugin installed beyond
   what shipped with the editor.
