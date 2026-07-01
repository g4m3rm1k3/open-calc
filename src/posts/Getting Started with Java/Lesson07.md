# Arrays and Strings: Memory, Immutability, and the Heap

When Java's designers chose to make all objects heap-allocated, they made a tradeoff. Heap allocation means the garbage collector can manage memory automatically — no `delete`, no dangling pointers. The cost: every object, including arrays and strings, requires a heap allocation and a reference. This is very different from C++, where `int arr[10]` on the stack is just 40 contiguous bytes.

Understanding how Java's arrays and strings work at the memory level isn't pedantic — it explains `NullPointerException`, why `==` fails on strings, and why `String` concatenation in a loop is slow.

## Arrays: Fixed-Size, Heap-Allocated

In Java, an array is an object. Declaring `int[] arr` creates a **reference variable** — initially `null`. The array itself is created with `new`:

```java
public class Main {
    public static void main(String[] args) {
        // Declaration: arr is a reference, currently null
        int[] arr;
        // arr[0] = 5;  // NullPointerException! arr doesn't point to anything yet

        // Creation: allocates the array object on the heap
        arr = new int[5];  // 5 elements, all initialized to 0

        // Assign values
        arr[0] = 10; arr[1] = 20; arr[2] = 30; arr[3] = 40; arr[4] = 50;

        // Length: a built-in field (not a method call)
        System.out.println("Length: " + arr.length);

        // Bounds checking: Java always checks — no buffer overflows
        try {
            System.out.println(arr[10]);  // ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        // Array initializer shorthand
        double[] scores = {95.5, 82.0, 91.5, 78.0, 88.5};

        // Iterate
        double total = 0;
        for (double s : scores) total += s;
        System.out.printf("Average: %.2f%n", total / scores.length);
    }
}
```

Java's bounds checking is one of the key safety guarantees Gosling built in. In C++, `arr[100]` on a 5-element array silently reads (or writes) memory beyond the array — a buffer overflow. Java throws `ArrayIndexOutOfBoundsException` immediately. This costs a small performance overhead on every array access, but eliminates the most exploited class of C/C++ vulnerabilities.

## Multidimensional Arrays

Java's multidimensional arrays are actually **arrays of arrays** — each row can have a different length (a "jagged array"):

```java
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 2D array (matrix)
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        // Access: row then column
        System.out.println("Center: " + matrix[1][1]);  // 5

        // Dimensions
        System.out.println("Rows: " + matrix.length);
        System.out.println("Cols in row 0: " + matrix[0].length);

        // Print matrix
        for (int[] row : matrix) {
            System.out.println(Arrays.toString(row));
        }

        // Jagged array — rows have different lengths
        int[][] triangle = new int[5][];
        for (int i = 0; i < 5; i++) {
            triangle[i] = new int[i + 1];
            for (int j = 0; j <= i; j++) {
                triangle[i][j] = i + j;
            }
        }
        for (int[] row : triangle) {
            System.out.println(Arrays.toString(row));
        }
    }
}
```

## The `java.util.Arrays` Utility

Java provides `java.util.Arrays` with common array operations:

```java
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] data = {5, 2, 8, 1, 9, 3, 7, 4, 6};

        // Sort (in-place, modifies array)
        Arrays.sort(data);
        System.out.println("Sorted: " + Arrays.toString(data));

        // Binary search (requires sorted array)
        int idx = Arrays.binarySearch(data, 7);
        System.out.println("Index of 7: " + idx);

        // Copy
        int[] copy = Arrays.copyOf(data, data.length);
        int[] partial = Arrays.copyOfRange(data, 2, 6);
        System.out.println("Partial: " + Arrays.toString(partial));

        // Fill
        int[] zeros = new int[5];
        Arrays.fill(zeros, 42);
        System.out.println("Filled: " + Arrays.toString(zeros));

        // Equality
        System.out.println("Equal: " + Arrays.equals(data, copy));

        // 2D comparison
        int[][] a = {{1, 2}, {3, 4}};
        int[][] b = {{1, 2}, {3, 4}};
        System.out.println("2D equal: " + Arrays.deepEquals(a, b));
    }
}
```

## Strings: Immutable, Interned, and Expensive to Concatenate

The most important fact about `String` in Java: **strings are immutable**. Once a `String` object is created, its content never changes. Every operation that seems to modify a string — `concat`, `replace`, `toUpperCase` — actually creates a **new** `String` object.

