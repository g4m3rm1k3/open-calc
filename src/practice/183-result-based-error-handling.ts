import type { PracticeChallenge } from './loader'

export const title = 'Result-Based Error Handling (Rust)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'rust-program',
        prompt: 'Write `fn parse_age(input: &str) -> Result<u32, String>` (parses, mapping a parse error to `"invalid number"`) and `fn process(input: &str) -> Result<u32, String>` using `?` to propagate `parse_age`\'s error, otherwise returning `Ok(age * 2)`. `match` on `process("25")` and `process("not a number")`, printing each outcome.',
        starter: '',
        tests: `
assert output === 'doubled age: 50\\nerror: invalid number'
`,
        solution: `fn parse_age(input: &str) -> Result<u32, String> {
    input.parse::<u32>().map_err(|_| String::from("invalid number"))
}

fn process(input: &str) -> Result<u32, String> {
    let age = parse_age(input)?;
    Ok(age * 2)
}

fn main() {
    match process("25") {
        Ok(doubled) => println!("doubled age: {}", doubled),
        Err(e) => println!("error: {}", e),
    }

    match process("not a number") {
        Ok(doubled) => println!("doubled age: {}", doubled),
        Err(e) => println!("error: {}", e),
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
        prompt: 'Fix `process`: it currently uses `.unwrap_or(0)`, which silently swallows a parse failure into `0` instead of propagating the real error — use `?` on `parse_age(input)` instead, so an invalid input correctly produces `Err("invalid number")` rather than a fake successful `0`.',
        starter: `fn parse_age(input: &str) -> Result<u32, String> {
    input.parse::<u32>().map_err(|_| String::from("invalid number"))
}

fn process(input: &str) -> Result<u32, String> {
    let age = parse_age(input).unwrap_or(0);
    Ok(age * 2)
}

fn main() {
    match process("30") {
        Ok(doubled) => println!("doubled age: {}", doubled),
        Err(e) => println!("error: {}", e),
    }
    match process("oops") {
        Ok(doubled) => println!("doubled age: {}", doubled),
        Err(e) => println!("error: {}", e),
    }
}`,
        tests: `
assert output === 'doubled age: 60\\nerror: invalid number'
`,
        solution: `fn parse_age(input: &str) -> Result<u32, String> {
    input.parse::<u32>().map_err(|_| String::from("invalid number"))
}

fn process(input: &str) -> Result<u32, String> {
    let age = parse_age(input)?;
    Ok(age * 2)
}

fn main() {
    match process("30") {
        Ok(doubled) => println!("doubled age: {}", doubled),
        Err(e) => println!("error: {}", e),
    }
    match process("oops") {
        Ok(doubled) => println!("doubled age: {}", doubled),
        Err(e) => println!("error: {}", e),
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
        prompt: 'Write a two-step fallible pipeline: `fn validate_age(age: u32) -> Result<u32, String>` (errors `"age too large"` if `age > 150`), and update `process` to chain BOTH `parse_age(input)?` and `validate_age(age)?` — the FIRST failure anywhere in the chain short-circuits and propagates immediately. Test with `"30"`, `"abc"`, and `"200"`.',
        starter: '',
        tests: `
assert output === 'ok: 60\\nerr: invalid number\\nerr: age too large'
`,
        solution: `fn parse_age(input: &str) -> Result<u32, String> {
    input.parse::<u32>().map_err(|_| String::from("invalid number"))
}

fn validate_age(age: u32) -> Result<u32, String> {
    if age > 150 { Err(String::from("age too large")) } else { Ok(age) }
}

fn process(input: &str) -> Result<u32, String> {
    let age = parse_age(input)?;
    let valid_age = validate_age(age)?;
    Ok(valid_age * 2)
}

fn main() {
    match process("30") {
        Ok(v) => println!("ok: {}", v),
        Err(e) => println!("err: {}", e),
    }
    match process("abc") {
        Ok(v) => println!("ok: {}", v),
        Err(e) => println!("err: {}", e),
    }
    match process("200") {
        Ok(v) => println!("ok: {}", v),
        Err(e) => println!("err: {}", e),
    }
}`,
      },
    ],
  },
]

export default challenges
