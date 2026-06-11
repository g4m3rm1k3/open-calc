# PyX — LAB 02 — Lexing Element Syntax

**Prerequisites:** Lab 01 complete. `pyxc build examples/hello.pyx` runs and produces `hello.jsx` containing a copy of the input.

**What this lab adds:**
- A `TokenType` enum that names every kind of token in a `.pyx` file
- A `Token` dataclass that pairs a type with its text content
- A lexer that reads a `.pyx` source string and returns a list of tokens
- A unit test module that verifies the lexer against known inputs

**Time:** 75–105 minutes.

---

## What You Will Build

A function `lex(source: str) -> list[Token]` that takes a `.pyx` source string and returns a list of tokens. Each token is a named chunk of the source:

```
Source string:
  'def Hello():\n    return <div class="app">Hi</div>\n'

Token list output:
  Token(PYTHON_CODE,   'def Hello():\n    return ')
  Token(ELEMENT_OPEN,  '<div class="app">')
  Token(TEXT,          'Hi')
  Token(ELEMENT_CLOSE, '</div>')
  Token(PYTHON_CODE,   '\n')
```

The lexer does not understand what "Hi" means or what `def Hello():` does. It only identifies boundaries: where Python code ends and element syntax begins. This is exactly the right amount of work for a lexer.

---

> **Quick Check — try to answer before reading further:**
>
> 1. A lexer turns a string into a list of tokens. A parser turns tokens into a tree. Why is it useful to have these as two separate steps instead of going directly from string to tree?
> 2. The lexer needs to know when it is "inside an element" vs "inside Python code." What character signals the start of an element? What signals the end?
> 3. What is the difference between `<div>` and `</div>` and `<input />`? How would you detect which one you are looking at?
>
> *(Answers at the end of this lab)*

---

## Concept: What Is Lexing (Tokenisation)?

**What it is:** **Lexing** (also called **tokenisation**) is the process of splitting a source string into a flat list of **tokens**. A token is a named chunk of text: not just the text itself, but a label that says what kind of thing it is.

Consider the Python source `x = 1 + 2`. A Python lexer produces:
```
NAME      "x"
OP        "="
NUMBER    "1"
OP        "+"
NUMBER    "2"
NEWLINE   "\n"
```

The *characters* `1`, `+`, and `2` become *tokens* NUMBER, OP, NUMBER. The lexer does not know what addition means — it just recognises the boundary between a number and an operator. Meaning comes in later stages.

**Why lexing is separate from parsing:**

A lexer makes one pass over characters and emits a flat list. It is simple because it only ever looks at one or two characters at a time.

A parser makes one pass over the token list and builds a tree. It is simpler because it works with tokens (named chunks) instead of raw characters.

If you tried to do both at once — build a tree while scanning characters — you would need to handle character-level details (is this `<` the start of an element or a less-than operator?) at the same time as structural questions (is this element nested inside another element?). Keeping them separate keeps each stage simple.

**What the PyX lexer does:**

The PyX lexer does not lex all of Python. It only identifies element syntax boundaries. The output is:
- `PYTHON_CODE` — any chunk of text that is not inside an element
- `ELEMENT_OPEN` — an opening tag: `<div>`, `<div class="app">`, `<Counter />`
- `ELEMENT_CLOSE` — a closing tag: `</div>`, `</Counter>`
- `TEXT` — plain text inside an element
- `EXPRESSION` — a `{...}` expression inside an element: `{count}`, `{name.upper()}`

Python's own `ast.parse` (introduced in Lab 06) will handle the lexing and parsing of the Python code inside `PYTHON_CODE` tokens. PyX only needs to identify what is Python and what is element syntax.

**Watch for:** This lexer is called a "pre-processor lexer" — it runs before the Python parser sees the code. Its only job is to identify element boundaries so the pre-processor can transform elements into `h()` calls that Python's parser can handle. You are not writing a full Python lexer.

---

## Concept: Finite State Machines

**What it is:** A **finite state machine** (FSM) is a model of computation with three parts:
1. A fixed set of **states** — the possible "modes" the machine can be in
2. A set of **inputs** — things that can happen (for a lexer: individual characters)
3. **Transitions** — rules that say "if you are in state X and you see input Y, move to state Z"

A finite state machine is always in exactly one state. Reading an input may change the state.

