# Lisp-CPP — LAB 10 — Environment: Scope as a Linked Chain

**Prerequisites:** LAB-09 complete. `eval()` returns `LispVal`. You understand pointers, structs, and `std::unordered_map`.

**What this lab adds:**
- `Environment` — a hash map of name → LispVal bindings with a parent pointer
- Lexical scope — looking up a name walks the chain from inner frame to outer frame
- `std::unordered_map` — the hash map that backs each environment frame
- Passing the environment into `eval()`

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In a Lisp program, `(define x 10)` stores x. Where exactly is it stored?
> 2. If a function creates a local variable `x = 5`, and the surrounding scope also
>    has `x = 10`, which `x` does the function body see?
> 3. When the function returns, what happens to its local `x = 5`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
$ ./build/lisp
Lisp interpreter v0.1

=== Environment Lookup ===
global env: x = 10
child env:  x = 5    (shadows global x)
child env:  y = 20   (from global, not in child)
after child gone: x = 10   (global unchanged)

=== Evaluator with define ===
eval("(define x 42)")       = nil  (define returns nil)
eval("x", env with x=42)    = 42
eval("(+ x 1)", env x=42)   = 43
```

---

## Concept: The Environment Model

**What it is:** An environment is the data structure that gives meaning to names.
It is a mapping from symbol names to values. SICP Chapter 3 calls this the
**environment model of computation** — it replaces the substitution model for
programs with mutable state.

**Why the substitution model is not enough:**

The substitution model works for pure functions: to evaluate `(+ x 1)` where
`x = 5`, substitute 5 for x and evaluate `(+ 5 1)`. But:

```lisp
(define x 10)     ; store x in the current environment
(define x 20)     ; update x — the binding changes
x                 ; what does x mean now? the substitution model cannot answer this
```

The environment model answers: `x` is looked up in the current environment frame.
The current binding of `x` is whatever was most recently `define`d.

**Structure of the environment:**

```
Global environment frame:
┌──────────────────────────────┐
│ x → 10                       │
│ y → 20                       │
│ parent: null (top of chain)  │
└──────────────────────────────┘

Local function frame (child of global):
┌──────────────────────────────┐
│ x → 5    (shadows global x)  │
│ parent: ──────────────────┐  │
└───────────────────────────│──┘
                            ↓
                     Global frame
```

**Name lookup algorithm:**

```
lookup(name, env):
  if name is in env.bindings:
    return env.bindings[name]   // found in this frame
  if env.parent is not null:
    return lookup(name, env.parent)  // try parent frame
  throw "unbound variable: name"   // not found anywhere in the chain
```

This is exactly how lexical scope works in every language that has it:
JavaScript, Python, Ruby, Rust, and Lisp all use this model.

**Transfer:** Every function call in every modern language creates a new environment
frame. When JavaScript does `function f() { let x = 5; }`, `x` lives in a new frame
created for the call. When the function returns, the frame is gone (or kept alive
if a closure captures it). The chain of frames is the call stack, made into data.

---

## Concept: `std::unordered_map` — O(1) Lookup

**What it is:** A hash table — a data structure that maps keys to values with
average O(1) insertion and lookup, regardless of how many entries it contains.

**How it works:**

```
Insert: key → value
  1. Compute hash(key) → an integer
  2. Map to a bucket: bucket_index = hash(key) % num_buckets
  3. Store value in that bucket

Lookup: key
  1. Compute hash(key) → same integer as before
  2. Map to bucket: same bucket_index
  3. Read value from that bucket
