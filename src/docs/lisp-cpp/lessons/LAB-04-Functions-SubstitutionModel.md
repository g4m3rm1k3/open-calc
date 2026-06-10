# Lisp-CPP — LAB 04 — Functions: The Substitution Model in C++

**Prerequisites:** LAB-03 complete. You have Token, std::vector, and understand the heap/stack split.

**What this lab adds:**
- Functions at depth: signatures, return types, call stack behavior
- Pass by value vs. pass by reference — the difference and when to use each
- The substitution model: what the machine actually does when a function is called
- A hand-built evaluator for simple arithmetic — no parsing yet

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. If you pass an `int` to a function and the function modifies it, does the
>    original change? What about if you pass `int&`?
> 2. SICP describes the substitution model: to evaluate `(+ 3 4)`, substitute
>    3 and 4 into the body of `+`. In C++, where exactly does this substitution happen?
> 3. A function returns an `int`. The caller assigns it to a variable. Where is the
>    return value during the moment of transfer between the function and the caller?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

=== Substitution Model Demonstration ===
Evaluating: add(3, 4)
  [inside add] a = 3, b = 4
  [inside add] result = 7
  [main] received: 7

=== Hand-Built Evaluator ===
eval_add(1, 2)      = 3
eval_multiply(3, 4) = 12
eval_expr()         = 14   ← this is (+ (* 3 4) 1 2) = 14
```

By the end of this lab you will evaluate a hardcoded arithmetic expression
through a chain of C++ function calls — the same pattern `eval()` uses in LAB-08,
just without the parser feeding it.

---

## Concept: Function Signatures

**What it is:** A function's signature is its complete declaration: return type,
name, and parameter list. It is the contract between the caller and the function.

**Anatomy of a C++ function:**

```cpp
int add(int a, int b) {
//│     │   │  │
//│     │   └──┘
//│     │   parameters (name: type pairs, separated by comma)
//│     └── function name
//└── return type: what type of value this function produces
    int result = a + b;
    return result;      // hand this value back to the caller
}
```

**The return type contract:**

The return type tells the compiler — and the reader — exactly what the function
produces. Common return types:

| Return type | Meaning |
|-------------|---------|
| `int` | A signed 32-bit integer |
| `double` | A 64-bit floating-point number |
| `bool` | True or false |
| `void` | Nothing — the function produces no value |
| `std::string` | A string (involves a copy or move) |
| `const char*` | A C-style string pointer (no copy — caller must not free it) |
| `T*` | A pointer to heap-allocated T (caller is responsible for delete) |
| `T&` | A reference to an existing T (the T must outlive the function call) |

**`void` functions:**

```cpp
// void means: this function does something but produces no value.
// You cannot assign its result to a variable.
void print_greeting() {
    printf("Hello!\n");
    // No return statement needed (or you can write: return;)
}

// int result = print_greeting();  // COMPILE ERROR: void produces no value
```

**Transfer:** Every language with functions has return types, explicit or inferred.
Rust requires explicit return types. Python and JavaScript infer them. TypeScript
lets you declare them. The concept — "this function produces a value of this type" —
is universal and ancient.

---

## Concept: The Substitution Model

**What it is:** When a function is called, the CPU substitutes the argument values
for the parameter names in the function body and executes it. SICP makes this
the foundation of understanding computation.

**In SICP terms:**

To evaluate `(+ 3 4)`:
1. Look up `+` — it is the addition operator
2. Evaluate the arguments: `3` → 3, `4` → 4
3. Substitute into the body of `+`: replace `a` with 3, `b` with 4
4. Evaluate the body: `3 + 4` → 7

**What this looks like at the machine level:**

```cpp
int add(int a, int b) {      // a and b are the parameter slots
    return a + b;
}

int result = add(3, 4);      // call site
```

When `add(3, 4)` is called:
1. A new stack frame is pushed for `add`
2. The value `3` is copied into parameter slot `a`
3. The value `4` is copied into parameter slot `b`
4. The body executes: reads `a` (3) and `b` (4), computes 7
5. The value `7` is placed in a special return value location (a register on x86-64)
6. `add`'s stack frame is popped
7. The caller reads `7` from the return value register into `result`

**The key insight:** In C++, calling a function by value creates a copy of each
argument. The function operates on copies, not the originals. This is what SICP
means by substitution — the copy IS the substitution. The original is untouched.

**Demonstrating the substitution:**

```cpp
int add(int a, int b) {
    printf("  [inside add] a = %d, b = %d\n", a, b);
    int result = a + b;
    printf("  [inside add] result = %d\n", result);
    return result;
}