**The PyX lexer has three states:**

```
IN_PYTHON    — currently reading Python code; collecting characters for a PYTHON_CODE token
IN_ELEMENT   — currently inside < ... >; collecting an ELEMENT_OPEN or ELEMENT_CLOSE token
IN_TEXT      — currently between element tags; collecting TEXT or EXPRESSION tokens
```

**Transitions:**

```
IN_PYTHON  + '<'         → emit current PYTHON_CODE token, move to IN_ELEMENT
IN_ELEMENT + '>'         → emit ELEMENT_OPEN or ELEMENT_CLOSE token, move to IN_TEXT
IN_ELEMENT + '/' at end  → (self-closing) emit ELEMENT_OPEN token, move to IN_PYTHON
IN_TEXT    + '<'         → emit current TEXT token, move to IN_ELEMENT
IN_TEXT    + '{'         → emit current TEXT token, move to IN_EXPRESSION
IN_EXPRESSION + '}'      → emit EXPRESSION token, move to IN_TEXT
IN_TEXT    + '</'        → (closing tag ahead) will produce ELEMENT_CLOSE, move to IN_PYTHON
```

**Why this model is right for a lexer:**

A lexer only ever needs to look at one character (sometimes two) to decide what to do. The current state captures all the relevant history. You do not need to remember what you saw 50 characters ago — the state encodes everything that matters.

This is called **lookahead(1)** — the lexer looks ahead at most 1 character beyond the current one. Almost all real-world lexers use this model.

**Watch for:** State machines are used everywhere in computing: network protocols, game AI, UI components, regular expressions. The PyX lexer is your first state machine. The pattern — one current state, transitions triggered by input — appears in every subsequent context where you see "handle these inputs differently depending on what mode you are in."

---

## Concept: Python `Enum`

**What it is:** An **Enum** (enumeration) is a class that defines a fixed set of named constants. Instead of using bare strings like `"PYTHON_CODE"` to name token types, you use `TokenType.PYTHON_CODE`.

**Why not use strings?**

```python
# With strings — easy to make an undetected typo:
if token.type == "PYTON_CODE":  # typo: PYTON not PYTHON
    ...  # this branch never runs, no error

# With Enum — Python catches the typo immediately:
if token.type == TokenType.PYTON_CODE:  # AttributeError: no member PYTON_CODE
    ...  # you find out the moment you run the code
```

Enums also give you IDE autocompletion — type `TokenType.` and VS Code lists every valid member.

**The syntax:**

```python
from enum import Enum, auto

class TokenType(Enum):
    PYTHON_CODE = auto()
    ELEMENT_OPEN = auto()
    ELEMENT_CLOSE = auto()
    TEXT = auto()
    EXPRESSION = auto()
```

`auto()` assigns a unique integer value automatically. The value does not matter — you will never compare `TokenType.PYTHON_CODE == 1`. What matters is identity: `token.type == TokenType.PYTHON_CODE`.

**Watch for:** Enum members are accessed as attributes of the class: `TokenType.PYTHON_CODE`, not `TokenType("PYTHON_CODE")`. The class itself is never instantiated directly.

---

## Concept: Python Dataclasses

**What it is:** A **dataclass** is a class that Python generates automatically from a list of field definitions. Instead of writing `__init__`, `__repr__`, and `__eq__` by hand, you add `@dataclass` and declare fields.

**Without dataclass:**

```python
class Token:
    def __init__(self, type, text):
        self.type = type
        self.text = text

    def __repr__(self):
        return f"Token({self.type}, {self.text!r})"

    def __eq__(self, other):
        return self.type == other.type and self.text == other.text
```

**With dataclass:**

```python
from dataclasses import dataclass

@dataclass
class Token:
    type: TokenType
    text: str
```

Python generates `__init__`, `__repr__`, and `__eq__` automatically from the field declarations. `Token(TokenType.PYTHON_CODE, "def Hello():")` works without writing any constructor code.

**Why type annotations matter here:**

`type: TokenType` and `text: str` are not just documentation. Python uses them to generate the constructor signature. If you pass the wrong type at runtime, Python does not automatically enforce it (dataclasses are not validators by default) — but VS Code and type checkers will warn you.

