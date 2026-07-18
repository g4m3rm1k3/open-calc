import type { PracticeChallenge } from './loader'

export const title = 'Borrowing (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn calculate_length(s: &String) -> usize` borrowing `s` (not taking ownership). In `main`, create `s1 = "hello"`, call `calculate_length(&s1)`, then print `"{s1} is {len} long"` — `s1` remains valid since it was only borrowed. Then create a mutable `s2 = "hi"`; take two immutable borrows and print both together; after they go out of scope, take a mutable borrow, append `" there"`, and print the result.',
        starter: '',
        tests: `
assert output === 'hello is 5 long\\nhi hi\\nhi there'
`,
        solution: `fn calculate_length(s: &String) -> usize {
    s.len()
}

fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);

    println!("{} is {} long", s1, len);

    let mut s2 = String::from("hi");
    {
        let r1 = &s2;
        let r2 = &s2;
        println!("{} {}", r1, r2);
    }

    let r3 = &mut s2;
    r3.push_str(" there");
    println!("{}", r3);
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Fix `print_length`: it takes `s: String` by value, which MOVES `s1` when called — then `main` tries to use `s1` again afterward, a COMPILE ERROR. Change the parameter to `&String` (borrow instead of move) and update the call site to `print_length(&s1)`, so `s1` remains valid for the second print.',
        starter: `fn print_length(s: String) {
    println!("{} is {} long", s, s.len());
}

fn main() {
    let s1 = String::from("hello");
    print_length(s1);
    println!("{} again", s1);
}`,
        tests: `
assert output === 'hello is 5 long\\nhello again'
`,
        solution: `fn print_length(s: &String) {
    println!("{} is {} long", s, s.len());
}

fn main() {
    let s1 = String::from("hello");
    print_length(&s1);
    println!("{} again", s1);
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn add_exclamation(s: &mut String)` that appends `"!"` to `s` in place via a mutable borrow. In `main`, create a mutable `String` `"hello"`, print it, call `add_exclamation` on a mutable reference to it, then print it again.',
        starter: '',
        tests: `
assert output === 'hello\\nhello!'
`,
        solution: `fn add_exclamation(s: &mut String) {
    s.push_str("!");
}

fn main() {
    let mut s = String::from("hello");
    println!("{}", s);
    add_exclamation(&mut s);
    println!("{}", s);
}`,
      },
    ],
  },
]

export default challenges
