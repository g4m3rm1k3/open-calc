# Lisp-CPP — LAB 08 — Evaluator: Walking the Tree

**Prerequisites:** LAB-07 complete. The full pipeline exists: source → tokens → AST. You understand recursion and tree traversal.

**What this lab adds:**
- `eval()` — the function that walks an AST and computes a value
- Pattern matching via `switch` and `if` on node type
- The eval-apply cycle — the two-step loop at the heart of every interpreter
- Arithmetic primitives: `+`, `-`, `*`, `/`
- The complete pipeline running end-to-end for the first time

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. To evaluate `(+ 1 2)`, what must you do first before calling the `+` function?
> 2. SICP says evaluation follows two rules: atoms evaluate to themselves (for numbers)
>    or their bound value (for symbols). Lists evaluate by applying the operator to
>    the evaluated operands. What C++ code structure maps to "evaluate each operand"?
> 3. `(+ (* 2 3) 4)`: in what order do the recursive `eval` calls happen?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

eval("(+ 1 2)")         = 3
eval("(* 3 4)")         = 12
eval("(- 10 3)")        = 7
eval("(/ 10 2)")        = 5
eval("(+ (* 2 3) 4)")   = 10
eval("(+ 1 (+ 2 3))")   = 6
eval("(* (+ 1 2) (- 5 1))") = 12

Error: eval("(/ 1 0)")  = Error: division by zero
Error: eval("(foo 1 2)") = Error: unknown operator: foo
```

The full pipeline: string → tokens → tree → integer value.

---

## Concept: The Eval-Apply Cycle

**What it is:** The heart of every interpreter. SICP makes this the centerpiece
of Chapter 4. Every evaluation reduces to two alternating operations:

**Eval:** Given an expression and an environment, produce a value.

**Apply:** Given a function (operator) and a list of argument values, call the function.

```
eval( (+ (* 2 3) 4) )
  ↓
  It is a list. Eval each element:
    eval( + )     → the addition function
    eval( (* 2 3) )  ← this itself calls eval-apply:
      eval( * )   → the multiplication function
      eval( 2 )   → 2
      eval( 3 )   → 3
      apply( *, [2, 3] ) → 6
    eval( 4 )     → 4
  apply( +, [6, 4] ) → 10
```

**The cycle:**
- `eval` evaluates an expression to produce a value — if the expression is a list, it calls `apply`
- `apply` calls a function with values — if the function body is an expression, it calls `eval`

This cycle is the computational model of Lisp. In LAB-12, when you add lambda,
the cycle becomes fully visible: `apply` will call `eval` on the lambda body.

**Transfer:** JavaScript's engine runs this cycle for every expression. Python's
interpreter does the same. The names differ but the mechanism is identical.
Understanding the eval-apply cycle makes every dynamic language's behavior predictable.

---

## Concept: LispVal — The Return Type of Eval

**What it is:** `eval()` must return a value. For now, that value is an integer.
But eventually it will need to return numbers, booleans, lists, functions, or errors.
We introduce a placeholder type now and extend it in LAB-09.

**For LAB-08, we use `int` directly.** This keeps the evaluator simple while the
concept is being established. In LAB-09, `int` is replaced by a proper `LispVal`
type that can hold any Lisp value.

**The limitation:** With `int` as the return type, we cannot return booleans,
lists, or error values directly. We handle errors by throwing `std::runtime_error`
(caught by the REPL in LAB-24). This is not ideal — LAB-23 introduces a proper
`Result` type — but it is correct for now.

---

## Concept: Pattern Matching With `if` and `switch`

**What it is:** The evaluator inspects each node's type and dispatches to different
code based on what it finds. This is pattern matching — the same concept as Rust's
`match` or Haskell's case analysis.

**In C++, pattern matching is done manually:**

```cpp
int eval(const Node* node) {
    // Base cases — atoms:
    if (node->kind == NodeKind::ATOM) {
        // What kind of atom?
        // We need to know if it's a number, symbol, boolean...
        // For now: try to parse as a number, else treat as symbol.
    }

    // Recursive case — list:
    if (node->kind == NodeKind::LIST) {
        // The first child is the operator.
        // The remaining children are operands.
    }
}
```

**C++ lacks native pattern matching** (C++23 adds `std::visit` for variants,
but not for arbitrary types). We simulate it with `if`/`else if` chains and
`switch` on enum values.

**Rust equivalent (for contrast):**

```rust
match node {
    Atom(Number(n)) => n,
    Atom(Symbol(s)) => env.lookup(s),
    List(op, args)  => apply(eval(op), args.map(eval)),
}
```

In LAB-09 and LAB-19, we use `std::variant` and `std::visit` to get closer to this.

---

## Concept: Applying Arithmetic Operators

**What it is:** For a list like `(+ 1 2)`, evaluation means:
1. Identify the operator: `+`
2. Evaluate the operands: `1` → 1, `2` → 2
3. Apply the operator to the values: `1 + 2` → 3

**For arithmetic, this is just a `switch` on the operator string:**

```cpp
std::string op = node->children[0]->value;   // "+" or "-" or "*" or "/"

