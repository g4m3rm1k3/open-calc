# SE Masterclass — LAB-04 — Objects, Hash Maps, and Hashing

**Language: Java**
*Why Java here:* Java makes every data-structure decision explicit. `HashMap<String, Integer>` declares the key type AND the value type — you cannot accidentally put a number where a string was expected. Static typing also reveals the `equals`/`hashCode` contract that every language's map relies on but most hide. Java teaches: `public class`, `static void main`, generics (`<K, V>`), `HashMap`, `ArrayList`, `for-each`, `javac` / `java` compile-and-run, and why two objects can be "equal" without being the same object.

**Prerequisites:** LAB-03 (Arrays, Iteration, Generators — Python).
This lab introduces a second data structure — the map — and a second paradigm: static typing. You will also build a miniature hash map from scratch.

**What this lab adds:**
- Compile and run a Java program from the terminal
- HashMap: store and retrieve values by key in O(1) time on average
- How hashing works internally: hash function → bucket index, separate chaining for collisions
- Build a minimal hash map from scratch — uses only an array and a list
- LinkedHashMap vs TreeMap vs HashMap — when each is the right choice
- The `equals`/`hashCode` contract — why breaking it silently corrupts every map

**Time:** 120–150 minutes

---

> **Quick Check — answer these before reading further:**
>
> 1. If `scores[2]` takes one step to execute regardless of list size, why does `scores.index("alice")` take longer for longer lists?
> 2. What do you think happens when two different keys produce the same hash value?
> 3. If `LinkedHashMap` and `HashMap` both store key-value pairs, what do you think the difference is?
> 4. Java is statically typed. What do you predict happens if you try to put a number into a `HashMap<String, String>`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, compiling and running `javac *.java && java Main` prints:

```
Lab 04 running

=== HashMap Basics ===
alice's score: 91
size: 3
bob in map: true
dave in map: false
after removing bob, size: 2

=== Iterating Entries ===
alice  → 91
carol  → 83

=== Word Counter ===
the     → 3
quick   → 1
brown   → 1
fox     → 1
jumps   → 1
over    → 1
lazy    → 1
dog     → 1

=== MinHashMap (built from scratch) ===
put("alice", 91)
put("bob",   75)
put("carol", 83)
get("alice") = 91
get("bob")   = 75
get("dave")  = null  ← key not found
contains("carol") = true
size = 3

=== Buckets (your hash map internals) ===
bucket[0]: []
bucket[1]: [(carol, 83)]
bucket[2]: []
bucket[3]: [(alice, 91)]
bucket[4]: [(bob, 75)]
bucket[5]: []
bucket[6]: []
bucket[7]: []

=== Collision Demo ===
put("aa", 1)
put("bB", 2)
bucket contents:
bucket[N]: [(aa, 1), (bB, 2)]  ← both in the same bucket (collision!)
get("aa") = 1
get("bB") = 2

=== LinkedHashMap ===
insertion order preserved:
alice  → 91
bob    → 75
carol  → 83

=== TreeMap (sorted) ===
sorted by key:
alice  → 91
bob    → 75
carol  → 83

=== equals and hashCode ===
p1.equals(p2): true
p1 == p2: false
map.get(p2): first point
```

Each section is produced by one step. The output grows as you add each step.

---

### Concept: Java — Compile and Run

**What it is:** Java is a **statically typed, compiled language**. Before your code runs, a tool called `javac` (the Java compiler) translates it from `.java` source text into `.class` bytecode. Then `java` (the JVM — Java Virtual Machine) executes the bytecode.

**The problem before (without static typing):**
```python
# Python — dynamic typing — no error until runtime
scores = {}
scores["alice"] = "ninety-one"   # string, not a number — no complaint
total = sum(scores.values())     # crashes here, at runtime
```

The mistake was made at the assignment line. The crash happens somewhere else entirely, potentially after shipping to users.

**The solution:**
```java
// Java — static typing — error at compile time, before code runs
HashMap<String, Integer> scores = new HashMap<>();
scores.put("alice", "ninety-one");   // ERROR: String cannot be put where Integer expected
// javac refuses to compile this file — the bug is caught before the program exists
```

**Two-step compilation:**
```
source file: Main.java
     ↓  javac Main.java  (compiler)
bytecode:    Main.class
     ↓  java Main        (JVM)
output:      prints to terminal
```

**Required boilerplate:**

```java
public class Main {
    public static void main(String[] args) {
        // your code goes here
    }
}
```

Every Java program starts at `public static void main(String[] args)`.
`public` — accessible from anywhere.
`static` — belongs to the class, not an instance.
`void` — returns nothing.
`String[] args` — the command-line arguments (an array of Strings).

**Verifying Java is installed:**

```
javac --version
java --version
```

If neither is found, install the JDK from https://adoptium.net — choose the latest LTS release.

---

### Concept: Java Types and Variables

**What it is:** In Java every variable is declared with its type. The type is a constraint the compiler enforces everywhere the variable is used.

**Primitive types:**

