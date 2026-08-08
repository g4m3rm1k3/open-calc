# RL/Keras Concepts Reference — Come Back Here Anytime

**How to use this doc:** it's organized by *topic*, not by lesson number, so you can jump straight to whatever's fuzzy. Each section gives the idea explained a **different way** than the original lesson did — a different analogy or angle, on purpose, since a second framing often clicks when the first one didn't. Each section ends with a **Quick Test** (attempt it cold before checking the answers) and a line of **#hashtags** you can paste straight into YouTube search if you want a video explanation on top of the text.

---

## 1. Vectors, Matrices, and Matrix Multiplication

**Another way to think about it:** forget "list of numbers" for a second. A vector is a *recipe* — `[2, 3, 1]` might mean "2 scoops of flour, 3 of sugar, 1 of butter." A matrix is a *stack of recipes*. Matrix multiplication is what happens when you scale a batch of recipes by a set of ratios all at once, instead of doing each recipe's math by hand one at a time. The "inner dimensions must match" rule is just "the recipe and the ratio-list have to be talking about the same ingredients, in the same order" — otherwise you'd be multiplying flour amounts by sugar ratios, which is meaningless.

**The one thing to never forget:** `(rows, columns)`, always in that order, and `A @ B` needs `A`'s columns to equal `B`'s rows.

**#hashtags:** `#linearalgebra` `#matrixmultiplication` `#3blue1brown` `#vectorsexplained`

**Quick Test:**
1. What shape is the result of multiplying a `(3, 4)` matrix by a `(4, 2)` matrix?
2. Is `A @ B` generally the same as `B @ A`? Give a one-sentence reason either way.
3. What does the dot product of two vectors return — a vector, or a single number?

<details><summary>Answers</summary>

1. `(3, 2)`
2. No — the inner-dimension rule and the actual arithmetic are order-dependent; swapping usually isn't even shape-valid, let alone numerically equal.
3. A single number (a scalar).
</details>

---

## 2. NumPy — Reshape, Argmax, Broadcasting

**Another way to think about it:** NumPy arrays are like a spreadsheet you can reference by coordinates instead of clicking cells. `.reshape()` doesn't move any data — it's like re-wrapping the *same* garden hose into a different coil shape; the hose's length (total elements) can't change, only how it's coiled. `argmax` is "which contestant won" — not their score, their *position in the lineup*. Broadcasting is NumPy automatically "photocopying" a smaller array to match a bigger one's shape before combining them, so you don't have to write the copy loop yourself.

**#hashtags:** `#numpy` `#numpybroadcasting` `#pythonnumpytutorial` `#argmax`

**Quick Test:**
1. `np.array([1,2,3,4,5,6]).reshape(2,3)` — what does the resulting array look like?
2. `np.argmax([3, 9, 9, 1])` — what does this return, and why not `9`?
3. What's the rule of thumb for when broadcasting is even allowed between two differently-shaped arrays?

<details><summary>Answers</summary>

1. `[[1,2,3],[4,5,6]]`
2. `1` — the *index* of the first max value, not the value itself.
3. Roughly: shapes are compatible if, comparing from the rightmost dimension inward, each pair of dimensions is either equal or one of them is 1 (or missing).
</details>

---

## 3. Calculus, the Chain Rule, and Backpropagation

**Another way to think about it:** imagine a row of dominoes, each one's fall strength depending on how hard the one before it hit it. The chain rule is just "how hard did the *first* domino need to be pushed to make the *last* one fall with a specific force" — you multiply each domino's individual "how much force gets passed on" ratio together. Backprop is running that domino chain *backward*: starting from "how wrong was the final answer," and working back through each layer asking "how much did *you* contribute to that wrongness."

**The one thing to never forget:** a gradient tells you a *direction and steepness*, not an answer — `new_weight = old_weight - learning_rate × gradient` is always moving *against* the gradient, because gradient points toward increasing loss, and you want the opposite.

**#hashtags:** `#backpropagation` `#chainrule` `#gradientdescent` `#calculusfordeeplearning` `#3blue1brown neural networks`

**Quick Test:**
1. If `y = f(g(x))`, write the chain rule for `dy/dx`.
2. Why is the update `weight - learning_rate × gradient` and not `weight + learning_rate × gradient`?
3. What does a *large* gradient magnitude tell you about the current point on the loss curve?