```java
public class Main {
    public static void main(String[] args) {
        String s = "Hello";
        String t = s.toUpperCase();  // Creates a new String "HELLO"
        System.out.println(s);  // "Hello" — unchanged
        System.out.println(t);  // "HELLO"

        // Common String methods
        String str = "  Hello, World!  ";
        System.out.println(str.length());           // 17
        System.out.println(str.trim());             // "Hello, World!"
        System.out.println(str.trim().toLowerCase()); // "hello, world!"
        System.out.println(str.contains("World"));  // true
        System.out.println(str.replace("World", "Java")); // "  Hello, Java!  "
        System.out.println(str.trim().startsWith("Hello")); // true
        System.out.println(str.trim().indexOf(","));  // 5

        // Splitting
        String csv = "one,two,three,four";
        String[] parts = csv.split(",");
        System.out.println("Parts: " + parts.length);  // 4
        for (String part : parts) System.out.print(part + " ");
        System.out.println();

        // charAt and substring
        String word = "programming";
        System.out.println(word.charAt(0));            // 'p'
        System.out.println(word.substring(0, 7));      // "program"
        System.out.println(word.substring(7));         // "ming"
    }
}
```

## `StringBuilder`: Mutable String Building

Because `String` is immutable, concatenating in a loop creates a new object on every iteration — O(n²) total work for n concatenations. `StringBuilder` is mutable and avoids this:

```java
public class Main {
    public static void main(String[] args) {
        // Naive concatenation — creates n intermediate Strings
        String slow = "";
        for (int i = 0; i < 5; i++) {
            slow += i + ", ";  // Each += creates a new String object
        }
        System.out.println("Slow: " + slow);

        // StringBuilder — mutates in place, O(n) total
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sb.append(i);
            if (i < 4) sb.append(", ");
        }
        System.out.println("Fast: " + sb.toString());

        // StringBuilder has a full API
        StringBuilder builder = new StringBuilder("Hello");
        builder.append(", World");       // "Hello, World"
        builder.insert(5, "!");          // "Hello!, World"
        builder.delete(5, 6);           // "Hello, World"
        builder.replace(7, 12, "Java"); // "Hello, Java"
        builder.reverse();              // "avaJ ,olleH"
        System.out.println(builder);
    }
}
```

The rule: use `+` for simple concatenation (the compiler optimizes single-expression chains automatically). Use `StringBuilder` when building strings in loops or when you need fine-grained control over the building process.

## String Formatting

Java offers several ways to produce formatted strings:

```java
public class Main {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 30;
        double gpa = 3.875;

        // printf — like C, doesn't return a String
        System.out.printf("Name: %s, Age: %d, GPA: %.2f%n", name, age, gpa);

        // String.format — returns a formatted String
        String msg = String.format("Student %s (age %d) has GPA %.2f", name, age, gpa);
        System.out.println(msg);

        // formatted() method on String (Java 15+)
        String msg2 = "Name: %s, GPA: %.3f".formatted(name, gpa);
        System.out.println(msg2);

        // Text blocks (Java 15+) — multi-line strings without escape hell
        String json = """
                {
                    "name": "%s",
                    "age": %d,
                    "gpa": %.2f
                }
                """.formatted(name, age, gpa);
        System.out.println(json);
    }
}
```

Text blocks (the `"""..."""` syntax, Java 15+) are a major quality-of-life improvement for multi-line strings — SQL queries, JSON templates, HTML fragments. The leading whitespace is automatically stripped based on indentation.

## String Interning and the Pool

Java maintains a **string pool** — a set of `String` objects that are shared when string literals have the same content. This is why `"hello" == "hello"` evaluates to `true` — both references point to the same pooled object:

```java
public class Main {
    public static void main(String[] args) {
        // String literals are pooled
        String a = "hello";
        String b = "hello";
        System.out.println("Literals == : " + (a == b));        // true (same pool entry)
        System.out.println("Literals equals: " + a.equals(b));  // true

        // new String() bypasses the pool
        String c = new String("hello");
        System.out.println("new == literal: " + (a == c));      // false!
        System.out.println("new equals literal: " + a.equals(c)); // true

        // intern() explicitly adds to the pool
        String d = c.intern();
        System.out.println("interned == literal: " + (a == d)); // true

        // Lesson: NEVER use == for string comparison
        // Always use .equals() or .equalsIgnoreCase()
    }
}
```

The string pool is a performance optimization — it saves memory when the same string literal appears many times. But it creates the notorious trap where `==` seems to work for string comparison until it mysteriously doesn't. Memorize the rule: **string comparison in Java is always `.equals()`**, no exceptions.
