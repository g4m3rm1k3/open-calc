import type { PracticeChallenge } from './loader'

export const title = 'Broadcasting (Julia)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Write an ordinary single-value function `g(x) = x * 3 - 1`, with no array-handling logic at all. Print `g.([1, 2, 3, 4])` (broadcasting `g` element-wise via the dot). Print `[1, 2, 3, 4] .* 2` (broadcasting a scalar against every element). Print `[1, 2, 3, 4] .- [1, 1, 1, 1]` (broadcasting two same-shaped arrays together, position by position).',
        starter: '',
        tests: `
assert output === '[2, 5, 8, 11]\\n[2, 4, 6, 8]\\n[0, 1, 2, 3]'
`,
        solution: `g(x) = x * 3 - 1

println(g.([1, 2, 3, 4]))
println([1, 2, 3, 4] .* 2)
println([1, 2, 3, 4] .- [1, 1, 1, 1])
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Fix `main`: `h(x) = x^2` is written for a SINGLE number, but `h([1, 2, 3])` calls it directly WITHOUT the broadcasting dot — `^` isn\'t defined for a plain `Vector`, so this crashes with `MethodError: no method matching ^(::Vector{Int64}, ::Int64)`. Add the dot: `h.([1, 2, 3])`, broadcasting `h` element-wise instead of calling it once on the whole array.',
        starter: `h(x) = x^2

result = h([1, 2, 3])
println(result)
`,
        tests: `
assert output === '[1, 4, 9]'
`,
        solution: `h(x) = x^2

result = h.([1, 2, 3])
println(result)
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Write `scale(x) = x * 2`. Given `data = [1, 2, 3, 4]` and `offsets = [10, 20, 30, 40]`, compute a single FUSED broadcast expression `result = scale.(data) .+ offsets .- 5` (Julia fuses chained broadcasts into one efficient pass) and print it. Also print `scale.(data)` alone and `data .+ 100` (scalar broadcast) for comparison.',
        starter: '',
        tests: `
assert output === '[7, 19, 31, 43]\\n[2, 4, 6, 8]\\n[101, 102, 103, 104]'
`,
        solution: `scale(x) = x * 2

data = [1, 2, 3, 4]
offsets = [10, 20, 30, 40]

result = scale.(data) .+ offsets .- 5

println(result)
println(scale.(data))
println(data .+ 100)
`,
      },
    ],
  },
]

export default challenges
