---
series: database-design
level: 2
title: Normalisation — Eliminating Redundancy
lang: sql
---

# Normalisation — Eliminating Redundancy

Normalisation is the process of structuring a database schema to eliminate redundant data and prevent update anomalies. An update anomaly is a problem where changing one fact requires updating it in multiple places — and a bug occurs when those places fall out of sync. For example: if a customer's email is stored in both the `customers` table and in every row of the `orders` table, updating the email requires updating thousands of rows. Miss any of them and the data is inconsistent.

Normalisation is not about making schemas complicated. It is about making schemas correct — ensuring that each fact is stored in exactly one place, so that changing the fact requires exactly one update. By the end of this lesson you will understand the first three normal forms, how to apply them, and when to deliberately denormalise for performance.

## The unnormalised starting point

Start with a spreadsheet-like flat table containing all information about orders:

```text
FLAT ORDER TABLE (unnormalised):
  order_id | customer_name | customer_email     | product_name | product_price | quantity | order_date
  1        | Alice Smith   | alice@example.com  | Laptop       | 999.99        | 1        | 2024-01-15
  2        | Alice Smith   | alice@example.com  | Mouse        |  29.99        | 2        | 2024-01-15
  3        | Bob Jones     | bob@example.com    | Keyboard     |  79.99        | 1        | 2024-01-20
  4        | Alice Smith   | alice@example.com  | Laptop       | 999.99        | 1        | 2024-02-01

Problems:
  — Alice's email appears 3 times. To update it: find and update 3 rows.
    Miss one: inconsistent data.
  — Laptop's price appears twice. Correct it in one place, not the other: wrong reports.
  — If Alice's only order is deleted: her customer record is also deleted (deletion anomaly).
  — Cannot record a product without an order (insertion anomaly).
```

## First Normal Form (1NF): atomic values

**1NF rule:** every column contains atomic (indivisible) values. No repeating groups. No lists in a cell.

```text
VIOLATES 1NF:
  order_id | customer | products
  1        | Alice    | Laptop, Mouse, Keyboard

"products" contains multiple values — a list in one cell.
This makes it impossible to query for all orders containing "Laptop" without parsing text.

SATISFIES 1NF:
  order_id | customer | product
  1        | Alice    | Laptop
  2        | Alice    | Mouse
  3        | Alice    | Keyboard

Each row has one product. Querying for Laptop orders is now a simple WHERE clause.
The price of one more row is correct structure.
```

## Second Normal Form (2NF): no partial dependencies

**2NF rule:** every non-key column must depend on the ENTIRE primary key, not just part of it. (Applies only to tables with composite primary keys.)

```text
COMPOSITE PK TABLE: (order_id, product_id) is the PK.

  order_id | product_id | product_name | product_price | quantity
  1        | 101        | Laptop       | 999.99        | 1
  1        | 102        | Mouse        |  29.99        | 2
  2        | 101        | Laptop       | 999.99        | 1

PARTIAL DEPENDENCY: product_name and product_price depend ONLY on product_id (not on order_id).
  They are facts about the product, not about the specific order line.

UPDATE ANOMALY: if Laptop's price changes from 999.99 to 899.99, you must update every row
  where product_id = 101. Miss one: the data is inconsistent.

FIX: extract the product into its own table.
  products:    (product_id PK, product_name, product_price)
  order_items: (order_id FK, product_id FK, quantity) — only the order-specific columns remain
```

## Third Normal Form (3NF): no transitive dependencies

**3NF rule:** non-key columns must not depend on other non-key columns (only on the primary key).

```text
TABLE: orders
  order_id | customer_id | customer_email      | customer_city
  1        | 201         | alice@example.com   | New York
  2        | 202         | bob@example.com     | London
  3        | 201         | alice@example.com   | New York

TRANSITIVE DEPENDENCY: customer_email and customer_city depend on customer_id,
  not on order_id. They are facts about the customer, not the order.

UPDATE ANOMALY: if Alice moves cities, update every order row for customer 201.
  Miss one: inconsistent customer city.

FIX: extract customer information into its own table.
  customers: (customer_id PK, email, city)
  orders:    (order_id PK, customer_id FK, placed_at, status)
  — customers holds facts about customers; orders holds facts about orders.
```

```sql
-- The fully normalised result for the flat order table:

CREATE TABLE customers (
  id    INTEGER PRIMARY KEY,
  name  TEXT    NOT NULL,
  email TEXT    NOT NULL UNIQUE
);

CREATE TABLE products (
  id          INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  price_cents INTEGER NOT NULL
);

CREATE TABLE orders (
  id          INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  placed_at   TEXT    NOT NULL
);

CREATE TABLE order_items (
  order_id   INTEGER NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (order_id, product_id)
);
```