| Java type | What it holds | Equivalent concept |
|-----------|--------------|-------------------|
| `int`     | whole number, 32 bits, −2.1B to 2.1B | Python `int` (but bounded) |
| `long`    | whole number, 64 bits | Python `int` for big numbers |
| `double`  | decimal, 64-bit IEEE 754 float | Python `float` (same hardware, same imprecision) |
| `boolean` | `true` or `false` | Python `bool` |
| `char`    | single Unicode character | Python single-character `str` |

**Reference types:** `String`, `ArrayList`, `HashMap`, and every class you write are **reference types** — the variable holds a reference (pointer) to an object on the heap, exactly like objects in LAB-01.

**Variable declaration:**
```java
int count = 42;              // type  name  value
String name = "Alice";       // String is capitalised — it is a class, not a primitive
boolean isActive = true;
double score = 91.5;
```

**The for-each loop:**
```java
for (Type variable : collection) {
    // body
}
```
Java's equivalent of Python's `for variable in collection`. Works on arrays, lists, maps, and anything iterable.

**Running a Java program requires two steps:**
```
javac Main.java     # compile: creates Main.class (bytecode)
java Main           # run: executes the bytecode in the JVM
```

**Java is compiled, not interpreted.** The `javac` step catches type errors
before any code runs. This is the static typing contract: the compiler reads
your type declarations and rejects programs that violate them.

**Required boilerplate:**

```java
public class Main {
    public static void main(String[] args) {
        // your code goes here
    }
}
```

Every Java program starts at `public static void main(String[] args)`.
`public` — accessible from anywhere.
`static` — belongs to the class, not an instance.
`void` — returns nothing.
`String[] args` — the command-line arguments (an array of Strings).

**Declaring variables:**

```java
int age = 25;              // integer
double price = 9.99;       // floating point
String name = "Alice";     // text (String is a class, not a primitive)
boolean active = true;     // true or false
```

**Printing:**

```java
System.out.println("Hello, world!");    // equivalent to Python's print()
System.out.println("value: " + age);   // + concatenates strings and values
```

**Verifying Java is installed:**

```
javac --version
java --version
```

If neither is found, install the JDK from https://adoptium.net — choose the latest LTS release.

---

## Step 1 — Get Java Running

Create a folder `lab-04`. Inside it, create a file `Main.java`.

```java
public class Main {                          // ← every Java file needs a public class matching its filename
    public static void main(String[] args) { // ← the entry point — JVM calls this method to start
        System.out.println("Lab 04 running");// ← print to standard output (like Python's print())
    }
}
```

**Line by line:**
- `public class Main` — declares a class named `Main`. In Java, every runnable program is inside a class.
- `public static void main(String[] args)` — the entry point. `static` means it belongs to the class, not an instance. `void` means it returns nothing. `String[] args` is the command-line arguments array.
- `System.out.println(...)` — `System` is a built-in class. `out` is a stream that writes to the terminal. `println` appends a newline.

### SAVE AND TRY

Open your terminal in the `lab-04` folder. Run:

```
javac Main.java
java Main
```

**You should see:**
```
Lab 04 running
```

**In the terminal, try:**
```
java -version
```
**Expected:** Something like `java version "21.0.x"` or `openjdk version "21"`. If you see "command not found", install the JDK from https://adoptium.net.

**Change something:** Change `"Lab 04 running"` to your name. Compile and run again. You see your name. Change it back.

---

### Concept: HashMap — Key-Value Storage

**What it is:** A `HashMap<K, V>` stores key-value pairs. Given any key of type `K`, it returns the associated value of type `V` in **O(1) time on average** — one step, regardless of how many entries the map contains.

**The problem before — without a HashMap:**

```java
// Store student names and their scores in two parallel arrays
String[] names  = {"alice", "bob", "carol"};
int[]    scores = {91,      75,    83};

// To look up alice's score, scan the names array:
int aliceScore = -1;
for (int i = 0; i < names.length; i++) {
    if (names[i].equals("alice")) {     // scan every name
        aliceScore = scores[i];         // found — use the same index in scores
        break;
    }
}
// This is O(n) — it takes longer the more students you have
// Adding a student means updating TWO arrays at the same index
// If you forget to keep them in sync, you have a bug
```

**The solution:**

```java
HashMap<String, Integer> scores = new HashMap<>();
scores.put("alice", 91);   // store
scores.put("bob",   75);
scores.put("carol", 83);

int aliceScore = scores.get("alice");  // O(1) — one step regardless of map size
```

**What it hides (Law 7):** The HashMap hides:
1. The hash function computation (converting the key to a bucket index)
2. The bucket array management (how entries are stored internally)
3. Collision resolution (what happens when two keys map to the same bucket)
4. Resizing (growing the internal array when load gets high)

**The raw version:** The parallel array pattern above — O(n) search, two synchronized arrays, manual index tracking, no type safety.

**The protected invariant:** If you put a key-value pair into the map and the key is not subsequently overwritten, `get(key)` will always return the same value, in O(1) average time, regardless of how many other entries exist.

**The `<String, Integer>` syntax — Generics:**

```java
HashMap<String, Integer> scores = new HashMap<>();
//      ↑ key type       ↑ value type
//      keys are Strings, values are Integers
```

