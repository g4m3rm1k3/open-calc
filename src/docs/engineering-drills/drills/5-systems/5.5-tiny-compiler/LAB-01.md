# DRILL 5.5 — How a Compiler Works (Tiny Version)
## LAB-01: Build a Working Expression Evaluator

**Standalone.** No prerequisites beyond Python 3.8+. One Python file throughout.
**Time:** 90–120 minutes.
**You will build:** A three-stage compiler pipeline that evaluates `2 + 3 * (4 - 1)` → `11`, then extends to handle variables and multi-line programs.

---

## Quick Check

Answer before you read. Check answers at the bottom.

**1.** What is a token?
- A) A single character from the source text
- B) A typed, meaningful unit produced by the lexer — like NUMBER(3) or PLUS
- C) A node in the abstract syntax tree
- D) A variable binding in the environment

**2.** Why does `2 + 3 * 4` equal 14 and not 20?
- A) Python has a special rule for integers
- B) The lexer handles precedence by ordering tokens
- C) The parser's recursive structure encodes precedence — multiplication is parsed deeper in the call stack
- D) The evaluator checks operator precedence at runtime

**3.** What is an AST?
- A) A list of tokens in order
- B) A tree where each node is an operation or a value — operators are branches, numbers are leaves
- C) The compiled bytecode for a program
- D) A table mapping variable names to values

**4.** What is recursive descent parsing?
- A) Parsing from the bottom of the file upward
- B) A technique where each grammar rule becomes a function that calls other grammar functions
- C) Recursively visiting every node of a completed AST
- D) Using a stack to reverse the token order

---

## Concept Block

### What It Is

Every compiler, interpreter, template engine, SQL parser, linter, and config parser uses the same three-stage pipeline:

```
Source text
    → [LEXER]   → list of tokens
    → [PARSER]  → abstract syntax tree (AST)
    → [EVALUATOR / CODE GEN] → result or output
```

If a compiler generates machine code at the end, the last stage is called "code generation." If it runs the program directly instead of generating code, the last stage is called "evaluation" — and the whole thing is an interpreter. The first two stages are identical either way.

### Stage 1: Lexing (Text → Tokens)

The lexer reads raw characters and groups them into typed units called tokens.

```
Input:  "2 + 3 * (4 - 1)"
Output: [NUMBER(2), PLUS, NUMBER(3), STAR, LPAREN, NUMBER(4), MINUS, NUMBER(1), RPAREN]
```

The lexer's job: strip whitespace, recognize numbers, recognize operators, reject invalid characters. It does not know what the expression means — it only knows what the pieces are called.

### Stage 2: Parsing (Tokens → AST)

The parser reads the token list and builds a tree that represents the grammatical structure of the expression.

```
BinaryOp(PLUS,
  left  = Number(2),
  right = BinaryOp(STAR,
            left  = Number(3),
            right = BinaryOp(MINUS,
                      left  = Number(4),
                      right = Number(1))))
```

This tree is called an Abstract Syntax Tree. "Abstract" means it captures meaning, not formatting. `2+3` and `2 + 3` produce the same tree.

### Stage 3: Evaluation (Walk the Tree)

The evaluator walks the AST recursively. At each node it asks: "What kind of node is this?"

- `Number(2)` → return 2
- `BinaryOp(PLUS, left, right)` → return `eval(left) + eval(right)`

Because `BinaryOp(*, 3, BinaryOp(-, 4, 1))` is the *right* child of `+`, the `*` subtree is evaluated first. Precedence is baked into the tree's structure — the evaluator just follows it.

### Why Operator Precedence Lives in the Parser

`2 + 3 * 4` = 14, not 20. The parser enforces this through recursive descent.

Recursive descent works by having one function per precedence level. Lower precedence operators are handled by functions higher in the call stack. Higher precedence operators are parsed by functions called deeper.

```
parse_expression()   → handles + and -   (lowest precedence)
  └─ parse_term()    → handles * and /   (medium precedence)
       └─ parse_factor() → handles numbers, ( )  (highest precedence, atoms)
```

`parse_expression` calls `parse_term` for each operand. `parse_term` calls `parse_factor`. This means `*` and `/` always bind their operands before `+` and `-` get a chance — that is precedence, built into the call graph.

### Constraints

- Tokens must carry their type and value — a bare `+` character is not enough; you need `Token(PLUS, "+")`.
- The parser must be stateless between parses — no global mutable position counter.
- The evaluator must handle missing variables gracefully with a clear error, not a Python `KeyError`.
- The AST nodes must be separable from the evaluator — the tree describes structure; the evaluator applies meaning.

### Failure Modes

| Mistake | Symptom |
|---------|---------|
| Lexer consumes multi-digit numbers as separate single digits | `42` becomes `NUMBER(4), NUMBER(2)` — parser chokes |
| Parser handles `+` and `*` at the same level | `2 + 3 * 4` evaluates as 20 instead of 14 |
| Evaluator not recursive | Cannot handle nested expressions |
| Missing parenthesis handling | `(2 + 3) * 4` evaluates as `2 + 3 * 4` = 14 instead of 20 |
| No environment passed to evaluator | Variables always raise NameError |

### Operational Reality

This exact pipeline runs inside:

