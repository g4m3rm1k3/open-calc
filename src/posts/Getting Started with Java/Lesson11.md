# The Collections Framework: Data Structures as First-Class Citizens

In 1998, Sun released the Java Collections Framework with Java 2 — a comprehensive set of interfaces and implementations for the most common data structures. Unlike C++'s STL (which arrived in 1994 and was designed by Alexander Stepanov with extraordinary mathematical rigor), Java's collections were designed pragmatically: practical interfaces, concrete implementations, and a naming convention that remains one of the most intuitive in any language.

The framework's design principle: **program to interfaces, not implementations**. You write `List<String>` not `ArrayList<String>`. This lets you swap the implementation without changing the code that uses it — replace `ArrayList` with `LinkedList` in one line and the rest of the program is unchanged.

## The Collection Hierarchy

```
Iterable<T>
└── Collection<T>
    ├── List<T>         — ordered, allows duplicates, indexed
    │   ├── ArrayList
    │   ├── LinkedList
    │   └── Vector (legacy)
    ├── Set<T>          — unordered, no duplicates
    │   ├── HashSet
    │   ├── LinkedHashSet (insertion-ordered)
    │   └── TreeSet (sorted)
    └── Queue<T>        — FIFO, dequeue from front
        ├── LinkedList
        ├── PriorityQueue (heap-based)
        └── Deque<T> (double-ended)

Map<K, V>               — key-value pairs (not a Collection, but part of the framework)
├── HashMap
├── LinkedHashMap (insertion-ordered)
├── TreeMap (sorted by key)
└── Hashtable (legacy)
```

## `ArrayList`: The Workhorse

`ArrayList<T>` is Java's dynamic array. Use it as the default for any ordered sequence:

```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Create
        List<String> fruits = new ArrayList<>();
        fruits.add("apple");
        fruits.add("banana");
        fruits.add("cherry");
        fruits.add(1, "blueberry");  // Insert at index

        System.out.println(fruits);  // [apple, blueberry, banana, cherry]
        System.out.println("Size: " + fruits.size());
        System.out.println("Get(2): " + fruits.get(2));  // banana
        System.out.println("Contains: " + fruits.contains("cherry"));

        // Remove by value or index
        fruits.remove("blueberry");          // by value
        fruits.remove(0);                    // by index
        System.out.println("After removes: " + fruits);

        // Iterate
        for (String fruit : fruits) {
            System.out.print(fruit.toUpperCase() + " ");
        }
        System.out.println();

        // Sort
        List<Integer> nums = new ArrayList<>(Arrays.asList(5, 2, 8, 1, 9, 3));
        Collections.sort(nums);
        System.out.println("Sorted: " + nums);

        // Binary search (requires sorted list)
        int idx = Collections.binarySearch(nums, 5);
        System.out.println("Index of 5: " + idx);

        // Factory methods (Java 9+) — create immutable lists
        List<String> immutable = List.of("a", "b", "c");
        System.out.println(immutable);
    }
}
```

### ArrayList vs LinkedList: When It Matters

Both implement `List<T>`. The choice matters for performance:
- `ArrayList`: O(1) random access, O(n) insertion in middle — backed by an array
- `LinkedList`: O(n) random access, O(1) insertion anywhere — doubly linked nodes

In practice, `ArrayList` wins for most use cases due to **cache locality** — its elements are contiguous in memory, so iterating is cache-friendly. `LinkedList` nodes scatter across the heap. Benchmarks consistently show `ArrayList` faster for nearly all operations up to millions of elements.

## `HashMap`: The Hash Table

`HashMap<K, V>` provides O(1) average-case lookup, insertion, and deletion:

```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> wordCount = new HashMap<>();

        String[] words = "the quick brown fox jumps over the lazy dog the fox".split(" ");
        for (String word : words) {
            wordCount.merge(word, 1, Integer::sum);  // increment or initialize to 1
        }

        System.out.println(wordCount);

        // Lookup
        System.out.println("'the' count: " + wordCount.get("the"));
        System.out.println("'cat' count: " + wordCount.getOrDefault("cat", 0));

        // Iteration
        for (Map.Entry<String, Integer> entry : wordCount.entrySet()) {
            System.out.printf("  %s: %d%n", entry.getKey(), entry.getValue());
        }

        // Java 8+ iteration with forEach
        wordCount.forEach((word, count) -> {
            if (count > 1) System.out.println(word + " appears " + count + " times");
        });

        // Immutable map (Java 9+)
        Map<String, Integer> scores = Map.of("Alice", 95, "Bob", 82, "Charlie", 91);
        System.out.println(scores);
    }
}
```

`merge(key, value, remappingFunction)` is the idiomatic way to build frequency maps. It handles the "first occurrence" case: if the key doesn't exist, insert `value`; if it does, apply the function to the existing value and the new value.

