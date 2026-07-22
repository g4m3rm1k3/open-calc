That is a brilliant pivot. Using TDD as the vehicle to learn SQLite and ORMs solves the exact problem we were fighting.

If we write the test first, the database is never a "black box." You prove every single query works locally before you ever try to wire it into a larger application. No more horizontal slices of unusable code.

Here is Lesson 1 of the new SQLite series, strictly following your schema, where we use TDD to prove our database actually stores and retrieves inventory data.

---

# Lesson 1: The Test-Driven Database

**What you will build**
You will build an automated test that creates an ephemeral database, builds an inventory table, inserts a part, and proves the data was saved by querying it back. The transferable problem this lesson solves is testing database interactions without permanently corrupting a real file on your hard drive with test data.

**What you need to know first**
Nothing. This is the foundation of the data layer.

---

## Concept Unit: The Ephemeral Database

### The Problem

If we write tests that insert fake inventory parts into a real database file, our production data gets polluted. We need a database that exists only for a fraction of a second while the test runs, and then completely vanishes.

### Introduce the concept in isolation

Create a temporary file named `lab_memory.py` and write this:

```python
import sqlite3
conn = sqlite3.connect(":memory:")
print("Database created in RAM!")

```

Run it in your terminal with `python lab_memory.py`.

**Real Output:**

```
Database created in RAM!

```

**What the output proves:** By passing the exact string `":memory:"` instead of a file name, SQLite builds a fully functional database in your computer's RAM rather than on the hard drive. When the script ends, the RAM is cleared and the database ceases to exist.

### Discard the throwaway example

Delete `lab_memory.py`. It will not appear in the project again.

### Project Change

* **Reference Source:** No reference counterpart — this is a from-scratch addition.
* **Files affected:** Create a new file named `test_database.py`.
* **Change type:** Add.
* **Location:** Top of the brand-new file.
* **Dependencies:** Python 3.

### The New Code

```python
import sqlite3

def test_insert_inventory():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()

```

### The Updated Project