- **Python's `ast` module** — `compile()` runs lexer → parser → bytecode generator; `ast.parse()` gives you the AST
- **Jinja2** — lexes template syntax `{{ var }}`, parses it, evaluates against a context dict
- **SQLAlchemy / any SQL parser** — tokenizes SQL text, parses into a query AST, executes against a database
- **esbuild / TypeScript compiler** — lexes `.ts` files, parses to AST, type-checks, generates JavaScript
- **ESLint / Pylint** — parse source to AST, then walk the tree looking for patterns

When you read `ast.parse("x + 1")` in Python and see `BinOp(Name('x'), Add(), Constant(1))`, that is the exact structure you are building here — just for a smaller language.

### You Will See This Again In

- Reading Python's own `ast.parse()` output
- Writing Jinja2 templates and understanding why `{{ a + b * c }}` gives the right answer
- SQL query planners (they parse SQL into an AST before execution)
- Writing a DSL (domain-specific language) for config files or rules engines
- TypeScript's compiler API — you can walk its AST just like the evaluator here

### Watch For

- **Left-recursion** — naive recursive descent fails on `a + b + c` if not handled carefully; the loop-in-`parse_expression` approach avoids it
- **Error recovery** — real parsers try to continue after a syntax error; ours raises immediately
- **Visitor pattern** — production evaluators use a visitor class with one method per node type, rather than `isinstance` chains
- **Homoiconicity** — Lisp represents code as data (the AST is just a list); Python's `ast` module gives you this explicitly

---

## Setup

```
mkdir tiny-compiler
cd tiny-compiler
# Create one file: compiler.py
```

No external packages. Everything is standard library.

---

## Step 1 — The Lexer: Text → Tokens

The lexer's job is mechanical: scan characters left to right, group them into typed tokens, skip whitespace.

Create `compiler.py`:

```python
# compiler.py

# ─────────────────────────────────────────────
# STAGE 1: LEXER  (text → tokens)
# ─────────────────────────────────────────────
#
# A token is the smallest meaningful unit in a language.
# Characters are to tokens as letters are to words.
# The lexer is like the part of your brain that reads "cat" as a word,
# not as three separate letters.

from dataclasses import dataclass, field
from typing import Any, Optional


# --- Token types as constants ---
# Using strings so they print readably. In a real compiler you'd use an Enum.

NUMBER  = "NUMBER"    # a numeric literal: 42, 3, 100
PLUS    = "PLUS"      # +
MINUS   = "MINUS"     # -
STAR    = "STAR"      # *
SLASH   = "SLASH"     # /
LPAREN  = "LPAREN"    # (
RPAREN  = "RPAREN"    # )
EOF     = "EOF"       # end of input — a sentinel token so the parser always has something to read


@dataclass
class Token:
    """
    A typed, meaningful unit from the source text.
    type:  what kind of thing this is (NUMBER, PLUS, etc.)
    value: the actual value (42 for a number, None for an operator)
    """
    type: str
    value: Any = None

    def __repr__(self):
        if self.value is not None:
            return f"Token({self.type}, {self.value!r})"
        return f"Token({self.type})"


def tokenize(text: str) -> list[Token]:
    """
    Convert source text into a list of tokens.

    This is the complete lexer.
    It handles: integers, +, -, *, /, (, ), whitespace.
    It rejects anything else with a clear error.
    """
    tokens = []
    i = 0  # current position in text

    while i < len(text):
        ch = text[i]

        # --- Skip whitespace ---
        # Whitespace has no meaning in expressions; we discard it entirely.
        if ch.isspace():
            i += 1
            continue

        # --- Multi-digit integers ---
        # We must handle "42" as a single NUMBER(42), not NUMBER(4) + NUMBER(2).
        # isdigit() returns True for '0'..'9'.
        if ch.isdigit():
            start = i
            while i < len(text) and text[i].isdigit():
                i += 1
            # text[start:i] is the full integer string, e.g. "42"
            tokens.append(Token(NUMBER, int(text[start:i])))
            continue  # do NOT increment i again — the while loop already advanced past the number

        # --- Single-character operators ---
        # Each character maps directly to a token type.
        if ch == '+':
            tokens.append(Token(PLUS))
        elif ch == '-':
            tokens.append(Token(MINUS))
        elif ch == '*':
            tokens.append(Token(STAR))
        elif ch == '/':
            tokens.append(Token(SLASH))
        elif ch == '(':
            tokens.append(Token(LPAREN))
        elif ch == ')':
            tokens.append(Token(RPAREN))
        else:
            # Unknown character — fail immediately with a useful message.
            # A real lexer would include the line number and column.
            raise SyntaxError(f"Unexpected character: {ch!r} at position {i}")

        i += 1

    # Always add an EOF sentinel. The parser uses this to know when to stop.
    # This avoids index-out-of-bounds checks scattered throughout the parser.
    tokens.append(Token(EOF))
    return tokens


# ─────────────────────────────────────────────
# TEST THE LEXER
# ─────────────────────────────────────────────

tokens = tokenize("2 + 3 * (4 - 1)")
print("Tokens:")
for tok in tokens:
    print(f"  {tok}")
```

### SAVE AND TRY

```
python compiler.py
```

Expected output:
```
Tokens:
  Token(NUMBER, 2)
  Token(PLUS)
  Token(NUMBER, 3)
  Token(STAR)
  Token(LPAREN)
  Token(NUMBER, 4)
  Token(MINUS)
  Token(NUMBER, 1)
  Token(RPAREN)
  Token(EOF)
```

