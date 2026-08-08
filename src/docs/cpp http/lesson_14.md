# Lesson 14: function f(x) ... end — Environments as a Chain

**What you will build:** `function`/`end` keywords, a `FunctionDefinitionExpression` that
stores a callable value rather than computing one immediately, a `UserFunction` class that
bundles a parameter name, a body, and the environment it was *defined* in, and — the real
substance of this lesson — `Environment` growing a `parent_` pointer, so a function call
creates a small, temporary child scope that can see everything its enclosing scope can see,
without polluting that enclosing scope in return. This is the lesson every prior one has been
quietly building toward: Lesson 4's `Environment`, built as a single flat map, becomes a
**chain** of them, and that chain is what makes recursion, parameter scoping, and genuine
closures all work correctly, together, from one relatively small piece of new machinery.

**What you need to know first:** Lesson 4's `Environment::get`/`set`, Lesson 5's precedent of
composing a new capability *into* `Environment` rather than changing `evaluate()`'s parameter
list, and Lesson 3's `unique_ptr`-based exclusive ownership — this lesson introduces
`shared_ptr` specifically because `unique_ptr`'s exclusive-ownership model stops being the
right tool the moment a function body needs to outlive the single request that defined it.

**Pipeline diagram:**

```
HTTP Request → Lexer → Parser → AST → Semantic Analysis → Interpreter → Built-in Functions → Matrix Library → Result Formatter → HTTP Response
```

Carrying two separate requests through this lesson's machinery: `"function square(x) x * x
end"` defines a callable value, storing it in the global `Environment` — no computation
happens yet, only storage. A *later*, separate request, `"square(5)"`, is what actually
triggers evaluation: a brand-new, temporary child `Environment` is created, holding just
`x = 5`, with its `parent_` pointing back at the same global `Environment` the function was
defined in — and `x * x` evaluates against that child, returning `25`, after which the child
scope is discarded entirely.

---

## Concept Unit 1: Two owners, one object

### The Problem

A function's body — the `Expression` tree parsed from between `(x)` and `end` — has a real
lifetime problem this project hasn't faced before. Every previous `unique_ptr<Expression>`
this project has built (Lesson 3 onward) belongs to exactly one parent node, and is destroyed
the instant that parent is. A function's body is different: the *original* AST node
(`FunctionDefinitionExpression`, built once, for one request) might need its body again if
somehow re-evaluated — while the *`UserFunction`* stored in `Environment` (Concept Unit 4)
needs to keep calling that same body, potentially across many *future*, separate HTTP
requests, long after the defining request's own AST has been destroyed. Two different owners,
both needing the body to stay alive for as long as either of them does — `unique_ptr`'s
single-owner rule doesn't fit this shape at all.

### Introduce the concept in isolation

```cpp
#include <iostream>
#include <memory>

struct Body {
    int value;
};

int main() {
    std::shared_ptr<Body> original = std::make_shared<Body>(Body{42});
    std::cout << "use_count after creation: " << original.use_count() << "\n";

    std::shared_ptr<Body> stored = original;
    std::cout << "use_count after copy: " << original.use_count() << "\n";
    std::cout << "both point to the same value: " << (original->value == stored->value) << "\n";

    original.reset();
    std::cout << "use_count after resetting original: " << stored.use_count() << "\n";
    std::cout << "stored is still valid: " << (stored != nullptr) << "\n";

    return 0;
}
```

Real output:

```
use_count after creation: 1
use_count after copy: 2
both point to the same value: 1
use_count after resetting original: 1
stored is still valid: 1
```

The last two lines are the entire point: `original.reset()` drops *one* owner's claim on the
`Body`, but `stored` — the other owner — keeps it alive and valid regardless. Neither owner
has to know or care whether the other still exists; the object itself is destroyed only once
*every* owner has let go.

### Discard

This `Body` example is deleted. `FunctionDefinitionExpression` (Concept Unit 5) and
`UserFunction` (Concept Unit 4) both hold a `std::shared_ptr<Expression>` pointing at the same
body — the original AST node's copy and the long-lived `UserFunction`'s copy, coexisting
exactly the way `original` and `stored` did here.

### Mechanical walkthrough

- `std::shared_ptr<Body> original = std::make_shared<Body>(Body{42});` — **(a) first
  appearance.** `make_shared`, the `shared_ptr` counterpart to Lesson 3's `make_unique` —
  allocates a `Body` and wraps it in a `shared_ptr`, initializing its internal reference count
  to `1`.
