// SICP — JavaScript — Lesson 4.3
export const lesson = {
  id: 'sicp-4-3',
  series: { id: 'sicp', title: 'SICP — JavaScript' },
  title: '4.3  Nondeterministic Evaluation and amb',
  checkpoints: [
    { id: 'cp-amb',      label: 'The amb Operator' },
    { id: 'cp-backtrack', label: 'Backtracking' },
    { id: 'cp-prolog',   label: 'Logic Programming' },
  ],
  segments: [

    // ══════════════════════════════════════════════════════════════════════════
    // PART 1 — AMB AND THE BACKTRACKING SEARCH MODEL
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'intro',
      text: 'In 1972, Alain Colmerauer invented Prolog — a programming language with a strange property: you do not tell it how to find an answer, you tell it what the answer must satisfy, and it finds the answer by searching. A Prolog program is a set of constraints. The evaluator searches for an assignment to the variables that satisfies all of them. If a choice leads to a contradiction, the evaluator backtracks automatically to the last decision point and tries something else.\n\nSection 4.3 adds this capability to our Chapter 4 evaluator with a single construct: `amb`. `amb(1, 2, 3)` nondeterministically "chooses" one of its arguments. If the chosen value eventually leads to a failure (a violated constraint), the evaluator automatically backtracks and tries the next choice. This turns the evaluator itself into a search engine — you express what you want, and the evaluator searches for how to get it.',
      code: null,
    },

    // ── The amb idea ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'amb-idea',
      text: 'The `amb` idea in JavaScript: we implement `amb` not as a language primitive but as a function that searches exhaustively by trying each choice in turn. `amb(choices, continuation)`: for each choice value, call the continuation (the rest of the computation) with that value. If the continuation returns a result, we are done. If it throws a failure (a signal that this choice does not work), catch it and try the next choice. When all choices are exhausted without a successful result, throw a failure ourselves — propagating the failure upward to the enclosing `amb`.\n\nThe `require(condition)` function is the constraint operator: if `condition` is false, it throws a Failure exception, which triggers backtracking in the enclosing `amb`. The programmer writes only the constraints; the search is entirely handled by the interplay of `amb` and `require`.',
      code: null,
    },

    // ── Infrastructure: Failure, require, amb ─────────────────────────────────

    {
      type: 'narration',
      id: 'require-and-fail',
      text: 'Build the three pieces of the infrastructure. First, a Failure class — a distinctive exception type that signals "this path does not work, try another choice." Second, `require(condition)` — throws Failure if condition is false. Third, a basic `amb(choices, continuation)` — iterates through choices, calling the continuation with each; if it throws Failure, catches it and moves on; if all choices fail, throws Failure itself.\n\nThis is exhaustive search implemented with try/catch. The try/catch structure is doing exactly what the amb evaluator\'s continuation stack does — it is just made explicit in JavaScript:',
      code: `class Failure extends Error {
  constructor() { super('amb failure — no more choices'); }
}

function require(condition) {
  if (!condition) throw new Failure();
}

function amb(choices, continuation) {
  for (const choice of choices) {
    try {
      return continuation(choice);   // try this choice
    } catch (e) {
      if (!(e instanceof Failure)) throw e;   // re-throw real errors
      // this choice failed — try the next one
    }
  }
  throw new Failure();   // all choices failed — propagate failure upward
}

// Simple test: find the first number in [1..5] that is even.
const result = amb([1, 2, 3, 4, 5], n => {
  require(n % 2 === 0);   // throws Failure if odd
  return n;               // success: return this n
});
console.log('first even: ' + result);   // 2

// Find the first number greater than 3:
const result2 = amb([1, 2, 3, 4, 5], n => {
  require(n > 3);
  return n;
});
console.log('first > 3: ' + result2);   // 4`,
    },

    // ── First example ─────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'first-example',
      text: 'Trace through how `amb` finds the first even number in [1, 2, 3, 4, 5]. The search proceeds as follows: try n = 1. Call `require(1 % 2 === 0)` — which is `require(false)` — which throws Failure. Caught by `amb`. Try n = 2. Call `require(2 % 2 === 0)` — which is `require(true)` — no exception. Return 2. Done.\n\nThe caller sees only the return value 2. The backtracking (trying 1, then 2) is entirely hidden inside `amb`. This is the key abstraction: the programmer writes `require` constraints, `amb` handles the search. Here is the example with tracing so we can see exactly which choices are tried:',
      code: `class Failure extends Error {}
function require(cond) { if (!cond) throw new Failure(); }

function amb(choices, cont) {
  for (const c of choices) {
    try { return cont(c); }
    catch (e) { if (!(e instanceof Failure)) throw e; }
  }
  throw new Failure();
}

const candidates = [1, 2, 3, 4, 5];

const first_even = amb(candidates, n => {
  console.log('  trying n = ' + n + '...');
  require(n % 2 === 0);
  console.log('  success: n = ' + n + ' is even');
  return n;
});
console.log('result: ' + first_even);
// trying n = 1... (fails)
// trying n = 2... (succeeds)
// result: 2`,
    },

    // ── find_all ───────────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'find-all',
      text: '`amb` as written returns only the first successful choice. Often we want all of them. `find_all(choices, continuation)` collects every choice for which the continuation does not throw Failure. Instead of stopping at the first success, it runs the continuation for every choice, collects the results that succeed, and ignores the ones that throw. The result is an array of all satisfying values.\n\nThis is the difference between a logic programming query that returns one answer and one that returns all answers. In Prolog, both are possible. In our model, `amb` gives the first answer and `find_all` gives all of them:',
      code: `class Failure extends Error {}
function require(cond) { if (!cond) throw new Failure(); }

function find_all(choices, continuation) {
  const results = [];
  for (const c of choices) {
    try {
      results.push(continuation(c));   // collect every success
    } catch (e) {
      if (!(e instanceof Failure)) throw e;   // ignore failures
    }
  }
  return results;
}

const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// All even numbers:
const evens = find_all(nums, n => { require(n % 2 === 0); return n; });
console.log('evens: ' + evens);   // 2,4,6,8,10

// All primes up to 10:
function is_prime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
const primes = find_all(nums, n => { require(is_prime(n)); return n; });
console.log('primes: ' + primes);  // 2,3,5,7`,
    },

    { type: 'checkpoint', id: 'cp-amb' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 2 — BACKTRACKING IN PRACTICE
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'pythagorean',
      text: 'Pythagorean triples: integer triples (a, b, c) with a ≤ b ≤ c and a² + b² = c². Finding them by hand is tedious. With `find_all` and `require`, it is almost a direct translation of the mathematical definition. Choose a from 1 to 20. Choose b from a to 20. Choose c from b to 20. Require that a² + b² = c². Collect every satisfying triple.\n\nWithout backtracking search, you would write explicit nested loops and an if-statement. With nested `find_all` calls (each corresponding to an `amb` in the SICP evaluator), the search is implicit. The structure of the code mirrors the structure of the problem:',
      code: `class Failure extends Error {}
function require(cond) { if (!cond) throw new Failure(); }

function find_all(choices, cont) {
  const results = [];
  for (const c of choices) {
    try { results.push(cont(c)); }
    catch (e) { if (!(e instanceof Failure)) throw e; }
  }
  return results;
}

function range(lo, hi) {
  const arr = [];
  for (let i = lo; i <= hi; i++) arr.push(i);
  return arr;
}

// Find all Pythagorean triples with a <= b <= c <= 20.
const triples = find_all(range(1, 20), a =>
  find_all(range(a, 20), b =>
    find_all(range(b, 20), c => {
      require(a * a + b * b === c * c);
      return [a, b, c];
    })
  )
).flat(2);

console.log('Pythagorean triples up to 20:');
triples.forEach(([a, b, c]) =>
  console.log('  ' + a + '^2 + ' + b + '^2 = ' + c + '^2  (' + (a*a+b*b) + ' = ' + c*c + ')')
);`,
    },

    // ── Logic puzzle ──────────────────────────────────────────────────────────

    {
      type: 'narration',
      id: 'logic-puzzle',
      text: 'The Baker-Cooper puzzle from SICP Section 4.3.2: Baker, Cooper, Fletcher, Miller, and Smith live on five different floors of an apartment building (floors 1 through 5). There are six constraints:\n\n1. Baker does not live on floor 5.\n2. Cooper does not live on floor 1.\n3. Fletcher does not live on floor 5 or floor 1.\n4. Miller lives on a higher floor than Cooper.\n5. Smith does not live on a floor adjacent to Fletcher.\n6. Fletcher does not live on a floor adjacent to Cooper.\n\nExpress each constraint as a `require`. Let the search find the assignment. There is exactly one valid assignment. The elegance: we describe what a valid assignment looks like, and the evaluator finds it — we never write the search logic ourselves:',
      code: `class Failure extends Error {}
function require(cond) { if (!cond) throw new Failure(); }

function find_all(choices, cont) {
  const results = [];
  for (const c of choices) {
    try { results.push(cont(c)); }
    catch (e) { if (!(e instanceof Failure)) throw e; }
  }
  return results;
}

const floors = [1, 2, 3, 4, 5];

const solutions = find_all(floors, baker =>
  find_all(floors, cooper =>
    find_all(floors, fletcher =>
      find_all(floors, miller =>
        find_all(floors, smith => {
          // All on different floors:
          require(new Set([baker, cooper, fletcher, miller, smith]).size === 5);
          require(baker !== 5);
          require(cooper !== 1);
          require(fletcher !== 5 && fletcher !== 1);
          require(miller > cooper);
          require(Math.abs(smith - fletcher) !== 1);
          require(Math.abs(fletcher - cooper) !== 1);
          return { baker, cooper, fletcher, miller, smith };
        })
      )
    )
  )
).flat(4);

console.log('Solutions found: ' + solutions.length);   // 1
const s = solutions[0];
console.log('Baker:    floor ' + s.baker);
console.log('Cooper:   floor ' + s.cooper);
console.log('Fletcher: floor ' + s.fletcher);
console.log('Miller:   floor ' + s.miller);
console.log('Smith:    floor ' + s.smith);`,
    },

    // ── Codelens: amb search ───────────────────────────────────────────────────

    {
      type: 'codelens',
      id: 'codelens-amb',
      text: 'Step through `amb` trying choices one by one. Watch how each choice is passed to the continuation. When `require(n % 2 === 0)` fails for n=1, it throws Failure. The try/catch inside `amb` catches it and the loop advances to n=2. When n=2 passes `require`, the continuation returns 2 and `amb` returns immediately — the remaining choices [3, 4, 5] are never tried. This is exactly the first-match semantics of the SICP `amb` evaluator.',
      code: `class Failure extends Error {}
function require(cond) { if (!cond) throw new Failure(); }

function amb(choices, cont) {
  for (const c of choices) {
    console.log('amb: trying choice ' + c);
    try {
      const result = cont(c);
      console.log('amb: choice ' + c + ' SUCCEEDED — returning ' + result);
      return result;
    } catch (e) {
      if (!(e instanceof Failure)) throw e;
      console.log('amb: choice ' + c + ' FAILED — backtracking to next choice');
    }
  }
  throw new Failure();
}

const result = amb([1, 2, 3, 4, 5], n => {
  require(n % 2 === 0);   // throws Failure for odd n
  return n;
});
console.log('final result: ' + result);`,
      lang: 'js',
    },

    { type: 'checkpoint', id: 'cp-backtrack' },

    // ══════════════════════════════════════════════════════════════════════════
    // PART 3 — CONTINUATIONS AND THE PROLOG CONNECTION
    // ══════════════════════════════════════════════════════════════════════════

    {
      type: 'narration',
      id: 'continuations-idea',
      text: 'How does `amb` actually work in SICP\'s full evaluator? The key mechanism is continuations — the rest of the computation packaged as a function. When `amb` is about to make a choice, the evaluator captures the current continuation (everything that remains to be computed after this point). If the chosen path later fails, the evaluator discards the failed computation and resumes from the captured continuation with the next choice.\n\nOur simple try/catch version approximates this using JavaScript\'s call stack as an implicit continuation. A full implementation passes explicit success_cont and failure_cont arguments to every evaluation step. The failure continuation is called to trigger backtracking: it invokes the next saved amb choice. This is continuation-passing style (CPS), and it is the general mechanism underlying all search, backtracking, and exception handling.',
      code: null,
    },

    // ── Codelens: backtracking trace ──────────────────────────────────────────

    {
      type: 'codelens',
      id: 'codelens-backtrack',
      text: 'Step through the Pythagorean triple search for the first triple in [1..8]. Watch `require` throw Failure for non-triples — the try/catch structure catches it and the innermost loop advances c. When c is exhausted, the middle loop advances b, resetting c. When b is exhausted, the outer loop advances a. Each "Failure" throw is one backtrack step — exactly what the SICP `amb` evaluator\'s failure continuation does.',
      code: `class Failure extends Error {}
function require(cond) { if (!cond) throw new Failure(); }

let attempts = 0;
let backtracks = 0;

outer:
for (let a = 1; a <= 8; a++) {
  for (let b = a; b <= 8; b++) {
    for (let c = b; c <= 8; c++) {
      attempts++;
      try {
        require(a * a + b * b === c * c);
        console.log('found triple [' + a + ',' + b + ',' + c + '] after ' + attempts + ' attempts, ' + backtracks + ' backtracks');
        break outer;
      } catch (e) {
        if (!(e instanceof Failure)) throw e;
        backtracks++;
      }
    }
  }
}
console.log('total attempts: ' + attempts);
console.log('total backtracks: ' + backtracks);`,
      lang: 'js',
    },

    {
      type: 'narration',
      id: 'prolog-connection',
      text: 'Prolog is exactly this evaluator, scaled up and made into a language. Every Prolog clause corresponds to an `amb` over possible pattern-matching rules. Every predicate call corresponds to a `require`. Prolog\'s unification mechanism is the pattern-matching that identifies satisfying variable assignments. Prolog programs describe constraints; the Prolog evaluator searches for assignments that satisfy them.\n\nSQL is another instance of this pattern. A SQL WHERE clause is a set of `require` constraints over the rows of a table. The database engine searches for rows satisfying your constraints — you never write the search loop. Nondeterministic evaluation is one of the most powerful ideas in programming: the programmer expresses what is wanted, and the evaluator searches for how to get it. Once you recognise the pattern, you see it everywhere.',
      code: null,
    },

    // ── Challenges ────────────────────────────────────────────────────────────

    {
      type: 'challenge',
      id: 'challenge-find-all',
      text: 'Implement find_all(choices, test) that returns an array of all values from choices for which test(value) returns true (not throws — just returns true). Use it to find all multiples of 3 in [1..10]. find_all([1,2,...,10], n => n % 3 === 0) should give [3, 6, 9].',
      expectedOutput: '3,6,9',
      startCode: `// Implement find_all(choices, test):
// — iterate through choices
// — for each choice, call test(choice)
// — if test returns true, include the choice in the results
// — if test returns false, skip it
// — return the array of all passing choices
function find_all(choices, test) {
  // your code here
}

const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = find_all(nums, n => n % 3 === 0);
console.log(result.join(','));
`,
      hint: 'function find_all(choices, test) {\n  return choices.filter(test);\n}',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nreturn typeof find_all === "function" && find_all([1,2,3,4,5,6,7,8,9,10], n => n % 3 === 0).join(",") === "3,6,9"')
          return fn() === true
        } catch { return false }
      },
    },

    {
      type: 'challenge',
      id: 'challenge-puzzle',
      text: 'Solve the logic puzzle: A, B, and C each pick a different number from 1 to 5. A\'s number is prime (2, 3, or 5). B\'s number is greater than A\'s. C\'s number is odd and less than B\'s. Find all valid assignments and count them. There should be exactly 4 solutions. Print the count.',
      expectedOutput: 'solutions: 4',
      startCode: `class Failure extends Error {}
function require(cond) { if (!cond) throw new Failure(); }

const primes = new Set([2, 3, 5]);
const nums = [1, 2, 3, 4, 5];
const solutions = [];

for (const a of nums) {
  for (const b of nums) {
    for (const c of nums) {
      try {
        // All different:
        require(a !== b && b !== c && a !== c);
        // A's number is prime:
        require(primes.has(a));
        // B's number is greater than A's:
        require(b > a);
        // C's number is odd and less than B's:
        require(c % 2 === 1 && c < b);
        solutions.push({ a, b, c });
      } catch (e) { if (!(e instanceof Failure)) throw e; }
    }
  }
}

console.log('solutions: ' + solutions.length);
`,
      hint: 'The four solutions arise from the small number of primes less than 5 (2, 3) and the constraints on B and C. Make sure all three distinct-number and ordering constraints are applied.',
      validate: ({ code }) => {
        try {
          const fn = new Function('"use strict";\n' + code + '\nreturn solutions.length === 4')
          return fn() === true
        } catch { return false }
      },
    },

    { type: 'checkpoint', id: 'cp-prolog' },
  ],
}
