# Lisp-CPP — LAB 13 — Closures: Capturing the Environment

**Prerequisites:** LAB-12 complete. Lambda values work. `apply` creates frames correctly.

**What this lab adds:**
- Closures — why the frame's parent must be `closure_env`, not the caller's env
- Demonstrating the difference: a closure that works vs. broken dynamic scope
- Function factories — functions that return functions
- The lifetime problem: why stack-allocated frames break for returned closures

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `(define (make-adder n) (lambda (x) (+ x n)))`. When `(make-adder 5)` returns
>    the lambda, where is `n`? Is it still accessible?
> 2. The lambda's frame parent is set to `closure_env`. What would happen if we set
>    it to the CALLER's environment instead?
> 3. If the closure frame is stack-allocated in `apply()`, what happens when `apply`
>    returns and a lambda captures that frame?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

=== Closures ===
(define add5 (make-adder 5))
(add5 10)   → 15
(add5 20)   → 25

(define add10 (make-adder 10))
(add10 3)   → 13

=== Counter (closure with state) ===
(define counter (make-counter))
(counter)   → 1
(counter)   → 2
(counter)   → 3

=== Closures prove lexical scope ===
(define x 100)
(define (f) x)          ← captures x=100 at definition
(define x 999)          ← redefine x — f should still return 100
(f)   → 100             ← proves f uses closure env, not caller env
```

---

## Concept: Lexical vs. Dynamic Scope

**What it is:** Lexical scope (also called static scope) means a name is resolved
by looking at the structure of the source code — specifically, the environment
that was active when the lambda was **defined**. Dynamic scope means names are
resolved in the environment where the lambda is **called**.

**The difference with an example:**

```lisp
(define x 100)

(define (f) x)           ; f captures x at definition time (lexical: x=100)
                         ; OR looks up x at call time (dynamic: whatever x is)

(define x 999)           ; redefine x in global env

(f)                      ; what does f return?
                         ; LEXICAL scope: 100 (the x from when f was defined)
                         ; DYNAMIC scope: 999 (the x from where f is called)
```

**All modern languages use lexical scope.** Dynamic scope was used by early Lisp
implementations and is now considered a mistake. Lexical scope makes programs
easier to reason about — the behavior of a function does not change based on
where you call it from.

**How lexical scope is implemented:**

When `(lambda ...)` is evaluated, the lambda captures `&env` — a pointer to
the CURRENT environment frame. This pointer becomes `closure_env` in the Lambda struct.

When `apply` creates a new frame for the call, it sets `frame.parent = closure_env`.
This means the body's variable lookups walk: frame → closure frame → closure's parent...
The caller's environment is NOT in the chain.

**If we used the caller's environment instead (`frame.parent = &call_env`):**

```
(define x 100)
(define (f) x)    ; closure_env points to frame where x=100
(define x 999)    ; x in global frame is now 999

(f)               ; apply creates frame {parent: caller_env}
                  ; caller_env IS global env
                  ; lookup x: not in frame → check global → finds x=999
                  ; WRONG: dynamic scope
```

With the current implementation (`frame.parent = closure_env`):

```
(f)               ; apply creates frame {parent: closure_env = global at definition}
                  ; lookup x: not in frame → check closure_env (global)
                  ; BUT — global.x is now 999... wait, this would still be 999.
```

Hmm. The key is that `closure_env` is a pointer to the environment frame — not a snapshot.
If the global frame is mutated, the closure sees the mutation. The real test of closures
is not global-variable lookup but LOCAL variable capture:

---

## The Real Closure Test: Function Factories

**The decisive example:**

```lisp
(define (make-adder n)
  (lambda (x) (+ x n)))

