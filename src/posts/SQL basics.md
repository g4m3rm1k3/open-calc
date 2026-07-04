# Episode 1

## SQL basics for software engineering

### 1. What SQL is

SQL is a language for working with data in tables.

A table has rows and columns:

- **Row:** one record (one user, one order)
- **Column:** one field (name, email, total)

Example table `users`:

| id | name   | age |
|----|--------|-----|
| 1  | Alice  | 25  |
| 2  | Michael| 32  |

SQL lets you ask questions about these tables.

---

### 2. Selecting data

Goal: get all users older than 30.

```sql
SELECT *
FROM users
WHERE age > 30;
```

Line by line:

- `SELECT *` → choose all columns
- `FROM users` → use the `users` table
- `WHERE age > 30` → keep rows where `age` is greater than 30

Result:

| id | name    | age |
|----|---------|-----|
| 2  | Michael | 32  |

---

### 3. Choosing specific columns

Goal: get only names of users older than 30.

```sql
SELECT name
FROM users
WHERE age > 30;
```

Now the result is:

| name    |
|---------|
| Michael |

You control the shape of the output with `SELECT`.

---

### 4. Joining tables

Two tables:

`users`:

| id | name    |
|----|---------|
| 1  | Alice   |
| 2  | Michael |

`orders`:

| id | user_id | total |
|----|---------|-------|
| 10 | 2       | 50    |
| 11 | 2       | 30    |
| 12 | 1       | 20    |

Goal: get each user’s orders.

```sql
SELECT users.name, orders.total
FROM users
JOIN orders ON users.id = orders.user_id;
```

Line by line:

- `FROM users` → start with `users`
- `JOIN orders ON users.id = orders.user_id` → pair each user with matching orders
- `SELECT users.name, orders.total` → output name and order total

Result:

| name    | total |
|---------|-------|
| Michael | 50    |
| Michael | 30    |
| Alice   | 20    |

This is how you connect related data.

---

### 5. Why this matters for software engineering

Every backend framework eventually sends SQL to the database.

If you understand:

- `SELECT` → shape of output  
- `FROM` → source table  
- `WHERE` → filters  
- `JOIN` → relationships  

you can:

- reason about performance  
- design better data models  
- debug slow queries  
- understand what your ORM is doing  

