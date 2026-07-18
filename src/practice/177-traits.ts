import type { PracticeChallenge } from './loader'

export const title = 'Traits (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `trait Summary { fn summarize(&self) -> String; }`, then `struct Article { title: String }` and `struct Tweet { user: String, text: String }`, each implementing `Summary` differently. Write `fn notify(item: &impl Summary)` printing `"Breaking! {summary}"`, and call it once with an `Article` and once with a `Tweet`.',
        starter: '',
        tests: `
assert output === "Breaking! Rust 2.0 Released...\\nBreaking! @rustlang: It's out!"
`,
        solution: `trait Summary {
    fn summarize(&self) -> String;
}

struct Article { title: String }
struct Tweet { user: String, text: String }

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}...", self.title)
    }
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("@{}: {}", self.user, self.text)
    }
}

fn notify(item: &impl Summary) {
    println!("Breaking! {}", item.summarize());
}

fn main() {
    let article = Article { title: String::from("Rust 2.0 Released") };
    let tweet = Tweet { user: String::from("rustlang"), text: String::from("It's out!") };

    notify(&article);
    notify(&tweet);
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Add `impl Summary for Video`, returning `"Watch: {title}"` from `summarize` — without it, calling the existing `notify(&video)` is a COMPILE ERROR, since `Video` doesn\'t yet satisfy the `Summary` trait `notify` requires.',
        starter: `trait Summary {
    fn summarize(&self) -> String;
}

struct Video { title: String }

fn notify(item: &impl Summary) {
    println!("Breaking! {}", item.summarize());
}

fn main() {
    let video = Video { title: String::from("Rust in 100 Seconds") };
    notify(&video);
}`,
        tests: `
assert output === 'Breaking! Watch: Rust in 100 Seconds'
`,
        solution: `trait Summary {
    fn summarize(&self) -> String;
}

struct Video { title: String }

impl Summary for Video {
    fn summarize(&self) -> String {
        format!("Watch: {}", self.title)
    }
}

fn notify(item: &impl Summary) {
    println!("Breaking! {}", item.summarize());
}

fn main() {
    let video = Video { title: String::from("Rust in 100 Seconds") };
    notify(&video);
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `trait Greet` with a required `fn name(&self) -> String` AND a DEFAULT method `fn greet(&self) -> String` returning `"Hello, {name}!"`. Implement it for `Person` (using the default `greet`) and for `Robot` (OVERRIDING `greet` to return `"BEEP BOOP {id}"` instead). Print both.',
        starter: '',
        tests: `
assert output === 'Hello, Alice!\\nBEEP BOOP R2D2'
`,
        solution: `trait Greet {
    fn name(&self) -> String;
    fn greet(&self) -> String {
        format!("Hello, {}!", self.name())
    }
}

struct Person { name: String }
impl Greet for Person {
    fn name(&self) -> String { self.name.clone() }
}

struct Robot { id: String }
impl Greet for Robot {
    fn name(&self) -> String { self.id.clone() }
    fn greet(&self) -> String {
        format!("BEEP BOOP {}", self.id)
    }
}

fn main() {
    let p = Person { name: String::from("Alice") };
    let r = Robot { id: String::from("R2D2") };
    println!("{}", p.greet());
    println!("{}", r.greet());
}`,
      },
    ],
  },
]

export default challenges