**Change something:** Replace `"2 + 3 * (4 - 1)"` with `"100 + 200"`. Confirm you get `Token(NUMBER, 100)`, `Token(PLUS)`, `Token(NUMBER, 200)`, `Token(EOF)`. Then try `"2 @ 3"` — confirm you get `SyntaxError: Unexpected character: '@'`.

**What just happened:** The lexer walked the string character by character. It collected adjacent digit characters into one NUMBER token. Whitespace was silently skipped. Each operator character became its own token. The EOF sentinel was added at the end — the parser will use it as a stopping signal.

---

## Step 2 — AST Nodes: The Data Structures for the Tree

The AST is a tree made of simple data containers. No logic yet — just structure.

Add this to `compiler.py`:

```python
# ─────────────────────────────────────────────
# AST NODE TYPES
# ─────────────────────────────────────────────
#
# Each node represents one "thing" in the expression.
# Leaves: Number — no children, just a value.
# Branches: BinaryOp — an operator and its two operands (which are themselves nodes).
#
# The tree for "2 + 3 * (4 - 1)":
#
#        BinaryOp(PLUS)
#       /              \
#   Number(2)     BinaryOp(STAR)
#                /              \
#           Number(3)      BinaryOp(MINUS)
#                          /             \
#                      Number(4)       Number(1)
#
# Notice: the tree's SHAPE encodes precedence.
# STAR is deeper than PLUS, so it evaluates first.
# The evaluator just walks the tree — it doesn't need to know precedence rules.


@dataclass
class Number:
    """A numeric literal. This is a leaf node — no children."""
    value: int | float

    def __repr__(self):
        return f"Number({self.value})"


@dataclass
class BinaryOp:
    """
    An operation with two operands.
    op:    the operator token type (PLUS, MINUS, STAR, SLASH)
    left:  the left operand — another AST node
    right: the right operand — another AST node
    """
    op: str           # token type string: PLUS, MINUS, STAR, SLASH
    left: Any         # Any AST node
    right: Any        # Any AST node

    def __repr__(self):
        return f"BinaryOp({self.op}, {self.left!r}, {self.right!r})"


# --- Build one by hand so you can see what it looks like ---
# This is the AST for "2 + 3":
manual_ast = BinaryOp(PLUS, Number(2), Number(3))
print(f"\nManual AST for '2 + 3':")
print(f"  {manual_ast}")

# This is the AST for "2 + 3 * 4":
# Note: the STAR node is the RIGHT child of PLUS, not a sibling.
# That nesting is what forces * to evaluate before +.
manual_ast2 = BinaryOp(PLUS, Number(2), BinaryOp(STAR, Number(3), Number(4)))
print(f"\nManual AST for '2 + 3 * 4':")
print(f"  {manual_ast2}")
```

### SAVE AND TRY

```
python compiler.py
```

Expected output (after lexer output):
```
Manual AST for '2 + 3':
  BinaryOp(PLUS, Number(2), Number(3))

Manual AST for '2 + 3 * 4':
  BinaryOp(PLUS, Number(2), BinaryOp(STAR, Number(3), Number(4)))
```

**Change something:** Build the AST for `(2 + 3) * 4` by hand. The PLUS node should be the LEFT child of STAR. Print it and confirm the structure is reversed from `2 + 3 * 4`.

**What just happened:** The AST nodes are pure data — no behavior. A `BinaryOp` just holds an operator name and two children. The `Number` holds a value. The tree's structure (which node is parent, which is child) is what will determine evaluation order. The parser's job is to build this structure correctly.

---

## Step 3 — The Parser: Tokens → AST

The parser reads the token list and constructs the AST. It uses recursive descent — one function per precedence level.

Add this to `compiler.py`:

```python
# ─────────────────────────────────────────────
# STAGE 2: PARSER  (tokens → AST)
# ─────────────────────────────────────────────
#
# Recursive descent: each grammar rule becomes a function.
#
# Grammar for our expression language:
#   expression  → term ((PLUS | MINUS) term)*
#   term        → factor ((STAR | SLASH) factor)*
#   factor      → NUMBER | LPAREN expression RPAREN
#
# Reading this grammar:
#   expression is one or more terms joined by + or -
#   term is one or more factors joined by * or /
#   factor is either a number or a parenthesized expression
#
# This grammar encodes precedence:
#   * and / bind tighter because they appear DEEPER in the call chain.
#   parse_expression calls parse_term for its operands.
#   parse_term calls parse_factor for its operands.
#   So factor (numbers and parens) is evaluated innermost = highest precedence.


class Parser:
    def __init__(self, tokens: list[Token]):
        self.tokens = tokens
        self.pos = 0  # current position in the token list

    def current(self) -> Token:
        """Return the token at the current position without advancing."""
        return self.tokens[self.pos]

    def consume(self, expected_type: str) -> Token:
        """
        Assert the current token is of the expected type, return it, advance pos.
        Raises SyntaxError if the type doesn't match.
        This is how the parser enforces grammar rules.
        """
        tok = self.current()
        if tok.type != expected_type:
            raise SyntaxError(
                f"Expected {expected_type} but got {tok.type!r} ({tok.value!r})"
            )
        self.pos += 1
        return tok

    def parse(self) -> Any:
        """Entry point: parse a complete expression and return its AST."""
        node = self.parse_expression()
        # After a complete expression, the next token must be EOF.
        # If it's not, there's leftover input we didn't understand.
        self.consume(EOF)
        return node

    # ── Lowest precedence: + and - ──────────────────────────────────────
    def parse_expression(self) -> Any:
        """
        expression → term ((PLUS | MINUS) term)*

        This handles: a + b - c + d
        We parse the first term, then loop consuming any + or - followed by another term.
        Each loop iteration wraps the accumulator in a new BinaryOp.
        """
        # Parse the left side first (a term, which may itself be a * or /)
        node = self.parse_term()

        # Keep consuming + and - operators as long as they appear.
        # This handles left-to-right chaining: 1 + 2 + 3 = (1 + 2) + 3
        while self.current().type in (PLUS, MINUS):
            op = self.current().type   # remember which operator this is
            self.pos += 1              # advance past the operator
            right = self.parse_term()  # parse the right operand
            node = BinaryOp(op, node, right)  # wrap: node becomes left child

        return node

    # ── Medium precedence: * and / ──────────────────────────────────────
    def parse_term(self) -> Any:
        """
        term → factor ((STAR | SLASH) factor)*

        Same structure as parse_expression, but for * and /.
        Because parse_expression calls parse_term for its operands,
        * and / always "win" over + and - — they are resolved first.
        """
        node = self.parse_factor()

        while self.current().type in (STAR, SLASH):
            op = self.current().type
            self.pos += 1
            right = self.parse_factor()
            node = BinaryOp(op, node, right)

        return node

    # ── Highest precedence: atoms and parentheses ────────────────────────
    def parse_factor(self) -> Any:
        """
        factor → NUMBER | LPAREN expression RPAREN

        Numbers and parenthesized expressions are the atoms.
        Parentheses restart the entire precedence hierarchy by calling parse_expression.
        This is why (2 + 3) * 4 works: the paren group is a single 'factor',
        and it gets evaluated before the outer * sees its result.
        """
        tok = self.current()

        if tok.type == NUMBER:
            self.pos += 1                  # consume the number token
            return Number(tok.value)       # leaf node

        if tok.type == LPAREN:
            self.pos += 1                          # consume '('
            node = self.parse_expression()         # parse everything inside
            self.consume(RPAREN)                   # expect and consume ')'
            return node                            # the inner expression IS the factor

        raise SyntaxError(
            f"Expected a number or '(' but got {tok.type!r} ({tok.value!r})"
        )


# ─────────────────────────────────────────────
# TEST THE PARSER
# ─────────────────────────────────────────────

def parse(text: str) -> Any:
    """Convenience: tokenize + parse in one call."""
    tokens = tokenize(text)
    return Parser(tokens).parse()


print("\n--- Parser Tests ---")

ast1 = parse("2 + 3")
print(f"'2 + 3'  →  {ast1}")

ast2 = parse("2 + 3 * 4")
print(f"'2 + 3 * 4'  →  {ast2}")
# The STAR node should be nested INSIDE (to the right of) the PLUS node.
# If they were at the same level, precedence would be wrong.

ast3 = parse("(2 + 3) * 4")
print(f"'(2 + 3) * 4'  →  {ast3}")
# Now PLUS should be nested INSIDE (to the left of) the STAR node.

ast4 = parse("2 + 3 * (4 - 1)")
print(f"'2 + 3 * (4 - 1)'  →  {ast4}")
```

### SAVE AND TRY

```
python compiler.py
```

Expected output (after previous output):
```
--- Parser Tests ---
'2 + 3'  →  BinaryOp(PLUS, Number(2), Number(3))
'2 + 3 * 4'  →  BinaryOp(PLUS, Number(2), BinaryOp(STAR, Number(3), Number(4)))
'(2 + 3) * 4'  →  BinaryOp(STAR, BinaryOp(PLUS, Number(2), Number(3)), Number(4))
'2 + 3 * (4 - 1)'  →  BinaryOp(PLUS, Number(2), BinaryOp(STAR, Number(3), BinaryOp(MINUS, Number(4), Number(1))))
```

**Change something:** Parse `"10 / 2 - 1"`. Confirm the tree is `BinaryOp(MINUS, BinaryOp(SLASH, Number(10), Number(2)), Number(1))` — the division is nested as the left child of subtraction. Then try `"1 +"` (missing right operand) and confirm you get a `SyntaxError`.

**What just happened:** `parse_expression` called `parse_term` to get its left operand. `parse_term` called `parse_factor`, which returned `Number(2)`. `parse_term` saw no `*` or `/`, so it returned `Number(2)` up to `parse_expression`. `parse_expression` saw `+`, advanced past it, called `parse_term` again. This time `parse_term` saw `3`, then `*`, then called `parse_factor` for `4` — building `BinaryOp(STAR, 3, 4)`. That whole node became the right child of `BinaryOp(PLUS, 2, ...)`. Precedence emerged from the call stack depth.

---

## Step 4 — The Evaluator: Walk the Tree

The evaluator recursively walks the AST. It matches on node type and computes the result.

Add this to `compiler.py`:

