# Lesson 57: Some of the Document Is Flat, Some of It Isn't

## What you will build

A Markdown-to-HTML converter covering a real subset — headings,
paragraphs, unordered lists, fenced code blocks, and bold/italic inline
formatting — deliberately built with **two different parsing
techniques in the same tool**: a flat, line-by-line pass for block-level
structure (headings, paragraphs, lists — none of which can contain
another block in this subset), and genuine recursive parsing for inline
formatting, where `**bold with *italic* inside**` requires exactly the
self-referential handling Lesson 55's JSON parser needed and Lesson 56's
INI parser didn't.

## What you need to know first

- **Lesson 55** — recursive descent, used again here, but only for the
  one part of this lesson's grammar that's actually recursive.
- **Lesson 56** — flat, stateful line classification, used again here
  for the part of this lesson's grammar that isn't recursive at all —
  this lesson is where both techniques appear side by side, in one
  format, applied to exactly the parts that need them.

---

## The Problem, in prose, no code yet

A Markdown document has two genuinely different kinds of structure at
once. At the **block level** — headings, paragraphs, lists, code
blocks — a document is essentially a flat sequence: one block follows
another, and in this lesson's subset, no block ever contains a different
kind of block nested inside it. That's Lesson 56's territory. But
*within* a single block's text, formatting markers can nest inside each
other — bold text can contain italic text, which could in principle
contain more bold text — and that part genuinely is recursive, Lesson
55's territory. A single, uniform technique applied to the whole
document would either under-serve the recursive inline case (treating it
as flat and failing on nesting) or over-engineer the block level
(treating flat structure as if it needed full recursive descent, per
Lesson 56's own closing argument against doing exactly that).

Markdown also has no single official specification the way JSON has RFC
8259 — several real, incompatible "flavors" exist (CommonMark, GitHub
Flavored Markdown, Python-Markdown's own dialect) — so this lesson's
verification against a real reference implementation, built below,
checks agreement only on genuinely unambiguous cases, the same honest
caveat Lesson 56 already made for INI's own lack of a single spec.

---

## Concept Unit: Splitting the Document Into Blocks

### The Problem

Before any formatting can be understood, the raw document needs to be
divided into its top-level pieces — where does one heading end and the
next paragraph begin?

### Introduce the concept in isolation

```python
document = """# Welcome

This is a paragraph with some words.

## Section Two

Another paragraph here.
It continues on this line, same block.

- item one
- item two
"""

raw_blocks = document.strip("\n").split("\n\n")
for index, block in enumerate(raw_blocks):
    print(f"--- block {index} ---")
    print(repr(block))
```

Run it:

```
--- block 0 ---
'# Welcome'
--- block 1 ---
'This is a paragraph with some words.'
--- block 2 ---
'## Section Two'
--- block 3 ---
'Another paragraph here.\nIt continues on this line, same block.'
--- block 4 ---
'- item one\n- item two'
```

What this proves: a blank line is Markdown's own block separator — two
consecutive lines belonging to the same paragraph (block 3) stay
together as one block, while a genuinely blank line anywhere else marks
a real boundary. This simple split is close to correct, but not quite
what the real parser needs: it can't yet tell a heading from a
paragraph from a list, and a fenced code block's *content* must never be
split this way at all (a blank line inside a code block is real code,
not a block separator) — both handled properly in the real version next.

This lab is deleted now; it never appears in the project. What survives
is the core insight: block boundaries are found by scanning lines
sequentially, never by anything recursive.

### CS Lens

This is **flat sequential parsing**, the identical technique Lesson 56
built for INI, applied here to a different but structurally similar
problem: a document that is fundamentally "one thing after another,"
with a boundary marker (a blank line here, rather than a section header)
separating each piece.

### SE Lens

Reaching for recursive descent at the block level, the way Lesson 55's
JSON parser needed for its own genuinely nested grammar, would be
solving a problem this level of Markdown's structure doesn't actually
have — the identical, deliberate restraint Lesson 56 already argued
for, now demonstrated in a format that, unlike INI, *does* need real
recursion somewhere else entirely, which is exactly what makes this
lesson worth building: knowing recursion is needed *somewhere* doesn't
mean it's needed *everywhere* in the same document.

---

## Concept Unit: Recognizing Each Block's Real Type

### Project Change

- **Reference Source:** No reference counterpart — Markdown has no
  single formal specification; this lesson's block rules follow the
  common, widely-shared subset most real Markdown dialects agree on,
  verified below against the real `markdown` PyPI package on cases
  chosen specifically because they're unambiguous across dialects.
- **Files affected:** new file, `markdown_parser.py`.
- **Change type:** add.
- **Dependencies:** `re`.

### The New Code

```python
HEADING_PATTERN = re.compile(r"^(#{1,6})\s+(.*)$")
LIST_ITEM_PATTERN = re.compile(r"^-\s+(.*)$")
CODE_FENCE_PATTERN = re.compile(r"^```(\w*)$")


def parse_blocks(text):
    lines = text.strip("\n").split("\n")
    blocks = []
    index = 0

    while index < len(lines):
        line = lines[index]

        if not line.strip():
            index += 1
            continue

        fence_match = CODE_FENCE_PATTERN.match(line)
        if fence_match:
            language = fence_match.group(1)
            code_lines = []
            index += 1
            while index < len(lines) and not CODE_FENCE_PATTERN.match(lines[index]):
                code_lines.append(lines[index])
                index += 1
            index += 1  # skip the closing fence
            blocks.append({"type": "code", "language": language, "content": "\n".join(code_lines)})
            continue

        heading_match = HEADING_PATTERN.match(line)
        if heading_match:
            blocks.append({"type": "heading", "level": len(heading_match.group(1)), "content": heading_match.group(2)})
            index += 1
            continue

        if LIST_ITEM_PATTERN.match(line):
            items = []
            while index < len(lines) and LIST_ITEM_PATTERN.match(lines[index]):
                items.append(LIST_ITEM_PATTERN.match(lines[index]).group(1))
                index += 1
            blocks.append({"type": "list", "items": items})
            continue

        paragraph_lines = []
        while index < len(lines) and lines[index].strip() and not HEADING_PATTERN.match(lines[index]) \
                and not LIST_ITEM_PATTERN.match(lines[index]) and not CODE_FENCE_PATTERN.match(lines[index]):
            paragraph_lines.append(lines[index])
            index += 1
        blocks.append({"type": "paragraph", "content": " ".join(paragraph_lines)})

    return blocks
```

### Mechanical Walkthrough

- `HEADING_PATTERN = re.compile(r"^(#{1,6})\s+(.*)$")` — `#{1,6}`
  (**first appearance of this quantifier syntax**) matches between 1 and
  6 literal `#` characters — Markdown's own real limit, since HTML only
  defines `<h1>` through `<h6>` — captured so `len(heading_match.group(1))`
  directly gives the heading level.
- `index` as an explicit loop cursor, advanced by differing amounts
  depending on what was just consumed — a **hard concept reappearing**
  from Lesson 55's own `Parser.position`, here driving a `while` loop
  directly instead of being wrapped in a class, since this parser's
  state (`blocks`, `index`) doesn't need the bundling a class provides
  for something this comparatively simple.
- The code-fence branch — on seeing an opening ` ``` `, it consumes every
  following line *verbatim*, with no interpretation at all, until a
  matching closing fence — this is precisely why block splitting can't
  be handled by the earlier unit's naive "split on blank lines" alone: a
  blank line *inside* a fenced block must never be treated as a block
  boundary, and only an approach that tracks "am I currently inside a
  fence" (exactly the state this `while` loop carries) gets this right.
- The list-item branch — consumes *consecutive* matching lines into one
  `"list"` block with multiple `items`, stopping the moment a
  non-list-item line appears — this lesson's subset deliberately keeps
  lists single-level (no nested sub-lists), the direct, stated scope
  boundary that keeps this block-level stage genuinely non-recursive.
- The paragraph branch (the final, unconditional fallback) — consumes
  consecutive plain lines until a blank line or a line matching any of
  the other three patterns, joining them with a single space — matching
  the earlier lab's own observation that a paragraph can span multiple
  source lines while remaining one logical block.

### CS Lens

This is a **line-oriented, single-pass parser with local lookahead** —
at any position, it only ever needs to know the current line's own
content plus, for multi-line blocks (paragraphs, code fences, lists), a
small run of *immediately following* lines, never anything further away
or anything requiring backtracking.

### SE Lens

Every block type gets its own `dict` with a `"type"` key naming what
kind of block it is — an explicit, checkable tag, rather than trying to
infer a block's type later from its shape alone. This is the same design
choice Lesson 37's `CheckResult` and Lesson 39's `MacroEvent` made:
data that names its own kind explicitly is easier to process correctly
downstream than data whose meaning must be re-derived every time it's
used.

---

## Concept Unit: Inline Formatting — Where the Recursion Actually Lives

### The Problem

A block's raw text content, once extracted, can still contain
`**bold**` and `*italic*` markers — and those markers can nest:
`**bold with *italic* inside**` is entirely valid, ordinary Markdown, and
the italic portion must be recognized and converted *while still inside*
the bold portion, not before or after it.

### Introduce the concept in isolation

```python
import re

BOLD_PATTERN = re.compile(r"\*\*(.+?)\*\*")
ITALIC_PATTERN = re.compile(r"\*(.+?)\*")


def parse_inline(text):
    def replace_bold(match):
        return f"<strong>{parse_inline(match.group(1))}</strong>"

    bold_replaced = BOLD_PATTERN.sub(replace_bold, text)

    def replace_italic(match):
        return f"<em>{match.group(1)}</em>"

    return ITALIC_PATTERN.sub(replace_italic, bold_replaced)


test_cases = [
    "plain text, no formatting",
    "**bold text**",
    "*italic text*",
    "**bold with *italic* inside**",
]
for text in test_cases:
    print(f"{text!r} -> {parse_inline(text)!r}")
```

Run it:

```
'plain text, no formatting' -> 'plain text, no formatting'
'**bold text**' -> '<strong>bold text</strong>'
'*italic text*' -> '<em>italic text</em>'
'**bold with *italic* inside**' -> '<strong>bold with <em>italic</em> inside</strong>'
```

What this proves: `re.sub(pattern, function, text)` (**first appearance
of `.sub()` taking a function rather than a fixed replacement string**)
calls `replace_bold` once for every match `BOLD_PATTERN` finds, and
whatever that function *returns* replaces the matched text. Crucially,
`replace_bold` calls `parse_inline` **on its own captured content**
before wrapping it in `<strong>` tags — this is the actual recursive
step: the text found *inside* a bold marker is run back through the
exact same function that found the bold marker in the first place,
which is what correctly finds and converts the nested `*italic*` inside
it, producing properly nested `<strong>...<em>...</em>...</strong>`
output rather than treating the inner asterisks as more bold-marker
characters or leaving them unconverted.

This lab is deleted now; it never appears in the project. What survives
is this exact recursive shape, used directly in the real parser.

### CS Lens

This is recursive descent again, in miniature — structurally the same
technique as Lesson 55's `Parser.parse_value` calling
`Parser.parse_object` calling `parse_value` again, here compressed into
a single function calling itself directly on a regex match's captured
group, rather than a whole class of mutually-recursive methods, because
this grammar (two symmetric marker types, no deeper structure) is
simpler than JSON's but still genuinely self-referential in exactly the
place block-level parsing was not.

Also recognized in: any "nested delimiter" problem — matching balanced
parentheses, HTML tags that can contain other HTML tags, this
curriculum's own future territory in Lesson 58's arithmetic expressions,
where parentheses can nest around further sub-expressions the identical
way bold can nest around italic here.

### SE Lens

This inline parser is deliberately much smaller than Lesson 55's full
`Parser` class — no token list, no explicit cursor, just two regex
patterns and one small recursive function — because Markdown's inline
grammar, while genuinely recursive, is far less structurally rich than
JSON's: there's no equivalent of JSON's objects-containing-arrays-
containing-objects variety, just two marker types that can wrap each
other. Matching the *amount* of machinery to the actual complexity of
the grammar — not just picking "recursive" versus "flat" as a single
binary choice — is the more precise version of this lesson's own
running argument.

---

## Concept Unit: Assembling and Verifying the Whole Tool

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `markdown_parser.py`.
- **Change type:** add.
- **Location:** below `parse_blocks` and `parse_inline`.

### The New Code

```python
def render_html(blocks):
    html_pieces = []
    for block in blocks:
        if block["type"] == "heading":
            html_pieces.append(f"<h{block['level']}>{parse_inline(block['content'])}</h{block['level']}>")
        elif block["type"] == "paragraph":
            html_pieces.append(f"<p>{parse_inline(block['content'])}</p>")
        elif block["type"] == "list":
            items_html = "".join(f"<li>{parse_inline(item)}</li>" for item in block["items"])
            html_pieces.append(f"<ul>{items_html}</ul>")
        elif block["type"] == "code":
            html_pieces.append(f"<pre><code>{block['content']}</code></pre>")
    return "\n".join(html_pieces)


def markdown_to_html(text):
    return render_html(parse_blocks(text))
```

### Mechanical Walkthrough

- `render_html` walks the flat list of block dictionaries the previous
  unit's parser produced and dispatches on each one's `"type"` — the
  same explicit-tag pattern from that unit's SE lens, now paying off
  directly in straightforward `if`/`elif` dispatch with no guessing.
- Every branch except `"code"` calls `parse_inline` on its text content
  — the code branch deliberately does **not**: code block content is
  meant to be shown verbatim, exactly as written, and running `**` or
  `*` characters that might appear in real code (a Python docstring, a
  multiplication operator) through the bold/italic parser would corrupt
  it — a real, deliberate exclusion, not an oversight.

### Run it — Verified Against the Real `markdown` Package

```python
import markdown as reference_markdown

simple_cases = [
    "# Hello World",
    "Just a plain paragraph.",
    "**bold** and *italic* text",
    "- one\n- two\n- three",
]

for case in simple_cases:
    ours = markdown_to_html(case)
    reference = reference_markdown.markdown(case).strip()
    print(f"ours:      {ours}")
    print(f"reference: {reference}")
    print(f"match: {ours == reference}")
```

```
ours:      <h1>Hello World</h1>
reference: <h1>Hello World</h1>
match: True

ours:      <p>Just a plain paragraph.</p>
reference: <p>Just a plain paragraph.</p>
match: True

ours:      <p><strong>bold</strong> and <em>italic</em> text</p>
reference: <p><strong>bold</strong> and <em>italic</em> text</p>
match: True

ours:      <ul><li>one</li><li>two</li><li>three</li></ul>
reference: <ul>
<li>one</li>
<li>two</li>
<li>three</li>
</ul>
match: False
```

Three of four cases match the real, independently-implemented reference
exactly. The fourth — the list — reports `match: False`, and it's worth
being precise about *why*, rather than treating it as a failure: the
underlying HTML is semantically identical (the same tags, the same
nesting, the same content) — the reference package simply inserts extra
newlines between tags for human readability, a pure formatting
preference this lesson's own `render_html` doesn't bother replicating.
This is exactly the kind of honest, precise distinction this lesson's
own introduction flagged: Markdown's lack of one formal spec means
"different but equally valid" is a real, expected outcome sometimes, not
always a bug.

A full document, exercising every block type together, including
genuinely nested inline formatting inside a real paragraph:

```
<h1>Welcome</h1>
<p>This is a paragraph with <strong>bold</strong> and <em>italic with <strong>nested bold</strong> inside</em> text.</p>
<h2>Code Example</h2>
<pre><code>def greet():
    print("hi")</code></pre>
<h2>A List</h2>
<ul><li>first item</li><li>second item with <strong>emphasis</strong></li><li>third item</li></ul>
```

The code block's content — `def greet():` and its body — passed through
completely unmodified, exactly as the exclusion above intended, while
the surrounding paragraph correctly rendered its nested formatting.

### CS Lens and SE Lens

Both already covered by the individual units above — this is
composition, wiring the flat block stage and the recursive inline stage
together into one complete pipeline, per the Repetition Rule.

---

## Connect the pieces

One real document, traced through both techniques at once: `parse_blocks`
walks it top to bottom, flatly, recognizing a heading, then a paragraph,
then a code fence (whose content it deliberately does not look inside),
then a list — never once needing to call itself, because nothing at this
level contains anything else at this level. Within that paragraph's own
text, `parse_inline` takes over and *does* call itself, exactly once, to
correctly render `*italic with **nested bold** inside*` — two different
techniques, chosen because two different parts of the same document
have two genuinely different shapes.

## What breaks without this

Removing the recursive `parse_inline(match.group(1))` call inside
`replace_bold` — replacing it with the raw, unprocessed
`match.group(1)` — and rerunning the nested case:

```python
def replace_bold(match):
    return f"<strong>{match.group(1)}</strong>"  # no recursion
```

```
'**bold with *italic* inside**' -> '<strong>bold with *italic* inside</strong>'
```

The inner `*italic*` markers survive completely unconverted, printed
literally inside the bold tag instead of becoming real `<em>` markup —
a direct, visible consequence of removing the one recursive call this
entire inline stage depends on.

## Definition of done

- [ ] `parse_blocks` correctly separates headings, paragraphs, lists,
      and fenced code blocks from a real, mixed document.
- [ ] A blank line inside a fenced code block does not split it into two
      blocks.
- [ ] `parse_inline` correctly renders `**bold with *italic* inside**`
      as properly nested `<strong>`/`<em>` tags, not flattened or
      left partially unconverted.
- [ ] Three of this lesson's four comparison cases match the real
      `markdown` package's output exactly; you can explain precisely why
      the fourth doesn't, and why that's not a correctness bug.
- [ ] Code block content passes through `markdown_to_html` completely
      unmodified, with no inline formatting applied inside it.
- [ ] Commit with a message explaining why, not just what:

  ```
  git add markdown_parser.py
  git commit -m "Add Markdown-to-HTML converter combining flat block parsing (Lesson 56's technique) with recursive inline parsing (Lesson 55's technique) — chose each based on which part of the grammar actually needs it"
  ```

## What's next

Lesson 58's arithmetic expression parser pushes recursion further than
this lesson's inline stage needed to go: nested parentheses can go
arbitrarily deep, and — unlike bold/italic's simple symmetric
nesting — operators have real *precedence* (`*` binds tighter than `+`),
a genuinely new grammar wrinkle this lesson's two techniques, even
combined, haven't had to face yet.