**Watch for:** The `@dataclass` decorator must be imported from `dataclasses`. The field type annotations use Python's type hint syntax — these are not enforced at runtime but are checked by static analysis tools and IDEs.

---

## Step 1 — Create the Token Types

Create `compiler/tokens.py`:

```python
from dataclasses import dataclass
from enum import Enum, auto


class TokenType(Enum):
    PYTHON_CODE = auto()    # chunk of Python source
    ELEMENT_OPEN = auto()   # <div>, <div class="app">, <Counter />, <input type="text" />
    ELEMENT_CLOSE = auto()  # </div>, </Counter>
    TEXT = auto()           # plain text inside an element
    EXPRESSION = auto()     # {expr} inside an element


@dataclass
class Token:
    type: TokenType
    text: str

    def __repr__(self) -> str:
        preview = self.text[:40].replace("\n", "\\n")
        if len(self.text) > 40:
            preview += "..."
        return f"Token({self.type.name}, {preview!r})"
```

The custom `__repr__` (overriding the dataclass default) truncates long tokens and shows escaped newlines. This makes debugging much easier when you print a token list.

---

### SAVE AND TRY

In the terminal:

```
> python -c "from compiler.tokens import Token, TokenType; t = Token(TokenType.PYTHON_CODE, 'def Hello():'); print(t)"
```

**Expected output:**
```
Token(PYTHON_CODE, 'def Hello():')
```

---

## Step 2 — Write the Lexer

Create `compiler/lexer.py`:

```python
from compiler.tokens import Token, TokenType


def lex(source: str) -> list[Token]:
    """
    Tokenise a .pyx source string.
    Returns a flat list of tokens in source order.
    """
    tokens: list[Token] = []
    pos = 0
    length = len(source)

    # The current state
    # We start in Python code
    current_text: list[str] = []

    def flush_python() -> None:
        if current_text:
            tokens.append(Token(TokenType.PYTHON_CODE, "".join(current_text)))
            current_text.clear()

    def flush_text() -> None:
        if current_text:
            tokens.append(Token(TokenType.TEXT, "".join(current_text)))
            current_text.clear()

    # State: are we currently inside a tag (between < and >)?
    in_element_tag = False
    # State: are we in the body of elements (between > and <)?
    in_element_body = False
    # State: are we in a {expression} inside an element body?
    in_expression = False
    # For expressions, track nesting depth so {a + {b}} works
    expression_depth = 0

    while pos < length:
        ch = source[pos]

        # ── Inside a {expression} ──────────────────────────────────────────
        if in_expression:
            if ch == '{':
                expression_depth += 1
                current_text.append(ch)
                pos += 1
            elif ch == '}':
                if expression_depth > 0:
                    expression_depth -= 1
                    current_text.append(ch)
                    pos += 1
                else:
                    tokens.append(Token(TokenType.EXPRESSION, "".join(current_text)))
                    current_text.clear()
                    in_expression = False
                    pos += 1  # consume the closing }
            else:
                current_text.append(ch)
                pos += 1

        # ── Inside element body (between > and <) ─────────────────────────
        elif in_element_body:
            if ch == '<':
                flush_text()
                # Peek ahead to decide what kind of tag this is
                # If next char is '/' it is a closing tag
                in_element_body = False
                in_element_tag = True
                current_text.append(ch)
                pos += 1
            elif ch == '{':
                flush_text()
                in_expression = True
                # Don't append the '{' — it is a delimiter, not content
                pos += 1
            else:
                current_text.append(ch)
                pos += 1

        # ── Inside a tag (between < and >) ────────────────────────────────
        elif in_element_tag:
            if ch == '>':
                current_text.append(ch)
                tag_text = "".join(current_text)
                current_text.clear()
                in_element_tag = False

                if tag_text.startswith('</'):
                    tokens.append(Token(TokenType.ELEMENT_CLOSE, tag_text))
                    # After a closing tag we return to Python code
                    in_element_body = False
                elif tag_text.endswith('/>'):
                    tokens.append(Token(TokenType.ELEMENT_OPEN, tag_text))
                    # Self-closing: no body, return to Python code
                    in_element_body = False
                else:
                    tokens.append(Token(TokenType.ELEMENT_OPEN, tag_text))
                    in_element_body = True
                pos += 1
            else:
                current_text.append(ch)
                pos += 1

        # ── In Python code ────────────────────────────────────────────────
        else:
            if ch == '<' and _looks_like_element_start(source, pos):
                flush_python()
                in_element_tag = True
                current_text.append(ch)
                pos += 1
            else:
                current_text.append(ch)
                pos += 1

    # Flush anything remaining
    if in_element_body or in_element_tag or in_expression:
        raise SyntaxError(
            "Unexpected end of file: unclosed element or expression"
        )

    if current_text:
        tokens.append(Token(TokenType.PYTHON_CODE, "".join(current_text)))

    return tokens


def _looks_like_element_start(source: str, pos: int) -> bool:
    """
    Return True if the '<' at pos looks like the start of an element tag,
    not a less-than operator.

    Rules:
    - <letter or </ is an element (e.g. <div, </div)
    - <space, <<, <=, <number are operators
    """
    if pos + 1 >= len(source):
        return False
    next_ch = source[pos + 1]
    return next_ch.isalpha() or next_ch == '/'
```

