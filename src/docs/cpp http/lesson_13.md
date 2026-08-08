# Lesson 13: while — Repetition, and a Server's First Real Safety Hazard

**What you will build:** a `while` keyword, a `WhileExpression` AST node that evaluates its
condition and body repeatedly — the project's first node whose `evaluate()` calls another
node's `evaluate()` more than once — and a hard iteration cap that turns an infinite loop
from "the server hangs forever" into "the request fails with a clear error and the server
keeps running." This lesson also hits and fixes a real, more consequential bug than either of
the last two: assignment, since Lesson 4, has only ever lived at the very top of a statement
— which meant, until this lesson found and fixed it, `while (x < 5) x = x + 1` **could not
parse at all**, because a loop body (parsed the same way an `if` branch is) had no path to an
assignment. That's not a cosmetic gap; it's the difference between "loops exist" and "loops
can do anything useful."

**What you need to know first:** Lesson 12's `parse_comparison`, `IfExpression`, and the
general unary-minus fix — this lesson adds `while` as a sibling to `if` inside
`parse_comparison`, and fixes a bug in exactly the machinery Lesson 12 built.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
```

Carrying `"while (x < 5) x = x + 1"` through, with `x = 0` already stored: the lexer
recognizes `while` as a keyword; the parser builds a `WhileExpression` whose condition is
`BinaryExpression(Less, VariableExpression(x), NumberExpression(5))` and whose body is —
this lesson's real fix, not something that worked automatically — `AssignmentExpression("x",
BinaryExpression(Plus, VariableExpression(x), NumberExpression(1)))`. `evaluate()` runs that
body five times, mutating the same `Environment` each time, until the condition finally reads
`false`.

---

## Concept Unit 1: The host language's loop, in isolation

### The Problem

Every previous `Expression::evaluate()` in this project — `BinaryExpression`,
`IfExpression` — calls `->evaluate(env)` on its children a small, fixed number of times: once
each, or, for `IfExpression`, once for whichever single branch was chosen. `WhileExpression`
needs to call the *same* body's `evaluate()` an unknown, data-dependent number of times —
zero, five, a million — decided entirely at runtime by whatever the condition evaluates to on
each pass. Worth seeing, once, in plain C++, the exact loop shape this project's own
interpreter is about to be built on top of.

### Introduce the concept in isolation

```cpp
#include <iostream>

int main() {
    int x = 0;
    int last_value = 0;
    while (x < 5) {
        x = x + 1;
        last_value = x;
    }
    std::cout << "final x = " << x << ", last_value = " << last_value << "\n";
    return 0;
}
```

Real output:

```
final x = 5, last_value = 5
```

### Discard

This C++ `while` loop is deleted. `WhileExpression::evaluate` (Concept Unit 3) is, at its
core, this exact same loop — `while (condition) { body; }` — except `condition` and `body`
are `Expression*`s evaluated through this project's own interpreter, not literal C++
statements.

### CS lens

This lesson's `WhileExpression` is a small, direct instance of a much bigger idea worth
naming: **a program written in one language (C++) implementing a control-flow construct for
a *different* language (this project's own math language)**, using the host language's own
matching construct to do it. This is exactly how nearly every real interpreter's loop
constructs are built — Python's own `while` statement is itself implemented, somewhere deep
in CPython's C source, using C's own `while` — and it's worth noticing directly, since it's
easy to lose sight of after twelve lessons of building an increasingly elaborate system: this
project's `while` genuinely *is* C++'s `while`, wearing a thin layer of `Expression`/`Value`
machinery on top.

---

## Concept Unit 2: A keyword, a grammar rule

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `lexer.h`, `lexer.cpp`, `parser.h`, `parser.cpp`.
- **Change type:** add one `TokenType`, one keyword check, one parser method, one dispatch
  point.
- **Location:** `lexer.h`'s enum; `lexer.cpp`'s `read_identifier` and `token_type_name`;
  `parser.h`'s method list; `parser.cpp`'s `parse_comparison` and a new `parse_while`.
- **Dependencies:** the `If`/`parse_if` precedent from Lesson 12 — this unit follows it
  exactly.

### The New Code — type it yourself

```cpp
std::unique_ptr<Expression> Parser::parse_while() {
    expect(TokenType::While, "expected 'while'");
    expect(TokenType::LParen, "expected '(' after 'while'");
    std::unique_ptr<Expression> condition = parse_comparison();
    expect(TokenType::RParen, "expected ')' after while condition");

    std::unique_ptr<Expression> body = parse_comparison();

    return std::make_unique<WhileExpression>(std::move(condition), std::move(body));
}
```

### The Updated Project

`lexer.h`'s enum, with `While` added:

```cpp
enum class TokenType { Number, Identifier, Equals, Plus, Minus, Star, Slash, LParen, RParen,
                        LBracket, RBracket, Semicolon, Less, Greater, LessEqual, GreaterEqual,
                        EqualEqual, NotEqual, If, Else, While, End };                 // ← changed