The angle brackets declare the types of keys and values. The compiler enforces this at every call site. `HashMap<String, Integer>` and `HashMap<Integer, String>` are entirely different types.

**Watch for:** `get(key)` returns `null` if the key does not exist. In Java, trying to unbox `null` into a primitive `int` throws `NullPointerException`. Use `containsKey(key)` before `get` when the key might be absent, or use `getOrDefault(key, fallback)`.

---

## Step 2 — HashMap Basics

Edit `Main.java`. Add the imports at the top and the new section inside `main`:

```java
import java.util.HashMap;   // ← add at top, before "public class Main"
import java.util.Map;       // ← add at top: needed for Map.Entry in Step 3

public class Main {
    public static void main(String[] args) {
        System.out.println("Lab 04 running");

        // === HashMap Basics ===
        System.out.println("\n=== HashMap Basics ===");  // ← add

        HashMap<String, Integer> scores = new HashMap<>();  // ← add: keys=String, values=Integer
        scores.put("alice", 91);   // ← add: store "alice" → 91
        scores.put("bob",   75);   // ← add: store "bob" → 75
        scores.put("carol", 83);   // ← add: store "carol" → 83

        System.out.println("alice's score: " + scores.get("alice"));  // ← add: + concatenates in Java
        System.out.println("size: " + scores.size());                 // ← add: number of entries

        System.out.println("bob in map: "  + scores.containsKey("bob"));    // ← add: true
        System.out.println("dave in map: " + scores.containsKey("dave"));  // ← add: false (never put)

        scores.remove("bob");  // ← add: remove the key-value pair with key "bob"
        System.out.println("after removing bob, size: " + scores.size());  // ← add: 2
    }
}
```

### SAVE AND TRY

```
javac Main.java
java Main
```

**Expected new section:**
```
=== HashMap Basics ===
alice's score: 91
size: 3
bob in map: true
dave in map: false
after removing bob, size: 2
```

**In the terminal, try:**
```
javac -cp . Main.java && java -cp . Main
```
This is the combined compile-and-run command you will use for the rest of the lab.

**Change something:** Call `scores.get("dave")` (a key that was never put) and print the result. You should see `null`. In Java, `null` means "no value" — the same concept as `None` in Python. Change it back.

---

## 🎯 Challenge: Frequency Counter

**You know:** `HashMap.put`, `HashMap.get`, `HashMap.containsKey`, `HashMap.getOrDefault`.

**Task:** Given an array of integers, use a HashMap to count how many times each number appears. Print each number and its count.

**Starting code** — add this inside `main` after the HashMap Basics section:
```java
int[] numbers = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};

HashMap<Integer, Integer> freq = new HashMap<>();
// TODO: for each number in numbers, increment its count in freq
// Hint: use getOrDefault(key, 0) to get the current count (defaulting to 0 if absent)
// Then put the incremented value back

// Expected output (any order):
// 1 → 2
// 2 → 1
// 3 → 2
// 4 → 1
// 5 → 3
// 6 → 1
// 9 → 1
```

<details>
<summary>▶ Show Solution</summary>

```java
for (int n : numbers) {
    int current = freq.getOrDefault(n, 0);
    freq.put(n, current + 1);
}

for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {
    System.out.println(entry.getKey() + " → " + entry.getValue());
}
```

**Key insight:** `getOrDefault` is the safe alternative to `get` when a key might not exist. The pattern `map.put(key, map.getOrDefault(key, 0) + 1)` is the standard frequency-counter idiom in Java. You will use this in the word counter (Step 4) and every time you need to group or count items.

</details>

---

### Concept: Iterating a HashMap

**What it is:** A HashMap is not a sequence — there is no index 0, 1, 2. To visit all entries you use one of three views: `keySet()` (just keys), `values()` (just values), or `entrySet()` (key-value pairs together).

**The three iteration views:**

```java
HashMap<String, Integer> scores = ...;

// 1. keySet() — iterate over keys only
for (String key : scores.keySet()) {
    System.out.println(key);
}

// 2. values() — iterate over values only
for (int val : scores.values()) {
    System.out.println(val);
}

// 3. entrySet() — iterate over key-value pairs together (most common)
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + " → " + entry.getValue());
}
```

**`Map.Entry<K, V>`:** An entry is a single key-value pair from inside the map. `entry.getKey()` returns the key. `entry.getValue()` returns the value.

**Watch for:** HashMap iteration order is **not guaranteed**. The order keys appear during iteration is determined by their hash values, not by when they were inserted. If you need consistent ordering, see Step 7 (LinkedHashMap preserves insertion order, TreeMap sorts by key).

---

## Step 3 — Iterating Entries

Add inside `main`, below the HashMap Basics section. (Make sure `import java.util.Map;` is at the top.)

