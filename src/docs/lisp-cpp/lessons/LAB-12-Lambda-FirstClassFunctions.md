# Lisp-CPP — LAB 12 — Lambda: Functions as First-Class Values

**Prerequisites:** LAB-11 complete. `define`, environment, and `begin` work.

**What this lab adds:**
- `LispVal::Tag::LAMBDA` — a function value stored in the environment
- The `Lambda` struct — parameter names + body node + captured environment pointer
- `(lambda (params) body)` — the special form that creates function values
- `apply()` — the second half of the eval-apply cycle
- Calling user-defined functions

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In Lisp, functions are values. What does that mean concretely — what can you
>    do with a function that you cannot do with a statement?
> 2. When `(lambda (x) (* x x))` is evaluated, what value should be returned?
>    What C++ type can hold "a function"?
> 3. When you call `(square 5)`, what must `apply` do with the argument `5`
>    before running the function body `(* x x)`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

eval: (define square (lambda (n) (* n n)))  → nil
eval: (square 5)                            → 25
eval: (square (+ 2 3))                      → 25
eval: (define (cube x) (* x x x))           → nil
eval: (cube 3)                              → 27
eval: (define (add a b) (+ a b))            → nil
eval: (add 10 20)                           → 30
eval: (add (square 3) (cube 2))             → 17
```

---

## Concept: Functions as First-Class Values

**What it is:** In Lisp (and functional languages), a function is a value —
it can be stored in a variable, passed as an argument, returned from another
function. This is called "first-class functions."

**Contrast with C++ functions:**

In C++, a named function like `int add(int a, int b)` is not a value you can
pass around directly without a function pointer or `std::function`. In Lisp,
`(lambda (a b) (+ a b))` is an expression that evaluates to a value, and that
value can be stored anywhere a value can be stored.

**What a lambda value must contain:**

To call a lambda later, you need:
1. The parameter names — so you know what names to bind to the arguments
2. The body expression (an AST node) — so you know what to evaluate
3. The environment that was active when the lambda was created — for closures

That third item is the crucial one. Without it, a lambda called in a different
scope cannot access variables from its definition site. This is covered in
LAB-13 (closures). For now, we include the environment pointer in the struct.

---

## Concept: The `Lambda` Struct

**What it is:** A C++ struct that holds everything needed to call a function.

```cpp
struct Lambda {
    std::vector<std::string> params;   // parameter names: ["n"] for (lambda (n) ...)
    Node*                    body;     // the body expression (NOT owned — lexer owns the AST)
    Environment*             closure_env;  // the environment at lambda creation time
};
```

**Who owns the body?**

The body is a pointer into the AST produced by the parser. The Lambda does NOT
own it — it does not `free_tree(body)`. The parser's tree is owned by whoever
called `parse()`. This creates a lifetime issue: if the tree is freed before
the lambda is called, the body pointer dangles.

**Lifetime strategy for LAB-12:** The global AST lives as long as the program.
In a REPL (LAB-24), each input line produces a new tree that we must keep alive
until no lambda captures it. LAB-17 (smart pointers) fixes this properly.
For now, we do not free trees that contain lambdas.

---

## Concept: Extending `LispVal` for Lambda

The `LispVal` tagged union needs a `LAMBDA` tag and a way to hold a `Lambda`.
Since `Lambda` contains non-trivial types (`std::vector<std::string>`, `Node*`),
it cannot go in the raw `union`. It must be a separate field like `string_data`.

**Updated `LispVal` (changes to `value.h`):**

```cpp
struct Lambda {
    std::vector<std::string> params;
    Node*                    body;
    Environment*             closure_env;
};

struct LispVal {
    enum class Tag { NUMBER, BOOL, NIL, SYMBOL, LAMBDA } tag;  // ← add LAMBDA
    union { int64_t number; bool boolean; } as;
    std::string string_data;    // for SYMBOL
    Lambda      lambda_data;    // for LAMBDA — outside union (non-trivial type)
};
```

**Factory function:**

```cpp
LispVal make_lambda(std::vector<std::string> params, Node* body, Environment* env);
```

---

## Concept: `apply()` — Calling a Lambda

**What it is:** `apply(lambda, args)` calls a function:
1. Create a new Environment frame whose parent is the lambda's `closure_env`
2. Bind each parameter name to the corresponding argument value
3. Evaluate the lambda's body in the new environment
4. Return the result

**The new environment frame:**

```
Lambda definition site:
  (lambda (n) (* n n)) captured global env

Call site: (square 5)
  Apply creates new frame:
  ┌──────────────────┐
  │ n → 5            │  ← bound from argument
  │ parent → global  │  ← from lambda's closure_env
  └──────────────────┘

  eval(body = (* n n), frame):
    n → 5 (found in frame)
    (* 5 5) = 25
```

**The frame is created on the stack for now** (as a local `Environment` variable
in `apply()`). This is safe as long as the frame does not outlive the `apply` call.
Closures that must outlive their call require heap-allocated frames — LAB-13.

---

## Step 1 — Update `src/value.h`

```cpp
#pragma once

