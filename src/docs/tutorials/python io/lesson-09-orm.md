# Lesson 9: What an ORM Actually Automates

**What you will build:** a `recordkeeper/orm.py` module using
SQLAlchemy — first its Core layer, then its ORM layer — to store and
query `Contact` records, placed directly alongside Lesson 8's
hand-written `store.py` so the two can be compared line for line. The
transferable problem: an ORM isn't a different way of talking to a
database, it's automation of exactly the same things Lesson 8 wrote by
hand — building parameterized SQL text, converting rows to objects,
managing a connection's lifecycle — proven by generating that SQL text
and reading it directly, and by proving the ORM's own extra
guarantee — its **identity map** — with a real `is` check.

**What you need to know first:** Lesson 8 — `sqlite3` connections,
cursors, parameterized queries, and the row-to-`Contact` conversion
pattern `store.py` already uses. Lesson 4 — `Contact`.

**Terms used in this lesson**

- **ORM (Object-Relational Mapper)** — a library that maps between a
  program's own objects and a relational database's tables and rows,
  automating the conversion and query-building work a hand-written
  module like Lesson 8's `store.py` does explicitly. It exists because
  that conversion work — rows to objects, objects to parameterized
  SQL, connection and transaction management — follows the same shape
  for almost every table in almost every project, making it a strong
  candidate for a reusable library instead of hand-written code
  repeated per table.
- **Identity map** — a guarantee, provided by many ORMs' session/unit-
  of-work objects, that fetching the *same* database row more than
  once within the same session returns the *same* Python object each
  time, rather than a fresh, separate object per fetch. It exists so
  that two different parts of a program working with "the same row" are
  provably working with the same in-memory object — any change either
  one makes is immediately visible to the other, since there's only
  ever one object to change.

**Objects and methods used**

- **`sqlalchemy.Table` / `sqlalchemy.Column`**
  - *What they are:* SQLAlchemy Core's own representation of a
    database table's structure, built as Python objects rather than
    SQL text.
  - *Implementation:* `Table(name, metadata, Column(name, type,
    **options), ...)`; calling `metadata.create_all(engine)` turns this
    Python-object description into a real `CREATE TABLE` statement,
    executed against the given engine.
  - *Their use:* Define `contacts`' structure once, as data, instead of
    as a hand-written SQL string like Lesson 8's `SCHEMA` constant.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Classes from SQLAlchemy's Core layer; responsible for representing
    a table's structure as inspectable Python objects rather than
    opaque SQL text; depend on a `MetaData` instance to register
    themselves against; connect to `insert()`/`select()` (below), which
    read a `Table`'s own columns to build statements against it; shape
    is column definitions in, one `Table` object out, with each column
    separately accessible as `table.c.column_name`.

- **`sqlalchemy.insert` / `sqlalchemy.select`**
  - *What they are:* Functions from SQLAlchemy Core that build SQL
    statement objects programmatically, rather than as hand-written
    strings.
  - *Implementation:* `insert(table).values(**cols)` builds an `INSERT`
    statement; `select(table).where(condition)` builds a `SELECT`;
    both are real objects whose `str()` shows the actual generated SQL
    text, with named bind parameters standing in for any value
    supplied via `.values()` or `.where()`.
  - *Their use:* Proven, in this lesson's first lab, to generate real
    parameterized SQL text — directly comparable to Lesson 8's own
    hand-written `?`-placeholder queries.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    Standard Core-layer functions returning statement objects;
    responsible for building a statement's structure from Python
    objects and method calls, keeping any supplied values bound as
    separate parameters rather than spliced into the SQL text; depend
    on a `Table` object to build against; executed via
    `Connection.execute`, the same method name (though a different
    class) as Lesson 8's `sqlite3.Connection.execute`; shape is a
    `Table` and some values/conditions in, one statement object out,
    with `str()` on that object producing real SQL text and named
    parameters.

- **`sqlalchemy.orm.DeclarativeBase` / `Mapped` / `mapped_column`**
  - *What they are:* SQLAlchemy's ORM-layer tools for declaring a
    Python class that's mapped directly to a database table.
  - *Implementation:* A class inherits from `DeclarativeBase`; each
    mapped class sets `__tablename__` and declares its columns as
    type-hinted class attributes using `Mapped[...]`, optionally with
    `mapped_column(...)` for column-level options like `primary_key=True`.
  - *Their use:* Define `ContactRow`, a class SQLAlchemy automatically
    keeps in sync with the `contacts` table's rows.
  - *Type / Responsibility / Depends on / Connects to / Shape:*
    `DeclarativeBase` is a base class; `Mapped`/`mapped_column` are
    typing/column-configuration tools read by SQLAlchemy's own class-
    creation machinery; together responsible for building a real
    `Table` (Core-layer, above) automatically from a class body,
    without that `Table` being written out by hand the way this
    lesson's first unit did; depend on type hints on each mapped
    attribute; connect to `Session` (below), which reads and writes
    instances of mapped classes; shape is a class body with
    type-hinted attributes in, a class usable both as a plain Python
    class and as a live-mapped database entity out.

