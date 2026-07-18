import type { PracticeChallenge } from './loader'

export const title = 'Optional (Java)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'java-program',
        prompt: 'Write `static Optional<String> findProduct(int id)` returning `Optional.of("Widget")` when `id == 100`, otherwise `Optional.empty()`. Call it with `100` and `999`; for each, print `.isPresent()` and `.map(String::toUpperCase).orElse("NOT FOUND")`.',
        starter: '',
        tests: `
assert output === 'true\\nWIDGET\\nfalse\\nNOT FOUND'
`,
        solution: `import java.util.Optional;

public class Main {
    static Optional<String> findProduct(int id) {
        return id == 100 ? Optional.of("Widget") : Optional.empty();
    }

    public static void main(String[] args) {
        Optional<String> found = findProduct(100);
        System.out.println(found.isPresent());
        System.out.println(found.map(String::toUpperCase).orElse("NOT FOUND"));

        Optional<String> missing = findProduct(999);
        System.out.println(missing.isPresent());
        System.out.println(missing.map(String::toUpperCase).orElse("NOT FOUND"));
    }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'java-program',
        prompt: 'Fix `main`: it calls `missing.get()` directly on an EMPTY `Optional`, which throws `NoSuchElementException` — exactly the kind of runtime crash `Optional` exists to help avoid. Replace `missing.get()` with `missing.orElse("NOT FOUND")`, which safely supplies a fallback instead of throwing.',
        starter: `import java.util.Optional;

public class Main {
    static Optional<String> findProduct(int id) {
        return id == 100 ? Optional.of("Widget") : Optional.empty();
    }

    public static void main(String[] args) {
        Optional<String> missing = findProduct(999);
        System.out.println(missing.get());
    }
}`,
        tests: `
assert output === 'NOT FOUND'
`,
        solution: `import java.util.Optional;

public class Main {
    static Optional<String> findProduct(int id) {
        return id == 100 ? Optional.of("Widget") : Optional.empty();
    }

    public static void main(String[] args) {
        Optional<String> missing = findProduct(999);
        System.out.println(missing.orElse("NOT FOUND"));
    }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'java-program',
        prompt: 'Write `static Optional<Integer> findScore(String name)` returning `Optional.of(95)` for `"Alice"`, `Optional.of(40)` for `"Bob"`, otherwise `Optional.empty()`. For each of `"Alice"`, `"Bob"`, `"Carol"`, compute `findScore(name).filter(s -> s >= 60)` (turns a present-but-failing score into an empty `Optional`), then print `.map(s -> "PASS: " + s).orElse("FAIL or MISSING")`.',
        starter: '',
        tests: `
assert output === 'PASS: 95\\nFAIL or MISSING\\nFAIL or MISSING'
`,
        solution: `import java.util.Optional;

public class Main {
    static Optional<Integer> findScore(String name) {
        if (name.equals("Alice")) return Optional.of(95);
        if (name.equals("Bob")) return Optional.of(40);
        return Optional.empty();
    }

    public static void main(String[] args) {
        Optional<Integer> passing = findScore("Alice").filter(s -> s >= 60);
        System.out.println(passing.map(s -> "PASS: " + s).orElse("FAIL or MISSING"));

        Optional<Integer> failing = findScore("Bob").filter(s -> s >= 60);
        System.out.println(failing.map(s -> "PASS: " + s).orElse("FAIL or MISSING"));

        Optional<Integer> missing = findScore("Carol").filter(s -> s >= 60);
        System.out.println(missing.map(s -> "PASS: " + s).orElse("FAIL or MISSING"));
    }
}`,
      },
    ],
  },
]

export default challenges