if (op == "+") {
    int result = 0;
    for (size_t i = 1; i < node->children.size(); i++) {
        result += eval(node->children[i]);   // eval each operand, add to result
    }
    return result;
}
```

**The operand loop:**

The for loop starts at index 1 (skipping the operator at index 0). It calls
`eval()` on each operand recursively. If an operand is itself a list like
`(* 2 3)`, the recursive `eval` call evaluates it completely before its value
is added to `result`. This is the "evaluate arguments before applying" rule —
what SICP calls applicative order evaluation.

---

## Step 1 — Create `src/eval.h` and `src/eval.cpp`

```bash
touch src/eval.h
touch src/eval.cpp
```

Update `CMakeLists.txt`:

```cmake
add_executable(lisp
    src/main.cpp
    src/lexer.cpp
    src/node.cpp
    src/parser.cpp
    src/eval.cpp   # ← add this
)
```

**`src/eval.h`:**

```cpp
#pragma once

#include "node.h"   // Node, NodeKind

// eval: evaluate an AST node and return its integer value.
// Throws std::runtime_error on:
//   - unknown operators
//   - division by zero
//   - wrong number of operands (future)
//
// NOTE: this returns int for LAB-08 only. LAB-09 replaces int with LispVal.
int eval(const Node* node);
```

---

## Step 2 — Write `src/eval.cpp`

```cpp
#include "eval.h"
#include <stdexcept>    // std::runtime_error
#include <string>       // std::string, std::stoi
#include <cstdio>       // printf (for debug tracing — removed in LAB-09)

// eval: evaluate a node.
// This is the central function of the interpreter.
// Every expression eventually reduces through this function.
int eval(const Node* node) {

    // ── ATOM EVALUATION ───────────────────────────────────────────
    if (node->kind == NodeKind::ATOM) {
        // An atom is either a number literal or a symbol.
        // Numbers evaluate to their integer value.
        // Symbols evaluate to their bound value in the environment.
        // (Environments come in LAB-10. For now, symbols in operators
        // are handled in the LIST branch below.)

        // Attempt to parse the atom's value as an integer.
        // std::stoi: "string to integer" — throws std::invalid_argument
        // if the string cannot be parsed as an integer.
        try {
            // std::stoi converts "42" → 42, "-7" → -7.
            // It stops at the first non-numeric character.
            return std::stoi(node->value);
        } catch (const std::invalid_argument&) {
            // Not a number — this atom is a symbol.
            // Symbols should be resolved against the environment.
            // Without an environment (LAB-10), we report an error.
            throw std::runtime_error(
                std::string("Unbound symbol: '") + node->value + "'");
        }
    }

    // ── LIST EVALUATION ───────────────────────────────────────────
    if (node->kind == NodeKind::LIST) {
        // An empty list evaluates to... nothing useful for now.
        // In full Lisp, '() is nil. We handle this in LAB-09.
        if (node->children.empty()) {
            throw std::runtime_error("Cannot evaluate empty list");
        }

        // The first child is the operator — it must be an atom (a symbol name).
        // Example: in (+ 1 2), children[0] is ATOM "+"
        const Node* op_node = node->children[0];
        if (op_node->kind != NodeKind::ATOM) {
            // The operator is itself a list — e.g. ((lambda (x) x) 5).
            // This requires lambda support from LAB-12. Error for now.
            throw std::runtime_error("Operator must be a symbol (lambdas come in LAB-12)");
        }

        const std::string& op = op_node->value;   // "+", "-", "*", "/"

        // ── ARITHMETIC OPERATORS ──────────────────────────────────
        if (op == "+") {
            // (+ arg1 arg2 ... argN) — sum all arguments.
            // Lisp's + is variadic — it takes any number of arguments.
            int result = 0;   // identity element for addition
            for (size_t i = 1; i < node->children.size(); i++) {
                // Recursively evaluate each operand before adding.
                // This is the eval-apply cycle: eval each argument.
                result += eval(node->children[i]);
            }
            return result;
        }

        if (op == "-") {
            // (- a b) → a - b.
            // (- a) → -a (unary negation).
            if (node->children.size() < 2) {
                throw std::runtime_error("'-' requires at least one argument");
            }
            int result = eval(node->children[1]);   // start with first operand
            if (node->children.size() == 2) {
                return -result;   // unary: (- 5) → -5
            }
            for (size_t i = 2; i < node->children.size(); i++) {
                result -= eval(node->children[i]);
            }
            return result;
        }

        if (op == "*") {
            // (* arg1 arg2 ... argN) — product of all arguments.
            int result = 1;   // identity element for multiplication
            for (size_t i = 1; i < node->children.size(); i++) {
                result *= eval(node->children[i]);
            }
            return result;
        }

        if (op == "/") {
            // (/ a b) → integer division a / b.
            if (node->children.size() != 3) {
                throw std::runtime_error("'/' requires exactly two arguments");
            }
            int dividend = eval(node->children[1]);
            int divisor  = eval(node->children[2]);

            // Division by zero: undefined behavior in C++.
            // We must check explicitly and throw before the division.
            if (divisor == 0) {
                throw std::runtime_error("division by zero");
            }
            return dividend / divisor;
        }

        // ── UNKNOWN OPERATOR ──────────────────────────────────────
        // Any symbol that is not a built-in arithmetic operator.
        // Will be handled by the environment (LAB-10) and builtins (LAB-25).
        throw std::runtime_error(
            std::string("unknown operator: ") + op);
    }

    // Should never reach here — every NodeKind is handled above.
    throw std::runtime_error("eval: unrecognized node kind");
}
```

---

## Step 3 — Update `src/main.cpp`

```cpp
#include <cstdio>
#include <stdexcept>
#include "lexer.h"
#include "node.h"
#include "parser.h"
#include "eval.h"     // ← add this

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

