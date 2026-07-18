import type { PracticeChallenge } from './loader'

export const title = 'Multiple Dispatch (Julia)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Define `struct Fire end`, `struct Water end`, `struct Grass end`. Define FOUR separate `interact` methods, each specialized for a distinct pair of argument types: `(Fire, Water)`, `(Water, Fire)`, `(Fire, Grass)`, `(Grass, Fire)` — each returning a different descriptive string. Call `interact(Fire(), Water())`, `interact(Water(), Fire())`, and `interact(Fire(), Grass())`, printing each — confirming argument ORDER affects which specific method gets selected.',
        starter: '',
        tests: `
assert output === 'fire is extinguished\\nwater extinguishes fire\\nfire burns grass'
`,
        solution: `struct Fire end
struct Water end
struct Grass end

interact(a::Fire, b::Water) = "fire is extinguished"
interact(a::Water, b::Fire) = "water extinguishes fire"
interact(a::Fire, b::Grass) = "fire burns grass"
interact(a::Grass, b::Fire) = "grass burns"

println(interact(Fire(), Water()))
println(interact(Water(), Fire()))
println(interact(Fire(), Grass()))
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Fix `interact`: it\'s ONE method with an internal `if a isa Fire && b isa Water` check — it never handles the SWAPPED order `(Water, Fire)`, silently falling through to `"nothing happens"` even though water meeting fire should behave the same either way. Replace the single branching method with TWO separate multiple-dispatch methods — `interact(a::Fire, b::Water)` and `interact(a::Water, b::Fire)` — each directly returning `"fire is extinguished"`, so neither combination can be silently missed.',
        starter: `struct Fire end
struct Water end

function interact(a, b)
    if a isa Fire && b isa Water
        return "fire is extinguished"
    end
    return "nothing happens"
end

println(interact(Water(), Fire()))
`,
        tests: `
assert output === 'fire is extinguished'
`,
        solution: `struct Fire end
struct Water end

interact(a::Fire, b::Water) = "fire is extinguished"
interact(a::Water, b::Fire) = "fire is extinguished"

println(interact(Water(), Fire()))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'julia-program',
        prompt: 'Starting from the `Fire`/`Water` `interact` methods (both orders), define a BRAND NEW type `struct Ice end` and FOUR new `interact` methods for combinations involving it (`Fire`/`Ice` both orders, `Water`/`Ice` both orders) — WITHOUT modifying any of the original `Fire`/`Water` code. Call `interact` for `(Fire, Water)`, `(Fire, Ice)`, `(Water, Ice)`, and `(Ice, Fire)`, printing each — confirming dispatch correctly picks among ALL methods, old and newly-added alike.',
        starter: '',
        tests: `
assert output === 'fire is extinguished\\nice melts\\nwater freezes\\nice melts'
`,
        solution: `struct Fire end
struct Water end

interact(a::Fire, b::Water) = "fire is extinguished"
interact(a::Water, b::Fire) = "fire is extinguished"

struct Ice end

interact(a::Fire, b::Ice) = "ice melts"
interact(a::Ice, b::Fire) = "ice melts"
interact(a::Water, b::Ice) = "water freezes"
interact(a::Ice, b::Water) = "water freezes"

println(interact(Fire(), Water()))
println(interact(Fire(), Ice()))
println(interact(Water(), Ice()))
println(interact(Ice(), Fire()))
`,
      },
    ],
  },
]

export default challenges
