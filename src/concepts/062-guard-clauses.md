---
concept: 062-guard-clauses
name: Guard Clauses
---

## Definition

A guard clause is an early check at the very top of a function that
immediately returns or throws if some precondition isn't met, letting the rest
of the function handle only the cases where everything is already valid.

## Problem

Wrapping a function's entire main logic inside a big "if everything is valid"
block nests every line of real logic one level deeper than it needs to be — and
gets worse with every additional precondition. A guard clause checks each
precondition up front and exits immediately if it fails, so the main logic
afterward can stay flat and unindented.

## Software Engineering

This is one of the highest-value, lowest-cost refactors in everyday code —
converting nested validation into a sequence of guard clauses almost always
makes a function easier to read, with zero change in what the function
actually does.

Tags: Readability, Cyclomatic complexity, Early return

## Common Mistakes

- Nesting every precondition check inside the previous one's `if` block instead of using separate, flat guard clauses — this indents the real logic one extra level for every single precondition added.
- Writing a guard clause that doesn't actually exit — forgetting the `return`/`throw` means the code after it still runs even though the precondition failed, defeating the entire purpose.

## Exercises

- In the JavaScript "good" example, add a third guard clause (e.g. reject negative ages) and confirm it slots in the same flat way as the first two.
- Rewrite the Python "good" example back into one big nested `if` and compare how much more indentation the real logic ends up under.

## javascript

**✕ Nested validation — the real logic is buried two levels deep:**
```javascript
function createAccount(email, age) {
  if (email.includes('@')) {
    if (age >= 13) {
      return { email, age }
    } else {
      throw new Error('Must be at least 13')
    }
  } else {
    throw new Error('Invalid email')
  }
}
console.log(createAccount('alex@example.com', 25))
```
Walkthrough: the actual account-creation logic (`return { email, age }`) is
nested two levels deep, inside two `if`s that only exist to validate the input
— every future precondition added here would push it one level deeper still.

**✓ Guard clauses — each precondition exits immediately, logic stays flat:**
```javascript
function createAccount(email, age) {
  if (!email.includes('@')) throw new Error('Invalid email')
  if (age < 13) throw new Error('Must be at least 13')
  return { email, age }
}
console.log(createAccount('alex@example.com', 25))
```
Walkthrough: each precondition is checked and immediately exits if violated —
by the time `return { email, age }` is reached, every guard has already
passed, and the real logic sits at the top level with no nesting at all,
regardless of how many guard clauses come before it.

## python

**✕ Nested validation:**
```python
def create_account(email, age):
    if '@' in email:
        if age >= 13:
            return {'email': email, 'age': age}
        else:
            raise ValueError('Must be at least 13')
    else:
        raise ValueError('Invalid email')

print(create_account('alex@example.com', 25))
```
Walkthrough: same nesting problem as the JavaScript version — the real return
value is buried two `if` levels deep, purely because of how the validation was
structured.

**✓ Guard clauses:**
```python
def create_account(email, age):
    if '@' not in email:
        raise ValueError('Invalid email')
    if age < 13:
        raise ValueError('Must be at least 13')
    return {'email': email, 'age': age}

print(create_account('alex@example.com', 25))
```
Walkthrough: identical improvement — each guard clause raises immediately on
its own precondition, and the return statement sits flat at the top level once
every guard has passed.

## java

**✕ Nested validation:**
```java
static java.util.Map<String, Object> createAccount(String email, int age) {
    if (email.contains("@")) {
        if (age >= 13) {
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("email", email);
            result.put("age", age);
            return result;
        } else {
            throw new IllegalArgumentException("Must be at least 13");
        }
    } else {
        throw new IllegalArgumentException("Invalid email");
    }
}

System.out.println(createAccount("alex@example.com", 25));
```
Walkthrough: same nesting problem, made even more visible by Java's braces —
the actual result-building code sits three indentation levels deep, inside two
`if`s that exist purely for validation.

**✓ Guard clauses:**
```java
static java.util.Map<String, Object> createAccount(String email, int age) {
    if (!email.contains("@")) throw new IllegalArgumentException("Invalid email");
    if (age < 13) throw new IllegalArgumentException("Must be at least 13");
    java.util.Map<String, Object> result = new java.util.HashMap<>();
    result.put("email", email);
    result.put("age", age);
    return result;
}

System.out.println(createAccount("alex@example.com", 25));
```
Walkthrough: each guard clause is a single flat line that exits immediately on
failure, and the actual account-building code sits at the top level,
unindented by any of the validation.

## cpp

**✕ Nested validation:**
```cpp
struct Account { std::string email; int age; };

Account createAccount(std::string email, int age) {
    if (email.find('@') != std::string::npos) {
        if (age >= 13) {
            return Account{email, age};
        } else {
            throw std::invalid_argument("Must be at least 13");
        }
    } else {
        throw std::invalid_argument("Invalid email");
    }
}

Account acc = createAccount("alex@example.com", 25);
std::cout << acc.email << " " << acc.age << std::endl;
```
Walkthrough: same nesting problem as the other languages — the successful
return sits two `if` levels deep, purely a consequence of how the two
preconditions were checked.

**✓ Guard clauses:**
```cpp
struct Account { std::string email; int age; };

Account createAccount(std::string email, int age) {
    if (email.find('@') == std::string::npos) throw std::invalid_argument("Invalid email");
    if (age < 13) throw std::invalid_argument("Must be at least 13");
    return Account{email, age};
}

Account acc = createAccount("alex@example.com", 25);
std::cout << acc.email << " " << acc.age << std::endl;
```
Walkthrough: each guard clause exits immediately on its own precondition, and
`return Account{email, age}` sits flat at the top level once both guards have
passed.

## rust

**✕ Nested validation:**
```rust
struct Account {
    email: String,
    age: i32,
}

fn create_account(email: &str, age: i32) -> Result<Account, String> {
    if email.contains('@') {
        if age >= 13 {
            Ok(Account { email: email.to_string(), age })
        } else {
            Err("Must be at least 13".to_string())
        }
    } else {
        Err("Invalid email".to_string())
    }
}

match create_account("alex@example.com", 25) {
    Ok(acc) => println!("{} {}", acc.email, acc.age),
    Err(e) => println!("Error: {}", e),
}
```
Walkthrough: Rust has no exceptions (see Checked vs. Unchecked Exceptions) — the
nested version returns a `Result` instead of throwing, but the same nesting
problem shows up: the success case (`Ok(...)`) sits two `if` levels deep.

**✓ Guard clauses:**
```rust
struct Account {
    email: String,
    age: i32,
}

fn create_account(email: &str, age: i32) -> Result<Account, String> {
    if !email.contains('@') {
        return Err("Invalid email".to_string());
    }
    if age < 13 {
        return Err("Must be at least 13".to_string());
    }
    Ok(Account { email: email.to_string(), age })
}

match create_account("alex@example.com", 25) {
    Ok(acc) => println!("{} {}", acc.email, acc.age),
    Err(e) => println!("Error: {}", e),
}
```
Walkthrough: each guard clause returns `Err(...)` immediately on its own
precondition using Rust's explicit `return`, and the final `Ok(...)` sits flat
at the top level, unindented by any validation.
