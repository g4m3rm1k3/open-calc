import type { PracticeChallenge } from './loader'

export const title = 'Lifetimes (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str` returning whichever of `x`/`y` is longer. In `main`, create `string1 = "long string"`; in an INNER block, create `string2 = "short"`, call `longest`, and print `"Longest: {result}"` inside that same inner block (while `string2` is still alive).',
        starter: '',
        tests: `
assert output === 'Longest: long string'
`,
        solution: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("long string");
    let result;
    {
        let string2 = String::from("short");
        result = longest(string1.as_str(), string2.as_str());
        println!("Longest: {}", result);
    }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Fix `longest`: it\'s missing the explicit lifetime annotation `<\'a>` — since it returns a reference derived from TWO input references, the compiler can\'t infer on its own which one the return value is tied to, and refuses to compile ("missing lifetime specifier"). Add `<\'a>` and annotate both parameters and the return type with `\'a`.',
        starter: `fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("hello world");
    let s2 = String::from("hi");
    println!("{}", longest(s1.as_str(), s2.as_str()));
}`,
        tests: `
assert output === 'hello world'
`,
        solution: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("hello world");
    let s2 = String::from("hi");
    println!("{}", longest(s1.as_str(), s2.as_str()));
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn make_greeting() -> String` that creates a local `String` `"hello"` and returns it BY VALUE (owned), not as a reference — a function can never return a reference to data it created locally (that data is dropped when the function returns), so returning an owned value is the fix. Call it from `main` and print the result.',
        starter: '',
        tests: `
assert output === 'hello'
`,
        solution: `fn make_greeting() -> String {
    let s = String::from("hello");
    s
}

fn main() {
    let greeting = make_greeting();
    println!("{}", greeting);
}`,
      },
    ],
  },
]

export default challenges