#include <string>
#include <vector>
#include <cstdint>

// Forward declare Node and Environment — full definitions in their headers.
// Forward declarations let us use Node* and Environment* without including their headers,
// breaking circular dependency: value.h would include node.h which might include value.h.
struct Node;
struct Environment;

// Lambda: everything needed to call a user-defined function.
struct Lambda {
    std::vector<std::string> params;      // parameter names (in order)
    Node*                    body;        // the body expression (not owned)
    Environment*             closure_env; // environment at lambda creation (not owned)
};

struct LispVal {
    enum class Tag { NUMBER, BOOL, NIL, SYMBOL, LAMBDA } tag;  // ← added LAMBDA

    union {
        int64_t number;
        bool    boolean;
    } as;

    std::string string_data;   // for SYMBOL
    Lambda      lambda_data;   // for LAMBDA
};

LispVal make_number(int64_t n);
LispVal make_bool(bool b);
LispVal make_nil();
LispVal make_symbol(const std::string& name);
LispVal make_lambda(std::vector<std::string> params, Node* body, Environment* closure_env);

void        print_val(const LispVal& val);
std::string val_to_string(const LispVal& val);
```

---

## Step 2 — Update `src/value.cpp`

Add to the factory functions:

```cpp
LispVal make_lambda(std::vector<std::string> params, Node* body, Environment* closure_env) {
    LispVal val;
    val.tag = LispVal::Tag::LAMBDA;
    val.lambda_data.params      = std::move(params);   // move: no copy of the vector
    val.lambda_data.body        = body;
    val.lambda_data.closure_env = closure_env;
    return val;
}
```

Update `val_to_string` to handle LAMBDA:

```cpp
std::string val_to_string(const LispVal& val) {
    switch (val.tag) {
        case LispVal::Tag::NUMBER: return std::to_string(val.as.number);
        case LispVal::Tag::BOOL:   return val.as.boolean ? "#t" : "#f";
        case LispVal::Tag::NIL:    return "nil";
        case LispVal::Tag::SYMBOL: return val.string_data;
        case LispVal::Tag::LAMBDA: {
            // Print as: #<lambda (param1 param2)>
            std::string s = "#<lambda (";
            for (size_t i = 0; i < val.lambda_data.params.size(); i++) {
                if (i > 0) s += " ";
                s += val.lambda_data.params[i];
            }
            s += ")>";
            return s;
        }
    }
    return "?";
}
```

---

## Step 3 — Add `apply()` and update `eval()` in `eval.cpp`

Add `apply()` to `src/eval.h`:

```cpp
// apply: call a lambda with a list of argument values.
// Creates a new environment frame, binds params to args, evaluates body.
LispVal apply(const Lambda& lambda, const std::vector<LispVal>& args, Environment& call_env);
```

In `src/eval.cpp`, add `apply()` and update `eval()`:

```cpp
#include "environment.h"   // make sure this is included

LispVal apply(const Lambda& lambda, const std::vector<LispVal>& args, Environment& call_env) {
    // Parameter count must match argument count:
    if (lambda.params.size() != args.size()) {
        throw std::runtime_error(
            "Arity mismatch: expected " + std::to_string(lambda.params.size()) +
            " arguments, got " + std::to_string(args.size()));
    }

    // Create a new frame. Parent is the lambda's closure environment.
    // This frame lives on the stack — it is destroyed when apply() returns.
    Environment frame(lambda.closure_env);

    // Bind each parameter name to the corresponding argument value:
    for (size_t i = 0; i < lambda.params.size(); i++) {
        frame.define(lambda.params[i], args[i]);
    }

    // Evaluate the body in the new frame:
    return eval(lambda.body, frame);
}
```

In `eval()`, add BEFORE the unknown operator error:

```cpp
        // ── SPECIAL FORM: lambda ─────────────────────────────────
        // (lambda (param1 param2 ...) body)
        if (op == "lambda") {
            if (node->children.size() != 3) {
                throw std::runtime_error("'lambda' requires exactly 2 arguments: params and body");
            }
            const Node* params_node = node->children[1];
            if (params_node->kind != NodeKind::LIST) {
                throw std::runtime_error("'lambda' params must be a list: (lambda (x y) body)");
            }

            // Extract parameter names from the params list:
            std::vector<std::string> params;
            for (const Node* param : params_node->children) {
                if (param->kind != NodeKind::ATOM) {
                    throw std::runtime_error("Lambda parameter must be a symbol name");
                }
                params.push_back(param->value);
            }

            Node* body = node->children[2];   // the body expression (not copied)

            // Capture the CURRENT environment — this is what makes closures work.
            // The lambda remembers the environment in which it was defined.
            return make_lambda(std::move(params), body, &env);
        }

        // ── FUNCTION CALL ─────────────────────────────────────────
        // If the operator is not a known special form, evaluate it.
        // If it evaluates to a lambda, apply it to the arguments.
        {
            // Evaluate the operator to get the function value:
            LispVal func = eval(op_node, env);

            if (func.tag != LispVal::Tag::LAMBDA) {
                throw std::runtime_error(
                    std::string("'") + op + "' is not a function");
            }

            // Evaluate all arguments:
            std::vector<LispVal> args;
            for (size_t i = 1; i < node->children.size(); i++) {
                args.push_back(eval(node->children[i], env));
            }

            // Apply the function to the arguments:
            return apply(func.lambda_data, args, env);
        }
