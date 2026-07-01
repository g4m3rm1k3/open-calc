# Loops: Iteration, Streams, and the Cost of Repetition

Repetition is the heart of computation. Sorting a list requires comparing elements repeatedly. Rendering a frame in a game requires updating thousands of objects. Processing a file requires reading bytes one at a time. Every loop you write is ultimately the same primitive hardware instruction — a conditional backwards jump — repeated until a condition fails.

Java offers four loop constructs, each suited to different scenarios, and in Java 8 added the **Stream API** as a functional alternative. Choosing the right construct isn't just aesthetic — it affects readability, maintainability, and in some cases performance.

## The `for` Loop

```java
public class Main {
    public static void main(String[] args) {
        // Classic for loop
        for (int i = 0; i < 5; i++) {
            System.out.print(i + " ");
        }
        System.out.println();

        // Summing with a for loop
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
        }
        System.out.println("Sum 1-100: " + sum);  // 5050

        // Multiple variables, complex step
        for (int i = 0, j = 10; i < j; i++, j--) {
            System.out.print("(" + i + "," + j + ") ");
        }
        System.out.println();

        // Decrementing loop
        for (int i = 5; i >= 1; i--) {
            System.out.print(i + " ");
        }
        System.out.println();
    }
}
```

The loop variable `i` is scoped to the `for` block — it doesn't exist after the loop ends. This is considered good practice: minimize the lifetime of variables to where they're actually needed.

## The Enhanced `for` Loop (for-each)

Java 5 introduced the enhanced for loop for iterating over arrays and any class implementing `Iterable`:

```java
import java.util.List;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // Over an array
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int n : numbers) {
            sum += n;
        }
        System.out.println("Array sum: " + sum);

        // Over a List
        List<String> fruits = Arrays.asList("apple", "banana", "cherry");
        for (String fruit : fruits) {
            System.out.println("  " + fruit.toUpperCase());
        }

        // Over a String's chars (Java 8+)
        String word = "Hello";
        for (char c : word.toCharArray()) {
            System.out.print(c + "-");
        }
        System.out.println();
    }
}
```

The enhanced for loop is cleaner but has a limitation: you don't have the index. If you need the index, use a classic `for` loop or `IntStream.range()`.

## The `while` Loop

Use `while` when the number of iterations isn't known in advance:

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Classic while — runs while condition is true
        int n = 100;
        int steps = 0;
        while (n != 1) {
            if (n % 2 == 0) {
                n /= 2;
            } else {
                n = 3 * n + 1;  // Collatz sequence
            }
            steps++;
        }
        System.out.println("Collatz(100): " + steps + " steps");

        // Validating input
        int value = 0;
        var scanner = new Scanner(System.in);

        // Simulate validated input with a predetermined value
        value = 7;
        while (value <= 0 || value > 100) {
            System.out.print("Enter 1-100: ");
            value = scanner.nextInt();
        }
        System.out.println("Valid input: " + value);
    }
}
```

## The `do-while` Loop

`do-while` guarantees the body runs at least once — the condition is checked after the first iteration:

```java
public class Main {
    public static void main(String[] args) {
        // Menu loop: show menu at least once
        int choice = 0;
        do {
            System.out.println("1. Start");
            System.out.println("2. Settings");
            System.out.println("3. Exit");
            System.out.print("Choice: ");
            // Simulating choice = 3 for demo
            choice = 3;
            System.out.println(choice);
            System.out.println("Selected option " + choice);
        } while (choice != 3);

        System.out.println("Exiting...");

        // Newton-Raphson square root approximation
        double target = 2.0;
        double guess = target;
        double prev;
        do {
            prev = guess;
            guess = (guess + target / guess) / 2.0;
        } while (Math.abs(guess - prev) > 1e-12);

        System.out.printf("sqrt(%.1f) ≈ %.15f%n", target, guess);
        System.out.printf("Math.sqrt: %.15f%n", Math.sqrt(target));
    }
}
```

## `break`, `continue`, and Labeled Breaks

`break` exits the innermost loop. `continue` skips to the next iteration. Java also supports **labeled breaks** — a clean alternative to flag variables for breaking out of nested loops:

```java
public class Main {
    public static void main(String[] args) {
        // break: exit as soon as found
        int[] data = {3, 7, -1, 9, 4, 2};
        int firstNegative = -1;
        for (int n : data) {
            if (n < 0) {
                firstNegative = n;
                break;
            }
        }
        System.out.println("First negative: " + firstNegative);

        // continue: skip even numbers
        System.out.print("Odd numbers: ");
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) continue;
            System.out.print(i + " ");
        }
        System.out.println();

        // Labeled break: exit OUTER loop from inner loop
        outer:
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (i * j > 6) {
                    System.out.println("Breaking outer at i=" + i + " j=" + j);
                    break outer;  // Jumps past the outer for loop entirely
                }
                System.out.print("(" + i + "," + j + ") ");
            }
        }
        System.out.println("After outer loop");
    }
}
```

Labeled breaks (`break outer`) are Java's safer answer to `goto`. Unlike `goto`, labeled breaks can only jump *forward* to the end of a named block — never to an arbitrary location. They're rarely needed but genuinely useful when breaking out of multiple nested loops cleanly.

## The Stream API: Functional Iteration (Java 8+)

Java 8 introduced **Streams** — a declarative, functional approach to processing collections that often replaces explicit loops:

```java
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // Sum with reduce — no explicit loop
        int sum = numbers.stream()
            .reduce(0, Integer::sum);
        System.out.println("Sum: " + sum);

        // Filter and collect — find even numbers
        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        System.out.println("Evens: " + evens);

        // Map and collect — square each number
        List<Integer> squares = numbers.stream()
            .map(n -> n * n)
            .collect(Collectors.toList());
        System.out.println("Squares: " + squares);

        // Chain operations
        int sumOfSquaresOfEvens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .reduce(0, Integer::sum);
        System.out.println("Sum of squares of evens: " + sumOfSquaresOfEvens);

        // IntStream.range replaces indexed for loops
        System.out.print("FizzBuzz: ");
        IntStream.rangeClosed(1, 20)
            .mapToObj(n ->
                n % 15 == 0 ? "FizzBuzz" :
                n % 3  == 0 ? "Fizz" :
                n % 5  == 0 ? "Buzz" :
                String.valueOf(n))
            .forEach(s -> System.out.print(s + " "));
        System.out.println();
    }
}
```

Streams don't create intermediate collections — they pipeline lazily. `filter().map().reduce()` processes each element through the entire pipeline one at a time, not in three separate passes. For small collections the difference is negligible; for millions of elements it matters.

The choice between a loop and a stream is partly style, partly situation. Loops are clearer when you need `break`/`continue`, when side effects are central, or when you're modifying the collection. Streams are clearer for transforming and aggregating data without mutation. Modern Java style uses both — neither is universally "better."
