---
series: database-design
level: 4
title: Querying Across Tables — Joins
lang: sql
---

# Querying Across Tables — Joins

Normalisation stores each fact in exactly one place. Joins are the mechanism for reassembling that normalised data into the shape needed by a query. A join combines rows from two or more tables based on a matching condition, producing a result that contains columns from all joined tables.

Joins are where the relational model pays off: because data is normalised, any combination of facts can be retrieved with a query. You do not need to choose at design time which facts will be viewed together — you choose at query time. By the end of this lesson you will understand the four join types, how to write multi-table joins, and how to use aggregation to summarise joined results.

## INNER JOIN: rows that match in both tables

An INNER JOIN returns only rows where the join condition is satisfied in BOTH tables. Rows in either table with no match are excluded.

```sql
-- Schema:
-- customers(id, name, email)
-- orders(id, customer_id, placed_at, status, total_cents)

-- Get all orders with the customer's name and email:
SELECT
  orders.id       AS order_id,
  customers.name  AS customer_name,
  customers.email AS customer_email,
  orders.status,
  orders.total_cents
FROM orders
INNER JOIN customers ON orders.customer_id = customers.id;
```

```text
INNER JOIN trace (sample data):

customers:                orders:
id | name    | email      id | customer_id | status  | total_cents
1  | Alice   | a@ex.com   1  | 1           | paid    | 9999
2  | Bob     | b@ex.com   2  | 1           | pending | 2999
3  | Carol   | c@ex.com   3  | 2           | paid    | 5999
                           (no orders for customer 3)

INNER JOIN result (ON orders.customer_id = customers.id):
order_id | customer_name | customer_email | status  | total_cents
1        | Alice         | a@ex.com       | paid    | 9999
2        | Alice         | a@ex.com       | pending | 2999
3        | Bob           | b@ex.com       | paid    | 5999

Carol (customer 3) is EXCLUDED — she has no matching order.
Order rows are JOINED with their corresponding customer row.
```

## LEFT JOIN: all rows from the left table

A LEFT JOIN returns all rows from the LEFT table (the one in FROM), and matching rows from the right table. If no match exists in the right table, the right-side columns are NULL.

```sql
-- Get ALL customers, including those with no orders:
SELECT
  customers.name,
  customers.email,
  orders.id        AS order_id,
  orders.status
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id;
```

```text
LEFT JOIN result:
customer_name | email     | order_id | status
Alice         | a@ex.com  | 1        | paid
Alice         | a@ex.com  | 2        | pending
Bob           | b@ex.com  | 3        | paid
Carol         | c@ex.com  | NULL     | NULL     ← Carol has no orders; NULLs on the right

Carol IS included (she is in the left table — customers).
Her order columns are NULL because no matching order exists.

USE LEFT JOIN WHEN:
  "Show all X, and if Y exists for that X, show it."
  "Find all customers who have NOT placed an order" → WHERE orders.id IS NULL after LEFT JOIN.
```

```sql
-- Find customers who have never placed an order:
SELECT customers.name
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
WHERE orders.id IS NULL;
-- WHERE orders.id IS NULL: keep only rows where no order matched (Carol's row)
-- Result: Carol
```

## Multi-table joins

Join three or more tables by chaining join conditions. Each JOIN adds another table to the result.

```sql
-- Schema (adding order_items and products):
-- order_items(order_id, product_id, quantity)
-- products(id, name, price_cents)

-- Get all orders with their line items and product names:
SELECT
  orders.id                AS order_id,
  customers.name           AS customer,
  products.name            AS product,
  order_items.quantity,
  products.price_cents * order_items.quantity AS line_total_cents
FROM orders
INNER JOIN customers   ON orders.customer_id     = customers.id
INNER JOIN order_items ON order_items.order_id   = orders.id
INNER JOIN products    ON order_items.product_id = products.id
WHERE orders.status = 'paid';
```

```text
Reading multi-table joins:
  Start with FROM orders — this is the anchor table.
  Each JOIN adds more columns from the new table.
  The ON clause specifies which columns connect the tables.

  orders → customers: orders.customer_id matches customers.id
  orders → order_items: order_items.order_id matches orders.id
  order_items → products: order_items.product_id matches products.id

The result contains columns from all four tables for every matching combination.
```

## Aggregation with joins: GROUP BY

GROUP BY collapses multiple rows with the same value in a column into one summary row, applying aggregate functions (COUNT, SUM, AVG, MAX, MIN) to each group.

