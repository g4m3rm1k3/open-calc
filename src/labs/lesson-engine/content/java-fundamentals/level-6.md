---
series: java-fundamentals
level: 6
title: Access Modifiers & Packages
lang: java
---

# Access Modifiers & Packages

Every field and method so far has been reachable from anywhere it's been used. Real Java code deliberately restricts that — controlling exactly which other code is allowed to see or touch a given piece of a class, and organizing related classes together so that control has something to work with beyond a single file.

## public, private, and Default (Package-Private)

```java
class Account {
    public String owner;
    private double balance;
    int internalCode;

    Account(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
        this.internalCode = 1;
    }

    double getBalance() { return balance; }
}

public class Main {
    public static void main(String[] args) {
        Account acc = new Account("Alice", 100.0);
        System.out.println(acc.owner);
        System.out.println(acc.getBalance());
        System.out.println(acc.internalCode);
    }
}
```

```text
Alice
100.0
1
```

`public String owner;` — reachable from any code, anywhere, that has an `Account` reference. `acc.owner` reads it directly, no method needed.

`private double balance;` — reachable only from inside `Account`'s own code. `acc.balance` from `Main` would be a compile error; `getBalance()` exists specifically to expose it safely, read-only, from outside.

`int internalCode;` — no modifier at all. This is Java's fourth access level, **default** (also called **package-private**): reachable from any class in the *same package*, but not from a different one. Since this whole example lives in one file with no `package` statement, `Account` and `Main` are both in Java's unnamed default package together — which is exactly why `acc.internalCode` compiles here, the same way `acc.owner`'s `public` field does.

`double getBalance() { return balance; }` — no modifier either, so this method is also package-private, not truly `public`; only classes in the same package could call it. A real library exposing this to outside callers would mark it `public` explicitly.

## protected — Package Access, Plus Subclasses Elsewhere

```java
class Base {
    protected int value = 10;
    private int secret = 20;
}

class Derived extends Base {
    void show() {
        System.out.println(value);
    }
}

public class Main {
    public static void main(String[] args) {
        Derived d = new Derived();
        d.show();
        System.out.println(d.value);
    }
}
```

```text
10
10
```

`protected int value = 10;` — reachable from the same package (like the default level above) **and** from any subclass, even one that later lives in a different package. `Derived extends Base` (Level 11 covers `extends` and inheritance in full) can read `value` directly inside its own `show()` method, exactly as if `value` were its own field.

`private int secret = 20;` — even `Derived`, despite inheriting from `Base`, cannot see `secret` at all; `private` means "this class and only this class," with no exception for subclasses.

`d.value` — printed successfully from `Main` too, here, because everything in this example still shares the same default package; a real `protected` field in a genuinely different package would only be reachable through inheritance, not through a plain object reference like this one.

## Access Level Summary

| Modifier | Same class | Same package | Subclass, other package | Unrelated class, other package |
|---|---|---|---|---|
| `public` | yes | yes | yes | yes |
| `protected` | yes | yes | yes | no |
| *(default)* | yes | yes | no | no |
| `private` | yes | no | no | no |

**SE lens:** The real engineering principle behind all four levels is **encapsulation** — exposing only what other code genuinely needs, and nothing more. Starting every field `private` and widening access only when a real reason appears (a getter, a subclass that legitimately needs direct access) catches bugs *earlier*: code that should never have touched `balance` directly simply cannot compile if it tries. Starting everything `public` "to be safe" does the opposite — it makes every field a place any other class could reach in and corrupt, with the compiler offering no help finding those places later.

## Packages and import

```java
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("a");
        System.out.println(list);
    }
}
```

```text
[a]
```

`import java.util.List;` — every class this course has used outside `java.lang` (`ArrayList`, `Arrays`, and now `List`) actually lives in a **package** — Java's namespacing mechanism, grouping related classes under a dotted name (`java.util`) the way a folder groups related files. `import` brings a specific class's short name (`List`, not the full `java.util.List`) into scope for the rest of the file.

`java.lang` (holding `String`, `Math`, `System`) is the one package every Java file gets automatically, without needing its own `import` — every other package, including ones a real project defines itself (`package com.example.billing;` at the very top of a file, placing every class in that file into that package), needs an explicit `import` wherever its classes are used from outside.

```text
// A real multi-file project's package layout — shown for reference only, not run here:
com/example/billing/Invoice.java     → package com.example.billing;
com/example/billing/Payment.java     → package com.example.billing;
com/example/shipping/Order.java      → package com.example.shipping;
```

This sandbox always compiles a single file with no `package` statement of its own (the unnamed default package used throughout this lesson) — real, multi-file Java projects use `package` declarations like the ones above to organize classes across directories that physically mirror the dotted package name, and to let package-private (default) access actually mean something across more than one file.

## Challenge: can_access

Write a `static boolean canAccess(String modifier, String context)` method. `modifier` is one of `"public"`, `"protected"`, `"default"`, or `"private"`. `context` is one of `"same-class"`, `"same-package"`, `"subclass-other-package"`, or `"unrelated-other-package"`. Return whether that modifier permits access from that context, following the table above.

```challenge
static boolean canAccess(String modifier, String context) {
    // TODO
}
```

```test
assert canAccess("public", "unrelated-other-package") == true
assert canAccess("private", "same-class") == true
assert canAccess("private", "same-package") == false
assert canAccess("protected", "subclass-other-package") == true
assert canAccess("protected", "unrelated-other-package") == false
assert canAccess("default", "same-package") == true
```
