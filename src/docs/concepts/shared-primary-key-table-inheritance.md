# Concept: Shared-Primary-Key Table Inheritance

**What you'll understand by the end:** a real, named way to model "this row is a more specific version of that row" across two separate tables, using nothing but a foreign key that is *also* the child table's own primary key — and how to tell whether a given base row has a matching specialized row at all.

**Prerequisites:** `sql-create-table-and-schema.md`, `orm-object-relational-mapping.md`, `sqlalchemy-relationship-back-populates.md`.

## The Problem

Some real-world things share a common set of fields but also have a further, type-specific set that only makes sense for one particular kind of them — a drill bit's tip angle means nothing for an end mill, and an end mill's flute count means nothing for a drill bit, yet both are still, fundamentally, "a cutting tool" with an overall length and a diameter in common. Cramming every possible type-specific field into one giant table means most rows have most columns sitting `NULL` — and nothing about the table's own structure tells you which combination of filled-in columns is actually valid together.

## The Isolated Example

```python
from sqlalchemy import create_engine, ForeignKey, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session, relationship

class Base(DeclarativeBase):
    pass

class Vehicle(Base):
    __tablename__ = "vehicle"
    id: Mapped[int] = mapped_column(primary_key=True)
    make: Mapped[str]
    car: Mapped["Car | None"] = relationship(back_populates="vehicle", uselist=False)

class Car(Base):
    __tablename__ = "car"
    id: Mapped[int] = mapped_column(ForeignKey("vehicle.id"), primary_key=True)
    door_count: Mapped[int]
    vehicle: Mapped[Vehicle] = relationship(back_populates="car")

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)

with Session(engine) as session:
    v = Vehicle(id=1, make="Honda")
    c = Car(id=1, door_count=4)
    session.add(v)
    session.add(c)
    session.commit()

    row = session.execute(select(Vehicle)).scalar_one()
    print(row.make, row.car.door_count, row.id == row.car.id)
```

**Real output:**
```
Honda 4 True
```

**What this proves:** `Car.id` is declared with `ForeignKey("vehicle.id")` *and* `primary_key=True` on the same column — the same integer, `1`, identifies both the base `Vehicle` row and its more specific `Car` row. Navigating `row.car` from a loaded `Vehicle` reaches the matching `Car` row automatically, with no separate ID to track.

## Mechanical Walkthrough

- `id: Mapped[int] = mapped_column(ForeignKey("vehicle.id"), primary_key=True)` on `Car` — this single column declaration is doing two jobs at once: **primary key** (`Car`'s own row identity) and **foreign key** (a reference to `Vehicle.id`). This is the entire mechanism the pattern is named for — an ordinary one-to-many foreign key would live on a *different*, auto-incrementing column, leaving `Car`'s own `id` free; here, deliberately, there is no separate `Car.id` at all.
- `relationship(back_populates=..., uselist=False)` — already taught in full in `sqlalchemy-relationship-back-populates.md`; used here exactly as introduced there, just between a base/specific pair instead of a generic parent/child.
- A `Vehicle` row with **no** matching `Car` row is a real, valid, representable state (a `Motorcycle` table could share the same `Vehicle` base, unrelated to `Car`) — `row.car` would simply be `None` for such a row. This is what makes the pattern usable for "one of several possible specific types," not just a single fixed extension.

## CS Lens

This is a real, named object-relational design pattern: **Class Table Inheritance** (sometimes "shared primary key" or "one-table-per-class" inheritance) — modeling an is-a relationship (a `Car` *is a* `Vehicle`) across separate tables joined on identical primary keys, rather than either (a) one flat table with every subtype's columns crammed in and mostly `NULL`, or (b) SQLAlchemy's own built-in *polymorphic* inheritance, which adds an explicit **discriminator column** (a `type = "car"` string) on the base table to record which subtype each row is. This project's real schema (mirroring an actual Mastercam `.TOOLDB` export) uses the *undiscriminated* form specifically: there is no `TlTool.kind` column anywhere — whether a given tool is an endmill or a drill is determined purely by **which child table has a matching row**, checked by attempting the join and seeing whether anything comes back (exactly `row.car is None` above, generalized).

Also recognized in: Hibernate/JPA's "joined" inheritance strategy (the same pattern, named identically, in Java's dominant ORM), and more generally any "base record + optional specialization record, same key" design — a person and their employee record, a user account and their admin-privileges record.

## SE Lens

