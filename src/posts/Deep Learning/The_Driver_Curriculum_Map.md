# The Driver — Read This, Then Prove It, Then Move On

**What this file is:** the single ordered path through everything built so far. Don't read lessons in whatever order looks interesting — read them in the order below, and after each one, do the **Proof of Learning** task before moving to the next stop. These are different from the challenges inside each lesson: those check specific details; these check whether you could actually *use* the lesson's core idea on a fresh, un-hinted problem. If you can't do the Proof of Learning task without going back to look something up, that's real information — reread the lesson (or its section in the Concepts Reference) before advancing, don't push through.

**How to track progress:** check off each box as you clear its Proof of Learning task, not just when you finish reading.

---

## Part 0 — Orientation

- [ ] **Read:** `Lite_Intro_A_Python_Essentials.md`
  **Proof of Learning:** Without looking anything up, write one line of code using a list comprehension, one using `key=`, and one f-string with a format specifier — on data you make up yourself, not copied from the lesson.

- [ ] **Read:** `Lite_Intro_B_Math_Basics.md`
  **Proof of Learning:** Pick any two points on paper, compute the slope between them by hand, then explain in one sentence how that relates to what a derivative will mean in Lesson 10.

- [ ] **Read:** `Lite_Intro_C_Orientation_and_Motivation.md`
  **Proof of Learning:** No code for this one. Write, in your own words, one sentence on what problem the *manufacturing arc* specifically is going to let you solve — not "learn RL," the actual concrete thing.

---

## Part 1 — Foundations (Weeks 1-4)