```python
# ─────────────────────────────────────────────
# STAGE 3: EVALUATOR  (AST → result)
# ─────────────────────────────────────────────
#
# The evaluator is the simplest stage.
# It walks the tree recursively.
# At each node: match the type, compute the value, return it.
#
# Because the tree's structure already encodes precedence,
# the evaluator doesn't need to know anything about operator precedence.
# It just follows the tree.


def evaluate(node: Any, env: dict = None) -> int | float:
    """
    Recursively evaluate an AST node and return its numeric value.

    env: variable environment — a dict mapping name → value.
         Passed through every recursive call so nested expressions
         can look up variables. None means no variables are in scope.
    """
    if env is None:
        env = {}

    # --- Leaf: a number literal ---
    # Base case. Return the value directly.
    if isinstance(node, Number):
        return node.value

    # --- Branch: a binary operation ---
    # Recursively evaluate both sides, then apply the operator.
    # The recursion naturally processes the deepest nodes first,
    # which means highest-precedence operations compute first.
    if isinstance(node, BinaryOp):
        left_val  = evaluate(node.left,  env)   # evaluate left subtree
        right_val = evaluate(node.right, env)   # evaluate right subtree

        if node.op == PLUS:
            return left_val + right_val
        if node.op == MINUS:
            return left_val - right_val
        if node.op == STAR:
            return left_val * right_val
        if node.op == SLASH:
            if right_val == 0:
                raise ZeroDivisionError("Division by zero in expression")
            return left_val / right_val

        raise ValueError(f"Unknown operator: {node.op!r}")

    raise TypeError(f"Unknown node type: {type(node).__name__}")


# ─────────────────────────────────────────────
# FULL PIPELINE: text → tokens → AST → result
# ─────────────────────────────────────────────

def calc(text: str, env: dict = None) -> int | float:
    """Tokenize, parse, and evaluate an expression in one call."""
    tokens = tokenize(text)
    ast = Parser(tokens).parse()
    return evaluate(ast, env)


print("\n--- Evaluator Tests ---")

# These are the key precedence tests.
# If ANY of these are wrong, the parser's precedence structure is broken.

result1 = calc("2 + 3")
print(f"2 + 3         = {result1}")   # 5

result2 = calc("2 + 3 * 4")
print(f"2 + 3 * 4     = {result2}")   # 14, not 20

result3 = calc("(2 + 3) * 4")
print(f"(2 + 3) * 4   = {result3}")   # 20

result4 = calc("2 + 3 * (4 - 1)")
print(f"2 + 3 * (4-1) = {result4}")   # 11

result5 = calc("10 / 2 - 1")
print(f"10 / 2 - 1    = {result5}")   # 4.0

result6 = calc("(1 + 2) * (3 + 4)")
print(f"(1+2)*(3+4)   = {result6}")   # 21

# Verify the critical precedence assertions
assert calc("2 + 3 * 4")    == 14, "Precedence broken: should be 14, not 20"
assert calc("(2 + 3) * 4")  == 20, "Parens broken: should be 20"
assert calc("2 + 3 * (4 - 1)") == 11, "Full expression should be 11"
print("\nAll precedence assertions passed.")
```

### SAVE AND TRY

```
python compiler.py
```

Expected output (after previous output):
```
--- Evaluator Tests ---
2 + 3         = 5
2 + 3 * 4     = 14
(2 + 3) * 4   = 20
2 + 3 * (4-1) = 11
10 / 2 - 1    = 4.0
(1+2)*(3+4)   = 21

All precedence assertions passed.
```

**Change something:** Try `calc("2 + 3 * 4")` and then temporarily swap `parse_term` and `parse_expression` logic (have `parse_expression` handle `*`/`/` and `parse_term` handle `+`/`-`). Rerun and confirm `2 + 3 * 4` now incorrectly gives 20. Swap them back.

**What just happened:** The evaluator called `evaluate(BinaryOp(PLUS, Number(2), BinaryOp(STAR, Number(3), Number(4))))`. It recursed into the right child — `BinaryOp(STAR, 3, 4)` — and got 12. Then it computed `2 + 12 = 14`. The evaluator never checked precedence rules. It didn't need to — the tree's shape already encoded the answer.

---

## Step 5 — Variables: The `Identifier` Node and `Environment`

Now extend the language to support variables. We add `Identifier` AST nodes and an `Environment` dict.

Add this to `compiler.py`:

```python
# ─────────────────────────────────────────────
# EXTENSION: VARIABLES
# ─────────────────────────────────────────────
#
# To support variables, we need:
#   1. New token types: IDENTIFIER (a name like 'x'), EQUALS (=)
#   2. A new AST node: Identifier — a leaf that holds a name
#   3. A new statement type: Assignment — binds a name to a value
#   4. Updated lexer: recognize name characters (letters, underscores)
#   5. Updated parser: handle 'name = expression' statements
#   6. Updated evaluator: look up Identifier nodes in the environment dict


# --- New token types ---
IDENTIFIER = "IDENTIFIER"   # a variable name: x, y, total
EQUALS     = "EQUALS"       # assignment operator: =
NEWLINE    = "NEWLINE"      # statement separator
SEMICOLON  = "SEMICOLON"    # alternate statement separator


# --- New AST nodes ---

@dataclass
class Identifier:
    """
    A variable reference.
    This is a leaf node — it holds a name, not a value.
    The evaluator looks up the name in the environment.
    """
    name: str

    def __repr__(self):
        return f"Identifier({self.name!r})"


@dataclass
class Assignment:
    """
    A variable binding: name = expression.
    Evaluating this stores the result of 'value' in the environment under 'name'.
    """
    name: str   # the variable name (left side of =)
    value: Any  # the expression whose result to store (right side of =)

    def __repr__(self):
        return f"Assignment({self.name!r}, {self.value!r})"


@dataclass
class PrintStatement:
    """A print(...) statement. Evaluates its argument and prints the result."""
    expr: Any

    def __repr__(self):
        return f"PrintStatement({self.expr!r})"


# --- Extended lexer ---

def tokenize_v2(text: str) -> list[Token]:
    """
    Extended lexer: handles everything tokenize() handles, plus:
      - Identifiers (variable names)
      - The '=' assignment operator
      - Newlines (as statement separators)
      - Semicolons (as statement separators)
      - The keyword 'print'
    """
    tokens = []
    i = 0

    while i < len(text):
        ch = text[i]

        # Skip spaces and carriage returns — but NOT newlines (they are tokens)
        if ch in (' ', '\t', '\r'):
            i += 1
            continue

        # Newline: a statement separator
        if ch == '\n':
            tokens.append(Token(NEWLINE))
            i += 1
            continue

        # Multi-digit integers
        if ch.isdigit():
            start = i
            while i < len(text) and text[i].isdigit():
                i += 1
            tokens.append(Token(NUMBER, int(text[start:i])))
            continue

        # Identifiers and keywords.
        # A name starts with a letter or underscore, then continues with letters, digits, underscores.
        if ch.isalpha() or ch == '_':
            start = i
            while i < len(text) and (text[i].isalnum() or text[i] == '_'):
                i += 1
            name = text[start:i]
            # 'print' is a keyword — give it its own token type
            # Everything else is an IDENTIFIER
            tokens.append(Token("PRINT" if name == "print" else IDENTIFIER, name))
            continue

        # Single-character tokens
        simple = {'+': PLUS, '-': MINUS, '*': STAR, '/': SLASH,
                  '(': LPAREN, ')': RPAREN, '=': EQUALS, ';': SEMICOLON}
        if ch in simple:
            tokens.append(Token(simple[ch]))
            i += 1
            continue

        raise SyntaxError(f"Unexpected character: {ch!r} at position {i}")

    tokens.append(Token(EOF))
    return tokens


# --- Extended parser ---

class ProgramParser:
    """
    Parses a multi-statement program.
    Each statement is either:
      - name = expression   (assignment)
      - print(expression)   (print)
      - expression           (bare expression — evaluate and discard)
    Statements are separated by newlines or semicolons.
    """
    def __init__(self, tokens: list[Token]):
        self.tokens = tokens
        self.pos = 0

    def current(self) -> Token:
        return self.tokens[self.pos]

    def consume(self, expected_type: str) -> Token:
        tok = self.current()
        if tok.type != expected_type:
            raise SyntaxError(f"Expected {expected_type!r} but got {tok.type!r}")
        self.pos += 1
        return tok

    def parse_program(self) -> list:
        """Parse a sequence of statements, return a list of AST nodes."""
        statements = []

        # Skip leading newlines
        while self.current().type == NEWLINE:
            self.pos += 1

        while self.current().type != EOF:
            stmt = self.parse_statement()
            statements.append(stmt)

            # Consume statement separators (newlines and semicolons)
            while self.current().type in (NEWLINE, SEMICOLON):
                self.pos += 1

        return statements

    def parse_statement(self) -> Any:
        """
        Decide what kind of statement this is and parse it.
        Lookahead: if current is IDENTIFIER and next is EQUALS, it's an assignment.
        """
        tok = self.current()

        # print(expr) statement
        if tok.type == "PRINT":
            self.pos += 1                    # consume 'print'
            self.consume(LPAREN)             # expect '('
            expr = self.parse_expression()   # parse the argument
            self.consume(RPAREN)             # expect ')'
            return PrintStatement(expr)

        # Assignment: name = expr
        # Lookahead: check the NEXT token (without consuming) to see if it's '='
        if tok.type == IDENTIFIER and self.pos + 1 < len(self.tokens) \
                and self.tokens[self.pos + 1].type == EQUALS:
            name = tok.value
            self.pos += 1   # consume the identifier
            self.pos += 1   # consume '='
            expr = self.parse_expression()
            return Assignment(name, expr)

        # Otherwise: a bare expression
        return self.parse_expression()

    def parse_expression(self) -> Any:
        """expression → term ((PLUS | MINUS) term)*"""
        node = self.parse_term()
        while self.current().type in (PLUS, MINUS):
            op = self.current().type
            self.pos += 1
            right = self.parse_term()
            node = BinaryOp(op, node, right)
        return node

    def parse_term(self) -> Any:
        """term → factor ((STAR | SLASH) factor)*"""
        node = self.parse_factor()
        while self.current().type in (STAR, SLASH):
            op = self.current().type
            self.pos += 1
            right = self.parse_factor()
            node = BinaryOp(op, node, right)
        return node

    def parse_factor(self) -> Any:
        """factor → NUMBER | IDENTIFIER | LPAREN expression RPAREN"""
        tok = self.current()

        if tok.type == NUMBER:
            self.pos += 1
            return Number(tok.value)

        if tok.type == IDENTIFIER:
            self.pos += 1
            return Identifier(tok.value)   # a variable reference — name only, value looked up later

        if tok.type == LPAREN:
            self.pos += 1
            node = self.parse_expression()
            self.consume(RPAREN)
            return node

        raise SyntaxError(f"Expected number, identifier, or '(' but got {tok.type!r}")


# --- Extended evaluator ---

def evaluate_v2(node: Any, env: dict) -> Any:
    """
    Evaluate an AST node. env maps variable names → their current values.
    Returns the numeric result, or None for statements that don't produce a value.
    """
    if isinstance(node, Number):
        return node.value

    if isinstance(node, Identifier):
        # Look up the variable in the environment.
        # NameError if it hasn't been assigned yet — same as Python.
        if node.name not in env:
            raise NameError(f"Variable {node.name!r} is not defined")
        return env[node.name]

    if isinstance(node, BinaryOp):
        left_val  = evaluate_v2(node.left,  env)
        right_val = evaluate_v2(node.right, env)
        if node.op == PLUS:  return left_val + right_val
        if node.op == MINUS: return left_val - right_val
        if node.op == STAR:  return left_val * right_val
        if node.op == SLASH:
            if right_val == 0: raise ZeroDivisionError("Division by zero")
            return left_val / right_val

    if isinstance(node, Assignment):
        # Evaluate the right-hand side, store it in env, return it.
        value = evaluate_v2(node.value, env)
        env[node.name] = value   # mutation: the environment is updated
        return value

    if isinstance(node, PrintStatement):
        value = evaluate_v2(node.expr, env)
        print(value)             # actual print output
        return None              # print statements don't produce a value

    raise TypeError(f"Unknown node type: {type(node).__name__}")


def run_program(source: str) -> dict:
    """
    Tokenize, parse, and execute a multi-statement program.
    Returns the final environment (all variable bindings).
    """
    tokens = tokenize_v2(source)
    statements = ProgramParser(tokens).parse_program()
    env = {}
    for stmt in statements:
        evaluate_v2(stmt, env)
    return env


# ─────────────────────────────────────────────
# TEST THE FULL PIPELINE WITH VARIABLES
# ─────────────────────────────────────────────

print("\n--- Variable Program Tests ---")

# Simple assignment and use
program1 = """
x = 5
y = x * 2 + 1
print(y)
"""
env1 = run_program(program1)
print(f"Environment after program1: {env1}")

# Multi-step calculation
program2 = """
a = 10
b = 3
result = a * b - (a + b)
print(result)
"""
env2 = run_program(program2)
print(f"Environment after program2: {env2}")

# Verify
assert env1["x"] == 5
assert env1["y"] == 11
assert env2["result"] == 10 * 3 - (10 + 3)
print("\nAll variable tests passed.")
```

