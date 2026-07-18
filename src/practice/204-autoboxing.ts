import type { PracticeChallenge } from './loader'

export const title = 'Autoboxing (Java)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'java-program',
        prompt: 'Add the primitive `42` to a `List<Integer>` (autoboxing) and read it back into an `int` (unboxing); print it. Create `Integer a = 200` and `Integer b = 200` (outside Java\'s -128..127 cache range) and print `a == b`. Create `Integer c = 50` and `Integer d = 50` (inside the cache range) and print `c == d`. Finally print `a.equals(b)`.',
        starter: '',
        tests: `
assert output === '42\\nfalse\\ntrue\\ntrue'
`,
        solution: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>();
        nums.add(42);
        int first = nums.get(0);
        System.out.println(first);

        Integer a = 200;
        Integer b = 200;
        System.out.println(a == b);

        Integer c = 50;
        Integer d = 50;
        System.out.println(c == d);

        System.out.println(a.equals(b));
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
        prompt: 'Fix `sameValue`: it compares the two boxed `Integer` arguments with `x == y`, which checks OBJECT IDENTITY — since `5000` is well outside the small-integer cache (-128 to 127), `price1` and `price2` are separately allocated objects, so this incorrectly prints `false` even though both hold the same value. Change the comparison to `x.equals(y)`, which correctly compares VALUE.',
        starter: `public class Main {
    static boolean sameValue(Integer x, Integer y) {
        return x == y;
    }

    public static void main(String[] args) {
        Integer price1 = 5000;
        Integer price2 = 5000;
        System.out.println(sameValue(price1, price2));
    }
}`,
        tests: `
assert output === 'true'
`,
        solution: `public class Main {
    static boolean sameValue(Integer x, Integer y) {
        return x.equals(y);
    }

    public static void main(String[] args) {
        Integer price1 = 5000;
        Integer price2 = 5000;
        System.out.println(sameValue(price1, price2));
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
        prompt: 'Write `static int sumSafely(List<Integer> values)` that sums a list which may contain `null` entries — check `if (v != null)` BEFORE adding each `Integer` into the running `int total` (unboxing a `null` `Integer` directly would throw `NullPointerException`). Call it with `Arrays.asList(10, null, 20, null, 5)` and print the result.',
        starter: '',
        tests: `
assert output === '35'
`,
        solution: `import java.util.Arrays;
import java.util.List;

public class Main {
    static int sumSafely(List<Integer> values) {
        int total = 0;
        for (Integer v : values) {
            if (v != null) {
                total += v;
            }
        }
        return total;
    }

    public static void main(String[] args) {
        List<Integer> values = Arrays.asList(10, null, 20, null, 5);
        System.out.println(sumSafely(values));
    }
}`,
      },
    ],
  },
]

export default challenges
