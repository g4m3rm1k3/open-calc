# Lesson 40: Why Domain Models Matter

**What you will build.** A customer's order history and loyalty points,
tracked the way it's easiest to track them at first — keyed by email
address, because email is right there, unique, and convenient. Then a
single, ordinary event no domain-aware system should ever be surprised
by: the customer changes her email. Her orders move correctly. Her
120 loyalty points don't — they're still sitting under the address she no
longer uses, invisible under the one she does. You'll fix it not by
patching the email-change code, but by representing what was actually
missing the whole time: the customer herself, as a real, stable concept,
independent of any attribute that happens to be convenient to key data by.

**What you need to know first.** Lesson 8's separation of concerns and
Lesson 19's unstated assumptions — this lesson's bug is a specific,
common instance of both, caused by a gap this domain exists to close.

**Terms introduced in this lesson**

- **domain model** — a representation of the real-world concepts, rules,
  and relationships a system actually deals with, built to reflect what's
  genuinely true about them, rather than whichever attribute happens to
  be convenient to use as a shortcut. A customer is a real, persistent
  thing in the world, independent of their current email, current name,
  or any other fact that can change about them — a domain model is what
  represents that persistence directly, instead of quietly assuming some
  convenient, mutable attribute can stand in for it.

**Objects and methods used.** `dict.pop(key)`, first appearance in this
curriculum: removes `key` from a dict and returns its value, given full
treatment where it's used below.

No pipeline diagram change — this lesson opens work in the *Domain
model* stage Lesson 12 named; restated here for the first time this
domain touches it:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: Modeling the Convenient Attribute Instead of the Real Thing

### The Problem

Track a customer's orders and loyalty points. Email addresses are
unique, already present, and easy to use as a key — so two completely
separate features do exactly that, independently.

### The Code, Run for Real

```python
customer_orders = {"alice@old.com": ["order-1", "order-2"]}
customer_points = {"alice@old.com": 120}
```

Both work fine, checked independently, exactly the way `existing_usernames`
worked fine in Lesson 19 before anything went looking for its hidden
assumption. Nothing here is wrong yet.

### CS Lens

This is the identical shape as Lesson 19's `existing_usernames`: a real,
working system, quietly built on a convenient fact — here, that an
email address reliably identifies one specific customer, forever —
that was never actually guaranteed to stay true.

### SE Lens

Using email as a key isn't a mistake at the moment it's written — it's
the path of least resistance, and it works for as long as nothing about
a customer's email ever changes. The real question a domain model exists
to ask, before that assumption gets baked into two separate features
independently, is whether the *thing being modeled* — a customer — is
actually the same thing as the *attribute being used to key it* — an
email address. It isn't, and this lesson's next unit shows exactly what
that gap costs.

---

## Concept Unit: An Ordinary Event the Model Was Never Built to Survive

### The Problem

A customer changes her email — a completely ordinary event, not an edge
case, not a rare mistake. Handle it the way the current design invites:
move her key in `customer_orders`.

### Run It — Watch What Actually Happens

```python
def change_email(old_email, new_email):
    customer_orders[new_email] = customer_orders.pop(old_email)

change_email("alice@old.com", "alice@new.com")

print("orders for new email:", customer_orders.get("alice@new.com"))
print("points for new email:", customer_points.get("alice@new.com"))
print("points for old email:", customer_points.get("alice@old.com"))
```

Running it:

```text
$ python customers.py
orders for new email: ['order-1', 'order-2']
points for new email: None
points for old email: 120
```

Her orders moved correctly — `change_email` knew about
`customer_orders` and updated it. Her `120` points didn't move at all;
they're still sitting under `"alice@old.com"`, a key nobody will ever
look her up by again, and `customer_points.get("alice@new.com")` returns
`None` — not an error, not a warning, just silently, confidently empty.

### Mechanical Walkthrough

- `customer_orders.pop(old_email)` — given full treatment above: removes
  `old_email`'s entry from the dict and returns its value in one step,
  used here to move the value under a new key.
- `customer_orders[new_email] = ...` — already-assumed dict assignment;
  together with `.pop`, this correctly renames the key `customer_orders`
  used for this customer.
- `customer_points.get("alice@new.com")` — already-assumed `dict.get`;
  returns `None` because nothing about `change_email` ever touched
  `customer_points` at all — a completely separate dict, built by a
  completely separate feature, that happened to make the identical,
  unstated assumption `customer_orders` did.

### CS Lens

This is Lesson 24's lost traceability, produced by a different root
cause: there, the same rule was implemented twice with no link between
the copies. Here, the same *identifying key* is used twice, independently,
with no link between the two uses — and a change correct for one is
simply invisible to the other, because nothing about the system's design
ever represented "this is the same customer" as a fact in its own right.

### SE Lens

`change_email`'s author didn't do anything careless — they updated the
one dict they knew about. The real gap is structural, not a lapse in
attention: nothing in this design gives anyone a single, obvious place
to update *everything* connected to a customer, because nothing
represents "a customer" as a real thing at all — only as a key,
duplicated wherever it happened to be convenient.

