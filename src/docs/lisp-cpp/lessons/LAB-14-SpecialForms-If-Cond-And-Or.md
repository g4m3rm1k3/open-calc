# Lisp-CPP — LAB 14 — Special Forms: `if`, `cond`, and `and`/`or`

**Prerequisites:** LAB-13 complete. Closures work. You understand the eval-apply cycle.

**What this lab adds:**
- `if` — evaluate only the branch taken (lazy by necessity)
- `cond` — multi-branch conditional
- `and` / `or` — short-circuit logical operators
- The formal distinction: why these CANNOT be regular functions
- Boolean values in conditionals — what counts as "true" in Lisp

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `(if #f (/ 1 0) 42)` should return 42. If `if` were a regular function,
>    what would happen first, before `if` even runs?
> 2. `(and #f (/ 1 0))` should return `#f` immediately. In C++, `&&` does this —
>    it short-circuits. Can a function short-circuit? Why or why not?
> 3. What is the "truthy" rule in Lisp — what counts as false?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

=== if ===
(if #t 1 2)           → 1
(if #f 1 2)           → 2
(if (= 3 3) "yes" "no")  → yes
(if #f (/ 1 0) 42)    → 42    ← (/ 1 0) is never evaluated

=== Truthiness ===
(if 0 "zero-is-true" "false")     → zero-is-true
(if nil "nil-truthy?" "nil-false") → nil-false

=== cond ===
(cond
  ((< 3 1) "a")
  ((< 3 5) "b")
  (else    "c"))   → b

=== and / or ===
(and #t #t)    → #t
(and #t #f)    → #f
(and #f (/ 1 0)) → #f   ← short-circuits
(or #f #t)     → #t
(or #f #f)     → #f
(or #f (/ 1 0)) → Error: division by zero (or evaluates second arg — why?)
```

---

## Concept: Why `if` Must Be a Special Form

**What it is:** A special form is an expression whose subforms are NOT all evaluated
before the form is processed. The evaluator handles each special form explicitly,
with custom evaluation rules, instead of the default "evaluate all, then apply" rule.

**The function evaluation rule:**

For any function call `(f a b c)`:
1. Evaluate `f` → get the function
2. Evaluate `a`, `b`, `c` → get the argument values
3. Call the function with the values

**This rule is applied eagerly — all arguments are evaluated before the function runs.**

**`if` breaks this rule:**

```lisp
(if #f (/ 1 0) 42)
```

If `if` were a function:
1. Evaluate `#f` → false
2. Evaluate `(/ 1 0)` → **EXCEPTION: division by zero** (before `if` even runs)
3. Evaluate `42` → 42
4. Call `if` with (false, error, 42) — never reached

The exception fires before `if` gets control. **A function cannot prevent its
arguments from being evaluated.** This is the definition of eager (applicative order)
evaluation.

`if` must be a special form so the evaluator can choose to evaluate only the
taken branch, skipping the other.

**The C++ equivalent:**

```cpp
// This is NOT a function — it's a language construct:
int x = (condition) ? then_val : else_val;

// As a function, it would fail:
// int ternary(bool c, int t, int e) — both t and e are evaluated before the call
```

C++'s `?:` ternary operator is also a special form at the language level.
Same for `&&`, `||`, `if`, `while` — they all control evaluation.

---

## Concept: Truthiness in Lisp

**What it is:** The rule for what values count as "false" in conditional evaluation.

**The rule for this interpreter (standard Scheme rule):**

Only `#f` is false. Everything else is true:
- `#t` → true
- Any number (including 0) → true
- Any symbol → true
- `nil` → **false** (this is a common convention but schemes vary)

```lisp
(if 0   "zero-is-true"  "false")    → "zero-is-true"
(if nil "nil-truthy?"   "nil-false") → "nil-false"
(if ""  "empty-is-true" "false")    → "empty-is-true"
```

**Implementation — `is_truthy` in C++:**

```cpp
bool is_truthy(const LispVal& val) {
    if (val.tag == LispVal::Tag::BOOL)   return val.as.boolean;
    if (val.tag == LispVal::Tag::NIL)    return false;
    return true;   // numbers, symbols, lambdas — all truthy
}
```

**Transfer:** JavaScript has a similar concept — `0`, `""`, `null`, `undefined`,
`NaN` are falsy. Python: `0`, `""`, `[]`, `{}`, `None` are falsy. The specific
rules vary; the concept of "truthiness" — non-boolean values used as conditions —
is universal in dynamic languages.

---

## Concept: `and`/`or` Short-Circuit Evaluation

**What it is:** `and` and `or` evaluate arguments left-to-right and stop as soon
as the result is determined.

- `(and a b c)` — if `a` is false, return `#f` immediately; do not evaluate `b` or `c`
- `(or a b c)` — if `a` is true, return `a` immediately; do not evaluate `b` or `c`

**Why this must be a special form:**

```lisp
(or #t (/ 1 0))
```

If `or` were a function: evaluate `#t` (fine), evaluate `(/ 1 0)` (exception) — before `or` runs.
As a special form: evaluate `#t` → truthy → return `#t` immediately, never evaluate `(/ 1 0)`.

**`or`'s return value:**

In Lisp, `or` returns the first truthy value, not just `#t`:

```lisp
(or #f 42 99)   → 42   (the first truthy value)
(or #f #f 99)   → 99
(or #f #f #f)   → #f
```

This lets you write: `(or user-provided-value default-value)` — a common idiom.

**`and`'s return value:**

`and` returns the last value if all are truthy, otherwise `#f`:

```lisp
(and 1 2 3)   → 3   (all truthy — return last)
(and 1 #f 3)  → #f  (second is false — short-circuit)
```

---

## Step 1 — Add `if` to the Evaluator

In `src/eval.cpp`, in the LIST evaluation section, add after `define`:

```cpp
        // ── SPECIAL FORM: if ──────────────────────────────────────
        // (if condition then-expr else-expr)
        // condition is always evaluated.
        // Only the taken branch is evaluated — the other is SKIPPED.
        if (op == "if") {
            if (node->children.size() < 3 || node->children.size() > 4) {
                throw std::runtime_error(
                    "'if' requires 2 or 3 arguments: condition, then, [else]");
            }

            // Evaluate the condition:
            LispVal condition = eval(node->children[1], env);

            if (is_truthy(condition)) {
                // Condition is true — evaluate and return the 'then' branch:
                return eval(node->children[2], env);
                // node->children[3] (else) is never evaluated
            } else {
                // Condition is false — evaluate and return 'else', if present:
                if (node->children.size() == 4) {
                    return eval(node->children[3], env);
                } else {
                    return make_nil();   // no else branch — return nil
                }
            }
        }
```

Add the `is_truthy` helper to `src/eval.cpp` (before `eval`):

```cpp
// is_truthy: determine whether a LispVal is logically true.
// Only #f and nil are false. Everything else is true.
static bool is_truthy(const LispVal& val) {
    if (val.tag == LispVal::Tag::BOOL) return val.as.boolean;
    if (val.tag == LispVal::Tag::NIL)  return false;
    return true;
}
```

Add `is_truthy` declaration to `src/eval.h` (or keep it static/private to eval.cpp — either works).

---

## Step 2 — Add `cond`

```cpp
        // ── SPECIAL FORM: cond ────────────────────────────────────
        // (cond (test1 expr1) (test2 expr2) ... (else exprN))
        // Each clause is a list: (test result).
        // Evaluate tests in order until one is truthy. Return that clause's result.
        // 'else' is a special keyword — its test is always true.
        if (op == "cond") {
            for (size_t i = 1; i < node->children.size(); i++) {
                const Node* clause = node->children[i];
                if (clause->kind != NodeKind::LIST || clause->children.size() != 2) {
                    throw std::runtime_error("cond: each clause must be (test result)");
                }

                const Node* test_node = clause->children[0];
                const Node* result_node = clause->children[1];

                // 'else' is always truthy — it is the default clause:
                bool test_passed;
                if (test_node->kind == NodeKind::ATOM && test_node->value == "else") {
                    test_passed = true;
                } else {
                    test_passed = is_truthy(eval(test_node, env));
                }

                if (test_passed) {
                    return eval(result_node, env);   // evaluate and return this clause's result
                }
                // Otherwise: continue to next clause
            }
            return make_nil();   // no clause matched
        }
```

---

## Step 3 — Add `and` and `or`

```cpp
        // ── SPECIAL FORM: and ─────────────────────────────────────
        // (and expr1 expr2 ... exprN)
        // Returns #f as soon as any expr is falsy (short-circuit).
        // Returns the last value if all are truthy.
        if (op == "and") {
            LispVal result = make_bool(true);   // (and) with no args = #t
            for (size_t i = 1; i < node->children.size(); i++) {
                result = eval(node->children[i], env);
                if (!is_truthy(result)) {
                    return make_bool(false);  // short-circuit: do not evaluate rest
                }
            }
            return result;   // all truthy — return last value
        }

        // ── SPECIAL FORM: or ──────────────────────────────────────
        // (or expr1 expr2 ... exprN)
        // Returns the first truthy value (short-circuit).
        // Returns #f if no value is truthy.
        if (op == "or") {
            for (size_t i = 1; i < node->children.size(); i++) {
                LispVal result = eval(node->children[i], env);
                if (is_truthy(result)) {
                    return result;   // short-circuit: return first truthy value
                }
            }
            return make_bool(false);   // none were truthy
        }
```

---

## Step 4 — Update `src/main.cpp` and Test

```cpp
int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n\n", VERSION_MAJOR, VERSION_MINOR);
    Environment* g = make_global_env();

    printf("=== if ===\n");
    eval_program({
        "(if #t 1 2)",
        "(if #f 1 2)",
        "(if (= 3 3) 10 20)",
        "(if #f (/ 1 0) 42)"    // (/ 1 0) must NOT be evaluated
    }, *g);

    printf("\n=== Truthiness ===\n");
    eval_program({
        "(if 0 100 200)",     // 0 is truthy in this interpreter
        "(if nil 100 200)"    // nil is falsy
    }, *g);

    printf("\n=== cond ===\n");
    eval_program({
        "(cond ((< 10 1) 1) ((< 10 5) 2) ((< 10 20) 3) (else 4))"
    }, *g);

    printf("\n=== and / or ===\n");
    eval_program({
        "(and #t #t)",
        "(and #t #f)",
        "(and #f (/ 1 0))",    // short-circuit: (/ 1 0) never runs
        "(or #f #t)",
        "(or #f #f)"
    }, *g);

    delete g;
    return 0;
}
```

### COMPILE AND RUN

```bash
cmake --build build && ./build/lisp
```

Expected:
```
=== if ===
eval seq: (if #t 1 2)                 → 1
eval seq: (if #f 1 2)                 → 2
eval seq: (if (= 3 3) 10 20)          → 10
eval seq: (if #f (/ 1 0) 42)          → 42

=== Truthiness ===
eval seq: (if 0 100 200)              → 100
eval seq: (if nil 100 200)            → 200

=== cond ===
eval seq: (cond ...)                  → 3

=== and / or ===
eval seq: (and #t #t)                 → #t
eval seq: (and #t #f)                 → #f
eval seq: (and #f (/ 1 0))            → #f
eval seq: (or #f #t)                  → #t
eval seq: (or #f #f)                  → #f
```

---

## What Just Happened

`if`, `cond`, `and`, `or` are all special forms. The evaluator handles each one
explicitly before reaching the default "evaluate all args, then call function"
path. The critical property: they can evaluate only some of their subforms, in
custom order. No function can do this.

This is the boundary between language mechanisms (special forms, implemented in
the evaluator) and library functions (anything definable in Lisp). The set of
necessary special forms in Lisp is very small: `if`, `define`, `lambda`, `quote`,
`begin`. Everything else can be built from these.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `(if #t 1 2)` → 1 | Then branch taken |
| `(if #f 1 2)` → 2 | Else branch taken |
| `(if #f (/ 1 0) 42)` → 42 | Division by zero NOT triggered |
| `0` is truthy | `(if 0 100 200)` → 100 |
| `nil` is falsy | `(if nil 100 200)` → 200 |
| `cond` selects correct clause | Third clause matched |
| `(and #f (/ 1 0))` → `#f` | Short-circuit — no exception |

---

## Self-Check

1. What is the fundamental reason `if` must be a special form and not a function?
2. What does `(and)` with no arguments return? Why?
3. `(or #f 42 99)` returns 42, not `#t`. Why does `or` return the value, not `#t`?
4. What is the difference between `cond` and a chain of nested `if` expressions?
5. Only `#f` and `nil` are falsy. A number `0` is truthy. Is this the right design? What are the tradeoffs?

---

## What's Next

LAB-15 demonstrates the stack overflow — deep recursion exhausts the call stack.
You will write a recursive `factorial` function and deliberately overflow the stack
to understand its limits. LAB-16 then introduces tail calls and shows how tail-call
optimization (TCO) lets recursion run indefinitely without growing the stack.

---

## Quick Check Answers

**1. `(if #f (/ 1 0) 42)` — what would happen if `if` were a function?**
All three arguments would be evaluated before `if` runs: `#f` → false,
`(/ 1 0)` → division by zero exception, `42` → 42. The exception fires
during argument evaluation, before `if` even gets control. `if` as a function
cannot prevent this.

**2. Can a function short-circuit? Why not?**
No. By the time a function runs, all its arguments have already been evaluated.
Short-circuiting requires the ability to NOT evaluate some arguments — which
means the expression must be handled at the evaluator level (special form),
not the function level.

**3. What counts as false in Lisp?**
Only `#f` (and `nil` in our implementation). Everything else — numbers including 0,
non-empty strings, symbols, lambdas — is truthy. This is different from C (where 0
is false) and Python (where many things are falsy). Scheme uses this "only #f is false"
rule for simplicity and predictability.