<details><summary>Answers</summary>

1. `dy/dx = f'(g(x)) × g'(x)`
2. Because the gradient points in the direction of *increasing* loss; subtracting moves you toward *decreasing* loss.
3. The loss is changing steeply there — small changes in that weight currently have a big effect on the loss (as opposed to a near-zero gradient, which means you're near a flat spot).
</details>

---

## 4. The Matrix Transpose (and why backprop needs it)

**Another way to think about it:** if a matrix is a seating chart mapping "students" to "desks," the transpose is the *same information*, read as a chart mapping "desks" to "students" instead. Nothing about who's assigned to what changes — only which direction you're reading the relationship. Backprop needs the transpose because the forward pass reads "inputs → outputs," but propagating a gradient backward means reading the exact same relationship in reverse: "outputs → inputs."

**#hashtags:** `#matrixtranspose` `#linearalgebrabasics`

**Quick Test:**
1. If `A` has shape `(4, 16)`, what's the shape of `A.T`?
2. True or false: transposing a matrix changes its actual values, not just their arrangement.
3. Why does `gradient_wrt_output @ weight_matrix.T` produce a *shape-valid* result when `gradient_wrt_output @ weight_matrix` would not?

<details><summary>Answers</summary>

1. `(16, 4)`
2. False — same values, different arrangement (rows and columns swap).
3. Because the transpose's shape makes the inner dimensions match for that particular multiplication — going from output-shape back to input-shape requires the reversed-shape matrix.
</details>

---

## 5. Dense Layers, Compiling, and Training in Keras

**Another way to think about it:** a `Dense` layer is a group of independent "voters," each one looking at *all* the same inputs and forming its own opinion (weighted sum + activation). `compile()` isn't training — it's more like hiring a coach (`optimizer`) and agreeing on a scoring rubric (`loss`) before practice even starts. `fit()` is the actual practice — running drills (`epochs`), in small groups (`batch_size`), occasionally checking performance against players who sat out of practice (`validation_split`) so you know if the team is actually improving or just memorizing the specific drills.

**#hashtags:** `#kerastutorial` `#neuralnetworkbasics` `#denselayers` `#overfittingexplained`

**Quick Test:**
1. What's the difference in role between `loss` and `metrics` in `model.compile()`?
2. If training loss keeps dropping but validation loss starts rising, what's happening?
3. Why does the *first* `Dense` layer in a `Sequential` model need `input_shape`, but later layers don't?

<details><summary>Answers</summary>

1. `loss` is what the optimizer actually trains against (drives weight updates); `metrics` are just tracked/printed for your own monitoring and don't affect training.
2. Overfitting — the model is starting to memorize training-specific noise instead of the general pattern.
3. Every layer after the first can infer its input size from the previous layer's output size — only the very first layer has no "previous layer" to infer from.
</details>

---

## 6. Convolution and Pooling (CNNs)

**Another way to think about it:** imagine scanning a magnifying glass over a photo, checking a small patch at a time for a specific pattern (like "is there an edge here"), and writing down a score at each spot as you go — that grid of scores is a feature map. That's convolution. Pooling is then summarizing each little region of that score-grid down to its "loudest signal" (max pooling) — like skimming a long document down to just its highlighted sentences, keeping the important parts and dropping the exact wording.

**#hashtags:** `#convolutionalneuralnetwork` `#cnnexplained` `#imageprocessing` `#maxpooling`

**Quick Test:**
1. Why does a plain `Dense` layer scale badly to raw image input, in terms of parameter count?
2. What does a 2×2 max-pooling window with stride 2 do to a 4×4 feature map's shape?
3. What's the purpose of `Flatten()` in a CNN, and where does it typically sit in the architecture?

<details><summary>Answers</summary>

1. `Dense` connects every input pixel to every neuron — the parameter count explodes on image-sized inputs (e.g., 903,168 weights for one modest layer on a 7,056-pixel image).
2. Shrinks it to 2×2 (each output cell is the max of one non-overlapping 2×2 window).
3. Converts the 3D grid output of the convolutional layers into a 1D vector, since `Dense` layers expect flat input — sits right after the last `Conv2D`/pooling layer, before the `Dense` stack.
</details>

---

## 7. MDPs, the Bellman Equation, and Value Iteration

**Another way to think about it:** picture a treasure hunt where every room has a note saying "the treasure is worth more, the fewer rooms away it is." The Bellman equation is just that note, formalized: "this room's worth = what I get right now + a slightly discounted version of the next room's worth." Value iteration is the process of everyone in the maze shouting their room's current best-guess worth to their neighbors, over and over, until the numbers stop changing — the "the treasure's value ripples outward" idea from Lesson 6.

**#hashtags:** `#markovdecisionprocess` `#bellmanequation` `#valueiteration` `#reinforcementlearningbasics`

**Quick Test:**
1. What does "Markov property" mean, in your own words?
2. Why does a higher discount factor (`γ` closer to 1) make an agent care more about distant future rewards?
3. In value iteration's first pass, why does the *start* state typically not update to anything useful yet?

<details><summary>Answers</summary>

1. The current state alone contains everything needed to predict what happens next — no history beyond it is required.
2. Because `γ^n` shrinks more slowly for a high `γ`, so a reward `n` steps away retains more of its value when discounted back to the present.
3. Because information about the goal's reward hasn't propagated there yet — it only reaches neighboring cells first, and takes multiple passes to ripple all the way back to the start.
</details>

---

## 8. Q-Learning, SARSA, and Epsilon-Greedy

**Another way to think about it:** imagine two students studying for the same test using different note-taking styles. Q-learning always writes down "assuming I played the smartest possible move afterward" — even on days it was actually being reckless while exploring. SARSA writes down "here's what *actually* happened next, mistakes included." Off-policy vs. on-policy is really just "do you grade yourself against your best-possible-self, or your actual, sometimes-exploring self?"

**#hashtags:** `#qlearning` `#sarsa` `#epsilongreedy` `#temporaldifferencelearning`

**Quick Test:**
1. Write Q-learning's update rule from memory, and identify the one term that differs from SARSA's.
2. Why does epsilon typically start high and decay over training, rather than staying constant?
3. Is Q-learning on-policy or off-policy? Why?

<details><summary>Answers</summary>

1. `Q(s,a) = Q(s,a) + α[R + γ·max(Q(s',·)) − Q(s,a)]` — the `max(Q(s',·))` term is the differing piece; SARSA uses `Q(s',a')` for the action actually taken next instead.
2. High epsilon early lets the agent gather broad experience before it has any good estimates to exploit; decaying it lets the agent increasingly rely on what it's learned as those estimates become trustworthy.
3. Off-policy — its target always assumes optimal future play, regardless of the actual (possibly exploratory) policy being followed.
</details>

---

## 9. Gym's Environment Interface

**Another way to think about it:** think of a Gym environment as a very literal video game referee: you hand it a move (`step(action)`), and it hands back exactly four things — what the board looks like now, how many points you got, whether the game just ended, and whether it got cut off for hitting a time limit. `reset()` is just "rack 'em up again" for a new game.

**#hashtags:** `#openaigym` `#gymnasiumpython` `#reinforcementlearningenvironment`

**Quick Test:**
1. What are the five things `environment.step(action)` returns, and what does each one mean?
2. What's the practical difference between `terminated` and `truncated`?
3. Why can't a Q-*table* approach work on an environment with a `Box` (continuous) observation space?

<details><summary>Answers</summary>

1. `next_state, reward, terminated, truncated, info` — the resulting state, the reward for that step, whether the episode ended "naturally," whether it was cut off externally (e.g. step limit), and a debug-info dictionary.
2. `terminated` = a real ending condition was hit (won/lost/failed); `truncated` = cut off for an external reason (like a max-steps cap), not because the task itself ended.
3. Continuous values have infinitely many possible states — a table needs one entry per distinct state, so there's no finite table that could enumerate them (the curse of dimensionality).
</details>

---

## 10. DQN — Replay Buffer and Target Network

**Another way to think about it:** training a Q-network directly on live, in-order experience is like trying to study for a cumulative final by only ever reviewing whatever question you just got wrong a second ago — you'd overfit to your most recent mistake and forget everything else. The replay buffer is a shuffled flashcard deck built from *all* your past mistakes, so each study session pulls a random, varied mix. The target network is like grading yourself against last week's answer key instead of an answer key that changes while you're still writing — otherwise you're chasing a target that moves under you mid-update.

**#hashtags:** `#deepqlearning` `#dqn` `#experiencereplay` `#targetnetwork`

**Quick Test:**
1. Name the two specific instability problems DQN's two tricks each solve.
2. Why is the replay buffer sampled *randomly*, rather than in the order transitions were collected?
3. Why doesn't the target network's weights update every single training step?

<details><summary>Answers</summary>

1. Correlated sequential data (fixed by replay) and the moving-target problem (fixed by a separate, periodically-synced target network).
2. Random sampling breaks the correlation between consecutive, highly-similar states, giving training data that behaves more like the independent/shuffled data supervised learning expects.
3. Because if it updated every step, it would just be the online network again — the whole point is to hold the target steady for a while so training has something stable to aim at.
</details>

---

## 11. Double DQN, Dueling DQN, Prioritized Replay

**Another way to think about it:** Double DQN is "don't let the same, possibly-biased judge both nominate *and* score the winner" — split those two jobs across two slightly different judges (online picks, target scores) so one judge's lucky overestimate doesn't automatically become the accepted answer. Dueling DQN is separating "how good is this whole situation" from "how much better is this specific option than the others" — instead of re-deriving "this is a fine situation" from scratch for every single option separately. Prioritized replay is studying your *wrong* flashcards more often than the ones you already have down cold — but correcting for the fact that over-studying certain cards skews your overall practice distribution, using importance weights to compensate.

**#hashtags:** `#doubledqn` `#duelingdqn` `#prioritizedexperiencereplay` `#advancedreinforcementlearning`

**Quick Test:**
1. What's the one-line difference between vanilla DQN's and Double DQN's target calculation?
2. Write the Dueling DQN Q-value recombination formula, and explain why the mean-subtraction term is necessary.
3. What quantity does Prioritized Replay use as a sampling priority, and why does a small constant get added to it?

<details><summary>Answers</summary>

1. Vanilla: target network both selects (`max`) and evaluates the next action. Double DQN: online network selects, target network evaluates.
2. `Q(s,a) = V(s) + (A(s,a) − mean(A(s,·)))` — without the mean subtraction, the split between `V` and `A` is mathematically ambiguous (infinitely many combinations give the same `Q`), making the decomposition unstable to train.
3. The absolute TD error (`|target − current_estimate|`); a small constant is added so transitions with exactly zero error still have some nonzero chance of being sampled, instead of being permanently excluded.
</details>

---

## 12. Policy Gradients (REINFORCE) and Actor-Critic

**Another way to think about it:** value-based methods (DQN) are like a critic who rates every dish on a menu, then you just order whatever scored highest. Policy-based methods (REINFORCE) skip the rating system entirely — you directly adjust your *ordering habits* based on how the whole meal turned out, making dishes that led to a great meal more likely to be ordered again. Actor-Critic is hiring an actual food critic (the critic network) to give you a *running* opinion on each dish as you order it, instead of waiting until the whole meal is over to know if any of your choices were good — which is both faster feedback and less noisy, since the critic's baseline expectation cancels out "the restaurant itself was just mediocre today" from "that specific dish was a bad call."

**#hashtags:** `#policygradient` `#reinforcealgorithm` `#actorcritic` `#a2c`

**Quick Test:**
1. What does a policy network output, and how does that differ from what a DQN outputs?
2. Why is `G_t` (the return) normalized before being used in REINFORCE's training?
3. What does the "advantage" represent, and how does subtracting `V(s)` from the return reduce variance?

<details><summary>Answers</summary>

1. A probability distribution over actions (via softmax); DQN outputs one raw Q-value score per action, not a probability.
2. Raw returns vary wildly in scale across episodes, which makes training noisy; normalizing to mean 0, std 1 stabilizes the training signal.
3. `Advantage = G_t − V(s_t)` — "how much better did this action do than the state's baseline expectation." Subtracting the baseline removes state-to-state difficulty variation from the signal, isolating just the action-specific quality.
</details>

---

## 13. Continuous Control (DDPG)

**Another way to think about it:** DQN's `argmax` approach is like picking the best answer from a multiple-choice test — works great with a short list of options. DDPG is more like an essay question: instead of scoring a fixed list of pre-written answers, the actor *writes* its own answer directly (a continuous number), and the critic grades that specific essay. You can't "argmax" over infinitely many possible essays, so you need something that generates an answer directly instead of picking from a list.

**#hashtags:** `#ddpg` `#continuouscontrol` `#deepdeterministicpolicygradient` `#actorcriticmethods`

**Quick Test:**
1. Why can't `argmax` be used to choose actions in a continuous action space?
2. What does the critic take as input in DDPG, that's different from DQN's Q-network?
3. What's a "soft update" (Polyak averaging), and why does DDPG prefer it over DQN's hard periodic sync?

<details><summary>Answers</summary>

1. `argmax` requires enumerating every possible action to compare — impossible with infinitely many continuous values.
2. Both the state *and* a specific action (concatenated together) — DDPG's critic scores one specific state-action pair, rather than outputting a score per action from a fixed list.
3. Nudging target weights slightly toward the online network's weights every step (`τ × online + (1−τ) × target`), rather than fully overwriting periodically — gentler updates suit DDPG's continuous, differentiable structure, which is more sensitive to sudden target jumps than DQN's discrete setup.
</details>

---

## 14. Dash — Live Dashboards

**Another way to think about it:** a Dash app is a spreadsheet where certain cells are wired to automatically recalculate and redraw themselves whenever a specific trigger cell changes — the `Interval` component is a cell that quietly increments itself on a timer, and the `@app.callback` is the formula watching that cell, ready to recompute the chart the instant it ticks.

**#hashtags:** `#plotlydash` `#pythondashboard` `#datavisualization` `#livedashboard`

**Quick Test:**
1. What triggers a Dash callback to re-run?
2. What does `dcc.Interval` actually display on the page?
3. Why is a `threading.Lock()` needed when a background training thread and a Dash callback both touch the same shared data?

<details><summary>Answers</summary>

1. A change in the value of whatever component(s) are wired as its `Input(...)`.
2. Nothing visible — it's an invisible component that exists purely to tick on a timer and trigger callbacks.
3. To prevent a race condition — without it, the callback could read the shared data at the exact moment the training thread is mid-write, getting an inconsistent, half-updated snapshot.
</details>

---

## 15. ONNX Export and .NET Integration

**Another way to think about it:** ONNX is like translating a recipe from one language to a universal, standardized recipe card format that any kitchen (framework) can read — but if the original recipe assumed you'd pre-chop the vegetables in a specific way *before* even starting the recipe card, that prep step doesn't automatically translate unless you explicitly write it onto the card itself.

**#hashtags:** `#onnx` `#onnxruntime` `#mlnet` `#deploymachinelearningmodel`

**Quick Test:**
1. What does ONNX export faithfully carry over, and what does it *not* automatically carry over?
2. Why does a mismatched input tensor name between Python export and C# code typically fail loudly (an error) rather than silently (a wrong answer)?
3. What's the recommended fix (Option B) for the preprocessing gotcha, and why is it preferred over manually reimplementing preprocessing in C#?

<details><summary>Answers</summary>

1. Carries over the architecture and learned weights faithfully; does *not* carry over separate Python preprocessing code (like manual standardization) unless that logic is built into the model's own computational graph before export.
2. Because ONNX Runtime needs to match the exact named tensor to feed data in — an unrecognized name has nothing to match against, so it throws rather than guessing.
3. Add a `Normalization` layer (`.adapt()`'d on training data) directly into the Keras model before exporting, so standardization becomes part of the ONNX graph itself — removes the risk of the Python and C# versions drifting out of sync over time, since there's only one copy of the logic.
</details>

---

## A note on how to actually use the Quick Tests

Cover the answers, actually attempt every question — even the ones that feel obvious — before revealing them. A question you answer confidently and correctly needs nothing further. A question you get wrong, or can only half-answer, is telling you exactly where to spend five more minutes, which is a far more efficient use of review time than re-reading a whole lesson end to end. Come back to this whole document again in a few weeks, cold, without looking at your past answers — that gap is what actually makes spaced repetition work, not the first pass through it.
