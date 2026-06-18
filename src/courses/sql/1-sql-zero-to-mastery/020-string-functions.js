const lesson = {
  id: "sql-0-022",
  slug: "string-functions",
  chapter: "sql-0",
  order: 20,
  title: "String Functions",
  subtitle: "Manipulate and transform text data",
  tags: [
    "sql",
    "string functions",
    "text manipulation",
    "upper lower",
    "substr",
    "replace",
    "trim",
    "like",
  ],
  aliases: [
    "sql string functions",
    "sql text functions",
    "upper lower sql",
    "substring sql",
    "trim sql",
  ],

  hook: `Real data is messy. Names in ALLCAPS. Phone numbers with dashes or spaces.
Emails with trailing whitespace. Addresses with inconsistent casing.
SQL has a toolkit of string functions to clean, transform, and extract text —
right in your query, without needing a separate processing step.`,

  mentalModel: [
    "UPPER/LOWER normalizes case; LENGTH counts characters.",
    "SUBSTR(str, start, length) extracts a portion of a string (1-indexed).",
    "TRIM, LTRIM, RTRIM remove whitespace or specified characters from edges.",
    "REPLACE replaces all occurrences; INSTR finds position; || concatenates.",
  ],

  intuition: {
    prose: [
      "**String functions transform text inline.** Instead of pulling data into Python to clean it, SQL string functions let you transform text as part of your SELECT. The original data isn't changed — the transformation happens only in the query result.",
      "**Case functions: UPPER and LOWER.** `UPPER('hello')` returns `'HELLO'`; `LOWER('HELLO')` returns `'hello'`. Useful for case-insensitive comparisons: `WHERE LOWER(email) = LOWER('Alice@Example.COM')` matches regardless of how the email was stored.",
      "**LENGTH counts characters.** `LENGTH('hello')` returns 5. Use it to find overly long entries, validate input lengths, or count characters in a column: `WHERE LENGTH(description) > 500`.",
      "**SUBSTR extracts a substring.** `SUBSTR(string, start_position, length)`. Positions are 1-indexed. `SUBSTR('hello world', 1, 5)` returns `'hello'`. `SUBSTR('hello world', 7)` (no length) returns everything from position 7: `'world'`. Negative start positions count from the end.",
      "**REPLACE swaps all occurrences.** `REPLACE('hello world', 'world', 'SQL')` returns `'hello SQL'`. All occurrences are replaced, not just the first. Case-sensitive.",
      "**TRIM removes edge whitespace (or specified chars).** `TRIM('  hello  ')` returns `'hello'`. `LTRIM` trims only the left side; `RTRIM` only the right. You can also specify characters to trim: `TRIM('...hello...', '.')` removes dots from both ends.",
      "**INSTR finds position of a substring.** `INSTR('hello world', 'world')` returns 7. Returns 0 if not found. Combine with SUBSTR to extract up to a delimiter: `SUBSTR(email, 1, INSTR(email, '@') - 1)` extracts the username from an email.",
      "**|| concatenates strings.** `'Hello' || ', ' || 'World!'` returns `'Hello, World!'`. SQLite uses `||` for concatenation. Some databases use `CONCAT()` function instead.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Core SQLite string functions",
        body: "**UPPER(str)** → uppercase  \n**LOWER(str)** → lowercase  \n**LENGTH(str)** → character count  \n**SUBSTR(str, pos [, len])** → substring (1-indexed)  \n**REPLACE(str, from, to)** → replace all occurrences  \n**TRIM([chars FROM] str)** → remove edge chars  \n**LTRIM(str [, chars])** → trim left  \n**RTRIM(str [, chars])** → trim right  \n**INSTR(str, substr)** → position of substr (0 if not found)  \n**PRINTF(fmt, ...)** → formatted string (like C printf)  \n**||** → concatenation operator",
      },
      {
        type: "insight",
        title: "SQLite vs other databases",
        body: "SQLite uses `SUBSTR`, `INSTR`, `||`. PostgreSQL and MySQL have additional functions: `POSITION()`, `LEFT()`, `RIGHT()`, `CONCAT()`, `REPEAT()`, `SPLIT_PART()`, `REGEXP_REPLACE()`. The core functions (`UPPER`, `LOWER`, `TRIM`, `REPLACE`, `LENGTH`) are standard across all major databases.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Contacts table with messy data",
              setup: true,
              sql: `CREATE TABLE contacts (
  id    INTEGER PRIMARY KEY,
  name  TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT
);

INSERT INTO contacts VALUES
  (1, '  Alice Chen  ',  'ALICE@example.com',   '(206) 555-1234', 'prefers email'),
  (2, 'BOB PATEL',       'bob@example.com  ',   '206.555.5678',   NULL),
  (3, 'carol kim',       '  carol@Example.COM', '206-555-9012',   'call after 5pm'),
  (4, 'Dave Nguyen',     'dave@example.com',    '2065554321',     'VIP customer'),
  (5, 'EVE TORRES-SMITH','eve.torres@ex.com',   '(206) 555-8765', NULL);`,
            },
            {
              id: "q1",
              label: "UPPER, LOWER, LENGTH, TRIM",
              sql: `SELECT
  id,
  name                        AS raw_name,
  TRIM(name)                  AS trimmed,
  LENGTH(TRIM(name))          AS name_len,
  UPPER(TRIM(name))           AS name_upper,
  LOWER(TRIM(name))           AS name_lower,
  LOWER(TRIM(email))          AS clean_email
FROM contacts;`,
            },
            {
              id: "q2",
              label: "REPLACE: normalize phone numbers",
              sql: `SELECT
  name,
  phone                                           AS raw_phone,
  REPLACE(REPLACE(REPLACE(REPLACE(phone,
    '(', ''), ')', ''), '-', ''), '.', '')         AS digits_only,
  REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone,
    '(', ''), ')', ''), '-', ''), '.', ''), ' ', '') AS clean_phone
FROM contacts;`,
            },
            {
              id: "q3",
              label: "SUBSTR: extract parts of a string",
              sql: `SELECT
  email,
  -- Extract username (before @)
  SUBSTR(TRIM(LOWER(email)), 1, INSTR(TRIM(LOWER(email)), '@') - 1) AS username,
  -- Extract domain (after @)
  SUBSTR(TRIM(LOWER(email)), INSTR(TRIM(LOWER(email)), '@') + 1)    AS domain,
  INSTR(email, '@')                                                  AS at_position
FROM contacts;`,
            },
            {
              id: "q4",
              label: "|| concatenation and PRINTF formatting",
              sql: `SELECT
  TRIM(name) || ' <' || LOWER(TRIM(email)) || '>'  AS formatted_contact,
  PRINTF('%s (%d chars)', TRIM(name), LENGTH(TRIM(name))) AS name_with_len
FROM contacts;`,
            },
            {
              id: "q5",
              label: "Case-insensitive search using LOWER",
              sql: `-- Find contacts with 'example.com' email regardless of casing in data
SELECT id, TRIM(name) AS name, LOWER(TRIM(email)) AS email
FROM contacts
WHERE INSTR(LOWER(TRIM(email)), 'example.com') > 0;`,
            },
            {
              id: "challenge",
              label: "Challenge: normalize the contacts table",
              sql: `-- Return a cleaned version of every contact:
-- name: trimmed and title-cased (just uppercase first letter is fine)
-- email: trimmed and lowercased
-- phone: digits only (no spaces, dashes, dots, parens)
-- Use whatever functions you've learned above
`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**SQLite's LIKE is case-insensitive only for ASCII letters by default.** `LIKE '%alice%'` matches 'Alice' and 'ALICE' for ASCII characters. However, non-ASCII characters (é, ü, ñ) are not case-folded by SQLite's default LIKE. Use `LOWER(col) LIKE LOWER(pattern)` for reliable case-insensitive matching.",
      "**String functions can prevent index use.** `WHERE LOWER(email) = 'alice@ex.com'` cannot use a B-tree index on the `email` column because the index stores the original values, not the lowercased ones. Create a functional index (`CREATE INDEX idx ON contacts (LOWER(email))`) or store pre-normalized values to keep indexes effective.",
    ],
    callouts: [
      {
        type: "warning",
        title: "SUBSTR is 1-indexed, not 0-indexed",
        body: "Unlike Python's slicing (0-indexed), SQL's SUBSTR starts at position 1. `SUBSTR('hello', 1, 3)` returns `'hel'`, not `'ell'`. `SUBSTR('hello', 0, 3)` is implementation-defined — avoid it.",
      },
    ],
  },

  examples: [
    {
      title: "Build initials from a full name",
      body: `SELECT
  name,
  SUBSTR(name, 1, 1) ||
  COALESCE(
    SUBSTR(name, INSTR(name, ' ') + 1, 1),
    ''
  ) AS initials
FROM contacts;`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-022-q1",
        type: "choice",
        text: "What does SUBSTR('database', 5, 4) return?",
        options: ["'data'", "'base'", "'abas'", "'atas'"],
        answer: "'base'",
      },
      {
        id: "sql0-022-q2",
        type: "choice",
        text: "What does INSTR('hello world', 'world') return?",
        options: ["5", "6", "7", "0"],
        answer: "7",
      },
      {
        id: "sql0-022-q3",
        type: "choice",
        text: "Why can't a normal B-tree index be used for WHERE LOWER(email) = 'alice@ex.com'?",
        options: [
          "LOWER() is not a valid SQL function",
          "B-tree indexes don't support text columns",
          "The index stores original values, not lowercased ones, so it can't match the transformed condition",
          "WHERE clauses can't use string functions",
        ],
        answer:
          "The index stores original values, not lowercased ones, so it can't match the transformed condition",
      },
    ],
  },
};

export default lesson;