---

### SAVE AND TRY

In the terminal:

```
> python -c "
from compiler.lexer import lex
tokens = lex('def Hello():\n    return <div>Hi</div>\n')
for t in tokens:
    print(t)
"
```

**Expected output:**
```
Token(PYTHON_CODE, 'def Hello():\n    return ')
Token(ELEMENT_OPEN, '<div>')
Token(TEXT, 'Hi')
Token(ELEMENT_CLOSE, '</div>')
Token(PYTHON_CODE, '\n')
```

---

## Step 3 — Write the Tests

Create `compiler/tests/` folder and inside it `compiler/tests/__init__.py` (empty).

Create `compiler/tests/test_lexer.py`:

```python
from compiler.lexer import lex
from compiler.tokens import Token, TokenType


def _t(type_: TokenType, text: str) -> Token:
    return Token(type_, text)


P = TokenType.PYTHON_CODE
O = TokenType.ELEMENT_OPEN
C = TokenType.ELEMENT_CLOSE
T = TokenType.TEXT
E = TokenType.EXPRESSION


def test_plain_python():
    """A .pyx file with no elements tokenises as a single PYTHON_CODE token."""
    result = lex("x = 1\ny = 2\n")
    assert result == [_t(P, "x = 1\ny = 2\n")]


def test_simple_element():
    """<div>text</div> produces OPEN, TEXT, CLOSE tokens."""
    result = lex("<div>Hello</div>")
    assert result == [
        _t(O, "<div>"),
        _t(T, "Hello"),
        _t(C, "</div>"),
    ]


def test_element_in_python():
    """Python before and after an element."""
    result = lex("return <p>hi</p>\n")
    assert result == [
        _t(P, "return "),
        _t(O, "<p>"),
        _t(T, "hi"),
        _t(C, "</p>"),
        _t(P, "\n"),
    ]


def test_self_closing():
    """Self-closing elements produce a single ELEMENT_OPEN token."""
    result = lex('<input type="text" />')
    assert result == [_t(O, '<input type="text" />')]


def test_expression_in_element():
    """{expr} inside element body becomes an EXPRESSION token."""
    result = lex("<p>{count}</p>")
    assert result == [
        _t(O, "<p>"),
        _t(E, "count"),
        _t(C, "</p>"),
    ]


def test_element_with_props():
    """Props inside the opening tag are part of the ELEMENT_OPEN token."""
    result = lex('<div class="app" id="main">text</div>')
    assert result == [
        _t(O, '<div class="app" id="main">'),
        _t(T, "text"),
        _t(C, "</div>"),
    ]


def test_nested_elements():
    """Nested elements produce tokens in source order."""
    result = lex("<div><p>inner</p></div>")
    assert result == [
        _t(O, "<div>"),
        _t(O, "<p>"),
        _t(T, "inner"),
        _t(C, "</p>"),
        _t(C, "</div>"),
    ]


def test_less_than_operator_not_element():
    """'x < 5' should not be treated as an element start."""
    result = lex("if x < 5:\n    pass\n")
    assert result == [_t(P, "if x < 5:\n    pass\n")]


def test_mixed_text_and_expression():
    """Text and {expr} interleaved inside an element."""
    result = lex("<p>Hello {name}!</p>")
    assert result == [
        _t(O, "<p>"),
        _t(T, "Hello "),
        _t(E, "name"),
        _t(T, "!"),
        _t(C, "</p>"),
    ]


def test_empty_element():
    """An element with no children."""
    result = lex("<div></div>")
    assert result == [
        _t(O, "<div>"),
        _t(C, "</div>"),
    ]


if __name__ == "__main__":
    tests = [
        test_plain_python,
        test_simple_element,
        test_element_in_python,
        test_self_closing,
        test_expression_in_element,
        test_element_with_props,
        test_nested_elements,
        test_less_than_operator_not_element,
        test_mixed_text_and_expression,
        test_empty_element,
    ]

    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            print(f"  PASS  {test.__name__}")
            passed += 1
        except AssertionError as e:
            print(f"  FAIL  {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"  ERROR {test.__name__}: {e}")
            failed += 1

    print(f"\n{passed} passed, {failed} failed")
```

