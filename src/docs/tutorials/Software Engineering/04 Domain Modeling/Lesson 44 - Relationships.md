# Lesson 44: Relationships

**What you will build.** Two real relationships in the same catalog: an
order correctly belonging to exactly one customer, and a product
incorrectly forced to belong to exactly one category — a real product
that's genuinely both electronics and an office supply, modeled with a
single `category_id` field that can only ever hold one of those truths at
a time. Assigning the second category doesn't add to the first; it
silently erases it. You'll fix it by recognizing the relationship's real
shape was never what the field assumed.

**What you need to know first.** Lesson 43's identity and Lesson 41's
entity — this lesson connects two or more entities together, and asks
precisely how many of one can legitimately relate to how many of another.

**Terms introduced in this lesson**

- **relationship cardinality** — how many instances of one entity can
  legitimately relate to how many instances of another: **one-to-one** (a
  passport belongs to exactly one person, and vice versa), **one-to-many**
  (one customer has many orders, but each order belongs to exactly one
  customer), and **many-to-many** (a product can belong to several
  categories, and a category can contain several products, with no limit
  on either side). The word "cardinality" names the real, checkable
  question a domain model has to answer honestly for every relationship
  it represents: assuming the wrong one is a real, common modeling
  mistake, not just an implementation detail — full treatment of exactly
  this mistake, its general shape, and a deeper resolution technique
  beyond what this lesson builds, lives in
  `many-to-many-modeled-as-one-to-one.md`.

**Objects and methods used.** `dict.items()`, first appearance in this
curriculum: returns an iterable of `(key, value)` pairs from a dict,
given full treatment where it's used below.

Pipeline: this lesson continues in the *Domain model* stage, restated per
Lesson 40's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: One Customer, Many Orders

### The Problem

Represent the relationship between customers and their orders: each
order belongs to exactly one customer; a customer can place many orders.

### The Code, Run for Real

```python
customers = {"cust-1": {"email": "alice@example.com"}}
orders = {
    "order-1": {"customer_id": "cust-1", "total": 42.00},
    "order-2": {"customer_id": "cust-1", "total": 15.50},
}

def orders_for_customer(customer_id):
    return [order_id for order_id, order in orders.items() if order["customer_id"] == customer_id]
```

Run it:

```python
print(orders_for_customer("cust-1"))
```

Running it:

```text
$ python catalog.py
['order-1', 'order-2']
```

Each order stores exactly one `customer_id`, correctly reflecting that an
order can only ever belong to one customer — a real **one-to-many**
relationship, one customer to many orders, represented honestly by a
single field on the "many" side.

### Mechanical Walkthrough

- `orders.items()` — given full treatment above: yields each
  `(order_id, order)` pair, letting the comprehension check `order["customer_id"]`
  while still keeping `order_id` available to include in the result.
- `order["customer_id"] == customer_id` — already-assumed dict access and
  equality; this is the entire relationship, expressed as a single,
  honest comparison — no field anywhere claims an order could belong to
  more than one customer, because it never can.

### CS Lens

A single foreign-key-style field — `customer_id` on `order` — correctly
models a one-to-many relationship precisely because the cardinality is
honestly one on the referencing side: each order really does have
exactly one customer to point to.

### SE Lens

This works cleanly because the real-world relationship actually matches
what a single field can represent. The next unit shows what happens when
that match is assumed rather than checked.

---

## Concept Unit: One Field, Pretending a Product Has Only One Category

### The Problem

Add categories to the product catalog from Lesson 43. A product belongs
to a category — model it the same way an order belongs to a customer, a
single field.

### The Code, Run for Real

```python
products = {}

def add_product(product_id, name, category_id):
    products[product_id] = {"name": name, "category_id": category_id}

add_product("prod-1", "Wireless Mouse", "electronics")
```

A wireless mouse is genuinely, validly *both* electronics and an office
supply — not a replacement fact, an additional one. Add the second
category the same way the field seems to invite:

```python
products["prod-1"]["category_id"] = "office-supplies"

print(products["prod-1"])
print("still listed under electronics?", products["prod-1"]["category_id"] == "electronics")
```

Running it:

```text
$ python catalog.py
{'name': 'Wireless Mouse', 'category_id': 'office-supplies'}
still listed under electronics? False
```

The mouse isn't newly *also* in office supplies — it's now *only* in
office supplies. `category_id` can only ever hold one value, so the
second, equally true category didn't add to the first; it silently
replaced it, and electronics quietly lost a real product it should still
contain.

### The Concept

