import type { PracticeChallenge } from './loader'

export const title = 'Context Managers (Python)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write a `Resource` class with `__enter__` (prints `"acquiring"`, returns `self`) and `__exit__(self, exc_type, exc_val, exc_tb)` (prints `"releasing"`, returns `False`). Use it in `with Resource() as r:` and print `"using resource"` inside the block.',
        starter: '',
        tests: `
assert output === 'acquiring\\nusing resource\\nreleasing'
`,
        solution: `class Resource:
    def __enter__(self):
        print("acquiring")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("releasing")
        return False


with Resource() as r:
    print("using resource")
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Fix `use_resource`: it manually calls `r.acquire()` then `r.release()`, but when `should_fail` is `True`, the `ValueError` is raised BEFORE `r.release()` is reached, so cleanup never runs — the resource leaks. Turn `Resource` into a real context manager (`__enter__`/`__exit__` printing `"acquiring"`/`"releasing"`, `__exit__` returning `False`) and use `with Resource() as r:` inside `use_resource`, so `"releasing"` prints even when the block raises.',
        starter: `class Resource:
    def acquire(self):
        print("acquiring")

    def release(self):
        print("releasing")


def use_resource(should_fail):
    r = Resource()
    r.acquire()
    if should_fail:
        raise ValueError("failed")
    print("using resource")
    r.release()


try:
    use_resource(True)
except ValueError as e:
    print(f"caught: {e}")
`,
        tests: `
assert output === 'acquiring\\nreleasing\\ncaught: failed'
`,
        solution: `class Resource:
    def __enter__(self):
        print("acquiring")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("releasing")
        return False


def use_resource(should_fail):
    with Resource() as r:
        if should_fail:
            raise ValueError("failed")
        print("using resource")


try:
    use_resource(True)
except ValueError as e:
    print(f"caught: {e}")
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'python-program',
        prompt: 'Write `SuppressValueError`, a context manager whose `__exit__` checks `if exc_type is ValueError:` — if so, prints `f"suppressed: {exc_val}"` and returns `True` (suppressing it); otherwise returns `False` (letting other exception types propagate). Use it around code raising a `ValueError` (prints `"step 1"` first, exception is suppressed, `"after block"` runs normally afterward), then around code raising a `TypeError` inside a `try/except TypeError` (prints `"step 2"` first, the `TypeError` is NOT suppressed and propagates to the `except`, printing `f"propagated: {e}"`).',
        starter: '',
        tests: `
assert output === 'step 1\\nsuppressed: oops\\nafter block\\nstep 2\\npropagated: not suppressed'
`,
        solution: `class SuppressValueError:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is ValueError:
            print(f"suppressed: {exc_val}")
            return True
        return False


with SuppressValueError():
    print("step 1")
    raise ValueError("oops")

print("after block")

try:
    with SuppressValueError():
        print("step 2")
        raise TypeError("not suppressed")
except TypeError as e:
    print(f"propagated: {e}")
`,
      },
    ],
  },
]

export default challenges
