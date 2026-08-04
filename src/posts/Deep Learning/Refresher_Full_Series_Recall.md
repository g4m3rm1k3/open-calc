# Refresher — Full-Series Recall, Before the Manufacturing Arc

**Track:** RL/Keras Mastery Arc — Refresher (before Lesson 18)
**Depth:** Spaced repetition across the entire series — every concept revisited through a new question or new framing, not just re-explained
**Goal:** Test what's actually stuck, reinforce what's shaky, before building on top of all of it in the manufacturing arc. Try to answer each "Recall" prompt yourself, in your head or on paper, *before* reading the answer beneath it — the value of this lesson comes from retrieval practice, not from re-reading.

---

## Part 1 — Math Foundations (Lessons 1, 2, 10, 11)

**Recall:** Why must the inner dimensions of two matrices match for multiplication to be valid, and what determines the output shape?

> The inner dimensions represent "how many numbers get summed together" for each output entry — if they don't match, there's nothing correct to sum. Output shape is the two *outer* dimensions: `(m, n) × (n, p) → (m, p)`.

**New angle this time:** if `weight_matrix` has shape `(4, 16)`, what's the *only* valid shape for a batch of inputs multiplying it on the left? What does the `4` in that required shape actually represent, conceptually, not just positionally?

> `(batch_size, 4)` — any batch size, but exactly 4 in the second position, because `4` is the number of *features per example* the layer was built to accept, and that has to match the layer's input dimension regardless of how many examples you're running at once.

**Recall:** What does `argmax` return — the value, or something else? Why is this the exact function an RL agent uses to act?

> The *index* of the largest value, not the value itself. An agent's network outputs one score per action; `argmax` converts "here are the scores" into "here is the decision" — the index *is* the action.

**New angle:** if two actions have exactly tied scores, what does `np.argmax` do, and why might that matter for an agent's behavior over many episodes?

> Returns the *first* occurring index among the tied maximums — meaning ties are broken by array position, not randomly. Over many episodes, this can create a subtle, consistent bias toward lower-indexed actions in genuinely ambiguous states, which is part of why epsilon-greedy exploration (not pure argmax) is used during training.

**Recall:** State the chain rule, and explain in one sentence why a neural network's structure makes it necessary.

> `dy/dx = f'(g(x)) × g'(x)` for `y = f(g(x))`. A network is a composition of layer-functions, so computing how a deep weight affects the final loss requires multiplying derivatives back through every function that weight's effect passed through.

**New angle:** if you added a *fifth* layer to a network, what changes about the chain-rule expression for a weight in the *first* layer — does it get more terms, or different terms?

> More terms — one additional multiplied factor for each additional layer the gradient has to propagate back through. The chain doesn't change *kind*, it gets *longer*.

**Recall:** Why does backpropagation need `weight_matrix.T` rather than `weight_matrix` itself when computing a gradient with respect to a layer's input?

> The forward pass maps input-shape to output-shape; propagating a gradient backward means going from output-shape back to input-shape — the reverse direction — and the transpose is what makes that reversed matrix multiplication shape-valid.

---

## Part 2 — Keras and Deep Learning Core (Lessons 4, 5)

**Recall:** What three things does `model.compile(...)` actually configure?

> The optimizer (how weights get updated), the loss function (what "wrong" means, numerically), and metrics (extra numbers tracked for your own monitoring, not used in training).

**New angle:** if you swapped `loss="mse"` for a wildly inappropriate loss function for your problem (say, using MSE for a classification task with 10 classes), what would likely happen — would training crash, or something subtler?

> Probably no crash — the shapes would likely still "work" — but training would optimize the *wrong objective*, producing a model that technically minimizes that mismatched loss without actually learning good decision boundaries for classification. This is a common, quiet source of bad models that don't error out.

**Recall:** What's the actual difference between overfitting and underfitting, in terms of the training-vs-validation loss curves?

> Underfitting: both curves stay high, model hasn't learned the pattern. Overfitting: training loss keeps dropping while validation loss flattens or rises — the model is memorizing training-specific noise rather than the general pattern.

**New angle:** could a model be overfitting on *some* parts of the input space and underfitting on others, simultaneously? What would that suggest about the data or model, rather than being a contradiction?

> Yes — this is common with imbalanced or non-uniform data (e.g. a manufacturing dataset with tons of examples from common operating conditions and very few from rare/edge conditions). It usually points to needing more/better data in the underrepresented region rather than a single global fix like "reduce model size" or "add more epochs."