---

### SAVE AND TRY

Run the tests:

```
> python compiler/tests/test_lexer.py
```

**Expected output:**
```
  PASS  test_plain_python
  PASS  test_simple_element
  PASS  test_element_in_python
  PASS  test_self_closing
  PASS  test_expression_in_element
  PASS  test_element_with_props
  PASS  test_nested_elements
  PASS  test_less_than_operator_not_element
  PASS  test_mixed_text_and_expression
  PASS  test_empty_element

10 passed, 0 failed
```

If any test fails, the error message shows which test and what the assertion checked. Fix the lexer before continuing — the parser in Lab 03 depends on a correct lexer.

---

## Step 4 — Wire the Lexer Into the CLI

Right now `pyxc build` copies the source file unchanged. Add a debug mode that prints the token list instead of compiling. This lets you use the CLI to experiment with the lexer on real `.pyx` files.

Update `compiler/cli.py`. Add `--tokens` to the build subcommand:

```python
build_parser.add_argument(
    "--tokens",
    action="store_true",
    help="Print the token list and exit (debugging)",
)
```

Update `_run_build` to handle the flag:

```python
def _run_build(input_path: str, output_path: str | None, show_tokens: bool = False) -> None:
    if output_path is None:
        if input_path.endswith(".pyx"):
            output_path = input_path[:-4] + ".jsx"
        else:
            output_path = input_path + ".jsx"

    with open(input_path, "r", encoding="utf-8") as f:
        source = f.read()

    if show_tokens:
        from compiler.lexer import lex
        tokens = lex(source)
        for token in tokens:
            print(token)
        return

    result = source

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(result)

    print(f"Compiled {input_path} → {output_path}")
```

Update the call in `main()`:

```python
if args.command == "build":
    _run_build(args.input, args.output, show_tokens=args.tokens)
```

---

### SAVE AND TRY

```
> pyxc build examples/hello.pyx --tokens
```

**Expected output:**
```
Token(PYTHON_CODE, 'def Hello():\n    return ')
Token(ELEMENT_OPEN, '<div>Hello from PyX</div>')
```

Wait — that is wrong. `<div>Hello from PyX</div>` is being treated as a single ELEMENT_OPEN because the lexer enters `in_element_tag` at `<` and the tag text includes everything up to the first `>`. The text "Hello from PyX" is inside the tag text.

Look at the actual `hello.pyx` content:
```python
def Hello():
    return <div>Hello from PyX</div>
```

The `>` after `div` closes the opening tag, so the lexer should emit `<div>` as ELEMENT_OPEN and then enter `in_element_body`. Let me check the output more carefully.

Actually run it and see what you get — the actual output depends on the exact source. If the lexer is working correctly, you should see:

```
Token(PYTHON_CODE, 'def Hello():\n    return ')
Token(ELEMENT_OPEN, '<div>')
Token(TEXT, 'Hello from PyX')
Token(ELEMENT_CLOSE, '</div>')
Token(PYTHON_CODE, '\n')
```

If you see something different, compare it to the test outputs. The tests are the ground truth — if they pass but the CLI output looks wrong, the `hello.pyx` content may be structured differently than you expect.

---

## Challenge: Handle String Attributes with `>` Inside Them

**You know:** The lexer currently treats the first `>` it sees as the end of the tag. This breaks tags like:

```python
element = <button title="a > b">Click</button>
```

The `>` inside the `title` attribute ends the tag prematurely.

