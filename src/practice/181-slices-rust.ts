import type { PracticeChallenge } from './loader'

export const title = 'Slices (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn sum(s: &[i32]) -> i32` summing a slice. In `main`, create `arr = [1, 2, 3, 4, 5]`; print `&arr[1..3]` with `{:?}`; print `"sum of slice: {}"` for `sum(&arr[1..3])` and `"sum of whole array: {}"` for `sum(&arr)`. Then create `s = "hello world"` and print `&s[0..5]`.',
        starter: '',
        tests: `
assert output === '[2, 3]\\nsum of slice: 5\\nsum of whole array: 15\\nhello'
`,
        solution: `fn sum(s: &[i32]) -> i32 {
    s.iter().sum()
}

fn main() {
    let arr = [1, 2, 3, 4, 5];

    let slice = &arr[1..3];
    println!("{:?}", slice);

    println!("sum of slice: {}", sum(&arr[1..3]));
    println!("sum of whole array: {}", sum(&arr));

    let s = String::from("hello world");
    let hello = &s[0..5];
    println!("{}", hello);
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Fix these slices: `from_two` should use the open-ended range `arr[2..]` (index 2 through the end), and `up_to_two` should use `arr[..2]` (start through index 1) — not the empty ranges `arr[2..2]` / `arr[0..0]` currently there.',
        starter: `fn main() {
    let arr = [1, 2, 3, 4, 5];
    let from_two = &arr[2..2];
    let up_to_two = &arr[0..0];
    println!("{:?}", from_two);
    println!("{:?}", up_to_two);
}`,
        tests: `
assert output === '[3, 4, 5]\\n[1, 2]'
`,
        solution: `fn main() {
    let arr = [1, 2, 3, 4, 5];
    let from_two = &arr[2..];
    let up_to_two = &arr[..2];
    println!("{:?}", from_two);
    println!("{:?}", up_to_two);
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn sum(s: &[i32]) -> i32` and call it with BOTH a plain array AND a `Vec<i32>` — `&[T]` accepts any contiguous sequence of `T`, arrays and Vecs alike, which is why it\'s the idiomatic parameter type over `&Vec<T>`.',
        starter: '',
        tests: `
assert output === '6\\n60'
`,
        solution: `fn sum(s: &[i32]) -> i32 {
    s.iter().sum()
}

fn main() {
    let arr = [1, 2, 3];
    let v = vec![10, 20, 30];
    println!("{}", sum(&arr));
    println!("{}", sum(&v));
}`,
      },
    ],
  },
]

export default challenges
