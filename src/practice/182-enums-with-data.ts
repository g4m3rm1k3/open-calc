import type { PracticeChallenge } from './loader'

export const title = 'Enums with Data (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `enum WebEvent { PageLoad, Click { x: i64, y: i64 }, Paste(String) }` and `fn handle_event(event: WebEvent)` that `match`es and prints each variant differently. Call it once with each of the three variants.',
        starter: '',
        tests: `
assert output === 'page loaded\\nclicked at 10, 20\\npasted: hello'
`,
        solution: `enum WebEvent {
    PageLoad,
    Click { x: i64, y: i64 },
    Paste(String),
}

fn handle_event(event: WebEvent) {
    match event {
        WebEvent::PageLoad => println!("page loaded"),
        WebEvent::Click { x, y } => println!("clicked at {}, {}", x, y),
        WebEvent::Paste(s) => println!("pasted: {}", s),
    }
}

fn main() {
    handle_event(WebEvent::PageLoad);
    handle_event(WebEvent::Click { x: 10, y: 20 });
    handle_event(WebEvent::Paste(String::from("hello")));
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'A new `KeyPress(char)` variant was added to `WebEvent`, but the `match` in `handle_event` was left unchanged — this is now a COMPILE ERROR (non-exhaustive match). Add the missing arm: `WebEvent::KeyPress(c) => println!("key pressed: {}", c)`.',
        starter: `enum WebEvent {
    PageLoad,
    Click { x: i64, y: i64 },
    Paste(String),
    KeyPress(char),
}

fn handle_event(event: WebEvent) {
    match event {
        WebEvent::PageLoad => println!("page loaded"),
        WebEvent::Click { x, y } => println!("clicked at {}, {}", x, y),
        WebEvent::Paste(s) => println!("pasted: {}", s),
    }
}

fn main() {
    handle_event(WebEvent::KeyPress('a'));
}`,
        tests: `
assert output === 'key pressed: a'
`,
        solution: `enum WebEvent {
    PageLoad,
    Click { x: i64, y: i64 },
    Paste(String),
    KeyPress(char),
}

fn handle_event(event: WebEvent) {
    match event {
        WebEvent::PageLoad => println!("page loaded"),
        WebEvent::Click { x, y } => println!("clicked at {}, {}", x, y),
        WebEvent::Paste(s) => println!("pasted: {}", s),
        WebEvent::KeyPress(c) => println!("key pressed: {}", c),
    }
}

fn main() {
    handle_event(WebEvent::KeyPress('a'));
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `enum Shape { Circle(f64), Rectangle(f64, f64) }` and `fn area(shape: &Shape) -> f64`, computing each variant\'s area via `match` — a data-carrying enum makes "circle with two dimensions" or "rectangle with only one" structurally impossible to construct. Print both areas formatted to 2 decimal places.',
        starter: '',
        tests: `
assert output === '12.57\\n12.00'
`,
        solution: `enum Shape {
    Circle(f64),
    Rectangle(f64, f64),
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rectangle(w, h) => w * h,
    }
}

fn main() {
    let c = Shape::Circle(2.0);
    let r = Shape::Rectangle(3.0, 4.0);
    println!("{:.2}", area(&c));
    println!("{:.2}", area(&r));
}`,
      },
    ],
  },
]

export default challenges
