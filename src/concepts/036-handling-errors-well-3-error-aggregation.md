---
concept: 036-handling-errors-well-3-error-aggregation
name: "Handling Errors Well: Error Aggregation"
series: handling-errors-well
seriesTitle: Handling Errors Well
part: 3
---

## Definition

Error aggregation is collecting every failure found while checking something,
instead of stopping and reporting only the first one — so the caller learns
everything wrong at once rather than fixing one problem, resubmitting, and
finding the next.

## Problem

Fail-fast validation (see Validation) is simpler to write, but it forces a
caller through a slow loop when there are multiple independent problems: fix the
email, resubmit, fix the age, resubmit — even though all the problems were
present from the very first attempt and could have been reported together.

## Execution

Every check runs regardless of whether an earlier one failed
↓
Each failure is appended to a list instead of being thrown immediately
↓
After every check has run, the list is inspected
↓
If the list is empty, the operation succeeds normally
↓
If the list has one or more entries, all of them are reported together instead
of just the first

## Computer Science

This is the fail-fast vs. collect-all tradeoff (see Validation) resolved in
favor of collect-all — it costs a small amount of extra bookkeeping, a growing
list instead of an immediate throw, in exchange for giving the caller complete
information in a single round trip instead of one failure at a time.

Tags: Fail-fast vs collect-all, Batch validation, Result aggregation

## Software Engineering

This is exactly the practice behind good form validation — showing every invalid
field at once, not one at a time — and behind batch operations generally:
importing 500 rows and reporting every row that failed, not stopping at row 1.
The pattern generalizes to anything processing a batch of independent items
where one failure shouldn't stop the report on the others.

Tags: Batch processing, User experience, Partial failure reporting

## Common Mistakes

- Aggregating errors but still stopping the underlying operation at the first failure anyway — this only helps if every check actually keeps running after an earlier one fails.
- Aggregating so much that a single combined message becomes a wall of text no one reads — grouping failures by what they're about keeps the aggregate report usable.

## Exercises

- In the JavaScript example, fix only the email and re-run — confirm the age error is still reported, since it was never fixed.
- In Python, add a third rule (a required `name` field) and confirm all three failures can be collected and reported together when every rule is violated at once.

## javascript

```javascript
function validateSignup(email, age) {
  const errors = []
  if (!email.includes('@')) errors.push('Email must contain @')
  if (age < 13) errors.push('Must be at least 13 years old')
  if (errors.length > 0) throw new Error(errors.join('; '))
  return { email, age }
}
console.log(validateSignup('not-an-email', 5))
```
Walkthrough: unlike the fail-fast version in the Validation concept, every rule
runs regardless of earlier failures — both the email and age problems land in
`errors` before anything is thrown, so the single thrown message reports both
problems from the caller's very first attempt.

## python

```python
def validate_signup(email, age):
    errors = []
    if '@' not in email:
        errors.append('Email must contain @')
    if age < 13:
        errors.append('Must be at least 13 years old')
    if errors:
        raise ValueError('; '.join(errors))
    return {'email': email, 'age': age}

print(validate_signup('not-an-email', 5))
```
Walkthrough: same collect-then-report shape — both checks always run, and
`errors` is only inspected once, after every rule has had a chance to fail,
instead of raising at the first violation.

## java

```java
static java.util.Map<String, Object> validateSignup(String email, int age) {
    java.util.List<String> errors = new java.util.ArrayList<>();
    if (!email.contains("@")) errors.add("Email must contain @");
    if (age < 13) errors.add("Must be at least 13 years old");
    if (!errors.isEmpty()) throw new IllegalArgumentException(String.join("; ", errors));
    java.util.Map<String, Object> result = new java.util.HashMap<>();
    result.put("email", email);
    result.put("age", age);
    return result;
}

System.out.println(validateSignup("not-an-email", 5));
```
Walkthrough: identical collect-then-report pattern in Java — `errors` accumulates
every violated rule via a `List`, and only after both checks have run is the
combined list joined into one thrown exception, giving the caller every problem
at once instead of one at a time.