```

`Lexer::read_identifier`, with the new keyword check marked (the `if`/`else` checks above it
are unchanged from Lesson 12):

```cpp
    if (text == "else") {
        return Token{TokenType::Else, text};
    }
    if (text == "while") {                                               // ← new
        return Token{TokenType::While, text};                            // ← new
    }                                                                    // ← new
    return Token{TokenType::Identifier, text};
```

`parser.h`'s method list, with `parse_while` added:

```cpp
    std::unique_ptr<Expression> parse_if();
    std::unique_ptr<Expression> parse_while();                           // ← new
```

`Parser::parse_comparison`'s dispatch, with the new check marked (the `If` check above it is
unchanged from Lesson 12):

```cpp
std::unique_ptr<Expression> Parser::parse_comparison() {
    // ... (assignment check — see Concept Unit 4, this lesson's real fix)

    if (check(TokenType::If)) {
        return parse_if();
    }

    if (check(TokenType::While)) {                                       // ← new
        return parse_while();                                          // ← new
    }                                                                    // ← new

    // ... (comparison-parsing tail, unchanged)
}
```

### Mechanical walkthrough

`parse_while`'s shape is a direct, deliberate copy of `parse_if`'s (Lesson 12): expect a
keyword, expect `(`, parse a comparison as the condition, expect `)`, parse a comparison as
the body — with one real difference worth naming, not glossed over: `parse_if` requires an
`else` and parses a *second* comparison; `parse_while` needs neither. A `while` loop with no
body to run and no alternative to fall back to is a complete, valid construct on its own —
unlike `if`, which (per Lesson 12) *must* produce a `Value` on every path, and therefore
can't leave "condition is false" unhandled.

### CS lens

`parse_if` and `parse_while` sharing almost the same shape — keyword, parenthesized
condition, then a `comparison`-level body — reflects that they're both instances of the same
underlying grammar pattern: a **keyword-introduced compound construct**, structurally close
enough that a reader who's internalized one can predict most of the other's shape on sight.
This is a real, useful property of a well-designed grammar, not a coincidence: new constructs
that fit the same rhythm as ones already learned are cheaper to add, and cheaper to read
later.

---

## Concept Unit 3: `WhileExpression` — evaluating a child more than once

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.h`, `ast.cpp`.
- **Change type:** add.
- **Location:** `ast.h`, after `IfExpression`; `ast.cpp`, after `IfExpression`'s definitions.
- **Dependencies:** none new.

### The New Code — type it yourself

```cpp
Value WhileExpression::evaluate(Environment& env) const {
    const int max_iterations = 1000000;

    Value result = Value::number(0.0);
    int iterations = 0;

    while (condition_->evaluate(env).as_number() != 0.0) {
        result = body_->evaluate(env);

        iterations++;
        if (iterations >= max_iterations) {
            throw std::runtime_error(
                "while loop exceeded maximum iteration count (" + std::to_string(max_iterations) +
                "); this is almost certainly an infinite loop");
        }
    }

    return result;
}
```

### The Updated Project

`ast.h`'s tail, with `WhileExpression` appended after `IfExpression` (unchanged from Lesson
12):

```cpp
class WhileExpression : public Expression {                              // ← new
public:                                                                  // ← new
    WhileExpression(std::unique_ptr<Expression> condition, std::unique_ptr<Expression> body);  // ← new
    Value evaluate(Environment& env) const override;                     // ← new
                                                                           // ← new
private:                                                                  // ← new
    std::unique_ptr<Expression> condition_;                               // ← new
    std::unique_ptr<Expression> body_;                                    // ← new
};                                                                        // ← new
```

`ast.cpp`'s tail, `WhileExpression`'s constructor and `evaluate` appended after
`IfExpression`:

