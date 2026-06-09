# Building a Physics Engine — Series 1: Vectors and Motion

## From Zero to a Particle Moving on Screen

> **What this series is:** A code-along that builds a 2D physics simulation from nothing. Every piece of mathematics is introduced *because the simulation needs it* — not as an abstract exercise. By the end of this series a particle will move across a screen under gravity, bouncing off walls, with velocity and acceleration working correctly.
>
> **What you need:** Python 3.10+, pygame (`pip install pygame`), and a code editor. No maths background assumed. We start from what a number is.
>
> **How to read this:** Read the explanation. Then type the code — don't copy-paste. Then run it. Then break it on purpose. The understanding comes from the doing.

---

# Episode 1 — What Is a Number, Really?

## Why we start here

You might think this is too basic. It is not. Most people who struggle with physics and engineering maths struggle because they never had a solid mental model of what numbers *represent*. We are going to build that model in five minutes, and then use it for the rest of the series.

## Numbers as positions on a line

A number is a position. When we write `5`, we mean "the point that is 5 steps to the right of zero on an infinite line." When we write `-3`, we mean "3 steps to the left."

```python
# episode1_numbers.py
# Numbers as positions. Run this and read the output carefully.

# A number line goes from negative infinity to positive infinity.
# Zero is the reference point — the origin.
# Every number is a distance and direction from zero.

position_a = 5    # 5 steps right of zero
position_b = -3   # 3 steps left of zero
position_c = 0    # at the origin

# Addition means "move further in the same direction"
print(position_a + 2)    # 7 — move 2 more steps right

# Subtraction means "move in the opposite direction"
print(position_a - 8)    # -3 — move 8 steps left, end up left of zero

# The distance between two positions is always positive.
# We call this the absolute value.
distance = abs(position_a - position_b)
print(f"Distance from {position_b} to {position_a}: {distance}")   # 8

# Multiplication scales the distance from zero.
print(position_a * 2)    # 10 — twice as far from zero
print(position_a * -1)   # -5 — same distance, opposite direction
print(position_a * 0)    #  0 — collapse to the origin
```

## Extending to two dimensions

One number describes a position on a line. Two numbers describe a position on a **plane** — a flat surface. Three numbers describe a position in **space**.

```python
# episode1_dimensions.py
# Extending from one number to two.

# A position on a flat screen needs two numbers:
# How far right (x) and how far down (y).
# On screens, y increases downward — opposite to maths convention.
# We will deal with this discrepancy when we build the renderer.

x = 300   # 300 pixels from the left edge
y = 200   # 200 pixels from the top edge

# This pair (x, y) is called a COORDINATE.
# It describes exactly one point on the plane.
# No other point has both x=300 AND y=200.

# Moving right: increase x
new_x = x + 50   # 350 — moved 50 pixels right

# Moving down: increase y (remember, y is flipped on screens)
new_y = y + 30   # 230 — moved 30 pixels down

print(f"Started at ({x}, {y})")
print(f"Ended at ({new_x}, {new_y})")

# The distance between two points uses the Pythagorean theorem.
# If you move 50 right and 30 down, how far did you actually travel?
# We will derive this from scratch in Episode 2.
import math
dx       = new_x - x          # horizontal distance: 50
dy       = new_y - y          # vertical distance: 30
distance = math.sqrt(dx**2 + dy**2)   # the actual straight-line distance
print(f"Straight-line distance: {distance:.2f}")   # 58.31
```

## What the Pythagorean theorem actually says

This is worth pausing on because it shows up everywhere in physics and graphics.

```python
# episode1_pythagoras.py
# The Pythagorean theorem — where it comes from and what it means.

# If you travel 3 steps right and 4 steps up,
# how far are you from where you started?
#
# Draw it on paper: you have a right triangle.
# The two sides you travelled are 3 and 4.
# The straight line from start to end is the hypotenuse.
#
# The theorem says: hypotenuse² = side_a² + side_b²
# Which means:       hypotenuse  = sqrt(side_a² + side_b²)

import math

side_a     = 3
side_b     = 4
hypotenuse = math.sqrt(side_a**2 + side_b**2)
print(f"Hypotenuse: {hypotenuse}")   # 5.0 — the famous 3-4-5 triangle

# This works for ANY two sides, not just 3 and 4.
# And it works in ANY direction, not just horizontal and vertical.
# As long as the angle between the two sides is 90 degrees.

# This is how we calculate the distance between any two points.
def distance_between(x1, y1, x2, y2):
    dx = x2 - x1
    dy = y2 - y1
    return math.sqrt(dx**2 + dy**2)

print(distance_between(0, 0, 3, 4))     # 5.0
print(distance_between(1, 1, 4, 5))     # 5.0 — same triangle, different position
print(distance_between(0, 0, 1, 0))     # 1.0 — one step right
print(distance_between(0, 0, 0, 1))     # 1.0 — one step up
```

## What we learned

A number is a position on a line. Two numbers are a position on a plane. Distance between two points uses the Pythagorean theorem. These three ideas are the foundation of everything in this series.

---

# Episode 2 — Vectors: Numbers That Have Direction

## The problem with plain numbers for physics

Imagine a ball moving on a screen. It has a position — two numbers, x and y. It also has a velocity — how fast it is moving, and in what direction.

Velocity is not just a number. If I say "the ball is moving at 5 pixels per second", that tells you the speed but not the direction. It could be moving right, left, diagonally — you don't know. Physics needs both magnitude (size) and direction. That is what a **vector** is.

## What a vector is

A vector is an arrow. It has:
- A **magnitude** (length) — how much
- A **direction** — which way

In 2D, we represent a vector with two components: how much in the x direction and how much in the y direction.

```
Vector (3, 4) means: 3 units right AND 4 units up, simultaneously.
```

The magnitude of this vector is 5 (from the Pythagorean theorem). The direction is "northeast" at a specific angle.

```python
# episode2_vector_basics.py
# Understanding vectors before we implement them.

import math

# A vector is just two numbers, but together they mean something different
# than two separate numbers.

# As separate numbers, 3 and 4 might mean:
#   x position = 3, y position = 4 (a point)

# As a vector, (3, 4) means:
#   "move 3 in x AND 4 in y" (a displacement, a velocity, a force)

# The difference is context and interpretation.
# In our engine, we will use the same Vector class for:
#   - positions (where something is)
#   - velocities (how fast something is moving and in what direction)
#   - accelerations (how velocity is changing)
#   - forces (a push or pull in a direction)

# They are all the same mathematical object. That is elegant.

# ---- Vector addition ----
# Adding two vectors means combining their effects.
# If you walk 3 right and 2 up, then walk 1 right and 5 up,
# where do you end up?

displacement_1 = (3, 2)
displacement_2 = (1, 5)
total          = (displacement_1[0] + displacement_2[0],
                  displacement_1[1] + displacement_2[1])
print(f"Total displacement: {total}")   # (4, 7)

# ---- Vector scaling ----
# Multiplying a vector by a number scales its magnitude.
# Direction stays the same (or reverses if the number is negative).

velocity  = (3, 4)
time      = 2.0
# After 2 seconds, where have we moved?
movement  = (velocity[0] * time, velocity[1] * time)
print(f"Movement after {time}s: {movement}")   # (6.0, 8.0)

# ---- Vector magnitude ----
# The length of the vector arrow.
v         = (3, 4)
magnitude = math.sqrt(v[0]**2 + v[1]**2)
print(f"Magnitude of {v}: {magnitude}")   # 5.0

# ---- Unit vectors ----
# A vector with magnitude exactly 1.
# It represents ONLY direction, no magnitude.
# You make one by dividing each component by the magnitude.
unit = (v[0] / magnitude, v[1] / magnitude)
print(f"Unit vector: ({unit[0]:.3f}, {unit[1]:.3f})")
print(f"Its magnitude: {math.sqrt(unit[0]**2 + unit[1]**2):.3f}")   # 1.000
# Unit vectors are useful when you want to say "in THIS direction"
# without specifying how far.
```