```sql
-- Total order value per customer (only paid orders):
SELECT
  customers.name,
  COUNT(orders.id)         AS order_count,
  SUM(orders.total_cents)  AS total_spent_cents
FROM customers
INNER JOIN orders ON customers.id = orders.customer_id
WHERE orders.status = 'paid'
GROUP BY customers.id, customers.name
ORDER BY total_spent_cents DESC;
```

```text
GROUP BY trace (with two paid orders for Alice: 9999 + 2999; one for Bob: 5999):

  Without GROUP BY:
    Alice | 9999   (order 1)
    Alice | 2999   (order 2)
    Bob   | 5999   (order 3)

  With GROUP BY customers.id:
    Alice group: two rows → COUNT = 2, SUM = 12998
    Bob group:   one row  → COUNT = 1, SUM = 5999

  Result:
    name  | order_count | total_spent_cents
    Alice | 2           | 12998
    Bob   | 1           | 5999
```

```sql
-- HAVING: filter GROUP BY results (like WHERE but for aggregated values)
-- Customers who have spent more than $100 total:
SELECT
  customers.name,
  SUM(orders.total_cents) AS total_cents
FROM customers
INNER JOIN orders ON customers.id = orders.customer_id
GROUP BY customers.id, customers.name
HAVING SUM(orders.total_cents) > 10000;
-- WHERE filters rows before grouping; HAVING filters groups after aggregation.
```

**CS lens:** The execution order of a SQL query is not the textual order. The logical order is: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. The database applies each step in this order, not the order the clauses appear in the SQL text. Understanding this order explains why you cannot use a SELECT alias in a WHERE clause (WHERE runs before SELECT), and why HAVING must reference aggregates while WHERE cannot — HAVING runs after GROUP BY, WHERE runs before it.

**SE lens:** The most common SQL performance issue is using a query that returns too many rows and filtering them in application code, rather than using WHERE, JOIN, GROUP BY, and HAVING to filter in the database. "Fetch all orders, then filter in JavaScript" is O(n) application-side work that should be O(1) database-side work. Always push filtering, aggregation, and sorting into the SQL query — the database can use indexes for WHERE, and aggregation in SQL requires transferring far less data across the network than filtering after fetching.

**Common mistakes:**
- Using INNER JOIN when LEFT JOIN is needed — if some rows in the left table have no matches and you need to include them anyway, INNER JOIN silently drops them. Check: "do I need ALL rows from the left table?" If yes, LEFT JOIN.
- Forgetting to include non-aggregated columns in GROUP BY — `SELECT name, SUM(total)` without `GROUP BY name` is an error in most databases (undefined which name to show for each group).
- Confusing WHERE and HAVING — WHERE filters individual rows (before aggregation), HAVING filters groups (after aggregation). `HAVING count > 5` is valid; `WHERE count > 5` is not (count is not a column).

**Debug tip:** When a JOIN produces more rows than expected (duplicates), the join condition is not selective enough — two tables have a many-to-many relationship but the join treats it as one-to-many. Check: how many rows does each table have for the join key? If both tables have multiple rows for the same key, the join produces every combination. Add a more specific condition, or aggregate first.

## Challenge: write_join_queries

Write queries that combine data from multiple tables.

```text
Tables:
  authors(id, name, country)
  books(id, author_id, title, published_year, genre)
  reviews(id, book_id, rating, review_text)

Write each query as a SQL string assigned to the matching field below.
```

```challenge javascript
const queries = {
  // Query 1: Get all books with their author's name.
  // Columns: book_title, author_name
  query1: '',

  // Query 2: Get all authors and the number of books they have written.
  // Columns: author_name, book_count
  // Include authors with zero books (LEFT JOIN + COUNT).
  query2: '',

  // Query 3: Get the average rating per genre for genres with an average rating above 4.0.
  // Columns: genre, avg_rating (rounded to 2 decimal places)
  // Hint: JOIN books and reviews, GROUP BY genre, HAVING avg_rating > 4.0
  query3: '',
}
```

```test
const q = queries
assert q.query1.toUpperCase().includes('JOIN')
assert q.query1.toUpperCase().includes('AUTHOR')
assert q.query1.toUpperCase().includes('BOOK')
assert q.query2.toUpperCase().includes('LEFT') || q.query2.toUpperCase().includes('COUNT')
assert q.query2.toUpperCase().includes('GROUP BY')
assert q.query3.toUpperCase().includes('HAVING')
assert q.query3.toUpperCase().includes('AVG') || q.query3.toUpperCase().includes('ROUND')
assert q.query3.toUpperCase().includes('GENRE')
```
