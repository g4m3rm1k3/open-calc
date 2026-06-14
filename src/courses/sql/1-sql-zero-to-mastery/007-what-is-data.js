const lesson = {
  id: "sql-0-007",
  slug: "what-is-data",
  chapter: "sql-0",
  order: 1,
  title: "What Is Data?",
  subtitle: "Facts, tables, and why software needs to remember things",
  tags: ["sql", "data", "fundamentals", "beginner"],
  aliases: ["what is data", "data basics", "intro to data", "sql beginner"],

  hook: `Every app you've ever used is, at its core, a machine for storing and retrieving facts.
A social network stores posts, likes, and friendships.
A bank stores balances and transactions.
A spreadsheet stores numbers in cells.
Before you write a single line of SQL, you need a clear mental picture of what "data" actually is.`,

  mentalModel: [
    "Data is a collection of facts. A database is an organized place to store those facts so you can find them again.",
    "A table is like a spreadsheet sheet: rows go across (one fact per row), columns go down (one property per column).",
    "SQL is the language you use to ask questions about your data and to change it.",
  ],

  intuition: {
    prose: [
      "**Data is just facts.** Your name is a fact. Your age is a fact. The date an order was placed is a fact. Software needs to record facts so it can retrieve them later — when you log in, when you check your balance, when you look up an order.",
      "**A table organizes facts into rows and columns.** Imagine a contacts list: each row is one person, and each column is one piece of information about that person — name, phone number, email. That structure is so natural that humans invented it long before computers existed.",
      "**The difference between a spreadsheet and a database.** A spreadsheet is great for one person editing one file. A database is designed for thousands of people reading and writing simultaneously, for billions of rows, and for linking facts across multiple tables — like connecting a customer row to their order rows without duplicating the customer's name in every order.",
      "**SQL is the language of databases.** SQL stands for Structured Query Language. You type a SQL statement, the database executes it, and you get a result. It looks like English: `SELECT name FROM customers WHERE city = 'Seattle'`. That says: *give me the name column from the customers table, but only for rows where the city is Seattle.*",
      "**You already understand the concepts.** If you've used a spreadsheet, you already think in rows and columns. SQL just makes that thinking precise and powerful enough to work on data at any scale.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Key vocabulary",
        body: "**Data:** Facts recorded for later use.\n**Table:** A grid of rows and columns that stores one type of thing (customers, orders, products).\n**Row (record):** One entry in a table — one customer, one order, one product.\n**Column (field):** One property shared by every row — every customer has a name, every order has a date.\n**Database:** A collection of related tables, managed by software that lets you query and modify them safely.",
      },
      {
        type: "insight",
        title: "SQL runs in your browser here",
        body: "This course uses SQLite running entirely inside your browser via WebAssembly — no server, no install, no account. Every SQL cell you run executes real SQL against a real database engine. The data lives only in your browser tab and resets when you refresh.",
      },
    ],
    visualizations: [
      {
        id: "SQLNotebook",
        props: {
          initialCells: [
            {
              id: "setup",
              label: "Create a simple table (auto-runs)",
              setup: true,
              sql: `-- This is SQL. Lines starting with -- are comments.
-- Let's create the simplest possible table: a contacts list.

CREATE TABLE contacts (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  city  TEXT NOT NULL,
  email TEXT NOT NULL
);

INSERT INTO contacts VALUES
  (1, 'Alice Chen',   'Seattle',    'alice@example.com'),
  (2, 'Bob Patel',    'New York',   'bob@example.com'),
  (3, 'Carol Kim',    'Seattle',    'carol@example.com'),
  (4, 'Dave Nguyen',  'Chicago',    'dave@example.com'),
  (5, 'Eve Torres',   'New York',   'eve@example.com');`,
            },
            {
              id: "q1",
              label: "Read the whole table — your first SQL query",
              sql: `-- SELECT = "give me data"
-- *    = "all columns"
-- FROM = "from this table"
SELECT * FROM contacts;`,
            },
            {
              id: "q2",
              label: "Ask a specific question: who lives in Seattle?",
              sql: `-- WHERE filters rows — only keep rows where the condition is true
SELECT name, email
FROM contacts
WHERE city = 'Seattle';`,
            },
            {
              id: "q3",
              label: "How many contacts are in the table?",
              sql: `-- COUNT(*) counts the rows
SELECT COUNT(*) AS total_contacts FROM contacts;`,
            },
            {
              id: "q4",
              label: "Which cities are represented? (no duplicates)",
              sql: `-- DISTINCT removes duplicate values
SELECT DISTINCT city FROM contacts ORDER BY city;`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**SQL is a declarative language.** In most programming languages (Python, JavaScript) you write instructions: *do this, then do that, loop over these rows.* SQL is different — you describe *what* you want, not *how* to compute it. The database engine figures out the how. This is called declarative programming.",
      "**The relational model** was invented by E.F. Codd at IBM in 1970. Its core insight: data should be stored as *relations* (tables), and queries should produce new relations. This mathematical foundation means SQL behavior is predictable and provably correct.",
      "**SQLite** is a fully-featured SQL database that runs as a single file (or in memory). It powers the data storage in most mobile apps (iOS, Android), all major web browsers, and countless desktop applications. The SQL you learn here transfers directly to PostgreSQL, MySQL, and every other major database — the syntax is ~95% identical.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Declarative vs. imperative",
        body: "**Imperative:** 'Loop through every row, check if city equals Seattle, collect matching rows.' (You describe the process.)\n**Declarative:** 'Give me rows where city = Seattle.' (You describe the result you want.)\nSQL is declarative. The database chooses the most efficient process to produce that result.",
      },
    ],
  },

  examples: [
    {
      title: "Data is everywhere in software",
      body: `Every app stores data in tables. A few examples:
- Twitter/X: a **tweets** table (tweet_id, user_id, text, created_at)
- Spotify: a **songs** table (song_id, title, artist_id, duration_ms)
- Gmail: a **emails** table (email_id, from_address, subject, body, received_at)
- Your bank: an **accounts** table (account_id, owner_name, balance, account_type)
SQL lets you query all of them with the same language.`,
    },
  ],

  assessment: {
    questions: [
      {
        id: "sql0-007-q1",
        type: "choice",
        text: "In a database table, what does one row represent?",
        options: [
          "One property shared by all entries (like 'name')",
          "The entire table",
          "One entry — one customer, one order, one product",
          "One SQL query",
        ],
        answer: "One entry — one customer, one order, one product",
      },
      {
        id: "sql0-007-q2",
        type: "choice",
        text: "SQL is described as 'declarative'. What does that mean?",
        options: [
          "You write step-by-step instructions for the database to follow",
          "You describe what result you want; the database figures out how to get it",
          "SQL only works for reading data, not writing it",
          "You must specify the data types for every value",
        ],
        answer:
          "You describe what result you want; the database figures out how to get it",
      },
      {
        id: "sql0-007-q3",
        type: "choice",
        text: "What is the main advantage of a database over a spreadsheet?",
        options: [
          "Databases display data in prettier formats",
          "Spreadsheets can only store numbers",
          "Databases handle concurrent users, billions of rows, and linked data across multiple tables",
          "SQL is easier to learn than spreadsheet formulas",
        ],
        answer:
          "Databases handle concurrent users, billions of rows, and linked data across multiple tables",
      },
    ],
  },
};

export default lesson;