```

The hash function maps arbitrary keys (strings) to integers consistently:
the same string always produces the same hash. The bucket index is computed
from the hash. Lookup jumps directly to the right bucket — no scanning needed.

**O(1) vs. O(n) — why it matters:**

If you stored bindings in a `std::vector<pair<string, LispVal>>` and scanned
linearly:

```cpp
// O(n) lookup — scans every binding:
for (auto& binding : bindings) {
    if (binding.first == name) return binding.second;
}
```

With 1000 bindings, this checks up to 1000 pairs per lookup.
With `std::unordered_map`, it is one hash computation and one bucket read.

For a Lisp interpreter evaluating thousands of expressions, O(1) vs. O(n)
environment lookup is the difference between fast and slow.

**Basic usage:**

```cpp
#include <unordered_map>
#include <string>

std::unordered_map<std::string, LispVal> bindings;

// Insert or update:
bindings["x"] = make_number(42);    // operator[] — creates if absent, updates if present

// Lookup:
auto it = bindings.find("x");        // returns an iterator
if (it != bindings.end()) {
    LispVal val = it->second;        // it->first = key, it->second = value
}

// Check existence:
bool exists = bindings.count("x") > 0;   // count returns 0 or 1 for unordered_map
```

**Transfer:** Python's `dict`, JavaScript's `Map` and plain `{}` objects, Java's
`HashMap`, Rust's `HashMap` — all are hash tables implementing the same O(1) idea.
The hash map is arguably the most important data structure in modern software.
The environment model you build here is the same structure that JavaScript engines
use for scope chains.

---

## Step 1 — Create `src/environment.h` and `src/environment.cpp`

```bash
touch src/environment.h
touch src/environment.cpp
```

Update `CMakeLists.txt`:

```cmake
add_executable(lisp
    src/main.cpp
    src/lexer.cpp
    src/node.cpp
    src/parser.cpp
    src/eval.cpp
    src/value.cpp
    src/environment.cpp   # ← add this
)
```

**`src/environment.h`:**

```cpp
#pragma once

#include <string>
#include <unordered_map>   // std::unordered_map — O(1) hash table
#include "value.h"          // LispVal

// Environment: one frame in the scope chain.
// Each frame has a hash map of local bindings and an optional parent frame.
//
// The parent is a raw pointer — the Environment does NOT own the parent.
// The parent must outlive all its children. The global environment has no parent.
struct Environment {
    std::unordered_map<std::string, LispVal> bindings;  // name → value map
    Environment* parent;  // pointer to the enclosing scope (null for global)

    // Constructor: create a new frame with an optional parent.
    explicit Environment(Environment* parent_env = nullptr);

    // define: add or update a binding in THIS frame only.
    // If 'name' already exists in this frame, it is overwritten.
    // If it exists in a parent frame, a new shadowing binding is created here.
    void define(const std::string& name, const LispVal& val);

    // lookup: find the value bound to 'name'.
    // Searches this frame first, then parent, then grandparent, etc.
    // Throws std::runtime_error if 'name' is not found anywhere.
    LispVal lookup(const std::string& name) const;

    // set: update an existing binding (for mutation, LAB-11 variant).
    // Searches the chain for the frame that contains 'name'.
    // Throws if 'name' is not bound anywhere.
    void set(const std::string& name, const LispVal& val);
};

// make_global_env: create the root environment with built-in constants.
// Returns a heap-allocated Environment — caller owns it.
Environment* make_global_env();
```

**`src/environment.cpp`:**

```cpp
#include "environment.h"
#include <stdexcept>   // std::runtime_error

// Constructor: initialize the parent pointer.
// The bindings map is default-constructed (empty hash map).
Environment::Environment(Environment* parent_env)
    : parent(parent_env) {
    // 'parent' is initialized via member initializer list — the preferred C++ style.
    // 'bindings' is default-constructed automatically (empty unordered_map).
}

// define: add a binding to THIS frame.
void Environment::define(const std::string& name, const LispVal& val) {
    // operator[]: if name exists, overwrites. If not, inserts.
    bindings[name] = val;
}

