import type { PracticeChallenge } from './loader'

export const title = 'Implicit Interfaces (Go)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `type Shape interface { Area() float64 }`, a `Circle` struct with a `Radius` field, and a `Rectangle` struct with `Width`/`Height` fields — each with an `Area() float64` method, neither mentioning `Shape` anywhere. Write `func printArea(s Shape)` that prints `s.Area()` formatted to 2 decimals (`%.2f`). Call it with `Circle{Radius: 2}` (use `3.14159` for pi) and `Rectangle{Width: 3, Height: 4}`.',
        starter: '',
        tests: `
assert output === '12.57\\n12.00'
`,
        solution: `package main

import "fmt"

type Shape interface {
	Area() float64
}

type Circle struct {
	Radius float64
}

func (c Circle) Area() float64 {
	return 3.14159 * c.Radius * c.Radius
}

type Rectangle struct {
	Width, Height float64
}

func (r Rectangle) Area() float64 {
	return r.Width * r.Height
}

func printArea(s Shape) {
	fmt.Printf("%.2f\\n", s.Area())
}

func main() {
	printArea(Circle{Radius: 2})
	printArea(Rectangle{Width: 3, Height: 4})
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Fix `Square`: its `Area()` method returns `int`, but `Shape` requires `Area() float64` — the signatures don\'t match, so `Square` does NOT implicitly satisfy `Shape`, and `printArea(Square{Side: 5})` is a COMPILE ERROR. Change `Area`\'s return type to `float64` and return `s.Side * s.Side` directly (no `int(...)` conversion).',
        starter: `package main

import "fmt"

type Shape interface {
	Area() float64
}

type Square struct {
	Side float64
}

func (s Square) Area() int {
	return int(s.Side * s.Side)
}

func printArea(s Shape) {
	fmt.Printf("%.2f\\n", s.Area())
}

func main() {
	printArea(Square{Side: 5})
}`,
        tests: `
assert output === '25.00'
`,
        solution: `package main

import "fmt"

type Shape interface {
	Area() float64
}

type Square struct {
	Side float64
}

func (s Square) Area() float64 {
	return s.Side * s.Side
}

func printArea(s Shape) {
	fmt.Printf("%.2f\\n", s.Area())
}

func main() {
	printArea(Square{Side: 5})
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write a `Counter` struct with an `Increment()` method (pointer receiver, increments an internal `value`) and a `String() string` method (pointer receiver, returns `"Counter(N)"` via `fmt.Sprintf`) — defined with no mention of any interface. AFTER `Counter`, define `type Stringer interface { String() string }` and `func describe(s Stringer) string` returning `"value is: " + s.String()`. In `main`, create `c := &Counter{}`, call `Increment()` 3 times, then print `describe(c)` — `Counter` satisfies `Stringer` purely structurally, even though `Stringer` is declared AFTER `Counter` exists.',
        starter: '',
        tests: `
assert output === 'value is: Counter(3)'
`,
        solution: `package main

import "fmt"

type Counter struct {
	value int
}

func (c *Counter) Increment() {
	c.value++
}

func (c *Counter) String() string {
	return fmt.Sprintf("Counter(%d)", c.value)
}

type Stringer interface {
	String() string
}

func describe(s Stringer) string {
	return "value is: " + s.String()
}

func main() {
	c := &Counter{}
	c.Increment()
	c.Increment()
	c.Increment()
	fmt.Println(describe(c))
}`,
      },
    ],
  },
]

export default challenges