## `TreeMap` and `TreeSet`: Sorted by Nature

When you need elements in sorted order, use `TreeMap` and `TreeSet`. Both use a **red-black tree** internally — O(log n) for all operations, but with guaranteed sort order:

```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // TreeSet: sorted, unique elements
        TreeSet<Integer> set = new TreeSet<>(Arrays.asList(5, 2, 8, 1, 9, 3, 7, 4, 6));
        System.out.println("TreeSet: " + set);           // [1, 2, 3, 4, 5, 6, 7, 8, 9]
        System.out.println("First: " + set.first());     // 1
        System.out.println("Last: " + set.last());       // 9
        System.out.println("< 5: " + set.headSet(5));    // [1, 2, 3, 4]
        System.out.println(">= 5: " + set.tailSet(5));   // [5, 6, 7, 8, 9]

        // TreeMap: sorted by key
        TreeMap<String, Integer> studentScores = new TreeMap<>();
        studentScores.put("Charlie", 78);
        studentScores.put("Alice", 95);
        studentScores.put("Bob", 82);

        System.out.println("TreeMap: " + studentScores);  // Alphabetical order
        System.out.println("First: " + studentScores.firstKey());
        System.out.println("Last: " + studentScores.lastKey());
    }
}
```

## The Stream API: Functional Collection Processing

Java 8's Stream API provides a declarative pipeline for processing collections without explicit loops:

```java
import java.util.*;
import java.util.stream.*;

public class Main {
    record Product(String name, String category, double price) {}

    public static void main(String[] args) {
        List<Product> inventory = List.of(
            new Product("Laptop",    "Electronics", 999.99),
            new Product("Phone",     "Electronics", 699.99),
            new Product("Desk",      "Furniture",   299.99),
            new Product("Chair",     "Furniture",   149.99),
            new Product("Headphones","Electronics", 199.99),
            new Product("Bookshelf", "Furniture",   119.99)
        );

        // Filter electronics, sort by price, get names
        List<String> expensiveElectronics = inventory.stream()
            .filter(p -> p.category().equals("Electronics"))
            .filter(p -> p.price() > 500)
            .sorted(Comparator.comparingDouble(Product::price).reversed())
            .map(Product::name)
            .collect(Collectors.toList());

        System.out.println("Expensive electronics: " + expensiveElectronics);

        // Group by category
        Map<String, List<Product>> byCategory = inventory.stream()
            .collect(Collectors.groupingBy(Product::category));

        byCategory.forEach((category, products) -> {
            System.out.println(category + ": " + products.size() + " items");
        });

        // Statistics per category
        Map<String, DoubleSummaryStatistics> stats = inventory.stream()
            .collect(Collectors.groupingBy(
                Product::category,
                Collectors.summarizingDouble(Product::price)
            ));

        stats.forEach((cat, s) ->
            System.out.printf("%s: avg=$%.2f, min=$%.2f, max=$%.2f%n",
                cat, s.getAverage(), s.getMin(), s.getMax()));

        // Total value
        double total = inventory.stream()
            .mapToDouble(Product::price)
            .sum();
        System.out.printf("Total inventory value: $%.2f%n", total);
    }
}
```

## `Optional`: Replacing Null with Intentionality

Java's billion-dollar mistake — Tony Hoare called inventing null references his "billion dollar mistake" in 2009 — produces `NullPointerException`, Java's most common runtime error. Java 8's `Optional<T>` provides a container that explicitly represents "might not have a value":

```java
import java.util.*;

public class Main {
    record User(String name, String email) {}

    static Optional<User> findUserByEmail(List<User> users, String email) {
        return users.stream()
            .filter(u -> u.email().equals(email))
            .findFirst();  // Returns Optional<User>
    }

    public static void main(String[] args) {
        List<User> users = List.of(
            new User("Alice", "alice@example.com"),
            new User("Bob", "bob@example.com")
        );

        // Old way — null check required, easy to forget
        // User found = findUser(...);
        // if (found != null) { ... }

        // With Optional — the type system forces you to handle absence
        Optional<User> result = findUserByEmail(users, "alice@example.com");

        result.ifPresent(user ->
            System.out.println("Found: " + user.name()));

        // Chain operations safely
        String name = findUserByEmail(users, "charlie@example.com")
            .map(User::name)
            .orElse("Unknown");
        System.out.println("Name: " + name);

        // or throw if not found
        try {
            User user = findUserByEmail(users, "nobody@example.com")
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        } catch (NoSuchElementException e) {
            System.out.println(e.getMessage());
        }
    }
}
```

`Optional` doesn't eliminate null — Java still has null references everywhere. But in APIs where absence is an expected possibility (finding an element, looking up a map key), returning `Optional` forces callers to handle both cases explicitly. The type signature communicates intent.
