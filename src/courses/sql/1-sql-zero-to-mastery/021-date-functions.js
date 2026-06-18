const lesson = {
  id: "sql-0-023",
  slug: "date-functions",
  chapter: "sql-0",
  order: 21,
  title: "Date and Time Functions",
  subtitle: "Work with dates, times, and intervals in SQLite",
  tags: [
    "sql",
    "date functions",
    "datetime",
    "strftime",
    "date arithmetic",
    "julianday",
  ],
  aliases: [
    "sql date functions",
    "sqlite date",
    "strftime sql",
    "date arithmetic sql",
  ],

  hook: `Dates are everywhere: order dates, hire dates, expiry dates, event timestamps.
But databases store them as text (in SQLite) or special date types.
Date functions let you extract year/month/day, compute differences,
add or subtract intervals, and filter by time ranges — all in pure SQL.`,

  mentalModel: [
    "SQLite stores dates as TEXT ('YYYY-MM-DD') or REAL (Julian day numbers) — there's no native date type.",
    "date() and datetime() return formatted date/time strings; strftime() gives flexible formatting.",
    "Date arithmetic uses modifiers: '+7 days', '-1 month', 'start of month', 'start of year'.",
    "julianday() converts to a continuous number (days since noon Nov 24, 4714 BC) enabling date subtraction.",
  ],

  intuition: {
    prose: [
      "**SQLite has no native date type.** Dates are stored as TEXT in ISO 8601 format (`'YYYY-MM-DD'`) or as real numbers (Julian day numbers). This is simpler than other databases but means you must use the date functions to interpret and manipulate them correctly.",
      "**date() and datetime() normalize inputs.** `date('now')` returns today's date as `'YYYY-MM-DD'`. `datetime('now')` returns `'YYYY-MM-DD HH:MM:SS'`. You can also pass a date string: `date('2024-01-15')` returns `'2024-01-15'` — validated and normalized.",
      "**strftime() formats dates any way you need.** `strftime('%Y', '2024-01-15')` returns `'2024'`. `strftime('%m', '2024-01-15')` returns `'01'`. Use `%Y-%m-%d` for ISO date, `%d/%m/%Y` for European format, `%H:%M` for just the time. It's SQL's equivalent of Python's `datetime.strftime()`.",
      "**Date modifiers shift dates in time.** Pass modifiers as additional arguments to `date()` or `datetime()`: `date('now', '+7 days')` → one week from today. `date('2024-01-31', '+1 month')` → 2024-02-29 or 2024-03-02. `date('2024-03-15', 'start of month')` → 2024-03-01. `date('now', 'start of year')` → January 1st this year.",
      "**julianday() enables date difference math.** Julian day numbers are continuous real numbers, so subtraction gives you the difference in days: `julianday('2024-12-31') - julianday('2024-01-01')` = 365. `ROUND(julianday('now') - julianday(hire_date))` = days employed.",
    ],
    callouts: [
      {
        type: "definition",
        title: "SQLite date/time functions",
        body: "**date(timestr [, modifier...])** → `'YYYY-MM-DD'`  \n**time(timestr [, modifier...])** → `'HH:MM:SS'`  \n**datetime(timestr [, modifier...])** → `'YYYY-MM-DD HH:MM:SS'`  \n**julianday(timestr [, modifier...])** → real number  \n**strftime(format, timestr [, modifier...])** → formatted string  \n\n**Common format codes:** `%Y` year, `%m` month (01-12), `%d` day (01-31), `%H` hour, `%M` minute, `%S` second, `%j` day of year, `%w` day of week (0=Sunday)",
      },
      {
        type: "insight",
        title: "Always store dates as ISO 8601 text",
        body: "Store dates as `'YYYY-MM-DD'` and datetimes as `'YYYY-MM-DD HH:MM:SS'`. This format sorts lexicographically (alphabetically) the same as chronologically — so `WHERE date >= '2024-01-01'` works correctly with a text column. Never store dates as 'DD/MM/YYYY' or 'Jan 15, 2024' — these break sorting and comparison.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Employees and orders with dates",
              setup: true,
              sql: `CREATE TABLE employees (
  emp_id    INTEGER PRIMARY KEY,
  name      TEXT    NOT NULL,
  hire_date TEXT    NOT NULL,  -- 'YYYY-MM-DD'
  dept      TEXT    NOT NULL,
  salary    REAL    NOT NULL
);

CREATE TABLE orders (
  order_id   INTEGER PRIMARY KEY,
  customer   TEXT    NOT NULL,
  order_date TEXT    NOT NULL,  -- 'YYYY-MM-DD'
  ship_date  TEXT,              -- NULL if not yet shipped
  total      REAL    NOT NULL
);

INSERT INTO employees VALUES
  (1, 'Alice',  '2020-03-15', 'Engineering', 115000),
  (2, 'Bob',    '2021-07-01', 'Engineering',  98000),
  (3, 'Carol',  '2020-01-10', 'Design',       92000),
  (4, 'Dave',   '2022-09-20', 'Engineering',  87000),
  (5, 'Eve',    '2021-04-05', 'Marketing',    78000),
  (6, 'Frank',  '2019-11-30', 'Design',       95000),
  (7, 'Grace',  '2019-06-15', 'Engineering', 125000);

INSERT INTO orders VALUES
  (1,  'Alice',   '2024-01-05', '2024-01-08',  450.00),
  (2,  'Bob',     '2024-01-15', '2024-01-18', 1200.00),
  (3,  'Carol',   '2024-01-20', NULL,           89.00),
  (4,  'Alice',   '2024-02-01', '2024-02-04',  750.00),
  (5,  'Dave',    '2024-02-10', '2024-02-13',  320.00),
  (6,  'Eve',     '2024-02-14', NULL,          180.00),
  (7,  'Alice',   '2024-03-01', '2024-03-05',  990.00),
  (8,  'Frank',   '2024-03-10', NULL,          450.00),
  (9,  'Bob',     '2024-03-15', '2024-03-17', 1450.00),
  (10, 'Carol',   '2024-03-20', NULL,          230.00);`,
            },
            {
              id: "q1",
              label: "date() and datetime() basics",
              sql: `-- date and time functions
SELECT
  date('now')                          AS today,
  datetime('now')                      AS now_utc,
  date('now', 'localtime')             AS today_local,
  date('2024-01-15')                   AS example_date,
  strftime('%Y-%m-%d', '2024-01-15')   AS strftime_date;`,
            },
            {
              id: "q2",
              label: "strftime: extract parts",
              sql: `SELECT
  order_date,
  strftime('%Y', order_date)   AS year,
  strftime('%m', order_date)   AS month,
  strftime('%d', order_date)   AS day,
  strftime('%w', order_date)   AS day_of_week  -- 0=Sun, 6=Sat
FROM orders
ORDER BY order_date;`,
            },
            {
              id: "q3",
              label: "Date arithmetic with modifiers",
              sql: `SELECT
  hire_date,
  date(hire_date, '+1 year')             AS one_year_anniversary,
  date(hire_date, 'start of month')      AS first_of_hire_month,
  date(hire_date, 'start of year')       AS first_of_hire_year,
  date(hire_date, '+3 months')           AS three_months_later
FROM employees
ORDER BY hire_date;`,
            },
            {
              id: "q4",
              label: "julianday: compute date differences",
              sql: `SELECT
  name,
  hire_date,
  ROUND(julianday('2024-12-31') - julianday(hire_date)) AS days_employed,
  ROUND((julianday('2024-12-31') - julianday(hire_date)) / 365.25, 1) AS years_employed
FROM employees
ORDER BY hire_date;`,
            },
            {
              id: "q5",
              label: "Shipping duration: days from order to ship",
              sql: `SELECT
  order_id,
  customer,
  order_date,
  ship_date,
  CASE
    WHEN ship_date IS NULL THEN 'not shipped'
    ELSE ROUND(julianday(ship_date) - julianday(order_date)) || ' days'
  END AS shipping_time
FROM orders
ORDER BY order_date;`,
            },
            {
              id: "challenge",
              label: "Challenge: monthly order summary",
              sql: `-- Group orders by year-month and compute:
-- month (as 'YYYY-MM'), order_count, total_revenue
-- Sort by month ascending
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**'now' is always UTC in SQLite.** `date('now')` returns the current UTC date. Use `date('now', 'localtime')` to convert to the local timezone. In production systems, store all timestamps in UTC and convert to local time in the application layer — storing local times creates ambiguity during daylight saving transitions.",
      "**Date comparison is lexicographic for ISO 8601 strings.** Because `'YYYY-MM-DD'` sorts the same as a date comparison, `WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31'` works correctly as a string comparison. This only works when dates are stored in `ISO 8601` format with zero-padded months and days.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Timezone handling in SQLite",
        body: "SQLite has no native timezone support beyond UTC ↔ local time via `'localtime'` modifier. For serious time-zone-aware applications, store Unix timestamps as integers (`unixepoch` modifier) and convert at the application layer. `strftime('%s', 'now')` gives the current Unix timestamp.",
      },
    ],
  },

  examples: [
    {
      title: "Filter records from the last 30 days",
      body: `SELECT * FROM orders
WHERE order_date >= date('now', '-30 days')
ORDER BY order_date DESC;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-023-q1",
        type: "choice",
        text: "What does strftime('%Y-%m', '2024-07-15') return?",
        options: ["'2024-07-15'", "'07-2024'", "'2024-07'", "'2024'"],
        answer: "'2024-07'",
      },
      {
        id: "sql0-023-q2",
        type: "choice",
        text: "How do you compute the number of days between two dates in SQLite?",
        options: [
          "date2 - date1",
          "DATEDIFF(date2, date1)",
          "julianday(date2) - julianday(date1)",
          "INTERVAL(date1, date2, 'days')",
        ],
        answer: "julianday(date2) - julianday(date1)",
      },
      {
        id: "sql0-023-q3",
        type: "choice",
        text: "Why does WHERE order_date >= '2024-01-01' work correctly when order_date is stored as TEXT?",
        options: [
          "SQLite automatically converts text to dates for comparison",
          "ISO 8601 format (YYYY-MM-DD) sorts lexicographically the same as chronologically",
          "The >= operator detects date strings automatically",
          "Text comparisons always work for dates in SQLite",
        ],
        answer:
          "ISO 8601 format (YYYY-MM-DD) sorts lexicographically the same as chronologically",
      },
    ],
  },
};

export default lesson;
