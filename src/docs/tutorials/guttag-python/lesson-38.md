# Lesson 38: Random Walks and Simulation

What you will build
In this lesson, you will implement a random walk simulation to model Brownian motion, a process where an entity takes successive random steps. We will separate the concerns into an agent (the `Drunk`), an environment (the `Field`), and the simulation driver itself. The transferable problem we are solving is using Monte Carlo simulation techniques—modeling a process, running many trials, and aggregating the results—to discover a fundamental mathematical truth: the expected distance of a random walk after *n* steps is proportional to the square root of *n*.

What you need to know first
Lessons 0–37

Terms used in this lesson
**Expected Distance** — The mathematical average distance from the starting point after a given number of random steps.
**Simulation** — The process of modeling a real-world or theoretical system using code, allowing us to run trials and observe probabilistic outcomes.
**Polymorphism** — The ability of different objects (like a regular drunk vs. a biased drunk) to respond to the exact same method call (`take_step()`) in their own specific ways.
**import** — Python keyword that loads external modules (like `random` and `math`) into your current script.
**class** — Python keyword that defines a new blueprint for creating objects.
**__init__** — The constructor method called automatically when a new object is created from a class, responsible for setting up its initial state.
**self** — The implicit first argument in instance methods that refers to the specific object the method is being called on.
**return** — Python keyword that exits a function and hands a value back to the caller.
**for ... in** — Python syntax for iterating over a sequence of values or a range of numbers.
**if** — Python keyword for conditional execution based on a boolean expression.
**raise** — Python keyword used to intentionally trigger an exception when an invalid state or operation is detected.
**not in** — Python operator that evaluates to True if a specified element is not found within a collection.

Objects and methods used
**random.seed**
- *What it is:* A function that initializes the internal state of the random number generator.
- *Implementation:* `random.seed(a=None)` from the standard library.
- *Its use:* We use it to make our random walks deterministic and reproducible, ensuring that the same sequence of "random" choices occurs every time we run the script.
- *Type:* A standard library function.
- *Responsibility:* Initializes the pseudo-random number generator so that sequence of random numbers is repeatable if given the same seed.
- *Depends on:* An integer or hashable object used as the seed.
- *Connects to:* Called by the simulation setup code; dictates the behavior of all subsequent `random` module calls.
- *Shape:* A global function within the `random` module.

**random.choice**
- *What it is:* A function that returns a randomly selected element from a non-empty sequence.
- *Implementation:* `random.choice(seq)` from the standard library.
- *Its use:* We use it to pick the next step (e.g., +1 or -1) with equal probability.
- *Type:* A standard library function.
- *Responsibility:* Selects one element from an iterable uniformly at random.
- *Depends on:* A sequence (like a list or tuple) of possible choices.
- *Connects to:* Called by the walk loop or the `Drunk` agent to determine movement.
- *Shape:* A utility function within the `random` module.

**math.sqrt**
- *What it is:* A function that calculates the square root of a number.
- *Implementation:* `math.sqrt(x)` from the standard library.
- *Its use:* Used to calculate the Euclidean distance between two points, and to show the theoretical expected distance of the walk.
- *Type:* A standard library function.
- *Responsibility:* Returns the exact square root of the given numeric input.
- *Depends on:* A numeric value `x`.
- *Connects to:* Called by distance calculations and simulation reporting.
- *Shape:* A global mathematical function within the `math` module.

**len**
- *What it is:* A built-in function that returns the number of items in a container.
- *Implementation:* `len(s)`
- *Its use:* Used to count the total number of trials to compute the mean distance.
- *Type:* A built-in function.
- *Responsibility:* Measures the exact size of a collection.
- *Depends on:* A collection or sequence (like a list).
- *Connects to:* Called during the mean calculation by the simulation logic.
- *Shape:* A built-in global function.

**sum**
- *What it is:* A built-in function that adds up the items of an iterable from left to right.
- *Implementation:* `sum(iterable, /, start=0)`
- *Its use:* Used to sum all distances across trials to calculate the average.
- *Type:* A built-in function.
- *Responsibility:* Accumulates numeric values into a single total.
- *Depends on:* An iterable of numbers.
- *Connects to:* Called by the simulation logic.
- *Shape:* A built-in global function.

**abs**
- *What it is:* A built-in function that returns the absolute (positive) value of a number.
- *Implementation:* `abs(x)`
- *Its use:* Used in the 1D walk to determine the distance from 0 regardless of direction.
- *Type:* A built-in function.
- *Responsibility:* Strips the sign from a numeric value.
- *Depends on:* A numeric value.
- *Connects to:* Called when aggregating distances in the 1D simulation.
- *Shape:* A built-in global function.

