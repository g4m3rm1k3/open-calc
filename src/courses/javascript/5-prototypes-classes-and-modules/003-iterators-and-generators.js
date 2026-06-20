// J8 — Lesson 4-3: Iterators and Generators

const LESSON_JS_CORE_4_3 = {
  title: 'Iterators and Generators',
  subtitle: 'Custom iteration, lazy sequences, and infinite data streams.',
  sequential: true,

  cells: [

    {
      type: 'markdown',
      instruction: `## Part 1 — What Is Iteration, Really?

When you write \`for...of\` on an array, JavaScript is not magic — it is calling a protocol:

\`\`\`js
const arr = [10, 20, 30];
const iter = arr[Symbol.iterator]();   // get the iterator object
iter.next();   // { value: 10, done: false }
iter.next();   // { value: 20, done: false }
iter.next();   // { value: 30, done: false }
iter.next();   // { value: undefined, done: true }
\`\`\`

An **iterator** is any object with a \`next()\` method that returns \`{ value, done }\`.

An **iterable** is any object with a \`[Symbol.iterator]()\` method that returns an iterator.

Built-in iterables: arrays, strings, Sets, Maps, NodeLists.

**In C** there is no iteration protocol — you manually track an index and a pointer. The JS protocol standardizes this across all types, so \`for...of\`, spread (\`...\`), destructuring, and \`Array.from()\` all work on anything that follows it.`,
    },

    {
      type: 'js',
      instruction: `### Build an Iterator by Hand

Every iterator is just an object with \`next()\`. Build a range iterator from scratch.`,
      startCode: `function makeRange(start, end) {
  let current = start;
  return {
    next() {
      if (current <= end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    }
  };
}

const iter = makeRange(1, 5);
console.log(iter.next());  // { value: 1, done: false }
console.log(iter.next());  // { value: 2, done: false }
console.log(iter.next());  // { value: 3, done: false }

// Now make it iterable too (so for...of works)
function range(start, end) {
  return {
    [Symbol.iterator]() {
      let current = start;
      return {
        next() {
          if (current <= end) return { value: current++, done: false };
          return { value: undefined, done: true };
        }
      };
    }
  };
}

// Now for...of works!
for (const n of range(1, 5)) {
  console.log(n);
}

// Spread works too
console.log([...range(10, 15)]);`,
      outputHeight: 260,
    },

    {
      type: 'markdown',
      instruction: `## Part 2 — Generators

Writing iterators by hand is tedious. **Generators** are a special function syntax that handles the \`next()\` / \`{ value, done }\` bookkeeping automatically.

\`\`\`js
function* count(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;          // pause here and return { value: i, done: false }
  }
  // function ends → { value: undefined, done: true }
}

const gen = count(1, 3);
gen.next();  // { value: 1, done: false }
gen.next();  // { value: 2, done: false }
gen.next();  // { value: 3, done: false }
gen.next();  // { value: undefined, done: true }
\`\`\`

The \`function*\` syntax creates a **generator function**. Calling it returns a **generator object** which is both an iterator and an iterable.

**How it works under the hood:** Each \`yield\` suspends the function's execution and saves its entire local state (variables, loop counter, position in code). The next call to \`.next()\` resumes from exactly where it left off. This is similar to coroutines in languages like Lua and Python — cooperative multitasking inside a single thread.

**Key insight:** Normal functions run to completion. Generator functions can be paused and resumed. This makes them ideal for:
- Lazy sequences (only compute values when asked)
- Infinite data streams
- Custom iterators without boilerplate
- Step-by-step state machines`,
    },

    {
      type: 'js',
      instruction: `### Generators in Action

Generators are generators: they produce values lazily. An infinite sequence is possible because values are only computed when \`.next()\` is called.`,
      startCode: `// Generator function — the * makes it special
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {           // infinite! but safe — only runs when called
    yield a;
    [a, b] = [b, a + b];
  }
}

// Take the first N values from any iterable/generator
function take(n, iterable) {
  const result = [];
  for (const val of iterable) {
    result.push(val);
    if (result.length >= n) break;
  }
  return result;
}

console.log(take(10, fibonacci()));
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Generators compose with spread and destructuring
function* map(fn, iterable) {
  for (const val of iterable) {
    yield fn(val);
  }
}

function* filter(pred, iterable) {
  for (const val of iterable) {
    if (pred(val)) yield val;
  }
}

// Pipe: squares of even fibonacci numbers (first 5)
const evens = filter(n => n % 2 === 0, fibonacci());
const squared = map(n => n * n, evens);
console.log(take(5, squared));
// [0, 4, 64, 1156, 18496]`,
      outputHeight: 240,
    },

    {
      type: 'js',
      instruction: `### yield* — Delegating to Another Generator

\`yield*\` lets a generator delegate to another iterable. It's like spreading one sequence inside another, but lazily.`,
      startCode: `function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i;
  }
}

// yield* delegates: flat iteration over multiple ranges
function* multiRange(...ranges) {
  for (const [start, end] of ranges) {
    yield* range(start, end);   // delegation — like inlining the generator
  }
}

console.log([...multiRange([1, 3], [10, 12], [100, 102])]);
// [1, 2, 3, 10, 11, 12, 100, 101, 102]

// Practical: flatten a tree with generators
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item);   // recurse via delegation
    } else {
      yield item;
    }
  }
}

const nested = [1, [2, [3, 4]], [5, 6], 7];
console.log([...flatten(nested)]);
// [1, 2, 3, 4, 5, 6, 7]`,
      outputHeight: 220,
    },

    {
      type: 'js',
      instruction: `### Two-Way Communication: yield as an Expression

\`yield\` can also *receive* values back from the caller via \`.next(value)\`. This makes generators a two-way communication channel — the foundation of how async/await was originally implemented before it became syntax.`,
      startCode: `function* adder() {
  let total = 0;
  while (true) {
    const n = yield total;   // pause, return total; resume when .next(n) is called
    if (n === null) break;
    total += n;
  }
  return total;
}

const gen = adder();
gen.next();       // start the generator — runs to first yield → { value: 0, done: false }
gen.next(10);     // resume, n = 10 → { value: 10, done: false }
gen.next(5);      // resume, n = 5  → { value: 15, done: false }
gen.next(20);     // resume, n = 20 → { value: 35, done: false }
const result = gen.next(null);  // break → { value: 35, done: true }
console.log('Total:', result.value);

// This two-way channel is how async libraries like co.js worked before async/await existed:
// yield a Promise → library catches it, waits for it, .next(resolvedValue) to resume
// That's literally what "await" compiles down to under the hood
console.log('Generator two-way channel works!');`,
      outputHeight: 200,
    },

    {
      type: 'markdown',
      instruction: `## Part 3 — Real Use Cases

Generators shine in a few specific scenarios:

**Paginated data fetching:**
\`\`\`js
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const data = await fetch(url + '?page=' + page).then(r => r.json());
    if (!data.length) return;
    yield data;
    page++;
  }
}

for await (const page of fetchPages('/api/records')) {
  processBatch(page);
}
\`\`\`

**Unique ID generator:**
\`\`\`js
function* idGen(prefix = 'id') {
  let n = 0;
  while (true) yield prefix + '-' + (++n);
}
const nextId = idGen('user');
nextId.next().value;  // 'user-1'
nextId.next().value;  // 'user-2'
\`\`\`

**State machine:**
\`\`\`js
function* trafficLight() {
  while (true) {
    yield 'green';
    yield 'yellow';
    yield 'red';
  }
}
\`\`\`

The \`for await...of\` loop in the first example is the async iteration protocol — it works with async generators (functions marked \`async function*\` that can use both \`await\` and \`yield\`).`,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 1: Range Generator

Write a generator function \`range(start, end, step = 1)\` that yields numbers from \`start\` up to and including \`end\`, incrementing by \`step\`.

\`\`\`js
[...range(0, 10, 2)]   // [0, 2, 4, 6, 8, 10]
[...range(1, 5)]       // [1, 2, 3, 4, 5]
\`\`\`

Log the spread of both calls.`,
      startCode: `function* range(start, end, step = 1) {
  // your code here
}

console.log([...range(0, 10, 2)]);
console.log([...range(1, 5)]);`,
      solutionCode: `function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i;
  }
}
console.log([...range(0, 10, 2)]);
console.log([...range(1, 5)]);`,
      check: (code, logs) =>
        /function\s*\*/.test(code) &&
        /yield/.test(code) &&
        logs[0] === '[ 0, 2, 4, 6, 8, 10 ]' &&
        logs[1] === '[ 1, 2, 3, 4, 5 ]',
      successMessage: 'Correct! The generator suspends at each yield — no array is built until you spread or iterate.',
      failMessage: 'Use function* and yield. Log [...range(0,10,2)] and [...range(1,5)].',
      outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 2: Unique ID Generator

Write a generator \`idGen(prefix)\` that yields an infinite sequence of unique IDs like \`'item-1'\`, \`'item-2'\`, etc.

Then call it with prefix \`'item'\` and log the first three values using \`.next().value\`.

Expected output:
\`\`\`
item-1
item-2
item-3
\`\`\``,
      startCode: `function* idGen(prefix) {
  // your code here
}

const gen = idGen('item');
// log the first three .next().value calls`,
      solutionCode: `function* idGen(prefix) {
  let n = 0;
  while (true) yield prefix + '-' + (++n);
}
const gen = idGen('item');
console.log(gen.next().value);
console.log(gen.next().value);
console.log(gen.next().value);`,
      check: (code, logs) =>
        /function\s*\*/.test(code) &&
        /while\s*\(\s*true\s*\)/.test(code) &&
        logs[0] === 'item-1' && logs[1] === 'item-2' && logs[2] === 'item-3',
      successMessage: 'Correct! Infinite generators are safe because values are pulled on demand — nothing is pre-computed.',
      failMessage: 'Use function*, an infinite while(true) loop, and yield prefix + \'-\' + n.',
      outputHeight: 200,
    },

    {
      type: 'challenge',
      instruction: `### Challenge 3: Flatten with a Generator

Write a generator \`flatten(arr)\` that recursively flattens a nested array of any depth, yielding each leaf value.

\`\`\`js
[...flatten([1, [2, [3, 4]], [5, 6], 7])]
// [1, 2, 3, 4, 5, 6, 7]
\`\`\`

Log the spread result.`,
      startCode: `function* flatten(arr) {
  // your code here
}

console.log([...flatten([1, [2, [3, 4]], [5, 6], 7])]);`,
      solutionCode: `function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item);
    } else {
      yield item;
    }
  }
}
console.log([...flatten([1, [2, [3, 4]], [5, 6], 7])]);`,
      check: (code, logs) =>
        /function\s*\*/.test(code) &&
        /yield\s*\*/.test(code) &&
        logs[0] === '[ 1, 2, 3, 4, 5, 6, 7 ]',
      successMessage: 'Correct! yield* delegation lets you recurse inside a generator cleanly — no manual array concatenation.',
      failMessage: 'Use yield* flatten(item) for nested arrays and yield item for leaf values.',
      outputHeight: 200,
    },

  ],
};

