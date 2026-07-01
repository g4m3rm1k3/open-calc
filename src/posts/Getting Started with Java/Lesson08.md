# Classes and Objects: The Soul of Java

Every Java program is, in the most literal sense, a collection of classes. Unlike C++, where classes are an optional feature layered over a procedural foundation, Java has no procedural layer at all. There are no free-standing functions. There is no global state outside of classes. Every variable, every method, every constant lives inside a class. Understanding classes is not an advanced Java topic — it's the entry point to writing anything beyond trivial programs.

The philosophical foundation is **object-oriented programming**: model your problem domain as a collection of interacting objects, each with its own state and behavior. A bank account has a balance (state) and supports deposit and withdrawal (behavior). A user has a name and email (state) and can be validated or serialized (behavior). Identifying the right objects and their relationships is the central skill of software design.

## Defining a Class

```java
public class BankAccount {
    // Fields (instance variables) — each object gets its own copy
    private String owner;
    private double balance;
    private int transactionCount;

    // Constructor — called when creating a new object with 'new'
    public BankAccount(String owner, double initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        this.owner = owner;
        this.balance = initialBalance;
        this.transactionCount = 0;
    }

    // Instance methods — operate on THIS object's state
    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit must be positive");
        balance += amount;
        transactionCount++;
    }

    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        if (amount > balance) throw new IllegalStateException("Insufficient funds");
        balance -= amount;
        transactionCount++;
    }

    // Getters — controlled read access to private fields
    public double getBalance()       { return balance; }
    public String getOwner()         { return owner; }
    public int getTransactionCount() { return transactionCount; }

    // toString — called by println and String concatenation
    @Override
    public String toString() {
        return String.format("BankAccount[%s, balance=%.2f, txns=%d]",
            owner, balance, transactionCount);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        // 'new' allocates the object on the heap and calls the constructor
        BankAccount alice = new BankAccount("Alice", 1000.0);
        BankAccount bob   = new BankAccount("Bob", 500.0);

        alice.deposit(500.0);
        alice.withdraw(200.0);
        bob.deposit(100.0);

        System.out.println(alice);  // calls toString()
        System.out.println(bob);
        System.out.println("Alice's balance: " + alice.getBalance());

        // alice and bob are independent objects with independent state
    }
}
```

## Encapsulation: The Private/Public Boundary

The `private` keyword restricts access to the class's own methods. `public` makes it accessible anywhere. This boundary is **encapsulation** — the class controls how its state can be changed:

```java
public class Temperature {
    private double celsius;  // private: hidden from outside

    public Temperature(double celsius) {
        setCelsius(celsius);  // Use the setter for validation
    }

    // Setter with validation — no invalid temperatures
    public void setCelsius(double celsius) {
        if (celsius < -273.15) {
            throw new IllegalArgumentException("Below absolute zero: " + celsius);
        }
        this.celsius = celsius;
    }

    // Multiple views of the same underlying data
    public double getCelsius()    { return celsius; }
    public double getFahrenheit() { return celsius * 9.0 / 5.0 + 32.0; }
    public double getKelvin()     { return celsius + 273.15; }

    @Override
    public String toString() {
        return String.format("%.2f°C / %.2f°F / %.2fK",
            getCelsius(), getFahrenheit(), getKelvin());
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        var temp = new Temperature(100.0);  // Boiling point
        System.out.println(temp);

        temp.setCelsius(0.0);   // Freezing point
        System.out.println(temp);

        try {
            new Temperature(-300.0);  // Below absolute zero
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }

        // Cannot do: temp.celsius = -300.0;  — private field
    }
}
```

Without encapsulation, any part of the program could set `account.balance = 1000000` directly, bypassing all validation. `private` makes the class the sole authority over its own state.

## The `this` Keyword

`this` inside an instance method is a reference to the current object — the object on which the method was called:

```java
public class Counter {
    private int count;
    private String name;

    public Counter(String name) {
        this.name = name;    // 'this.name' (field) vs 'name' (parameter)
        this.count = 0;
    }

    // Method chaining — return 'this' to allow fluent API
    public Counter increment() { count++; return this; }
    public Counter add(int n)  { count += n; return this; }
    public Counter reset()     { count = 0; return this; }

    public int getCount() { return count; }

    @Override
    public String toString() { return name + ": " + count; }
}
```

