# Lesson 18 — Building a Custom Gym Environment for CNC Cutting Optimization

**Track:** RL/Keras Mastery Arc — Manufacturing Application (opener)
**Depth:** Heavy — first lesson in the series where you're designing the environment, not just training an agent inside one someone else built
**Goal by end of lesson:** You can build a Gym-compatible custom environment from scratch, following the exact `reset()`/`step()` interface from Lesson 8, modeling a simplified but genuinely reasonable CNC cutting-parameter optimization problem — feed rate and spindle speed choices, tool wear accumulation, cycle time, and a reward function that balances speed against risk.

---

## 0. Why build a custom environment at all

Every environment used so far — CartPole, LunarLander, Breakout — was already built and registered in Gym. Real applications almost never have that luxury; if you want to apply RL to something specific to your own work, you have to model the problem yourself. The good news: Gym's interface (Lesson 8) is exactly what you need to replicate — `reset()`, `step()`, `observation_space`, `action_space` — and once you implement those correctly, every algorithm from Weeks 3-7 (Q-learning, DQN, Double/Dueling, Actor-Critic) works on your custom environment with zero changes, exactly as Lesson 19 will demonstrate.

---

## 1. Defining the problem, precisely, before writing any code

This is the step worth taking seriously and slowly — a poorly specified problem produces an agent that "solves" the wrong thing, and no amount of good RL code fixes a bad problem definition.

**The scenario this lesson models:** an agent controls **feed rate** and **spindle speed** while machining a single simple pass (e.g., a facing or straight turning operation) on a workpiece of known length. At each timestep, the agent chooses new values for both parameters. The episode ends when the pass is complete (workpiece fully machined) or when the tool breaks (chosen parameters exceeded safe cutting force for too long).

**What the agent should learn:** push feed rate and spindle speed as high as safely possible to minimize cycle time, without accumulating enough tool wear to break the tool before the pass finishes, and without exceeding a surface-finish-driven speed ceiling.

This is a deliberately simplified model — real CNC process physics (chip load, material-specific cutting coefficients, thermal effects, chatter) is far more complex, and you'll be in a much better position than most to extend this once you've seen the RL structure work end-to-end. The point here is the *environment-building pattern*, on a problem realistic enough to be worth extending later, not a production-grade physics simulator.

---

## 2. Choosing the state (observation) representation

Recall Lesson 6's Markov property: the state needs to contain everything relevant for predicting what happens next. For this problem:

```
state = [
    remaining_length,       # how much of the pass is left, normalized to [0, 1]
    current_feed_rate,      # normalized
    current_spindle_speed,  # normalized
    accumulated_tool_wear,  # normalized to [0, 1], 1.0 = tool failure
    cutting_force_estimate  # normalized - a proxy for "how hard is this cut right now"
]
```

Five continuous values — deliberately similar in shape to CartPole's 4-value state (Lesson 2, Section 4), just domain-specific. `cutting_force_estimate` is included because it's the quantity that actually drives both tool wear accumulation *and* the risk of tool breakage — leaving it out would make the state violate the Markov property in the same way a single Atari frame did (Lesson 16, Section 3): the agent would be missing information genuinely needed to predict what happens next.

---

## 3. Choosing the action space

```
action = [feed_rate_choice, spindle_speed_choice]
```

Real CNC parameters are continuous, but to reuse everything built so far (which assumed `Discrete` action spaces, exactly like CartPole's 2 actions or LunarLander's 4), this lesson **discretizes** the action space into a fixed set of combinations — a deliberate, explicit simplification:

```python
FEED_RATE_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5]      # multiplier on a baseline safe feed rate
SPINDLE_SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5]   # multiplier on a baseline safe spindle speed
# 5 x 5 = 25 possible combined actions
```

This mirrors Lesson 8, Section 2.1's discretization discussion directly — you're choosing to trade some precision for a much simpler `Discrete(25)` action space that every DQN-family algorithm from this series already knows how to handle. (A continuous-action approach, using algorithms like DDPG or PPO, is a natural extension once this discretized version is working — genuinely worth exploring later, but outside what this series built toward.)

---

## 4. A simplified process model — the actual physics-ish math

