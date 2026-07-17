---
concept: 247-namespaces-php
name: Namespaces (PHP)
---

## Definition

A PHP namespace groups related classes, functions, and constants under a
named prefix (`namespace App\Models;`), preventing naming collisions
between code from different libraries or parts of an application that
might otherwise define identically-named classes.

## Problem

Without namespaces, EVERY class/function/constant in a PHP application
shares ONE single global naming space — two different libraries both
defining a class called `User` (a common enough name) would directly
collide, and only ONE could actually be loaded/used. Namespaces let each
library or module define its OWN naming space, so identically-named
classes from different sources can coexist without conflict.

## Execution

A class declared inside a namespace has a FULL name combining the
namespace and the class name, not just the short class name alone
↓
A COMPLETELY DIFFERENT class, also using the same short name, can exist
in a DIFFERENT namespace — no collision, since their full names differ
↓
Importing both with `use ... as ...` gives explicit ALIASES to
disambiguate which one is meant at each use site
↓
Both coexist unambiguously in the SAME file, thanks to their distinct
aliases

## Computer Science

A namespaced class's TRUE identity is its fully-qualified name (like
`App\Models\User`), not just the short `User` — namespaces are purely an
ORGANIZATIONAL/naming mechanism, not a runtime access-control or
encapsulation boundary (unlike, say, a module's private members in some
other languages) — anything can still reference a namespaced class as
long as it uses (or imports) the full name.

Tags: Fully-qualified names, Naming organization (not access control), Namespace resolution

## Software Engineering

Modern PHP dependency management (Composer, PSR-4 autoloading) relies
heavily on namespaces mapping directly to directory structure — a
class's namespace conventionally mirrors its file's location in the
project, which is what lets Composer's autoloader find and load the
right file automatically just from a namespaced class name being
referenced.

Tags: Composer, PSR-4 autoloading, Namespace-to-directory convention

## Common Mistakes

- Assuming namespaces provide privacy/encapsulation (hiding implementation details) — they don't; they solely prevent NAME COLLISIONS, and any namespaced class remains fully public and accessible given its full name.
- Forgetting to alias (`as`) when importing two classes with the same short name from different namespaces — without an alias, the second `use` statement for a colliding short name is a fatal error.

## Exercises

- Trace through what the actual, fully-qualified name of a class inside a nested namespace is, and explain why two same-named classes in different namespaces don't collide despite sharing a short name.
- Explain how PSR-4 autoloading uses a namespace to determine WHICH FILE to load, without ever having to load every file in a project up front.

## php

```php
<?php
namespace App\Models;

class User {
    public function describe() {
        return "an app user";
    }
}

namespace Vendor\Auth;

class User {
    public function describe() {
        return "an auth user";
    }
}

namespace Main;

use App\Models\User as AppUser;
use Vendor\Auth\User as AuthUser;

$appUser = new AppUser();
$authUser = new AuthUser();

echo $appUser->describe() . "\n";
echo $authUser->describe() . "\n";
```
Walkthrough: two completely separate `User` classes coexist in the same
file without conflict, since their TRUE, fully-qualified names
(`App\Models\User` and `Vendor\Auth\User`) are distinct — the `as`
aliases let both be referenced unambiguously in the `Main` namespace,
each correctly dispatching to its own `describe()` implementation.