```java
public class Main {
    public static void main(String[] args) {
        var c = new Counter("hits");
        c.increment().increment().add(5).increment();  // Method chaining
        System.out.println(c);  // hits: 8

        c.reset().add(100);
        System.out.println(c);  // hits: 100
    }
}
```

## Static Members: Class-Level State and Behavior

`static` fields and methods belong to the **class**, not to any particular instance. They're shared across all objects:

```java
public class Student {
    // Static: shared across all Student objects
    private static int totalStudents = 0;
    private static int nextId = 1000;

    // Instance: each object has its own
    private int id;
    private String name;
    private double gpa;

    public Student(String name, double gpa) {
        this.id   = nextId++;
        this.name = name;
        this.gpa  = gpa;
        totalStudents++;
    }

    // Static method: doesn't need an object to call
    public static int getTotalStudents() { return totalStudents; }

    // Instance method: operates on this specific student
    public String honor() {
        return gpa >= 3.5 ? "Dean's List" : "Standard";
    }

    @Override
    public String toString() {
        return String.format("Student#%d %s (GPA: %.2f, %s)", id, name, gpa, honor());
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Students: " + Student.getTotalStudents());  // 0

        var alice = new Student("Alice", 3.9);
        var bob   = new Student("Bob",   3.2);
        var carol = new Student("Carol", 3.7);

        System.out.println(alice);
        System.out.println(bob);
        System.out.println(carol);
        System.out.println("Total students: " + Student.getTotalStudents());  // 3
    }
}
```

## Records: Immutable Data Classes (Java 16+)

A common pattern in Java is creating classes that are just data holders — fields, a constructor, getters, `equals`, `hashCode`, and `toString`. Before Java 16, this required ~50 lines of boilerplate. **Records** collapse this to one line:

```java
public class Main {
    // Record: immutable data class, auto-generates constructor, getters, equals, hashCode, toString
    record Point(double x, double y) {
        // Custom method in a record
        double distanceTo(Point other) {
            double dx = this.x - other.x;
            double dy = this.y - other.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        // Compact constructor: validate inputs
        Point {
            if (Double.isNaN(x) || Double.isNaN(y)) {
                throw new IllegalArgumentException("Coordinates cannot be NaN");
            }
        }
    }

    record Person(String name, int age, String email) {}

    public static void main(String[] args) {
        var p1 = new Point(3.0, 4.0);
        var p2 = new Point(0.0, 0.0);

        System.out.println(p1);                        // Point[x=3.0, y=4.0]
        System.out.println(p1.x() + ", " + p1.y());   // 3.0, 4.0 (auto-generated getters)
        System.out.println(p1.distanceTo(p2));          // 5.0

        // Records support equals by value, not by reference
        var p3 = new Point(3.0, 4.0);
        System.out.println(p1.equals(p3));  // true!

        var alice = new Person("Alice", 30, "alice@example.com");
        System.out.println(alice);
    }
}
```

Records are one of modern Java's best features for domain modeling — `Point`, `Color`, `Money`, `Coordinate` are all natural records. They're immutable by design (all fields are `final`), which makes them thread-safe and composable.

## Equals and HashCode

Java's `==` on objects compares references. For value equality (do two objects represent the same thing?), you override `equals`. For use in `HashMap` and `HashSet`, you also override `hashCode`:

```java
import java.util.Objects;

public class Main {
    static class Color {
        private final int r, g, b;

        Color(int r, int g, int b) {
            this.r = r; this.g = g; this.b = b;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Color c)) return false;
            return r == c.r && g == c.g && b == c.b;
        }

        @Override
        public int hashCode() {
            return Objects.hash(r, g, b);
        }

        @Override
        public String toString() {
            return String.format("rgb(%d,%d,%d)", r, g, b);
        }
    }

    public static void main(String[] args) {
        var red1 = new Color(255, 0, 0);
        var red2 = new Color(255, 0, 0);
        var blue = new Color(0, 0, 255);

        System.out.println(red1 == red2);           // false (different objects)
        System.out.println(red1.equals(red2));       // true (same values)
        System.out.println(red1.equals(blue));       // false

        var set = new java.util.HashSet<Color>();
        set.add(red1);
        set.add(red2);  // Same hash + equal → not added twice
        System.out.println("Set size: " + set.size());  // 1
    }
}
```

The contract: if two objects are `equals`, they must have the same `hashCode`. Records automatically satisfy this contract — another reason to prefer them for data classes.