(define add5 (make-adder 5))
(add5 10)   ; → 15
```

When `(make-adder 5)` is called:
1. `apply` creates frame `{n: 5, parent: global}`
2. `(lambda (x) (+ x n))` is evaluated in that frame
3. The lambda captures `closure_env = &frame` (the apply frame, containing n=5)
4. `make-adder` returns the lambda
5. **`apply`'s local frame goes out of scope and is destroyed**

At step 5: the frame containing `n = 5` is destroyed. The lambda's `closure_env`
pointer now points to garbage. When `(add5 10)` is called:
6. `apply` creates a new frame `{x: 10, parent: ???}` — parent is the destroyed frame
7. Lookup `n` → not in `{x: 10}` → try parent → GARBAGE → crash or wrong value

**This is the lifetime problem.** The stack-allocated frame in `apply` is destroyed
when `apply` returns. Any lambda that escapes `apply` (is returned, stored in a variable)
captures a dangling pointer.

**The fix:** Environment frames that are captured by closures must be heap-allocated
and kept alive as long as any lambda holds a reference to them.

---

## Concept: The Lifetime Fix — Heap-Allocated Frames

**What it is:** When `apply` creates a frame, it must allocate it on the heap
if that frame may be captured by a lambda that outlives the call.

**Two strategies:**

**Strategy A — always heap-allocate frames:**
Every `apply` uses `new Environment(closure_env)`. All frames are heap-allocated.
Simple, correct, but creates a new heap allocation per function call.

**Strategy B — reference counting (shared_ptr):**
Frames are shared between lambdas using `std::shared_ptr<Environment>`.
A frame is deleted only when no lambda holds a reference to it.
This is the correct solution — LAB-17 implements it.

**For LAB-13: use Strategy A for simplicity.** We heap-allocate every frame
in `apply`. This introduces a leak (frames are never freed), which we accept
temporarily. The garbage collector in LAB-18 eventually reclaims them.

---

## Step 1 — Heap-Allocate Frames in `apply()`

In `src/eval.cpp`, update `apply()`:

```cpp
LispVal apply(const Lambda& lambda, const std::vector<LispVal>& args, Environment& call_env) {
    if (lambda.params.size() != args.size()) {
        throw std::runtime_error(
            "Arity mismatch: expected " + std::to_string(lambda.params.size()) +
            " arguments, got " + std::to_string(args.size()));
    }

    // Heap-allocate the new frame so it survives this apply() call.
    // Parent is closure_env — NOT call_env — this is what makes it lexical scope.
    // The 'new' here leaks memory intentionally until LAB-17/18 fixes it.
    Environment* frame = new Environment(lambda.closure_env);  // ← changed from stack to heap

    for (size_t i = 0; i < lambda.params.size(); i++) {
        frame->define(lambda.params[i], args[i]);
    }

    LispVal result = eval(lambda.body, *frame);
    // NOTE: we do NOT delete frame here — a lambda captured from this body
    // may hold a reference to frame via closure_env. LAB-17 fixes this.
    // ASAN will report leaks. That is expected and tracked.
    return result;
}
```

Also update the lambda creation in `eval()` — the captured `closure_env`
is now also a heap pointer (from apply). No change needed to the lambda form
code — it already captures `&env` which may be a heap-allocated frame.

---

## Step 2 — Test Function Factories

Update `src/main.cpp`:

```cpp
int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n\n", VERSION_MAJOR, VERSION_MINOR);
    Environment* g = make_global_env();

    printf("=== Closures ===\n");
    eval_program({
        "(define (make-adder n) (lambda (x) (+ x n)))",
        "(define add5 (make-adder 5))",
        "(add5 10)",
        "(add5 20)",
        "(define add10 (make-adder 10))",
        "(add10 3)"
    }, *g);

    printf("\n=== Lexical scope test ===\n");
    Environment* g2 = make_global_env();
    eval_program({
        "(define x 100)",
        "(define (f) x)",
        "(define x 999)",     // redefine x — f was defined when x=100
        "(f)"                 // with lexical scope through define: gets 999
                              // (define in global frame mutates the same frame)
    }, *g2);

    printf("\nNote: global redefinition is visible to closures because\n");
    printf("the closure captures the frame, not the values.\n");
    printf("Local variable capture is what closures truly protect:\n");

    eval_program({
        "(define (make-adder n) (lambda (x) (+ x n)))",
        "(define add5 (make-adder 5))",
        "(define n 9999)",    // redefine global n — should NOT affect add5
        "(add5 10)"           // should still be 15, not 10009
    }, *g2);

    delete g;
    delete g2;
    return 0;
}
```

### COMPILE AND RUN

```bash
cmake --build build && ./build/lisp
```

Expected (ASAN leak reports expected and noted):
```
=== Closures ===
eval seq: (define (make-adder n) (lambda (x) (+ x n)))  → nil
eval seq: (define add5 (make-adder 5))                  → nil
eval seq: (add5 10)                                     → 15
eval seq: (add5 20)                                     → 25
eval seq: (define add10 (make-adder 10))                → nil
eval seq: (add10 3)                                     → 13