// lookup: search the scope chain for a binding.
const LispVal* Environment::lookup_ptr(const std::string& name) const {
    // find() returns an iterator — does not modify the map.
    auto it = bindings.find(name);
    if (it != bindings.end()) {
        return &it->second;   // found in this frame — return pointer to value
    }
    if (parent != nullptr) {
        return parent->lookup_ptr(name);   // search parent frame
    }
    return nullptr;   // not found anywhere
}

LispVal Environment::lookup(const std::string& name) const {
    const LispVal* result = lookup_ptr(name);
    if (result == nullptr) {
        throw std::runtime_error(std::string("Unbound variable: '") + name + "'");
    }
    return *result;   // copy the value (LispVal is a small struct — copy is cheap)
}

// set: find and update an existing binding in the chain.
void Environment::set(const std::string& name, const LispVal& val) {
    auto it = bindings.find(name);
    if (it != bindings.end()) {
        it->second = val;   // update in place — no new binding created
        return;
    }
    if (parent != nullptr) {
        parent->set(name, val);   // delegate to parent
        return;
    }
    throw std::runtime_error(std::string("set!: unbound variable '") + name + "'");
}

// make_global_env: create a fresh global environment.
// Populate with built-in constants (#t, #f, nil) so they are always available.
Environment* make_global_env() {
    Environment* env = new Environment(nullptr);   // no parent — this IS the root

    // Register boolean literals as named constants:
    env->define("#t", make_bool(true));
    env->define("#f", make_bool(false));
    env->define("nil", make_nil());

    return env;
}
```

Wait — `lookup_ptr` is declared in the `.cpp` but not the `.h`. Add it to the header:

In `environment.h`, add inside the struct:
```cpp
    // Internal helper — returns a pointer into the bindings map, or nullptr.
    const LispVal* lookup_ptr(const std::string& name) const;
```

---

## Step 2 — Update `src/eval.h` and `src/eval.cpp`

**`src/eval.h`:**

```cpp
#pragma once

#include "node.h"
#include "value.h"
#include "environment.h"   // ← add this

// eval now takes an Environment so it can look up and define variables.
LispVal eval(const Node* node, Environment& env);   // ← added env parameter
```

**`src/eval.cpp`** — add `env` parameter and handle `define` and symbol lookup:

```cpp
#include "eval.h"
#include <stdexcept>
#include <string>

