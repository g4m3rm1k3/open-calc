---
concept: 133-normalization
name: Normalization
---

## Definition

Normalization is organizing relational data to minimize redundancy —
splitting information into separate tables connected by references (foreign
keys), instead of repeating the same data across many rows.

## Problem

Storing a customer's full name and address on EVERY order row they place
duplicates that same information across potentially hundreds of rows —
updating their address means updating every single duplicated copy, and
missing even one leaves inconsistent data. Normalization stores the
customer's data ONCE, in its own table, and has order rows reference it by
ID instead of repeating it.

## Execution

Unnormalized: an orders table has columns [order_id, customer_name,
customer_address, item]
↓
Customer "Alice" places 3 orders — her name and address are repeated
identically in all 3 rows
↓
Alice moves — her address must be updated in ALL 3 rows; missing even one
leaves stale, inconsistent data
↓
Normalized: a separate customers table [customer_id, name, address], and
orders becomes [order_id, customer_id, item]
↓
Alice's address now lives in exactly ONE row — updating it once
automatically reflects correctly for all her orders, since they only
reference her customer_id

## Computer Science

Normalization follows a series of formal "normal forms" (1NF, 2NF, 3NF, and
beyond), each eliminating a specific category of redundancy — the
underlying principle throughout all of them is that each fact should be
stored in exactly one place, with everything else referencing it rather
than repeating it.

Tags: Normal forms, Redundancy elimination, Foreign keys, Referential integrity

## Software Engineering

Normalization isn't free — looking up a complete order's details now
requires JOINing the orders and customers tables back together, trading
write-simplicity (update one place) for read-complexity (must reassemble
related data). Denormalization (deliberately reintroducing some redundancy)
is sometimes chosen specifically to speed up frequent reads at the cost of
update complexity.

Tags: Denormalization, Read vs write tradeoffs, Query complexity

## Common Mistakes

- Storing the same piece of information in multiple places "for convenience" and then forgetting to update all copies when it changes — this is exactly the inconsistency normalization exists to prevent.
- Over-normalizing to the point that even simple queries require many table joins — there's a genuine complexity cost to normalization, and some deliberate denormalization is a reasonable, common trade-off for read-heavy workloads.

## Exercises

- Take a flat table of [student_id, student_name, course_name, course_credits], where each student can be enrolled in multiple courses, and split it into properly normalized students/courses/enrollments tables.
- Identify what breaks if a student's name is updated in an unnormalized table with multiple rows per student, versus a normalized one where the name lives in exactly one row.

## javascript

```javascript
// Unnormalized: customer info repeated in every order row
const unnormalizedOrders = [
  { orderId: 1, customerName: 'Alice', customerAddress: '1 Main St', item: 'Book' },
  { orderId: 2, customerName: 'Alice', customerAddress: '1 Main St', item: 'Pen' },
]

// Normalized: customer info lives once, orders reference it by id
const customers = { 1: { name: 'Alice', address: '1 Main St' } }
const normalizedOrders = [
  { orderId: 1, customerId: 1, item: 'Book' },
  { orderId: 2, customerId: 1, item: 'Pen' },
]

// Updating Alice's address: unnormalized requires updating EVERY matching row
unnormalizedOrders.forEach(o => { if (o.customerName === 'Alice') o.customerAddress = '2 Oak Ave' })
// Normalized: update happens in exactly ONE place
customers[1].address = '2 Oak Ave'

console.log(unnormalizedOrders.every(o => o.customerAddress === '2 Oak Ave'))   // true -- but required updating 2 rows
console.log(customers[1].address)   // '2 Oak Ave' -- required updating exactly 1 row, reflected everywhere via the reference
```
Walkthrough: the unnormalized version needed to update `customerAddress` on
every single matching order row. The normalized version stores the address
once in `customers`, and every order simply references `customerId` — one
update there is automatically "seen" by every order referencing that
customer, without touching the orders at all.

## python

```python
# Unnormalized: customer info repeated in every order row
unnormalized_orders = [
    {'order_id': 1, 'customer_name': 'Alice', 'customer_address': '1 Main St', 'item': 'Book'},
    {'order_id': 2, 'customer_name': 'Alice', 'customer_address': '1 Main St', 'item': 'Pen'},
]

# Normalized: customer info lives once, orders reference it by id
customers = {1: {'name': 'Alice', 'address': '1 Main St'}}
normalized_orders = [
    {'order_id': 1, 'customer_id': 1, 'item': 'Book'},
    {'order_id': 2, 'customer_id': 1, 'item': 'Pen'},
]

# Updating Alice's address: unnormalized requires updating EVERY matching row
for o in unnormalized_orders:
    if o['customer_name'] == 'Alice':
        o['customer_address'] = '2 Oak Ave'
# Normalized: update happens in exactly ONE place
customers[1]['address'] = '2 Oak Ave'

print(all(o['customer_address'] == '2 Oak Ave' for o in unnormalized_orders))   # True -- but required updating 2 rows
print(customers[1]['address'])   # '2 Oak Ave' -- required updating exactly 1 row, reflected everywhere via the reference
```
Walkthrough: identical redundancy-vs-single-source-of-truth mechanics as the
JavaScript version — normalization moves the update burden from "every
duplicated row" to "exactly one row," with everything else referencing it.
