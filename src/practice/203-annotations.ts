import type { PracticeChallenge } from './loader'

export const title = 'Annotations (Java)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'java-program',
        prompt: 'Write `Vehicle` with `describe()` returning `"generic vehicle"`, and `Car extends Vehicle` with `@Override public String describe()` returning `"a car"`. Write `@Deprecated static void legacyStart()` that prints `"starting the old way (deprecated)"`. In `main`, assign `Vehicle v = new Car();`, print `v.describe()`, then call `legacyStart()` — `@Deprecated` only warns, it doesn\'t prevent the call.',
        starter: '',
        tests: `
assert output === 'a car\\nstarting the old way (deprecated)'
`,
        solution: `public class Main {
    static class Vehicle {
        public String describe() { return "generic vehicle"; }
    }

    static class Car extends Vehicle {
        @Override
        public String describe() {
            return "a car";
        }
    }

    @Deprecated
    static void legacyStart() {
        System.out.println("starting the old way (deprecated)");
    }

    public static void main(String[] args) {
        Vehicle v = new Car();
        System.out.println(v.describe());

        legacyStart();
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
        prompt: 'Fix `Car`: its method is misspelled `descirbe()` (typo) with NO `@Override` — since there\'s no `@Override` to make the compiler verify it actually overrides something, this typo silently compiles as an unrelated NEW method, and `v.describe()` still dispatches to `Vehicle`\'s `"generic vehicle"` instead of `Car`\'s intended `"a car"`. Fix the typo to `describe()` and add `@Override`, so the compiler would have caught a mismatch like this.',
        starter: `public class Main {
    static class Vehicle {
        public String describe() { return "generic vehicle"; }
    }

    static class Car extends Vehicle {
        public String descirbe() {
            return "a car";
        }
    }

    public static void main(String[] args) {
        Vehicle v = new Car();
        System.out.println(v.describe());
    }
}`,
        tests: `
assert output === 'a car'
`,
        solution: `public class Main {
    static class Vehicle {
        public String describe() { return "generic vehicle"; }
    }

    static class Car extends Vehicle {
        @Override
        public String describe() {
            return "a car";
        }
    }

    public static void main(String[] args) {
        Vehicle v = new Car();
        System.out.println(v.describe());
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
        prompt: 'Define a custom runtime annotation `@interface Test` with `@Retention(RetentionPolicy.RUNTIME)`. In `Suite`, annotate `testAdd()` and `testSubtract()` (each returning a descriptive string) with `@Test`, and leave `helper()` unannotated. In `main`, use `Suite.class.getDeclaredMethods()` plus `m.isAnnotationPresent(Test.class)` to find and `.invoke()` ONLY the `@Test`-annotated methods, collecting their return values into a `List`, then `Collections.sort()` it before printing its size and contents — demonstrating that the annotation itself does nothing until reflection explicitly reads it.',
        starter: '',
        tests: `
assert output === '2\\n[testAdd: 5, testSubtract: 2]'
`,
        solution: `import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

public class Main {
    @Retention(RetentionPolicy.RUNTIME)
    @interface Test {
    }

    static class Suite {
        @Test
        public String testAdd() {
            return "testAdd: " + (2 + 3);
        }

        public String helper() {
            return "helper: not a test";
        }

        @Test
        public String testSubtract() {
            return "testSubtract: " + (5 - 3);
        }
    }

    public static void main(String[] args) throws Exception {
        Suite suite = new Suite();
        List<String> results = new ArrayList<>();
        for (Method m : Suite.class.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Test.class)) {
                results.add((String) m.invoke(suite));
            }
        }
        Collections.sort(results);
        System.out.println(results.size());
        System.out.println(results);
    }
}`,
      },
    ],
  },
]

export default challenges