export default {
  id: 'js-core-4-3-iterators-generators',
  slug: 'iterators-and-generators',
  chapter: 'js4.1',
  order: 2,
  title: 'Iterators and Generators',
  subtitle: 'Custom iteration protocols, lazy sequences, and infinite data streams.',
  tags: ['javascript', 'generators', 'iterators', 'symbol-iterator', 'lazy-evaluation', 'yield'],

  hook: {
    question: 'What if a function could pause halfway through and resume later?',
    realWorldContext: 'Generators power infinite scroll, pagination, test data factories, and async control flow. They are the mechanical foundation that async/await was built on top of.',
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      'An iterator is an object with next() → { value, done }. Arrays, strings, Sets, and Maps are all iterable.',
      'function* creates a generator — a function that can pause at each yield and resume from there.',
      'yield* delegates iteration to another iterable, like recursion across sequences.',
      'Generators are lazy: values are computed only when .next() is called. Infinite sequences are safe.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Generators Under async/await',
        body: 'Before async/await was added to JavaScript, libraries like co.js used generators to write async code. Every yield was a Promise; the library called .next(resolvedValue) to resume. Babel\'s async/await transpilation still compiles to generator code in environments that need it.',
      },
      {
        type: 'tip',
        title: 'When to Use Generators vs Arrays',
        body: 'If you need all values at once, use an array. If the sequence is large, expensive to compute, or infinite — use a generator. The consumer controls the pace.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Iterators and Generators',
        props: { lesson: LESSON_JS_CORE_4_3 },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [],
  challenges: [],
  mentalModel: [
    'Iterator protocol: object with next() → { value, done }.',
    '[Symbol.iterator]() makes any object work with for...of, spread, and destructuring.',
    'function* pauses at yield, resumes at .next(). Local state is saved across pauses.',
    'yield* delegates to another iterable — composable lazy sequences.',
    'Infinite generators are safe — values computed only on demand.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'What does an iterator\'s next() method return?',
      options: [
        'The next value directly as a primitive',
        'An object with two properties: value (the current item) and done (true when the sequence is exhausted)',
        'A Promise that resolves to the next value',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What makes an object compatible with for...of and array spread?',
      options: [
        'It must extend Array or Set',
        'It must implement [Symbol.iterator]() returning an iterator — this is the iterable protocol',
        'It must be declared with the iterator keyword',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What happens to local variables inside a generator function when it hits yield?',
      options: [
        'They are reset to their initial values',
        'They are saved — the generator pauses and resumes with all local state intact on the next .next() call',
        'They are garbage-collected to save memory while the generator is paused',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why is an infinite generator safe to use without causing an infinite loop?',
      options: [
        'Generators automatically stop after 1,000 iterations',
        'Values are computed lazily — the generator only produces the next value when .next() is called, so you control how many you take',
        'Infinite generators run on a background thread so they do not block the main thread',
      ],
      correct: 1,
    },
  ],
};