// Run the full pipeline: source → tokens → AST → integer.
// Prints the result or the error message.
void test_eval(const char* source) {
    try {
        std::vector<Token> tokens = tokenize(source);
        Node* tree = parse(tokens);
        int result = eval(tree);
        free_tree(tree);
        printf("eval(\"%s\") = %d\n", source, result);
    } catch (const std::runtime_error& e) {
        printf("Error: eval(\"%s\") = %s\n", source, e.what());
    }
}

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n\n", VERSION_MAJOR, VERSION_MINOR);

    test_eval("(+ 1 2)");
    test_eval("(* 3 4)");
    test_eval("(- 10 3)");
    test_eval("(/ 10 2)");
    test_eval("(+ (* 2 3) 4)");
    test_eval("(+ 1 (+ 2 3))");
    test_eval("(* (+ 1 2) (- 5 1))");
    printf("\n");
    test_eval("(/ 1 0)");     // division by zero
    test_eval("(foo 1 2)");   // unknown operator

    return 0;
}
```

### COMPILE AND RUN

```bash
cmake -S . -B build
cmake --build build
./build/lisp
```

Expected:
```
Lisp interpreter v0.1

eval("(+ 1 2)")             = 3
eval("(* 3 4)")             = 12
eval("(- 10 3)")            = 7
eval("(/ 10 2)")            = 5
eval("(+ (* 2 3) 4)")       = 10
eval("(+ 1 (+ 2 3))")       = 6
eval("(* (+ 1 2) (- 5 1))") = 12

Error: eval("(/ 1 0)")      = division by zero
Error: eval("(foo 1 2)")    = unknown operator: foo
```

**Change something:** Change `test_eval("(+ 1 (+ 2 3))")` to trace how evaluation
works. Add a `printf` at the top of `eval()`:
```cpp
printf("[eval] kind=%s value='%s' children=%zu\n",
       node->kind == NodeKind::ATOM ? "ATOM" : "LIST",
       node->value.c_str(),
       node->children.size());
```
Rebuild and see the exact order `eval` is called. You will see the tree walked
depth-first, inner nodes resolved before outer ones. Remove the printf after examining.

---

## 🎯 Challenge: Add `=`, `<`, `>` Operators

**You know:** Adding operators to the evaluator by pattern-matching on `op`.

**Task:** Add three comparison operators:
- `(= a b)` → 1 if a equals b, else 0
- `(< a b)` → 1 if a < b, else 0
- `(> a b)` → 1 if a > b, else 0

All return `int` for now (1 = true, 0 = false). Test them:

```
eval("(= 3 3)")   = 1
eval("(= 3 4)")   = 0
eval("(< 2 5)")   = 1
eval("(> 5 2)")   = 1
```

Add these in `eval.cpp` in the arithmetic operator section.

<details>
<summary>▶ Show Solution</summary>

```cpp
// Add these blocks after the "/" operator block in eval.cpp:

