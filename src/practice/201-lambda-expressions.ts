import type { PracticeChallenge } from './loader'

export const title = 'Lambda Expressions (Java)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'java-program',
        prompt: 'Declare `interface MathOp { int apply(int a, int b); }`. Given `List<Integer> nums = new ArrayList<>(List.of(5, 2, 9, 1))`, sort it descending using a lambda assigned to a `Comparator<Integer>` (`(a, b) -> b - a`) and print it. Then create two `MathOp` lambdas, `add` (`(a, b) -> a + b`) and `multiply` (`(a, b) -> a * b`), and print `add.apply(3, 4)` and `multiply.apply(3, 4)`.',
        starter: '',
        tests: `
assert output === '[9, 5, 2, 1]\\n7\\n12'
`,
        solution: `import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;

public class Main {
    interface MathOp {
        int apply(int a, int b);
    }

    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(5, 2, 9, 1));

        Comparator<Integer> descending = (a, b) -> b - a;
        nums.sort(descending);
        System.out.println(nums);

        MathOp add = (a, b) -> a + b;
        MathOp multiply = (a, b) -> a * b;
        System.out.println(add.apply(3, 4));
        System.out.println(multiply.apply(3, 4));
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
        prompt: 'Fix `main`: `Shape` declares TWO abstract methods (`area()`, `perimeter()`), so it is NOT a functional interface — a lambda (`() -> 16.0`) can only implement an interface with exactly ONE abstract method, so `Shape square = () -> 16.0;` is a COMPILE ERROR. Replace the lambda with a full anonymous class implementing BOTH `area()` and `perimeter()` (each returning `16.0`).',
        starter: `public class Main {
    interface Shape {
        double area();
        double perimeter();
    }

    public static void main(String[] args) {
        Shape square = () -> 16.0;
        System.out.println(square.area());
    }
}`,
        tests: `
assert output === '16.0'
`,
        solution: `public class Main {
    interface Shape {
        double area();
        double perimeter();
    }

    public static void main(String[] args) {
        Shape square = new Shape() {
            public double area() {
                return 16.0;
            }
            public double perimeter() {
                return 16.0;
            }
        };
        System.out.println(square.area());
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
        prompt: 'Using `java.util.function.Function<Integer, Integer>`, create `doubleIt = x -> x * 2` and `addTen = x -> x + 10`. Print `doubleIt.andThen(addTen).apply(5)` (applies `doubleIt` FIRST, then `addTen`) and `doubleIt.compose(addTen).apply(5)` (applies `addTen` FIRST, then `doubleIt`) — demonstrating that composing lambdas via standard functional interfaces changes the RESULT depending on which order they run in.',
        starter: '',
        tests: `
assert output === '20\\n30'
`,
        solution: `import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        Function<Integer, Integer> doubleIt = x -> x * 2;
        Function<Integer, Integer> addTen = x -> x + 10;

        Function<Integer, Integer> combined = doubleIt.andThen(addTen);
        System.out.println(combined.apply(5));

        Function<Integer, Integer> combined2 = doubleIt.compose(addTen);
        System.out.println(combined2.apply(5));
    }
}`,
      },
    ],
  },
]

export default challenges