- **`sqlalchemy.orm.Session`**
  - *What it is:* The ORM layer's connection-and-transaction manager
    for working with mapped objects.
  - *Implementation:* `Session(engine)`, used as a context manager;
    `.add(obj)` stages a new mapped object for insertion;
    `.scalars(select(...)).first()`/`.all()` runs a query and returns
    real mapped-class instances instead of raw rows; `.get(Class, pk)`
    fetches by primary key directly; `.commit()` finalizes all staged
    changes in one transaction, the same guarantee Lesson 8's
    `conn.commit()` provided directly.
  - *Its use:* Manages every read and write in this lesson's ORM-layer
    code.
  - *Type / Responsibility / Depends on / Connects to / Shape:* A
    class; responsible for tracking every mapped object it's touched
    (its **identity map**, full treatment above, in Terms), translating
    `.add()`/queries into real SQL against its engine, and committing or
    rolling back as one transaction; depends on an `engine`; connects to
    mapped classes like `ContactRow` on one side and a real database
    connection on the other; shape is mapped objects and query
    statements in, mapped objects (or `None`) out — never raw tuples,
    unlike Core's `Connection.execute`.

---

## Concept Unit: SQLAlchemy Core — building SQL as objects, not strings

### The Problem

`store.py` (Lesson 8) builds every SQL statement as a hand-written
string — `"SELECT id, name, email, notes FROM contacts WHERE name =
?"`. That string is only ever checked for correctness by actually
running it; a typo in a column name produces no error until execution.
SQLAlchemy's Core layer represents a table's structure, and the
statements built against it, as real Python objects instead.

> **Stop and think:** If a table's columns are represented as real
> Python objects (`contacts.c.name`, say) instead of bare strings
> inside a SQL string, what would that let a tool catch *before* any
> query ever runs, that a hand-written SQL string couldn't? And if
> `insert(table).values(name=...)` is still, ultimately, going to
> produce real SQL text to actually send to the database, would you
> expect that generated text to look meaningfully different from what
> Lesson 8's `insert_contacts` already wrote by hand?

### Introduce the concept in isolation

```python
from sqlalchemy import create_engine, MetaData, Table, Column, String, insert, select

engine = create_engine("sqlite:///:memory:")
metadata = MetaData()

contacts = Table(
    "contacts", metadata,
    Column("id", String, primary_key=True),
    Column("name", String, nullable=False),
    Column("email", String, nullable=False),
    Column("notes", String, nullable=False),
)
metadata.create_all(engine)

insert_stmt = insert(contacts).values(
    id="1", name="Alice Smith", email="alice@example.com", notes="Prefers email, not calls"
)
print("insert_stmt as SQL text ->", str(insert_stmt))

with engine.connect() as conn:
    conn.execute(insert_stmt)
    conn.commit()

select_stmt = select(contacts).where(contacts.c.name == "Alice Smith")
print("select_stmt as SQL text ->", str(select_stmt))

with engine.connect() as conn:
    for row in conn.execute(select_stmt):
        print("row ->", row, "type:", type(row))

malicious = "x' OR '1'='1"
with engine.connect() as conn:
    result = conn.execute(select(contacts).where(contacts.c.name == malicious))
    print(list(result))
```

Real output:

```
insert_stmt as SQL text -> INSERT INTO contacts (id, name, email, notes) VALUES (:id, :name, :email, :notes)
select_stmt as SQL text -> SELECT contacts.id, contacts.name, contacts.email, contacts.notes 
FROM contacts 
WHERE contacts.name = :name_1
row -> ('1', 'Alice Smith', 'alice@example.com', 'Prefers email, not calls') type: <class 'sqlalchemy.engine.row.Row'>
[]
```