```java
        // === Iterating Entries ===
        System.out.println("\n=== Iterating Entries ===");  // ← add

        // Re-create scores (we removed bob in Step 2)
        HashMap<String, Integer> scores2 = new HashMap<>();  // ← add
        scores2.put("alice", 91);
        scores2.put("carol", 83);

        for (Map.Entry<String, Integer> entry : scores2.entrySet()) {  // ← add
            System.out.printf("%-6s → %d%n", entry.getKey(), entry.getValue()); // ← add
            // %-6s = left-align string in 6 chars, %d = integer, %n = newline
        }
```

### SAVE AND TRY

```
javac Main.java && java Main
```

**Expected new section:**
```
=== Iterating Entries ===
alice  → 91
carol  → 83
```

**Change something:** Replace `entrySet()` with `keySet()` temporarily. Change the loop body to print just the key. Run. You see only the names. Change it back.

---

## Step 4 — Word Counter

Add to `main` below the Iterating Entries section:

```java
        // === Word Counter ===
        System.out.println("\n=== Word Counter ===");  // ← add

        String sentence = "the quick brown fox jumps over the lazy dog the";  // ← add
        String[] words = sentence.split(" ");   // ← add: split() breaks a String on spaces

        HashMap<String, Integer> wordCount = new HashMap<>();  // ← add

        for (String word : words) {                                    // ← add
            int count = wordCount.getOrDefault(word, 0);               // ← add: current count or 0
            wordCount.put(word, count + 1);                            // ← add: increment
        }

        for (Map.Entry<String, Integer> entry : wordCount.entrySet()) {  // ← add
            System.out.printf("%-8s → %d%n", entry.getKey(), entry.getValue());
        }
```

### SAVE AND TRY

```
javac Main.java && java Main
```

**Expected new section:**
```
=== Word Counter ===
the     → 3
quick   → 1
brown   → 1
fox     → 1
jumps   → 1
over    → 1
lazy    → 1
dog     → 1
```

*(Order may differ — HashMap does not guarantee iteration order.)*

**Change something:** Change the sentence to `"a b a c a b"`. Run. You should see `a → 3`, `b → 2`, `c → 1`. Change it back.

---

## 🎯 Challenge: Invert a Map

**Task:** Write a method that takes a `HashMap<String, Integer>` and returns a new `HashMap<Integer, String>` where keys and values are swapped.

```java
static HashMap<Integer, String> invertMap(HashMap<String, Integer> original) {
    HashMap<Integer, String> inverted = new HashMap<>();
    // TODO: for each entry in original, put (value, key) into inverted
    return inverted;
}

// In main:
HashMap<String, Integer> example = new HashMap<>();
example.put("alice", 1);
example.put("bob",   2);
example.put("carol", 3);
HashMap<Integer, String> inv = invertMap(example);
System.out.println(inv.get(1));   // alice
System.out.println(inv.get(2));   // bob
```

**Note:** `static` methods at the class level (outside `main`) are accessible without creating an instance. Place `invertMap` outside the `main` method but still inside `class Main`.

<details>
<summary>▶ Show Solution</summary>

```java
static HashMap<Integer, String> invertMap(HashMap<String, Integer> original) {
    HashMap<Integer, String> inverted = new HashMap<>();
    for (Map.Entry<String, Integer> entry : original.entrySet()) {
        inverted.put(entry.getValue(), entry.getKey());
    }
    return inverted;
}
```

**Key insight:** Map inversion only works correctly when values are unique. If two keys share the same value, one silently overwrites the other. You can detect duplicates by checking `inverted.containsKey(entry.getValue())` before putting.

</details>

---

## How a HashMap Works Internally

The previous steps showed what a HashMap does. Now you will understand **why** it is O(1).

---

### Math: Hash Functions and Modulo Indexing

**What it computes:** A **hash function** takes a key of any type and produces a fixed-size integer — the **hash code**. The hash code is reduced to a valid array index using the modulo operation.

**The real-world analogy:** A library has 26 filing cabinets, one per letter of the alphabet. You take any book title, look at the first letter, and go directly to that cabinet. You do not scan all 26 cabinets. The "first letter" is the hash function. The cabinet is the bucket.

**The modulo step:**
```
hash_code    = key.hashCode()                          // any integer, possibly very large or negative
bucket_index = Math.abs(hash_code) % BUCKET_COUNT      // force into range [0, BUCKET_COUNT-1]
```

**Example with 8 buckets:**
```
"alice".hashCode()   =  93029210
93029210   % 8   =  2       → bucket 2

"bob".hashCode()     =  97299
97299      % 8   =  3       → bucket 3
```

**The guarantee:** For the SAME key, `hashCode()` always returns the SAME value. So `"alice"` always maps to the same bucket. This makes `get("alice")` O(1): compute the hash, find the bucket, check the entries in that bucket.

**Why modulo:** `%` wraps any integer into the range `[0, BUCKET_COUNT-1]`. It is the mathematical equivalent of "which cabinet does this belong to?"

**Watch for:** The modulo of a negative number in Java is negative. `(-7) % 8 = -7` in Java. Always wrap with `Math.abs(key.hashCode()) % BUCKET_COUNT`, or use `(key.hashCode() & 0x7FFFFFFF) % BUCKET_COUNT` to strip the sign bit.

---

### Concept: Collision Handling — Separate Chaining