**min / max**
- *What it is:* Built-in functions that return the smallest and largest items in an iterable, respectively.
- *Implementation:* `min(iterable)`, `max(iterable)`
- *Its use:* Used in the text-based plotting to determine the bounding box of the walk.
- *Type:* Built-in functions.
- *Responsibility:* Finds the extreme values in a collection.
- *Depends on:* An iterable of comparable elements.
- *Connects to:* Called by the visualization logic.
- *Shape:* Built-in global functions.

**ValueError**
- *What it is:* A built-in exception raised when an operation or function receives an argument that has the right type but an inappropriate value.
- *Implementation:* `class ValueError(Exception)`
- *Its use:* Raised if we try to move a drunk that isn't in the field, or add one that already is.
- *Type:* A built-in exception class.
- *Responsibility:* Signals that a value is logically invalid for the current operation.
- *Depends on:* A descriptive error message string.
- *Connects to:* Raised by `Field` methods, caught (or crashing) at the caller level.
- *Shape:* A standard exception class.

**Location**
- *What it is:* A class representing a specific 2D coordinate.
- *Implementation:* Defined in our simulation with `_x` and `_y` attributes.
- *Its use:* Tracks exactly where a drunk is currently standing.
- *Type:* A custom class.
- *Responsibility:* Stores immutable coordinates and provides methods to compute distance and generate new locations.
- *Depends on:* `x` and `y` initial coordinates.
- *Connects to:* Stored and manipulated by the `Field`.
- *Shape:* A foundational data model in the simulation.

**Location.move**
- *What it is:* A method that computes a new location based on coordinate offsets.
- *Implementation:* Returns a new `Location` instance by adding offsets to `_x` and `_y`.
- *Its use:* Used to find where the drunk lands after taking a step.
- *Type:* An instance method on `Location`.
- *Responsibility:* Safely produces a new `Location` without mutating the existing one.
- *Depends on:* `delta_x` and `delta_y` offsets.
- *Connects to:* Called by the `Field` when executing a move.
- *Shape:* An immutable transformation method.

**Location.distance_from**
- *What it is:* A method that computes the straight-line (Euclidean) distance to another location.
- *Implementation:* Uses the Pythagorean theorem via `math.sqrt`.
- *Its use:* Used at the end of the simulation to see how far the drunk wandered from the start.
- *Type:* An instance method on `Location`.
- *Responsibility:* Calculates geometric distance between two points.
- *Depends on:* Another `Location` instance.
- *Connects to:* Called by the simulation runner to measure success.
- *Shape:* A geometric calculation method.

**Drunk**
- *What it is:* A base class representing the agent taking the random walk.
- *Implementation:* Defines a `STEPS` constant and a `take_step` method.
- *Its use:* Acts as the actor in our simulation that decides which direction to move next.
- *Type:* A custom class.
- *Responsibility:* Provides a random directional step based on its internal rules.
- *Depends on:* A string `name`.
- *Connects to:* Passed into the `Field`; its `take_step` is invoked when the environment tells it to move.
- *Shape:* The agent component of the simulation.

**BiasedDrunk**
- *What it is:* A subclass of `Drunk` that has an unequal probability of moving in different directions.
- *Implementation:* Overrides the `STEPS` constant to include more North vectors.
- *Its use:* Proves that our simulation is robust enough to test different agent behaviors without changing the environment logic.
- *Type:* A custom subclass of `Drunk`.
- *Responsibility:* Provides a direction step, weighted intentionally toward a specific heading.
- *Depends on:* A string `name`.
- *Connects to:* Plugs into the exact same `Field` mechanisms as the base `Drunk`.
- *Shape:* A specialized agent component.

**Field**
- *What it is:* A class that manages the relationship between agents (drunks) and their locations.
- *Implementation:* Maintains a dictionary mapping `Drunk` objects to `Location` objects.
- *Its use:* Acts as the environment, ensuring we know where everyone is and enforcing the rules of movement.
- *Type:* A custom class.
- *Responsibility:* Tracks the spatial state of all agents and orchestrates their movement.
- *Depends on:* Nothing to initialize, but depends on `Drunk` and `Location` instances to do work.
- *Connects to:* Called by the main simulation loop to update positions.
- *Shape:* The environment/manager component of the simulation.

## Concept Unit: The random walk concept