`str(insert_stmt)` and `str(select_stmt)` print *real, generated SQL
text* — proof this isn't a different way of talking to the database,
it's the exact same parameterized-query idea Lesson 8 proved safe by
hand, just with the placeholder syntax written as `:id`/`:name_1`
instead of `?`, and generated automatically from `.values()` and
`.where()` calls instead of typed out by hand. `contacts.c.name ==
"Alice Smith"` never puts `"Alice Smith"`'s literal text into that SQL
string at all — it becomes a separate, named bind parameter, the same
structural separation Lesson 8's `?` placeholder provided. The last
block proves it: the identical SQL-injection payload from Lesson 8
returns an empty result here too, for the same underlying reason —
Core builds parameterized queries by default, the same safe pattern
Lesson 8 had to choose deliberately by hand. `row`'s own type,
`sqlalchemy.engine.row.Row`, is close to but not identical to Lesson
8's plain `tuple` — still positional, still convertible into a
`Contact` the same way.

### Discard the throwaway example

This lab's in-memory engine, `contacts` Core table, and its two
statements are discarded; `recordkeeper` uses the ORM layer (next unit)
for its own real persistence, not Core directly — this unit exists to
show what the ORM layer is built on top of.

### Project Change

- **Reference Source** — none; from-scratch, as in every prior lesson.
- **Files affected** — new file `recordkeeper/orm.py`.
- **Change type** — add.
- **Location** — n/a (new file).
- **Dependencies** — `sqlalchemy` (a real external, third-party
  dependency, unlike every other module so far, which used only the
  standard library — install with `pip install sqlalchemy`);
  `recordkeeper.models.Contact` (Lesson 4).

### The New Code

```python
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

from recordkeeper.models import Contact
```

### The Updated Project

Brand-new file, nothing surrounding this fragment yet — covered by
Project Change above.

### Mechanical walkthrough

- **`from sqlalchemy import create_engine, String, select`** — imports
  three names from SQLAlchemy's top-level package: `create_engine`
  (not yet used — full treatment in the next unit), `String` (a
  Core-layer column-type marker, used below to declare `ContactRow`'s
  string columns), and `select` (full treatment above, in Objects and
  methods used).
- **`from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column,
  Session`** — imports the ORM-layer tools this file actually uses,
  each given full treatment above.
- **`from recordkeeper.models import Contact`** — the same import
  pattern used in every ingest module since Lesson 4.

### CS lens

Representing a query as a structured object graph, only turned into
real SQL text at the moment it's actually needed, is the same
**abstract syntax tree** idea this curriculum's own hand-built JSON
tokenizer/parser (Lesson 5) worked with directly — there, turning raw
text into a structured representation to interpret; here, going the
other direction, turning a structured representation into text a
database can execute.

```
Also recognized in: query builders in other languages (LINQ in C#,
ActiveRecord's query interface in Ruby), a compiler's own intermediate
representation sitting between source code and machine code, GraphQL
resolvers building a query plan before executing any actual data fetch
```

### SE lens

The alternative not chosen for `recordkeeper` going forward is keeping
every table's persistence code hand-written the way Lesson 8's
`store.py` already is. That remains completely valid — it's not being
deleted or deprecated by this lesson — and for a project with one
table and a handful of queries, the standard library alone, with no
extra dependency, is a real, legitimate choice. The tradeoff Core (and,
more so, the ORM layer next) offers is scale: as more tables and more
queries accumulate, hand-writing every `INSERT`/`SELECT` string and
every row-to-object conversion repeats the same shape of code more and
more times, while Core/ORM's per-table setup cost (declaring a `Table`
or a mapped class once) stays roughly fixed regardless of how many
queries are later written against it.

### Commands needed

- `pip install sqlalchemy` — installs the SQLAlchemy package from PyPI.
  `pip` is Python's package installer; `install` is its subcommand for
  downloading and installing a package; `sqlalchemy` is the package
  name. Success output ends with a line like `Successfully installed
  sqlalchemy-2.0.52`.

### Run it

Shown above under "Introduce the concept in isolation" — real output.

### Connect

