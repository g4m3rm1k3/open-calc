---
concept: 175-borrowing
name: Borrowing (Rust)
---

## Definition

Borrowing lets a function or block temporarily access a value via a
REFERENCE (`&value`) without taking ownership of it — the original owner
remains valid and in control, and the borrow automatically ends when the
reference goes out of scope.

## Problem

If every function that just needs to READ a value had to take full
ownership of it (see Ownership), the original variable would become
unusable after every such call — extremely limiting. Borrowing solves
this: a function can access data through a reference without ownership
ever changing hands, letting the original owner keep using it afterward.

## Execution

A function takes a REFERENCE to a `String`, not ownership
↓
The caller passes a borrowed reference — the original variable is
borrowed, not moved
↓
The caller's original variable is STILL valid and usable afterward, since
ownership never left it
↓
Rust's borrow checker enforces a rule at compile time: any number of
IMMUTABLE references (`&T`) can exist at once, OR exactly one MUTABLE
reference (`&mut T`) — never both simultaneously, which prevents data
races and unexpected mutation while something else is reading

## Computer Science

The immutable-XOR-mutable borrowing rule is what lets Rust guarantee, at
COMPILE time, that no code ever reads a value while it's simultaneously
being mutated elsewhere — an entire category of bug (including data races
in concurrent code) that other languages typically only catch at
runtime, if at all.

Tags: Borrow checker, Aliasing rules, Compile-time safety, Data race prevention

## Software Engineering

The practical rule of thumb: take a value by reference (`&T`) when a
function only needs to READ it, take it by mutable reference (`&mut T`)
when it needs to MODIFY it in place, and take it by value (moving
ownership) only when the function genuinely needs to consume or store it
permanently.

Tags: API design, Reference vs ownership, Function signatures

## Common Mistakes

- Trying to have a mutable reference and an immutable reference to the same value active at the same time — the borrow checker rejects this at compile time, since it could allow reading stale or inconsistent data mid-mutation.
- Taking ownership (by value) in a function signature when a reference would have sufficed — this unnecessarily forces the caller to give up their variable (or explicitly clone it), when borrowing would have let them keep using it.

## Exercises

- Trace through what specific compiler error Rust would report if a function took a `String` by value instead of by reference, then the caller's original variable were used again after calling it.
- Explain why Rust allows many simultaneous immutable references but only ONE mutable reference at a time — what specific bug does this rule prevent?

## rust

```rust
fn calculate_length(s: &String) -> usize {
    s.len()
}

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);   // borrow s1 -- ownership stays with s1

    println!("{} is {} long", s1, len);   // s1 is STILL valid here, since it was only borrowed, not moved

    let mut s2 = String::from("hi");
    {
        let r1 = &s2;         // immutable borrow
        let r2 = &s2;         // ANOTHER immutable borrow -- allowed, multiple immutable borrows can coexist
        println!("{} {}", r1, r2);
    }   // r1 and r2 go out of scope here

    let r3 = &mut s2;   // now a mutable borrow -- allowed since no other borrows are active
    r3.push_str(" there");
    println!("{}", r3);
}
```
Walkthrough: `calculate_length` borrows `s1` via `&String` rather than
taking ownership, so `s1` remains fully valid and usable in the
`println!` afterward. `r1` and `r2` demonstrate that multiple immutable
borrows can coexist safely; `r3` demonstrates a mutable borrow, which is
only permitted once the earlier immutable borrows (`r1`, `r2`) have gone
out of scope.