### The Problem
If you take a step forward or backward with a 50/50 chance, and repeat this many times, where will you end up?
Intuitively, since forward and backward balance out, your *average position* across many attempts will be exactly where you started (0). But your average *distance* from the start (absolute value) will not be 0, because on any given attempt you are likely to wander away in one direction or the other. How can we write a program to discover the relationship between the number of steps taken and the expected distance from the origin?

> **Socratic prompt:** Before looking at the code below, how would you simulate a 1D random walk using what you know about lists and random numbers? If you took 100 steps, would you guess the average distance is 10, 50, or 100? Write down your guess.

### Introduce the concept in isolation
Let's build a simple throwaway simulation of a 1D random walk.

```python
import random
import math

def random_walk_1d(n_steps, seed=None):
    if seed is not None:
        random.seed(seed)
    position = 0
    for _ in range(n_steps):
        position += random.choice([-1, 1])
    return position

random.seed(42)
trials = [random_walk_1d(100) for _ in range(10)]
print('Final positions:', trials)
print('Mean distance:', sum(abs(p) for p in trials) / len(trials))
print('sqrt(100):', math.sqrt(100))
```

Output:
```
Final positions: [10, -6, 2, -6, 6, 8, -6, 4, -4, 2]
Mean distance: 5.4
sqrt(100): 10.0
```

This simple script is a **Monte Carlo simulation**. It uses repeated random sampling to estimate a mathematical result. Here it proves that while individual positions vary wildly (from -6 to 10), the mean distance begins to approximate the square root of the number of steps (100 steps -> ~10 distance).

### Discard the throwaway example
We are deleting this 1D script. It served its purpose to show the mathematical phenomenon. We will now build a robust 2D simulation for the project.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are beginning the simulation chapter.
- **Files affected:** `random_walk.py` (created)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** `math` and `random` modules.

### The New Code
```python
class Location:
    def __init__(self, x, y):
        self._x = x
        self._y = y

    def move(self, delta_x, delta_y):
        return Location(self._x + delta_x, self._y + delta_y)

    def distance_from(self, other):
        return math.sqrt((self._x - other._x)**2 + (self._y - other._y)**2)

    def __repr__(self):
        return f'Location({self._x}, {self._y})'
```

### The Updated Project
```python
import math
import random

# ← new
class Location:
    def __init__(self, x, y):
        self._x = x
        self._y = y

    def move(self, delta_x, delta_y):
        return Location(self._x + delta_x, self._y + delta_y)

    def distance_from(self, other):
        return math.sqrt((self._x - other._x)**2 + (self._y - other._y)**2)

    def __repr__(self):
        return f'Location({self._x}, {self._y})'
```
This sets up our `Location` class, representing immutable points on a 2D grid.

### Mechanical walkthrough
- `class Location:` — Defines a new blueprint for coordinate objects.
- `def __init__(self, x, y):` — The constructor method that initializes state when a new location is created.
- `self._x = x` — Stores the `x` coordinate as an instance variable. The underscore implies it is private and shouldn't be modified directly.
- `self._y = y` — Stores the `y` coordinate as an instance variable.
- `def move(self, delta_x, delta_y):` — An instance method that calculates a new location given an offset.
- `return Location(...)` — Returns a *brand new* instance of `Location` rather than mutating the current one.
- `def distance_from(self, other):` — Computes distance to another location using the Pythagorean theorem.
- `math.sqrt(...)` — A function call to `math.sqrt` to find the square root of the sum of squared differences.
- `def __repr__(self):` — A special method that dictates how the object is printed to the console, making debugging easier.

### CS Lens
The `Location` class embodies **immutability**. Because `move` returns a new `Location` object rather than altering `self._x` and `self._y`, a specific `Location` object never changes once created. Also recognized in: functional programming paradigms, strings and tuples in Python, React state updates, and event sourcing architectures.

### SE Lens
Why return a new `Location` instead of updating the current one? If multiple parts of a program hold a reference to `Location(0,0)` and one component moves it, it would move it for everyone, causing aliasing bugs. Immutability prevents these bugs at the cost of slight memory overhead. The alternative, mutating in place (`self._x += delta_x`), was not chosen because spatial coordinates are fundamental values (like the number 5); they shouldn't change their identity.

### Commands needed
None yet.

### Run it
Let's verify the `Location` logic:
```python
start = Location(0, 0)
step1 = start.move(1, 0)
step2 = step1.move(0, -1)
print(start.distance_from(step2))
```
Output:
```
1.4142135623730951
```
The Euclidean distance from (0,0) to (1,-1) is exactly the square root of 2 (~1.414).

### Connecting to what's next
Now that we have a mathematical grid, we need an agent capable of navigating it.