**What it is:** A **collision** occurs when two different keys produce the same bucket index. Separate chaining resolves collisions by storing a **list** at each bucket. When multiple keys hash to the same bucket, they are all stored in that bucket's list. Lookup scans the list for the exact key using `equals()`.

**Why collisions are unavoidable:** The number of possible keys is essentially infinite (any string, any integer). The number of buckets is finite (say, 8). By the Pigeonhole Principle, some keys MUST share a bucket.

**The structure:**
```
bucket array (size 8):
[0] → [ ]
[1] → [(carol, 83)]
[2] → [(alice, 91)]
[3] → [(bob, 75), (dave, 60)]  ← TWO entries sharing bucket 3 (collision!)
[4] → [ ]
...
```

Each bucket slot holds a list of `(key, value)` pairs — a **chain**. When you `get("bob")`, you go to bucket 3, then scan the chain for a pair where `key.equals("bob")`.

**Why O(1) average but O(n) worst case:**
- **Average:** If the hash function distributes keys evenly, each bucket holds about `n / BUCKET_COUNT` entries. For 100 entries in 100 buckets, each bucket holds ~1 entry. Lookup = 1 hash computation + 1 chain scan of 1 item = O(1).
- **Worst case:** If all keys hash to the same bucket, all `n` entries pile into one chain. Lookup scans all `n` = O(n). This is why a good hash function distributing keys evenly is essential.

**What it hides (Law 7):** The chain structure is entirely invisible from outside. You call `get("bob")` and get `75`. Whether the answer came from a one-entry bucket or a ten-entry chain is implementation detail. The invariant: the map always returns the correct value for any key regardless of how many collisions exist in the underlying structure.

---

## Step 5 — Build a MinHashMap from Scratch

Create a second file: `MinHashMap.java`

```java
import java.util.ArrayList;   // ← ArrayList is a resizable array — equivalent to Python's list

public class MinHashMap {

    private static final int BUCKET_COUNT = 8;  // ← number of buckets
                                                 // 'private' = only accessible inside this class
                                                 // 'static final' = a constant, same for all instances

    // Each bucket holds a list of [key, value] pairs
    private ArrayList<Object[]>[] buckets;   // ← an array of 8 ArrayLists

    public MinHashMap() {                           // ← constructor — called when you write 'new MinHashMap()'
        buckets = new ArrayList[BUCKET_COUNT];      // ← allocate the array of 8 slots
        for (int i = 0; i < BUCKET_COUNT; i++) {   // ← initialise each slot with an empty list
            buckets[i] = new ArrayList<>();         // ← without this, each slot is null
        }
    }

    private int bucketIndex(String key) {           // ← compute which bucket a key belongs to
        return Math.abs(key.hashCode()) % BUCKET_COUNT;  // ← abs prevents negative index
    }

    public void put(String key, int value) {        // ← store or update a key-value pair
        int idx = bucketIndex(key);
        ArrayList<Object[]> chain = buckets[idx];

        // If the key already exists, update it in place
        for (Object[] pair : chain) {
            if (pair[0].equals(key)) {              // ← equals() compares content, not memory address
                pair[1] = value;
                return;
            }
        }

        // Key not found — append a new pair
        chain.add(new Object[]{key, value});
        System.out.println("put(\"" + key + "\", " + value + ")");  // ← trace output
    }

    public Integer get(String key) {                // ← returns Integer so we can return null for "not found"
        int idx = bucketIndex(key);
        ArrayList<Object[]> chain = buckets[idx];

        for (Object[] pair : chain) {
            if (pair[0].equals(key)) {
                return (Integer) pair[1];           // ← cast Object back to Integer
            }
        }
        return null;                                // ← key not found
    }

    public boolean containsKey(String key) {
        return get(key) != null;                    // ← reuse get() — null means absent
    }

    public int size() {                             // ← count all entries across all buckets
        int total = 0;
        for (ArrayList<Object[]> chain : buckets) {
            total += chain.size();
        }
        return total;
    }

    public void printBuckets() {                    // ← diagnostic — show internal structure
        for (int i = 0; i < BUCKET_COUNT; i++) {
            System.out.print("bucket[" + i + "]: [");
            ArrayList<Object[]> chain = buckets[i];
            for (int j = 0; j < chain.size(); j++) {
                if (j > 0) System.out.print(", ");
                System.out.print("(" + chain.get(j)[0] + ", " + chain.get(j)[1] + ")");
            }
            System.out.println("]");
        }
    }
}
```

### SAVE AND TRY

```
javac MinHashMap.java
```

**Expected:** No output — a successful compile. `MinHashMap.class` appears. If you see errors, check every `{` has a matching `}`.

**Change something:** Change `BUCKET_COUNT` from `8` to `1`. Compile. What do you predict will happen to `bucketIndex`? (Hint: any number `% 1 = 0`.) Every key will land in bucket 0. Change it back to `8` before continuing.

---

## Step 6 — Use MinHashMap

Back in `Main.java`, add the MinHashMap section:

```java
        // === MinHashMap (built from scratch) ===
        System.out.println("\n=== MinHashMap (built from scratch) ===");  // ← add

        MinHashMap myMap = new MinHashMap();
        myMap.put("alice", 91);
        myMap.put("bob",   75);
        myMap.put("carol", 83);

        System.out.println("get(\"alice\") = " + myMap.get("alice"));
        System.out.println("get(\"bob\")   = " + myMap.get("bob"));
        System.out.println("get(\"dave\")  = " + myMap.get("dave") + "  ← key not found");
        System.out.println("contains(\"carol\") = " + myMap.containsKey("carol"));
        System.out.println("size = " + myMap.size());

        System.out.println("\n=== Buckets (your hash map internals) ===");
        myMap.printBuckets();
```

### SAVE AND TRY

```
javac *.java
java Main
```

*(`*.java` compiles every Java file in the folder at once.)*

**Expected new sections:**
```
=== MinHashMap (built from scratch) ===
put("alice", 91)
put("bob",   75)
put("carol", 83)
get("alice") = 91
get("bob")   = 75
get("dave")  = null  ← key not found
contains("carol") = true
size = 3

=== Buckets (your hash map internals) ===
bucket[0]: []
bucket[1]: [(carol, 83)]
bucket[2]: []
bucket[3]: [(alice, 91)]
bucket[4]: [(bob, 75)]
bucket[5]: []
bucket[6]: []
bucket[7]: []
```

*(Your bucket assignments may differ depending on JVM version.)*

**In the terminal, experiment:** Add a temporary block to see the hash codes directly:
```java
System.out.println("alice bucket: " + (Math.abs("alice".hashCode()) % 8));
System.out.println("bob bucket:   " + (Math.abs("bob".hashCode()) % 8));
System.out.println("carol bucket: " + (Math.abs("carol".hashCode()) % 8));
```
Run. The numbers match the bucket printout. Remove the temporary block.

**Change something:** Call `myMap.put("alice", 99)` — the same key with a different value. Run. The `put` trace does NOT print a second time (because the key already exists and we update in place). Then call `myMap.get("alice")` — it returns `99`. Change it back.

---

## 🎯 Challenge: Handle Collisions

**The fact:** In Java, `"aa".hashCode()` and `"bB".hashCode()` produce the same value. Both strings map to the same bucket.

**Task:** Add a collision demonstration to `Main.java`:
1. Create a new `MinHashMap`
2. Put `("aa", 1)` and `("bB", 2)` into it
3. Print the bucket contents — you should see BOTH entries in the same bucket
4. Verify that `get("aa")` returns `1` and `get("bB")` returns `2` despite the collision

```java
        // === Collision Demo ===
        System.out.println("\n=== Collision Demo ===");

        MinHashMap collisionDemo = new MinHashMap();
        // TODO: put "aa" and "bB", print buckets, verify get() returns correct values
```

<details>
<summary>▶ Show Solution</summary>

```java
        MinHashMap collisionDemo = new MinHashMap();
        collisionDemo.put("aa", 1);
        collisionDemo.put("bB", 2);  // same hash code as "aa" — goes into same bucket

        System.out.println("bucket contents:");
        collisionDemo.printBuckets();

        System.out.println("get(\"aa\") = " + collisionDemo.get("aa"));  // 1
        System.out.println("get(\"bB\") = " + collisionDemo.get("bB"));  // 2
```

**Key insight:** The chain (list) in each bucket is what makes collisions safe. When `get("aa")` is called and the bucket contains `[(aa, 1), (bB, 2)]`, the scan uses `pair[0].equals(key)` to find the exact match. `"aa".equals("aa")` is `true`. `"aa".equals("bB")` is `false`. The correct value is returned every time. If many keys collide into one bucket, `get` scans all of them — O(chain_length) instead of O(1). This is why a good hash function distributing keys evenly matters.

</details>

---

### Concept: LinkedHashMap — Insertion Order Preserved

**What it is:** `LinkedHashMap<K, V>` is a HashMap that additionally maintains a doubly-linked list connecting entries in insertion order. When you iterate, entries appear in the order they were `put`.

**When to use:**
- You need O(1) lookup **and** predictable iteration order
- Example: a FIFO cache — evict entries in insertion order
- Example: recording the order users joined a session while also looking up each user by ID

**The tradeoff:** Each entry stores two extra pointers (prev, next in the linked list). Slightly more memory and slightly slower insertion than HashMap. The trade buys you ordered iteration.

```java
import java.util.LinkedHashMap;

LinkedHashMap<String, Integer> ordered = new LinkedHashMap<>();
ordered.put("carol", 83);
ordered.put("alice", 91);   // inserted second
ordered.put("bob",   75);   // inserted third

for (String key : ordered.keySet()) {
    System.out.println(key);  // carol, alice, bob — insertion order guaranteed
}
```

---

### Concept: TreeMap — Sorted by Key

**What it is:** `TreeMap<K, V>` stores entries in a **red-black tree** — a self-balancing binary search tree. Keys are always kept in sorted order. `get`, `put`, and `remove` are O(log n) — slower than HashMap's O(1) average, but keys come out sorted when iterated.