This is exactly the mistake `many-to-many-modeled-as-one-to-one.md`
names in full: a single field can only ever represent a one-to-one or
one-to-many relationship honestly. A product-to-category relationship
is genuinely **many-to-many** — many products per category, many
categories per product — and no single field on either side can hold
that truth, no matter which side it's placed on. Fix it by giving the
relationship the shape it actually has:

```python
def add_product(product_id, name, category_ids):
    products[product_id] = {"name": name, "category_ids": set(category_ids)}

add_product("prod-1", "Wireless Mouse", {"electronics"})
products["prod-1"]["category_ids"].add("office-supplies")

print(products["prod-1"])
print("still listed under electronics?", "electronics" in products["prod-1"]["category_ids"])
print("also listed under office-supplies?", "office-supplies" in products["prod-1"]["category_ids"])
```

Running it:

```text
$ python catalog.py
{'name': 'Wireless Mouse', 'category_ids': {'office-supplies', 'electronics'}}
still listed under electronics? True
also listed under office-supplies? True
```

Both categories now hold at once, correctly — `category_ids`, a `set`,
can represent as many simultaneous relationships as the real product
actually has, instead of silently limiting it to one.

### Mechanical Walkthrough

- `category_id` versus `category_ids` — already-assumed naming; the
  singular-versus-plural distinction here isn't cosmetic, it's the entire
  cardinality claim a field's own name should honestly signal.
- `set(category_ids)` and `.add("office-supplies")` — already-assumed
  `set` construction and mutation from earlier lessons; correctly models
  "any number of categories" without duplicating a category if the same
  one were added twice.

### CS Lens

`many-to-many-modeled-as-one-to-one.md` names this precisely as a
**cardinality mistake** — modeling a relationship's real multiplicity
incorrectly — and goes further than this lesson does: it shows a second,
deeper resolution for cases where the relationship shouldn't be *stored*
at all, only checked on demand as a one-off question, discarded
immediately after — a real, different fix from simply widening a field to
a set. Read it for that fuller picture; this lesson's own fix (a `set`
of category IDs) is the more common, more directly applicable correction
for a relationship, like this one, that genuinely does need to be stored
and queried repeatedly.

### SE Lens

The real cost of the original mistake wasn't visible in `add_product`'s
own code — it looked identical to `orders_for_customer`'s honest
one-to-many field, and worked identically right up until a product
needed a second, simultaneously true category. Catching a cardinality
mistake early means asking, for every relationship a domain model
represents, whether "one" is actually true on each side — not assuming a
single field is safe just because it compiles and runs correctly on the
first example anyone happens to try.

---

## Connect the Pieces

Two relationships, one honestly one-to-many, one wrongly modeled as such:

1. **Genuinely one-to-many, correctly modeled** — `order.customer_id`, a
   single field, honestly represents that each order has exactly one
   customer.
2. **Genuinely many-to-many, wrongly modeled as one-to-one** —
   `product.category_id` can only hold one category, silently erasing a
   product's first category the moment a second, equally real one is
   assigned.
3. **Fixed by matching the field's shape to the relationship's real
   shape** — `category_ids`, a `set`, correctly holds every category a
   product genuinely belongs to at once.

## What Breaks Without This

Ship the catalog with `category_id` as a single field, reasoning that
"a product has a category" sounds like a one-to-one fact. Every product
that genuinely belongs to only one category works fine, forever. The
first real product that needs two — and most real catalogs eventually
have several — silently loses whichever category was assigned first,
with no error, no warning, and a browse-by-category page that quietly
stops showing a product it should.

## Exercises

1. Add a third category to `"prod-1"` and confirm, with real output, that
   all three categories hold simultaneously.
2. Model the reverse direction: given `category_ids` stored per product,
   write `products_in_category(category_id)` that returns every product
   belonging to a given category — the many-to-many relationship, queried
   from the other side.
3. Read `many-to-many-modeled-as-one-to-one.md` in full and explain, in a
   few sentences, when its "ephemeral question, never stored" resolution
   would be the better fix instead of this lesson's `set`-based one.

## Definition of Done

- [ ] You can name the three relationship cardinalities and give a real
      example of each, distinct from this lesson's own.
- [ ] You've reproduced the real category-loss bug and confirmed the
      `set`-based fix holds multiple categories at once.
- [ ] You've read `many-to-many-modeled-as-one-to-one.md` and completed
      all three exercises.
- [ ] Commit the `category_ids`-based `add_product`. Commit message
      should explain *why*: for example, `Lesson 44 — products now store
      a set of category_ids instead of a single category_id, correctly
      modeling a genuinely many-to-many relationship.`