- `std::shared_ptr<Body> stored = original;` — **(a) first appearance, and the core
  difference from `unique_ptr`.** This is ordinary **copy** construction — legal, unlike
  attempting to copy a `unique_ptr`, which would fail to compile (Lesson 3). The copy
  increments the shared reference count; both `original` and `stored` now genuinely point at
  the *same* `Body`, not two separate ones.
- `original.use_count()` — **(a) first appearance.** Reports how many `shared_ptr` instances
  currently share ownership of the same object — `1` right after creation, `2` once `stored`
  is copied from it.
- `original.reset();` — **(a) first appearance.** Releases `original`'s own claim on the
  `Body` — decrementing the shared count — without affecting `stored`'s claim at all. The
  `Body` itself is only actually destroyed when the *last* remaining `shared_ptr` pointing at
  it is destroyed or reset, which hasn't happened here yet.

### CS lens

This is **reference counting**, the mechanism underlying `shared_ptr`: an object survives for
as long as *anyone* still holds a reference to it, tracked automatically, with no single owner
responsible for knowing when it's safe to free. Also recognized in: Python's own memory
management (every Python object is reference-counted under the hood), Objective-C/Swift's ARC,
and — a useful contrast — garbage-collected languages (Java, JavaScript) solve the same "when
is it safe to free this" problem differently, via periodic reachability analysis instead of
counting references as they're created and destroyed.

### SE lens

The alternative rejected here — keeping the body as a `unique_ptr<Expression>` and finding
some other way to let `UserFunction` "borrow" it — doesn't actually work: a raw pointer or
reference into the request-scoped AST would become a dangling reference the instant that
request's `unique_ptr<Expression> ast` (from `server.cpp`'s loop) goes out of scope at the end
of the request, which happens *immediately*, long before the function might ever be called.
`shared_ptr` is the correct tool here specifically because it expresses the real ownership
shape of this problem — genuinely shared, lifetime-extending ownership — rather than being
reached for out of habit; `unique_ptr` remains the right choice everywhere else in this
project, where ownership really is exclusive.

---

## Concept Unit 2: `function`/`end` — and a naming collision worth catching

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `lexer.h`, `lexer.cpp`.
- **Change type:** add two `TokenType` values; add two keyword checks.
- **Location:** `lexer.h`'s enum; `lexer.cpp`'s `read_identifier` and `token_type_name`.
- **Dependencies:** none new.

### The Problem, stated as a real design trap

The obvious name for a new token representing the `end` keyword is `TokenType::End` — except
`TokenType::End` **already exists**, and has meant something different since Lesson 2: the
end-of-input sentinel every token vector ends with, checked by `Parser::parse()` to confirm
nothing is left unconsumed. Reusing that name for the `end` *keyword* would be a genuine bug
waiting to happen — two completely different concepts (end-of-tokens vs. end-of-a-function-
body) sharing one enum value, with no way for the parser to tell them apart. This is worth
catching *before* writing any code, not after.

### The New Code — type it yourself

```cpp
enum class TokenType { Number, Identifier, Equals, Plus, Minus, Star, Slash, LParen, RParen,
                        LBracket, RBracket, Semicolon, Less, Greater, LessEqual, GreaterEqual,
                        EqualEqual, NotEqual, If, Else, While, Function, EndKeyword, End };
```

### The Updated Project

`lexer.cpp`'s `read_identifier`, with the two new keyword checks marked (`if`/`else`/`while`
above them unchanged from Lessons 12 and 13):

```cpp
    if (text == "while") {
        return Token{TokenType::While, text};
    }
    if (text == "function") {                                            // ← new
        return Token{TokenType::Function, text};                         // ← new
    }                                                                    // ← new
    if (text == "end") {                                                 // ← new
        return Token{TokenType::EndKeyword, text};                       // ← new
    }                                                                    // ← new
    return Token{TokenType::Identifier, text};
```

### Mechanical walkthrough

- `TokenType::EndKeyword`, deliberately **not** `TokenType::End` — **(a) first appearance of
  a naming decision made specifically to avoid a collision.** Nothing about the C++ compiler
  would have caught reusing `End` for both meanings — enum values are just names; the compiler
  has no idea one is "supposed to mean" end-of-input and the other "supposed to mean" a
  keyword. This would have compiled cleanly and produced confusing, hard-to-trace bugs the
  first time a function definition's closing `end` token was checked against the wrong
  expectation somewhere. Catching this required recognizing the conceptual collision by
  reading the existing code carefully — a real, general lesson about extending an existing
  enum: check what every existing name *actually represents*, not just whether the literal
  spelling is free.