---

## Concept Unit: Modeling the Customer, Not the Email

### The Problem

Represent what was actually missing: the customer herself, as a real,
stable concept, with her email as one fact *about* her rather than her
entire identity.

### The New Code

```python
customers = {"cust-1": {"email": "alice@old.com"}}
customer_orders = {"cust-1": ["order-1", "order-2"]}
customer_points = {"cust-1": 120}

def change_email(customer_id, new_email):
    customers[customer_id]["email"] = new_email
```

Run the identical change:

```python
change_email("cust-1", "alice@new.com")

print("customer record:", customers["cust-1"])
print("orders:", customer_orders["cust-1"])
print("points:", customer_points["cust-1"])
```

Running it:

```text
$ python customers.py
customer record: {'email': 'alice@new.com'}
orders: ['order-1', 'order-2']
points: 120
```

Her email updated, in the one place it's actually stored.
`customer_orders["cust-1"]` and `customer_points["cust-1"]` never had to
change at all — they were never keyed by her email in the first place,
so there was never anything about them for `change_email` to break.

### The Concept

`"cust-1"` is a real, deliberate **domain model** decision: a stable
identifier standing in for the customer herself, independent of any fact
that can change about her. Once that's in place, `customer_orders` and
`customer_points` are naturally keyed by the thing that's actually
permanent — not because either feature's own code got smarter, but
because the model underneath both of them now reflects a fact that was
always true in the real world: a customer stays the same customer no
matter what her email happens to be today. This is the entire, general
argument for a domain model, demonstrated concretely instead of asserted
abstractly: code built directly on top of a convenient but incidental
attribute inherits every future change to that attribute as a potential
break, spread silently across every feature that made the identical
assumption independently. Code built on a model of the real, stable
concept doesn't.

### CS Lens

This is a direct instance of the same distinction Lesson 5's
`float`-versus-integer-cents example drew for a single value, now applied
to an entire concept: `"cust-1"` is chosen specifically because nothing
about the real world ever requires it to change, the same way integer
cents were chosen because they don't accumulate floating-point drift —
both are representation decisions made by asking what's actually stable
about the thing being modeled, not what's easiest to reach for today.

### SE Lens

Introducing `"cust-1"` cost real, upfront thought: someone has to decide
that a customer needs an identity independent of email, generate one,
and store it somewhere. That cost is real and worth naming honestly —
and it's paid exactly once, while the cost of *not* paying it compounds
with every new feature that independently keys its own data by email,
the way `customer_points` already did once, invisibly, before anyone
went looking.

---

## Connect the Pieces

One customer, one ordinary event, one missing concept:

1. **Modeled by convenience** — `customer_orders` and `customer_points`,
   both keyed by email, both correct until the email itself changes.
2. **The break, ordinary and silent** — `change_email` correctly updates
   one dict and has no way to know a second, independent one made the
   identical assumption; `120` points go missing with no error anywhere.
3. **Modeled by the real concept** — `"cust-1"`, a stable identity
   independent of email, makes both dicts survive the identical change
   without either one needing to know it happened.

## What Breaks Without This

Keep keying every new feature's data by whichever attribute is most
convenient at the time it's built — email today, maybe a phone number or
a username tomorrow — with no single, shared representation of the real
entity underneath all of them. Every individual feature works, checked
in isolation, exactly the way `customer_points` did before this lesson's
own change. The cost isn't visible in any one feature's own tests. It
shows up later, silently, exactly once a fact everyone assumed was
permanent turns out not to be — and by then, finding every place that
made the same assumption independently is Lesson 24's own traceability
problem, at a scale no single tag could have prevented if the model
itself was never built to survive the change in the first place.

## Exercises

1. Add a third feature — a customer's saved shipping addresses, also
   keyed by `customer_id` — and confirm, by running it, that
   `change_email` leaves it completely untouched, the same way it left
   orders and points untouched.
2. Name one other attribute, besides email, that a real system might be
   tempted to use as a customer's identity, and explain, in a sentence or
   two, a real, ordinary event that would break that assumption the way
   this lesson's email change did.
3. Look back at Lesson 2's `is_username_available`. Is a username a good
   candidate for a stable identity in this lesson's sense, or does it
   have the same problem email did? Justify your answer.

## Definition of Done

- [ ] You can define "domain model" in your own words, and explain the
      difference between modeling a real concept and modeling a
      convenient attribute.
- [ ] You've reproduced the real orphaned-points bug and confirmed the
      `customer_id`-based fix survives the identical email change.
- [ ] You've completed all three exercises.
- [ ] Commit the `customers`/`customer_orders`/`customer_points` model
      keyed by `customer_id`. Commit message should explain *why*: for
      example, `Lesson 40 — customer data now keyed by a stable
      customer_id instead of email, so an email change no longer
      silently orphans loyalty points.`
