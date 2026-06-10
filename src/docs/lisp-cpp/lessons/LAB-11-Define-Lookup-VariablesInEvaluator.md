# Lisp-CPP — LAB 11 — Define and Lookup: Variables in the Evaluator

**Prerequisites:** LAB-10 complete. Environment works. `(define x 42)` and `x` evaluate correctly.

**What this lab adds:**
- Multi-expression evaluation — evaluating a sequence of expressions in order
- `(define (f x) body)` shorthand — function definition sugar
- `begin` — a form that evaluates multiple expressions, returns the last
- Verifying the environment persists across multiple eval calls

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `(define (square x) (* x x))` is shorthand for what?
> 2. If you evaluate three `define` expressions in sequence, do they share one environment?
> 3. What should `(begin (define x 1) (define y 2) (+ x y))` return?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

=== Multi-expression evaluation ===
eval seq: (define x 10)  → nil
eval seq: (define y 20)  → nil
eval seq: (+ x y)        → 30

=== Function shorthand ===
eval: (define (square n) (* n n))  → nil
eval: (square 5)                   → 25
eval: (square (+ 2 3))             → 25

=== begin ===
eval: (begin (define x 99) (+ x 1))  → 100
```

---

## Concept: Multi-Expression Programs

**What it is:** A real Lisp program is a sequence of expressions evaluated in order,
sharing a single environment. Each expression can use bindings created by previous ones.

**Why this matters:**

So far we evaluate one expression at a time. A real program looks like:

```lisp
(define pi 3)              ; define a constant
(define (circle-area r)    ; define a function
  (* pi r r))
(circle-area 5)            ; use both — should return 75
```

These three expressions must share the same `Environment`. The third expression
can only evaluate `circle-area` if the second expression put it there.

**Implementation:** Evaluate each expression in a loop, passing the same environment.
Keep the result of the last expression as the program's output.

---

## Concept: Function Definition Shorthand

**What it is:** `(define (f param1 param2) body)` is syntactic sugar for
`(define f (lambda (param1 param2) body))`.

**The two forms are equivalent:**

```lisp
; Long form:
(define square (lambda (n) (* n n)))

; Shorthand:
(define (square n) (* n n))
```

The shorthand is detected at parse time by checking whether the second child of
`define` is itself a list (shorthand) or an atom (plain variable).

**Detecting the shorthand in the evaluator:**

```cpp
if (op == "define") {
    const Node* name_or_sig = node->children[1];

    if (name_or_sig->kind == NodeKind::LIST) {
        // Function shorthand: (define (name params...) body)
        // name_or_sig->children[0] is the function name
        // name_or_sig->children[1..] are the parameters
        // We convert this to a lambda and define name → lambda
    } else {
        // Plain variable: (define name expr)
        // Already implemented in LAB-10
    }
}
```

Lambda values are introduced fully in LAB-12. For now, we add the detection
logic so the shorthand works once LAB-12 provides `make_lambda()`.

---

## Concept: `begin` — Sequencing Expressions

**What it is:** `begin` evaluates its arguments in order and returns the value of
the last one. It is the mechanism for sequencing side effects.

```lisp
(begin
  (define x 1)    ; side effect: x is now in env
  (define y 2)    ; side effect: y is now in env
  (+ x y))        ; returns 3 — the value of the last expression
```

**Implementation:**

```cpp
if (op == "begin") {
    LispVal result = make_nil();   // begin with no args returns nil
    for (size_t i = 1; i < node->children.size(); i++) {
        result = eval(node->children[i], env);   // eval each, keep last
    }
    return result;   // return the last evaluated value
}
```

---

## Step 1 — Add Multi-Expression Evaluation Helper

Add to `src/main.cpp`:

```cpp
// eval_program: evaluate a list of expressions in order, return the last value.
// All expressions share the same environment — bindings from earlier expressions
// are visible to later ones.
LispVal eval_program(const std::vector<std::string>& expressions, Environment& env) {
    LispVal result = make_nil();
    for (const std::string& source : expressions) {
        printf("eval seq: %-35s → ", source.c_str());
        try {
            std::vector<Token> tokens = tokenize(source);
            Node* tree = parse(tokens);
            result = eval(tree, env);
            free_tree(tree);
            printf("%s\n", val_to_string(result).c_str());
        } catch (const std::runtime_error& e) {
            printf("Error: %s\n", e.what());
        }
    }
    return result;
}
```

Update `main()`:

```cpp
int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n\n", VERSION_MAJOR, VERSION_MINOR);
    Environment* global_env = make_global_env();

    printf("=== Multi-expression evaluation ===\n");
    eval_program({
        "(define x 10)",
        "(define y 20)",
        "(+ x y)"
    }, *global_env);

    delete global_env;
    return 0;
}
```

### COMPILE AND RUN

```bash
cmake --build build && ./build/lisp
```

Expected:
```
=== Multi-expression evaluation ===
eval seq: (define x 10)                    → nil
eval seq: (define y 20)                    → nil
eval seq: (+ x y)                          → 30
```

---

## Step 2 — Add `begin` to the Evaluator

In `src/eval.cpp`, add before the unknown operator error:

```cpp
        // ── SPECIAL FORM: begin ───────────────────────────────────
        // (begin expr1 expr2 ... exprN) → value of exprN
        if (op == "begin") {
            LispVal result = make_nil();
            for (size_t i = 1; i < node->children.size(); i++) {
                result = eval(node->children[i], env);
            }
            return result;
        }
