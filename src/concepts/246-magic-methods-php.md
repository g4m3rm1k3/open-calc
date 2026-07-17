---
concept: 246-magic-methods-php
name: Magic Methods (PHP)
---

## Definition

PHP magic methods (named with a double-underscore prefix, like `__get`,
`__set`, `__call`, `__toString`) are special methods the engine calls
AUTOMATICALLY in response to specific operations — accessing an
undefined property, calling an undefined method, converting an object to
a string — letting a class intercept and customize behavior that would
otherwise just be a fatal error or the default representation.

## Problem

Without magic methods, accessing a property or calling a method that
doesn't actually exist on a class is simply an error — there's no way
for a class to define DYNAMIC behavior for properties/methods it doesn't
know about in advance (useful for building flexible proxy objects, ORMs,
or lazy-loaded data). Magic methods let a class intercept these
"doesn't exist" cases and decide programmatically what should happen
instead.

## Execution

A class defines `__get`/`__set`
↓
Assigning to a property that isn't a REAL declared property is
intercepted by `__set`, storing it in an internal data structure instead
↓
Reading that same property is similarly intercepted by `__get`,
retrieving it back from that internal storage
↓
`__toString` lets an object used in a string context (echoing it,
concatenating it) automatically produce a readable representation,
instead of a fatal "object could not be converted to string" error

## Computer Science

Magic methods are PHP's mechanism for INTERCEPTING operations that
would otherwise be handled by the engine's default behavior (direct
property storage, a fatal error on undefined method calls) — they're
only triggered for the SPECIFIC gap they cover (`__get` only fires for
INACCESSIBLE or UNDEFINED properties, not ones that exist normally),
which is why adding a real, declared property would bypass `__get`
entirely for that specific property.

Tags: Interception, Fallback-only triggering, Engine-level hooks

## Software Engineering

Magic methods like `__get`/`__set` are commonly used to implement
flexible data containers, lazy-loading proxies, and ORM-style "virtual"
attributes that don't map to individually declared class properties —
but overusing them for ordinary, always-present properties adds
indirection and performance overhead compared to just declaring the
property normally.

Tags: Dynamic properties, ORM patterns, Overuse tradeoffs

## Common Mistakes

- Using `__get`/`__set` for properties that could just be declared normally — this adds unnecessary indirection (an extra method call on every access) for data that doesn't actually need dynamic handling.
- Forgetting that `__get`/`__set` only trigger for properties that AREN'T directly, normally accessible — a real declared public property bypasses these magic methods entirely, which can be confusing if a class mixes both patterns.

## Exercises

- Trace through what happens if a class also declared a REAL public property with the same name as one handled purely through `__get`/`__set` — does `__get` fire for the real one?
- Explain why `__toString` is specifically needed for an object to be used directly in a string context (like echoing it), rather than PHP just calling some default conversion automatically.

## php

```php
<?php
class Config {
    private $data = [];
    public function __get($name) {
        return $this->data[$name] ?? null;
    }
    public function __set($name, $value) {
        $this->data[$name] = $value;
    }
}

$config = new Config();
$config->debug = true;
var_dump($config->debug);
var_dump($config->missing);

class Money {
    public $amount;
    public function __construct($amount) { $this->amount = $amount; }
    public function __toString() {
        return "$" . $this->amount;
    }
}

$price = new Money(9.99);
echo "Price: $price\n";
```
Walkthrough: `$config->debug = true` is intercepted by `__set`, storing
the value in the private `$data` array rather than as a real property;
`$config->debug` then retrieves it back via `__get`. Accessing a property
that was NEVER set at all (`$config->missing`) still goes through
`__get`, correctly returning `null` via the null-coalescing fallback.
`echo "Price: $price\n"` demonstrates `__toString` being called
automatically when a `Money` object is used in a string context.
