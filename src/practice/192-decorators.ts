import type { PracticeChallenge } from './loader'

export const title = 'Decorators (Python)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write `log_call(func)`, a decorator whose `wrapper(*args, **kwargs)` prints `"calling " + func.__name__`, calls `func(*args, **kwargs)`, prints `"done"`, then returns the result. Decorate `def add(a, b): return a + b` with `@log_call`, then print `add(3, 4)`.',
        starter: '',
        tests: `
assert output === 'calling add\\ndone\\n7'
`,
        solution: `def log_call(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        result = func(*args, **kwargs)
        print("done")
        return result
    return wrapper


@log_call
def add(a, b):
    return a + b


print(add(3, 4))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Fix `wrapper`: it calls `func(*args, **kwargs)` and stores the result, but never returns it — since a function with no `return` implicitly returns `None`, `add(3, 4)` now prints `None` instead of `7`. Add `return result` as the last line of `wrapper`.',
        starter: `def log_call(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        result = func(*args, **kwargs)
        print("done")
    return wrapper


@log_call
def add(a, b):
    return a + b


print(add(3, 4))
`,
        tests: `
assert output === 'calling add\\ndone\\n7'
`,
        solution: `def log_call(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        result = func(*args, **kwargs)
        print("done")
        return result
    return wrapper


@log_call
def add(a, b):
    return a + b


print(add(3, 4))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write a decorator FACTORY `repeat(n)` that returns a `decorator(func)`, whose `wrapper(*args, **kwargs)` calls `func(*args, **kwargs)` `n` times, collecting each result into a list and returning it — three levels of nested functions (`repeat` → `decorator` → `wrapper`), needed so the decorator itself can take an argument (`n`). Decorate `def greet(name): return f"hi {name}"` with `@repeat(3)`, then print `greet("Bob")`.',
        starter: '',
        tests: `
assert output === "['hi Bob', 'hi Bob', 'hi Bob']"
`,
        solution: `def repeat(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(n):
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator


@repeat(3)
def greet(name):
    return f"hi {name}"


print(greet("Bob"))
`,
      },
    ],
  },
]

export default challenges