int main(int argc, char* argv[]) {
    printf("Evaluating: add(3, 4)\n");
    int value = add(3, 4);
    printf("  [main] received: %d\n", value);
    return 0;
}
```

The print statements inside `add` prove that `a` and `b` exist as separate
variables inside the function — the substitution has happened.

---

## Concept: Pass by Value vs. Pass by Reference

**What it is:** "Pass by value" means the function receives a copy of the argument.
"Pass by reference" means the function receives an alias — another name for the
same variable.

**Pass by value — the default:**

```cpp
void double_it(int n) {
    n = n * 2;          // modifies the LOCAL COPY — original unchanged
}

int x = 5;
double_it(x);
printf("%d\n", x);     // still 5 — the copy was doubled, not x
```

**Pass by reference — use `&` in the parameter type:**

```cpp
void double_it(int& n) {  // int& means: n is a reference to an int — an alias
    n = n * 2;            // modifies the ORIGINAL variable through the alias
}

int x = 5;
double_it(x);
printf("%d\n", x);     // 10 — x was doubled in place
```

**Pass by const reference — for large objects you read but don't modify:**

```cpp
// const Token&: reference (no copy) + const (no modification)
void print_token(const Token& tok) {
    printf("type: %s\n", token_type_name(tok.type));
    // tok.type = TokenType::LPAREN;  // COMPILE ERROR: tok is const
}
```

**When to use each:**

| Pass by | Use when |
|---------|---------|
| Value (`int n`) | Small types (int, bool, double, enum) — copy is cheap |
| Const reference (`const T&`) | Large types you only read (string, vector, struct) |
| Reference (`T&`) | You need to modify the caller's variable |
| Pointer (`T*`) | Reference but may be null (requires null check) |

**The rule for this interpreter:**
- Token and string arguments → `const Token&`, `const std::string&`
- Output parameters → `T&` or return by value
- Small scalars (int, bool, size_t) → pass by value

**What references ARE in memory:**

A reference is implemented as a pointer under the hood — it holds the address
of the referenced variable. The difference: a reference cannot be null, cannot
be reassigned to reference a different variable, and does not require `*` to
dereference. The compiler handles the address-taking and dereferencing automatically.

---

## Concept: The Call Stack and Return Values

**What it is:** Each function call pushes a frame containing parameters, local
variables, and the return address. When the function returns, the frame pops
and the return value is transferred to the caller.

**On x86-64 (your CPU), return values are passed in registers:**

```
Small values (int, pointer, bool, enum):
  → returned in the RAX register (a 64-bit CPU register)
  → the caller reads RAX immediately after the call instruction

Large values (struct, std::string, std::vector):
  → the caller allocates space and passes a "secret" pointer to the function
  → the function writes its return value to that address
  → this is called "return value optimization" (RVO/NRVO) — the compiler
     often eliminates the copy entirely
```

**Why this matters for the evaluator:**

When `eval()` returns a `LispVal` (a struct, introduced in LAB-09), that return
goes through the large-value mechanism. Understanding this helps you write
efficient evaluator code: returning a `LispVal` by value is usually fine because
the compiler's RVO eliminates the copy. Returning a `LispVal*` (pointer) is
sometimes necessary when the value lives on the heap and must not be copied.

---

## Step 1 — Demonstrate the Substitution Model

Update `src/main.cpp`. Add these functions above `main()`:

```cpp
// add: the simplest evaluator — takes two ints, returns their sum.
// Demonstrates the substitution model: a and b are copies of the arguments.
int add(int a, int b) {                        // ← add this function
    printf("  [inside add] a = %d, b = %d\n", a, b);
    int result = a + b;
    printf("  [inside add] result = %d\n", result);
    return result;
}
```

Update `main()`:

```cpp
int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);

    printf("\n=== Substitution Model Demonstration ===\n");
    printf("Evaluating: add(3, 4)\n");
    int value = add(3, 4);                     // ← add this
    printf("  [main] received: %d\n", value);  // ← add this

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

=== Substitution Model Demonstration ===
Evaluating: add(3, 4)
  [inside add] a = 3, b = 4
  [inside add] result = 7
  [main] received: 7
```

**Change something:** Modify `add` to also print the addresses of `a` and `b`:
```cpp
printf("  [inside add] &a = %p, &b = %p\n", (void*)&a, (void*)&b);
```
Then in `main`, add:
```cpp
int arg1 = 3, arg2 = 4;
printf("  [main] &arg1 = %p, &arg2 = %p\n", (void*)&arg1, (void*)&arg2);
int value = add(arg1, arg2);
```
The addresses of `a` and `b` inside `add` are different from `arg1` and `arg2` in `main`.
They are copies — different memory locations, same values. This is the substitution made concrete.

---

## Step 2 — Build the Hand-Evaluator

Add these functions above `main()`:

```cpp
// eval_number: "evaluate" a number literal — just return it.
// In the real evaluator, a number node evaluates to itself.
int eval_number(int n) {    // ← add this
    return n;               // numbers are self-evaluating
}