**When to use:**
- You need entries iterated in key order (alphabetically, numerically, or by custom comparator)
- You need range queries: `firstKey()`, `lastKey()`, `headMap(toKey)`, `tailMap(fromKey)`
- Example: a dictionary that always returns words alphabetically, a leaderboard sorted by score

**When to use which:**

| | HashMap | LinkedHashMap | TreeMap |
|--|---------|---------------|---------|
| Lookup speed | O(1) avg | O(1) avg | O(log n) |
| Iteration order | None (unpredictable) | Insertion order | Sorted by key |
| Memory | Lowest | Medium | Highest |
| Use when | Speed matters, order irrelevant | Need insertion order | Need sorted keys or range queries |

---

## Step 7 — LinkedHashMap and TreeMap

Add imports at the top:

```java
import java.util.LinkedHashMap;   // ← add at top
import java.util.TreeMap;         // ← add at top
```

Then inside `main`:

```java
        // === LinkedHashMap ===
        System.out.println("\n=== LinkedHashMap ===");
        System.out.println("insertion order preserved:");

        LinkedHashMap<String, Integer> linked = new LinkedHashMap<>();
        linked.put("alice", 91);
        linked.put("bob",   75);
        linked.put("carol", 83);

        for (Map.Entry<String, Integer> entry : linked.entrySet()) {
            System.out.printf("%-6s → %d%n", entry.getKey(), entry.getValue());
        }

        // === TreeMap (sorted) ===
        System.out.println("\n=== TreeMap (sorted) ===");
        System.out.println("sorted by key:");

        TreeMap<String, Integer> tree = new TreeMap<>();
        tree.put("carol", 83);     // inserted out of alphabetical order
        tree.put("alice", 91);
        tree.put("bob",   75);

        for (Map.Entry<String, Integer> entry : tree.entrySet()) {
            System.out.printf("%-6s → %d%n", entry.getKey(), entry.getValue());
            // output will be alphabetical regardless of insertion order
        }
```

### SAVE AND TRY

```
javac *.java && java Main
```

**Expected new sections:**
```
=== LinkedHashMap ===
insertion order preserved:
alice  → 91
bob    → 75
carol  → 83

=== TreeMap (sorted) ===
sorted by key:
alice  → 91
bob    → 75
carol  → 83
```

**In the terminal:** Add temporary lines to demonstrate TreeMap range queries:
```java
System.out.println(tree.headMap("c"));  // all keys < "c": {alice=91, bob=75}
System.out.println(tree.tailMap("b"));  // all keys >= "b": {bob=75, carol=83}
```
Run. You see sub-maps. HashMap has no equivalent. Remove the temporary lines.

**Change something:** On the TreeMap, call `tree.firstKey()` and `tree.lastKey()`. Print them. You see `"alice"` and `"carol"` — the alphabetically first and last keys. Change it back.

---

### Concept: `equals()` and `hashCode()` — the Contract

**What it is:** When Java uses an object as a HashMap key, it calls two methods: `hashCode()` (to find the bucket) and `equals()` (to find the exact entry within the bucket). These two methods have a contract: **if two objects are equal, they must produce the same hash code**.

**What breaks when you violate the contract:**

```java
// A class with a broken contract — equals() works but hashCode() doesn't
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object obj) {
        Point other = (Point) obj;
        return this.x == other.x && this.y == other.y;
    }
    // hashCode() NOT overridden — uses Object's default: based on memory address
    // Two Point(1,2) instances have different addresses → different hash codes
}

HashMap<Point, String> map = new HashMap<>();
Point p1 = new Point(1, 2);
map.put(p1, "origin");

Point p2 = new Point(1, 2);  // same x, y — logically equal
System.out.println(p1.equals(p2));   // true  — equals says they're the same
System.out.println(map.get(p2));     // null! — hashCode put p1 and p2 in different buckets
                                     // get() never finds the entry — it looks in the wrong bucket
```

**The fix — override both:**

```java
@Override
public int hashCode() {
    return 31 * x + y;   // same x,y → same hash → same bucket → equals() finds them
}
```

**The rule:** Whenever you override `equals()`, you MUST also override `hashCode()`. Java's `@Override` annotation tells the compiler you are intentionally replacing the parent's method.

**What it hides (Law 7):** The HashMap hides the lookup mechanism. As long as the contract is maintained, the caller never thinks about buckets. The invariant: any object that passes `equals()` as a key lookup will find the entry that was `put` using any `equals()`-identical key.

---

## Step 8 — equals and hashCode

Create a new file `Point.java`:

```java
public class Point {
    public int x;    // ← x coordinate — 'public' makes it accessible from Main
    public int y;    // ← y coordinate

    public Point(int x, int y) {   // ← constructor
        this.x = x;                // ← 'this.x' = the field, 'x' = the constructor parameter
        this.y = y;
    }

    @Override                                       // ← '@Override' = we are replacing the method from Object
    public boolean equals(Object obj) {
        if (!(obj instanceof Point)) return false;  // ← guard — only compare with other Points
        Point other = (Point) obj;                  // ← cast — treat obj as a Point
        return this.x == other.x && this.y == other.y;  // ← equal if both coordinates match
    }

    @Override
    public int hashCode() {              // ← must match equals — same x,y must give same hash
        return 31 * x + y;              // ← prime multiplier (31) reduces collisions in practice
    }

    @Override
    public String toString() {           // ← what Java prints when you do System.out.println(point)
        return "(" + x + ", " + y + ")";
    }
}
```

