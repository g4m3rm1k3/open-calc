import type { PracticeChallenge } from './loader'

export const title = 'Macros (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `macro_rules! square { ($x:expr) => { $x * $x }; }`. In `main`, print `"5 squared is {result}"` for `square!(5)`, and `"(2+3) squared is {result}"` for `square!(2 + 3)` — `macro_rules!` auto-parenthesizes captured expressions, so this correctly computes `(2+3)*(2+3)`, not `2 + 3*2 + 3`.',
        starter: '',
        tests: `
assert output === '5 squared is 25\\n(2+3) squared is 25'
`,
        solution: `macro_rules! square {
    ($x:expr) => {
        $x * $x
    };
}

fn main() {
    let result = square!(5);
    println!("5 squared is {}", result);

    let result2 = square!(2 + 3);
    println!("(2+3) squared is {}", result2);
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Fix `macro_rules! max`: it must expand to `if $a > $b { $a } else { $b }`, not just `$a` unconditionally — the macro compiles fine either way, but always returning the first argument is a genuine logic bug, silently giving the wrong answer at runtime.',
        starter: `macro_rules! max {
    ($a:expr, $b:expr) => {
        $a
    };
}

fn main() {
    println!("{}", max!(3, 7));
    println!("{}", max!(10, 2));
}`,
        tests: `
assert output === '7\\n10'
`,
        solution: `macro_rules! max {
    ($a:expr, $b:expr) => {
        if $a > $b { $a } else { $b }
    };
}

fn main() {
    println!("{}", max!(3, 7));
    println!("{}", max!(10, 2));
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `macro_rules! sum` accepting a variable number of expressions (`$($x:expr),*`) and expanding into code that sums them all — something no ordinary function signature could express directly. Print `sum!(1, 2, 3)` and `sum!(10, 20)`.',
        starter: '',
        tests: `
assert output === '6\\n30'
`,
        solution: `macro_rules! sum {
    ($($x:expr),*) => {
        {
            let mut total = 0;
            $(total += $x;)*
            total
        }
    };
}

fn main() {
    println!("{}", sum!(1, 2, 3));
    println!("{}", sum!(10, 20));
}`,
      },
    ],
  },
]

export default challenges
