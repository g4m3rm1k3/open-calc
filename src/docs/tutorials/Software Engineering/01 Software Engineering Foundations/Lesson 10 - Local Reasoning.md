# Lesson 10: Local Reasoning

**What you will build.** One function, `apply_coupon`, called the exact
same way twice in a row — same cart total, same coupon code, same
arguments, character for character — that returns two different answers.
Then the same function, rebuilt so that calling it identically twice
always means something identical happened, and every answer it can ever
give is visible from the call site alone. The transferable problem:
whether you can trust what a piece of code will do by reading only that
code, or whether you're forced to go search the rest of the program first
— and that difference is exactly what determines how large a codebase can
grow before nobody can hold all of it in their head at once.

**What you need to know first.** Lesson 9's coupling — this lesson names
the specific, worst form of tight coupling: depending on something that
isn't even part of a function's stated interface at all.

**Terms introduced in this lesson**

- **local reasoning** — the ability to understand and verify what a piece
  of code does by reading only that code and its own interface
  (parameters in, return value out), with no need to trace through the
  rest of the program's history or current state. The word matters
  because it names the actual payoff of everything Lessons 8 and 9 were
  building toward — cohesion and low coupling aren't valuable for their
  own sake, they're valuable because they're what makes local reasoning
  possible at all.
- **hidden dependency** — something a function's behavior depends on that
  never appears anywhere in its own signature — most commonly, a global
  variable it reads or silently changes. It's a sharper, worse case of
  Lesson 9's tight coupling: tight coupling depends on another unit's
  undocumented internals, which at least has a name you could go find;
  a hidden dependency doesn't even announce that a dependency exists.

**Objects and methods used.** None new — this lesson's code uses the
`global` statement (already covered by this curriculum's basic-syntax
convention) alongside already-assumed `set` operations.

No pipeline diagram yet — this curriculum has not established one.

---

## Concept Unit: The Same Call, Twice, Two Different Answers

### The Problem

Extend Lesson 1's `cart_total` world with a coupon system: applying a
coupon code takes 10% off a cart total, but each coupon code should only
ever work once. Track which codes have already been used in a variable
sitting outside the function, available to it directly.

### The Code, Run for Real

```python
_used_coupons = set()

def apply_coupon(cart_total, coupon_code):
    global _used_coupons
    if coupon_code in _used_coupons:
        return cart_total
    _used_coupons.add(coupon_code)
    return cart_total * 0.9
```

Call it exactly the same way, twice in a row:

```python
print(apply_coupon(100, "SAVE10"))
print(apply_coupon(100, "SAVE10"))
```

Running it:

```text
$ python coupons.py
90.0
100
```

Identical arguments — `100` and `"SAVE10"`, both times, nothing about the
call itself different in any way — and two different answers: `90.0`,
then `100`. Nothing about reading this specific line,
`apply_coupon(100, "SAVE10")`, the second time it appears, tells you it
will behave differently from the first. The only way to know is to have
already read — and remembered — that the exact same call happened once
before.

### Mechanical Walkthrough

- `global _used_coupons` — first appearance of the `global` statement in
  this curriculum, given full treatment here: inside a function, an
  ordinary assignment to a name creates a *new*, local variable by
  default; `global` tells Python that `_used_coupons` inside this
  function refers to the module-level variable of that name instead,
  so `_used_coupons.add(...)` changes the one shared copy, not a private
  one.
- `_used_coupons.add(coupon_code)` — already-assumed `set` method; the
  new idea isn't the method, it's that this call mutates a piece of state
  that lives entirely outside `apply_coupon`'s own parameter list.
- `if coupon_code in _used_coupons:` — already-assumed membership testing;
  what makes it different from every earlier `in` check in this
  curriculum is that `_used_coupons` isn't something the caller passed
  in, isn't visible in the function's signature, and isn't something a
  reader of this line alone would even know exists.

### The Concept

To predict what `apply_coupon(100, "SAVE10")` returns, reading
`apply_coupon`'s own code is not enough — you also need to know, for
certain, whether `"SAVE10"` has ever been passed to *any* call to
`apply_coupon`, anywhere in the entire program's execution so far, from
any file, any request, any earlier run of this exact line. In a real
system, that could mean searching every file that imports this module,
every route handler that might call it, every background job — with no
way to bound how far the search has to go before you can trust an answer.
This is what it means to lose **local reasoning**: understanding one
function correctly stopped being a fact about that function, and became a
fact about the entire program's history.