The alternative — one flat table with every subtype's columns inlined, all nullable — needs no joins to read a single row's full data, which is a real, genuine simplicity advantage for small, fixed sets of subtypes. Its real cost: nothing in the schema itself prevents an invalid combination (a row with both `flute_count` *and* `tip_angle` set, or neither) — that invariant would have to be enforced entirely in application code, checked by hand, forever. The joined-table form makes the *shape itself* the enforcement: a `TlToolEndmill` row and a `TlToolDrill` row sharing the same `ID` would each independently be valid to create — nothing stops that at the schema level either — but the normal path through this project's own `insert_tool` only ever creates one or the other for a given tool, and querying "what kind is this" by existence rather than a separate flag matches exactly how the real reference schema itself works, which is the actual reason it was chosen here over inventing a discriminator column the real file doesn't have.

## Connection

Builds on `sqlalchemy-relationship-back-populates.md` and `orm-object-relational-mapping.md`. Used throughout this project's `core/tools.py`: `TlTool` → `TlToolMill` → `TlToolEndmill`/`TlToolDrill` (cutting-tool geometry) and `TlMaterial` → `TlToolMaterial` (material classification) are both real instances of this exact pattern, confirmed against an actual Mastercam `.TOOLDB` file's own schema, not invented for this project.

## Try It Yourself

1. Add a second child table, `Motorcycle` (also `ForeignKey("vehicle.id")`, `primary_key=True`, its own `wheel_count` field), insert a `Vehicle` row with a matching `Motorcycle` instead of a `Car`, and confirm `row.car` is `None` while `row.motorcycle` has the real data.
2. Try inserting *both* a `Car` and a `Motorcycle` row for the same `Vehicle` id and confirm the schema itself doesn't stop you — proving the "exactly one specialization" rule is an application-level convention here, not a database constraint.
3. Query `Car` directly (`select(Car)`) instead of starting from `Vehicle`, and use `.vehicle` to navigate back to the base row — confirming the relationship works in both directions.

## A Second Real Facet: the Chain Extends Past Two Levels

Every table above shares its key with exactly **one** parent. The
identical technique chains to a **third** level just as directly — a
`SportsCar` further specializing `Car`, which is itself already a
specialization of `Vehicle`:

```python
class Car(Base):
    __tablename__ = "car"
    id: Mapped[int] = mapped_column(ForeignKey("vehicle.id"), primary_key=True)
    door_count: Mapped[int]
    vehicle: Mapped[Vehicle] = relationship(back_populates="car")
    sports_car: Mapped["SportsCar | None"] = relationship(back_populates="car", uselist=False)


class SportsCar(Base):
    __tablename__ = "sports_car"
    id: Mapped[int] = mapped_column(ForeignKey("car.id"), primary_key=True)
    top_speed_mph: Mapped[int]
    car: Mapped[Car] = relationship(back_populates="sports_car")


with Session(engine) as session:
    v = Vehicle(make="Toyota")
    c = Car(vehicle=v, door_count=2)
    s = SportsCar(car=c, top_speed_mph=155)
    session.add_all([v, c, s])
    session.commit()

    row = session.execute(select(Vehicle)).scalar_one()
    print("vehicle make:", row.make)
    print("car door_count:", row.car.door_count)
    print("sports_car top_speed:", row.car.sports_car.top_speed_mph)
    print("sports_car.id == car.id == vehicle.id:", s.id == c.id == v.id)
```

**Real output, run this session:**
```
vehicle make: Toyota
car door_count: 2
sports_car top_speed: 155
sports_car.id == car.id == vehicle.id: True
```

**What this proves:** all three real rows genuinely share the
**identical** primary key value (`True`), even across three levels —
`SportsCar`'s own foreign key points at `Car`, not directly at
`Vehicle`, so reaching the base row's data from the most-specialized
row means navigating `sports_car.car.vehicle`, one real hop per level,
rather than a single flat join. Nothing about the mechanism itself
changes between two levels and three — each child table's own primary
key is *also* a foreign key to its own immediate parent, the identical
real pattern repeated once more.

### Try It Yourself (second facet)

1. Add a fourth level (`RaceCar`, specializing `SportsCar`) and confirm
   the identical chaining pattern continues to work, navigating
   `race_car.sports_car.car.vehicle` to reach the base row.
2. Query `SportsCar` directly and check whether it has a real,
   convenient way to reach `Vehicle`'s own fields without manually
   chaining `.car.vehicle` — reasoning about whether a real, additional
   relationship shortcut would be worth adding for a chain this deep.
3. Compare this real, applied instance directly to a Mastercam-style
   tool-library schema's own real subtype chain (a base tool table,
   specialized into a milling-tool table, further specialized into
   endmill/drill tables) — confirming it's the identical real shape,
   just with real, domain-specific names instead of `Vehicle`/`Car`/
   `SportsCar`.