## Building the Vector class

Using tuples works but is clumsy — `v[0]` and `v[1]` are not readable. We build a proper Vector class that supports all the operations we need, with readable syntax.

This is also our first piece of domain modeling — we are giving mathematical objects a home in code.

```python
# vector.py
# The Vector class. The most important class in the engine.
# Everything that moves, pushes, or pulls uses this.

from __future__ import annotations
import math


class Vector2D:
    """
    A two-dimensional vector.

    Represents any quantity that has both magnitude and direction:
    position, velocity, acceleration, force.

    We implement all the standard mathematical operations so that
    working with vectors in code feels like working with them on paper.
    """

    def __init__(self, x: float, y: float):
        self.x = float(x)
        self.y = float(y)

    # ---- Arithmetic operations ----
    # Python calls these when you use +, -, *, / on Vector objects.
    # The double-underscore names are called "dunder methods" or
    # "magic methods" — they hook into Python's operator syntax.

    def __add__(self, other: Vector2D) -> Vector2D:
        """v1 + v2 — add corresponding components."""
        return Vector2D(self.x + other.x, self.y + other.y)

    def __sub__(self, other: Vector2D) -> Vector2D:
        """v1 - v2 — subtract corresponding components."""
        return Vector2D(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> Vector2D:
        """v * scalar — scale both components."""
        return Vector2D(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> Vector2D:
        """scalar * v — same as v * scalar (multiplication is commutative)."""
        return self.__mul__(scalar)

    def __truediv__(self, scalar: float) -> Vector2D:
        """v / scalar — divide both components."""
        if scalar == 0:
            raise ValueError("Cannot divide a vector by zero.")
        return Vector2D(self.x / scalar, self.y / scalar)

    def __neg__(self) -> Vector2D:
        """-v — reverse direction."""
        return Vector2D(-self.x, -self.y)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector2D):
            return False
        return math.isclose(self.x, other.x) and math.isclose(self.y, other.y)

    # ---- Vector mathematics ----

    @property
    def magnitude(self) -> float:
        """
        The length of the vector.
        From the Pythagorean theorem: sqrt(x² + y²)
        Also called the norm or length.
        """
        return math.sqrt(self.x**2 + self.y**2)

    @property
    def magnitude_squared(self) -> float:
        """
        x² + y²  — the magnitude without the square root.
        Useful when you only need to compare magnitudes,
        because sqrt is expensive and comparing squares gives
        the same ordering. A small but important optimisation.
        """
        return self.x**2 + self.y**2

    @property
    def normalized(self) -> Vector2D:
        """
        A unit vector in the same direction.
        Magnitude = 1, direction unchanged.
        Useful for: "I want to move in THIS direction, by a specific amount."
        """
        mag = self.magnitude
        if mag == 0:
            return Vector2D(0, 0)
        return Vector2D(self.x / mag, self.y / mag)

    def dot(self, other: Vector2D) -> float:
        """
        The dot product: self.x * other.x + self.y * other.y

        What it means geometrically:
        - Positive: vectors point in roughly the same direction
        - Zero: vectors are perpendicular (90 degrees apart)
        - Negative: vectors point in roughly opposite directions

        Also equals: |a| * |b| * cos(angle_between_them)
        We will use this for collision response and lighting.
        """
        return self.x * other.x + self.y * other.y

    def distance_to(self, other: Vector2D) -> float:
        """Straight-line distance from this point to another."""
        return (other - self).magnitude

    def angle(self) -> float:
        """
        The angle this vector makes with the positive x-axis, in radians.
        math.atan2 handles all quadrants correctly.
        We will explain radians fully when we need them (Episode 5).
        """
        return math.atan2(self.y, self.x)

    # ---- Convenience ----

    @classmethod
    def zero(cls) -> Vector2D:
        """The zero vector — no magnitude, no direction."""
        return cls(0, 0)

    @classmethod
    def from_angle(cls, angle: float, magnitude: float = 1.0) -> Vector2D:
        """
        Create a vector from an angle (radians) and magnitude.
        x = magnitude * cos(angle)
        y = magnitude * sin(angle)
        We will explain where this formula comes from in Episode 5.
        """
        return cls(magnitude * math.cos(angle), magnitude * math.sin(angle))

    def __repr__(self) -> str:
        return f"Vector2D({self.x:.3f}, {self.y:.3f})"

    def __str__(self) -> str:
        return f"({self.x:.2f}, {self.y:.2f})"
```

## Testing the Vector class thoroughly

Before we use the Vector class in a simulation, we verify that every operation is correct. This is a habit that separates engineers from code monkeys — you do not assume your mathematical primitives are correct, you prove it.

```python
# test_vector.py
# Verify every Vector2D operation.
# Run this whenever you change vector.py.

import math
from vector import Vector2D

def test_addition():
    v1 = Vector2D(3, 4)
    v2 = Vector2D(1, 2)
    result = v1 + v2
    assert result == Vector2D(4, 6), f"Expected (4, 6), got {result}"
    print("✓ Addition")

def test_subtraction():
    v1 = Vector2D(5, 3)
    v2 = Vector2D(2, 1)
    result = v1 - v2
    assert result == Vector2D(3, 2)
    print("✓ Subtraction")

def test_scalar_multiplication():
    v      = Vector2D(3, 4)
    result = v * 2
    assert result == Vector2D(6, 8)
    result2 = 3 * v   # Tests __rmul__
    assert result2 == Vector2D(9, 12)
    print("✓ Scalar multiplication")

def test_magnitude():
    # The 3-4-5 triangle: magnitude of (3,4) is 5
    v = Vector2D(3, 4)
    assert math.isclose(v.magnitude, 5.0), f"Expected 5.0, got {v.magnitude}"
    # Zero vector has magnitude 0
    assert Vector2D(0, 0).magnitude == 0
    print("✓ Magnitude")

def test_normalized():
    v    = Vector2D(3, 4)
    unit = v.normalized
    # A unit vector has magnitude 1
    assert math.isclose(unit.magnitude, 1.0), f"Expected 1.0, got {unit.magnitude}"
    # It points in the same direction — components scaled proportionally
    assert math.isclose(unit.x, 0.6)
    assert math.isclose(unit.y, 0.8)
    print("✓ Normalized")

def test_dot_product():
    # Perpendicular vectors have dot product 0
    right = Vector2D(1, 0)
    up    = Vector2D(0, 1)
    assert math.isclose(right.dot(up), 0.0)

    # Parallel vectors have dot product = product of magnitudes
    v1 = Vector2D(3, 0)
    v2 = Vector2D(5, 0)
    assert math.isclose(v1.dot(v2), 15.0)

    # Opposite vectors have negative dot product
    v3 = Vector2D(1, 0)
    v4 = Vector2D(-1, 0)
    assert v3.dot(v4) < 0
    print("✓ Dot product")

def test_distance():
    origin = Vector2D(0, 0)
    point  = Vector2D(3, 4)
    assert math.isclose(origin.distance_to(point), 5.0)
    print("✓ Distance")

def test_negation():
    v      = Vector2D(3, -4)
    result = -v
    assert result == Vector2D(-3, 4)
    print("✓ Negation")

test_addition()
test_subtraction()
test_scalar_multiplication()
test_magnitude()
test_normalized()
test_dot_product()
test_distance()
test_negation()
print("\nAll vector tests passed.")
```

## What we learned

A vector is a mathematical object with magnitude and direction. In code, it is a class with x and y components and operations that mirror the maths. We build it from scratch because understanding *what* each operation does is more valuable than knowing that numpy does it for you.

The dot product deserves special attention — it measures alignment between two vectors. We will use it constantly for collision response and force projection.

---

# Episode 3 — Position, Velocity, and Acceleration

## The three quantities of motion

Every moving object in a physics simulation has three quantities:

**Position** — where it is. A vector.

**Velocity** — how fast it is moving and in what direction. A vector. The rate of change of position.

**Acceleration** — how fast the velocity is changing, and in what direction. A vector. The rate of change of velocity.