### CS Lens

This is the identical failure Lesson 9 demonstrated with
`can_purchase_tight` reaching into `accounts.py`'s private dict, taken one
step further: there, at least `_accounts` was a real, findable thing
inside a specific file, reachable by looking at `accounts.py`. Here,
`_used_coupons` isn't declared anywhere in `apply_coupon`'s own interface
at all — nothing about calling this function suggests it depends on
anything beyond its two arguments. Lesson 9 called this coupling; this
specific, undeclared form of it earns its own name, **hidden dependency**,
because the dependency isn't just tightly bound — it's invisible from the
call site entirely.

### SE Lens

The realistic case for a shared, global "used coupons" tracker isn't
unreasonable on its face — coupons genuinely do need to be tracked
somewhere everyone can see them, and a single, unambiguous source of
truth for "has this code been used" sounds like exactly what you'd want.
What went wrong wasn't wanting shared state to exist — it's making that
shared state *invisible from the function that depends on it*, which is
a choice, not a requirement of the problem.

---

## Concept Unit: Making the Dependency Visible

### The Problem

Rebuild `apply_coupon` so that everything it depends on to compute an
answer is something a caller can actually see, at the call site, without
having to know anything about what happened earlier in the program.

### The New Code

```python
def apply_coupon(cart_total, coupon_code, used_coupons):
    if coupon_code in used_coupons:
        return cart_total
    used_coupons.add(coupon_code)
    return cart_total * 0.9
```

### Run It — Same Question, Answerable by Reading the Call

```python
used = set()
print(apply_coupon(100, "SAVE10", used))
print(apply_coupon(100, "SAVE10", used))
print(apply_coupon(100, "SAVE10", set()))
```

Running it:

```text
$ python coupons.py
90.0
100
90.0
```

The first two calls, sharing the same `used` set, reproduce the earlier
result exactly — `90.0`, then `100`, once `"SAVE10"` is recorded as used.
The third call passes a brand-new, empty `set()` instead, and gets `90.0`
again — and unlike the earlier version, that's not a surprise. It's
predictable directly from reading the line: a fresh, empty set obviously
hasn't recorded `"SAVE10"` as used yet, because the call itself shows you
the set it's checking.

### The Concept

Nothing about `apply_coupon`'s actual discount logic changed between the
two versions — same 10% rule, same "already used" check. What changed is
that `used_coupons` moved from being a fact about the world the function
happened to reach out and touch, into being a fact stated directly in the
function's own signature. Every one of this version's possible answers is
now derivable from its arguments alone: given `cart_total`, `coupon_code`,
and `used_coupons` as they exist at the moment of the call, the result is
fully determined, with nothing left to look up elsewhere. That's **local
reasoning**, restored: understanding this function correctly is a fact
about this function again, not about the rest of the program.

### CS Lens

This is the same principle underlying why mathematical functions are
easy to reason about: $f(x) = x^2$ always returns the same output for the
same input, with nothing external to check. A function whose result can
depend on when it's called, or how many times, or in what order relative
to other calls, is reasoning about something closer to a stateful
machine than a mathematical function — which isn't wrong to build, but is
a fundamentally harder thing to verify, exactly as this lesson's first
unit demonstrated directly.

### SE Lens

Passing `used_coupons` in explicitly costs something real: every caller
now has to have a `used_coupons` set on hand and pass it, rather than the
function quietly finding it on its own. That's not friction to eliminate
— it's the visible price of the guarantee this unit just proved: anyone
reading a call to this version of `apply_coupon` can see, completely,
everything that call depends on. The hidden-global version was more
convenient to call and strictly harder to trust, and this trade — a
little more to write at the call site, a lot more confidence in what the
call actually means — is one this curriculum returns to constantly from
here on.

---

## Concept Unit: Why This Is the Actual Payoff

### The Problem

Lessons 8 and 9 built toward cohesion and low coupling as design
qualities. What do they actually buy, in practice, once a codebase is
larger than a handful of functions?

### The Concept