=== Lexical scope test ===
eval seq: (define x 100)                                → nil
eval seq: (define (f) x)                                → nil
eval seq: (define x 999)                                → 999... (see note)
eval seq: (f)                                           → 999

Note: global redefinition is visible to closures because
the closure captures the frame, not the values.

eval seq: (define (make-adder n) ...)                   → nil
eval seq: (define add5 (make-adder 5))                  → nil
eval seq: (define n 9999)                               → nil
eval seq: (add5 10)                                     → 15  ← n=5 is protected
```

**`add5` returns 15** — the local `n=5` in `make-adder`'s frame is protected.
Even though global `n` was redefined to 9999, `add5`'s closure captured the
local frame where `n=5`. The global `n` is irrelevant.

---

## 🎯 Challenge: Counter Factory

**Task:** Implement a counter factory that returns a function. Each call to
the returned function increments and returns a counter.

```lisp
(define (make-counter)
  (begin
    (define count 0)
    (lambda ()
      (begin
        (define count (+ count 1))
        count))))

(define counter (make-counter))
(counter)   → 1
(counter)   → 2
(counter)   → 3
```

**This is tricky.** In standard Lisp, `(define count (+ count 1))` inside the
closure redefines `count` in the closure's frame on each call. Try it and observe
the actual behavior — does it work as expected with our implementation?

If not, explain why and what would be needed to fix it (hint: `set!` vs `define`).

<details>
<summary>▶ Show Solution / Analysis</summary>

The counter will NOT work correctly with `define` alone, because each call to
`counter` creates a new frame over the closure's frame. `define count (+ count 1)`
reads `count` from the parent frame (closure), computes `count + 1`, and defines
a NEW `count` in the current call frame — the next call does not see it.

The fix requires `set!` (mutation of an existing binding), which modifies the
closure's frame in place:

```lisp
(define (make-counter)
  (begin
    (define count 0)
    (lambda ()
      (begin
        (set! count (+ count 1))
        count))))
```

`set!` is implemented in LAB-16 (`Environment::set()`). This challenge reveals
the distinction between `define` (create new binding) and `set!` (mutate existing
binding) — a fundamental concept in SICP Chapter 3 on assignment and state.

</details>

---

## What Just Happened

Closures are now implemented and tested. The key insight: the frame's parent is the
lambda's `closure_env`, not the caller's environment. Local variables from the
definition site are captured by reference (as a pointer to a heap-allocated frame).
Global redefinition is visible through the closure chain because it mutates the same
frame. Local captures are protected because each `make-adder` call creates a distinct frame.

The ASAN leak reports are expected — frames are deliberately not freed until the
garbage collector (LAB-18) is implemented.

---

## Self-Check

1. What is the difference between lexical scope and dynamic scope?
2. Why does `make-adder` require heap-allocated frames in `apply()`?
3. `(add5 10)` returns 15 even after `(define n 9999)`. Why?
4. What is a "dangling pointer" and when does one occur in the stack-allocated frame approach?
5. Why is `set!` (mutation) needed for a working counter, but `define` is not enough?

---

## What's Next

LAB-14 adds `if` — the first special form that controls evaluation order.
Unlike functions, `if` must evaluate only the branch taken, not both.
This reveals the fundamental difference between functions (evaluate all args first)
and special forms (evaluate args selectively).

---

## Quick Check Answers

**1. When `(make-adder 5)` returns, where is `n`?**
In the heap-allocated frame created by `apply` for the `make-adder` call.
That frame contains `{n: 5, parent: global}`. The returned lambda holds
`closure_env = &frame`. As long as the lambda exists, the frame must exist.
With heap allocation and no GC, the frame leaks — it exists forever.

**2. What if the frame's parent was the caller's environment?**
Dynamic scope. Looking up `n` in `(add5 10)` would search: call frame for `add5` →
caller's environment (e.g., `main`) → global. The `n` from `make-adder`'s frame
is not in this chain at all — it was destroyed when `make-adder` returned.
Result: either `n` not found (if there is no `n` in scope) or wrong value.

**3. What happens when `apply` returns and a lambda captures a stack-allocated frame?**
The frame's destructor runs — the `unordered_map` is freed. The lambda's
`closure_env` pointer is now a dangling pointer — it points to freed memory.
Calling the lambda would dereference that pointer, causing undefined behavior.
ASAN would report a use-after-free. The fix is heap allocation of the frame.
