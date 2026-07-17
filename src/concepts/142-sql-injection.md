---
concept: 142-sql-injection
name: SQL Injection
---

## Definition

SQL injection is a vulnerability where untrusted user input is
concatenated directly into a SQL query string, letting an attacker
inject their OWN SQL syntax that the database then executes as part of
the query.

## Problem

Building a query by directly concatenating user input into a SQL string
lets an attacker supply input containing SQL syntax of their own — like a
closing quote followed by an always-true condition — which turns the
intended WHERE condition into one that's always true, returning every row
instead of just the matching one.

## Execution

Intended query: find the user whose name matches the given input
↓
Attacker submits input containing a closing quote followed by `OR
'1'='1`
↓
Naive string concatenation produces a query whose WHERE clause is now
always true
↓
The injected condition makes the query return EVERY row in the users
table, not just one matching the intended name
↓
Fix: use a parameterized query, with the user's input passed SEPARATELY
as a bound parameter, never concatenated into the query text itself. The
database treats the parameter as pure data, never as SQL syntax, no
matter what it contains.

## Computer Science

This is the exact same "data being interpreted as code" failure as XSS,
just for the SQL language's syntax parser instead of the browser's HTML
parser — parameterized queries (prepared statements) fix it
structurally, by having the database parse the query's STRUCTURE first,
then bind the parameter values afterward as pure data that can never
change that structure, no matter what characters they contain.

Tags: Injection attacks, Parameterized queries, Prepared statements, Data vs code

## Software Engineering

Parameterized queries (or an ORM that uses them under the hood) should be
the DEFAULT way any application builds a query using external input —
string concatenation into SQL should be treated as a serious
anti-pattern, not an occasional convenience, since it's exploitable the
moment ANY user-controllable value reaches it.

Tags: ORMs, Prepared statements, Secure defaults

## Common Mistakes

- Sanitizing input by just blocking a few "dangerous" characters (like a single quote) instead of using parameterized queries — this is fragile and commonly bypassable, since injections against numeric fields need no quotes at all.
- Assuming an ORM automatically protects against ALL injection — most ORMs are safe by default for standard queries, but calling into a "raw query" escape hatch with concatenated user input reintroduces the exact same vulnerability.

## Exercises

- Trace through what a query against a numeric ID field does if the input is an always-true numeric condition instead of a quoted string — does the "block dangerous characters" mistake above even help here?
- Rewrite the vulnerable concatenated query as a parameterized query, and explain specifically why the injected always-true condition can no longer change the query's logic.

## javascript

```javascript
// Simulating the concatenation-vs-parameterized contrast directly, since a
// real SQL engine isn't available in this app's code runner.
const users = [
  { id: 1, name: 'alice' },
  { id: 2, name: 'bob' },
]

// Vulnerable: naive string concatenation -- simulates what a real SQL engine
// would do if it received this exact injected query string
function vulnerableQuery(nameInput) {
  // simulating a query like: name = '${nameInput}'
  // if nameInput injects `' OR '1'='1`, the "query" effectively becomes "match everything"
  const injected = nameInput.includes("' OR '1'='1")
  return injected ? users : users.filter(u => u.name === nameInput)
}

// Safe: a parameterized query -- nameInput is ALWAYS treated as a literal
// value to compare against, never as part of the query's logic
function parameterizedQuery(nameInput) {
  return users.filter(u => u.name === nameInput)   // nameInput can never change the comparison itself
}

const attackerInput = "x' OR '1'='1"
console.log(vulnerableQuery(attackerInput).length)      // 2 -- WRONG: returned every user, not just one named "x"
console.log(parameterizedQuery(attackerInput).length)   // 0 -- correct: no user is literally named "x' OR '1'='1"
```
Walkthrough: `vulnerableQuery` models what a real database would do if
handed the concatenated, injected query string — the injected always-true
clause makes the condition always true, so it returns both users
regardless of the intended filter. `parameterizedQuery` treats
`nameInput` purely as a literal value to match against — no matter what
SQL-looking syntax it contains, it can never alter the query's actual
comparison logic, correctly returning zero matches.

## python

```python
users = [
    {'id': 1, 'name': 'alice'},
    {'id': 2, 'name': 'bob'},
]


def vulnerable_query(name_input):
    # simulating a query like: name = '{name_input}'
    injected = "' OR '1'='1" in name_input
    return users if injected else [u for u in users if u['name'] == name_input]


def parameterized_query(name_input):
    return [u for u in users if u['name'] == name_input]   # name_input can never change the comparison itself


attacker_input = "x' OR '1'='1"
print(len(vulnerable_query(attacker_input)))      # 2 -- WRONG: returned every user, not just one named "x"
print(len(parameterized_query(attacker_input)))   # 0 -- correct: no user is literally named "x' OR '1'='1"
```
Walkthrough: identical concatenation-vs-parameterized contrast as the
JavaScript version — the vulnerable simulation returns every row once the
always-true condition is injected, while the parameterized version
safely treats the entire input as a literal value with zero matches.