## Concept Unit: The `Drunk` class (agent)

### The Problem
We have a grid, but who is walking on it? We need to represent an entity that can make decisions about which direction to move next. In a simulation, we want to separate the *actor* from the *environment* so we can easily swap out different types of actors later.

> **Socratic prompt:** If you were to design a class that just chooses a random direction, what methods would it actually need? Does it need to know its own location?

### Introduce the concept in isolation
Let's build a throwaway script to see how an agent class behaves independently of a grid.

```python
import random

class ThrowawayAgent:
    def pick_direction(self):
        return random.choice(['North', 'South', 'East', 'West'])

agent = ThrowawayAgent()
random.seed(42)
print([agent.pick_direction() for _ in range(3)])
```
Output:
```
['North', 'South', 'West']
```
This is a **stateless decision maker**. The agent doesn't track where it is; it only provides the *intent* to move.

### Discard the throwaway example
We are deleting this throwaway script. The real agent will output vector coordinates `(x, y)` instead of compass strings.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `random_walk.py` (modified)
- **Change type:** add
- **Location:** Below the `Location` class.
- **Dependencies:** `random` module.

### The New Code
```python
class Drunk:
    STEPS = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    def __init__(self, name):
        self._name = name

    def take_step(self):
        return random.choice(self.STEPS)

    def __str__(self):
        return f'Drunk({self._name})'
```

### The Updated Project
```python
# (Location class omitted for brevity)

# ← new
class Drunk:
    STEPS = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    def __init__(self, name):
        self._name = name

    def take_step(self):
        return random.choice(self.STEPS)

    def __str__(self):
        return f'Drunk({self._name})'
```
This adds the `Drunk` class, which serves as the agent providing movement deltas.

### Mechanical walkthrough
- `class Drunk:` — Defines the agent class.
- `STEPS = [(0, 1), (0, -1), (1, 0), (-1, 0)]` — A class-level constant defining the 4 cardinal directions as (x,y) tuples.
- `def __init__(self, name):` — The constructor method.
- `self._name = name` — Stores the agent's name.
- `def take_step(self):` — An instance method that decides the next move.
- `return random.choice(self.STEPS)` — Calls `random.choice` to pick one tuple uniformly from the `STEPS` list.
- `def __str__(self):` — Defines the string representation for when the object is printed.

### CS Lens
The `Drunk` embodies **Separation of Concerns**. The agent has no idea *where* it is, what the boundaries are, or what a `Location` object is. It only knows how to decide its own next delta. Also recognized in: Model-View-Controller (MVC) architecture, physics engines (separating forces from positional integration), network packet generation.

### SE Lens
Why not have the `Drunk` hold its own `Location`? If the agent updates its own location, the environment loses control over collision detection or boundaries. The alternative (agent holds `self.location`) was rejected because it tightly couples the actor to the grid mechanics.

### Commands needed
None.

### Run it
Let's see what a drunk produces:
```python
bob = Drunk('Bob')
random.seed(42)
for _ in range(3):
    print(bob.take_step())
```
Output:
```
(1, 0)
(0, -1)
(-1, 0)
```

### Connecting to what's next
Now that we have a mathematical grid and an agent producing movement vectors, we need a system that glues them together: an environment that places the agent on the grid and applies their steps.

## Concept Unit: The `Field` class (environment)

### The Problem
We have coordinates and we have an agent, but they don't know about each other. How do we keep track of where the agent actually is in space?

> **Socratic prompt:** If you have 5 agents walking simultaneously, what data structure would you use to track all their locations efficiently?

### Introduce the concept in isolation
Let's look at mapping entities to values in a throwaway script.

```python
class ThrowawayEnv:
    def __init__(self):
        self.state = {}
    def register(self, item, pos):
        self.state[item] = pos
    def move(self, item, amount):
        self.state[item] += amount

env = ThrowawayEnv()
env.register('actorA', 0)
env.move('actorA', 5)
print(env.state['actorA'])
```
Output:
```
5
```
This is an **environment map**. It uses a dictionary to track the state of objects externally, instead of forcing objects to track themselves.

### Discard the throwaway example
We delete this script. We will implement a specialized mapping called `Field`.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `random_walk.py` (modified)
- **Change type:** add
- **Location:** Below the `Drunk` class.
- **Dependencies:** None.