### SAVE AND TRY

```
python compiler.py
```

Expected output (after previous output):
```
--- Variable Program Tests ---
11
Environment after program1: {'x': 5, 'y': 11}
30
Environment after program2: {'a': 10, 'b': 3, 'result': 17}

All variable tests passed.
```

**Change something:** Add a third program that uses a variable before it's been assigned — `"z = undefined_var + 1"`. Confirm `run_program()` raises `NameError: Variable 'undefined_var' is not defined`. This is the same error Python raises for the same mistake.

**What just happened:** The lexer recognized `x` as an `IDENTIFIER` token. The parser created an `Identifier("x")` leaf node instead of a `Number`. The evaluator, when it reached that node, looked up `"x"` in `env` and got 5. The assignment `y = x * 2 + 1` evaluated the right-hand expression using the current env, got 11, then stored `env["y"] = 11`. The `print(y)` statement looked up y from env and printed it.

---

## Step 6 — Full Program: `x = 5; y = x * 2 + 1; print(y)` → `11`

Verify the complete pipeline end to end and inspect the internals at each stage.

Add this to `compiler.py`:

```python
# ─────────────────────────────────────────────
# STEP 6: INSPECT THE FULL PIPELINE
# ─────────────────────────────────────────────
#
# Run the pipeline step by step on a real program.
# Print each stage's output so you can see the transformation.

print("\n" + "="*60)
print("FULL PIPELINE INSPECTION")
print("="*60)

source = "x = 5\ny = x * 2 + 1\nprint(y)"
print(f"\nSource:\n{source}\n")

# Stage 1: Lexer
print("--- Stage 1: Tokens ---")
tokens_full = tokenize_v2(source)
for tok in tokens_full:
    print(f"  {tok}")

# Stage 2: Parser
print("\n--- Stage 2: AST ---")
statements_full = ProgramParser(tokens_full).parse_program()
for i, stmt in enumerate(statements_full):
    print(f"  Statement {i+1}: {stmt}")

# Stage 3: Evaluator
print("\n--- Stage 3: Evaluation ---")
env_full = {}
for stmt in statements_full:
    result = evaluate_v2(stmt, env_full)
    if result is not None:
        print(f"  → {result}")
    print(f"  env: {env_full}")

print("\n--- Connection to Python's own compiler ---")
import ast as python_ast
py_tree = python_ast.parse("x + 1")
print(f"Python AST for 'x + 1':")
print(f"  {python_ast.dump(py_tree)}")
print("\nOur AST for 'x + 1':")
our_tokens = tokenize_v2("x + 1")
our_tree = ProgramParser(our_tokens).parse_program()
print(f"  {our_tree[0]}")
print("\nSame idea. Different names. Same structure.")
```

### SAVE AND TRY

```
python compiler.py
```