- [ ] **Read:** `Lesson_01_Vectors_Matrices_NumPy.md`
  **Proof of Learning:** By hand, multiply a `(2,2)` matrix of your own choosing by another `(2,2)` matrix of your own choosing. Then verify with NumPy. Getting your own numbers right (not the lesson's) is the actual test.

- [ ] **Read:** `Lesson_02_NumPy_Deeper_and_Gym_Bridge.md`
  **Proof of Learning:** Write, from memory, a function that takes an array of action-scores and returns the chosen action using `argmax` — no peeking at Lesson 9's code first.

- [ ] **Read:** `Lesson_03_Pandas_Basics_and_Plotting.md`
  **Proof of Learning:** Plot any list of 10 numbers you make up, with a rolling average overlaid, fully from memory of the pattern — don't copy the practice file's code.

- [ ] **Read:** `Lesson_04_From_Scratch_Neuron_to_Keras.md`
  **Proof of Learning:** Given a `Dense(32, activation="relu", input_shape=(6,))` layer, calculate its parameter count by hand *before* running `.summary()` to check. Wrong answer = go re-read Section 2.

- [ ] **Read:** `Lesson_05_CNN_Basics_for_RL.md`
  **Proof of Learning:** In one paragraph, explain to an imaginary coworker why CartPole doesn't need a CNN but Breakout does — without saying "because one is pixels" as the whole answer; explain *why that specifically matters*.

- [ ] **Read:** `Lesson_06_MDPs_and_Bellman_Equation.md`
  **Proof of Learning:** Draw a tiny 2x2 grid of your own (not the lesson's 3x3), pick your own goal/trap cells, and compute one value-iteration update by hand for one cell.

- [ ] **Read:** `Lesson_07_Q_Learning_and_SARSA.md`
  **Proof of Learning:** Write the Q-learning and SARSA update rules side by side from memory, and circle the one term that differs.

- [ ] **Read:** `Lesson_08_Gym_and_Why_Tables_Break_Down.md`
  **Proof of Learning:** Explain, without notes, why a Q-table can't handle CartPole's state space, using the word "discretization" correctly in the explanation.

- [ ] **Read:** `Lesson_09_Deep_Q_Networks.md`
  **Proof of Learning:** Name DQN's two stability tricks and, for each, state the specific problem it fixes — from memory, no lesson open.

- [ ] **Read:** `Capstone_DQN_CartPole.md`
  **Proof of Learning:** Run the capstone file yourself, unmodified, start to finish, and screenshot or save the final training plot. This is the "prove the pipeline runs end to end on your machine" checkpoint — the whole rest of the series assumes this works.

---

## Part 2 — Deeper Math (Week 5)

- [ ] **Read:** `Lesson_10_Calculus_and_Backpropagation.md`
  **Proof of Learning:** Pick your own `x`, `w`, `b`, and `y_true` (different from the lesson's), and derive `d(loss)/dw` by hand. Verify with the numerical gradient check from the practice file.

- [ ] **Read:** `Lesson_11_Linear_Algebra_Transpose_Backprop.md`
  **Proof of Learning:** Write down, from memory, why `weight_matrix.T` (not `weight_matrix`) is needed to compute a gradient with respect to a layer's input — in terms of shapes, not just "because that's the rule."

---

## Part 3 — Advanced Value-Based RL (Week 6)

- [ ] **Read:** `Lesson_12_Double_and_Dueling_DQN.md`
  **Proof of Learning:** Explain Double DQN's fix in one sentence using the words "select" and "evaluate" — if you can't use both words correctly, reread Section 1.

- [ ] **Read:** `Lesson_13_Prioritized_Experience_Replay.md`
  **Proof of Learning:** Explain what would happen to sampling behavior if `PRIORITY_ALPHA` were set to `0`, and *why*, before checking against the lesson's Challenge 1 answer.

---

## Part 4 — Policy-Based RL (Week 7)

- [ ] **Read:** `Lesson_14_Policy_Gradients_REINFORCE.md`
  **Proof of Learning:** In your own words, explain why a policy network uses `softmax` + sampling instead of `argmax` — specifically what would be lost, not just "it's different."

- [ ] **Read:** `Lesson_15_Actor_Critic_A2C.md`
  **Proof of Learning:** Write the advantage formula from memory, and explain in one sentence why subtracting `V(s_t)` reduces variance compared to using raw `G_t`.

---

## Part 5 — Applied Skills and Final Capstone (Week 8)

- [ ] **Read:** `Lesson_16_CNN_DQN_Atari.md`
  **Proof of Learning:** Explain, without notes, why a single Atari frame breaks the Markov property, and name the fix.

- [ ] **Read:** `Lesson_17_Dash_Live_Dashboard.md`
  **Proof of Learning:** Build a tiny Dash app from scratch (not copy-pasted) with one `dcc.Graph`, one `dcc.Interval`, and one callback wiring them together, showing literally anything updating live.

- [ ] **Read:** `Final_Capstone_LunarLander_Dash.md`
  **Proof of Learning:** Run it. Watch at least 20 episodes update live in the dashboard before deciding whether to let the full run finish.

---

## Checkpoint — Refresher

- [ ] **Read:** `Refresher_Full_Series_Recall.md`
  **Proof of Learning:** This lesson *is* the proof-of-learning task — work through all 6 parts cold before reading any answer. Note which Parts felt shaky; reread those specific lessons before continuing to the manufacturing arc.

---

## Part 6 — Manufacturing Arc

- [ ] **Read:** `Lesson_18_Custom_CNC_Gym_Environment.md`
  **Proof of Learning:** Before running the sanity-check script, predict on paper roughly what fraction of random-action episodes you'd expect to end in `tool_broke`. Then run it and compare your prediction to reality.

- [ ] **Read:** `Lesson_19_DQN_on_CNC_Environment.md`
  **Proof of Learning:** After training, look at the learned average feed rate/spindle speed and write one sentence on whether it matches what you, with real machining knowledge, would consider a sane strategy — and if not, why not.

- [ ] **Read:** `Lesson_20_Predictive_Maintenance_Classification.md`
  **Proof of Learning:** Explain, without notes, why this problem is classification and not RL — using the words "agent," "action," and "reward" to explain what's *missing*, not just asserting the conclusion.

- [ ] **Read:** `Lesson_21_Combined_Digital_Twin_Dashboard.md`
  **Proof of Learning:** Identify, in your own words, the specific limitation the lesson calls out about both graphs being derived from the same underlying variable — and describe one concrete way real sensor data would break that artificial agreement.

---

## Part 7 — Extensions

- [ ] **Read:** `Lesson_22_DDPG_Continuous_Actions.md`
  **Proof of Learning:** Explain why `argmax` can't be used to choose a continuous action, in your own words, without using the word "infinite" as the entire explanation — say *why* infinite options specifically breaks the mechanism.

- [ ] **Read:** `Lesson_23_ONNX_Export_and_DotNet_Integration.md`
  **Proof of Learning:** Export any one trained model from this series to ONNX, load it in a bare C# console app, and successfully run one inference call end to end. A working `.onnx` file that loads and returns output in C# is the actual proof — nothing else in this whole series counts as "done" without this step working for at least one model.

---

## Reference — not sequential, use anytime

- **`Concepts_Reference_and_Self_Test.md`** — not a stop on the path. Pull this up any time a Proof of Learning task above fails and you need a second explanation before retrying.

---

## If a Proof of Learning task fails

Failing one isn't a setback, it's the system working — it caught a gap while it was still cheap to fix. The order is always: (1) try again after a short break, (2) check the matching section in the Concepts Reference for a different explanation, (3) only then reread the full original lesson. Do not advance to the next stop with a failed, unresolved Proof of Learning behind you — everything downstream assumes it.