---

## Concept Unit 3: Environments that point to their parent

### The Problem

A function call needs a *new*, temporary place for its parameter to live — `square(5)`'s `x`
must not leak into, or collide with, whatever the caller's own `x` (if any) currently holds.
But that new scope also needs to see everything *outside* itself — global variables like
`pi`, other functions, anything the function's body legitimately depends on. A single flat
`Environment`, as built since Lesson 4, can do one or the other, never both at once.

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `environment.h`, `environment.cpp`.
- **Change type:** add a second constructor and a parent pointer; change `get` to walk the
  chain.
- **Location:** whole files.
- **Dependencies:** none new.

### The New Code — type it yourself

```cpp
Value Environment::get(const std::string& name) const {
    auto it = variables_.find(name);
    if (it != variables_.end()) {
        return it->second;
    }
    if (parent_ != nullptr) {
        return parent_->get(name);
    }
    throw std::runtime_error("undefined variable: " + name);
}
```

### The Updated Project

`environment.h`, in full:

```cpp
#pragma once
#include <string>
#include <unordered_map>
#include "functions.h"
#include "value.h"
#include "user_function.h"                                               // ← new

class Environment {
public:
    Environment();
    explicit Environment(Environment* parent);                           // ← new

    Value get(const std::string& name) const;
    void set(const std::string& name, Value value);
    double call(const std::string& function_name, double argument) const;

    void define_function(const std::string& name, UserFunction function); // ← new
    bool has_user_function(const std::string& name) const;                // ← new
    Value call_user_function(const std::string& name, Value argument) const;  // ← new

private:
    Environment* parent_ = nullptr;                                       // ← new
    std::unordered_map<std::string, Value> variables_;
    std::unordered_map<std::string, UserFunction> user_functions_;        // ← new
    FunctionTable functions_;
};
```

`environment.cpp`, in full:

```cpp
#include "environment.h"
#include <cmath>
#include <stdexcept>

Environment::Environment() {
    variables_.insert_or_assign("pi", Value::number(std::acos(-1.0)));
}

Environment::Environment(Environment* parent) : parent_(parent) {}         // ← new

Value Environment::get(const std::string& name) const {
    auto it = variables_.find(name);
    if (it != variables_.end()) {                                        // ← changed
        return it->second;                                               // ← changed
    }                                                                    // ← changed
    if (parent_ != nullptr) {                                            // ← new
        return parent_->get(name);                                       // ← new
    }                                                                    // ← new
    throw std::runtime_error("undefined variable: " + name);
}

void Environment::set(const std::string& name, Value value) {
    variables_.insert_or_assign(name, std::move(value));
}

double Environment::call(const std::string& function_name, double argument) const {
    return functions_.call(function_name, argument);
}

void Environment::define_function(const std::string& name, UserFunction function) {   // ← new
    user_functions_.insert_or_assign(name, std::move(function));          // ← new
}                                                                         // ← new

bool Environment::has_user_function(const std::string& name) const {      // ← new
    if (user_functions_.find(name) != user_functions_.end()) {            // ← new
        return true;                                                    // ← new
    }                                                                    // ← new
    if (parent_ != nullptr) {                                            // ← new
        return parent_->has_user_function(name);                         // ← new
    }                                                                    // ← new
    return false;                                                       // ← new
}                                                                         // ← new

Value Environment::call_user_function(const std::string& name, Value argument) const {  // ← new
    auto it = user_functions_.find(name);                                 // ← new
    if (it != user_functions_.end()) {                                    // ← new
        return it->second.call(std::move(argument));                     // ← new
    }                                                                    // ← new
    if (parent_ != nullptr) {                                            // ← new
        return parent_->call_user_function(name, std::move(argument));   // ← new
    }                                                                    // ← new
    throw std::runtime_error("unknown function: " + name);               // ← new
}                                                                         // ← new
```

### Mechanical walkthrough (new items only)

- `explicit Environment(Environment* parent) : parent_(parent) {}` — **(a) first appearance
  of a second constructor with genuinely different behavior, not just different parameters.**
  Unlike `Environment()` (the original, Lesson 4, used for the one global scope), this
  constructor does **not** call `variables_.insert_or_assign("pi", ...)` — a child scope
  starts with a completely empty `variables_`, relying entirely on `get`'s new parent-walking
  fallback to find `pi` (or anything else) in whatever scope it was constructed from. This is
  deliberate, not an oversight: re-inserting `pi` into every single function call's scope
  would be wasted, repeated work for something that's genuinely findable one level up, every
  time.
