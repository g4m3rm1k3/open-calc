const lesson = {
  id: "sql-0-028",
  slug: "common-patterns",
  chapter: "sql-0",
  order: 28,
  title: "Common SQL Patterns",
  subtitle: "Recipes every SQL practitioner needs",
  tags: [
    "sql",
    "patterns",
    "pagination",
    "deduplication",
    "upsert",
    "running totals",
    "gaps",
    "pivot",
  ],
  aliases: [
    "sql pagination",
    "sql deduplication",
    "sql upsert",
    "sql running total",
    "sql gaps in sequences",
    "sql pivot crosstab",
    "insert or replace sqlite",
  ],

  hook: `You've mastered the SQL building blocks.
Now for the patterns that come up again and again in real systems:
pagination for APIs, deduplication for messy data, upsert for sync workflows,
and pivoting rows to columns for reports.
These aren't tricks — they're the everyday vocabulary of production SQL.`,

  mentalModel: [
    "Pagination: LIMIT/OFFSET for simplicity; keyset pagination for large datasets.",
    "Deduplication: ROW_NUMBER() + CTE to keep exactly one row per group.",
    "Upsert: INSERT OR REPLACE / INSERT OR IGNORE for safe insert-or-update logic.",
    "Gaps in sequences: self-join or generate a number series, then LEFT JOIN to find missing values.",
    "Pivot/crosstab: conditional aggregation with SUM(CASE WHEN ...) per column.",
  ],

  intuition: {
    prose: [
      "**Pagination with LIMIT/OFFSET.** `LIMIT 10 OFFSET 20` skips the first 20 rows and returns the next 10. This is simple and works well for small datasets. The problem: as `OFFSET` grows, the database scans from the beginning each time. For page 1000 of 10-row pages, the DB scans 10,000 rows to discard most of them.",
      "**Keyset pagination (seek method).** Instead of OFFSET, remember the last value you saw. `WHERE id > 1000 ORDER BY id LIMIT 10` — this jumps directly to row 1001 via the index, regardless of how far into the result set you are. Much faster for large tables. Requires a stable sort key (like an auto-increment id).",
      "**Deduplication: keep the best row per group.** Your orders table has duplicate rows for the same customer on the same day (ETL bug). Use `ROW_NUMBER() OVER (PARTITION BY customer_id, order_date ORDER BY id)` to number duplicates, then delete/filter rows where `rn > 1`.",
      "**Upsert: insert or update depending on existence.** In SQLite: `INSERT OR REPLACE` deletes the existing row and inserts a new one (resetting auto-incremented fields). `INSERT OR IGNORE` skips the insert if a conflict occurs. Standard SQL uses `INSERT ... ON CONFLICT DO UPDATE` (SQLite 3.24+).",
      "**Finding gaps in sequences.** You have order IDs that should be consecutive but some are missing (deleted or failed). Generate a complete series (using a recursive CTE), then LEFT JOIN against your actual data. Rows where the actual ID is NULL are the gaps.",
      "**Pivot / crosstab.** Rows-to-columns transformation. You have one row per (month, category, sales) and want one row per month with columns for each category. Use conditional aggregation: `SUM(CASE WHEN category = 'Electronics' THEN sales END) AS electronics_sales`. No special PIVOT keyword needed in SQLite.",
    ],
    callouts: [
      {
        type: "warning",
        title: "INSERT OR REPLACE resets auto-increment IDs",
        body: "In SQLite, `INSERT OR REPLACE` deletes the old row and inserts a new one. This means any auto-generated `rowid`/primary key changes, and any foreign keys pointing to the old row become dangling (or trigger a cascade). Prefer `INSERT INTO ... ON CONFLICT(col) DO UPDATE SET col = excluded.col` (requires SQLite 3.24+) to update in place without changing the PK.",
      },
      {
        type: "insight",
        title: "These patterns compose",
        body: "Real queries often combine multiple patterns. A dashboard query might: deduplicate input data (ROW_NUMBER CTE), pivot results (conditional aggregation), and then paginate (LIMIT/OFFSET). Each pattern is a building block. Combine them step by step — build the inner CTE first, verify it, then add the outer transformation.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Setup: events and sales data",
              setup: true,
              sql: `CREATE TABLE events (
  event_id  INTEGER PRIMARY KEY,
  user_id   INTEGER,
  event_type TEXT,
  created_at TEXT
);
CREATE TABLE sales (
  id       INTEGER PRIMARY KEY,
  month    TEXT,
  category TEXT,
  amount   REAL
);
CREATE TABLE inventory (
  item_id INTEGER PRIMARY KEY,
  name    TEXT
);

-- Insert events with some duplicates
INSERT INTO events VALUES
  (1, 1, 'signup',   '2024-01-01'),
  (2, 1, 'purchase', '2024-01-05'),
  (3, 2, 'signup',   '2024-01-02'),
  (4, 1, 'purchase', '2024-01-05'),  -- duplicate of id=2
  (5, 3, 'signup',   '2024-01-10'),
  (6, 2, 'purchase', '2024-01-15'),
  (7, 3, 'purchase', '2024-01-20');

-- Sales data for pivot
INSERT INTO sales VALUES
  (1,'2024-01','Electronics',500),(2,'2024-01','Peripherals',120),
  (3,'2024-01','Displays',300),   (4,'2024-02','Electronics',750),
  (5,'2024-02','Peripherals',90), (6,'2024-02','Displays',200),
  (7,'2024-03','Electronics',600),(8,'2024-03','Peripherals',180);

-- Inventory with gaps in item_id sequence
INSERT INTO inventory VALUES (1,'Laptop'),(2,'Mouse'),(5,'Monitor'),(6,'Hub'),(10,'Keyboard');

SELECT 'events:', COUNT(*) FROM events
UNION ALL SELECT 'sales:', COUNT(*) FROM sales
UNION ALL SELECT 'inventory:', COUNT(*) FROM inventory;`,
            },
            {
              id: "q1",
              label: "Pattern 1: Pagination with LIMIT/OFFSET",
              sql: `-- Page 1: rows 1-3
SELECT event_id, user_id, event_type, created_at
FROM events
ORDER BY event_id
LIMIT 3 OFFSET 0;
-- Change OFFSET to 3 for page 2, 6 for page 3, etc.`,
            },
            {
              id: "q2",
              label: "Pattern 2: Deduplication with ROW_NUMBER",
              sql: `-- Find duplicate events (same user, type, and date)
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, event_type, created_at
      ORDER BY event_id
    ) AS rn
  FROM events
)
-- See which would be deleted (rn > 1 = duplicates):
SELECT event_id, user_id, event_type, created_at, rn
FROM ranked
ORDER BY user_id, event_type, created_at;
-- In production: DELETE FROM events WHERE event_id IN (SELECT event_id FROM ranked WHERE rn > 1)`,
            },
            {
              id: "q3",
              label: "Pattern 3: Upsert with ON CONFLICT",
              sql: `CREATE TABLE user_settings (
  user_id   INTEGER PRIMARY KEY,
  theme     TEXT    NOT NULL DEFAULT 'light',
  font_size INTEGER NOT NULL DEFAULT 14
);

-- First insert:
INSERT INTO user_settings (user_id, theme, font_size) VALUES (1, 'dark', 16);

-- Upsert: update if exists, insert if not (SQLite 3.24+)
INSERT INTO user_settings (user_id, theme, font_size) VALUES (1, 'solarized', 18)
ON CONFLICT(user_id) DO UPDATE SET
  theme     = excluded.theme,
  font_size = excluded.font_size;

-- Also insert a new user in same statement:
INSERT INTO user_settings (user_id, theme, font_size) VALUES (2, 'light', 14)
ON CONFLICT(user_id) DO UPDATE SET
  theme     = excluded.theme,
  font_size = excluded.font_size;

SELECT * FROM user_settings;`,
            },
            {
              id: "q4",
              label: "Pattern 4: Find gaps in sequence",
              sql: `-- Generate a series from 1 to 10 using recursive CTE
WITH RECURSIVE series(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM series WHERE n < 10
)
-- LEFT JOIN against actual data; NULLs = gaps
SELECT s.n AS expected_id, i.item_id, i.name
FROM series s
LEFT JOIN inventory i ON s.n = i.item_id
WHERE i.item_id IS NULL;  -- only show gaps`,
            },
            {
              id: "q5",
              label: "Pattern 5: Pivot rows to columns",
              sql: `-- Conditional aggregation pivot
-- Input: one row per (month, category, amount)
-- Output: one row per month, one column per category
SELECT
  month,
  ROUND(SUM(CASE WHEN category = 'Electronics' THEN amount ELSE 0 END), 2) AS electronics,
  ROUND(SUM(CASE WHEN category = 'Peripherals' THEN amount ELSE 0 END), 2) AS peripherals,
  ROUND(SUM(CASE WHEN category = 'Displays'    THEN amount ELSE 0 END), 2) AS displays,
  ROUND(SUM(amount), 2) AS total
FROM sales
GROUP BY month
ORDER BY month;`,
            },
            {
              id: "challenge",
              label: "Your turn: keyset pagination",
              sql: `-- Write a keyset pagination query on the events table.
-- Return the 3 events with event_id > 3, ordered by event_id ascending.
-- (This simulates "give me the next page after event_id=3")

-- Write your query here:
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Keyset pagination vs OFFSET trade-offs.** Keyset pagination requires a stable, indexed column to use as the cursor. It doesn't support 'jump to page 50' — you must scroll from the beginning. For UIs that show numbered pages, OFFSET is simpler. For infinite scroll or API cursors (like `?after=1000`), keyset is far more efficient and consistent (OFFSET results shift if rows are inserted/deleted between pages).",
      "**INSERT OR REPLACE vs INSERT OR IGNORE vs ON CONFLICT DO UPDATE.** `INSERT OR IGNORE` skips any conflicting row entirely — no update happens. `INSERT OR REPLACE` deletes and re-inserts (PK changes). `ON CONFLICT DO UPDATE` (upsert, since SQLite 3.24) modifies only specified columns in place — the PK stays, no cascading delete happens. Always prefer `ON CONFLICT DO UPDATE` for upserts that need to preserve foreign key references.",
    ],
    callouts: [
      {
        type: "definition",
        title: "excluded pseudo-table in ON CONFLICT",
        body: "Inside `ON CONFLICT DO UPDATE SET`, `excluded` refers to the row that was proposed for insertion (but conflicted). `excluded.theme` is the theme value from the attempted INSERT. This lets you write merge logic: `SET theme = excluded.theme` takes the new value; `SET count = count + excluded.count` accumulates.",
      },
    ],
  },

  examples: [
    {
      title: "Running total with window function",
      body: `-- Running cumulative sum of sales by date
SELECT
  order_date,
  daily_total,
  SUM(daily_total) OVER (ORDER BY order_date
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
    AS running_total
FROM (
  SELECT order_date, SUM(amount) AS daily_total
  FROM orders
  GROUP BY order_date
) daily
ORDER BY order_date;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-028-q1",
        type: "choice",
        text: "Why is keyset pagination more efficient than LIMIT/OFFSET for large datasets?",
        options: [
          "Keyset uses more memory to cache results",
          "Keyset jumps directly to the cursor position via an index, while OFFSET scans from the beginning",
          "LIMIT/OFFSET doesn't work with ORDER BY",
          "Keyset pagination requires fewer rows to be stored in the database",
        ],
        answer:
          "Keyset jumps directly to the cursor position via an index, while OFFSET scans from the beginning",
      },
      {
        id: "sql0-028-q2",
        type: "choice",
        text: "What does INSERT OR IGNORE do when a UNIQUE constraint conflict occurs?",
        options: [
          "Updates the existing row with the new values",
          "Raises an error and rolls back",
          "Skips the insert silently without modifying the existing row",
          "Deletes the old row and inserts the new one",
        ],
        answer: "Skips the insert silently without modifying the existing row",
      },
      {
        id: "sql0-028-q3",
        type: "choice",
        text: "What technique is used to pivot rows into columns in SQLite (which has no PIVOT keyword)?",
        options: [
          "TRANSPOSE() function",
          "CROSSTAB() extension",
          "Conditional aggregation: SUM(CASE WHEN category = 'X' THEN amount END)",
          "PIVOT ... FOR ... IN syntax",
        ],
        answer:
          "Conditional aggregation: SUM(CASE WHEN category = 'X' THEN amount END)",
      },
    ],
  },
};

export default lesson;