**Task:** Modify the `IN_ELEMENT_TAG` section of the lexer to track whether it is currently inside a quoted string (between `"` or `'`). If it is, a `>` should not end the tag.

**Hint:** Add a boolean `in_string` and a `string_char` variable (either `'"'` or `"'"`) to the `IN_ELEMENT_TAG` branch. Toggle `in_string` when you see a matching quote character.

Try for 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

Replace the `elif in_element_tag:` branch with:

```python
elif in_element_tag:
    if ch in ('"', "'") and not in_attr_string:
        in_attr_string = True
        attr_string_char = ch
        current_text.append(ch)
        pos += 1
    elif in_attr_string and ch == attr_string_char:
        in_attr_string = False
        current_text.append(ch)
        pos += 1
    elif ch == '>' and not in_attr_string:
        current_text.append(ch)
        tag_text = "".join(current_text)
        current_text.clear()
        in_element_tag = False
        in_attr_string = False

        if tag_text.startswith('</'):
            tokens.append(Token(TokenType.ELEMENT_CLOSE, tag_text))
            in_element_body = False
        elif tag_text.endswith('/>'):
            tokens.append(Token(TokenType.ELEMENT_OPEN, tag_text))
            in_element_body = False
        else:
            tokens.append(Token(TokenType.ELEMENT_OPEN, tag_text))
            in_element_body = True
        pos += 1
    else:
        current_text.append(ch)
        pos += 1
```

Also initialise at the top of the function:
```python
in_attr_string = False
attr_string_char = '"'
```

**Key insight:** The `>` character has two different meanings depending on context — it ends a tag or it is part of an attribute string. Context is everything. This is why the lexer needs state: a single character does not have a single fixed meaning. The state (are we in a quoted string?) determines the interpretation.

This is a preview of the impedance mismatch problem you will study formally in Lab 09: the same character sequence means different things in different contexts.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `TokenType` enum exists | `from compiler.tokens import TokenType; print(TokenType.PYTHON_CODE)` prints `TokenType.PYTHON_CODE` |
| `Token` dataclass works | `Token(TokenType.TEXT, "hi")` creates a token without error |
| Lexer tokenises Python-only source | `lex("x = 1")` returns one `PYTHON_CODE` token |
| Lexer identifies element open tags | `lex("<div>")` does not raise, produces one `ELEMENT_OPEN` token |
| Lexer handles `<` as less-than | `lex("if x < 5: pass")` returns one `PYTHON_CODE` token, no element tokens |
| All 10 tests pass | `python compiler/tests/test_lexer.py` prints "10 passed, 0 failed" |
| `--tokens` flag works | `pyxc build examples/hello.pyx --tokens` prints a token list |

---

## Your Complete Files

### `compiler/tokens.py`
```python
from dataclasses import dataclass
from enum import Enum, auto


class TokenType(Enum):
    PYTHON_CODE = auto()
    ELEMENT_OPEN = auto()
    ELEMENT_CLOSE = auto()
    TEXT = auto()
    EXPRESSION = auto()


@dataclass
class Token:
    type: TokenType
    text: str

    def __repr__(self) -> str:
        preview = self.text[:40].replace("\n", "\\n")
        if len(self.text) > 40:
            preview += "..."
        return f"Token({self.type.name}, {preview!r})"
```