// eval_add: evaluate (+ a b) — add two already-evaluated values.
// In the real evaluator, this handles the "+" symbol.
int eval_add(int a, int b) {    // ← add this
    return a + b;
}

// eval_multiply: evaluate (* a b).
int eval_multiply(int a, int b) {    // ← add this
    return a * b;
}

// eval_expr: evaluate the hardcoded expression (+ (* 3 4) 1 2)
// Without a parser, we build the call tree manually.
// This is exactly what eval() will do in LAB-08, but driven by
// an AST instead of hardcoded function calls.
int eval_expr() {    // ← add this
    // (* 3 4) = 12
    int inner = eval_multiply(eval_number(3), eval_number(4));

    // (+ 12 1 2) — evaluating left-to-right (simplified: + takes two args)
    // Real Lisp + is variadic. We chain two calls:
    // (+ 12 1) = 13, then (+ 13 2) = 15... but (+ (* 3 4) 1 2) is actually 14.
    // Correct: (* 3 4) = 12, then (+ 12 (+ 1 2)) = (+ 12 3) = 15.
    // Actually: (+ (* 3 4) 1 2) means add all three: 12 + 1 + 2 = 15.
    // We chain two adds:
    int step1 = eval_add(inner, eval_number(1));   // 12 + 1 = 13
    int step2 = eval_add(step1, eval_number(2));   // 13 + 2 = 15
    return step2;
}
```

Update `main()`:

```cpp
    printf("\n=== Hand-Built Evaluator ===\n");
    printf("eval_add(1, 2)      = %d\n", eval_add(1, 2));         // ← add
    printf("eval_multiply(3, 4) = %d\n", eval_multiply(3, 4));    // ← add
    printf("eval_expr()         = %d   ← (+ (* 3 4) 1 2)\n",      // ← add
           eval_expr());
```

### COMPILE AND RUN

Expected:
```
=== Hand-Built Evaluator ===
eval_add(1, 2)      = 3
eval_multiply(3, 4) = 12
eval_expr()         = 15   ← (+ (* 3 4) 1 2)
```

**What just happened:** `eval_expr()` evaluated `(+ (* 3 4) 1 2)` through a
tree of function calls. The shape of the call graph mirrors the shape of the
Lisp expression:

```
eval_expr()
  └── eval_add(
        eval_add(
          eval_multiply(eval_number(3), eval_number(4)),   ← (* 3 4)
          eval_number(1)                                   ← 1
        ),
        eval_number(2)                                     ← 2
      )
```

In LAB-08, `eval()` will traverse an AST node tree and make exactly this same
chain of calls — but driven by the tree structure instead of hardcoded nesting.

---

## Step 3 — Demonstrate Pass by Reference

Add this to `main()` to make the difference concrete:

```cpp
    printf("\n=== Pass by Value vs Reference ===\n");

    int original = 10;
    printf("original before call: %d\n", original);

    // Pass by value — a copy is modified, original unchanged:
    auto double_by_value = [](int n) { n *= 2; };  // modifies copy
    double_by_value(original);
    printf("original after double_by_value: %d\n", original);  // still 10

    // Pass by reference — the original is modified:
    auto double_by_ref = [](int& n) { n *= 2; };  // modifies the original
    double_by_ref(original);
    printf("original after double_by_ref: %d\n", original);    // now 20
