import type { PracticeChallenge } from './loader'

export const title = 'Protocols (Swift)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Write `protocol Playable { func play() -> String }`. Write `struct Song: Playable` (stores `title`, `play()` returns `"Playing song: \\(title)"`) and an unrelated `class Video: Playable` (`play()` returns `"Playing video"`). Write `func start(_ item: Playable)` that prints `item.play()`. Call `start` with a `Song` and a `Video`.',
        starter: '',
        tests: `
assert output === 'Playing song: Bohemian Rhapsody\\nPlaying video'
`,
        solution: `protocol Playable {
    func play() -> String
}

struct Song: Playable {
    let title: String
    func play() -> String {
        return "Playing song: \\(title)"
    }
}

class Video: Playable {
    func play() -> String {
        return "Playing video"
    }
}

func start(_ item: Playable) {
    print(item.play())
}

start(Song(title: "Bohemian Rhapsody"))
start(Video())
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Fix `Song`: `Playable` requires BOTH `play()` and `stop()`, but `Song` only implements `play()` — this is a COMPILE ERROR ("type \'Song\' does not conform to protocol \'Playable\'"). Add `func stop() -> String { return "Stopped \\(title)" }` to `Song` so it fully satisfies the protocol.',
        starter: `protocol Playable {
    func play() -> String
    func stop() -> String
}

struct Song: Playable {
    let title: String
    func play() -> String {
        return "Playing song: \\(title)"
    }
}

func start(_ item: Playable) {
    print(item.play())
}

start(Song(title: "Test"))
`,
        tests: `
assert output === 'Playing song: Test'
`,
        solution: `protocol Playable {
    func play() -> String
    func stop() -> String
}

struct Song: Playable {
    let title: String
    func play() -> String {
        return "Playing song: \\(title)"
    }
    func stop() -> String {
        return "Stopped \\(title)"
    }
}

func start(_ item: Playable) {
    print(item.play())
}

start(Song(title: "Test"))
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'swift-program',
        prompt: 'Using the same `Playable` protocol, `Song` struct, and `Video` class, add a THIRD conforming type: `enum Sound: Playable` with cases `.beep`/`.buzz`, whose `play()` `switch`es on `self` to return `"Beep!"`/`"Buzz!"`. Build `let items: [Playable] = [Song(title: "Test"), Video(), Sound.beep, Sound.buzz]` and loop over it calling `start(item)` for each — `start` itself needs ZERO changes to support the new enum case, since a struct, a class, AND an enum can all conform to the same protocol.',
        starter: '',
        tests: `
assert output === 'Playing song: Test\\nPlaying video\\nBeep!\\nBuzz!'
`,
        solution: `protocol Playable {
    func play() -> String
}

struct Song: Playable {
    let title: String
    func play() -> String {
        return "Playing song: \\(title)"
    }
}

class Video: Playable {
    func play() -> String {
        return "Playing video"
    }
}

enum Sound: Playable {
    case beep
    case buzz

    func play() -> String {
        switch self {
        case .beep: return "Beep!"
        case .buzz: return "Buzz!"
        }
    }
}

func start(_ item: Playable) {
    print(item.play())
}

let items: [Playable] = [Song(title: "Test"), Video(), Sound.beep, Sound.buzz]
for item in items {
    start(item)
}
`,
      },
    ],
  },
]

export default challenges