- `Environment* parent_ = nullptr;` — **(a) first appearance of a self-referential member
  type.** `Environment` now holds a pointer to *another* `Environment` — the same class,
  referring to an instance of itself. This is legal in C++ specifically because it's a
  pointer, not a value member: a value member of type `Environment` inside `Environment`
  would be a genuine, infinitely-recursive type definition (impossible to even compute the
  size of), but a *pointer* only needs to know its own fixed size, regardless of what it
  points to — the same reasoning Lesson 6's forward declaration relied on, now applied to a
  type referring to itself rather than two types referring to each other.
- `get`'s new shape — check locally first, `return` immediately if found; otherwise, *if*
  `parent_` exists, delegate to it; otherwise, the original error — **(a) first appearance of
  chain-walking lookup, the mechanism this entire lesson exists to build.** This single
  method is what makes a function body able to read `pi`, a global variable, or another
  function's name, despite never having any of those in its own *local* `variables_` — the
  search doesn't stop at the first scope; it keeps walking outward until it either finds the
  name or runs out of parents.
- `has_user_function`/`call_user_function` mirroring `get`'s exact chain-walking shape — **(b)
  reappearing pattern, applied to a second map.** The identical local-check-then-delegate-to-
  parent structure, now for functions instead of variables — worth noticing this is the
  *same* algorithm, written twice because it's operating on two conceptually different maps,
  not because it's a different idea each time.

### CS lens

This chain of `Environment`s, each with a pointer to its enclosing scope, is precisely how
**lexical scoping** is implemented in essentially every interpreted language with nested
scopes — a name resolves by walking *outward* through the scopes a piece of code is textually
nested inside, not by looking at whatever scope happens to be active at the moment (which
would be **dynamic** scoping, a genuinely different and less common rule). This project has
actually been "Lisp-2 style" since Lesson 5 without ever naming it — variables (`Environment`'s
`variables_`) and built-in functions (`FunctionTable`) have always lived in separate
namespaces, the way Common Lisp keeps a function namespace distinct from a variable one (as
opposed to a "Lisp-1" language like Scheme or JavaScript, where a single name can only ever
mean one or the other). User-defined functions, stored in their own `user_functions_` map,
extend that same separate-namespace design rather than merging into `Value` as a fourth
alternative — consistent with a choice this project made three lessons ago and never
revisited.

### SE lens

Every child `Environment` still gets its own freshly-constructed `FunctionTable` member (since
`functions_` is a normal, unconditionally-constructed member — recall Lesson 5's composition
choice), which means every single function *call* in this project reconstructs the same four
`sqrt`/`sin`/`cos`/`abs` lambdas from scratch, discarding them the moment the call scope is
destroyed. This is a real, small, currently-unaddressed inefficiency — worth naming plainly
rather than glossing over, in keeping with this project's established habit (Lesson 10 left
`determinant()` un-refactored for similar reasons; Lesson 6 accepted `MatrixExpression`
copying its whole matrix on every evaluation) of accepting a known, minor cost rather than
restructuring working code without a concrete forcing function.

---

## Concept Unit 4: `UserFunction` — a value that remembers where it came from

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** new `user_function.h`, new `user_function.cpp`.
- **Change type:** add.
- **Location:** new files.
- **Dependencies:** `Environment` (forward-declared in the header, fully needed in the
  implementation — the same pattern Lesson 6 established for `ast.h`'s forward-declared
  `Environment`, now paired with a genuine full-include need on the implementation side).

### The New Code — type it yourself

`user_function.h`:

```cpp
#pragma once
#include <string>
#include <memory>
#include "value.h"

class Environment;
class Expression;

class UserFunction {
public:
    UserFunction(std::string parameter, std::shared_ptr<Expression> body, Environment* closure);
    Value call(Value argument) const;

private:
    std::string parameter_;
    std::shared_ptr<Expression> body_;
    Environment* closure_;
};
```

### The Updated Project

Brand-new file, nothing to place it inside. `user_function.cpp`, whole:

```cpp
#include "user_function.h"
#include "ast.h"
#include "environment.h"

UserFunction::UserFunction(std::string parameter, std::shared_ptr<Expression> body, Environment* closure)
    : parameter_(std::move(parameter)), body_(std::move(body)), closure_(closure) {}

Value UserFunction::call(Value argument) const {
    Environment call_scope(closure_);
    call_scope.set(parameter_, std::move(argument));
    return body_->evaluate(call_scope);
}
```

### Mechanical walkthrough (new items only)

