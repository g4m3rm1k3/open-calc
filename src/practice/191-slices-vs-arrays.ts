import type { PracticeChallenge } from './loader'

export const title = 'Slices vs Arrays (Go)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Write `func modifyArray(a [3]int)` and `func modifySlice(sl []int)`, each setting index 0 to `999`. In `main`, create `arr := [3]int{1, 2, 3}` and `s := []int{1, 2, 3}`, call `modifyArray(arr)` and `modifySlice(s)`, then print both — the array is unchanged (arrays copy entirely on call) but the slice IS changed (slices share their underlying array).',
        starter: '',
        tests: `
assert output === '[1 2 3]\\n[999 2 3]'
`,
        solution: `package main

import "fmt"

func modifyArray(a [3]int) {
	a[0] = 999
}

func modifySlice(sl []int) {
	sl[0] = 999
}

func main() {
	arr := [3]int{1, 2, 3}
	s := []int{1, 2, 3}

	modifyArray(arr)
	modifySlice(s)

	fmt.Println(arr)
	fmt.Println(s)
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Fix `addItem`: it reassigns `s = append(s, item)`, but that only reassigns its OWN local copy of the slice header — since Go passes slice headers by value, `main`\'s `s` is left unchanged, silently losing the appended item. Make `addItem` return the new slice (`func addItem(s []int, item int) []int { return append(s, item) }`) and reassign the result in `main`: `s = addItem(s, 4)`.',
        starter: `package main

import "fmt"

func addItem(s []int, item int) {
	s = append(s, item)
}

func main() {
	s := []int{1, 2, 3}
	addItem(s, 4)
	fmt.Println(s)
}`,
        tests: `
assert output === '[1 2 3 4]'
`,
        solution: `package main

import "fmt"

func addItem(s []int, item int) []int {
	return append(s, item)
}

func main() {
	s := []int{1, 2, 3}
	s = addItem(s, 4)
	fmt.Println(s)
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'go-program',
        prompt: 'Create `original := make([]int, 3, 3)` (length 3, capacity 3 — no room to grow in place) and set its 3 elements to `1, 2, 3`. Create `grown := append(original, 4)` — since `original` is already at full capacity, this MUST allocate a brand-new underlying array. Set `grown[0] = 999`, then print both `original` and `grown` — `original` is untouched, since `grown` no longer shares its underlying array.',
        starter: '',
        tests: `
assert output === '[1 2 3]\\n[999 2 3 4]'
`,
        solution: `package main

import "fmt"

func main() {
	original := make([]int, 3, 3)
	original[0], original[1], original[2] = 1, 2, 3

	grown := append(original, 4)
	grown[0] = 999

	fmt.Println(original)
	fmt.Println(grown)
}`,
      },
    ],
  },
]

export default challenges