**Recall:** Why can't a plain `Dense` network handle raw images efficiently, and what does convolution do differently?

> `Dense` connects every input to every neuron — huge parameter counts on image-sized input, and no notion of local spatial structure. Convolution reuses a small kernel across the whole image (few parameters) and specifically looks at local neighborhoods (preserves spatial structure).

**New angle:** why does a CNN typically get *more* channels (feature maps) as it goes deeper, even as the spatial size (height/width) shrinks?

> Early layers detect simple, generic patterns (edges, colors) with relatively few feature maps needed; deeper layers combine those into more complex, more numerous distinct patterns (shapes, parts, textures) — more channels gives the network room to represent a richer vocabulary of higher-level features, even as pooling/striding shrinks the spatial resolution.

---

## Part 3 — RL Foundations (Lessons 6, 7, 8)

**Recall:** State the Bellman equation, and explain what "the Markov property" means in one sentence.

> `V(s) = R(s,a) + γ × V(next_state)`. Markov property: the current state alone contains everything needed to predict what happens next — no history beyond it is required.

**New angle:** give a concrete example (not from the lessons) of a state representation that would violate the Markov property, and explain what's missing.

> Example: a thermostat's state defined as just "current temperature," used to predict future temperature — this is missing whether the temperature is currently rising or falling (the "velocity" of the system), so two identical-looking states could behave completely differently next. (Any similar "missing a rate-of-change/history component" example is the right shape of answer.)

**Recall:** What's the one-term difference between Q-learning's and SARSA's update rule, and what property does that difference give each algorithm?

> Q-learning uses `max(Q(s', all actions))` (off-policy — assumes optimal future play regardless of actual behavior); SARSA uses `Q(s', a')`, the action actually taken next (on-policy — learns the value of the policy actually being followed, exploration mistakes included).

**New angle:** in an environment with a very risky action that's rarely explored, would you expect Q-learning's and SARSA's learned values for nearby states to differ more or less than in a "safe" environment? Why?

> More — Q-learning always assumes optimal play afterward (ignoring the real risk of an exploratory misstep near danger), while SARSA's values incorporate the actual chance of an exploration-driven mistake. The riskier the nearby action, the more this on-policy vs. off-policy distinction actually shows up in the numbers.

**Recall:** Why can't Q-learning's table-based approach work on an environment with continuous state values?

> A table needs one entry per distinct state; continuous values have infinitely many possible states, so no finite table can enumerate them — this is the curse of dimensionality, not just an inconvenience.

---

## Part 4 — DQN and Its Variants (Lessons 9, 12, 13)

**Recall:** Name the two specific instability problems that arise from naively training a Q-network the same way you'd train a table, and which DQN trick fixes each.

> (1) Correlated sequential training data — fixed by experience replay (random minibatch sampling). (2) The moving-target problem (the same network computes both the prediction and the target) — fixed by a separate, periodically-synced target network.

**New angle:** if you used experience replay but *without* a target network, which of the two problems would still remain unsolved? Walk through why, don't just name it.

> The moving-target problem remains: even with randomly sampled, decorrelated data, the same network is still used to compute the target you're training toward — every weight update shifts that target, so you're still chasing a moving goal, just with better-shuffled training examples along the way.

**Recall:** What's the one-line difference in Double DQN's target calculation compared to vanilla DQN, and what specific statistical problem does it fix?

> Vanilla DQN uses the target network to both *select* the best next action (via `max`) and *evaluate* it. Double DQN uses the *online* network to select, and the *target* network only to evaluate — this decouples selection and evaluation, reducing the systematic overestimation bias that comes from `max` preferentially picking out noise-inflated estimates.

**New angle:** Dueling DQN's `Q(s,a) = V(s) + (A(s,a) - mean(A(s, all actions)))` subtracts the mean advantage. What would go wrong, concretely, if that subtraction were left out?

> Without it, the split into `V` and `A` is mathematically ambiguous — infinitely many `(V, A)` pairs could produce the same `Q` value (e.g., add 5 to `V` and subtract 5 from every `A`, same `Q` results), which gives training no unique target to converge toward for the individual streams, making the decomposition unstable to learn.

**Recall:** What quantity does Prioritized Experience Replay use to decide which transitions to sample more often, and why does that specific quantity make sense as a priority signal?

> The TD error (`target - current_estimate`) — a large TD error means the network's current guess was way off, so that transition carries more information the network hasn't yet absorbed; a small TD error means the network already handles that situation well, so re-training on it teaches less.