The relationship between them is the key insight of Newtonian mechanics:

```
acceleration  changes  velocity
velocity      changes  position
```

More precisely: acceleration is the *derivative* of velocity, and velocity is the *derivative* of position. We are going to implement this relationship, and in doing so we will understand what a derivative actually is.

## What a derivative is

Forget the calculus notation for a moment. A derivative answers one question:

**"How fast is this thing changing?"**

If your position changes from 10 to 15 in 1 second, your velocity (the derivative of position) is 5 units per second.

If your velocity changes from 5 to 8 in 1 second, your acceleration (the derivative of velocity) is 3 units per second per second.

```python
# episode3_derivatives.py
# Understanding derivatives by computing them manually.

# Imagine a ball's x position recorded every second:
positions = [0, 5, 10, 15, 20, 20, 15, 10]
#            t=0 t=1 t=2 t=3  t=4  t=5  t=6  t=7

# Velocity at each moment is how much position changed per second.
# velocity[i] = (position[i+1] - position[i]) / time_step
time_step = 1.0

velocities = []
for i in range(len(positions) - 1):
    change_in_position = positions[i+1] - positions[i]
    velocity           = change_in_position / time_step
    velocities.append(velocity)

print("Positions:  ", positions)
print("Velocities: ", velocities)
# Velocities:  [5.0, 5.0, 5.0, 5.0, 0.0, -5.0, -5.0]
# The ball moves right at 5, stops, then moves left at 5.

# Acceleration is how much velocity changed per second.
accelerations = []
for i in range(len(velocities) - 1):
    change_in_velocity = velocities[i+1] - velocities[i]
    acceleration       = change_in_velocity / time_step
    accelerations.append(acceleration)

print("Accelerations:", accelerations)
# [0.0, 0.0, 0.0, -5.0, -5.0, 0.0]
# Zero while moving at constant speed, negative when slowing down.

# This is exactly what calculus formalises.
# The derivative is the limit of (change / time_step) as time_step → 0.
# We approximate it with small time steps — this is numerical calculus.
```

## Integration — going the other direction

In a simulation, we usually have accelerations (from forces) and need to find positions. We go *backwards*: acceleration → velocity → position. This is called **numerical integration**.

```python
# episode3_integration.py
# Integration: given acceleration, find velocity and position.
# This is the core algorithm of every physics engine.

# We know the initial conditions:
position     = 0.0    # starts at x=0
velocity     = 0.0    # starts still
acceleration = 10.0   # constant push (like gravity)

time_step = 0.1       # simulate in small steps of 0.1 seconds
time      = 0.0

print(f"{'Time':>6} | {'Position':>10} | {'Velocity':>10}")
print("-" * 35)

for step in range(20):
    print(f"{time:6.1f} | {position:10.3f} | {velocity:10.3f}")

    # EULER INTEGRATION — the simplest possible integration method.
    # Update velocity: v_new = v_old + a * dt
    # Update position: x_new = x_old + v_new * dt
    # (where dt is the time step)
    velocity += acceleration * time_step
    position += velocity     * time_step
    time     += time_step

# This is called Euler's method. It is simple and mostly works.
# Later we will see where it fails and why, and build something better.

# The exact answer for constant acceleration from rest is:
# position = 0.5 * acceleration * time²
# Let's check:
exact_position = 0.5 * acceleration * (step * time_step)**2
print(f"\nSimulated final position: {position:.3f}")
print(f"Exact final position:     {exact_position:.3f}")
print(f"Error: {abs(position - exact_position):.3f}")
# There is a small error. Euler's method accumulates error over time.
# We will fix this in Episode 6.
```

## The Particle class

Now we build a Particle — an object that has position, velocity, and acceleration, and knows how to update itself through time.

```python
# particle.py
# A particle — the fundamental object of our simulation.

from __future__ import annotations
from dataclasses import dataclass, field
from vector import Vector2D


@dataclass
class Particle:
    """
    A point mass in 2D space.

    A particle has:
    - position:     where it is (Vector2D)
    - velocity:     how fast and in what direction it is moving (Vector2D)
    - acceleration: how its velocity is changing (Vector2D)
    - mass:         how much it resists changes to its velocity (float)

    The mass is important. Newton's second law says:
        Force = mass × acceleration
    Or equivalently:
        acceleration = Force / mass

    A heavy object requires more force to accelerate than a light one.
    A particle with mass = 0 would have infinite acceleration from any force.
    We do not allow zero mass.
    """

    position:     Vector2D
    velocity:     Vector2D = field(default_factory=Vector2D.zero)
    acceleration: Vector2D = field(default_factory=Vector2D.zero)
    mass:         float    = 1.0

    # We accumulate forces here each frame, then apply them all at once.
    # This is the Force Accumulator pattern — more on this in Series 2.
    _force_accumulator: Vector2D = field(
        default_factory=Vector2D.zero, repr=False
    )

    def __post_init__(self):
        if self.mass <= 0:
            raise ValueError(f"Mass must be positive, got {self.mass}")

    def apply_force(self, force: Vector2D) -> None:
        """
        Add a force to the accumulator.
        Forces are accumulated and applied together at the end of each frame.
        This lets multiple forces act on the same particle without
        order-of-application mattering.
        """
        self._force_accumulator = self._force_accumulator + force

    def integrate(self, dt: float) -> None:
        """
        Advance the particle forward by dt seconds.
        This is Euler integration — simple and clear.

        Steps:
        1. Compute acceleration from accumulated forces (F = ma → a = F/m)
        2. Update velocity: v += a * dt
        3. Update position: x += v * dt
        4. Clear the force accumulator for the next frame

        This is the mathematical heart of the simulation.
        """
        # Newton's second law: a = F / m
        # If multiple forces act, we use the total force (already accumulated).
        if self._force_accumulator.magnitude > 0:
            self.acceleration = self._force_accumulator / self.mass

        # Euler integration
        self.velocity = self.velocity + self.acceleration * dt
        self.position = self.position + self.velocity     * dt

        # Clear forces — they must be re-applied each frame
        self._force_accumulator = Vector2D.zero()

    @property
    def kinetic_energy(self) -> float:
        """
        KE = ½mv²
        Kinetic energy depends on mass and the square of speed.
        We will use this to verify energy conservation later.
        """
        return 0.5 * self.mass * self.velocity.magnitude_squared

    @property
    def momentum(self) -> Vector2D:
        """
        p = mv
        Momentum is mass times velocity. It is a vector.
        In a closed system, total momentum is conserved.
        We will verify this when we implement collisions.
        """
        return self.velocity * self.mass

    def __str__(self) -> str:
        return (
            f"Particle(pos={self.position}, "
            f"vel={self.velocity}, "
            f"mass={self.mass:.1f})"
        )
```

## Watching a particle move — without a screen

Before we add pygame, let's verify the simulation in pure Python. This is important — always verify your physics before adding rendering.

```python
# episode3_simulation.py
# Verify particle motion before rendering.

from vector import Vector2D
from particle import Particle

# Create a particle at the origin, moving right
p = Particle(
    position = Vector2D(0, 0),
    velocity = Vector2D(10, 0),   # 10 units per second rightward
    mass     = 1.0,
)

print(f"{'Time':>5} | {'Position':>20} | {'Velocity':>20}")
print("-" * 55)

dt = 0.1   # time step

for i in range(10):
    print(f"{i*dt:5.1f} | {str(p.position):>20} | {str(p.velocity):>20}")
    p.integrate(dt)

# With no forces and constant velocity, position should increase
# by velocity * dt each step: 10 * 0.1 = 1.0 per step.
print(f"\nFinal position: {p.position}")
# Expected: approximately (10, 0) after 1 second

# Now with gravity
p2 = Particle(
    position = Vector2D(0, 0),
    velocity = Vector2D(10, 0),
    mass     = 1.0,
)

GRAVITY = Vector2D(0, -9.8)   # 9.8 m/s² downward (negative y = up in maths convention)

print(f"\n--- With gravity ---")
print(f"{'Time':>5} | {'Position':>25}")
print("-" * 35)

for i in range(15):
    print(f"{i*dt:5.1f} | {p2.position}")
    p2.apply_force(GRAVITY * p2.mass)   # F = ma, so gravity force = mass * g
    p2.integrate(dt)

# This should trace a parabolic arc — classic projectile motion.
```

