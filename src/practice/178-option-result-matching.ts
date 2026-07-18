import type { PracticeChallenge } from './loader'

export const title = 'Option/Result Matching (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn find_user(id: u32) -> Option<String>` (returns `Some("Alice")` only for `id == 1`, else `None`) and `fn divide(a: f64, b: f64) -> Result<f64, String>` (`Err` on division by zero, else `Ok`). In `main`, `match` on `find_user(1)`, `find_user(2)`, `divide(10.0, 0.0)`, and `divide(10.0, 2.0)`, printing each outcome.',
        starter: '',
        tests: `
assert output === 'Found: Alice\\nNot found\\nError: divide by zero\\nResult: 5'
`,
        solution: `fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some(String::from("Alice")) } else { None }
}

fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 { Err(String::from("divide by zero")) } else { Ok(a / b) }
}

fn main() {
    match find_user(1) {
        Some(name) => println!("Found: {}", name),
        None => println!("Not found"),
    }

    match find_user(2) {
        Some(name) => println!("Found: {}", name),
        None => println!("Not found"),
    }

    match divide(10.0, 0.0) {
        Ok(result) => println!("Result: {}", result),
        Err(e) => println!("Error: {}", e),
    }

    match divide(10.0, 2.0) {
        Ok(result) => println!("Result: {}", result),
        Err(e) => println!("Error: {}", e),
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
        prompt: 'Fix the `match`: it\'s missing the `None` arm — `match` must be EXHAUSTIVE, handling every variant of `Option`, or the code simply won\'t compile ("non-exhaustive patterns"). Add the missing `None => println!("Not found")` arm.',
        starter: `fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some(String::from("Alice")) } else { None }
}

fn main() {
    match find_user(2) {
        Some(name) => println!("Found: {}", name),
    }
}`,
        tests: `
assert output === 'Not found'
`,
        solution: `fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some(String::from("Alice")) } else { None }
}

fn main() {
    match find_user(2) {
        Some(name) => println!("Found: {}", name),
        None => println!("Not found"),
    }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write a program using `.unwrap_or("Guest".to_string())` instead of `.unwrap()` to safely extract a value from `find_user`\'s `Option<String>` with a fallback default — this never panics, even when the result is `None`, unlike `.unwrap()`. Print the result for `find_user(1)` and `find_user(2)`.',
        starter: '',
        tests: `
assert output === 'Alice\\nGuest'
`,
        solution: `fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some(String::from("Alice")) } else { None }
}

fn main() {
    let name1 = find_user(1).unwrap_or(String::from("Guest"));
    let name2 = find_user(2).unwrap_or(String::from("Guest"));
    println!("{}", name1);
    println!("{}", name2);
}`,
      },
    ],
  },
]

export default challenges
