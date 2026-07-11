---
series: java-fundamentals
level: 3
title: Collections & Streams
lang: java
---

# Collections & Streams

`java.util` provides the Java Collections Framework: `ArrayList`, `HashMap`, `HashSet`, and more — all generic, resizable, and type-safe. Java 8 added the **Streams API**, which lets you express data transformations (filter, map, sort, collect) as a declarative pipeline rather than manual loops. Together they cover 90% of real Java data processing.

## ArrayList&lt;E&gt;

```java
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");
        names.add("Dave");

        System.out.println("Size: " + names.size());
        System.out.println("First: " + names.get(0));

        names.remove("Bob");
        Collections.sort(names);

        for (String name : names) {
            System.out.println(name);
        }
    }
}
```

```text
Size: 4
First: Alice
Alice
Charlie
Dave
```

`ArrayList<String>` — a resizable array. The `<String>` is the type parameter: the list only accepts `String` values. The `<>` on the right is the **diamond operator** — the compiler infers the type.

`names.get(0)` — O(1) random access (unlike arrays, there is no `names[0]` syntax).
`names.remove("Bob")` — O(n) linear scan to find and remove the first matching element.
`Collections.sort(names)` — sorts alphabetically (uses `String.compareTo` which is lexicographic).

`for (String name : names)` — enhanced for loop. Works with any `Iterable<T>`.

## HashMap&lt;K, V&gt;

```java
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 92);
        scores.put("Bob", 78);
        scores.put("Charlie", 85);

        System.out.println(scores.get("Alice"));
        System.out.println(scores.containsKey("Dave"));
        scores.put("Bob", 80);

        for (var entry : scores.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
}
```

```text
92
false
Alice: 92
Bob: 80
Charlie: 85
```

`scores.put(key, value)` — inserts or overwrites (calling `put("Bob", 80)` replaces the old value 78).
`scores.get(key)` — O(1) average lookup. Returns `null` if the key does not exist.
`scores.containsKey(key)` — O(1) existence check.
`scores.entrySet()` — returns a `Set<Map.Entry<K,V>>`. Each entry has `getKey()` and `getValue()`.

**CS lens:** `HashMap` is a hash table: keys are hashed to bucket indices, values stored in the bucket. Average O(1) put/get; worst case O(n) with hash collisions. Iteration order is not guaranteed — use `LinkedHashMap` to preserve insertion order or `TreeMap` for sorted order.

## Streams API

```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> scores = Arrays.asList(88, 92, 75, 95, 83, 62, 91);

        List<Integer> passing = scores.stream()
            .filter(s -> s >= 70)
            .sorted()
            .collect(Collectors.toList());

        double avg = scores.stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0);

        List<String> labels = scores.stream()
            .map(s -> s >= 70 ? "pass" : "fail")
            .collect(Collectors.toList());

        System.out.println(passing);
        System.out.printf("Average: %.1f%n", avg);
        System.out.println(labels);
    }
}
```

```text
[75, 83, 88, 91, 92, 95]
Average: 83.7
[pass, pass, pass, pass, pass, fail, pass]
```

`scores.stream()` — creates a `Stream<Integer>` from the list. Streams are lazy — no computation happens yet.

`filter(predicate)` — keeps elements where the lambda returns `true`. Returns a `Stream<Integer>`.
`sorted()` — sorts in natural order. Returns a `Stream<Integer>`.
`collect(Collectors.toList())` — terminal operation that materialises the stream into a `List`.

`mapToInt(Integer::intValue)` — converts `Stream<Integer>` to an `IntStream` for numeric operations. `Integer::intValue` is a **method reference** — shorthand for `i -> i.intValue()`.
`.average()` — returns `OptionalDouble` (because an empty stream has no average).
`.orElse(0)` — unwraps the `OptionalDouble`, returning 0 if absent.

`map(s -> s >= 70 ? "pass" : "fail")` — transforms each `Integer` to a `String`. Returns `Stream<String>`.

**SE lens:** The Streams API follows the same lazy-pipeline model as LINQ in C# and generators in Python. Building the pipeline is cheap; computation happens only at the terminal operation (`collect`, `average`, `forEach`). This allows the JVM to fuse operations — a `filter` + `map` + `collect` can be executed in a single pass over the data.

## Challenge: word_frequency

Given a `List<String>` of words, write a method `HashMap<String, Integer> wordFrequency(List<String> words)` that returns a map from each word to the number of times it appears. Use a loop and `getOrDefault`.

`getOrDefault(key, defaultValue)` — returns the value for the key, or `defaultValue` if the key is absent.

```challenge
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class Main {
    static HashMap<String, Integer> wordFrequency(List<String> words) {
        // TODO
    }

    public static void main(String[] args) {
        List<String> words = new ArrayList<>();
        words.add("the"); words.add("quick"); words.add("brown");
        words.add("fox"); words.add("the"); words.add("quick");
        words.add("the");

        HashMap<String, Integer> freq = wordFrequency(words);
        System.out.println(freq.get("the"));
        System.out.println(freq.get("quick"));
        System.out.println(freq.get("fox"));
    }
}
```

```test
// Expected output:
// 3
// 2
// 1
```
