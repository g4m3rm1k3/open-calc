---
concept: 213-utility-types
name: Utility Types (TypeScript)
---

## Definition

Utility types are built-in generic types that transform an existing type
into a new, related one — `Partial<T>` makes every property optional,
`Pick<T, K>` selects a subset of properties, `Readonly<T>` makes every
property immutable — letting you derive new types from existing ones
instead of duplicating their shape by hand.

## Problem

Defining a SEPARATE, nearly-identical type by hand for every variation
you need (a version with all-optional fields for a PATCH request, a
version with only some fields for a summary view) duplicates the original
type's shape repeatedly, and any change to the original then requires
manually updating every hand-duplicated variant too. Utility types DERIVE
the new shape directly from the original type, so it automatically stays
in sync if the original changes.

## Execution

An interface defines a full shape with several fields
↓
`Partial<User>` makes EVERY property optional — useful for a PATCH-style
update where only SOME fields are being changed
↓
`Pick<User, 'id' | 'name'>` SELECTS only specific properties, dropping
the rest entirely
↓
`Readonly<User>` makes every property immutable — assigning to any field
of a `Readonly` value is a compile error
↓
If `User` later gains a new field, all of these derived types
automatically reflect that change, with zero manual updates needed to the
derived type declarations themselves

## Computer Science

Utility types are themselves implemented using TypeScript's MAPPED TYPES
(see Mapped Types) under the hood — `Partial<T>` is essentially `{ [K in
keyof T]?: T[K] }`, a general mechanism for transforming a type's
properties, wrapped up as a convenient, named, reusable utility.

Tags: Mapped types (implementation), Type transformation, keyof operator

## Software Engineering

Reaching for a utility type to DERIVE a related shape (rather than
manually re-declaring a similar-but-different interface) keeps types
synchronized automatically as the original evolves — this is the
type-system equivalent of DRY (don't repeat yourself), preventing the "I
updated one but forgot the other" class of bug at the type level.

Tags: DRY for types, Automatic synchronization, Reduced duplication

## Common Mistakes

- Manually re-declaring a near-duplicate interface (e.g., writing out a whole new type field-by-field with `?` on each) instead of using `Partial<T>` — this duplicates the original shape, and the two can silently drift out of sync if the original changes later but the manual copy doesn't.
- Confusing `Pick<T, K>` (selecting SOME properties, keeping the rest of the type structure) with `Omit<T, K>` (the opposite — keeping everything EXCEPT the specified properties) — mixing these up produces a type with the wrong shape.

## Exercises

- Given the `User` interface below, write the type that `Omit<User, 'email'>` would produce, and compare it against what `Pick<User, 'id' | 'name'>` produces — are they the same shape in this specific case?
- Explain why adding a new required field to `User` automatically shows up as an optional field in `Partial<User>`, with zero changes needed to `Partial<User>`'s own declaration.

## typescript

```typescript
interface User {
  id: number
  name: string
  email: string
}

function applyUpdate(user: User, update: Partial<User>): User {
  return { ...user, ...update }
}

const original: User = { name: 'Alice', email: 'alice@x.com', id: 1 }
const updated = applyUpdate(original, { name: 'Alice Smith' })
console.log(updated.name)    // Alice Smith
console.log(updated.email)   // alice@x.com -- unchanged, since update didn't include it

type UserSummary = Pick<User, 'id' | 'name'>;

function summarize(user: User): UserSummary {
  const { id, name } = user
  return { id, name }
}

const summary = summarize(original)
console.log(summary)   // { id: 1, name: 'Alice' }
```
Walkthrough: `applyUpdate` accepts `Partial<User>`, so `{ name: 'Alice
Smith' }` alone (missing `id` and `email`) is a valid argument — every
`User` property became OPTIONAL. Spreading `update` over `user` applies
just the provided field, leaving `email` unchanged. `summarize` returns
`UserSummary` (derived via `Pick<User, 'id' | 'name'>`), a smaller shape
containing only those two fields, demonstrating a different utility type
deriving a NARROWER shape from the same original interface.
