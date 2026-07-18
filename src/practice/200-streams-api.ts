import type { PracticeChallenge } from './loader'

export const title = 'Streams API (Java)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'java-program',
        prompt: 'Given `List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8)`, build a stream pipeline that filters to multiples of 3, maps each by multiplying by 10, and collects into a `List` — print it. Then compute `numbers.stream().mapToInt(Integer::intValue).sum()` and print it.',
        starter: '',
        tests: `
assert output === '[30, 60]\\n36'
`,
        solution: `import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8);

        List<Integer> result = numbers.stream()
            .filter(n -> n % 3 == 0)
            .map(n -> n * 10)
            .collect(Collectors.toList());

        System.out.println(result);

        int sum = numbers.stream()
            .mapToInt(Integer::intValue)
            .sum();
        System.out.println(sum);
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
        prompt: 'Fix `main`: it creates ONE `Stream<Integer>` and tries to run TWO terminal operations on it (`.filter(...).count()`, then `.mapToInt(...).sum()`) — a Java stream can only be consumed once, so the second call throws `IllegalStateException: stream has already been operated upon or closed`. Call `numbers.stream()` freshly for EACH pipeline instead of reusing a single stream variable.',
        starter: `import java.util.List;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3);
        Stream<Integer> stream = numbers.stream();

        long count = stream.filter(n -> n > 1).count();
        System.out.println(count);

        long sum = stream.mapToInt(Integer::intValue).sum();
        System.out.println(sum);
    }
}`,
        tests: `
assert output === '2\\n6'
`,
        solution: `import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3);

        long count = numbers.stream().filter(n -> n > 1).count();
        System.out.println(count);

        long sum = numbers.stream().mapToInt(Integer::intValue).sum();
        System.out.println(sum);
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
        prompt: 'Given `List<Integer> numbers = List.of(1, 2, 3)`, build (but do NOT yet terminate) a stream pipeline whose `.filter(...)` predicate prints `"checking " + n` before checking `n % 2 != 0`. After building the pipeline, print `"pipeline built, nothing has run yet"`. THEN call `.collect(Collectors.toList())` on the pipeline and print the result — demonstrating that the filter\'s side-effecting predicate doesn\'t run at all until the terminal operation triggers the whole pipeline.',
        starter: '',
        tests: `
assert output === 'pipeline built, nothing has run yet\\nchecking 1\\nchecking 2\\nchecking 3\\n[1, 3]'
`,
        solution: `import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3);

        var pipeline = numbers.stream()
            .filter(n -> {
                System.out.println("checking " + n);
                return n % 2 != 0;
            });

        System.out.println("pipeline built, nothing has run yet");

        List<Integer> result = pipeline.collect(Collectors.toList());
        System.out.println(result);
    }
}`,
      },
    ],
  },
]

export default challenges