```

Also update `(define ...)` to handle function shorthand:

```cpp
        if (op == "define") {
            if (node->children.size() < 3) {
                throw std::runtime_error("'define' requires name and value");
            }
            const Node* name_or_sig = node->children[1];

            if (name_or_sig->kind == NodeKind::LIST) {
                // Function shorthand: (define (name params...) body)
                if (name_or_sig->children.empty()) {
                    throw std::runtime_error("'define' function name is missing");
                }
                const std::string& fname = name_or_sig->children[0]->value;
                std::vector<std::string> params;
                for (size_t i = 1; i < name_or_sig->children.size(); i++) {
                    params.push_back(name_or_sig->children[i]->value);
                }
                Node* body = node->children[2];
                env.define(fname, make_lambda(std::move(params), body, &env));
            } else {
                // Plain variable: (define name expr)
                const std::string& name  = name_or_sig->value;
                LispVal            value = eval(node->children[2], env);
                env.define(name, value);
            }
            return make_nil();
        }
```

---

## Step 4 — Update `src/main.cpp` and Test

```cpp
int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n\n", VERSION_MAJOR, VERSION_MINOR);
    Environment* g = make_global_env();

    eval_program({
        "(define square (lambda (n) (* n n)))",
        "(square 5)",
        "(square (+ 2 3))",
        "(define (cube x) (* x x x))",
        "(cube 3)",
        "(define (add a b) (+ a b))",
        "(add 10 20)",
        "(add (square 3) (cube 2))"
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
Lisp interpreter v0.1

eval seq: (define square (lambda (n) (* n n)))  → nil
eval seq: (square 5)                            → 25
eval seq: (square (+ 2 3))                      → 25
eval seq: (define (cube x) (* x x x))           → nil
eval seq: (cube 3)                              → 27
eval seq: (define (add a b) (+ a b))            → nil
eval seq: (add 10 20)                           → 30
eval seq: (add (square 3) (cube 2))             → 17
```

---

## What Just Happened

The eval-apply cycle is now complete:

```
eval(SYMBOL "square", env)       → LispVal::LAMBDA
eval(NUMBER "5",      env)       → LispVal::NUMBER 5
apply(lambda{n, (* n n)}, [5])   → creates frame {n=5}, eval(* n n) → 25
```

Functions are values. They can be arguments to other functions. Evaluating
`(add (square 3) (cube 2))` evaluates `square` and `cube` as values, calls
them with their arguments, and passes their results to `add`. The interpreter
is now Turing-complete for arithmetic.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Lambda value created | `(define f (lambda (n) n))` → `f` is a lambda |
| Lambda called | `(f 5)` → 5 |
| Function shorthand | `(define (square n) (* n n))` → `(square 5)` = 25 |
| Multi-arg function | `(define (add a b) (+ a b))` → `(add 3 4)` = 7 |
| Composed calls | `(add (square 3) (cube 2))` = 17 |
| Arity error caught | Calling `(square 5 6)` → arity mismatch error |

---

## Self-Check

1. What three things does a `Lambda` struct store, and why is each necessary?
2. `apply` creates a new environment frame. What is the parent of that frame?
3. Why is the `body` pointer in `Lambda` not owned by the `Lambda`?
4. What does `(define (f x) x)` expand to internally?
5. What is the difference between evaluating `square` as an atom and evaluating `(square 5)` as a list?

---

## What's Next

LAB-13 demonstrates closures — functions that capture their definition-site
environment. When `apply` creates a frame whose parent is `closure_env`
(not the caller's env), variables from the definition site are accessible.
This is what makes higher-order functions and function factories work.

---

## Quick Check Answers

**1. "Functions are values" — what can you do with them?**
Store them in variables (`define f lambda`), pass them as arguments to other functions,
return them from functions, store them in lists. In Lisp, a function is just another
LispVal with tag LAMBDA. Anywhere a value is accepted, a function value can appear.

**2. What value should evaluating `(lambda (x) (* x x))` return?**
A `LispVal` with `tag == Tag::LAMBDA`, containing the parameter list `["x"]`,
a pointer to the body AST node `(* x x)`, and a pointer to the current environment.
In the REPL, it would print as `#<lambda (x)>`.

**3. What must `apply` do with the argument `5` before running `(* x x)`?**
Create a new environment frame, bind the parameter name `x` to the value 5
(`frame.define("x", make_number(5))`), then evaluate the body `(* x x)` in that frame.
When the body looks up `x`, it finds 5 in the frame. The result is `5 * 5 = 25`.
