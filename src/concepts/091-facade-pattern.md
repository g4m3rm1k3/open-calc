---
concept: 091-facade-pattern
name: Facade Pattern
---

## Definition

The Facade pattern provides one simple, unified interface to a larger, more
complex set of underlying classes or subsystems, hiding their internal
complexity behind a single entry point.

## Problem

Using a complex subsystem directly — several classes that must be created
and coordinated in a specific order to accomplish one common task — forces
every caller to understand and repeat that coordination logic. A facade
wraps the whole coordination sequence behind one simple method, so callers
don't need to know the subsystem's internals at all.

## Execution

Call theater.watchMovie('Inception')
↓
Facade internally: turn on the projector, turn on the sound system, play
the disc — several subsystem calls, in a specific required order
↓
The caller only ever saw ONE method call — every coordination detail was
hidden inside the facade

## Computer Science

A facade doesn't add new capability — the underlying subsystem could
always be driven manually — it purely simplifies the common-case calling
code by hard-coding one sensible sequence of calls behind one entry point,
trading full flexibility for simplicity in the common case.

Tags: Simplification, Subsystem coordination, API design

## Software Engineering

A facade is especially valuable at integration boundaries — wrapping a
complex third-party library or a legacy subsystem behind one clean,
purpose-built interface so the rest of the codebase never has to learn that
subsystem's full API, only the facade's simplified one.

Tags: API design, Third-party libraries, Legacy systems, Simplicity

## Common Mistakes

- Making the facade the ONLY way to access the subsystem, when some callers genuinely need finer-grained control the simplified facade doesn't expose — a facade should simplify the common case, not necessarily replace direct access for every caller.
- Letting the facade grow into a dumping ground for unrelated convenience methods, rather than staying focused on one coherent simplified workflow.

## Exercises

- Add an `endMovie()` method to the facade that reverses the startup sequence.
- Identify one place in a real project where a small wrapper function hides a multi-step setup sequence — is it functioning as a facade, even if it wasn't consciously designed as one?

## javascript

```javascript
class Projector { turnOn() { return 'Projector on' } }
class SoundSystem { turnOn() { return 'Sound on' } }
class DiscPlayer { play(movie) { return `Playing ${movie}` } }

class HomeTheaterFacade {
  #projector = new Projector()
  #sound = new SoundSystem()
  #disc = new DiscPlayer()
  watchMovie(movie) {
    const steps = []
    steps.push(this.#projector.turnOn())
    steps.push(this.#sound.turnOn())
    steps.push(this.#disc.play(movie))
    return steps
  }
}

const theater = new HomeTheaterFacade()
console.log(theater.watchMovie('Inception'))
// [ 'Projector on', 'Sound on', 'Playing Inception' ]
```
Walkthrough: `watchMovie` is the only method the caller ever needs — it
coordinates three separate subsystem objects (`Projector`, `SoundSystem`,
`DiscPlayer`) in the correct order internally, hiding that coordination
behind one simple call.

## python

```python
class Projector:
    def turn_on(self):
        return 'Projector on'


class SoundSystem:
    def turn_on(self):
        return 'Sound on'


class DiscPlayer:
    def play(self, movie):
        return f'Playing {movie}'


class HomeTheaterFacade:
    def __init__(self):
        self._projector = Projector()
        self._sound = SoundSystem()
        self._disc = DiscPlayer()

    def watch_movie(self, movie):
        steps = []
        steps.append(self._projector.turn_on())
        steps.append(self._sound.turn_on())
        steps.append(self._disc.play(movie))
        return steps


theater = HomeTheaterFacade()
print(theater.watch_movie('Inception'))
# ['Projector on', 'Sound on', 'Playing Inception']
```
Walkthrough: identical coordination-hiding role as the JavaScript version —
`watch_movie` is the one method callers need, internally driving three
separate subsystem objects in the right order.