## What we learned

Position, velocity, and acceleration are vectors. Velocity is the rate of change of position. Acceleration is the rate of change of velocity. Integration means: given acceleration, find velocity and position by accumulating changes over small time steps. This is Euler's method — simple, slightly imprecise, but the foundation for everything.

Newton's second law `F = ma` is one equation. In our engine it lives in the `integrate()` method as `acceleration = force / mass`. Everything else in physics simulation is built on this.

---

# Episode 4 — The First Renderer

## What we are building

A window that shows a particle moving. This is the first visual result of all the mathematics we have built. It will look simple but every pixel is justified by the physics.

## What pygame is

pygame is a Python library for creating windows and drawing to them. It gives us:
- A window with a pixel buffer
- A clock for controlling frame rate
- An event system for keyboard and mouse input

It is not a game engine — it does not do physics, it does not manage objects. It just draws pixels. We provide the physics.

## The coordinate system problem

Mathematics convention: y increases upward. Screen convention: y increases downward.

```
Maths:           Screen:
    y                (0,0)──── x
    │                │
    │                │
    └──── x          y
```

When we render our simulation, we need to flip the y axis. A particle at mathematical position (100, 200) should appear at screen position (100, screen_height - 200).

We will handle this in the renderer so the simulation never has to think about it.

```python
# renderer.py
# Renders the simulation to a pygame window.
# All screen-coordinate conversion lives here.

import pygame
from vector import Vector2D
from particle import Particle
from typing import List, Tuple


# Colours as RGB tuples
BLACK      = (10,  10,  10)
WHITE      = (240, 240, 240)
BLUE       = (70,  130, 220)
RED        = (220, 70,  70)
GREEN      = (70,  200, 100)
YELLOW     = (240, 210, 60)
GREY       = (100, 100, 100)
LIGHT_GREY = (60,  60,  60)


class Renderer:
    """
    Draws the simulation to a pygame window.

    Responsibilities:
    - Manage the pygame window
    - Convert simulation coordinates to screen coordinates
    - Draw particles, trails, and debug information
    - Control frame rate

    The simulation knows nothing about the screen.
    The renderer knows nothing about physics.
    This separation is deliberate.
    """

    def __init__(
        self,
        width:  int   = 800,
        height: int   = 600,
        title:  str   = "Physics Engine",
        fps:    int   = 60,
        scale:  float = 1.0,
    ):
        pygame.init()
        self.width  = width
        self.height = height
        self.fps    = fps
        self.scale  = scale    # pixels per simulation unit

        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption(title)

        self.clock  = pygame.time.Clock()
        self.font   = pygame.font.SysFont("monospace", 14)
        self.running = True

    def sim_to_screen(self, position: Vector2D) -> Tuple[int, int]:
        """
        Convert a simulation position to screen pixel coordinates.

        Simulation space: origin at centre, y increases upward.
        Screen space:     origin at top-left, y increases downward.

        The transformation:
        screen_x = width/2  + sim_x * scale
        screen_y = height/2 - sim_y * scale   ← note the minus (y flip)
        """
        screen_x = int(self.width  / 2 + position.x * self.scale)
        screen_y = int(self.height / 2 - position.y * self.scale)
        return (screen_x, screen_y)

    def screen_to_sim(self, screen_x: int, screen_y: int) -> Vector2D:
        """
        Convert screen pixel coordinates back to simulation space.
        The inverse of sim_to_screen.
        Useful for mouse input.
        """
        sim_x = (screen_x - self.width  / 2) / self.scale
        sim_y = (self.height / 2 - screen_y) / self.scale
        return Vector2D(sim_x, sim_y)

    def clear(self) -> None:
        """Fill the screen with the background colour."""
        self.screen.fill(BLACK)

    def draw_particle(
        self,
        particle: Particle,
        colour:   Tuple[int, int, int] = BLUE,
        radius:   int                  = 8,
    ) -> None:
        """Draw a particle as a filled circle."""
        pos = self.sim_to_screen(particle.position)
        # Only draw if on screen
        if 0 <= pos[0] <= self.width and 0 <= pos[1] <= self.height:
            pygame.draw.circle(self.screen, colour, pos, radius)
            # Draw a highlight to make it look more like a sphere
            highlight = (pos[0] - radius//3, pos[1] - radius//3)
            pygame.draw.circle(self.screen, WHITE, highlight, radius//4)

    def draw_velocity_arrow(self, particle: Particle) -> None:
        """Draw an arrow showing the particle's velocity direction."""
        if particle.velocity.magnitude < 0.1:
            return
        start = self.sim_to_screen(particle.position)
        # Scale the arrow so it is visible but not overwhelming
        arrow_scale = 5.0
        tip   = self.sim_to_screen(
            particle.position + particle.velocity * arrow_scale / self.scale
        )
        pygame.draw.line(self.screen, YELLOW, start, tip, 2)

    def draw_grid(self, spacing: int = 50) -> None:
        """Draw a reference grid to show simulation coordinates."""
        for x in range(0, self.width, spacing):
            pygame.draw.line(self.screen, LIGHT_GREY, (x, 0), (x, self.height), 1)
        for y in range(0, self.height, spacing):
            pygame.draw.line(self.screen, LIGHT_GREY, (0, y), (self.width, y), 1)
        # Draw the axes in a slightly brighter colour
        mid_x = self.width  // 2
        mid_y = self.height // 2
        pygame.draw.line(self.screen, GREY, (mid_x, 0), (mid_x, self.height), 1)
        pygame.draw.line(self.screen, GREY, (0, mid_y), (self.width,   mid_y), 1)

    def draw_text(self, text: str, x: int, y: int,
                  colour: Tuple[int, int, int] = WHITE) -> None:
        """Draw text at screen coordinates (x, y)."""
        surface = self.font.render(text, True, colour)
        self.screen.blit(surface, (x, y))

    def draw_debug_info(self, particle: Particle, label: str = "") -> None:
        """Draw position, velocity, and energy information."""
        lines = [
            f"{label}",
            f"pos:  {particle.position}",
            f"vel:  {particle.velocity}",
            f"spd:  {particle.velocity.magnitude:.2f}",
            f"KE:   {particle.kinetic_energy:.2f}",
        ]
        for i, line in enumerate(lines):
            self.draw_text(line, 10, 10 + i * 18)

    def process_events(self) -> bool:
        """
        Handle pygame events. Returns False if the window was closed.
        Call this once per frame.
        """
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
        return self.running

    def present(self) -> float:
        """
        Show the frame and wait for the next one.
        Returns the actual time elapsed in seconds (dt).
        The clock.tick() call limits the frame rate to self.fps.
        """
        pygame.display.flip()
        ms = self.clock.tick(self.fps)
        return ms / 1000.0   # convert milliseconds to seconds

    def quit(self) -> None:
        pygame.quit()
```

## The simulation loop

The simulation loop is the heartbeat of the engine. It runs once per frame — typically 60 times per second. Each iteration:

1. Process events (keyboard, mouse, close button)
2. Apply forces
3. Integrate (advance physics by dt seconds)
4. Render

