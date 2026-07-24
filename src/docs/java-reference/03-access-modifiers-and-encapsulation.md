# Access Modifiers and Encapsulation

Java's four visibility levels, shown side by side with real compiler
errors, plus the pattern (private fields + public getters/methods) that
makes them actually useful. Every example on this page was compiled and
run for real.

---

## The Four Levels, Side by Side

```java
// vaultpkg/Vault.java
package vaultpkg;

public class Vault {
    public int publicField = 1;
    protected int protectedField = 2;
    int packagePrivateField = 3;   // no modifier at all
    private int privateField = 4;
}
```

```java
// vaultpkg/SamePackageAccess.java — same package, unrelated class
package vaultpkg;

public class SamePackageAccess {
    public static void main(String[] args) {
        Vault v = new Vault();
        System.out.println(v.publicField + ", " + v.protectedField + ", " + v.packagePrivateField);
    }
}
```

```java
// otherpkg/Sub.java — different package, but a SUBCLASS of Vault
package otherpkg;
import vaultpkg.Vault;

public class Sub extends Vault {
    public static void main(String[] args) {
        Sub s = new Sub();
        System.out.println(s.publicField + ", " + s.protectedField);
    }
}
```

```java
// otherpkg/Unrelated.java — different package, no inheritance at all
package otherpkg;
import vaultpkg.Vault;

public class Unrelated {
    public static void main(String[] args) {
        Vault v = new Vault();
        System.out.println(v.publicField);
    }
}
```

Real output — compiled and run from a folder containing both
`vaultpkg/` and `otherpkg/`:

```text
Same-package class sees: 1, 2, 3
Subclass in another package sees: 1, 2
Unrelated class in another package sees: 1
```

| Modifier | Same class | Same package | Subclass, different package | Everywhere else |
|---|---|---|---|---|
| `public` | yes | yes | yes | yes |
| `protected` | yes | yes | yes | no |
| *(no modifier)* — package-private | yes | yes | no | no |
| `private` | yes | no | no | no |

Reading the three test-run lines together confirms this table exactly:
`publicField` (`1`) is visible in all three; `protectedField` (`2`) is
visible to the same-package class *and* the subclass, but not to
`Unrelated`; `packagePrivateField` (`3`) is visible only to the
same-package class — inheritance alone doesn't grant access to it, only
being in the same package does.

### The Errors, For Real

```java
new Vault().privateField;   // (from outside Vault)
```
```text
error: privateField has private access in Vault
```

```java
new Sub().packagePrivateField;   // (Sub inherits from Vault, but is in a different package)
```
```text
error: packagePrivateField is not public in Vault; cannot be accessed from outside package
```

```java
new Vault().protectedField;   // (from a different package, no inheritance)
```
```text
error: protectedField has protected access in Vault
```

All three are real compile-time errors, not runtime failures — Java
checks visibility at compile time, everywhere, always.

**`protected`'s specific rule is the one most people get wrong:** it is
*not* just "package-private plus a bit more." A subclass in a
*different* package can see an inherited `protected` member — that's
the whole reason `protected` exists as a distinct fourth level, rather
than just being a synonym for package-private.

---

## Encapsulation: Private Fields, Controlled Access

Making fields `private` and exposing behavior through methods lets a
class enforce its own rules about what states it's allowed to be in —
instead of trusting every caller, everywhere, to remember the rules
themselves.

```java
class BankAccount {
    private double balance;

    BankAccount(double initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        this.balance = initialBalance;
    }

    double getBalance() {
        return balance;
    }

    void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit must be positive");
        }
        balance += amount;
    }

    void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalStateException("Insufficient funds");
        }
        balance -= amount;
    }
}
```

```java
BankAccount account = new BankAccount(100);
account.deposit(50);
account.withdraw(30);
account.withdraw(1000);   // rejected
```

Real output:

```text
Starting balance: 100.0
After deposit: 150.0
After withdraw: 120.0
Rejected: Insufficient funds
```

If `balance` were `public` instead, any code anywhere could write
`account.balance = -500;` directly, silently bypassing every rule
`withdraw`/`deposit` enforce. Making it `private` and routing every
change through methods means the class itself is the *only* code that
can ever put it in an invalid state — the invalid state becomes
unrepresentable, not just discouraged by convention.

**Convention:** getters are named `getX()` (or `isX()` for a
`boolean`), setters `setX(value)` — many libraries and tools (JSON
serializers, IDEs generating code, testing frameworks) rely on this
naming convention being followed consistently.