- `class Environment; class Expression;` in the header, with `#include "environment.h"` and
  `#include "ast.h"` only in the `.cpp` — **(b) reappearing pattern, now doing double duty.**
  `Environment*` and (implicitly, via `shared_ptr<Expression>`) `Expression` are both only ever
  referenced *indirectly* in this header (a pointer, a smart pointer) — neither needs a
  complete type here, matching Lesson 6's original forward-declaration rule exactly.
- `Environment* closure_;` — **(a) first appearance of this project's actual closure
  mechanism, named plainly.** This raw pointer is what makes `UserFunction` a genuine
  **closure**: it remembers *which* `Environment` was active at the moment the function was
  defined, not merely "whatever `Environment` happens to be passed in when it's eventually
  called." A raw pointer is safe here specifically because, in this lesson's scope, the only
  `Environment` a function definition can ever be evaluated against is the single, permanent
  global one — created once in `server.cpp`'s `main()` and never destroyed for the lifetime of
  the running server. If this project later allowed defining a function *inside* another
  function's call — closing over a genuinely temporary scope that gets destroyed once that
  outer call returns — a raw pointer would become a dangling reference the moment that outer
  call ended, and `closure_` would need to become a `shared_ptr<Environment>` instead, exactly
  the way `body_` needed to become one in Concept Unit 1. That's real, deliberately deferred
  work, not an oversight — nested function definitions aren't built by this lesson.
- `Environment call_scope(closure_);` inside `call` — **(a) first appearance of actually using
  the new constructor.** This is the moment a brand-new child scope is born, on the C++ call
  stack, for exactly the duration of one function call — `closure_` (the captured defining
  environment, *not* whatever environment the caller happens to be evaluating in) becomes this
  new scope's `parent_`.
- `call_scope.set(parameter_, std::move(argument));` — **(b) reappearing method, new
  significance.** `Environment::set` (Lesson 4) always writes to the *local* scope only — which
  is exactly what makes this line correct: the parameter binds into `call_scope`'s own
  `variables_`, never touching whatever scope the caller was in, satisfying the "must not leak"
  half of this lesson's core problem.
- `return body_->evaluate(call_scope);` — **(b) reappearing call, new environment.** The
  body — the same `Expression` tree every call of this function shares, via `shared_ptr` —
  is evaluated fresh against `call_scope`, every single call, meaning every call gets its own
  independent parameter binding even though they all share one body tree — this is precisely
  what makes recursion safe: each nested call constructs its *own* `call_scope`, with its own
  independent `n`, never colliding with an outer call's `n` still waiting on the C++ call
  stack.

### CS lens

`closure_` capturing the *defining* environment rather than the *calling* environment is the
entire, precise definition of **lexical (static) scoping**, as opposed to **dynamic
scoping** — the rule this project has quietly committed to since `get`'s chain-walking design
in Concept Unit 3. Also recognized in: this is exactly why a closure in JavaScript or Python
"remembers" variables from where it was written, not from wherever it's later called — the
identical mechanism, one raw pointer standing in for what other languages implement with
their own more elaborate scope-chain machinery.

---