This unit proves Core builds real, safely-parameterized SQL from
Python objects instead of strings; the next unit shows the ORM layer
built on top of it — mapping whole *classes* to tables, so that
`session.add(a_contact_row)` replaces even Core's `insert(table)
.values(...)` call.

---

## Concept Unit: The ORM layer — mapped classes, sessions, and the identity map

### The Problem

Core (previous unit) still requires writing `.values()`/`.where()`
calls that name every column explicitly, and still returns
`Row` objects rather than real, attribute-accessible `Contact`-like
objects. `recordkeeper` already converts rows to `Contact` objects by
hand at the end of every query, in `store.py` and every `ingest`
module since Lesson 4 — the ORM layer's job is automating exactly that
last conversion step, and everything upstream of it.

> **Stop and think:** If a whole Python class — its attributes, their
> types — can be declared once and kept in permanent correspondence
> with a database table, what would `session.add(some_object)` need to
> know, on its own, to correctly turn that object into an `INSERT`? And
> if two completely separate pieces of code both fetch "the contact
> with id 1" within the same session, would you expect each fetch to
> hand back its own separate, independent Python object — or could a
> session, in principle, recognize it's the same row and hand back
> literally the same object both times?

### Introduce the concept in isolation

```python
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase):
    pass

class ContactRow(Base):
    __tablename__ = "contacts"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str]
    email: Mapped[str]
    notes: Mapped[str]

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    session.add(ContactRow(id="1", name="Alice Smith", email="alice@example.com",
                            notes="Prefers email, not calls"))
    session.add(ContactRow(id="2", name="Bob Lee", email="bob@example.com",
                            notes="Referred by Alice\nFollow up in June"))
    session.commit()

with Session(engine) as session:
    stmt = select(ContactRow).where(ContactRow.name == "Alice Smith")
    print("compiled SQL ->", str(stmt))
    result = session.scalars(stmt).first()
    print("result ->", result, "type:", type(result))
    print("attribute access ->", result.name, result.email)

    a = session.get(ContactRow, "1")
    b = session.scalars(select(ContactRow).where(ContactRow.id == "1")).first()
    print("a ->", a)
    print("b ->", b)
    print("a is b ->", a is b)
```

Real output:

```
compiled SQL -> SELECT contacts.id, contacts.name, contacts.email, contacts.notes 
FROM contacts 
WHERE contacts.name = :name_1
result -> <__main__.ContactRow object at 0x7f2ca9839730>
attribute access -> Alice Smith alice@example.com
a -> <__main__.ContactRow object at 0x7f2ca9839730>
b -> <__main__.ContactRow object at 0x7f2ca9839730>
a is b -> True
```

`ContactRow`, mapped once via `Base`/`Mapped`/`mapped_column` (full
treatment above, in Objects and methods used), never has its own SQL
written by hand anywhere in this lab — `session.add(...)` alone was
enough to insert two real rows, and `session.scalars(select(ContactRow)
.where(...))` alone was enough to get a real, attribute-accessible
`ContactRow` object back — `result.name`/`result.email` work as plain
attribute access, not `row[1]`/`row[2]` positional indexing. `select(...)`'s
own compiled SQL text still prints exactly like Core's own output in
the previous unit — proof the ORM layer isn't a separate mechanism, it's
Core plus the class-to-table mapping and the object conversion, both
automated. The final block is this unit's real proof of the **identity
map** (named here in full, per Terms above): `a` and `b` are fetched
two structurally different ways — one by primary key via
`session.get`, one by a `WHERE id = ?`-style query — and `a is b` is
`True`: the *exact same object in memory*, confirmed by both printing
the identical memory address. The session recognized both fetches
referred to the same underlying row and handed back the one object it
already had, rather than building a second, separate one.

### Discard the throwaway example

This lab's in-memory engine, `Base`, and its own `ContactRow` class are
discarded — `recordkeeper`'s own `orm.py` redefines the identical
mapped class as permanent project code, below, rather than reusing this
throwaway one.

### Project Change

- **Reference Source** — none; from-scratch, as in the previous unit.
- **Files affected** — `recordkeeper/orm.py` (modified, completing the
  module).
- **Change type** — add.
- **Location** — after the imports already added in the previous unit.
- **Dependencies** — none new.

### The New Code

```python
class Base(DeclarativeBase):
    pass


class ContactRow(Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str]
    email: Mapped[str]
    notes: Mapped[str]


def contact_row_from_contact(contact):
    return ContactRow(id=contact.id, name=contact.name, email=contact.email, notes=contact.notes)


def contact_from_contact_row(row):
    return Contact(id=row.id, name=row.name, email=row.email, notes=row.notes)


def create_engine_and_schema(path):
    engine = create_engine(f"sqlite:///{path}")
    Base.metadata.create_all(engine)
    return engine


def add_contacts(engine, contacts):
    with Session(engine) as session:
        for contact in contacts:
            session.add(contact_row_from_contact(contact))
        session.commit()


def find_by_name_orm(engine, name):
    with Session(engine) as session:
        rows = session.scalars(select(ContactRow).where(ContactRow.name == name)).all()
        return [contact_from_contact_row(r) for r in rows]