Local reasoning is the payoff. A codebase where every function can be
understood by reading itself and its own interface is a codebase where
adding a hundredth function doesn't make the first one any harder to
trust — each one stands on its own. A codebase where functions depend on
hidden global state, the way the first version of `apply_coupon` did, gets
harder to reason about with *every single function added*, because any
new function might be one more thing that could have silently changed
`_used_coupons` before the line you're staring at ever ran. This is the
concrete, mechanical reason cohesion and low coupling matter beyond
aesthetics: they are what make it possible to hold one function in your
head at a time, correctly, instead of needing to hold the entire program
at once — which is a hard limit on how large a system can grow before it
becomes genuinely unmanageable by any one person, no matter how skilled.

### CS Lens

This same idea is why pure mathematical functions are foundational to
formal verification and to entire programming languages built around
minimizing hidden state — a property provable about a function in
isolation stays true no matter what else the program does around it,
which is exactly the guarantee `_used_coupons` as a hidden global
destroyed and passing it explicitly restored.

### SE Lens

Perfect local reasoning everywhere is not free, and this lesson doesn't
claim it should be pursued unconditionally — some state genuinely is
global in a legitimate sense (configuration loaded once at startup, for
instance), and threading every conceivable dependency through every
function's parameter list has its own real cost in verbosity, echoing
the same premature-defense tension Lesson 2 already raised. The actual
discipline is narrower: know, for any function you're relying on, whether
you can trust it by reading it alone — and treat a "no" to that question
as a real, named cost, the way this lesson's first unit just measured it,
rather than an invisible inconvenience nobody has to account for.

---

## Connect the Pieces

One function, `apply_coupon`, called identically, twice, in both versions:

1. **Hidden dependency** — `_used_coupons` as a global the function
   silently reads and mutates; `apply_coupon(100, "SAVE10")` returns
   `90.0` then `100`, with nothing about either call site explaining why.
2. **Visible dependency** — `used_coupons` passed explicitly;
   `apply_coupon(100, "SAVE10", used)` returns the identical `90.0` then
   `100` for the same reason, but now a reader can see exactly which
   state each call depends on, including that a fresh `set()` predictably
   resets it.
3. **The payoff** — this is what cohesion (Lesson 8) and low coupling
   (Lesson 9) were building toward: a function that can be trusted by
   reading only itself, which is the only way a system can keep growing
   without every new addition making every earlier one harder to verify.

## What Breaks Without This

Keep the hidden-global version of `apply_coupon` and add one more,
completely unrelated feature to the same program: an admin tool that
resets `_used_coupons` to an empty set at the start of every day. Nothing
about that reset function calls `apply_coupon`, references it, or shows
up anywhere near it in the file. Weeks later, a customer complains a
coupon that should have been used up is working again — and diagnosing
it means discovering that a completely separate, unrelated piece of code,
written for a completely different purpose, happens to touch the same
hidden variable. No traceback points at the connection. Nothing about
reading `apply_coupon` in isolation would ever reveal that this other
function exists, let alone that it matters.

## Exercises

1. Add a third coupon code, `"SAVE20"`, to the local-reasoning version of
   `apply_coupon`, applying a 20% discount instead of 10%. Confirm, by
   running it, that using `"SAVE10"` and `"SAVE20"` against the same
   `used_coupons` set correctly track independently.
2. Write, in your own words, what question you'd have to answer — and
   where you'd have to look to answer it — to trust a single call to the
   hidden-global version of `apply_coupon`, in a real codebase with
   hundreds of files. Then answer the same question for the
   local-reasoning version.
3. Look back at Lesson 6's `safe_average`. Does it depend on anything
   outside its own parameter list? Justify your answer by reading only
   its code, the way this lesson argues you should be able to.

## Definition of Done

- [ ] You've reproduced the identical-call, different-answer failure with
      the hidden-global version, and confirmed the parameterized version
      makes every answer predictable from its arguments.
- [ ] You can state local reasoning in your own words and explain why it
      depends on Lesson 9's low coupling.
- [ ] You've completed all three exercises.
- [ ] Commit the parameterized `apply_coupon`. Commit message should
      explain *why*: for example, `Lesson 10 — used_coupons passed
      explicitly instead of read from a hidden global, so a call's result
      is fully determined by its own arguments.`