LispVal eval(const Node* node, Environment& env) {  // ← added env parameter

    // ── ATOM EVALUATION ──────────────────────────────────────────
    if (node->kind == NodeKind::ATOM) {
        // Try number first:
        try {
            return make_number(std::stoll(node->value));
        } catch (const std::invalid_argument&) {}

        // Not a number — look up in environment:
        // This handles #t, #f, nil (registered in global env) and user-defined vars.
        return env.lookup(node->value);  // throws if not found
    }

    // ── LIST EVALUATION ──────────────────────────────────────────
    if (node->kind == NodeKind::LIST) {
        if (node->children.empty()) return make_nil();

        const Node* op_node = node->children[0];
        if (op_node->kind != NodeKind::ATOM) {
            throw std::runtime_error("Operator must be a symbol");
        }
        const std::string& op = op_node->value;

        // ── SPECIAL FORM: define ──────────────────────────────────
        // (define name value-expr)
        // 'define' is a special form — it does NOT evaluate its first argument.
        // name is taken literally as a string, not looked up in the environment.
        if (op == "define") {
            if (node->children.size() != 3) {
                throw std::runtime_error("'define' requires exactly 2 arguments: name and value");
            }
            const Node* name_node = node->children[1];
            if (name_node->kind != NodeKind::ATOM) {
                throw std::runtime_error("'define' first argument must be a symbol name");
            }
            const std::string& name  = name_node->value;
            LispVal            value = eval(node->children[2], env);  // eval the value
            env.define(name, value);   // store in the current frame
            return make_nil();         // define returns nil (produces no value)
        }

        // ── ARITHMETIC & COMPARISONS ─────────────────────────────
        // (All the arithmetic operators from LAB-08/09 — pass env through)
        if (op == "+") {
            int64_t result = 0;
            for (size_t i = 1; i < node->children.size(); i++) {
                LispVal v = eval(node->children[i], env);
                if (v.tag != LispVal::Tag::NUMBER)
                    throw std::runtime_error("'+' requires number arguments");
                result += v.as.number;
            }
            return make_number(result);
        }

        if (op == "-") {
            if (node->children.size() < 2)
                throw std::runtime_error("'-' requires at least one argument");
            LispVal first = eval(node->children[1], env);
            if (first.tag != LispVal::Tag::NUMBER)
                throw std::runtime_error("'-' requires number arguments");
            if (node->children.size() == 2) return make_number(-first.as.number);
            int64_t result = first.as.number;
            for (size_t i = 2; i < node->children.size(); i++) {
                LispVal v = eval(node->children[i], env);
                if (v.tag != LispVal::Tag::NUMBER)
                    throw std::runtime_error("'-' requires number arguments");
                result -= v.as.number;
            }
            return make_number(result);
        }

        if (op == "*") {
            int64_t result = 1;
            for (size_t i = 1; i < node->children.size(); i++) {
                LispVal v = eval(node->children[i], env);
                if (v.tag != LispVal::Tag::NUMBER)
                    throw std::runtime_error("'*' requires number arguments");
                result *= v.as.number;
            }
            return make_number(result);
        }

        if (op == "/") {
            if (node->children.size() != 3)
                throw std::runtime_error("'/' requires exactly two arguments");
            LispVal a = eval(node->children[1], env);
            LispVal b = eval(node->children[2], env);
            if (a.tag != LispVal::Tag::NUMBER || b.tag != LispVal::Tag::NUMBER)
                throw std::runtime_error("'/' requires number arguments");
            if (b.as.number == 0) throw std::runtime_error("division by zero");
            return make_number(a.as.number / b.as.number);
        }

        if (op == "=") {
            if (node->children.size() != 3) throw std::runtime_error("'=' needs 2 args");
            LispVal a = eval(node->children[1], env);
            LispVal b = eval(node->children[2], env);
            if (a.tag != LispVal::Tag::NUMBER || b.tag != LispVal::Tag::NUMBER)
                throw std::runtime_error("'=' requires number arguments");
            return make_bool(a.as.number == b.as.number);
        }

        if (op == "<") {
            if (node->children.size() != 3) throw std::runtime_error("'<' needs 2 args");
            LispVal a = eval(node->children[1], env);
            LispVal b = eval(node->children[2], env);
            if (a.tag != LispVal::Tag::NUMBER || b.tag != LispVal::Tag::NUMBER)
                throw std::runtime_error("'<' requires number arguments");
            return make_bool(a.as.number < b.as.number);
        }

        if (op == ">") {
            if (node->children.size() != 3) throw std::runtime_error("'>' needs 2 args");
            LispVal a = eval(node->children[1], env);
            LispVal b = eval(node->children[2], env);
            if (a.tag != LispVal::Tag::NUMBER || b.tag != LispVal::Tag::NUMBER)
                throw std::runtime_error("'>' requires number arguments");
            return make_bool(a.as.number > b.as.number);
        }

        throw std::runtime_error(std::string("unknown operator: ") + op);
    }

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
#include "eval.h"
#include "value.h"
#include "environment.h"   // ← add this

const int VERSION_MAJOR = 0;
const int VERSION_MINOR = 1;

void test_eval(const char* source, Environment& env) {
    try {
        std::vector<Token> tokens = tokenize(source);
        Node* tree = parse(tokens);
        LispVal result = eval(tree, env);   // ← pass env
        free_tree(tree);
        printf("eval(\"%s\") = %s\n", source, val_to_string(result).c_str());
    } catch (const std::runtime_error& e) {
        printf("Error: eval(\"%s\") = %s\n", source, e.what());
    }
}

int main(int argc, char* argv[]) {
    printf("Lisp interpreter v%d.%d\n\n", VERSION_MAJOR, VERSION_MINOR);

    // Create the global environment — it persists for the whole program.
    Environment* global_env = make_global_env();

    // Test scope chain:
    printf("=== Environment Lookup ===\n");
    global_env->define("x", make_number(10));
    global_env->define("y", make_number(20));

    // Create a child environment:
    Environment child(global_env);  // child's parent is global
    child.define("x", make_number(5));  // shadows global x

    printf("global x = %s\n", val_to_string(global_env->lookup("x")).c_str());  // 10
    printf("child  x = %s\n", val_to_string(child.lookup("x")).c_str());         // 5
    printf("child  y = %s\n", val_to_string(child.lookup("y")).c_str());         // 20 (from global)

    printf("\n=== Evaluator with define ===\n");
    test_eval("(define x 42)", *global_env);    // define x in global env
    test_eval("x", *global_env);               // look up x
    test_eval("(+ x 1)", *global_env);         // use x in expression
    test_eval("(define y (* x 2))", *global_env);
    test_eval("y", *global_env);              // 84

    delete global_env;  // free the global environment
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

=== Environment Lookup ===
global x = 10
child  x = 5
child  y = 20

=== Evaluator with define ===
eval("(define x 42)") = nil
eval("x") = 42
eval("(+ x 1)") = 43
eval("(define y (* x 2))") = nil
eval("y") = 84
```

---

## What Just Happened

The evaluator now has memory. `(define x 42)` stores a binding; `x` retrieves it.
Nested scopes shadow outer bindings without destroying them. The scope chain is a
linked list of hash maps, traversed from inner to outer on every variable lookup.

This is SICP's environment model made concrete in C++. In LAB-12 (lambda), when
a function is created, it captures a pointer to the current environment — that
captured pointer is what a closure is, in memory.

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `global.define("x", 10)` → `global.lookup("x")` returns 10 | Direct env test |
| Child shadows parent | `child.lookup("x")` = 5, `global.lookup("x")` still 10 |
| Child inherits parent | `child.lookup("y")` = 20 (not in child, found in parent) |
| `(define x 42)` in eval | Returns nil, stores 42 |
| `x` after define | Returns 42 |
| `(+ x 1)` | Returns 43 |

---

## Self-Check

1. What is a scope chain and how is it implemented in the `Environment` struct?
2. Why does `lookup()` search the parent chain instead of just the current frame?
3. `define` is called a "special form." Why can't it be a regular function? What would break?
4. What is the difference between `define` (create new binding) and `set` (update existing)?
5. Why is `std::unordered_map` faster for lookups than `std::vector<pair<string, LispVal>>`?

---

## What's Next

LAB-11 extends `define` to handle function shorthand: `(define (square x) (* x x))`
should be equivalent to `(define square (lambda (x) (* x x)))`. This requires
introducing `lambda` as a value — functions as first-class objects stored in the environment.

---

## Quick Check Answers

**1. Where is `x` stored when you `(define x 10)`?**
In the `bindings` hash map of the current environment frame. `define` calls
`env.define("x", make_number(10))` which does `bindings["x"] = make_number(10)`.
The Environment struct holds the value; the eval function has no separate storage.

**2. Which `x` does a function body see if both it and the outer scope define `x`?**
The inner one. The `lookup` algorithm searches the current frame first. If it finds
`x` there, it returns immediately without checking the parent. The parent's `x`
is "shadowed" — it still exists but is invisible from inside the function.

**3. What happens to the local `x` when the function returns?**
The local environment frame is destroyed (its destructor runs, freeing the
`unordered_map`). The parent frame is unaffected — the global `x` was never
touched. In LAB-12, if a closure captures the local frame, the frame must
outlive the function call — this is when `new` is needed for environment frames.
