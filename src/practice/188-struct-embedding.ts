import type { PracticeChallenge } from './loader'

export const title = 'Struct Embedding (Go)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `type Engine struct { Horsepower int }` with a `Start() string` method returning `"vroom"`. Write `type Car struct { Engine; Model string }` EMBEDDING `Engine` (no field name). Construct `Car{Engine: Engine{Horsepower: 300}, Model: "Roadster"}` and print `c.Horsepower`, `c.Start()`, and `c.Model` — the first two are promoted directly from the embedded `Engine`.',
        starter: '',
        tests: `
assert output === '300\\nvroom\\nRoadster'
`,
        solution: `package main

import "fmt"

type Engine struct {
	Horsepower int
}

func (e Engine) Start() string {
	return "vroom"
}

type Car struct {
	Engine
	Model string
}

func main() {
	c := Car{Engine: Engine{Horsepower: 300}, Model: "Roadster"}
	fmt.Println(c.Horsepower)
	fmt.Println(c.Start())
	fmt.Println(c.Model)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Fix `main`: `describe(e Engine)` expects an `Engine`, but `describe(c)` passes a `Car` — this is a COMPILE ERROR, because embedding is composition, NOT inheritance; `Car` isn\'t actually an `Engine` type-wise, despite embedding one. Pass `c.Engine` (the embedded field itself) instead of `c`.',
        starter: `package main

import "fmt"

type Engine struct {
	Horsepower int
}

func (e Engine) Start() string {
	return "vroom"
}

type Car struct {
	Engine
	Model string
}

func describe(e Engine) string {
	return "engine says: " + e.Start()
}

func main() {
	c := Car{Engine: Engine{Horsepower: 300}, Model: "Roadster"}
	fmt.Println(describe(c))
}`,
        tests: `
assert output === 'engine says: vroom'
`,
        solution: `package main

import "fmt"

type Engine struct {
	Horsepower int
}

func (e Engine) Start() string {
	return "vroom"
}

type Car struct {
	Engine
	Model string
}

func describe(e Engine) string {
	return "engine says: " + e.Start()
}

func main() {
	c := Car{Engine: Engine{Horsepower: 300}, Model: "Roadster"}
	fmt.Println(describe(c.Engine))
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Give `Engine` a `Start() string` returning `"engine vroom"`. Give `Car` (which embeds `Engine`) its OWN `Start() string` method returning `"car starting: " + c.Engine.Start()` — the outer type\'s own method SHADOWS the promoted one. Print `c.Start()` (uses `Car`\'s own method) and `c.Engine.Start()` (reaches the embedded method directly, bypassing the shadow).',
        starter: '',
        tests: `
assert output === 'car starting: engine vroom\\nengine vroom'
`,
        solution: `package main

import "fmt"

type Engine struct {
	Horsepower int
}

func (e Engine) Start() string {
	return "engine vroom"
}

type Car struct {
	Engine
	Model string
}

func (c Car) Start() string {
	return "car starting: " + c.Engine.Start()
}

func main() {
	c := Car{Engine: Engine{Horsepower: 300}, Model: "Roadster"}
	fmt.Println(c.Start())
	fmt.Println(c.Engine.Start())
}`,
      },
    ],
  },
]

export default challenges