```python
# episode4_first_simulation.py
# The first visual simulation.
# A particle launched at an angle, falling under gravity.

from vector import Vector2D
from particle import Particle
from renderer import Renderer

# ---- Setup ----
renderer = Renderer(width=800, height=600, title="Episode 4 — Projectile", scale=2.0)

# Launch a particle from the bottom-left at an angle
particle = Particle(
    position = Vector2D(-150, -150),
    velocity = Vector2D(60, 120),    # rightward and upward
    mass     = 1.0,
)

# Gravity constant — 9.8 m/s² downward
GRAVITY = Vector2D(0, -98)   # scaled up so motion is visible at our scale

# Trail of past positions for visualisation
trail = []
MAX_TRAIL = 80

# ---- The simulation loop ----
while renderer.process_events():
    # --- Physics ---
    particle.apply_force(GRAVITY * particle.mass)
    particle.integrate(1/60)

    # Store position for trail
    trail.append(Vector2D(particle.position.x, particle.position.y))
    if len(trail) > MAX_TRAIL:
        trail.pop(0)

    # Bounce off the bottom and sides
    if particle.position.y < -180:
        particle.position.y  = -180
        particle.velocity.y  = abs(particle.velocity.y) * 0.8   # lose 20% energy
    if particle.position.x < -200 or particle.position.x > 200:
        particle.velocity.x *= -1

    # --- Render ---
    renderer.clear()
    renderer.draw_grid()

    # Draw the trail — older positions are dimmer
    for i, pos in enumerate(trail):
        alpha  = int(255 * i / len(trail))
        colour = (int(70 * i/len(trail)), int(130 * i/len(trail)), 220)
        screen_pos = renderer.sim_to_screen(pos)
        if 0 <= screen_pos[0] <= renderer.width and 0 <= screen_pos[1] <= renderer.height:
            pygame.draw.circle(renderer.screen, colour, screen_pos, 3)

    renderer.draw_particle(particle)
    renderer.draw_velocity_arrow(particle)
    renderer.draw_debug_info(particle, "Projectile")

    # Show frame
    renderer.present()

import pygame
renderer.quit()
```

## What you should see

A glowing blue particle launched on a parabolic arc, leaving a fading trail. It bounces off the bottom wall and sides, losing a small amount of energy each bounce. The yellow arrow shows its current velocity direction. The debug info shows position, velocity, speed, and kinetic energy updating in real time.

This is projectile motion — the same arc a thrown ball makes. The parabola is not hardcoded. It emerges from applying a constant downward force (gravity) to a particle with an initial velocity. That is physics working correctly.

## What we learned

The renderer converts between simulation space and screen space. The simulation loop runs at 60 frames per second — physics, then render. Projectile motion emerges from two things: an initial velocity vector and a constant gravity force. No special parabola formula. Just `F = ma` applied repeatedly.

---

# Episode 5 — Trigonometry: The Language of Angles

## Why we need trigonometry

So far our forces have been straight up, down, left, right. Real physics has forces at arbitrary angles — a spring pulling at 37 degrees, gravity on a slope, a collision at an oblique angle. To handle angles we need trigonometry.

## What sine and cosine actually are

Forget SOH-CAH-TOA for a moment. Here is the real explanation.

Imagine a circle with radius 1 centred at the origin. A point travels around this circle. At any moment, the point's x coordinate is the **cosine** of the angle, and the y coordinate is the **sine** of the angle.

```python
# episode5_trig_intro.py
# What sine and cosine are, built from scratch.

import math

# A point on a unit circle (radius = 1)
# As the angle increases from 0 to 2π, the point travels all the way around.

print(f"{'Angle (deg)':>12} | {'cos':>8} | {'sin':>8} | {'x,y'}") 
print("-" * 50)

for degrees in range(0, 361, 30):
    radians = degrees * math.pi / 180   # convert degrees to radians
    x       = math.cos(radians)
    y       = math.sin(radians)
    print(f"{degrees:>12}° | {x:>8.3f} | {y:>8.3f} | ({x:.2f}, {y:.2f})")

# Key observations:
# At 0°:   cos=1,  sin=0   — pointing right
# At 90°:  cos=0,  sin=1   — pointing up
# At 180°: cos=-1, sin=0   — pointing left
# At 270°: cos=0,  sin=-1  — pointing down
# At 360°: cos=1,  sin=0   — back to start
```

## What radians are

Degrees are arbitrary — someone decided a circle has 360 of them. Radians are natural — they measure arc length on a unit circle.

```
2π radians = 360 degrees (full circle)
π  radians = 180 degrees (half circle)
π/2 radians = 90 degrees (quarter circle)
```

Mathematics and physics always use radians. Python's `math.sin()` and `math.cos()` take radians.

```python
# episode5_radians.py
# Understanding radians.

import math

# Converting
def degrees_to_radians(degrees: float) -> float:
    return degrees * math.pi / 180

def radians_to_degrees(radians: float) -> float:
    return radians * 180 / math.pi

print(degrees_to_radians(180))    # 3.14159... = π
print(degrees_to_radians(90))     # 1.5708...  = π/2
print(radians_to_degrees(math.pi))  # 180.0

# The intuition: a radian is the angle where the arc length
# equals the radius. For a unit circle (r=1), that is where
# the arc is 1 unit long.
```

## Using trigonometry for force directions

Now we can apply forces at any angle.

```python
# episode5_angled_forces.py
# Applying forces at arbitrary angles.

import math
from vector import Vector2D
from particle import Particle

def force_at_angle(magnitude: float, angle_degrees: float) -> Vector2D:
    """
    Create a force vector of given magnitude in the given direction.
    This is exactly what Vector2D.from_angle() does internally.

    force_x = magnitude * cos(angle)
    force_y = magnitude * sin(angle)
    """
    angle_radians = math.radians(angle_degrees)
    return Vector2D(
        magnitude * math.cos(angle_radians),
        magnitude * math.sin(angle_radians),
    )

# A force of 100 units at 45 degrees (northeast)
f = force_at_angle(100, 45)
print(f"45° force: {f}")
# x and y components should be equal for 45°
# and each should be 100 / sqrt(2) ≈ 70.71

# Verify: the magnitude should still be 100
print(f"Magnitude: {f.magnitude:.2f}")   # 100.00

# A force pushing at 30 degrees above horizontal
f2 = force_at_angle(50, 30)
print(f"30° force: {f2}")
print(f"Magnitude: {f2.magnitude:.2f}")   # 50.00
```

## A circular orbit — trigonometry in motion

The most beautiful demonstration of sine and cosine is circular motion. If a particle moves in a circle, its x and y positions trace out cosine and sine waves respectively.

```python
# episode5_orbit.py
# A particle moving in a circle — trigonometry made visible.
# Run this with the renderer from Episode 4.

import math
import pygame
from vector import Vector2D
from particle import Particle
from renderer import Renderer

renderer = Renderer(width=800, height=600, title="Episode 5 — Circular Motion")

# The orbital parameters
ORBIT_RADIUS = 150      # pixels from centre
ORBIT_SPEED  = 1.0      # radians per second

# We will drive this particle with mathematics directly —
# position = (r*cos(ωt), r*sin(ωt))
# where ω (omega) is angular speed in radians/second
# and t is time in seconds.

# This is called parametric motion — position as a function of time.

time    = 0.0
dt      = 1 / 60
trail   = []

# A second particle driven by physics forces (centripetal force)
# — they should trace the same circle.
physics_particle = Particle(
    position = Vector2D(ORBIT_RADIUS, 0),
    velocity = Vector2D(0, ORBIT_RADIUS * ORBIT_SPEED),
    mass     = 1.0,
)

while renderer.process_events():
    # --- Parametric position (driven by maths) ---
    math_x = ORBIT_RADIUS * math.cos(ORBIT_SPEED * time)
    math_y = ORBIT_RADIUS * math.sin(ORBIT_SPEED * time)
    math_pos = Vector2D(math_x, math_y)

    # --- Physics-driven orbit ---
    # Centripetal force: F = mv²/r, directed toward the centre
    # Direction: from particle to centre, which is -position (since centre is origin)
    toward_centre = -physics_particle.position.normalized
    speed         = physics_particle.velocity.magnitude
    radius        = physics_particle.position.magnitude
    if radius > 0:
        centripetal_magnitude = physics_particle.mass * speed**2 / radius
        centripetal_force     = toward_centre * centripetal_magnitude
        physics_particle.apply_force(centripetal_force)

    physics_particle.integrate(dt)
    time += dt

    # Trail
    trail.append(math_pos)
    if len(trail) > 120:
        trail.pop(0)

    # --- Render ---
    renderer.clear()
    renderer.draw_grid()

    # Draw the trail
    for i, pos in enumerate(trail):
        brightness = int(200 * i / len(trail))
        colour     = (brightness // 3, brightness // 3, brightness)
        screen_pos = renderer.sim_to_screen(pos)
        pygame.draw.circle(renderer.screen, colour, screen_pos, 2)

    # Draw both particles
    # Blue: driven by maths (parametric)
    renderer.draw_text("Blue: parametric (cos, sin)", 10, 10)
    renderer.draw_text("Red: driven by physics forces", 10, 28)

    math_screen = renderer.sim_to_screen(math_pos)
    pygame.draw.circle(renderer.screen, (70, 130, 220), math_screen, 10)

    renderer.draw_particle(physics_particle, colour=(220, 70, 70))

    renderer.present()

renderer.quit()
```