```text
Each fact is now stored in exactly one place:
  Customer's email:  once, in customers.email.
  Product's price:   once, in products.price_cents.
  Order's customer:  once, via the customer_id FK.
  Item quantity:     once, in order_items.quantity.

To update Alice's email: one UPDATE on one row in customers.
To update Laptop's price: one UPDATE on one row in products.
No inconsistency is possible because there is no redundancy.
```

**CS lens:** Normalisation was formalised by Edgar F. Codd (the inventor of the relational model) in 1972. Codd's insight was that database schemas should model the **functional dependencies** between attributes: if attribute B is determined by attribute A (knowing A tells you B), then A and B should be in a table where A (or a superset containing A) is the key. Violations of this rule produce the update anomalies. The normal forms are checkpoints in the process of eliminating each class of functional dependency violation, from most obvious (1NF) to most subtle (BCNF and beyond, which handle more exotic dependency patterns).

## When to denormalise

Normalisation is the correct baseline. Denormalisation — deliberately introducing redundancy — is a performance optimisation applied after the schema is proven correct.

```text
WHEN DENORMALISATION IS JUSTIFIED:
  — A JOIN between 4 large tables is too slow for a high-traffic report.
    Denormalise: add a computed column (e.g., total_usd in orders instead of summing order_items).
    Tradeoff: must keep the computed column in sync when order_items change.

  — A field is queried so frequently that the join cost dominates.
    Denormalise: copy customer_name into orders for display without a join.
    Tradeoff: customer_name must be updated in both places when the customer changes their name.

PROCESS:
  1. Start fully normalised.
  2. Measure query performance on realistic data.
  3. Identify specific queries that are too slow.
  4. Denormalise the minimum necessary to fix those queries.
  5. Add triggers or application logic to keep denormalised data in sync.

NEVER denormalise speculatively — you pay the sync cost immediately
but may never see the performance benefit if the query is rare.
```

**SE lens:** Premature denormalisation is one of the most common database design mistakes. Developers add computed columns and copied data because they imagine future performance problems, before any performance measurement has been done. The cost is immediate: keeping copied data in sync is extra code, extra bugs, and extra constraints. The benefit is hypothetical. Measure first. The relational model with proper indexing (next lesson) handles most workloads correctly without denormalisation.

**Common mistakes:**
- Normalising to an extreme — splitting data into so many tables that every query requires 6 joins is over-normalisation. The goal is eliminating update anomalies, not maximising the number of tables. Stop at 3NF for most applications.
- Confusing normalisation with performance — normalisation is about correctness (no redundancy). Performance is about indexing. A poorly indexed, normalised schema can be slow. A well-indexed, normalised schema is fast. Fix performance with indexes, not denormalisation.
- Adding computed columns without triggers — `total_usd` in the orders table must be updated when order_items change. Without a trigger or application enforcement, it will drift out of sync immediately.

**Debug tip:** When a query returns stale or inconsistent data (e.g., an order total that does not match the sum of its items), the schema has redundant data that is out of sync. Find where the same fact is stored more than once, identify the last time each copy was updated, and determine which write missed a copy. The fix is to normalise the redundancy away, then add a migration to correct the inconsistent rows.

## Challenge: normalise_schema

Identify the normal form violations in this schema and describe the fix.

```challenge
// This flat table stores employee salary information:
// employees: (emp_id, emp_name, dept_id, dept_name, dept_manager_name, salary, bonus_pct)
// 
// dept_name and dept_manager_name depend only on dept_id, not on emp_id.
// bonus_pct is always 0.10 for dept_id=1, 0.15 for dept_id=2, 0.12 for dept_id=3.

const normalisationAnalysis = {
  // Which normal form is violated?
  normalFormViolated: '',    // '1NF', '2NF', or '3NF'

  // What type of dependency causes the violation?
  dependencyType: '',        // 'partial dependency' or 'transitive dependency'

  // Which columns should move to their own table?
  columnsToExtract: [],      // array of column name strings

  // What should the new extracted table be called?
  newTableName: '',

  // After the fix, what is the primary key of the new table?
  newTablePK: '',
}
```

```test
const n = normalisationAnalysis
assert n.normalFormViolated === '3NF'
assert n.dependencyType === 'transitive dependency'
const cols = n.columnsToExtract.map(c => c.toLowerCase())
assert cols.includes('dept_name') || cols.includes('dept_name'.toLowerCase())
assert cols.some(c => c.includes('manager') || c.includes('bonus'))
assert n.newTableName.toLowerCase().includes('dept')
assert n.newTablePK.toLowerCase().includes('dept_id') || n.newTablePK.toLowerCase() === 'id'
```