```cpp
WhileExpression::WhileExpression(std::unique_ptr<Expression> condition, std::unique_ptr<Expression> body)  // ← new
    : condition_(std::move(condition)), body_(std::move(body)) {}         // ← new

Value WhileExpression::evaluate(Environment& env) const {                // ← new
    // ... (shown in full above)
}
```

### Mechanical walkthrough (new items only)

- `Value result = Value::number(0.0);` before the loop even starts — **(a) first appearance
  of a default value for a construct that might never run its body.** If `condition_`
  evaluates to `false` on the very first check, the `while` loop body below never executes
  even once — `result` needs *some* well-defined value to return in that case, since
  `evaluate()`'s return type is `Value`, never "nothing." `0.0` is the chosen default — a
  real, deliberate design decision, not a forced one; there's no "correct" value for "a loop
  that never ran," only a reasonable convention, stated honestly here as exactly that.
- `condition_->evaluate(env).as_number() != 0.0` as the `while` loop's own condition — **(a)
  first appearance of a condition re-evaluated fresh on every single pass, not cached.** This
  is the entire mechanism by which a loop can terminate at all: `condition_` is a *tree*
  (an `Expression*`), not a stored boolean — calling `evaluate(env)` on it again each
  iteration means it reads whatever `env` currently holds *right now*, including any changes
  the body just made moments earlier. Cache this value once outside the loop instead, and the
  loop would either never run (if false initially) or run forever (if true initially,
  regardless of what the body does) — the freshness of this exact call is not incidental.
- `result = body_->evaluate(env);` **inside** the loop, overwritten on every iteration — **(a)
  first appearance of a value being deliberately discarded and replaced repeatedly.** Every
  iteration's body result is thrown away the moment the *next* iteration's result replaces
  it, except the very last one — which is what survives to be returned. This is a real,
  visible design choice: this project's `while` reports only its *final* iteration's value,
  with no way to inspect intermediate ones (no accumulation across iterations beyond whatever
  the body itself writes into `env` via assignment).
- `iterations++` and the `max_iterations` check, **inside** the loop body, after `result` is
  updated — **(a) first appearance of a runaway-execution guard, and the reason it exists,
  stated plainly.** Nothing about `WhileExpression`'s condition or body, by itself, guarantees
  the loop ever terminates — `while (1) 1` is syntactically and semantically completely valid
  by every rule this project has built so far, and its condition is *always* true, forever.
  Recall Lesson 1's server design: `accept()` handles exactly one connection at a time, in a
  single-threaded loop — an interpreter stuck evaluating an infinite `while` blocks that
  *entire* server, for *every* client, indefinitely, not just the one request that triggered
  it. This is a genuine denial-of-service hazard, not a hypothetical one, and this check is
  what turns "the server hangs forever" into "this one request fails after a bounded amount of
  work, and the server keeps serving everyone else."

### CS lens

Re-checking the loop condition against live, current state on every pass — rather than a
value captured once — is precisely what separates a genuine loop from a construct that merely
*looks* like one. Also recognized in: this is exactly why `for (int i = 0; i < n; i++)` in C++
re-evaluates `i < n` every iteration rather than once; a loop condition that isn't re-checked
against fresh state isn't actually a loop, it's a single branch dressed up in loop syntax.

### SE lens

A hard iteration cap is a blunt instrument — a legitimate, long-running computation (say,
converging on a value over hundreds of thousands of genuinely necessary iterations) would be
cut off at exactly the same threshold as a true infinite loop, with an identical error
message either way; this project's `WhileExpression` cannot currently tell the two apart. The
real tradeoff accepted here: false positives (a slow-but-correct loop, incorrectly killed) are
accepted as the cost of guaranteeing no request can hang this server forever — a defensible
choice for a project whose interpreter has no timeout mechanism, no cooperative cancellation,
and (recall Lesson 1) serves one client at a time on a single thread. A production interpreter
would likely use a wall-clock timeout instead of (or alongside) an iteration count, which
would catch both a true infinite loop *and* a working-but-slow one identically by time rather
than count — a real, reasonable alternative design, not built here.

---

## Concept Unit 4: The real bug — assignment had nowhere to live inside a body

### The Problem

