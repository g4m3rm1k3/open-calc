import type { PracticeChallenge } from './loader'

export const title = 'Ownership (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write a complete Rust program: create a `String` `s1` set to `"hello"`, move it to `s2` (`let s2 = s1;`), and print `s2`. Then create an integer `x = 5`, copy it to `y` (`let y = x;`), and print `x` and `y` separated by a space — integers implement `Copy`, so both remain valid.',
        starter: '',
        tests: `
assert output === 'hello\\n5 5'
`,
        solution: `fn main() {
    let s1 = String::from("hello");
    let s2 = s1;
    println!("{}", s2);

    let x = 5;
    let y = x;
    println!("{} {}", x, y);
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Fix this program: it tries to print `s1` after moving it into `s2` (`let s2 = s1;`), which is a COMPILE ERROR — "value borrowed after move". Fix it by cloning instead (`let s2 = s1.clone();`), so both `s1` and `s2` remain independently valid.',
        starter: `fn main() {
    let s1 = String::from("hello");
    let s2 = s1;
    println!("{}", s1);
    println!("{}", s2);
}`,
        tests: `
assert output === 'hello\\nhello'
`,
        solution: `fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone();
    println!("{}", s1);
    println!("{}", s2);
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn calculate_length(s: String) -> (String, usize)` that takes ownership of `s`, computes its length, and returns BOTH the string and the length as a tuple — the idiomatic way to "give ownership back" after a function needs to consume a value. In `main`, call it on `"hello"` and print the returned string and length separated by a space.',
        starter: '',
        tests: `
assert output === 'hello 5'
`,
        solution: `fn calculate_length(s: String) -> (String, usize) {
    let length = s.len();
    (s, length)
}

fn main() {
    let s1 = String::from("hello");
    let (s2, len) = calculate_length(s1);
    println!("{} {}", s2, len);
}`,
      },
    ],
  },
]

export default challenges