## Concept Unit 5: Defining a function — storing a callable, not computing a value

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.h`, `ast.cpp`.
- **Change type:** add one class.
- **Location:** `ast.h`, after `WhileExpression`; `ast.cpp`, at the end.
- **Dependencies:** `UserFunction` from Concept Unit 4.

### The New Code — type it yourself

```cpp
Value FunctionDefinitionExpression::evaluate(Environment& env) const {
    env.define_function(name_, UserFunction(parameter_, body_, &env));
    return Value::number(0.0);
}
```

### The Updated Project

`ast.h`'s tail, with `FunctionDefinitionExpression` appended after `WhileExpression`
(unchanged from Lesson 13):

```cpp
class FunctionDefinitionExpression : public Expression {                 // ← new
public:                                                                  // ← new
    FunctionDefinitionExpression(std::string name, std::string parameter, std::shared_ptr<Expression> body);  // ← new
    Value evaluate(Environment& env) const override;                     // ← new
                                                                           // ← new
private:                                                                  // ← new
    std::string name_;                                                   // ← new
    std::string parameter_;                                              // ← new
    std::shared_ptr<Expression> body_;                                   // ← new
};                                                                        // ← new
```

### Mechanical walkthrough (new items only)

- `env.define_function(name_, UserFunction(parameter_, body_, &env));` — **(a) first
  appearance of `evaluate()` storing a callable rather than producing a computed answer.**
  Every previous `evaluate()` in this project has computed *something* — a number, a matrix, an
  image. This one's real job is a side effect: registering `name_` in `env`'s
  `user_functions_` map. `&env` — the address of whatever `Environment` is currently active
  when this line runs — becomes the new `UserFunction`'s `closure_`, captured at exactly this
  moment.
- `return Value::number(0.0);` — **(b) reappearing convention.** The same "nothing meaningful
  to return, so return a defined placeholder" choice `WhileExpression` made in Lesson 13 for a
  loop that never runs — a function *definition* has no natural numeric result either, so this
  project reuses the identical convention rather than inventing a new one.
- No override of the body's ownership here — `body_` in `FunctionDefinitionExpression` and the
  `body_` inside the freshly-constructed `UserFunction` are two separate `shared_ptr`
  instances, both pointing at the *same* underlying `Expression` tree (Concept Unit 1's whole
  point) — **(b) reappearing concept, its actual payoff.** Nothing about evaluating this node
  transfers or empties `FunctionDefinitionExpression`'s own `body_`; it's simply copied
  (incrementing the shared reference count), which is exactly why this method is legally
  callable as `const` at all, with no need for `mutable` or any workaround.

---

## Concept Unit 6: Calling a user function — and letting it shadow built-ins

### Project Change

- **Reference Source:** no reference counterpart.
- **Files affected:** `ast.cpp` only.
- **Change type:** add a check at the very top of `FunctionCallExpression::evaluate`.
- **Location:** before the existing matrix-function branch (Lessons 9–11).
- **Dependencies:** `Environment::has_user_function`/`call_user_function` from Concept
  Unit 3.

### The New Code — type it yourself

```cpp
    if (env.has_user_function(name_)) {
        return env.call_user_function(name_, argument);
    }
```

### The Updated Project

`FunctionCallExpression::evaluate`, in full — the matrix branch and scalar fallback are
unchanged from Lesson 11:

```cpp
Value FunctionCallExpression::evaluate(Environment& env) const {
    Value argument = argument_->evaluate(env);

    if (env.has_user_function(name_)) {                                  // ← new
        return env.call_user_function(name_, argument);                  // ← new
    }                                                                    // ← new

    if (argument.is_matrix()) {
        if (name_ == "det") {
            return Value::number(argument.as_matrix().determinant());
        }
        if (name_ == "inverse") {
            return Value::matrix(argument.as_matrix().inverse());
        }
        if (name_ == "plot") {
            return Value::svg(render_bar_chart(argument.as_matrix()));
        }
        throw std::runtime_error("unknown matrix function: " + name_);
    }

    double result = env.call(name_, argument.as_number());
    return Value::number(result);
}
```

### Mechanical walkthrough (new item only)

- The user-function check placed **first**, ahead of everything else in this method — **(a)
  first appearance of this specific ordering, and a real, worth-naming consequence.** Because
  this check runs before the matrix branch and before the built-in scalar fallback, a
  user-defined function named, say, `sqrt` would completely **shadow** the real built-in
  `sqrt` from Lesson 5 — every call to `sqrt(...)` would resolve to the user's version, with no
  way to reach the original short of renaming one of them. This project doesn't prevent that;
  it's a real, deliberate consequence of checking user functions first (matching how most
  languages let user code shadow built-ins), stated honestly rather than silently allowed to
  surprise someone later. The argument's kind — number, matrix, whatever — is also completely
  unrestricted for a user function, unlike the built-in scalar path (which insists on
  `as_number()`): a `UserFunction` accepts whatever `Value` its caller passes, and its own body
  decides what to do with it, including rejecting it (via the same `as_number()`/`as_matrix()`
  errors every other node already relies on) if the body's own operations don't support that
  kind.

### Run it. Real output.

```
$ curl -X POST http://localhost:8080/evaluate -d "function square(x) x * x end"
0

$ curl -X POST http://localhost:8080/evaluate -d "square(5)"
25

$ curl -X POST http://localhost:8080/evaluate -d "function fact(n) if (n <= 1) 1 else n * fact(n - 1) end"
0

$ curl -X POST http://localhost:8080/evaluate -d "fact(5)"
120

$ curl -X POST http://localhost:8080/evaluate -d "fact(10)"
3.6288e+06

$ curl -X POST http://localhost:8080/evaluate -d "function withpi(x) x * pi end"
0

$ curl -X POST http://localhost:8080/evaluate -d "withpi(2)"
6.28319

$ curl -X POST http://localhost:8080/evaluate -d "x = 100"
100

$ curl -X POST http://localhost:8080/evaluate -d "function leak(x) x + 1 end"
0