The very first natural test of this lesson's own feature —
`while (x < 5) x = x + 1` — failed with `error: expected end of input (got EQUALS)`. Tracing
why: `WhileExpression`'s body is parsed by calling `parse_comparison()` (Concept Unit 2,
following `parse_if`'s exact precedent) — but `parse_comparison`, as Lesson 12 left it, has
**no branch at all for assignment**. Assignment has only ever been checked at the very top of
`parse_statement`, a level *above* `parse_comparison`, which a loop's body never reaches.
`x = x + 1` as a `while` body was parsed as: `x` alone (a `VariableExpression`, correctly
matching `parse_comparison`'s ordinary fallback), leaving `= x + 1` completely unconsumed —
exactly the same category of failure as Lesson 9's mismatched-parenthesis bug, just one level
higher in the grammar.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `parser.cpp` only.
- **Change type:** move the assignment check from `parse_statement` into `parse_comparison`.
- **Location:** both methods, in full.
- **Dependencies:** none new — this is a pure relocation of existing logic.

### The New Code — type it yourself

```cpp
std::unique_ptr<Expression> Parser::parse_statement() {
    return parse_comparison();
}
```

### The Updated Project

`parse_statement` and `parse_comparison`, in full — the assignment-handling code itself is
byte-for-byte the same code Lesson 4 originally wrote, just relocated:

```cpp
std::unique_ptr<Expression> Parser::parse_statement() {                  // ← changed
    return parse_comparison();                                          // ← changed
}                                                                         // ← changed

std::unique_ptr<Expression> Parser::parse_comparison() {
    if (check(TokenType::Identifier) && check_next(TokenType::Equals)) {  // ← moved here
        Token name = advance();                                         // ← moved here
        advance();                                                      // ← moved here
        std::unique_ptr<Expression> value = parse_comparison();          // ← moved here
        return std::make_unique<AssignmentExpression>(name.text, std::move(value));  // ← moved here
    }                                                                    // ← moved here

    if (check(TokenType::If)) {
        return parse_if();
    }

    if (check(TokenType::While)) {
        return parse_while();
    }

    std::unique_ptr<Expression> left = parse_expression();

    if (check(TokenType::Less) || check(TokenType::Greater) || check(TokenType::LessEqual) ||
        check(TokenType::GreaterEqual) || check(TokenType::EqualEqual) || check(TokenType::NotEqual)) {
        TokenType op = advance().type;
        std::unique_ptr<Expression> right = parse_expression();
        return std::make_unique<BinaryExpression>(op, std::move(left), std::move(right));
    }

    return left;
}
```

### Mechanical walkthrough (new items only)

- `parse_statement` reduced to a single pass-through line — **(a) first appearance of a
  method becoming a thin wrapper after a refactor, worth keeping anyway.** With assignment
  moved out, `parse_statement` no longer does any real work of its own — it could, in
  principle, be deleted entirely, with `parse()` calling `parse_comparison()` directly. It's
  kept as a one-line pass-through instead, purely for the name: `parse()` reading
  `parse_statement()` documents intent ("this is the top-level thing being parsed") in a way
  `parse()` reading `parse_comparison()` wouldn't as clearly, at the cost of one extra,
  trivial function call — a small, defensible readability choice over the theoretically
  "leaner" alternative.
- The assignment check now living inside `parse_comparison`, reachable from *everywhere*
  `parse_comparison` is called — **(a) first appearance of this fix's real, project-wide
  consequence.** This single relocation doesn't just fix `while` bodies — it makes assignment
  legal inside `if` branches (`if (x > 0) y = 1 else y = -1`, which Lesson 12's own tests
  happened not to exercise), inside parenthesized sub-expressions, and inside function-call
  arguments, everywhere at once, because every one of those call sites already routes through
  `parse_comparison`. One bug, one fix, several previously-broken combinations repaired
  simultaneously — a direct, visible payoff of this project's layered-grammar design from
  Lesson 3 onward.

### CS lens

This bug's root cause — a capability (assignment) tied to one specific *grammar level*
(`parse_statement`) rather than to the recursive rule structure that actually needed it — is
a common, real category of bug in hand-written recursive-descent parsers: something works
correctly at the "top" of a grammar and silently fails the moment it's needed one level
deeper, precisely because grammars in this style are trees of mutually-recursive functions,
and a capability placed at the wrong node in that tree is unreachable from anywhere below it,
with no compiler warning of any kind — the code compiles perfectly; it simply parses the
wrong grammar.

---

## Concept Unit 5: Verifying the safety net, not just trusting it

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "x = 0"
0

$ curl -X POST http://localhost:8080/evaluate -d "while (x < 5) x = x + 1"
5

$ curl -X POST http://localhost:8080/evaluate -d "x"
5

$ curl -X POST http://localhost:8080/evaluate -d "while (0) 99"
0

$ curl -X POST http://localhost:8080/evaluate -d "y = 0"
0

$ curl -X POST http://localhost:8080/evaluate -d "while (y < 5) (y = if (y == 2) 10 else y + 1)"
10

$ curl -X POST http://localhost:8080/evaluate -d "A = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "det(A)"
-2
```

`while (x < 5) x = x + 1` returning `5`, and a follow-up `x` request *also* returning `5`,
confirms two things at once: the loop actually ran to completion, and — because `Environment`
persists across requests (Lesson 4) — its effect on `x` outlived the request that caused it,
exactly the way `x = 5` alone has since Lesson 4. `while (0) 99` returning `0` (not `99`)
confirms the zero-iterations default from Concept Unit 3 fires correctly — the body `99`
never runs at all. The nested `if`-inside-`while` test returning `10` matches a hand trace:
`y` climbs `0 → 1 → 2`, then the `if` inside the body jumps it straight to `10`, at which
point `y < 5` is false and the loop stops. `det(A)` at the end confirms Lesson 9's
functionality is completely unaffected by anything in this lesson.

The safety cap, verified separately and directly rather than assumed:

```
$ curl -X POST http://localhost:8080/evaluate -d "while (1) 1"
error: while loop exceeded maximum iteration count (1000000); this is almost certainly an infinite loop
```

Timed for real: this request took **0.94 seconds** to fail — a genuinely bounded amount of
work, not an instant rejection and not a hang. Immediately afterward, a completely unrelated
request:

```
$ curl -X POST http://localhost:8080/evaluate -d "1 + 1"
2
```

returned correctly, in the same server process, on the very next connection — direct,
observed proof that one request hitting the iteration cap does not take the server down or
leave it in a broken state for anyone else, which is the entire point of building this guard
in the first place.

### Connect

`while` now genuinely repeats, mutates state across iterations, and is protected against
running forever. What's still missing, sharply: a loop body remains exactly **one**
expression — this lesson's own `if`-inside-`while` test worked *only* because the whole
combined update (`y = if (y == 2) 10 else y + 1`) could be squeezed into a single expression.
A more natural loop — updating *two* separate variables per iteration (a running sum *and* a
counter, say) — genuinely cannot be expressed with this grammar at all. That's not a
hypothetical gap; it's the direct, current ceiling on what this project's control flow can
do, and it's exactly what block syntax (a sequence of statements, evaluated in order) would
lift — a real, substantial piece of grammar and evaluation-order machinery, deliberately left
for its own lesson.

---

## Closing

### Connect the pieces

Trace `"while (x < 5) x = x + 1"` end to end, with `x = 0` already stored: Lesson 1's
socket/HTTP layer delivers the body unchanged → the lexer (Concept Unit 2) produces `WHILE
LPAREN IDENTIFIER(x) LESS NUMBER(5) RPAREN IDENTIFIER(x) EQUALS IDENTIFIER(x) PLUS NUMBER(1)
END` → `parse_comparison` sees `While` and calls `parse_while` (Concept Unit 2): condition
`x < 5`, and — this lesson's real fix (Concept Unit 4) — the body `x = x + 1` now parses
correctly as an `AssignmentExpression`, because `parse_comparison`'s own assignment check
fires when parsing the body → a `WhileExpression` is built → `evaluate()` (Concept Unit 3)
runs the loop: iteration 1, condition `0 < 5` true, body assigns `x = 1`; iteration 2,
condition `1 < 5` true, body assigns `x = 2`; this continues through `x = 5`; iteration 6,
condition `5 < 5` is false, the loop stops → `result` holds the last body value, `5` →
returned, formatted, and sent back over HTTP by Lesson 1's completely untouched response code
→ a later, separate request for `x` confirms the mutation genuinely persisted in
`Environment`.

### What breaks without this

In `WhileExpression::evaluate`, temporarily remove the iteration cap entirely:

```cpp
Value WhileExpression::evaluate(Environment& env) const {
    Value result = Value::number(0.0);

    while (condition_->evaluate(env).as_number() != 0.0) {
        result = body_->evaluate(env);
    }

    return result;
}
```

**Do not run `"while (1) 1"` against this version** — predict the outcome instead, based on
everything this lesson has already shown: the condition `1` never becomes `0.0`, `body_`
(`1`) never changes anything in `env`, so nothing about the loop's own state ever differs
between iterations — it would run forever, in this project's single-threaded,
one-connection-at-a-time server (Lesson 1), blocking every other client indefinitely, with no
way to recover short of killing the server process itself. This is the one experiment in this
entire curriculum deliberately described rather than actually executed — the real, concrete
cost of *not* having the guard, reasoned through rather than demonstrated, precisely because
demonstrating it would mean recreating the exact hazard the guard exists to prevent. Restore
the iteration cap before moving on; it was never optional scaffolding.

### Exercises

- Trace `"while (x > 0) x = x - 1"` by hand, starting from whatever `x` currently holds after
  this lesson's tests (`5`), and predict the returned value and the number of iterations
  before verifying with `curl`.
- `while (0) 99` returning `Value::number(0.0)` — the chosen zero-iterations default — means
  it's currently indistinguishable, from the *outside*, from a loop that ran once and its
  body genuinely evaluated to `0`. Consider (as an exercise only, not required for this
  lesson's Definition of Done) whether that ambiguity could ever matter to something calling
  a `while` loop's result, and what a distinguishable alternative might look like.
- Confirm — by reasoning, not by running it — why `while (x < 5) x = x - 1` (note the `-`,
  not `+`, with `x` starting below `5`) would hit this lesson's real 1,000,000-iteration cap
  rather than ever terminating, and identify exactly which line in `WhileExpression::evaluate`
  is what eventually stops it from hanging the server.

### Definition of done

- [ ] `lexer.h`/`lexer.cpp` compile cleanly with the `while` keyword recognized.
- [ ] `ast.h`/`ast.cpp` compile with `WhileExpression` added.
- [ ] `parser.h`/`parser.cpp` compile with `parse_while`, and with assignment relocated into
      `parse_comparison`.
- [ ] `while (x < 5) x = x + 1` (with `x` initialized first) returns the correct final value,
      and a follow-up request confirms the mutation persisted.
- [ ] `while (0) 99` returns the zero-iterations default, not `99`.
- [ ] A loop combining `if` inside a `while` body produces the correct result, matching a hand
      trace.
- [ ] `while (1) 1` fails with the specific iteration-cap error, and — verified with a
      follow-up request in the same server session — the server continues serving other
      requests correctly afterward.
- [ ] `if (x > 0) y = 1 else y = -1` (assignment inside an `if` branch, not exercised by
      Lesson 12's own tests) now also parses and runs correctly, confirming the assignment fix
      benefits more than just `while`.
- [ ] The "what breaks without this" section was reasoned through, not executed against a live
      server — confirm this deliberate exception to the schema's usual "actually run it" rule
      makes sense given what it would cost to run for real.
- [ ] Commit:

```
git add lexer.h lexer.cpp ast.h ast.cpp parser.h parser.cpp
git commit -m "Add while as a repeating expression, with a hard iteration cap

WhileExpression re-evaluates its condition fresh every iteration
(never cached) against a body that may itself mutate the same
Environment - that mutation is the only mechanism by which a loop
can ever terminate. Returns the last iteration's body value, or
0.0 if the body never ran - a deliberate, named convention, not a
forced one.

Capped at 1,000,000 iterations, verified for real: 'while (1) 1'
takes ~0.94s to fail with a clear error, and the server (single-
threaded, one connection at a time since Lesson 1) continues
serving other requests correctly afterward. Without this cap, a
single request could hang the entire server indefinitely - a real
denial-of-service hazard, not a hypothetical one. The cap is a
blunt instrument: a legitimate, slow-but-correct loop would be
killed identically to a true infinite one; a wall-clock timeout
would be a more precise real-world alternative, not built here.

Also fixes a real, significant bug this lesson's own first test
surfaced: assignment previously only lived in parse_statement, one
level above parse_comparison, making 'while (x < 5) x = x + 1'
- the single most natural while-loop body - unparseable. Moved
the assignment check into parse_comparison itself, which also
silently fixes assignment inside if-branches and other previously-
untested combinations, since every one of those call sites already
routes through parse_comparison.

Scope, deliberately deferred: loop and if bodies remain exactly
one expression each - no block syntax, no way to update two
variables in one iteration. That ceiling is real and current,
not hypothetical; lifting it is its own lesson."
```

Next lesson: `function f(x) ... end` — user-defined functions, closures, and lexical scope —
the SICP-style culmination this curriculum has been building toward since Lesson 4's
`Environment`.
