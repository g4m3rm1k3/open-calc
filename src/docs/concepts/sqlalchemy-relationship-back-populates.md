# Concept: SQLAlchemy `relationship()` and `back_populates`

**What you'll understand by the end:** how an ORM lets you navigate between related rows as ordinary Python object attributes (`author.books`, `book.author`) instead of writing a join query by hand every time, and how the two directions of that navigation stay in sync with each other.

**Prerequisites:** `orm-object-relational-mapping.md`, `sql-create-table-and-schema.md` (specifically foreign keys).

## The Problem

A foreign key column (`Book.author_id`) tells the *database* how two tables relate, but reading it directly still means writing a separate query every time application code needs "the actual author row this book belongs to," or "every book row belonging to this author." Something that lets code simply read `book.author` or `author.books` — as if the related rows were already sitting right there as ordinary attributes — removes an entire, repetitive category of manual joins from everyday application code.

## The Isolated Example

```python
from sqlalchemy import create_engine, ForeignKey, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session, relationship

class Base(DeclarativeBase):
    pass

class Author(Base):
    __tablename__ = "author"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    books: Mapped[list["Book"]] = relationship(back_populates="author")

class Book(Base):
    __tablename__ = "book"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    author_id: Mapped[int] = mapped_column(ForeignKey("author.id"))
    author: Mapped[Author] = relationship(back_populates="books")

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    a = Author(name="Le Guin")
    session.add(a)
    session.add(Book(title="The Dispossessed", author=a))
    session.add(Book(title="The Left Hand of Darkness", author=a))
    session.commit()

    row = session.execute(select(Author)).scalar_one()
    print(row.name)
    print([b.title for b in row.books])

    book = session.execute(select(Book).where(Book.title.like("%Dispossessed%"))).scalar_one()
    print(book.author.name)
```

**Real output:**
```
Le Guin
['The Dispossessed', 'The Left Hand of Darkness']
Le Guin
```

**What this proves:** `row.books` returned both real `Book` rows for that author, as a plain Python list, with no explicit query written for it. `book.author` navigated the *opposite* direction — from a specific book back to its author — reached from a completely separate query, with no manual `author_id` lookup written by hand either.

## Mechanical Walkthrough

- `author_id: Mapped[int] = mapped_column(ForeignKey("author.id"))` — the real foreign key column, the only thing the database itself actually stores about this relationship. Everything below is ORM-side convenience built on top of it.
- `books: Mapped[list["Book"]] = relationship(back_populates="author")` on `Author` — declares the "many" side: one author can have many books, so the type is `list["Book"]`, not a single `Book`. `"Book"` is a **forward reference** (a string instead of the real class) because `Book` isn't defined yet at the point `Author` is being written — SQLAlchemy resolves the string once the whole module has finished loading.
- `author: Mapped[Author] = relationship(back_populates="books")` on `Book` — the "one" side: a single book has exactly one author, so the type is `Author` directly, no `list`.
- `back_populates="author"` (on `Author.books`) and `back_populates="books"` (on `Book.author`) — each names the attribute *on the other class* that represents the same real relationship from the opposite direction. This is what keeps the two navigable directions in sync: adding a `Book` with `author=a` (as the example does) automatically makes that book show up in `a.books` too, without either side being updated by hand separately.
- `relationship(...)` with **no** `back_populates` at all is valid too (seen elsewhere in this project, for a relationship only ever navigated in one direction) — `back_populates` is specifically for keeping *two* navigable directions consistent with each other, not required for a `relationship()` to work at all.

## Execution Trace

Two books added with `author=a` (never touching `a.books` directly),
then read back from both directions — traced against the real output above:

- a = Author(name="Le Guin")
- session.add(a)
- session.add(Book(title="The Dispossessed", author=a))
  → back_populates syncs the reverse direction automatically:
    a.books now includes this Book, even though a.books was never
    assigned to directly
- session.add(Book(title="The Left Hand of Darkness", author=a))
  → same automatic sync → a.books now has both books
- session.commit()

- row = select(Author).scalar_one() → the real, committed Author (Le Guin)
- print(row.name) → "Le Guin"
- print([b.title for b in row.books]):
  b=Book("The Dispossessed"):        → "The Dispossessed"
  b=Book("The Left Hand of Darkness"): → "The Left Hand of Darkness"
  → ['The Dispossessed', 'The Left Hand of Darkness']

- book = select(Book).where(title LIKE "%Dispossessed%").scalar_one()
  → The Dispossessed, found by title
- print(book.author.name) → follows the "one" direction back → "Le Guin"

`a.books` was never written to directly anywhere in this trace — both
entries in it came entirely from `back_populates` watching the
*opposite* assignment (`Book(..., author=a)`) and keeping the reverse
list in sync automatically.

## CS Lens

This is an ORM **navigation property** — an attribute that doesn't store a value directly but instead computes/fetches related data on access, backed by the real foreign key underneath. The two-way `back_populates` link is a concrete, small-scale instance of a much older, general idea: keeping *two* separate representations of one fact consistent with each other automatically rather than leaving that consistency to manual, error-prone bookkeeping.

Also recognized in: Django's `related_name` (the same "name the reverse direction" idea, different ORM), and more generally any bidirectional-reference data structure (a doubly-linked list, where each node's `.next.prev` must correctly point back to itself).

## SE Lens

The alternative — read `book.author_id`, then run a second, separate query for `Author` by that id, by hand, every single time a book's author is needed — works, and involves no "magic" the reader has to learn. Its real cost is repetition: the same two-step lookup, written out fully, at every call site that needs it, with no single place enforcing that it's done consistently. `relationship()` trades a small amount of upfront setup and a genuinely new mental model (attributes that trigger queries, not just read stored values) for eliminating that repetition project-wide. The real, honest risk: because `book.author` looks exactly like reading an ordinary attribute, it's easy to lose track of when a relationship access is quietly running a real database query versus reading already-loaded data in memory (SQLAlchemy calls this "lazy loading") — a legitimate performance concern in larger systems, not a problem this small example is big enough to expose.

## Connection

Builds on `orm-object-relational-mapping.md`. Directly used by `shared-primary-key-table-inheritance.md`'s pattern — every base/specialization pair in this project (`TlTool.mill`, `TlToolMill.endmill`/`.drill`, `TlAssemblyItem.tool_material`) is a `relationship()`, most with `uselist=False` (see Try It Yourself below) because the "many" side doesn't apply — a shared primary key means at most *one* matching row can ever exist on the other side, not a list of them.

## Try It Yourself

1. Add `uselist=False` to `Book.author`'s declaration... actually try removing `uselist` entirely from a one-to-one style relationship (declare a `Profile` table with `author_id` as its own primary key, `ForeignKey("author.id")`) and observe that without `uselist=False`, SQLAlchemy returns a `list` even though at most one row could ever match — confirming `uselist=False` is what tells it "treat this as a single object, not a collection," matching real cardinality rather than being purely cosmetic.
2. Delete a `Book` and confirm the corresponding entry disappears from `author.books` the next time it's read (re-query `Author` fresh, or expire the session) without any manual list manipulation.
3. Add a second author and a third book belonging to them, then query `select(Book)` for *all* books and print each one's `.author.name` — confirming the reverse direction works correctly across multiple, distinct authors, not just the single-author case shown above.
