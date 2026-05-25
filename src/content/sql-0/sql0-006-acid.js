const lesson = {
  id: "sql-0-006",
  slug: "acid-transactions",
  chapter: "sql-0",
  order: 26,
  title: "ACID & Transactions",
  subtitle: 'What "safe" means in databases — and how to guarantee it',
  tags: ["sql", "acid", "transactions", "rollback", "commit", "consistency"],
  aliases: [
    "database transactions",
    "acid properties",
    "commit rollback",
    "data integrity",
  ],

  hook: `You're transferring money: debit Alice $100, credit Bob $100.
What happens if the server crashes between the two statements?
Alice lost $100 and Bob received nothing. That's a data integrity disaster.
Transactions exist to make sure that never happens.`,

  intuition: {
    prose: [
      "**A transaction is an atomic unit of work.** Either all statements in the transaction succeed (COMMIT), or none of them do (ROLLBACK). You can't end up with 'Alice debited but Bob not credited' — the database guarantees the operation is all-or-nothing.",
      "**ACID stands for Atomicity, Consistency, Isolation, Durability.** Atomicity: all-or-nothing. Consistency: all constraints are checked; a violation rolls back the entire transaction. Isolation: concurrent transactions don't see each other's in-progress work. Durability: a committed transaction survives crashes — written to persistent storage via write-ahead logging.",
      "**Syntax: BEGIN / COMMIT / ROLLBACK.** Every statement you run is automatically in a transaction (autocommit). To group multiple statements: `BEGIN;` ... your statements ... `COMMIT;`. If anything goes wrong: `ROLLBACK;` undoes everything since BEGIN. This is also a major performance technique: 1000 individual INSERTs each flush to disk. One BEGIN+COMMIT flushes once.",
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Schema setup — bank accounts",
              setup: true,
              sql: `CREATE TABLE accounts (
  account_id  INTEGER PRIMARY KEY,
  owner       TEXT    NOT NULL,
  balance     REAL    NOT NULL CHECK(balance >= 0)  -- constraint: no negative balances
);

CREATE TABLE transfers (
  transfer_id  INTEGER PRIMARY KEY,
  from_account INTEGER NOT NULL REFERENCES accounts(account_id),
  to_account   INTEGER NOT NULL REFERENCES accounts(account_id),
  amount       REAL    NOT NULL CHECK(amount > 0),
  ts           TEXT    NOT NULL DEFAULT(datetime('now'))
);

INSERT INTO accounts VALUES
  (1, 'Alice',   1000.00),
  (2, 'Bob',      500.00),
  (3, 'Charlie',  250.00);`,
            },
            {
              id: "q1",
              label: "See starting balances",
              sql: `SELECT * FROM accounts;`,
            },
            {
              id: "q2",
              label: "Successful transfer — both updates in one transaction",
              sql: `BEGIN;
  UPDATE accounts SET balance = balance - 200 WHERE account_id = 1;  -- debit Alice
  UPDATE accounts SET balance = balance + 200 WHERE account_id = 2;  -- credit Bob
  INSERT INTO transfers(from_account, to_account, amount)
    VALUES (1, 2, 200);
COMMIT;

-- Check the result
SELECT * FROM accounts;`,
            },
            {
              id: "q3",
              label: "Failed transaction — rollback leaves state unchanged",
              sql: `-- Try to transfer more than Charlie has (would violate CHECK constraint)
BEGIN;
  UPDATE accounts SET balance = balance - 300 WHERE account_id = 3;  -- Charlie only has 250
ROLLBACK;  -- undo the debit; Charlie still has 250

-- Charlie's balance is unchanged
SELECT owner, balance FROM accounts WHERE account_id = 3;`,
            },
            {
              id: "q4",
              label: "Constraint enforcement — Atomicity in action",
              sql: `-- This will fail: the CHECK(balance >= 0) prevents negative balances
-- SQLite will reject the UPDATE; BEGIN/COMMIT wrap it so nothing partial sticks
BEGIN;
  UPDATE accounts
  SET balance = balance - 5000
  WHERE account_id = 2;  -- Bob only has 300 now
COMMIT;

-- Verify Bob's balance is still unchanged (the constraint blocked it)
SELECT owner, balance FROM accounts WHERE account_id = 2;`,
            },
            {
              id: "q5",
              label: "SAVEPOINT — partial rollback within a transaction",
              sql: `BEGIN;
  UPDATE accounts SET balance = balance - 50 WHERE account_id = 1;  -- debit Alice 50
  SAVEPOINT halfway;
  UPDATE accounts SET balance = balance + 50 WHERE account_id = 3;  -- credit Charlie
  ROLLBACK TO halfway;  -- undo Charlie credit but keep Alice debit
  UPDATE accounts SET balance = balance + 50 WHERE account_id = 2;  -- credit Bob instead
COMMIT;

SELECT * FROM accounts;`,
            },
            {
              id: "q6",
              label: "Transfer audit log — why ACID makes audit logs reliable",
              sql: `-- The transfers table only ever gets rows when the transaction commits
-- If the transfer fails mid-way, no audit record is created
SELECT
  t.transfer_id,
  a.owner     AS from_owner,
  b.owner     AS to_owner,
  t.amount
FROM transfers AS t
JOIN accounts AS a ON t.from_account = a.account_id
JOIN accounts AS b ON t.to_account   = b.account_id;`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Atomicity is implemented via write-ahead logging (WAL).** Before modifying data pages, the database writes the old value to the log. If a crash occurs, the log lets the database undo any uncommitted changes on restart.",
      "**Isolation levels are a spectrum.** Read Uncommitted (dirty reads allowed) → Read Committed (no dirty reads) → Repeatable Read (same row value if read twice) → Serializable (full isolation, transactions appear serial). Higher isolation = more safety, more locking overhead. SQLite uses serializable isolation by default.",
      "**Deadlock.** Two transactions each hold a lock the other needs. Databases detect this cycle and automatically abort one transaction. The aborted transaction can be retried.",
    ],
  },

  examples: [
    {
      title: "Why BEGIN … COMMIT matters for performance too",
      body: `SQLite runs every statement in its own automatic transaction by default (autocommit mode).
For 1000 individual INSERTs, that's 1000 transactions — each flushing to disk.
Wrapping them in a single BEGIN…COMMIT flushes once: 50x–100x faster.
Batching writes in transactions is a standard performance technique.`,
    },
    {
      title: "The double-spend problem",
      body: `Without ACID, two requests arriving simultaneously could both read balance = $100,
both check "can we debit $80?", both say "yes", and both execute, leaving balance = $20 instead of $20.
Wait — the first should have brought it to $20, making the second impossible.
Isolation prevents this: one transaction completes before the other sees the updated balance.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-006-q1",
        type: "choice",
        text: "What does Atomicity guarantee?",
        options: [
          "Each statement runs as fast as possible",
          "The entire transaction succeeds or none of it does",
          "Transactions run in alphabetical order",
          "Data is written to disk immediately",
        ],
        answer: "The entire transaction succeeds or none of it does",
      },
      {
        id: "sql0-006-q2",
        type: "choice",
        text: "You run BEGIN, update two rows, then the server crashes before COMMIT. What happens on restart?",
        options: [
          "Both updates are kept",
          "The first update is kept, the second is lost",
          "Both updates are rolled back automatically",
          "The database is corrupted",
        ],
        answer: "Both updates are rolled back automatically",
      },
      {
        id: "sql0-006-q3",
        type: "choice",
        text: "What is the purpose of a write-ahead log (WAL)?",
        options: [
          "To cache frequently read rows in memory",
          "To record changes before applying them so the DB can recover after a crash",
          "To compress data on disk",
          "To enforce foreign key constraints",
        ],
        answer:
          "To record changes before applying them so the DB can recover after a crash",
      },
    ],
  },

  mentalModel: [
    "BEGIN groups statements; COMMIT makes them permanent; ROLLBACK undoes them entirely",
    "Atomicity: the whole transaction succeeds or none of it does — no partial state ever persists",
    "Consistency: all constraints are enforced; a failed constraint rolls back the whole transaction",
    "Durability: committed data survives a crash via write-ahead logging (WAL)",
  ],
};

export default lesson;