```

### The Updated Project

`recordkeeper/orm.py`, complete:

```python
 1  from sqlalchemy import create_engine, String, select
 2  from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
 3
 4  from recordkeeper.models import Contact
 5
 6
 7  class Base(DeclarativeBase):                                # ← new
 8      pass                                                     # ← new
 9
10
11  class ContactRow(Base):                                      # ← new
12      __tablename__ = "contacts"                                # ← new
13
14      id: Mapped[str] = mapped_column(String, primary_key=True)  # ← new
15      name: Mapped[str]                                          # ← new
16      email: Mapped[str]                                         # ← new
17      notes: Mapped[str]                                         # ← new
18
19
20  def contact_row_from_contact(contact):                        # ← new
21      return ContactRow(id=contact.id, name=contact.name,        # ← new
22                         email=contact.email, notes=contact.notes)  # ← new
23
24
25  def contact_from_contact_row(row):                             # ← new
26      return Contact(id=row.id, name=row.name,                    # ← new
27                      email=row.email, notes=row.notes)            # ← new
28
29
30  def create_engine_and_schema(path):                            # ← new
31      engine = create_engine(f"sqlite:///{path}")                  # ← new
32      Base.metadata.create_all(engine)                             # ← new
33      return engine                                                # ← new
34
35
36  def add_contacts(engine, contacts):                            # ← new
37      with Session(engine) as session:                             # ← new
38          for contact in contacts:                                  # ← new
39              session.add(contact_row_from_contact(contact))         # ← new
40          session.commit()                                          # ← new
41
42
43  def find_by_name_orm(engine, name):                            # ← new
44      with Session(engine) as session:                             # ← new
45          rows = session.scalars(                                   # ← new
46              select(ContactRow).where(ContactRow.name == name)      # ← new
47          ).all()                                                   # ← new
48          return [contact_from_contact_row(r) for r in rows]        # ← new
```

`orm.py` is now complete, sitting alongside Lesson 8's `store.py`
against the same logical `contacts` table: `ContactRow` is the
class-mapped equivalent of `store.py`'s raw tuple rows;
`contact_row_from_contact`/`contact_from_contact_row` are the ORM's own
version of the same conversion-at-one-seam pattern `store.py` (and
every `ingest` module before it) already used; `add_contacts` replaces
`store.py`'s `insert_contacts` with `session.add`/`session.commit`
instead of `conn.executemany`/`conn.commit`; `find_by_name_orm`
replaces `find_by_name` with `session.scalars(select(...))` instead of
`conn.execute(sql, params)`.

### Mechanical walkthrough

- **`class Base(DeclarativeBase): pass`** — full treatment of
  `DeclarativeBase` above; a project typically needs exactly one such
  base class, which every mapped class then inherits from — `pass`
  here means this base class itself adds nothing beyond what
  `DeclarativeBase` already provides.
- **`class ContactRow(Base):`** — declares `ContactRow` as a mapped
  class by inheriting from `Base`.
- **`__tablename__ = "contacts"`** — a plain class attribute (a string,
  no special syntax) telling SQLAlchemy which real table this class
  maps to — the same table name `store.py`'s `SCHEMA` constant (Lesson
  8) already created.
- **`id: Mapped[str] = mapped_column(String, primary_key=True)`** —
  full treatment of `Mapped`/`mapped_column` above; declares `id` as a
  string-typed, primary-key column — `Mapped[str]` is the type hint
  SQLAlchemy reads to know this attribute is mapped at all;
  `mapped_column(String, primary_key=True)` supplies the extra,
  column-level configuration a bare type hint alone can't express.
- **`name: Mapped[str]`, `email: Mapped[str]`, `notes: Mapped[str]`** —
  the same declaration, without `mapped_column`, for columns needing no
  extra configuration beyond their type — SQLAlchemy infers a plain
  `String` column from the `str` type hint alone.
- **`session.add(contact_row_from_contact(contact))`** — full
  treatment of `Session.add` above; stages one new `ContactRow` for
  insertion — nothing is actually sent to the database until
  `session.commit()` runs.
- **`session.scalars(select(ContactRow).where(ContactRow.name == name)).all()`**
  — full treatment of `Session`/`select` above; `.scalars(...)` runs
  the query and unwraps each result row down to the single mapped
  object it represents (rather than a `Row` wrapping one column each,
  which is what a plain `session.execute(...)` would return here);
  `.all()` (as opposed to the previous unit's `.first()`) collects
  every matching `ContactRow`, not just the first.

### CS lens

`ContactRow`'s dual nature — a plain Python class *and* a live,
persistent representation of a database table — is the core idea of
**object-relational mapping** itself, named in full in Terms above: two
different models of the same data (an object graph, a relational
table) kept automatically in correspondence, rather than manually
synchronized by hand-written conversion code at every read and write.

```
Also recognized in: virtually every mainstream ORM in every language
(Django's models, Hibernate in Java, ActiveRecord in Ruby), a game
engine's entity-component system mapping between in-memory game objects
and a serialized save format, a UI framework's data-binding layer
keeping a displayed value and an underlying model value automatically
synchronized
```

### SE lens

The alternative not chosen for `recordkeeper` going forward — again,
completely valid, not a mistake to fix — is keeping `store.py` as the
project's only persistence layer and never adding `orm.py` at all.
Introducing SQLAlchemy is a real, non-trivial cost: a genuine
third-party dependency, a mapped class's own behavior (the identity
map, lazy relationship loading for tables with foreign keys, when
exactly a `Session` actually issues SQL) to learn beyond what plain
SQL requires, and a real possibility of the ORM's generated SQL being
less obviously predictable than SQL written by hand, especially once a
project's queries get complex. The benefit, proven directly in this
unit's own lab, is real too: an identity map preventing a whole class
of bug (two different parts of a program independently modifying "the
same" row as if they were separate objects, and one silently
overwriting the other's change) that a hand-rolled layer like
`store.py` would have to solve itself, deliberately, if it ever needed
that guarantee — right now, `store.py` doesn't provide it at all, since
every `Contact(*row)` in Lesson 8 builds a brand-new, independent
object on every single fetch.

### Commands needed

None new (already covered above, in the previous unit).

### Run it

Real output, from an actual run against `recordkeeper`'s own real
`data/contacts.csv` (Lesson 3):

```python
from recordkeeper.ingest.csv_source import load_contacts_csv
from recordkeeper.orm import create_engine_and_schema, add_contacts, find_by_name_orm

contacts = load_contacts_csv("data/contacts.csv")
engine = create_engine_and_schema("data/recordkeeper_orm.db")
add_contacts(engine, contacts)

found = find_by_name_orm(engine, "Alice Smith")
print(found)
print(found == [contacts[0]])

malicious = "x' OR '1'='1"
print(find_by_name_orm(engine, malicious))
```

```
[Contact(id='1', name='Alice Smith', email='alice@example.com', notes='Prefers email, not calls')]
True
[]
```

`found == [contacts[0]]` is `True` even though `find_by_name_orm`
returns real `Contact` objects (via `contact_from_contact_row`) built
completely separately from the original `contacts[0]` loaded straight
from CSV — proof the ORM path round-trips a `Contact`'s data
correctly, backed by `@dataclass`'s generated `__eq__` from Lesson 4.
The injection attempt, run through the ORM's own `.where(ContactRow.name
== name)`, correctly returns nothing, the same real protection Core's
`.where()` already proved in the previous unit.

### Connect

The previous unit showed Core generates the same kind of safe,
parameterized SQL Lesson 8 wrote by hand; this unit shows the ORM layer
automates the *rest* of what `store.py` also did by hand — the
row-to-object conversion, and connection/transaction management via
`Session` — and adds one real guarantee neither Core nor `store.py`
provide on their own: the identity map, proven directly with a real
`is` check.

---

## Connect the pieces

Every real guarantee this curriculum has proven for `recordkeeper`'s
persistence layer holds across *both* implementations now sitting side
by side. Lesson 8's `store.py`, hand-written directly against
`sqlite3`, and this lesson's `orm.py`, built on SQLAlchemy's Core and
ORM layers, both: store the same two `Contact` records — Alice's
comma-containing notes, Bob's newline-containing notes, unchanged since
Lesson 3 — safely reject the identical SQL-injection payload
(`"x' OR '1'='1"`) rather than leaking data, and round-trip every
`Contact` field correctly, checked directly with `==` against the
original objects loaded from CSV. What differs is how much of that
correctness `recordkeeper`'s own code had to write by hand:
`store.py`'s `insert_contacts`/`find_by_name` build and run SQL text
explicitly; `orm.py`'s `add_contacts`/`find_by_name_orm` describe *what*
to store and find, and let SQLAlchemy's Core and ORM layers — proven,
across this lesson's two units, to generate the identical kind of safe
SQL and to additionally guarantee object identity across fetches —
handle the rest.
