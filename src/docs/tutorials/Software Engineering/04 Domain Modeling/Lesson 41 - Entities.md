# Lesson 41: Entities

**What you will build.** Two ways of asking "is this the same customer,"
built against Lesson 40's `Customer` — one comparing email addresses, one
comparing `customer_id`. You'll find two real, opposite failures in the
email-based version: it says a customer who only changed her email is
suddenly a *different* customer, and it says two genuinely different
customers who happen to share a family email are the *same* one. Both
failures disappear once "same customer" is asked the right way.

**What you need to know first.** Lesson 40's `Customer` and its
`customer_id` — this lesson names precisely what kind of domain concept
`Customer` is, and why that determines how "sameness" has to be checked.

**Terms introduced in this lesson**

- **entity** — a domain object whose sameness over time is determined by
  a persistent identity, not by its current attribute values. A customer
  is an entity: changing her email doesn't make her a different customer,
  and two different customers don't become the same customer just
  because they temporarily share an email. The word matters because it
  names a real, checkable category — once something is recognized as an
  entity, "is this the same one" always has to be answered by comparing
  identity, never by comparing whatever attributes happen to be
  convenient, the exact distinction Lesson 40's orphaned points already
  showed the cost of ignoring.

**Objects and methods used.** `is`, Python's identity operator, already
used without comment in earlier lessons (Lesson 9's `can_purchase_tight`
implicitly relies on object identity through dict lookups); given its own
explicit treatment here: `a is b` is `True` only when `a` and `b` are the
literal same object in memory, a stricter, different question than `a ==
b`, which this lesson's own code deliberately never uses for comparing
customers.

Pipeline: this lesson continues in the *Domain model* stage, restated per
Lesson 40's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: The Same Customer, Compared the Wrong Way

### The Problem

Given two `Customer` records, write the obvious way to check whether
they represent the same person: compare their email addresses.

### The Code, Run for Real

```python
class Customer:
    def __init__(self, customer_id, email):
        self.customer_id = customer_id
        self.email = email

def is_same_customer_by_attributes(a, b):
    return a.email == b.email
```

Check it against Lesson 40's exact scenario — Alice, before and after
changing her email:

```python
alice_before = Customer("cust-1", "alice@old.com")
alice_after = Customer("cust-1", "alice@new.com")

print("same customer, compared by attributes:", is_same_customer_by_attributes(alice_before, alice_after))
```

Running it:

```text
$ python customer_identity.py
same customer, compared by attributes: False
```

`False`. The exact same person — same `customer_id`, same real human
being who just updated her email — is reported as two different
customers, because nothing about `is_same_customer_by_attributes` looks
at the one fact that actually determines sameness for an entity.

### Mechanical Walkthrough

- `class Customer: def __init__(self, customer_id, email): ...` —
  already-assumed class syntax, reused from Lesson 33's convention; two
  plain instance attributes, no special behavior yet.
- `a.email == b.email` — already-assumed attribute access and string
  equality; the mechanical content of the bug is exactly this one
  comparison, checking the wrong fact.

### CS Lens

This is Lesson 34's over-specified property, from the opposite direction:
there, a check demanded *more* precision than the domain actually
promised (exact list order). Here, a check uses the *wrong* precision
entirely — comparing a fact that's allowed to change instead of the one
fact that isn't.

### SE Lens

`is_same_customer_by_attributes` isn't a careless function — comparing
the field that's visibly right there, `email`, is a completely natural
first instinct, the same instinct that made email a convenient dict key
in Lesson 40. The mistake is treating an entity's attribute as though it
were the entity itself, and this lesson's next unit shows the same
mistake failing in the opposite direction too.

---

## Concept Unit: Two Different Customers, Compared the Same Wrong Way

### The Problem

Two genuinely different customers — not the same person at two points in
time, but two different people — happen to share a family email address.

### Run It — A Second, Opposite Failure

```python
alice = Customer("cust-1", "family@example.com")
bob = Customer("cust-2", "family@example.com")

print("different customers sharing an email, by attributes:", is_same_customer_by_attributes(alice, bob))
```