if (op == "=") {
    if (node->children.size() != 3) {
        throw std::runtime_error("'=' requires exactly two arguments");
    }
    int a = eval(node->children[1]);
    int b = eval(node->children[2]);
    return (a == b) ? 1 : 0;   // return 1 for true, 0 for false
}

if (op == "<") {
    if (node->children.size() != 3) {
        throw std::runtime_error("'<' requires exactly two arguments");
    }
    return (eval(node->children[1]) < eval(node->children[2])) ? 1 : 0;
}

if (op == ">") {
    if (node->children.size() != 3) {
        throw std::runtime_error("'>' requires exactly two arguments");
    }
    return (eval(node->children[1]) > eval(node->children[2])) ? 1 : 0;
}
```

**Key insight:** Every new operator follows the same pattern: match the operator
string, validate argument count, evaluate the arguments recursively, compute and
return. This pattern will repeat for every built-in function through LAB-25.
When you add `define` (LAB-11) and `if` (LAB-14), those will NOT follow this pattern
— they are special forms that control whether and when arguments are evaluated.
That difference is the essence of the function vs. special form distinction.

</details>

---

## What Just Happened

The pipeline is complete for arithmetic:

```
"(+ (* 2 3) 4)"
     ↓ tokenize()
[LPAREN, SYMBOL "+", LPAREN, SYMBOL "*", NUMBER "2", NUMBER "3", RPAREN, NUMBER "4", RPAREN]
     ↓ parse()
LIST[SYMBOL "+", LIST[SYMBOL "*", ATOM "2", ATOM "3"], ATOM "4"]
     ↓ eval()
eval(LIST[+, LIST[*, 2, 3], 4])
  → eval(LIST[*, 2, 3]) = 6
  → eval(ATOM "4") = 4
  → apply(+, [6, 4]) = 10
```

You have an interpreter. It cannot yet look up variables, define functions,
or do anything but arithmetic — but the eval-apply cycle is working. Every
subsequent lab adds capabilities without changing this core structure.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Basic arithmetic | `(+ 1 2)` = 3, `(* 3 4)` = 12, `(- 10 3)` = 7, `(/ 10 2)` = 5 |
| Nested expressions | `(+ (* 2 3) 4)` = 10 |
| Deep nesting | `(* (+ 1 2) (- 5 1))` = 12 |
| Division by zero caught | Error message, no crash |
| Unknown operator caught | Error message with operator name |
| Comparison operators | `(= 3 3)` = 1, `(< 2 5)` = 1, `(> 5 2)` = 1 |

---

## Self-Check

1. In what order does `eval` process the children of `(+ (* 2 3) 4)`?
2. What is the difference between `eval` and `apply` in the eval-apply cycle?
3. Why does `(/ a b)` check for `divisor == 0` before dividing, instead of catching the C++ exception?
4. The for loop in `+` starts at `i = 1`, not `i = 0`. Why?
5. Why is `=` a special form in some languages but a regular function here?

---

## What's Next

LAB-09 replaces the `int` return type of `eval()` with `LispVal` — a proper
tagged union that can hold a number, boolean, nil, list, or function. This is
the first use of C unions and the tagged union pattern, which is the low-level
equivalent of Rust's `enum` with data or Haskell's algebraic data types.

---

## Quick Check Answers

**1. What must you do before calling `+` when evaluating `(+ 1 2)`?**
Evaluate the operands. `1` and `2` must be evaluated (they produce integers 1 and 2)
before `+` can add them. In SICP's applicative order evaluation: evaluate all
arguments first, then apply the operator. This is what the for loop in the `+` branch does.

**2. In what order do recursive `eval` calls happen for `(+ (* 2 3) 4)`?**
Depth-first, left-to-right. The outer `eval` sees a list with operator `+`.
It evaluates operand 1: `(* 2 3)` — this triggers a full recursive eval that
returns 6. Then it evaluates operand 2: `4` → 4. Then applies: 6 + 4 = 10.
The inner `(* 2 3)` is completely resolved before `4` is even looked at.

**3. What C++ code structure maps to "evaluate each operand"?**
The for loop: `for (size_t i = 1; i < node->children.size(); i++) { result += eval(node->children[i]); }`.
Each iteration calls `eval` on one operand. If the operand is itself a list,
the recursive `eval` call resolves it completely before the next operand is touched.
The recursion mirrors the recursive structure of the expression tree.