This is a deliberately simplified, illustrative model — not a substitute for real cutting-force equations (Kienzle's model and similar are the real-world standard) — built to be *directionally sensible* rather than metallurgically precise:

```python
def compute_cutting_force(feed_rate_multiplier, spindle_speed_multiplier):
    """
    Simplified: higher feed rate increases force roughly linearly;
    higher spindle speed (within reason) reduces force per-tooth slightly,
    but very high speed increases force again due to heat/wear effects.
    This is illustrative, not a validated physical model.
    """
    base_force = feed_rate_multiplier * 1.0
    speed_effect = 1.0 + 0.3 * (spindle_speed_multiplier - 1.0) ** 2  # penalizes extremes both ways
    return base_force * speed_effect


def compute_wear_increment(cutting_force, spindle_speed_multiplier):
    """Higher force and higher speed both accelerate wear - a standard qualitative relationship."""
    return 0.01 * cutting_force * spindle_speed_multiplier


def compute_material_removed(feed_rate_multiplier, spindle_speed_multiplier):
    """Higher feed and speed both remove material faster - directly reduces remaining_length."""
    return 0.02 * feed_rate_multiplier * spindle_speed_multiplier
```

**The honest caveat, stated plainly:** these formulas are simplified enough to build a working RL pipeline around, not calibrated against real machining data. Once you have real cycle-time, tool-wear, and force data from your own work, replacing these three functions with fitted or empirically-derived versions is the single highest-value upgrade to this environment — and it wouldn't require touching anything else in this lesson, exactly because the rest of the environment only interacts with these functions through their inputs/outputs, not their internals. This is good software design paying off directly: the process model is cleanly separated from the environment's control flow.

---

## 5. The reward function — where domain judgment actually lives

This is the part that most directly encodes what "good" means for this problem, and is worth reasoning through explicitly rather than picking numbers arbitrarily:

```python
def compute_reward(material_removed, tool_broke, pass_complete):
    reward = material_removed * 10   # reward progress - encourages speed
    if tool_broke:
        reward -= 50                  # heavy penalty - a broken tool is a real, costly failure
    if pass_complete:
        reward += 20                  # bonus for finishing the pass successfully
    return reward
```

**Why these relative magnitudes, reasoned explicitly:** the per-step progress reward needs to be small enough that the tool-breakage penalty clearly dominates any temptation to rush — otherwise the agent could learn "push parameters recklessly, break tools often, but rack up progress reward fast enough to come out ahead," which would be a real, costly failure mode if this policy were ever applied to an actual machine. This is precisely the kind of reward-shaping judgment call that has genuine real-world stakes once an environment models something with real consequences, unlike CartPole where a "bad" reward function just produces a worse game player.

---

## 6. The complete custom Gym environment

Save as `cnc_environment.py`.

```python
"""
A custom Gym-compatible environment modeling simplified CNC cutting-parameter optimization.
Follows the exact reset()/step() interface from Lesson 8, so every algorithm from
Lessons 9-15 works on this environment unmodified.
"""
import numpy as np
import gymnasium as gym
from gymnasium import spaces

FEED_RATE_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5]
SPINDLE_SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5]

TOOL_BREAK_FORCE_THRESHOLD = 1.8   # cutting_force above this risks immediate breakage
TOOL_WEAR_FAILURE_THRESHOLD = 1.0  # accumulated wear reaching this means tool failure
MAX_STEPS_PER_EPISODE = 200


class CNCCuttingEnv(gym.Env):
    """
    Observation (Section 2): [remaining_length, current_feed_rate, current_spindle_speed,
                               accumulated_tool_wear, cutting_force_estimate] - all normalized.
    Action (Section 3): Discrete(25) - one of 5 feed rates x 5 spindle speeds.
    """

    def __init__(self):
        super().__init__()
        self.action_space = spaces.Discrete(len(FEED_RATE_OPTIONS) * len(SPINDLE_SPEED_OPTIONS))
        self.observation_space = spaces.Box(low=0.0, high=2.0, shape=(5,), dtype=np.float32)

        self.remaining_length = None
        self.accumulated_tool_wear = None
        self.current_feed_rate = None
        self.current_spindle_speed = None
        self.current_cutting_force = None
        self.step_count = None

    def _action_to_parameters(self, action):
        """Decode a single Discrete(25) integer into (feed_rate_multiplier, spindle_speed_multiplier)."""
        feed_index = action // len(SPINDLE_SPEED_OPTIONS)
        speed_index = action % len(SPINDLE_SPEED_OPTIONS)
        return FEED_RATE_OPTIONS[feed_index], SPINDLE_SPEED_OPTIONS[speed_index]

    def _get_observation(self):
        return np.array([
            self.remaining_length,
            self.current_feed_rate,
            self.current_spindle_speed,
            self.accumulated_tool_wear,
            self.current_cutting_force
        ], dtype=np.float32)

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.remaining_length = 1.0
        self.accumulated_tool_wear = 0.0
        self.current_feed_rate = 1.0
        self.current_spindle_speed = 1.0
        self.current_cutting_force = compute_cutting_force(1.0, 1.0)
        self.step_count = 0

        observation = self._get_observation()
        info = {}
        return observation, info

    def step(self, action):
        self.step_count += 1
        feed_rate_multiplier, spindle_speed_multiplier = self._action_to_parameters(action)
        self.current_feed_rate = feed_rate_multiplier
        self.current_spindle_speed = spindle_speed_multiplier

        cutting_force = compute_cutting_force(feed_rate_multiplier, spindle_speed_multiplier)
        self.current_cutting_force = cutting_force

        wear_increment = compute_wear_increment(cutting_force, spindle_speed_multiplier)
        self.accumulated_tool_wear += wear_increment

        material_removed = compute_material_removed(feed_rate_multiplier, spindle_speed_multiplier)
        self.remaining_length = max(0.0, self.remaining_length - material_removed)

        tool_broke = (cutting_force > TOOL_BREAK_FORCE_THRESHOLD or
                      self.accumulated_tool_wear >= TOOL_WEAR_FAILURE_THRESHOLD)
        pass_complete = self.remaining_length <= 0.0

        reward = compute_reward(material_removed, tool_broke, pass_complete)

        terminated = tool_broke or pass_complete
        truncated = self.step_count >= MAX_STEPS_PER_EPISODE

        observation = self._get_observation()
        info = {"tool_broke": tool_broke, "pass_complete": pass_complete}
        return observation, reward, terminated, truncated, info


def compute_cutting_force(feed_rate_multiplier, spindle_speed_multiplier):
    base_force = feed_rate_multiplier * 1.0
    speed_effect = 1.0 + 0.3 * (spindle_speed_multiplier - 1.0) ** 2
    return base_force * speed_effect


def compute_wear_increment(cutting_force, spindle_speed_multiplier):
    return 0.01 * cutting_force * spindle_speed_multiplier


def compute_material_removed(feed_rate_multiplier, spindle_speed_multiplier):
    return 0.02 * feed_rate_multiplier * spindle_speed_multiplier


def compute_reward(material_removed, tool_broke, pass_complete):
    reward = material_removed * 10
    if tool_broke:
        reward -= 50
    if pass_complete:
        reward += 20
    return reward
```

---

## 7. Verifying the environment — a random-action sanity check

Before training any agent on this (Lesson 19), the same verification step from Lesson 8, Section 1.2 applies: run random actions and confirm the environment behaves sensibly.

```python
"""
Lesson 18 Practice: Sanity-checking the custom CNC environment with random actions.
Run with: python lesson_18_practice.py
"""
from cnc_environment import CNCCuttingEnv
import numpy as np


def run_random_episode(environment):
    state, info = environment.reset()
    total_reward = 0
    step_count = 0
    done = False

    while not done:
        action = environment.action_space.sample()
        next_state, reward, terminated, truncated, info = environment.step(action)
        total_reward += reward
        step_count += 1
        done = terminated or truncated
        state = next_state

    return total_reward, step_count, info


if __name__ == "__main__":
    environment = CNCCuttingEnv()

    print("--- Environment inspection ---")
    print("Observation space:", environment.observation_space)
    print("Action space:", environment.action_space)
    print()

    print("--- Running 10 random-action episodes ---")
    outcomes = {"tool_broke": 0, "pass_complete": 0, "timed_out": 0}
    for episode in range(10):
        total_reward, step_count, info = run_random_episode(environment)
        outcome = "tool_broke" if info.get("tool_broke") else (
            "pass_complete" if info.get("pass_complete") else "timed_out")
        outcomes[outcome] += 1
        print(f"Episode {episode + 1}: reward={total_reward:.2f}, steps={step_count}, outcome={outcome}")

    print("\nOutcome distribution over 10 random-action episodes:", outcomes)
    print("(Expect mostly tool_broke or timed_out with fully random actions - ")
    print(" a random agent has no reason to avoid aggressive parameter choices.)")
```

**What to expect:** with fully random actions, expect a fair number of `tool_broke` outcomes — a random policy has no reason to favor safer parameter combinations, which is exactly the right baseline to compare a trained agent against in Lesson 19 (the same role Lesson 8's random-action CartPole baseline played for Lesson 9's DQN).

---

## 8. Challenges before Lesson 19

1. Run the sanity check and confirm the outcome distribution matches the expectation in Section 7 — mostly failures, since nothing is guiding the random actions toward safety.
2. Adjust `TOOL_BREAK_FORCE_THRESHOLD` up or down and observe how the random-action outcome distribution shifts. Does the environment respond in the direction you'd expect?
3. Using your own actual CNC/machining knowledge, identify one specific way `compute_cutting_force`, `compute_wear_increment`, or `compute_material_removed` oversimplifies real physics — and describe (in words, not necessarily code yet) what a more realistic version would need to account for.
4. Add a 6th observation value tracking `steps_since_last_parameter_change` (i.e., how long the agent has held the same feed/speed combination). Would this plausibly help an agent learn a better policy, or is it unlikely to add real information beyond what's already in the state? Reason through this using Lesson 6's Markov-property framing before deciding.

---

## What's next

Lesson 19 drops this environment straight into Lesson 12's Double+Dueling DQN agent — unmodified — and trains it to discover a cutting-parameter policy, which you'll then be positioned to compare against your own real-world machining intuition.