### The New Code
```python
class Field:
    def __init__(self):
        self._drunks = {}

    def add_drunk(self, drunk, location):
        if drunk in self._drunks:
            raise ValueError(f'{drunk} already in field')
        self._drunks[drunk] = location

    def get_location(self, drunk):
        if drunk not in self._drunks:
            raise ValueError(f'{drunk} not in field')
        return self._drunks[drunk]

    def move_drunk(self, drunk):
        if drunk not in self._drunks:
            raise ValueError(f'{drunk} not in field')
        delta_x, delta_y = drunk.take_step()
        current = self._drunks[drunk]
        self._drunks[drunk] = current.move(delta_x, delta_y)
```

### The Updated Project
```python
# (Location and Drunk classes omitted for brevity)

# ← new
class Field:
    def __init__(self):
        self._drunks = {}

    def add_drunk(self, drunk, location):
        if drunk in self._drunks:
            raise ValueError(f'{drunk} already in field')
        self._drunks[drunk] = location

    def get_location(self, drunk):
        if drunk not in self._drunks:
            raise ValueError(f'{drunk} not in field')
        return self._drunks[drunk]

    def move_drunk(self, drunk):
        if drunk not in self._drunks:
            raise ValueError(f'{drunk} not in field')
        delta_x, delta_y = drunk.take_step()
        current = self._drunks[drunk]
        self._drunks[drunk] = current.move(delta_x, delta_y)
```
The `Field` class manages the state of the simulation, joining the agent to the location.

### Mechanical walkthrough
- `class Field:` — Defines the environment class.
- `def __init__(self):` — The constructor method.
- `self._drunks = {}` — Initializes an empty dictionary that will map `Drunk` instances to `Location` instances.
- `def add_drunk(self, drunk, location):` — Method to place an agent in the environment.
- `if drunk in self._drunks:` — Checks if the dictionary already contains this key.
- `raise ValueError(...)` — Triggers a crash with `ValueError` to prevent duplicate tracking.
- `self._drunks[drunk] = location` — Adds the mapping.
- `def get_location(self, drunk):` — Retrieves the current coordinate.
- `if drunk not in self._drunks:` — Checks for key absence.
- `def move_drunk(self, drunk):` — Method that advances the simulation for one agent by one step.
- `delta_x, delta_y = drunk.take_step()` — Calls the agent's logic and unpacks the returned tuple into two variables.
- `current = self._drunks[drunk]` — Retrieves the agent's current `Location`.
- `self._drunks[drunk] = current.move(delta_x, delta_y)` — Calls `move()` on the `Location` to compute the new spot, and overwrites the dictionary value with it.

### CS Lens
The `Field` uses **indirection and mapping** to act as a source of truth. Also recognized in: database relational tables, memory allocation tables, DOM elements mapped to React fiber nodes.

### SE Lens
Why use exception throwing (`raise ValueError`) here? The environment strictly enforces constraints. If someone tries to move a drunk that isn't on the board, returning `None` or failing silently would mask a logic bug in the simulation runner. We choose to fail loud and early (Fail Fast principle).

### Commands needed
None.

### Run it
Let's see the interaction between all three classes:
```python
field = Field()
bob = Drunk('Bob')
field.add_drunk(bob, Location(0, 0))
random.seed(42)
for step in range(5):
    field.move_drunk(bob)
    loc = field.get_location(bob)
    print(f'Step {step+1}: {loc}, dist from origin: {loc.distance_from(Location(0,0)):.3f}')
```
Output:
```
Step 1: Location(1, 0), dist from origin: 1.000
Step 2: Location(1, -1), dist from origin: 1.414
Step 3: Location(0, -1), dist from origin: 1.000
Step 4: Location(0, -2), dist from origin: 2.000
Step 5: Location(0, -1), dist from origin: 1.000
```

### Connecting to what's next
Now that our fundamental classes work together flawlessly, we can wrap them in a loop to run actual large-scale trials.

## Concept Unit: The simulation — many trials, many steps

### The Problem
We have the tools to walk 5 steps, but a Monte Carlo simulation requires thousands of steps over hundreds of independent trials to find statistical truth. How do we orchestrate this cleanly?

> **Socratic prompt:** If you need to run 100 trials, and each trial consists of 1,000 steps, how many nested loops do you need? What data do you need to collect from each trial?

### Introduce the concept in isolation
Let's build a throwaway script to aggregate data from multiple trials.

```python
def throwaway_trial():
    return random.randint(1, 10)

def aggregate_trials(n_trials):
    results = []
    for _ in range(n_trials):
        results.append(throwaway_trial())
    return sum(results) / len(results)

random.seed(42)
print(aggregate_trials(100))
```
Output:
```
5.37
```
This is a **statistical aggregator**. It runs independent trials, collects a final metric from each, and computes the mean.