```

### COMPILE AND RUN

Add to `main()`:

```cpp
    printf("\n=== begin ===\n");
    Environment* env2 = make_global_env();
    test_eval("(begin (define x 99) (+ x 1))", *env2);   // → 100
    test_eval("(begin 1 2 3)", *env2);                     // → 3
    delete env2;
```

Expected:
```
=== begin ===
eval("(begin (define x 99) (+ x 1))") = 100
eval("(begin 1 2 3)") = 3
```

---

## 🎯 Challenge: Recursive Counter

**You know:** `define`, multi-expression programs, arithmetic, the environment.

**Task:** Without using `lambda` yet, evaluate this sequence in order and predict
the output before running it:

```lisp
(define x 1)
(define x (+ x 1))
(define x (+ x 1))
x
```

What is the value of `x` at the end? Evaluate it with `eval_program` and verify.

Then explain: does `(define x (+ x 1))` look up the OLD `x` or the NEW one?
Add a comment in your code explaining the evaluation order.

<details>
<summary>▶ Show Solution</summary>

```cpp
eval_program({
    "(define x 1)",
    "(define x (+ x 1))",
    "(define x (+ x 1))",
    "x"
}, *global_env);
```

Output: `x = 3`.

**Evaluation order for `(define x (+ x 1))`:**
1. The evaluator sees `define` — special form.
2. It evaluates the value expression `(+ x 1)` FIRST, using the CURRENT value of x.
3. On the second call: x is 1 → `(+ 1 1)` = 2 → define x = 2.
4. On the third call: x is 2 → `(+ 2 1)` = 3 → define x = 3.

The RIGHT-HAND SIDE is fully evaluated before the binding is updated.
This is why `(define x (+ x 1))` is safe — x is looked up (gets old value),
1 is added, the result is stored as the new x.

**Key insight:** `define` evaluates the value expression before storing the result.
The name being defined is not in scope on the right-hand side — you cannot write
a self-referential `define` in one step. For recursion, you need `lambda` (LAB-12).

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Multi-expression shares env | `(define x 10)` then `(+ x 1)` → 11 in same env |
| `begin` returns last value | `(begin 1 2 3)` → 3 |
| `begin` with side effects | `(begin (define x 99) (+ x 1))` → 100 |
| Challenge: x incremented twice | Final `x` = 3 |

---

## Self-Check

1. What does `begin` return when called with no arguments?
2. Why is `define` a special form and not a function?
3. In `(define x (+ x 1))`, which is evaluated first: the value expression or the name binding?
4. How does `eval_program` ensure all expressions share the same environment?
5. What would happen if each call to `test_eval` created a fresh `make_global_env()`?

---

## What's Next

LAB-12 introduces `lambda` — functions as first-class values. A `lambda` creates
a function value that can be stored in the environment and called later. With
`lambda`, the function shorthand `(define (square n) (* n n))` becomes fully
operational, and the eval-apply cycle reaches its final form.

---

## Quick Check Answers

**1. `(define (square x) (* x x))` is shorthand for?**
`(define square (lambda (x) (* x x)))`. The shorthand notation is syntactic
sugar — the evaluator transforms it into the long form internally.

**2. Do three `define` expressions share one environment?**
Yes — if they are evaluated with `eval_program` or through the REPL (LAB-24),
they all operate on the same `Environment` object. Bindings from the first
`define` are visible to the second and third.

**3. What should `(begin (define x 1) (define y 2) (+ x y))` return?**
3. `begin` evaluates all three expressions in order. The first two `define`s
add `x` and `y` to the environment. The third expression `(+ x y)` looks them
up and adds them. `begin` returns the value of the last expression: 3.