## The dot product and angles

Earlier we built the dot product. Now we can explain what it means geometrically.

```python
# episode5_dot_product_angles.py
# The dot product measures the angle between two vectors.

import math
from vector import Vector2D

def angle_between(v1: Vector2D, v2: Vector2D) -> float:
    """
    The angle between two vectors in degrees.

    The dot product formula:
        a · b = |a| |b| cos(θ)

    Rearranged:
        cos(θ) = (a · b) / (|a| |b|)

    Therefore:
        θ = arccos((a · b) / (|a| |b|))
    """
    cos_theta = v1.dot(v2) / (v1.magnitude * v2.magnitude)
    # Clamp to [-1, 1] to handle floating point errors
    cos_theta = max(-1.0, min(1.0, cos_theta))
    return math.degrees(math.acos(cos_theta))

# Test it
right   = Vector2D(1, 0)
up      = Vector2D(0, 1)
up_right = Vector2D(1, 1)

print(f"Angle between right and up:        {angle_between(right, up):.1f}°")   # 90.0°
print(f"Angle between right and up-right:  {angle_between(right, up_right):.1f}°")  # 45.0°
print(f"Angle between right and left:      {angle_between(right, -right):.1f}°")    # 180.0°
print(f"Angle between right and right:     {angle_between(right, right):.1f}°")     # 0.0°

# This is how we detect head-on collisions (angle ≈ 180°)
# and glancing collisions (angle ≈ 90°) in Series 2.
```

## What we learned

Sine and cosine are the x and y coordinates of a point on a unit circle. They turn angles into vectors and vectors into angles. Every circular path, every wave, every rotation uses them.

The dot product gives us the angle between two vectors — we will use this to resolve collisions and calculate how much of a force acts in a given direction.

---

# Episode 6 — Why Euler's Method Fails and How to Fix It

## The problem

In Episode 3 we used Euler's method to integrate the equations of motion. It is simple and works reasonably well. But it has a serious flaw: it accumulates energy.

```python
# episode6_euler_problem.py
# Demonstrating where Euler's method goes wrong.

from vector import Vector2D
from particle import Particle
import math

# A particle in a circular orbit.
# With perfect integration, the orbit should be stable forever.
# With Euler's method, it slowly spirals outward — gaining energy.

particle = Particle(
    position = Vector2D(100, 0),
    velocity = Vector2D(0, 100),
    mass     = 1.0,
)

CENTRE      = Vector2D(0, 0)
INITIAL_KE  = particle.kinetic_energy
INITIAL_PE  = -100.0 * 100.0 / 100.0   # simplified gravitational PE
INITIAL_E   = INITIAL_KE + INITIAL_PE

print(f"Initial energy: {INITIAL_E:.4f}")

dt = 0.016

for step in range(1000):
    toward_centre = (CENTRE - particle.position).normalized
    radius        = particle.position.magnitude
    speed         = particle.velocity.magnitude
    if radius > 0:
        centripetal   = toward_centre * (speed**2 / radius)
        particle.apply_force(centripetal * particle.mass)
    particle.integrate(dt)

    if step % 100 == 0:
        current_r = particle.position.magnitude
        print(f"Step {step:4d}: radius = {current_r:.2f}  (should stay at 100.0)")

# The radius increases over time — the particle is slowly gaining energy.
# This is called numerical dissipation (or in this case, anti-dissipation).
# Euler's method is not energy-conserving.
```

## The solution: Velocity Verlet integration

The Velocity Verlet integrator is only slightly more complex than Euler, but it is far more accurate and conserves energy much better. It is the standard method for physics simulations.

The key difference: Euler uses the velocity at the *start* of the step to update position. Velocity Verlet uses the average of the velocities at the start and end.

```python
# episode6_integrators.py
# Comparing Euler and Velocity Verlet integration.
# This is a key piece of numerical methods — how we solve differential
# equations approximately on a computer.

from vector import Vector2D
from particle import Particle
import math
from typing import Callable, List


# A force function signature: takes a Particle, returns a Vector2D force.
ForceFunc = Callable[[Particle], Vector2D]


def euler_step(particle: Particle, forces: List[ForceFunc], dt: float) -> None:
    """
    Euler integration — the simple version.
    Uses current state to predict next state.

    v(t+dt) = v(t) + a(t) * dt
    x(t+dt) = x(t) + v(t) * dt    ← uses velocity at START of step

    The problem: position is updated with the OLD velocity,
    not accounting for how velocity changes during the step.
    """
    total_force = Vector2D.zero()
    for f in forces:
        total_force = total_force + f(particle)

    acceleration = total_force / particle.mass
    particle.velocity = particle.velocity + acceleration * dt
    particle.position = particle.position + particle.velocity * dt


def velocity_verlet_step(
    particle: Particle,
    forces:   List[ForceFunc],
    dt:       float,
) -> None:
    """
    Velocity Verlet integration — more accurate, still simple.

    x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
    a(t+dt) = F(x(t+dt)) / m
    v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt

    Key difference: uses the AVERAGE of accelerations at start and end.
    This makes it second-order accurate (error scales as dt², not dt).
    It also conserves energy much better for conservative forces (like gravity).
    """
    # Step 1: compute current acceleration
    total_force = Vector2D.zero()
    for f in forces:
        total_force = total_force + f(particle)
    accel_current = total_force / particle.mass

    # Step 2: update position using current velocity and acceleration
    particle.position = (
        particle.position
        + particle.velocity * dt
        + accel_current * (0.5 * dt**2)
    )

    # Step 3: compute acceleration at new position
    new_total_force = Vector2D.zero()
    for f in forces:
        new_total_force = new_total_force + f(particle)
    accel_new = new_total_force / particle.mass

    # Step 4: update velocity using AVERAGE of old and new accelerations
    particle.velocity = particle.velocity + (accel_current + accel_new) * (0.5 * dt)


# ---- Compare them on a simple pendulum ----

def pendulum_force(p: Particle) -> Vector2D:
    """
    Force on a pendulum: restoring force proportional to displacement.
    This is a simple harmonic oscillator.
    F = -k * x   where k is the spring constant.
    """
    k = 100.0   # spring constant
    return Vector2D(-k * p.position.x, -k * p.position.y)


# Two particles with identical initial conditions
euler_p = Particle(position=Vector2D(50, 0), velocity=Vector2D(0, 0), mass=1.0)
verlet_p = Particle(position=Vector2D(50, 0), velocity=Vector2D(0, 0), mass=1.0)

dt    = 0.016
steps = 500

print(f"{'Step':>5} | {'Euler energy':>14} | {'Verlet energy':>14}")
print("-" * 40)

for i in range(steps):
    euler_step(euler_p,   [pendulum_force], dt)
    velocity_verlet_step(verlet_p, [pendulum_force], dt)

    if i % 50 == 0:
        # Total energy = KE + PE (spring PE = ½kx²)
        k = 100.0
        euler_pe  = 0.5 * k * euler_p.position.magnitude_squared
        verlet_pe = 0.5 * k * verlet_p.position.magnitude_squared
        euler_e   = euler_p.kinetic_energy  + euler_pe
        verlet_e  = verlet_p.kinetic_energy + verlet_pe
        print(f"{i:>5} | {euler_e:>14.4f} | {verlet_e:>14.4f}")

# Euler's energy drifts. Verlet's stays nearly constant.
# This is the difference between a simulation that works and one that explodes.
```