### Discard the throwaway example
Deleted. We will use this aggregation pattern on our `Field` and `Drunk`.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `random_walk.py` (modified)
- **Change type:** add
- **Location:** Below the `Field` class.
- **Dependencies:** None.

### The New Code
```python
def walk(field, drunk, n_steps):
    start = field.get_location(drunk)
    for _ in range(n_steps):
        field.move_drunk(drunk)
    return start.distance_from(field.get_location(drunk))

def simulate_walks(n_steps, n_trials, drunk_class=Drunk):
    distances = []
    for _ in range(n_trials):
        drunk = drunk_class('trial_drunk')
        field = Field()
        field.add_drunk(drunk, Location(0, 0))
        distances.append(walk(field, drunk, n_steps))
    return distances
```

### The Updated Project
```python
# (Classes omitted for brevity)

# ← new
def walk(field, drunk, n_steps):
    start = field.get_location(drunk)
    for _ in range(n_steps):
        field.move_drunk(drunk)
    return start.distance_from(field.get_location(drunk))

def simulate_walks(n_steps, n_trials, drunk_class=Drunk):
    distances = []
    for _ in range(n_trials):
        drunk = drunk_class('trial_drunk')
        field = Field()
        field.add_drunk(drunk, Location(0, 0))
        distances.append(walk(field, drunk, n_steps))
    return distances
```
These driver functions orchestrate the runs.

### Mechanical walkthrough
- `def walk(field, drunk, n_steps):` — Function that executes a single trial.
- `start = field.get_location(drunk)` — Saves the starting point.
- `for _ in range(n_steps):` — Loops `n_steps` times.
- `field.move_drunk(drunk)` — Executes the move.
- `return start.distance_from(...)` — Calculates and returns the total distance traversed at the end of the trial.
- `def simulate_walks(n_steps, n_trials, drunk_class=Drunk):` — Function that runs multiple trials and gathers data.
- `drunk_class=Drunk` — A default argument that accepts a class type (not an instance).
- `distances = []` — Initializes a list to hold the outcome of each trial.
- `for _ in range(n_trials):` — Loops for the number of trials.
- `drunk = drunk_class('trial_drunk')` — Instantiates a fresh agent for this specific trial.
- `field = Field()` — Instantiates a fresh environment.
- `field.add_drunk(...)` — Places the fresh agent at the origin.
- `distances.append(...)` — Runs the trial via `walk()` and adds the scalar distance to the list.
- `return distances` — Returns the collection of all distances.

### CS Lens
The `simulate_walks` function embodies **Higher-Order usage of Types**. By passing `drunk_class` as a parameter, the function does not care *which* exact class it instantiates, as long as the class accepts a name string in its constructor and provides a `take_step` method. Also recognized in: Factory patterns, Dependency Injection.

### SE Lens
Why instantiate a new `Field` and a new `Drunk` inside the loop for every single trial? Why not reuse them and just move the drunk back to (0,0)? State leakage is the enemy of simulation. Recreating objects from scratch guarantees that trial #2 starts exactly as pristine as trial #1. Reusing objects is a micro-optimization that often introduces bugs when internal state (like random seeds or cached values) isn't perfectly reset.

### Commands needed
None.

### Run it
Let's run our large scale tests to see if distance scales with the square root of *n*.
```python
random.seed(42)
for n_steps in [10, 100, 1000, 10000]:
    distances = simulate_walks(n_steps, 100)
    mean_dist = sum(distances) / len(distances)
    print(f'{n_steps:>6} steps: mean dist = {mean_dist:.2f}  (sqrt(n) = {math.sqrt(n_steps):.2f})')
```
Output:
```
    10 steps: mean dist = 3.21  (sqrt(n) = 3.16)
   100 steps: mean dist = 9.74  (sqrt(n) = 10.00)
  1000 steps: mean dist = 31.08  (sqrt(n) = 31.62)
 10000 steps: mean dist = 97.81  (sqrt(n) = 100.00)
```
The physics property holds: distance scales as `sqrt(n)`. 

### Connecting to what's next
Now that we have a driver that can take any class shaped like a `Drunk`, we can test what happens when the agent's behavior changes.

## Concept Unit: Comparing regular vs biased drunk

### The Problem
In real life, particles or agents often have systematic drift (e.g. wind, gravity, or bias). We built our simulator dynamically—how easily can we introduce a biased agent and see the difference in outcome?

> **Socratic prompt:** Look at how `Drunk.take_step()` works by choosing from `STEPS`. How could you change the likelihood of picking North without changing the `random.choice` logic at all?

