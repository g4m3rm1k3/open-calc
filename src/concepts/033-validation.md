---
concept: 033-validation
name: Validation
---

## Definition

Validation is checking that data coming from outside the program — user input, a
network response, a file — actually meets the rules the program needs before
using it, and reporting clearly what's wrong when it doesn't.

## Problem

Data from outside a program is never guaranteed to be well-formed — a form field
can be left blank, a number can arrive as text, a required field can be missing
entirely. Without validation, that bad data either crashes the program somewhere
downstream or, worse, gets used as-is and produces a wrong result nobody notices
until later.

## Computer Science

Validation differs from an assertion in what it's checking: an assertion encodes
a belief about the *programmer's own logic* — a failure means the code is wrong.
Validation checks data the program doesn't control — a failure means the input is
wrong, not the code. The same `if` and `throw` mechanics can implement both, but
what they mean when they fail is different.

Tags: Input validation, Preconditions, Trust boundaries

## Software Engineering

Good validation reports exactly what was wrong and, ideally, checks everything
wrong with the input rather than stopping at the first problem found — a form
that only reports one error at a time forces the user through several failed
submissions to find every mistake. That's exactly the motivation behind
collecting multiple errors instead of failing fast, covered next in this series.

Tags: User feedback, Trust boundaries, Fail-fast vs collect-all

## Common Mistakes

- Trusting data has already been validated because it "looks fine" in the common case, instead of checking it explicitly every time it crosses a trust boundary.
- Validating a value and then not actually using the validated result — checking a string is a valid number but then using the original unparsed string anyway.

## Exercises

- In the JavaScript example, pass an email missing the `@` and observe which specific rule catches it.
- In Python, add a rule requiring the age be under 150 and confirm an age like 200 now fails validation too.

## javascript

```javascript
function validateSignup(email, age) {
  if (!email.includes('@')) throw new Error('Email must contain @')
  if (age < 13) throw new Error('Must be at least 13 years old')
  return { email, age }
}
console.log(validateSignup('not-an-email', 25))
```
Walkthrough: each rule is checked explicitly and separately — `validateSignup`
doesn't trust that `email` already looks like an email just because it's a
string; it's outside data, so it gets checked against the actual rule before
being accepted.

## python

```python
def validate_signup(email, age):
    if '@' not in email:
        raise ValueError('Email must contain @')
    if age < 13:
        raise ValueError('Must be at least 13 years old')
    return {'email': email, 'age': age}

print(validate_signup('not-an-email', 25))
```
Walkthrough: same explicit rule-by-rule shape — the first rule that fails raises
immediately, so `validate_signup` never even reaches the age check once the
email rule has already failed.

## java

```java
static java.util.Map<String, Object> validateSignup(String email, int age) {
    if (!email.contains("@")) throw new IllegalArgumentException("Email must contain @");
    if (age < 13) throw new IllegalArgumentException("Must be at least 13 years old");
    java.util.Map<String, Object> result = new java.util.HashMap<>();
    result.put("email", email);
    result.put("age", age);
    return result;
}

System.out.println(validateSignup("not-an-email", 25));
```
Walkthrough: same rule-by-rule validation, stopping at the first violated rule —
exactly the fail-fast behavior the next part of this series contrasts with
collecting every violation at once.