---

## Part 5 — Policy-Based Methods (Lessons 14, 15)

**Recall:** What's the fundamental strategic difference between value-based methods (DQN and its variants) and policy-based methods (REINFORCE)?

> Value-based: learn `Q(s,a)` or `V(s)`, then *derive* a policy by picking the best action. Policy-based: learn the policy directly — a network outputting action probabilities, trained to make good actions more likely without ever explicitly estimating "how good" states are.

**New angle:** REINFORCE uses softmax output and *samples* actions rather than using `argmax`. What would you lose if you used `argmax` on a policy network's probabilities instead of sampling?

> You'd lose the built-in exploration — sampling naturally tries less-favored actions in proportion to how plausible they currently seem; `argmax` would make the policy fully deterministic from the very first training step, with no mechanism to ever discover that a currently-underrated action might actually be better.

**Recall:** What does the "advantage" in Actor-Critic represent, and why does using it (instead of raw return `G_t`) reduce training variance?

> `Advantage = G_t - V(s_t)` (or the one-step bootstrapped version) — "how much better did this specific action do than the state's baseline expectation." Subtracting the baseline removes state-to-state variation in inherent difficulty from the signal, isolating just the action-specific quality — a less noisy signal than raw return, which conflates both.

**New angle:** Actor-Critic trains every single step rather than waiting for the full episode like REINFORCE. What had to be added to the algorithm to make that possible, that REINFORCE's approach structurally couldn't support?

> A learned value estimate `V(s)`, used to *bootstrap* a one-step target (`r_t + γV(s_{t+1})`) instead of needing the *actual* full future return `G_t`, which by definition isn't known until the episode ends. The critic is precisely what makes per-step updates possible.

---

## Part 6 — Applied Skills (Lessons 16, 17)

**Recall:** Why does a single Atari frame violate the Markov property, and what's the standard fix?

> A single frame shows position but not velocity/direction of movement — critical missing information for predicting what happens next. Fix: stack the last several frames as channels, giving the network implicit access to motion.

**New angle:** if frame-stacking fixes the Markov violation by supplying missing history, is there an equivalent concept in Actor-Critic or DQN for a *non-image* environment where a single reading might not capture the true state? Think of a manufacturing sensor example.

> Yes — e.g., a single vibration-sensor reading tells you the current amplitude, but not whether vibration is increasing (a possible sign of developing tool wear) or decreasing. A "stack of recent readings" (or an engineered rate-of-change feature) plays the same Markov-restoring role for sensor time-series that frame-stacking plays for pixels.

**Recall:** What's the core mechanism a Dash callback runs on — what triggers it, and what does it return?

> `@app.callback(Output(...), Input(...))` — the callback function re-runs whenever its `Input` component's watched property changes (e.g., an `Interval` component's tick count), and whatever it returns becomes the new value of the `Output` component's property (e.g., a graph's `figure`).

---

## A short combined check — no new lesson material, just recombination

Try to answer this without writing code first, then verify with code if you want:

> You have a trained Dueling DQN agent (Lesson 12) and want to display, live, both its chosen action's Q-value *and* the underlying `V(s)` estimate for the current state, in a Dash dashboard (Lesson 17), updating once per second. Sketch, in words, every piece you'd need: which trained sub-model to query, what shape the input needs to be reshaped to, which Dash components are involved, and what triggers the update.

If you can talk through that combination fluently — pulling from Lesson 2 (reshape), Lesson 12 (the dueling architecture's separate value stream), and Lesson 17 (Interval-triggered callbacks) without needing to look any of them up individually — that's a genuinely strong sign the material has actually integrated, not just been read in sequence.

---

## Honest self-check

Go back through Parts 1-6 and count how many "Recall" and "New angle" prompts you could answer confidently without reading the answer first. That number is a much more honest signal of where you stand than how the material *felt* while reading it the first time — confident recall under a cold prompt is a meaningfully different skill from recognizing an explanation once it's in front of you again.

If a whole Part felt shaky, it's worth a real re-read of that lesson before moving on — better to spend twenty extra minutes now than to build the manufacturing arc on a foundation with a real gap in it.

---

## What's next

Lesson 18 begins the manufacturing arc: building a custom Gym environment modeling CNC cutting-parameter optimization — the first lesson in the entire series where you're not implementing something from a textbook example, but designing the environment itself, informed by your own real machining knowledge. Say the word when you're ready.
