# Curriculum Notes — Integrated AI & Reinforcement Learning Engineering Track

Working notes for whoever writes or edits lessons next (human or AI) —
the *why* behind this course that isn't itself part of any single
lesson, so a later session doesn't quietly drift back toward a weaker
version of this plan.

## Why this course exists

The user has two books to work through — *Deep Learning with Keras*
and *Applied Reinforcement Learning with Python (OpenAI Gym, TensorFlow,
Keras)* — and knows nothing about the field yet beyond basic Python
(variables, functions, loops, lists, dictionaries). Two upcoming
courses will assume familiarity with this material; the books
themselves don't teach from first principles. This track exists to
close that gap completely before either book or course is opened,
using the exact teaching discipline already proven in this repo's
`track-beginner` course (see `src/docs/reference/LESSON_CONTRACT.md`
and `LESSON SCHEMA.md` — both govern this course too, unchanged).

## Starting knowledge assumed — the floor, stated once

Variables, functions, loops, lists, dictionaries, basic Python syntax.
Nothing else. No NumPy, no OOP, no math beyond arithmetic, no ML
vocabulary of any kind. Every lesson in this course must hold to this
floor the same way `track-beginner` holds to "Python basics, zero
Java/Android" — a concept used without having been taught first is a
contract violation, not a shortcut.

## The organizing rule, in the user's own words

> Nothing is taught before something needs it. Every lesson unlocks the
> next lesson.

This is the same principle `LESSON_CONTRACT.md` already states for
`track-beginner` ("if something appears in a lesson, it is taught at
the moment it appears") — applied here across a much wider span of
domains: Python language features, NumPy, pandas, matplotlib,
statistics, linear algebra, calculus, scikit-learn, TensorFlow, Keras,
and reinforcement learning, all treated as one continuous track with no
lesson titled "Learn NumPy" or "Learn Calculus" in isolation. A concept
is introduced exactly at the point the running project cannot progress
without it, motivated by a real, felt limitation of what came before —
never introduced because a syllabus scheduled it.

## The full 33-lesson plan, as given by the user

Seven arcs, building one continuous project (a house-price predictor,
then a from-scratch neural network, then a from-scratch RL agent) —
not seven separate projects:

- **Arc 1 — Programs That Understand Data** (Lessons 1–4): read a real
  CSV, filter it, hit Python's performance ceiling and adopt NumPy,
  visualize with pandas/matplotlib.
- **Arc 2 — Teaching Programs to Predict** (Lessons 5–9): hand-written
  rules fail, nearest-neighbor prediction, classes emerge because
  functions stop scaling, inheritance/ABCs/polymorphism emerge because
  multiple models need one interface, dataclasses emerge because
  configuration gets unwieldy.
- **Arc 3 — Learning Instead of Memorizing** (Lessons 10–13): linear
  models, matrices (multiple features), gradient descent, the calculus
  (derivatives, partial derivatives, gradients) behind why it works.
- **Arc 4 — Professional ML** (Lessons 14–16): scikit-learn replaces
  the hand-built algorithm, overfitting/train-test/validation,
  decision trees / random forests / logistic regression / SVM as
  drop-in alternatives.
- **Arc 5 — Neural Networks** (Lessons 17–22): perceptron/neuron/
  activation, a hand-built network with forward propagation only,
  backpropagation (chain rule), TensorFlow (once hand-rolled training
  loops hurt enough), Keras (once raw TensorFlow feels too verbose),
  then a review of inheritance/composition using real Keras classes
  already in use.
- **Arc 6 — Better Networks** (Lessons 23–25): CNNs for images, RNN/
  LSTM for sequences, the practical training toolkit (dropout, batch
  norm, callbacks, early stopping, TensorBoard).
- **Arc 7 — Reinforcement Learning** (Lessons 26–33): a fresh project
  (an OpenAI Gym game), state/action/reward/episode/policy vocabulary,
  a random-action baseline, Q-tables, real Q-learning, DQN (reusing the
  neural network machinery from Arc 5 for function approximation),
  Double DQN / Dueling Networks, policy gradients / Actor-Critic, PPO.

Full lesson-by-lesson detail (what's built, what's introduced, in what
order) is preserved in the user's original message in this session's
transcript — re-derive lesson scope from that, not from memory, when
writing each lesson; this file intentionally doesn't re-transcribe
every line of it to avoid the two copies silently drifting apart.

## Governing documents

`LESSON_CONTRACT.md` + `LESSON SCHEMA.md` (both in `src/docs/reference/`)
govern every lesson file in this course — the same Concept Lab
isolation, Recursive Concept Extraction, Glossary Rule, and
explain-don't-describe discipline already proven on `track-beginner`.
`scripts/check-narrative-lessons.mjs` currently only targets
`track-beginner` and `pocket-inventory-wpf` by default (see its own
`DEFAULT_FOLDERS` constant) — run it explicitly against this folder's
path once lessons exist here
(`node scripts/check-narrative-lessons.mjs src/docs/projects/ai-rl-track`),
and consider adding this folder to the script's own defaults once the
course is far enough along to be worth linting by default.

## Verification standard

Every code example in this course is real, runnable Python — verified
by actually executing it this session (`python3`), the same standard
already applied throughout `track-beginner` for Java (`javac`/`java`).
Later lessons need real packages (NumPy, pandas, matplotlib, scikit-
learn, TensorFlow, Keras, OpenAI Gym) — install and verify each one for
real, the same session it's first used in a lesson, rather than writing
expected output from memory.

## Pacing

Built one lesson at a time, each one reviewed before the next starts —
the same cadence the user set for `track-beginner`'s remaining lessons
this session, applied here from the start rather than learned the hard
way a second time.

## Shared project data

`houses.csv`, in this folder, is the running dataset Arc 1–4 builds
against (house price prediction) — real-shaped but small, synthetic
data, not sourced from any actual real-estate dataset. Arc 5 onward
introduces its own data as each lesson needs it (image data for CNNs,
text for RNNs, a Gym environment for RL) rather than continuing to
force the house dataset into domains it doesn't fit.