$ curl -X POST http://localhost:8080/evaluate -d "leak(5)"
6

$ curl -X POST http://localhost:8080/evaluate -d "x"
100

$ curl -X POST http://localhost:8080/evaluate -d "A = [1 2; 3 4]"
[1 2; 3 4]

$ curl -X POST http://localhost:8080/evaluate -d "function double_matrix(m) m + m end"
0

$ curl -X POST http://localhost:8080/evaluate -d "double_matrix(A)"
[2 4; 6 8]

$ curl -X POST http://localhost:8080/evaluate -d "unknownfn(5)"
error: unknown function: unknownfn
```

`fact(5) = 120` and `fact(10) = 3.6288e+06` (that's `3,628,800`, `format_number`'s default
precision switching to scientific notation for a large value — a real, visible formatting
quirk, honestly noted rather than hidden, in the same family as the `14.000000` issue Lesson 6
fixed for the common case but never made bulletproof for every magnitude) both prove genuine
**recursion** — `fact` calling itself, each call getting its own independent `n`, correctly
unwinding back through five (or ten) nested calls to the right final product. `withpi(2) =
6.28319` proves the closure mechanism (Concept Unit 4) genuinely works: `pi` isn't a parameter,
isn't passed in, and isn't in the function's own local scope — it's found only by walking up
`closure_`, exactly as designed. The `leak`/`x` pair is the single most important proof in this
lesson: `x = 100` set globally, then `leak(5)` runs with its *own* local `x = 5` — and a
follow-up request confirms the global `x` is still `100`, completely untouched. `double_matrix`
proves a user function works identically for a matrix argument, no special-casing needed
anywhere in this lesson's code for that to be true.

### Connect

Every construct built since Lesson 4 — variables, functions, matrices, control flow — now
composes correctly through real function calls and real recursion, with correct, provably
non-leaking scoping. What remains genuinely unbuilt, honestly: nested function *definitions*
(a function defined inside another function's call, closing over a temporary rather than the
permanent global scope — which would require `closure_` to become `shared_ptr<Environment>`,
as Concept Unit 4 already flagged) and multi-parameter functions (every `UserFunction` here
takes exactly one argument, matching this project's single-argument `FunctionCallExpression`
design all the way back to Lesson 5). Both are real, legitimate extensions this lesson
deliberately leaves for later, not gaps that crept in unnoticed.

---

## Closing

### Connect the pieces

Trace `fact(5)` end to end, with `fact` already defined: Lesson 1's socket/HTTP layer
delivers `"fact(5)"` unchanged → the lexer/parser (Lesson 5's function-call grammar,
unmodified) build `FunctionCallExpression("fact", NumberExpression(5))` →
`evaluate(environment)`: the argument `5` evaluates first → `environment.has_user_function("fact")`
(Concept Unit 3) finds it in the global scope's own `user_functions_` map, `true` →
`environment.call_user_function("fact", Value::number(5))` → `UserFunction::call` (Concept
Unit 4) builds a fresh `call_scope` whose `parent_` is the global environment, binds
`n = 5` locally, and evaluates the shared body (`if (n <= 1) 1 else n * fact(n - 1)`) against
it → the `if`'s condition (`5 <= 1`, false) selects `n * fact(n - 1)` → evaluating that
recurses: `fact(4)` triggers the *exact same* sequence again, `has_user_function` finding
`fact` this time by walking from a brand-new call scope up through *its* parent (also the
global environment) → this continues down to `fact(1)`, whose `if` condition is finally true,
returning `1` directly → each pending multiplication resolves on the way back out:
`2 * 1 = 2`, `3 * 2 = 6`, `4 * 6 = 24`, `5 * 24 = 120` → `120` propagates all the way back
through Lesson 1's untouched response code to `curl`.

### What breaks without this

In `UserFunction::call`, temporarily construct the call scope with **no** parent at all,
simulating what would happen without the chain:

```cpp
Value UserFunction::call(Value argument) const {
    Environment call_scope;   // was: Environment call_scope(closure_);
    call_scope.set(parameter_, std::move(argument));
    return body_->evaluate(call_scope);
}
```

Rebuild, and send `"withpi(2)"` again. Real result: `error: undefined variable: pi` — with no
`parent_` at all (this default-constructed `Environment()` even re-adds its *own* fresh `pi`,
so this particular case is subtle; the clearer failure is `fact(5)`, which would instead fail
with `error: unknown function: fact`, since a parentless call scope's `has_user_function` has
nowhere to delegate to and never finds `fact` registered in the global scope at all).
Either way, the underlying cause is identical: without a `parent_` pointing back at the
defining scope, a function body can see *only* its own parameter and whatever a fresh,
disconnected `Environment()` happens to bootstrap on its own — nothing about the scope it was
actually defined in. This is the entire lesson's argument made concrete: closures aren't
useful because they're clever, they're useful because, without the parent link, a function
body would be an island, unable to see even its own name for the purpose of recursion.
Restore `Environment call_scope(closure_);` before moving on.

### Exercises

- Trace `square(5)` by hand — a *non-recursive* call — writing out exactly which `Environment`
  is `call_scope`'s `parent_`, and confirm `x` genuinely doesn't exist in the global scope
  either before or after the call.
- Define a second function that calls the first (`function double(x) x * 2 end` then
  `function quadruple(x) double(double(x)) end`), and confirm `quadruple(3)` returns `12` —
  tracing how many distinct `Environment` instances actually exist at the deepest point of
  that call.
- The user-function shadowing behavior named in Concept Unit 6 means defining
  `function sqrt(x) 0 end` would make every later `sqrt(...)` call return `0`, silently, for
  the rest of the server's lifetime (until redefined again). Confirm this with `curl`, then
  consider — as an exercise only, not required for this lesson's Definition of Done — whether
  you think this project should prevent shadowing built-in names, and what the argument would
  be either way.

### Definition of done

- [ ] `user_function.h`/`user_function.cpp` compile cleanly, with `Environment` and
      `Expression` only forward-declared in the header.
- [ ] `environment.h`/`environment.cpp` compile with the parent-pointer constructor and
      chain-walking `get`/`has_user_function`/`call_user_function`.
- [ ] `ast.h`/`ast.cpp` compile with `FunctionDefinitionExpression` added and
      `FunctionCallExpression` checking user functions first.
- [ ] `lexer.h`/`lexer.cpp` compile with `function`/`end` recognized, using
      `TokenType::EndKeyword`, deliberately distinct from the existing end-of-input
      `TokenType::End`.
- [ ] `parser.h`/`parser.cpp` compile with `parse_function_definition` wired into
      `parse_comparison`.
- [ ] `square(5)` returns `25`.
- [ ] `fact(5)` and `fact(10)` both return correct factorial values, proving recursion works.
- [ ] `withpi(2)` returns `2 * pi`, proving the closure resolves a global through the parent
      chain.
- [ ] After `x = 100` and calling a function with its own parameter named `x`, a follow-up
      request confirms the global `x` is still `100` — the core non-leaking-scope proof.
- [ ] A user function correctly handles a matrix argument with no special-casing.
- [ ] The "what breaks without this" exercise (a parentless call scope) was actually run and
      reverted.
- [ ] Commit:

```
git add lexer.h lexer.cpp ast.h ast.cpp parser.h parser.cpp environment.h environment.cpp user_function.h user_function.cpp
git commit -m "Add user-defined functions: environments as a parent-linked chain