## Updating the Particle class

```python
# particle_v2.py
# Particle updated to support multiple integration methods.

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from vector import Vector2D


class Integrator(Enum):
    EULER          = "euler"
    VELOCITY_VERLET = "verlet"


@dataclass
class Particle:
    position:     Vector2D
    velocity:     Vector2D     = field(default_factory=Vector2D.zero)
    acceleration: Vector2D     = field(default_factory=Vector2D.zero)
    mass:         float        = 1.0
    integrator:   Integrator   = Integrator.VELOCITY_VERLET

    _force_accumulator:  Vector2D = field(default_factory=Vector2D.zero, repr=False)
    _prev_acceleration:  Vector2D = field(default_factory=Vector2D.zero, repr=False)

    def __post_init__(self):
        if self.mass <= 0:
            raise ValueError(f"Mass must be positive, got {self.mass}")

    def apply_force(self, force: Vector2D) -> None:
        self._force_accumulator = self._force_accumulator + force

    def integrate(self, dt: float) -> None:
        if self.integrator == Integrator.EULER:
            self._euler_integrate(dt)
        else:
            self._verlet_integrate(dt)
        self._force_accumulator = Vector2D.zero()

    def _euler_integrate(self, dt: float) -> None:
        self.acceleration = self._force_accumulator / self.mass
        self.velocity     = self.velocity + self.acceleration * dt
        self.position     = self.position + self.velocity     * dt

    def _verlet_integrate(self, dt: float) -> None:
        accel_current     = self._force_accumulator / self.mass
        self.position     = (self.position
                             + self.velocity     * dt
                             + accel_current     * (0.5 * dt**2))
        accel_new         = self._force_accumulator / self.mass
        self.velocity     = self.velocity + (accel_current + accel_new) * (0.5 * dt)
        self.acceleration = accel_new

    @property
    def kinetic_energy(self) -> float:
        return 0.5 * self.mass * self.velocity.magnitude_squared

    @property
    def momentum(self) -> Vector2D:
        return self.velocity * self.mass

    def __str__(self) -> str:
        return f"Particle(pos={self.position}, vel={self.velocity})"
```

## What we learned

Euler's method accumulates error — it slowly adds energy to the system. Velocity Verlet uses the average acceleration over a time step, making it second-order accurate. For conservative forces (gravity, springs), it conserves energy almost perfectly.

This is **numerical methods** — the branch of mathematics and computer science about solving equations approximately. Every physics simulation, every finite element analysis, every weather model uses these ideas.

---

# Episode 7 — The Simulation Class

## Bringing it all together

We now have all the pieces. This episode assembles them into a proper Simulation class — a clean domain object that owns the particles, applies forces, advances time, and tells the renderer what to draw.

```python
# simulation.py
# The Simulation class — owns particles and advances time.

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Callable, Optional
from vector import Vector2D
from particle import Particle


# A Force is a function: takes a Particle, returns a Vector2D.
# This is a functional programming concept called a "higher-order function" —
# a function that takes or returns other functions.
# Forces are composable: we can combine them, filter them, scale them.
Force = Callable[[Particle], Vector2D]


class Simulation:
    """
    Manages a collection of particles and advances the simulation.

    Responsibilities:
    - Own the list of particles
    - Apply forces each frame
    - Advance time using integration
    - Track simulation time
    - Emit events when notable things happen (Series 2)

    This is the Service Layer for our physics engine.
    """

    def __init__(self, dt: float = 1/60):
        self.particles: List[Particle] = []
        self.forces:    List[Force]    = []
        self.dt:        float          = dt
        self.time:      float          = 0.0
        self.step:      int            = 0

    def add_particle(self, particle: Particle) -> Particle:
        """Add a particle to the simulation. Returns it for chaining."""
        self.particles.append(particle)
        return particle

    def add_force(self, force: Force) -> None:
        """
        Register a force function.
        On each step, every force is called for every particle.
        """
        self.forces.append(force)

    def remove_force(self, force: Force) -> None:
        if force in self.forces:
            self.forces.remove(force)

    def advance(self) -> None:
        """
        Advance the simulation by one time step (self.dt seconds).
        This is called once per frame.
        """
        for particle in self.particles:
            # Apply every registered force to this particle
            for force_func in self.forces:
                force = force_func(particle)
                particle.apply_force(force)
            # Integrate
            particle.integrate(self.dt)

        self.time += self.dt
        self.step += 1

    @property
    def total_kinetic_energy(self) -> float:
        """Sum of kinetic energies of all particles."""
        return sum(p.kinetic_energy for p in self.particles)

    @property
    def total_momentum(self) -> Vector2D:
        """Sum of momenta of all particles. Should be conserved."""
        total = Vector2D.zero()
        for p in self.particles:
            total = total + p.momentum
        return total

    def __repr__(self) -> str:
        return (
            f"Simulation("
            f"particles={len(self.particles)}, "
            f"time={self.time:.2f}s, "
            f"KE={self.total_kinetic_energy:.2f})"
        )
```

## Standard force functions

Forces are plain functions — no classes needed. This is functional programming: behaviour as data.

```python
# forces.py
# Standard physics forces as plain functions.
# Each function takes a Particle and returns a force Vector2D.

import math
from vector import Vector2D
from particle import Particle


# ---- Gravity ----

def make_gravity(g: float = 9.8) -> "Force":
    """
    Returns a gravity force function.
    F = m * g downward.

    We use a factory function (make_gravity) that returns a force function.
    This is a closure — the returned function "remembers" the value of g.
    """
    def gravity(particle: Particle) -> Vector2D:
        return Vector2D(0, -g * particle.mass)
    gravity.__name__ = f"gravity(g={g})"
    return gravity


# ---- Drag (air resistance) ----

def make_drag(coefficient: float = 0.01) -> "Force":
    """
    Drag force opposes velocity, proportional to speed squared.
    F = -c * |v| * v_hat  where v_hat is the unit vector of velocity.

    This is physically correct drag (quadratic drag).
    It slows particles down proportional to how fast they are moving.
    """
    def drag(particle: Particle) -> Vector2D:
        speed = particle.velocity.magnitude
        if speed < 1e-6:
            return Vector2D.zero()
        direction     = -particle.velocity.normalized   # opposes motion
        drag_magnitude = coefficient * speed**2
        return direction * drag_magnitude
    return drag


# ---- Spring force ----

def make_spring(
    anchor:       Vector2D,
    rest_length:  float,
    stiffness:    float,
) -> "Force":
    """
    A spring attached to a fixed anchor point.
    F = -k * (|r| - L₀) * r_hat
    where:
        k    = spring stiffness
        |r|  = current length (distance from anchor)
        L₀   = rest length
        r_hat = unit vector from particle to anchor

    When the spring is stretched, it pulls the particle toward the anchor.
    When compressed, it pushes away.
    This is Hooke's Law.
    """
    def spring(particle: Particle) -> Vector2D:
        displacement  = anchor - particle.position
        current_length = displacement.magnitude
        if current_length < 1e-6:
            return Vector2D.zero()
        stretch       = current_length - rest_length
        direction     = displacement.normalized
        return direction * (stiffness * stretch)
    return spring


# ---- Point gravity (attraction between particles) ----

def make_point_gravity(
    attractor:      Vector2D,
    strength:       float = 1000.0,
    min_distance:   float = 10.0,
) -> "Force":
    """
    Gravitational attraction toward a fixed point.
    F = G * M / r²   (Newton's law of gravitation, simplified)

    Force gets stronger as you get closer (inverse square law).
    We clamp at min_distance to prevent infinite forces.
    """
    def point_gravity(particle: Particle) -> Vector2D:
        displacement = attractor - particle.position
        distance     = displacement.magnitude
        if distance < min_distance:
            distance = min_distance
        direction    = displacement.normalized
        magnitude    = strength * particle.mass / (distance**2)
        return direction * magnitude
    return point_gravity


# ---- Boundary force — keeps particles in a box ----

def make_boundary(
    width:     float,
    height:    float,
    stiffness: float = 500.0,
) -> "Force":
    """
    A soft boundary — a spring force that pushes particles back
    when they go outside the boundary rectangle.
    """
    half_w = width  / 2
    half_h = height / 2

    def boundary(particle: Particle) -> Vector2D:
        force = Vector2D.zero()
        x, y  = particle.position.x, particle.position.y

        if x < -half_w:
            force = force + Vector2D(-(-half_w - x) * stiffness, 0)
        elif x > half_w:
            force = force + Vector2D(-(x - half_w) * stiffness,  0)

        if y < -half_h:
            force = force + Vector2D(0, -(-half_h - y) * stiffness)
        elif y > half_h:
            force = force + Vector2D(0, -(y - half_h)  * stiffness)

        return force
    return boundary
```

