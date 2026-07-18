import type { PracticeChallenge } from './loader'

export const title = 'Smart Pointers (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write a program: `Box::new(5)` and print the dereferenced value as `"boxed: {v}"`. Then `Rc::new(String::from("shared"))` as `a`, printing `Rc::strong_count(&a)` before and after `Rc::clone(&a)` into `b2`, then print `"a: {a}, b2: {b2}"`.',
        starter: '',
        tests: `
assert output === 'boxed: 5\\ncount after creating a: 1\\ncount after cloning: 2\\na: shared, b2: shared'
`,
        solution: `use std::rc::Rc;

fn main() {
    let b = Box::new(5);
    println!("boxed: {}", *b);

    let a = Rc::new(String::from("shared"));
    println!("count after creating a: {}", Rc::strong_count(&a));

    let b2 = Rc::clone(&a);
    println!("count after cloning: {}", Rc::strong_count(&a));

    println!("a: {}, b2: {}", a, b2);
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Fix `b3`: it must be a genuine THIRD `Rc::clone(&a)`, not a plain reference (`&a`) — a plain reference doesn\'t increment the strong count, so `Rc::strong_count(&a)` would stay at `2` instead of correctly reaching `3`.',
        starter: `use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("shared"));
    let b2 = Rc::clone(&a);
    let b3 = &a;
    println!("count: {}", Rc::strong_count(&a));
    println!("{} {} {}", a, b2, b3);
}`,
        tests: `
assert output === 'count: 3\\nshared shared shared'
`,
        solution: `use std::rc::Rc;

fn main() {
    let a = Rc::new(String::from("shared"));
    let b2 = Rc::clone(&a);
    let b3 = Rc::clone(&a);
    println!("count: {}", Rc::strong_count(&a));
    println!("{} {} {}", a, b2, b3);
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write a program using `RefCell<i32>` for interior mutability: create `RefCell::new(5)`, mutate the value through `.borrow_mut()` by adding `10` to it, then print the result via `.borrow()` — mutating through what looks like an immutable binding, with the borrow check moved to runtime.',
        starter: '',
        tests: `
assert output === '15'
`,
        solution: `use std::cell::RefCell;

fn main() {
    let data = RefCell::new(5);
    *data.borrow_mut() += 10;
    println!("{}", data.borrow());
}`,
      },
    ],
  },
]

export default challenges
