const lesson = {
  id: "sql-0-021",
  slug: "case-when",
  chapter: "sql-0",
  order: 19,
  title: "CASE WHEN",
  subtitle: "Conditional logic inside your query",
  tags: ["sql", "case when", "conditional", "if else sql", "case expression"],
  aliases: [
    "case when sql",
    "if else sql",
    "conditional column sql",
    "sql switch",
  ],

  hook: `Databases don't just store and retrieve — they can categorize, classify, and label.
CASE WHEN is SQL's if/else: "if the score is 90 or higher, call it A; if 80 or higher, B; otherwise C."
It works in SELECT (create a category column), ORDER BY (custom sort), and even WHERE.`,

  mentalModel: [
    "CASE WHEN evaluates conditions in order, like a series of if / else-if / else blocks.",
    "The first condition that is TRUE wins — later conditions are not evaluated.",
    "CASE can appear in SELECT (computed columns), ORDER BY (custom sort order), WHERE, and HAVING.",
    "If no condition matches and there's no ELSE, the result is NULL.",
  ],

  intuition: {
    prose: [
      "**CASE WHEN is SQL's if/else.** It evaluates a list of conditions and returns the value for the first one that is true. Every database supports it, and it works anywhere a value expression is valid: in SELECT, ORDER BY, WHERE, HAVING, GROUP BY.",
      "**Searched CASE (most common).** `CASE WHEN condition1 THEN result1 WHEN condition2 THEN result2 ELSE default_result END`. Each WHEN tests an arbitrary condition. The first TRUE wins. If none match, ELSE provides the default. Without ELSE, no-match returns NULL.",
      "**Simple CASE (equality matching).** `CASE column WHEN value1 THEN result1 WHEN value2 THEN result2 END` — like a switch statement. Cleaner when you're matching one column against multiple constant values.",
      "**In SELECT: create a category column.** `CASE WHEN price > 1000 THEN 'Premium' WHEN price > 100 THEN 'Mid-range' ELSE 'Budget' END AS price_tier` — creates a new computed column that categorizes each row.",
      "**In ORDER BY: custom sort order.** `ORDER BY CASE status WHEN 'urgent' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END` — sorts rows in a custom business priority order that doesn't match alphabetical or numeric order.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Two forms of CASE",
        body: "**Searched CASE (general):**\n`CASE WHEN condition THEN result ... ELSE default END`\n\n**Simple CASE (equality):**\n`CASE column WHEN 'a' THEN 1 WHEN 'b' THEN 2 ELSE 0 END`\n\nBoth end with `END`. The `ELSE` clause is optional — omitting it returns NULL for unmatched rows.",
      },
      {
        type: "warning",
        title: "All branches should return the same type",
        body: "If one THEN returns a number and another returns text, SQLite will coerce silently. PostgreSQL will raise a type error. Best practice: make all THEN/ELSE expressions the same data type for portability.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Sales with status and scores",
              setup: true,
              sql: `CREATE TABLE employees (
  emp_id     INTEGER PRIMARY KEY,
  name       TEXT    NOT NULL,
  department TEXT    NOT NULL,
  salary     REAL    NOT NULL,
  perf_score INTEGER NOT NULL  -- 0-100
);

CREATE TABLE support_tickets (
  ticket_id  INTEGER PRIMARY KEY,
  subject    TEXT    NOT NULL,
  priority   TEXT    NOT NULL,  -- 'low', 'medium', 'high', 'critical'
  status     TEXT    NOT NULL,  -- 'open', 'in_progress', 'resolved', 'closed'
  created    TEXT    NOT NULL,
  resolved   TEXT               -- NULL if not yet resolved
);

INSERT INTO employees VALUES
  (1, 'Alice',  'Engineering', 115000, 92),
  (2, 'Bob',    'Engineering',  98000, 75),
  (3, 'Carol',  'Design',       92000, 88),
  (4, 'Dave',   'Engineering',  87000, 60),
  (5, 'Eve',    'Marketing',    78000, 95),
  (6, 'Frank',  'Design',       95000, 82),
  (7, 'Grace',  'Engineering', 125000, 98),
  (8, 'Henry',  'Marketing',    72000, 55);

INSERT INTO support_tickets VALUES
  (1, 'Login broken',     'critical', 'open',        '2024-01-05', NULL),
  (2, 'Email not sending','high',     'in_progress', '2024-01-07', NULL),
  (3, 'Slow dashboard',   'medium',   'resolved',    '2024-01-08', '2024-01-10'),
  (4, 'Wrong label',      'low',      'closed',      '2024-01-09', '2024-01-11'),
  (5, 'Payment error',    'critical', 'open',        '2024-01-10', NULL),
  (6, 'Missing report',   'high',     'resolved',    '2024-01-11', '2024-01-12'),
  (7, 'Typo in UI',       'low',      'open',        '2024-01-12', NULL);`,
            },
            {
              id: "q1",
              label: "CASE in SELECT: performance grade",
              sql: `SELECT
  name,
  perf_score,
  CASE
    WHEN perf_score >= 90 THEN 'A - Exceptional'
    WHEN perf_score >= 80 THEN 'B - Strong'
    WHEN perf_score >= 70 THEN 'C - Meets expectations'
    ELSE                       'D - Needs improvement'
  END AS grade
FROM employees
ORDER BY perf_score DESC;`,
            },
            {
              id: "q2",
              label: "Simple CASE: map priority to urgency label",
              sql: `SELECT
  ticket_id,
  subject,
  priority,
  CASE priority
    WHEN 'critical' THEN '🔴 Critical'
    WHEN 'high'     THEN '🟠 High'
    WHEN 'medium'   THEN '🟡 Medium'
    WHEN 'low'      THEN '🟢 Low'
    ELSE                 '⚪ Unknown'
  END AS urgency_label
FROM support_tickets
ORDER BY
  CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END;`,
            },
            {
              id: "q3",
              label: "CASE in ORDER BY: custom business sort",
              sql: `-- Sort tickets: open critical first, then open high, then open medium, then others
SELECT ticket_id, subject, priority, status
FROM support_tickets
ORDER BY
  CASE
    WHEN status = 'open' AND priority = 'critical' THEN 1
    WHEN status = 'open' AND priority = 'high'     THEN 2
    WHEN status = 'open'                            THEN 3
    WHEN status = 'in_progress'                     THEN 4
    ELSE                                                 5
  END,
  created;`,
            },
            {
              id: "q4",
              label: "CASE in aggregate: conditional counting",
              sql: `-- Count tickets by status using CASE inside COUNT
-- This avoids needing multiple GROUP BY queries
SELECT
  COUNT(*) AS total_tickets,
  COUNT(CASE WHEN status = 'open'        THEN 1 END) AS open_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS in_progress_count,
  COUNT(CASE WHEN status = 'resolved'    THEN 1 END) AS resolved_count,
  COUNT(CASE WHEN priority = 'critical'  THEN 1 END) AS critical_count
FROM support_tickets;`,
            },
            {
              id: "challenge",
              label: "Challenge: salary band report",
              sql: `-- Categorize employees into salary bands:
-- 'Junior' if salary < 90000
-- 'Senior' if salary between 90000 and 115000  
-- 'Principal' if salary > 115000
-- Show: name, department, salary, band
-- Also count how many employees are in each band (separate query)
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**CASE is not a statement — it's an expression.** Unlike if/else in procedural languages, SQL's CASE is an expression that evaluates to a single value. This means it can appear anywhere a value can: in SELECT, ORDER BY, WHERE, HAVING, GROUP BY, and inside other expressions like `COALESCE(CASE ... END, 0)`.",
      "**CASE WHEN in GROUP BY creates dynamic grouping.** `GROUP BY CASE WHEN salary > 100000 THEN 'High' ELSE 'Normal' END` groups rows into dynamically computed buckets without requiring a pre-existing column. Combine this with COUNT and SUM for powerful bucketed summaries.",
    ],
    callouts: [
      {
        type: "insight",
        title: "CASE inside SUM for pivot-style reports",
        body: "`SUM(CASE WHEN department = 'Engineering' THEN salary ELSE 0 END)` sums only Engineering salaries. Combine multiple such expressions in one SELECT to create a pivot table — one row, one column per category — without GROUP BY.",
      },
    ],
  },

  examples: [
    {
      title: "Pivot table using CASE inside SUM",
      body: `-- Total salary by department in a single row (pivot)
SELECT
  SUM(CASE WHEN department = 'Engineering' THEN salary ELSE 0 END) AS eng_payroll,
  SUM(CASE WHEN department = 'Design'      THEN salary ELSE 0 END) AS design_payroll,
  SUM(CASE WHEN department = 'Marketing'   THEN salary ELSE 0 END) AS mkt_payroll
FROM employees;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-021-q1",
        type: "choice",
        text: "In a CASE WHEN expression, what happens when no condition matches and there is no ELSE clause?",
        options: [
          "An error is raised",
          "NULL is returned",
          "The last WHEN result is returned",
          "0 is returned",
        ],
        answer: "NULL is returned",
      },
      {
        id: "sql0-021-q2",
        type: "choice",
        text: "Where can a CASE expression appear in a SQL statement?",
        options: [
          "Only in the SELECT clause",
          "Only in WHERE and HAVING",
          "Anywhere a value expression is valid: SELECT, ORDER BY, WHERE, HAVING, GROUP BY",
          "Only as a standalone statement",
        ],
        answer:
          "Anywhere a value expression is valid: SELECT, ORDER BY, WHERE, HAVING, GROUP BY",
      },
      {
        id: "sql0-021-q3",
        type: "choice",
        text: "What is the difference between searched CASE and simple CASE?",
        options: [
          "Searched CASE is faster; simple CASE is more readable",
          "Searched CASE tests arbitrary boolean conditions; simple CASE tests equality against one value",
          "Simple CASE supports ELSE; searched CASE does not",
          "Searched CASE is only for strings; simple CASE is only for numbers",
        ],
        answer:
          "Searched CASE tests arbitrary boolean conditions; simple CASE tests equality against one value",
      },
    ],
  },
};

export default lesson;