## The complete interactive simulation

```python
# episode7_interactive.py
# A fully interactive simulation.
# Click to add particles. Press keys to change forces.

import pygame
import random
import math
from vector import Vector2D
from particle import Particle
from simulation import Simulation
from renderer import Renderer
from forces import make_gravity, make_drag, make_spring, make_point_gravity

renderer   = Renderer(width=900, height=700, title="Episode 7 — Interactive Simulation", scale=1.0)
sim        = Simulation(dt=1/60)

# Register forces
gravity    = make_gravity(150)
drag_force = make_drag(0.02)
boundary   = make_boundary = __import__('forces').make_boundary(800, 600, stiffness=300)

sim.add_force(gravity)
sim.add_force(drag_force)
sim.add_force(make_boundary)

# Add some initial particles
for _ in range(5):
    angle    = random.uniform(0, 2 * math.pi)
    speed    = random.uniform(100, 300)
    particle = Particle(
        position = Vector2D(random.uniform(-200, 200), random.uniform(-100, 200)),
        velocity = Vector2D(math.cos(angle) * speed, math.sin(angle) * speed),
        mass     = random.uniform(0.5, 3.0),
    )
    sim.add_particle(particle)

show_vectors   = True
gravity_on     = True
attractor_pos  = None
attractor_force = None

print("Controls:")
print("  Click:    Add a particle")
print("  G:        Toggle gravity")
print("  V:        Toggle velocity vectors")
print("  A:        Place/remove gravity attractor at mouse position")
print("  C:        Clear all particles")
print("  ESC:      Quit")

clock_display = 0

while renderer.process_events():
    # ---- Input ----
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            renderer.running = False

        elif event.type == pygame.MOUSEBUTTONDOWN:
            sim_pos = renderer.screen_to_sim(event.pos[0], event.pos[1])
            new_p   = Particle(
                position = sim_pos,
                velocity = Vector2D(random.uniform(-100, 100), random.uniform(50, 200)),
                mass     = random.uniform(0.5, 2.0),
            )
            sim.add_particle(new_p)

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_g:
                gravity_on = not gravity_on
                if gravity_on:
                    sim.add_force(gravity)
                else:
                    sim.remove_force(gravity)

            elif event.key == pygame.K_v:
                show_vectors = not show_vectors

            elif event.key == pygame.K_c:
                sim.particles.clear()

            elif event.key == pygame.K_a:
                mouse_pos    = pygame.mouse.get_pos()
                attractor_pos = renderer.screen_to_sim(mouse_pos[0], mouse_pos[1])
                if attractor_force:
                    sim.remove_force(attractor_force)
                attractor_force = make_point_gravity(attractor_pos, strength=50000)
                sim.add_force(attractor_force)

    # ---- Physics ----
    sim.advance()

    # ---- Render ----
    renderer.clear()
    renderer.draw_grid(spacing=100)

    # Draw attractor
    if attractor_pos:
        screen_pos = renderer.sim_to_screen(attractor_pos)
        pygame.draw.circle(renderer.screen, (220, 210, 60), screen_pos, 8)
        pygame.draw.circle(renderer.screen, (240, 230, 80), screen_pos, 4)

    # Draw particles
    colours = [(70, 130, 220), (220, 70, 70), (70, 200, 100), (220, 160, 60)]
    for i, p in enumerate(sim.particles):
        colour = colours[i % len(colours)]
        radius = max(4, int(p.mass * 5))
        renderer.draw_particle(p, colour=colour, radius=radius)
        if show_vectors:
            renderer.draw_velocity_arrow(p)

    # HUD
    renderer.draw_text(f"Particles: {len(sim.particles)}", 10, 10)
    renderer.draw_text(f"Total KE:  {sim.total_kinetic_energy:.1f}", 10, 28)
    renderer.draw_text(f"Time:      {sim.time:.1f}s", 10, 46)
    renderer.draw_text(f"Gravity:   {'ON' if gravity_on else 'OFF'}", 10, 64)
    renderer.draw_text(f"[G]ravity [V]ectors [A]ttractor [C]lear", 10, renderer.height - 25)

    renderer.present()

renderer.quit()
```

## What we learned

The Simulation class is the Service Layer of the engine. Forces are plain functions — first-class objects in Python. `make_gravity()` returns a function that captures `g` in a closure. This is functional programming: behaviour described as data, composed freely.

The simulation loop is clean: apply forces, integrate, render. Each concern in its own place.

---

# Where We Are — End of Series 1

Here is what you have built and what you have learned:

## Files

```
vector.py          The Vector2D class — magnitude, direction, dot product
particle.py        A point mass with position, velocity, acceleration, mass
simulation.py      Owns particles, applies forces, advances time
forces.py          Gravity, drag, springs, point gravity — as plain functions
renderer.py        pygame window, coordinate conversion, drawing
test_vector.py     Verification that Vector2D is mathematically correct
```

## Mathematics covered

| Concept | Where it appeared |
|---|---|
| Number lines and coordinates | Episode 1 |
| Pythagorean theorem | Episode 1 — distance between points |
| Vectors — magnitude and direction | Episode 2 |
| Vector addition, scaling, normalisation | Episode 2 |
| Dot product | Episode 2 — angle between forces |
| Derivatives | Episode 3 — velocity from position |
| Numerical integration (Euler) | Episode 3 — position from acceleration |
| Newton's second law F=ma | Episode 3 — inside integrate() |
| Trigonometry — sine and cosine | Episode 5 — circular motion, angled forces |
| Radians | Episode 5 |
| Numerical methods accuracy | Episode 6 — Euler vs Velocity Verlet |
| Hooke's Law | Episode 7 — spring force |
| Newton's law of gravitation | Episode 7 — inverse square force |
| Kinetic energy ½mv² | Episode 7 — energy tracking |
| Conservation of momentum | Episode 7 — tracked in Simulation |

## Computer science covered

| Pattern | Where it appeared |
|---|---|
| Rich domain model | Vector2D, Particle — objects that own their rules |
| Value objects | Vector2D — immutable, compared by value |
| Dunder methods | Vector2D — +, -, *, /, ==, str |
| Properties | Particle.kinetic_energy, Vector2D.magnitude |
| Factory functions / closures | forces.py — make_gravity() returns a function |
| Higher-order functions | Simulation.forces — list of callables |
| Separation of concerns | Simulation vs Renderer vs Particle |
| Guard clauses | Particle.__post_init__ — mass > 0 |

---

# What Comes Next — Series 2 Preview

**Series 2 — Forces, Collisions, and Many Bodies**

- Elastic and inelastic collisions — conservation of momentum in code
- Collision detection — the naive O(n²) approach and why it breaks
- Spatial hashing — O(n) collision detection using a hash map (your first real DSA)
- Constraint solving — particles connected by rigid rods
- The Observer pattern — events fired when particles collide
- Energy conservation checks — verifying the simulation is physically correct

The mathematics: momentum, impulse, vectors in collision response, hashing functions, the basics of computational geometry.

The computer science: the first real data structure (spatial hash), the Observer pattern, algorithmic complexity.