Expected output (after previous output):
```
============================================================
FULL PIPELINE INSPECTION
============================================================

Source:
x = 5
y = x * 2 + 1
print(y)

--- Stage 1: Tokens ---
  Token(IDENTIFIER, 'x')
  Token(EQUALS)
  Token(NUMBER, 5)
  Token(NEWLINE)
  Token(IDENTIFIER, 'y')
  Token(EQUALS)
  Token(IDENTIFIER, 'x')
  Token(STAR)
  Token(NUMBER, 2)
  Token(PLUS)
  Token(NUMBER, 1)
  Token(NEWLINE)
  Token(PRINT, 'print')
  Token(LPAREN)
  Token(IDENTIFIER, 'y')
  Token(RPAREN)
  Token(EOF)

--- Stage 2: AST ---
  Statement 1: Assignment('x', Number(5))
  Statement 2: Assignment('y', BinaryOp(PLUS, BinaryOp(STAR, Identifier('x'), Number(2)), Number(1)))
  Statement 3: PrintStatement(Identifier('y'))

--- Stage 3: Evaluation ---
  env: {'x': 5}
  env: {'x': 5, 'y': 11}
11
  env: {'x': 5, 'y': 11}

--- Connection to Python's own compiler ---
Python AST for 'x + 1':
  Module(body=[Expr(value=BinOp(left=Name(id='x', ctx=Load()), op=Add(), right=Constant(value=1)))], type_ignores=[])

Our AST for 'x + 1':
  [BinaryOp(PLUS, Identifier('x'), Number(1))]

Same idea. Different names. Same structure.
```

**Change something:** Change the source program to compute the first 5 Fibonacci numbers using assignments: `a = 1; b = 1; c = a + b; d = b + c; e = c + d; print(e)`. Verify the output is `5`.

**What just happened:** You saw the raw character stream become tokens, tokens become an AST, and the AST become a result — all in three explicit stages. Python's own `ast.parse("x + 1")` produces a `BinOp(left=Name(...), op=Add(), right=Constant(...))` — exactly the same idea as `BinaryOp(PLUS, Identifier('x'), Number(1))`. Your compiler and CPython's compiler are the same pipeline at different scales.

---

## Challenge — Boolean Expressions and `if/else`

Extend the compiler to support boolean comparisons and an `if/else` expression.

**Requirements:**
- New tokens: `GT` (`>`), `LT` (`<`), `EQEQ` (`==`), `IF`, `THEN`, `ELSE`
- New AST node: `IfExpr(condition, then_expr, else_expr)` — all three fields are AST nodes
- New AST node: `CompareOp(op, left, right)` — like `BinaryOp` but returns a boolean
- Updated lexer: recognize `>`, `<`, `==`, and the keywords `if`, `then`, `else`
- Updated parser: `parse_expression` should first try to parse a comparison (`a > b`), then handle arithmetic
- Updated evaluator: `IfExpr` evaluates `condition`, then evaluates and returns either `then_expr` or `else_expr` depending on the result

**Starter:**

```python
# New token types
GT   = "GT"    # >
LT   = "LT"    # <
EQEQ = "EQEQ"  # ==
IF   = "IF"
THEN = "THEN"
ELSE = "ELSE"

@dataclass
class CompareOp:
    op: str
    left: Any
    right: Any

@dataclass
class IfExpr:
    condition: Any
    then_expr: Any
    else_expr: Any

# Target behavior — these should all work:
# x = 10
# if x > 3 then x * 2 else x + 1     → 20
# if x > 100 then x * 2 else x + 1   → 11
```

**When done:** Run the following program through your extended compiler and confirm the output:

```
x = 10
y = if x > 3 then x * 2 else x + 1
print(y)
```

Expected output: `20`

**Stuck? Ask AI:** "I'm adding if/else to a recursive descent parser. Where in the grammar should IfExpr fit — at the expression level or the statement level? And how do I handle 'then' and 'else' as keywords that end the subexpressions on each side?"

---

## Quick Check Answers

**1. B** — A token is a typed, meaningful unit: `Token(NUMBER, 42)`, `Token(PLUS)`. A single character like `4` is not a token — it's a character. Step 1 shows the lexer collecting `"4"` and `"2"` together into `Token(NUMBER, 42)`. The lexer's job is to produce these typed units from raw characters.

**2. C** — Precedence lives in the parser's recursive structure. `parse_expression` calls `parse_term` for its operands, and `parse_term` calls `parse_factor` for its. Because `*` is handled inside `parse_term`, and `parse_term` runs before `parse_expression` returns, `*` always binds before `+` sees its result. Step 3 shows this explicitly with the call stack diagram. The lexer and evaluator have no knowledge of precedence.

**3. B** — An AST is a tree where each node is an operation or a value. `BinaryOp(PLUS, Number(2), BinaryOp(STAR, Number(3), Number(4)))` is an AST for `2 + 3 * 4`. The `Number` nodes are leaves. The `BinaryOp` nodes are branches. Step 2 draws the shape of the tree with ASCII art. The AST captures grammatical structure while discarding whitespace and parentheses.

**4. B** — Recursive descent is a parsing technique where each grammar rule becomes a function, and those functions call each other recursively. `parse_expression` calls `parse_term`, which calls `parse_factor`. When a subexpression is found (like a parenthesized group), `parse_factor` calls `parse_expression` again — hence "recursive." Step 3 shows all three functions with the grammar rule written as a docstring comment for each.