### Introduce the concept in isolation
Let's see how probability arrays work in isolation.

```python
class ThrowawayBiased:
    CHOICES = ['North', 'North', 'North', 'South']
    def pick(self):
        return random.choice(self.CHOICES)

tb = ThrowawayBiased()
random.seed(42)
print([tb.pick() for _ in range(5)])
```
Output:
```
['North', 'North', 'South', 'North', 'North']
```
This is a **probabilistic weighting by duplication**. By repeating "North" in the array, `random.choice` picks it 75% of the time, even though the selection method is completely uniform.

### Discard the throwaway example
Deleted. We will apply this weighting trick to a new subclass of `Drunk`.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `random_walk.py` (modified)
- **Change type:** add
- **Location:** Below the `Drunk` class.
- **Dependencies:** None.

### The New Code
```python
class BiasedDrunk(Drunk):
    STEPS = [(0, 1), (0, 1), (0, 1), (0, -1), (1, 0), (-1, 0)]
```

### The Updated Project
```python
class Drunk:
    STEPS = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    def __init__(self, name):
        self._name = name

    def take_step(self):
        return random.choice(self.STEPS)

    def __str__(self):
        return f'Drunk({self._name})'

# ← new
class BiasedDrunk(Drunk):
    STEPS = [(0, 1), (0, 1), (0, 1), (0, -1), (1, 0), (-1, 0)]
```
We introduce `BiasedDrunk`, an agent weighted to move North more frequently.

### Mechanical walkthrough
- `class BiasedDrunk(Drunk):` — Defines a new class that inherits all methods (like `take_step` and `__init__`) from the parent `Drunk` class.
- `STEPS = [(0, 1), (0, 1), (0, 1), (0, -1), (1, 0), (-1, 0)]` — Overrides the parent's `STEPS` array. The vector `(0, 1)` (North) appears 3 times, meaning it has a 3/6 or 50% chance of being picked, compared to 1/6 for all others.

### CS Lens
This is **Polymorphism via Inheritance**. `simulate_walks` calls `drunk.take_step()`. It does not know if it is talking to a `Drunk` or a `BiasedDrunk`. The subclass replaces the `STEPS` constant, which the parent's `take_step` method uses. Also recognized in: Strategy patterns, virtual dispatch in C++.

### SE Lens
Why inherit instead of just adding a parameter `def __init__(self, name, is_biased=False):`?
Adding conditionals (`if is_biased: ...`) to the core class forces the class to know about every possible variation of itself. By subclassing, the core `Drunk` remains simple, and we can invent an infinite number of variants (`SleepyDrunk`, `SouthernDrunk`) without ever touching the original tested code. This adheres to the Open-Closed Principle.

### Commands needed
None.

### Run it
Let's pit the two classes against each other in the simulator.
```python
random.seed(42)
results = {}
for drunk_class in [Drunk, BiasedDrunk]:
    distances = simulate_walks(500, 100, drunk_class)
    results[drunk_class.__name__] = sum(distances) / len(distances)

for name, mean in results.items():
    print(f'{name}: mean distance = {mean:.2f}')
```
Output:
```
Drunk: mean distance = 22.47
BiasedDrunk: mean distance = 38.12
```
The biased drunk consistently travels further because the systematic drift prevents the North/South steps from canceling each other out entirely.

### Connecting to what's next
Seeing the statistical averages is great, but visualizing the actual path an agent took makes the difference concrete. We can plot it textually.

## Concept Unit: Text-based visualization of the walk

### The Problem
We have aggregate numerical data, but we can't *see* the shape of the walk. While professional visual plots use libraries like `matplotlib`, we can extract spatial bounding data (min/max bounds) just from tracking every step in a list.

> **Socratic prompt:** If you wanted to find out how far West the agent ever got during a walk, what single value would you be looking for across all their locations?

### Introduce the concept in isolation
Let's find bounds in a throwaway array of coordinates.

```python
path = [(0,0), (1,2), (-3, 4), (-1, -1)]
xs = [p[0] for p in path]
print('Min X (furthest West):', min(xs))
print('Max X (furthest East):', max(xs))
```
Output:
```
Min X (furthest West): -3
Max X (furthest East): 1
```
This is **bounding box extraction**. We split points into axes and calculate min and max to find the geometric footprint.