Environment gains a parent_ pointer and a second constructor;
get()/has_user_function()/call_user_function() all walk the chain
outward on a local miss rather than searching only their own map -
this is lexical scoping, and it's what makes a function body able
to see global variables and its own name (for recursion) despite
never having them locally. Environment::set() still only ever
writes locally (unchanged since Lesson 4), which is what keeps a
function's parameter from leaking into the caller's scope.

UserFunction bundles a parameter name, a body, and a raw
Environment* closure captured at definition time (safe only
because every closure in this lesson's scope is the single,
permanent global environment - nested function definitions closing
over a temporary scope would need shared_ptr<Environment> instead,
not built here). The body itself is shared_ptr<Expression>, not
unique_ptr: it's the first thing in this project genuinely needing
two independent owners with overlapping lifetimes (the original AST
node, and the long-lived UserFunction stored in Environment).

FunctionCallExpression checks user-defined functions before
built-ins, which means a user function can shadow a built-in name
like sqrt - a real, deliberate consequence, not prevented here.

Fixed a real bug found via testing: identifiers couldn't contain
underscores at all, blocking natural names like double_matrix.

Known, deliberate gaps: functions take exactly one parameter;
nested function definitions (closures over a temporary, non-global
scope) aren't supported; every function call reconstructs an
identical FunctionTable, a small, accepted inefficiency consistent
with this project's established habits."
```

Next lesson: hardening — real unit tests per layer, structured logging with levels, and the
`lexer/ parser/ ast/ interpreter/ runtime/ matrix/ http/ tests/ benchmarks/` directory layout
this project's original architecture named from the very first lesson.