Add to `Main.java`:

```java
        // === equals and hashCode ===
        System.out.println("\n=== equals and hashCode ===");

        HashMap<Point, String> pointMap = new HashMap<>();

        Point p1 = new Point(1, 2);
        pointMap.put(p1, "first point");

        Point p2 = new Point(1, 2);          // DIFFERENT object, same coordinates
        System.out.println("p1.equals(p2): " + p1.equals(p2));  // true — same coordinates
        System.out.println("p1 == p2: " + (p1 == p2));          // false — different objects in memory
        System.out.println("map.get(p2): " + pointMap.get(p2)); // "first point" — contract holds
```

### SAVE AND TRY

```
javac *.java && java Main
```

**Expected new section:**
```
=== equals and hashCode ===
p1.equals(p2): true
p1 == p2: false
map.get(p2): first point
```

**In the terminal, experiment with the contract violation.** Temporarily comment out the `hashCode()` method in `Point.java` (add `//` before every line of that method). Recompile and run. You should now see `map.get(p2): null` — the contract is broken, the map cannot find the entry. Restore `hashCode()`.

**Change something:** Change `p2` to `new Point(1, 3)` — different `y`. Run. `p1.equals(p2)` becomes `false`. `map.get(p2)` returns `null`. Change it back.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `javac *.java && java Main` runs without errors | No red text, all sections print |
| `scores.get("alice")` returns `91` | Step 2 output |
| `scores.containsKey("dave")` returns `false` | Step 2 output |
| `scores.remove("bob")` reduces size to `2` | Step 2 output |
| `entrySet()` iterates key-value pairs | Step 3 output shows `alice → 91` etc. |
| Word counter counts "the" as `3` | Step 4 output |
| MinHashMap.put stores entries in correct buckets | `printBuckets()` output in Step 6 |
| MinHashMap.get returns `null` for absent key | `get("dave")` = null |
| Two identical hash strings `"aa"` and `"bB"` collide into same bucket | Collision demo |
| Both values retrieved correctly after collision | `get("aa")=1`, `get("bB")=2` |
| LinkedHashMap iterates in insertion order | `alice, bob, carol` — the order they were put |
| TreeMap iterates in alphabetical order regardless of insertion order | `alice, bob, carol` even when carol was put first |
| `p1.equals(p2)` returns `true` for same-coordinate Points | Step 8 output |
| `pointMap.get(p2)` finds entry put with `p1` | `hashCode()` contract maintained |
| You can explain O(1) average and O(n) worst case for HashMap | Without notes |
| You can explain what breaks when `hashCode()` is not overridden with `equals()` | Without notes |

---

## Quick Check Answers

**1. If `scores[2]` takes one step, why does `scores.index("alice")` take longer for longer lists?**

`scores[2]` uses direct address calculation: `base_address + 2 × element_size` — one arithmetic operation. This is O(1) because the computer jumps directly to the right slot (explained in LAB-03's memory layout section).

`scores.index("alice")` must scan the list from position 0, comparing each element against `"alice"` until it finds a match or reaches the end. In the worst case ("alice" is last or absent), it inspects every element. This is O(n) — proportional to list length. A HashMap solves exactly this problem: instead of scanning, it computes the bucket index in one step via the hash function and jumps there directly.

**2. What happens when two different keys produce the same hash value?**

A **collision** occurs. The HashMap uses **separate chaining**: each bucket holds a list, and colliding entries are appended to that list. When `get` is called, the map goes to the correct bucket (O(1) via hash), then scans the short chain for an entry where `key.equals(targetKey)` — typically O(1) in practice because chains are short. The `MinHashMap` you built demonstrates this: `"aa"` and `"bB"` share a bucket, yet `get("aa")` and `get("bB")` return correct values because `equals()` identifies the exact entry.

**3. What is the difference between `LinkedHashMap` and `HashMap`?**

Both offer O(1) average `get`/`put`/`remove`. The difference is iteration order. `HashMap` makes no guarantee about iteration order — it depends on hash values and is effectively unpredictable from the caller's perspective. `LinkedHashMap` maintains a doubly-linked list connecting all entries in the order they were `put`. Iteration always visits entries in insertion order. The cost: each entry stores two extra pointers. The benefit: predictable iteration order without sorting.

**4. What happens if you try to put a number into a `HashMap<String, String>`?**

A compile-time error. The Java compiler rejects the code before it runs. `HashMap<String, String>` declares that values must be `String`. If you call `map.put("key", 42)`, `javac` reports: incompatible types. The program does not compile. This is the key advantage of static typing — an entire class of bugs that only surface at runtime in Python are caught before the code ever runs in Java.

---

*Next: [LAB-05 — Stacks and Queues](LAB-05-stacks-and-queues.md)*