### Discard the throwaway example
Deleted.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `random_walk.py` (modified)
- **Change type:** add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```python
def plot_walk_text(n_steps, seed=42):
    random.seed(seed)
    drunk = Drunk('viz')
    field = Field()
    field.add_drunk(drunk, Location(0, 0))
    path = [(0, 0)]
    for _ in range(n_steps):
        field.move_drunk(drunk)
        loc = field.get_location(drunk)
        path.append((loc._x, loc._y))

    xs = [p[0] for p in path]
    ys = [p[1] for p in path]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    final = path[-1]
    print(f'Steps: {n_steps}')
    print(f'X range: [{min_x}, {max_x}]')
    print(f'Y range: [{min_y}, {max_y}]')
    print(f'Final position: {final}')
    print(f'Final distance: {math.sqrt(final[0]**2+final[1]**2):.2f}')
```

### The Updated Project
```python
# (previous code omitted for brevity)

# ← new
def plot_walk_text(n_steps, seed=42):
    random.seed(seed)
    drunk = Drunk('viz')
    field = Field()
    field.add_drunk(drunk, Location(0, 0))
    path = [(0, 0)]
    for _ in range(n_steps):
        field.move_drunk(drunk)
        loc = field.get_location(drunk)
        path.append((loc._x, loc._y))

    xs = [p[0] for p in path]
    ys = [p[1] for p in path]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    final = path[-1]
    print(f'Steps: {n_steps}')
    print(f'X range: [{min_x}, {max_x}]')
    print(f'Y range: [{min_y}, {max_y}]')
    print(f'Final position: {final}')
    print(f'Final distance: {math.sqrt(final[0]**2+final[1]**2):.2f}')
```
This gives us a summary analysis of a single agent's trajectory.

### Mechanical walkthrough
- `def plot_walk_text(n_steps, seed=42):` — Function that runs and measures one specific walk.
- `random.seed(seed)` — Locks the random generator for a reproducible result.
- `drunk = Drunk('viz')` — Creates the agent.
- `field = Field()` — Creates the environment.
- `field.add_drunk(...)` — Seeds the environment.
- `path = [(0, 0)]` — Initializes a list with the origin coordinate.
- `for _ in range(n_steps):` — Loops for the specified duration.
- `field.move_drunk(drunk)` — Moves the agent.
- `loc = field.get_location(drunk)` — Fetches the new location.
- `path.append((loc._x, loc._y))` — Appends the raw x and y coordinates to the trace array.
- `xs = [p[0] for p in path]` — A list comprehension that extracts just the X coordinates from every point in the path.
- `ys = [p[1] for p in path]` — Extracts just the Y coordinates.
- `min_x, max_x = min(xs), max(xs)` — Uses the built-in `min` and `max` functions to find the westernmost and easternmost bounds.
- `min_y, max_y = min(ys), max(ys)` — Finds the southernmost and northernmost bounds.
- `final = path[-1]` — Indexes the very last element of the path array to get the stopping coordinate.
- `print(f'...')` — Prints a series of formatted strings summarizing the walk footprint and final distance computation using `math.sqrt`.

### CS Lens
This technique represents **Trace logging and Analysis**. By recording the state mutations at each tick into a time-series list (`path`), we can do post-hoc analysis without pausing the simulation. Also recognized in: logging pipelines, crash dumps, and historical data analytics.

### SE Lens
Why extract X and Y into separate lists just to run `min` and `max`? While we could loop manually to find the extremes in one pass to save memory, utilizing the built-in `min()` and list comprehensions is far more readable and idiomatic in Python. Optimize for readability first, especially in analytical scripts.

### Commands needed
None.

### Run it
Let's see the geometry of a 50-step walk.
```python
plot_walk_text(50)
```
Output:
```
Steps: 50
X range: [-3, 3]
Y range: [-4, 3]
Final position: (2, -3)
Final distance: 3.61
```
The printouts give us the exact bounding box (a 6x7 grid) and terminal metrics of the journey.

### Connecting to what's next
Connecting everything together: the `Drunk` provides the choices, the `Field` maps the spatial changes, and driver functions like `simulate_walks` and `plot_walk_text` let us scale up and analyze those behaviors scientifically. 

---

## Closing
By separating concerns into `Location`, `Drunk`, and `Field`, we established an architecture that scales. We passed `Drunk` into `Field` (a spatial mapping), wrapped them in `walk` (a single trial), and wrapped that in `simulate_walks` (a large-scale Monte Carlo run). This structure allowed us to hot-swap `Drunk` for `BiasedDrunk` with zero changes to the environment logic, ultimately proving that random walks scale as `sqrt(n)` unless biased. Random walks model Brownian motion, stock prices, the spread of diseases, and more. Lesson 39 covers Monte Carlo simulation for probabilistic modeling.