```

**What is `auto` and the `[](...)` syntax?**

This is a **lambda** — an anonymous function defined inline. `auto` tells the
compiler to infer the type. The `[]` is the capture list (empty here — we don't
capture anything from the surrounding scope). Lambdas are covered fully in LAB-12.
For now, treat them as local functions — they make the demonstration self-contained.

### COMPILE AND RUN

Expected:
```
=== Pass by Value vs Reference ===
original before call: 10
original after double_by_value: 10
original after double_by_ref: 20
```

---

## Step 4 — Clean Up for Next Lab

Remove the diagnostic sections from `main()`. Keep all the function definitions
(`add`, `eval_number`, `eval_add`, `eval_multiply`, `eval_expr`) — they will be
replaced by the real evaluator in LAB-08 but demonstrate the pattern until then.

Final `main()`:

```cpp
int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n", VERSION_MAJOR, VERSION_MINOR);
    return 0;
}
```

### COMPILE AND RUN

Expected: `Lisp interpreter v0.1`

---

## 🎯 Challenge: Write `eval_if`

**You know:** functions, pass by value, return values, the hand-evaluator pattern.

**Task:** Write `int eval_if(bool condition, int then_value, int else_value)`.
It should return `then_value` if `condition` is true, `else_value` otherwise.

Then demonstrate it evaluates `(if (= 3 3) (* 2 5) (+ 1 1))`:
- `(= 3 3)` is true
- `(* 2 5)` = 10
- `(+ 1 1)` = 2
- Result should be 10

**Important:** There is a subtle problem with this signature. Both `then_value`
and `else_value` are passed as arguments — which means both are evaluated before
`eval_if` is called, even if one branch should never run. This is the difference
between a **function** and a **special form** in Lisp. The real `if` must be a
special form to avoid evaluating the branch not taken. Your implementation has
this flaw — note it in a comment. The fix comes in LAB-14.

<details>
<summary>▶ Show Solution</summary>

```cpp
// eval_if: evaluate an if expression.
// LIMITATION: both branches are evaluated before this function is called.
// This is unavoidable with a plain function call — in C++, all arguments
// are evaluated before the function receives them. The real Lisp `if` must
// be a special form (LAB-14) to evaluate only the taken branch.
int eval_if(bool condition, int then_value, int else_value) {
    if (condition) {
        return then_value;
    } else {
        return else_value;
    }
}

// In main():
// (if (= 3 3) (* 2 5) (+ 1 1))
bool condition  = (3 == 3);                    // (= 3 3) = true
int then_branch = eval_multiply(2, 5);         // (* 2 5) = 10 — evaluated eagerly
int else_branch = eval_add(1, 1);              // (+ 1 1) = 2  — also evaluated!
int result      = eval_if(condition, then_branch, else_branch);
printf("(if (= 3 3) (* 2 5) (+ 1 1)) = %d\n", result);  // 10
```

**Key insight:** This correctly returns 10, but it evaluates both branches.
In the real Lisp `if`, `(if #f (/ 1 0) 42)` must return 42 without ever
computing `(/ 1 0)`. A function cannot provide this guarantee — both arguments
are computed before the function is called (strict evaluation). This is why
`if` in Lisp is not a function — it is a special form handled by the evaluator
with explicit branch selection. You will implement this in LAB-14.

</details>

---

## What Just Happened

You built a hand-evaluator for arithmetic that directly mirrors how the real
`eval()` function works in LAB-08. The substitution model became concrete:
arguments are copies, each function gets its own frame, return values travel
back to the caller.

You also found your first limitation: a function evaluates all its arguments
before running. This is called **eager evaluation**. The real `if` needs
**lazy evaluation** of its branches. That distinction — function vs. special form —
is one of the defining concepts in SICP and one of the first design decisions
you will face when building the evaluator.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Substitution model shown | `add(3, 4)` prints addresses of `a`/`b` proving they are copies |
| Hand-evaluator works | `eval_expr()` returns 15 for `(+ (* 3 4) 1 2)` |
| Pass by reference proven | `double_by_ref` changes `original`; `double_by_value` does not |
| `eval_if` implemented | Returns 10 for `(if (= 3 3) (* 2 5) (+ 1 1))` |
| Eager evaluation limitation noted | Comment in `eval_if` explains why both branches are evaluated |

---

## Self-Check (answer from memory)

1. In the substitution model, what physical operation happens when you call `add(3, 4)` and `a` is assigned 3?
2. What does `int&` mean as a parameter type? How does it differ from `int`?
3. Why can't `eval_if` as a regular function avoid evaluating both branches?
4. What is RVO and why does it matter for functions that return structs?
5. On x86-64, how is a small return value (int) transferred from a function to its caller?

---

## What's Next

LAB-05 builds the lexer — the first real component of the interpreter. It takes
a source string, reads it character by character, and produces a `std::vector<Token>`.
Every concept from the last four labs (enums, structs, vectors, functions, references)
is used simultaneously for the first time.

---

## Quick Check Answers

**1. If you pass `int` to a function and modify it, does the original change?**
No. Pass by value copies the argument. The function modifies its local copy.
The original is untouched. With `int&`, the function receives an alias to the
original — modifying the parameter modifies the original.

**2. In C++, where does the substitution happen?**
The substitution happens at the call site: the argument expressions are evaluated
(producing values), those values are copied into the parameter slots of the new
stack frame, and the function body executes using those copies. The "substitution"
is the act of copying the values into the parameters.

**3. Where is the return value during transfer from function to caller?**
For small values (int, pointer, enum), in the RAX CPU register. For large values
(struct), through a hidden pointer passed by the caller to the function. The
compiler often optimizes away the copy entirely (RVO — Return Value Optimization),
constructing the return value directly in the caller's memory.