Running it:

```text
$ python customer_identity.py
different customers sharing an email, by attributes: True
```

`True`. Two real, different customers — different `customer_id`s,
different people — are reported as the same one, because they happen to
share the one attribute this check actually looks at.

### The Concept

Line these two failures up side by side: the same customer, compared by
attributes, was wrongly called *different*; two different customers,
compared by attributes, were wrongly called *the same*. Both failures
have the identical root cause — asking "are these the same entity" by
checking something that isn't the entity's identity at all. Fix both at
once by comparing the one thing that's actually supposed to answer this
question:

```python
def is_same_customer_by_identity(a, b):
    return a.customer_id == b.customer_id

print("same customer, compared by identity:", is_same_customer_by_identity(alice_before, alice_after))
print("different customers, compared by identity:", is_same_customer_by_identity(alice, bob))
```

Running it:

```text
$ python customer_identity.py
same customer, compared by identity: True
different customers, compared by identity: False
```

Both correct, in one function, using a fact that never changes for the
same customer and never coincides for two different ones — because
that's precisely what `customer_id` was built, back in Lesson 40, to be.

### CS Lens

This is the formal definition of an **entity** in domain-modeling terms:
its identity is stable and unique for its entire lifetime, while its
attributes are free to change without affecting what it *is*. A **value**
— covered next, in Lesson 42 — works the opposite way: two values with
identical attributes genuinely are interchangeable, with no separate
identity underneath them at all. Recognizing which kind of thing you're
modeling determines, mechanically, which comparison is ever correct.

### SE Lens

The real discipline this lesson teaches isn't "always compare IDs" as a
blanket rule — Lesson 42 is about to show real cases where comparing
attributes is exactly correct. It's asking, for any given concept, which
category it actually belongs to, *before* writing an equality check —
the same category question Lesson 40 asked about which attribute to key
data by, now applied specifically to what "the same" is even allowed to
mean.

---

## Connect the Pieces

One customer concept, two comparisons, two opposite failures from the
same mistake:

1. **Same entity, called different** — Alice before and after her email
   change, compared by attribute, wrongly reported as two different
   customers.
2. **Different entities, called the same** — Alice and Bob, sharing a
   family email, compared by attribute, wrongly reported as one customer.
3. **Both fixed by comparing identity** — `customer_id`, not `email`,
   correctly answers "is this the same customer" in both directions at
   once.

## What Breaks Without This

Build a real feature on top of `is_same_customer_by_attributes` — a fraud
check flagging "the same customer" placing suspiciously many orders,
say. The moment two real family members share an email, they're flagged
as one suspicious customer instead of two ordinary ones; the moment a
real customer updates her email mid-session, her own new order looks, to
this check, like it came from a stranger. Neither failure crashes
anything. Both quietly misclassify real people, for a reason that traces
back to one wrong comparison, applied everywhere "the same customer"
needed to be asked.

## Exercises

1. Add a third `Customer`, with a different `customer_id` and a
   completely different email from both Alice and Bob. Confirm, with real
   output, that `is_same_customer_by_identity` correctly distinguishes
   all three from each other.
2. Rewrite `Customer` to include a `name` attribute in addition to email,
   and confirm that changing a customer's name, like changing her email,
   has no effect on `is_same_customer_by_identity`'s answer.
3. Look back at Lesson 33's `ResetToken`. Is a `ResetToken` an entity in
   this lesson's sense? Justify your answer using this lesson's own
   definition, and name what its identity would be if it needed one.

## Definition of Done

- [ ] You can define "entity" in your own words, and explain why an
      entity's identity and its attributes have to be compared
      differently.
- [ ] You've reproduced both real failures of attribute-based comparison
      and confirmed identity-based comparison fixes both.
- [ ] You've completed all three exercises.
- [ ] Commit `is_same_customer_by_identity`, replacing
      `is_same_customer_by_attributes`. Commit message should explain
      *why*: for example, `Lesson 41 — customer equality now compares
      customer_id instead of email; fixes both a false-different and a
      false-same case attribute comparison got wrong.`