*(Skipped per schema rule: step 5's code is the whole new structure inside a brand-new file with nothing surrounding it yet).*

### Mechanical walkthrough

* `import` (First appearance): Keyword that loads an external module into memory.
* `sqlite3` (First appearance): Python's built-in library for interacting with SQLite databases.
* `def` (First appearance): Keyword defining a reusable function.
* `test_insert_inventory` (First appearance): The arbitrary name of our test function.
* `()` (First appearance): Parameter list. Empty, meaning this function needs no outside data.
* `:` (First appearance): Indicates the indented block below belongs to this function.
* `conn` (First appearance): A variable we create to hold the active connection to the database.
* `=` (First appearance): The assignment operator. Evaluates the right side and stores it in the left side.
* `sqlite3.connect` (First appearance): A method call into the SQLite library that opens a bridge to a database.
* `":memory:"` (Hard concept reappearing): From the lab. A special reserved string that tells SQLite to use RAM instead of disk space.
* `cursor` (First appearance): A variable we create to hold the tool that actually sends SQL commands over the connection.
* `conn.cursor()` (First appearance): Creates and returns a new cursor object bound to our connection.

### CS lens

Ephemeral State. The concept of creating a temporary, isolated environment that guarantees a clean slate (a "blank canvas") every single time a process runs.
Also recognized in: Docker containers, private browsing tabs (Incognito mode), and continuous integration (CI) test runners.

### SE lens

Test Isolation. The alternative is letting tests write to a shared development database file. The tradeoff is that tests begin failing randomly because one test deleted data that another test expected to find (called a "state leak"). `":memory:"` guarantees absolute isolation.

### Commands needed to make this unit real, if any

No special commands yet.

### Run it. Show the real output.

Run `python -c "import test_database; test_database.test_insert_inventory()"` in your terminal.

**Real output:**

```

```

*(A blank line)*

### One sentence connecting this unit to what came immediately before.

We have successfully created a temporary database in memory, but because it is completely empty, we must now define the structure that will hold our inventory data.

---

## Concept Unit: Table Execution

### The Problem

A database is just an empty room until you build shelves. We need to create a table structure (the schema) that dictates exactly what a "part" looks like before we can save one.

### Introduce the concept in isolation

Create a temporary file named `lab_execute.py` and write this:

```python
import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE test_table (name TEXT)")
print("Table created successfully!")

```

Run it in your terminal with `python lab_execute.py`.

**Real Output:**

```
Table created successfully!

```

**What the output proves:** The `.execute()` method takes a raw string of SQL text and runs it directly against the database, successfully building the structural table without returning any data to Python.

### Discard the throwaway example

Delete `lab_execute.py`. It will not appear in the project again.

### Project Change

* **Reference Source:** No reference counterpart — this is a from-scratch addition.
* **Files affected:** Modify `test_database.py`.
* **Change type:** Add.
* **Location:** Inside `test_insert_inventory`, directly below `cursor = conn.cursor()`.
* **Dependencies:** None.

### The New Code

```python
    cursor.execute("""
        CREATE TABLE parts (
            id INTEGER PRIMARY KEY,
            name TEXT,
            qty INTEGER
        )
    """)

```

### The Updated Project

`test_database.py` now looks like this:

```python
import sqlite3

def test_insert_inventory():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE parts (
            id INTEGER PRIMARY KEY,
            name TEXT,
            qty INTEGER
        )
    """) # ← new

```

The test now connects to RAM and immediately builds a table specifically designed to hold parts, names, and quantities.

### Mechanical walkthrough

* `cursor.execute` (Hard concept reappearing): From the lab. The method that fires an SQL command into the database.
* `"""` (First appearance): Python's multi-line string delimiter, allowing us to format SQL across multiple lines so it is readable.
* `CREATE TABLE` (First appearance): SQL command instructing the database engine to build a new data structure.
* `parts` (First appearance): The arbitrary name we are giving this specific table.
* `(` (Basic syntax): Opens the list of columns this table will contain.
* `id` (First appearance): The name of our first column.
* `INTEGER` (First appearance): SQL data type dictating this column can only hold whole numbers.
* `PRIMARY KEY` (First appearance): SQL constraint forcing this column to be a unique identifier for the row (SQLite will automatically auto-increment this number).
* `,` (Basic syntax): Separates column definitions.
* `name` (First appearance): The name of our second column.
* `TEXT` (First appearance): SQL data type dictating this column holds strings of text.
* `qty` (First appearance): The name of our third column.
* `)` (Basic syntax): Closes the column list.
* `"""` (Basic syntax): Closes the Python multi-line string.

### CS lens

Data Definition Language (DDL). The subset of SQL used to define data structures (like `CREATE`, `ALTER`, or `DROP`) rather than manipulate the data itself.
Also recognized in: Protocol Buffers (`.proto` files), GraphQL schema definitions, and XML Schema Definitions (XSD).

### SE lens

Schema as Code. The alternative is manually clicking through a database UI tool to create tables. The tradeoff is that UI clicks cannot be version-controlled, automated, or reliably tested. By executing the schema in code, the database structure can be rebuilt instantly on any machine.

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

Run `python -c "import test_database; test_database.test_insert_inventory()"` in your terminal.

**Real output:**

```

```

*(A blank line)*

### One sentence connecting this unit to what came immediately before.

The silent success proves our schema is valid SQL, which means the table is now ready to accept a real piece of data.

---

## Concept Unit: Insert and Assert

### The Problem

We have an empty table, but a test is useless unless it actually proves a behavior. We need to insert a part into the table, ask the database to give it back to us, and programmatically assert that the data matches what we expect.

### Introduce the concept in isolation

Create a temporary file named `lab_fetch.py` and write this:

```python
import sqlite3
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute("CREATE TABLE test (name TEXT)")
cursor.execute("INSERT INTO test VALUES ('Widget')")
cursor.execute("SELECT * FROM test")
print(cursor.fetchone())

```

Run it with `python lab_fetch.py`.

**Real output:**

```
('Widget',)

```

**What the output proves:** The `fetchone()` method retrieves exactly one row of data resulting from a `SELECT` query, and Python returns it to us formatted as a tuple (a locked list of values).

### Discard the throwaway example

Delete `lab_fetch.py`.

### Project Change

* **Reference Source:** No reference counterpart — this is a from-scratch addition.
* **Files affected:** Modify `test_database.py`.
* **Change type:** Add.
* **Location:** Inside `test_insert_inventory`, at the very bottom, after the `CREATE TABLE` command.
* **Dependencies:** None.

### The New Code

```python
    cursor.execute("INSERT INTO parts (name, qty) VALUES ('Hex Bolt', 50)")
    
    cursor.execute("SELECT name, qty FROM parts")
    result = cursor.fetchone()
    
    assert result == ('Hex Bolt', 50)

```

### The Updated Project

`test_database.py` now looks like this:

```python
import sqlite3

def test_insert_inventory():
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE parts (
            id INTEGER PRIMARY KEY,
            name TEXT,
            qty INTEGER
        )
    """)
    
    cursor.execute("INSERT INTO parts (name, qty) VALUES ('Hex Bolt', 50)") # ← new
    
    cursor.execute("SELECT name, qty FROM parts") # ← new
    result = cursor.fetchone() # ← new
    
    assert result == ('Hex Bolt', 50) # ← new

```

The test now executes a full lifecycle: building the table, inserting a part, retrieving it, and verifying the data integrity.

### Mechanical walkthrough

* `cursor.execute` (Basic syntax): Running another SQL command.
* `"INSERT INTO parts (name, qty) VALUES ('Hex Bolt', 50)"` (First appearance): Data Manipulation Language (DML). The SQL command that adds a new row, specifying the target columns and the exact data to fill them.
* `"SELECT name, qty FROM parts"` (First appearance): SQL query asking the database to read and return specific columns from every row in the table.
* `result` (First appearance): A Python variable we create to hold the data coming back from the database.
* `cursor.fetchone()` (Hard concept reappearing): From the lab. Pulls the first available row from the cursor's memory buffer.
* `assert` (First appearance): Python keyword that halts the program with an error if the following statement is false.
* `result == ('Hex Bolt', 50)` (First appearance): Checking if the tuple pulled from SQLite exactly matches the Python tuple we expect.

### CS lens

Data Serialization Boundary. The concept of translating data structures between two completely different environments (Python memory vs. SQLite engine). Python translates the string and integer into SQL text, and SQLite's engine translates the binary result back into a Python tuple.
Also recognized in: JSON parsing, network socket transmission, and rendering HTML to the DOM.

### SE lens

End-to-End (E2E) Test Verification. The alternative is manually opening a database viewer to check if the row saved correctly. The tradeoff is that manual checks do not scale; an automated assertion proves the entire database write/read mechanism functions flawlessly in less than a millisecond.

### Commands needed to make this unit real, if any

None.

### Run it. Show the real output.

Run `python -c "import test_database; test_database.test_insert_inventory()"` in your terminal.

**Real output:**

```

```

*(A blank line)*

### One sentence connecting this unit to what came immediately before.

Because the test ran silently without an `AssertionError`, we have absolute, mathematical proof that our schema works and our data was successfully written to and read from the SQLite engine.

---

## Closing

* **Connect the pieces:** The string `'Hex Bolt'` and integer `50` move from a Python `execute` string, cross the boundary into the C-based SQLite engine running in RAM, are stored in the `parts` table structure, and are successfully pulled back across the boundary by `fetchone()` to satisfy the Python `assert` statement.
* **What breaks without this:** Change the assertion on the last line to `assert result == ('Hex Bolt', 49)` and run the test.
```
AssertionError

```


The test instantly catches that the data retrieved from the database does not match the expected business logic. Change it back to `50`.
* **Exercises:**
1. Write a second `cursor.execute` statement to insert a `'Washer'` with a quantity of `100`.
2. Change the `fetchone()` call to `fetchall()` (which returns a list of tuples) and assert that the result equals `[('Hex Bolt', 50), ('Washer', 100)]`.


* **Definition of done:**
* [ ] `test_database.py` successfully creates an in-memory database.
* [ ] The SQL schema creates without syntax errors.
* [ ] The `assert` statement silently passes, proving data integrity.
* [ ] `git commit -m "Test-drive raw SQLite schema and data insertion using in-memory isolation"`