### `compiler/lexer.py`
```python
from compiler.tokens import Token, TokenType


def lex(source: str) -> list[Token]:
    tokens: list[Token] = []
    pos = 0
    length = len(source)
    current_text: list[str] = []

    in_element_tag = False
    in_element_body = False
    in_expression = False
    in_attr_string = False
    attr_string_char = '"'
    expression_depth = 0

    def flush_python() -> None:
        if current_text:
            tokens.append(Token(TokenType.PYTHON_CODE, "".join(current_text)))
            current_text.clear()

    def flush_text() -> None:
        if current_text:
            tokens.append(Token(TokenType.TEXT, "".join(current_text)))
            current_text.clear()

    while pos < length:
        ch = source[pos]

        if in_expression:
            if ch == '{':
                expression_depth += 1
                current_text.append(ch)
                pos += 1
            elif ch == '}':
                if expression_depth > 0:
                    expression_depth -= 1
                    current_text.append(ch)
                    pos += 1
                else:
                    tokens.append(Token(TokenType.EXPRESSION, "".join(current_text)))
                    current_text.clear()
                    in_expression = False
                    pos += 1
            else:
                current_text.append(ch)
                pos += 1

        elif in_element_body:
            if ch == '<':
                flush_text()
                in_element_body = False
                in_element_tag = True
                current_text.append(ch)
                pos += 1
            elif ch == '{':
                flush_text()
                in_expression = True
                pos += 1
            else:
                current_text.append(ch)
                pos += 1

        elif in_element_tag:
            if ch in ('"', "'") and not in_attr_string:
                in_attr_string = True
                attr_string_char = ch
                current_text.append(ch)
                pos += 1
            elif in_attr_string and ch == attr_string_char:
                in_attr_string = False
                current_text.append(ch)
                pos += 1
            elif ch == '>' and not in_attr_string:
                current_text.append(ch)
                tag_text = "".join(current_text)
                current_text.clear()
                in_element_tag = False
                in_attr_string = False

                if tag_text.startswith('</'):
                    tokens.append(Token(TokenType.ELEMENT_CLOSE, tag_text))
                    in_element_body = False
                elif tag_text.endswith('/>'):
                    tokens.append(Token(TokenType.ELEMENT_OPEN, tag_text))
                    in_element_body = False
                else:
                    tokens.append(Token(TokenType.ELEMENT_OPEN, tag_text))
                    in_element_body = True
                pos += 1
            else:
                current_text.append(ch)
                pos += 1

        else:
            if ch == '<' and _looks_like_element_start(source, pos):
                flush_python()
                in_element_tag = True
                current_text.append(ch)
                pos += 1
            else:
                current_text.append(ch)
                pos += 1

    if in_element_body or in_element_tag or in_expression:
        raise SyntaxError("Unexpected end of file: unclosed element or expression")

    if current_text:
        tokens.append(Token(TokenType.PYTHON_CODE, "".join(current_text)))

    return tokens


def _looks_like_element_start(source: str, pos: int) -> bool:
    if pos + 1 >= len(source):
        return False
    next_ch = source[pos + 1]
    return next_ch.isalpha() or next_ch == '/'
```

### `compiler/tests/__init__.py`
```python
```
(empty)

### `compiler/tests/test_lexer.py`
*(full file as written in Step 3)*

### Project structure at end of Lab 02
```
pyx/
├── .venv/
├── compiler/
│   ├── __init__.py
│   ├── cli.py          ← updated with --tokens flag
│   ├── lexer.py        ← new
│   ├── tokens.py       ← new
│   └── tests/
│       ├── __init__.py ← new (empty)
│       └── test_lexer.py ← new
├── examples/
│   ├── hello.pyx
│   └── hello.jsx
└── pyproject.toml
```

---

## Quick Check Answers

**1. Why have a separate lexer and parser instead of going string → tree directly?**

Each has a simpler job when separated. The lexer only looks at characters — it never thinks about nesting or structure. The parser only looks at tokens — it never thinks about individual characters. If you do both at once, the code that identifies "this `<` starts a tag" gets tangled with the code that tracks "this element is nested inside another element." Separately, each is a simple loop. Together, they become a complex mess where a bug in character handling can appear as a structural error.

**2. What character signals the start of an element? What signals the end?**

Start: `<` followed by a letter (like `<div`) or `<` followed by `/` (like `</div>`). A `<` followed by a space or number is a less-than operator.

End: `>` — but only when not inside a quoted attribute string. `<button title="a > b">` has a `>` that is not the end of the tag.

**3. What is the difference between `<div>`, `</div>`, and `<input />`?**

- `<div>` — opening tag. Starts an element. Content follows until the matching closing tag.
- `</div>` — closing tag. Ends the element. The `/` is the second character (after `<`).
- `<input />` — self-closing tag. Has no content. The `/` is the second-to-last character (before `>`).

Detection: check `tag_text.startswith('</')` for closing. Check `tag_text.endswith('/>')` for self-closing. Everything else is an opening tag.

---

*End of LAB 02.*

*Lab 03 builds the parser — it takes the flat token list from the lexer and assembles it into a tree. `<div><p>text</p></div>` becomes a tree where `div` is the root with one child `p` whose child is the text `"text"`. You will write your first recursive function.*
