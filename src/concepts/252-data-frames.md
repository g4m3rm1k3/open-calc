---
concept: 252-data-frames
name: Data Frames (R)
---

## Definition

A data frame is R's core tabular data structure — a table where each
COLUMN is a vector (all values in a column share one type), but
different columns can hold DIFFERENT types, and rows are aligned across
all columns — R's native representation for the kind of structured,
spreadsheet-like data most real-world datasets actually look like.

## Problem

A plain matrix in R requires EVERY value to share the SAME type (all
numeric, or all character) — but real datasets almost always mix types
across columns (a name as text, an age as a number, a boolean flag). A
data frame allows each COLUMN to have its own independent type, while
still keeping rows aligned together as related records, matching how
tabular datasets are naturally structured.

## Execution

Multiple columns of DIFFERENT types (character, numeric, logical) are
combined into ONE table
↓
Accessing a column directly by name returns it as a plain VECTOR of that
column's own type
↓
Filtering the table by a condition on one column keeps ALL columns for
matching ROWS — this combines vectorized comparison (see Vectorization)
with row-selection syntax
↓
Adding a BRAND NEW column, computed directly from an EXISTING column via
a vectorized comparison, needs no explicit loop over rows

## Computer Science

A data frame is conceptually a LIST of equal-length vectors (one per
column), displayed and indexed as if it were a 2D table — this is why
accessing a column by name returns a plain vector (you're just accessing
one list element), while row-selection syntax uses a DIFFERENT indexing
mechanism specifically for selecting across the table's row dimension.

Tags: List-of-vectors representation, Column vs row indexing, Heterogeneous column types

## Software Engineering

Data frames are the foundation of most R-based data analysis
workflows — nearly every data-loading function (`read.csv`, database
query results) returns a data frame by default, and most
statistical/plotting functions expect one as input, making data frame
manipulation (filtering, adding columns, summarizing) a core, everyday R
skill.

Tags: Data analysis foundation, read.csv default output, Statistical function input

## Common Mistakes

- Trying to combine columns of genuinely incompatible lengths into one data frame — every column in a data frame must have the SAME number of rows, since they're conceptually aligned records.
- Confusing `df$columnName` (extracts a single column as a plain vector) with `df["columnName"]` (extracts a column but KEEPS it as a one-column data frame, not a bare vector) — these look similar but return meaningfully different types.

## Exercises

- Trace through what filtering the example data frame below for ages over 26 returns — which specific row(s) match, and what does the result look like (a full row, or just the age column)?
- Explain why computing a new column from an existing one via vectorized comparison doesn't require an explicit loop over each row.

## r

```r
df <- data.frame(name = c("Alice", "Bob"), age = c(30, 25), active = c(TRUE, FALSE))

print(df$age)

older <- df[df$age > 26, ]
print(older)

df$is_senior <- df$age > 28
print(df)
```
Walkthrough: `df$age` extracts the `age` column as a plain numeric vector.
`df[df$age > 26, ]` filters down to only the row(s) where `age` exceeds
`26` — just Alice's row, with ALL of her columns intact, not just `age`.
`df$is_senior <- df$age > 28` computes a new column directly from the
existing `age` column via vectorized comparison, adding it to every row
of the data frame at once, with no explicit row-by-row loop.
