# Lesson 17 — Dash: A Live Training Dashboard

**Track:** RL/Keras Mastery Arc — Week 8
**Depth:** Heavy — a new library, though the underlying data you're visualizing is entirely familiar
**Goal by end of lesson:** You can build a Dash app that displays live-updating charts, and specifically one that visualizes an RL agent's training in real time — reward curve, epsilon decay, episode counter — instead of only ever looking at a static plot after training finishes.

---

## 0. Why this lesson, and why now

Every training curve so far (Lessons 3, 9, 12-16) has been a single `plt.show()` call *after* training completed. That's fine for understanding an algorithm, but it's not how you'd actually monitor a longer training run in practice — you'd want to watch progress live, without waiting for the whole thing to finish before seeing whether it's working. Dash (built by the makers of Plotly) is a Python library for building interactive web dashboards without needing to write separate frontend code — you build the whole thing in Python, and it renders as a real webpage you can watch update live in your browser.

---

## 1. Setup

```
pip install dash
```

```python
from dash import Dash, html, dcc

app = Dash(__name__)

app.layout = html.Div([
    html.H1("My First Dashboard"),
    html.P("This is a paragraph of text.")
])

if __name__ == "__main__":
    app.run(debug=True)
```

Run this, then open `http://127.0.0.1:8050` in a browser. `html.Div`, `html.H1`, `html.P` are Dash's Python wrappers around ordinary HTML elements — `html.H1("text")` produces an `<h1>text</h1>` tag, and so on. You're writing what's structurally a webpage, entirely in Python.

---

## 2. Adding a chart

```python
from dash import Dash, html, dcc
import plotly.graph_objects as go

app = Dash(__name__)

episode_rewards = [12, 45, 8, 60, 33, 71, 15, 80, 42, 90]

figure = go.Figure()
figure.add_trace(go.Scatter(y=episode_rewards, mode="lines", name="Reward"))
figure.update_layout(title="Reward per Episode", xaxis_title="Episode", yaxis_title="Reward")

app.layout = html.Div([
    html.H1("Training Dashboard"),
    dcc.Graph(figure=figure)
])

if __name__ == "__main__":
    app.run(debug=True)
```

`dcc.Graph` renders a Plotly figure — the same conceptual chart as Lesson 3's `plt.plot`, just interactive (you can hover over points, zoom, pan in the browser) and embedded in a real webpage instead of a static matplotlib window. `go.Scatter(y=..., mode="lines")` is Plotly's equivalent of `plt.plot(...)`.

---

## 3. Making it live — callbacks and intervals

A static chart isn't the point — you want the chart to **update automatically** as training progresses, without manually re-running anything. Dash does this with a **callback**: a Python function that re-runs automatically, triggered by some event (here, a timer), and returns updated content for part of the page.

```python
from dash import Dash, html, dcc, Output, Input
import plotly.graph_objects as go

app = Dash(__name__)

app.layout = html.Div([
    html.H1("Live Training Dashboard"),
    dcc.Graph(id="reward-graph"),
    dcc.Interval(id="update-timer", interval=1000, n_intervals=0)   # fires every 1000ms = 1 second
])

@app.callback(
    Output("reward-graph", "figure"),
    Input("update-timer", "n_intervals")
)
def update_graph(n_intervals):
    # In a real training script, this would read the LATEST rewards collected so far
    current_rewards = get_latest_rewards()   # placeholder - defined in Section 4

    figure = go.Figure()
    figure.add_trace(go.Scatter(y=current_rewards, mode="lines", name="Reward"))
    figure.update_layout(title="Reward per Episode (live)", xaxis_title="Episode", yaxis_title="Reward")
    return figure

if __name__ == "__main__":
    app.run(debug=True)
```

Reading the pieces:
- **`dcc.Interval(interval=1000, n_intervals=0)`** — an invisible component that "ticks" every 1000 milliseconds, incrementing `n_intervals` each time. It doesn't display anything itself; it exists purely to trigger callbacks on a schedule.
- **`@app.callback(Output(...), Input(...))`** — this decorator wires a function to Dash's reactive system: whenever the `Input` (here, `n_intervals` ticking up) changes, the decorated function re-runs, and whatever it `return`s becomes the new value of the `Output` (here, the graph's `figure` property). This Input/Output wiring is the entire mechanism Dash apps are built from — everything more complex is just more of this same pattern, chained together.
- **`id="reward-graph"`** — every component that participates in a callback needs an `id`, so `Output`/`Input` know exactly which component to read from or write to.

---

## 4. Connecting this to a real training run

The tricky part in practice: your training loop (Lesson 9/12-16) and your Dash app need to share data, while training runs in one process and Dash serves the webpage in what's effectively another. The simplest approach for a single-machine setup: run training in a background thread, and have it write into a shared, thread-safe data structure that the Dash callback reads from.

```python
import threading
import time

# Shared training state - the training thread writes to this, Dash callbacks read from it
training_state = {
    "episode_rewards": [],
    "current_epsilon": 1.0,
    "current_episode": 0
}
state_lock = threading.Lock()   # prevents the two threads from reading/writing at exactly the same instant


def get_latest_rewards():
    with state_lock:
        return list(training_state["episode_rewards"])   # a copy, so the training thread can keep mutating safely


def run_training_in_background():
    """A stand-in for Lesson 9's run_dqn_training(), adapted to update the shared state."""
    epsilon = 1.0
    for episode in range(150):
        # ... real training logic would go here (Lesson 9's full loop) ...
        fake_reward = min(200, episode * 1.3 + (episode % 7) * 5)   # placeholder trend for demonstration
        epsilon = max(0.05, epsilon * 0.98)

        with state_lock:
            training_state["episode_rewards"].append(fake_reward)
            training_state["current_epsilon"] = epsilon
            training_state["current_episode"] = episode + 1

        time.sleep(0.3)   # simulates the time real training would take per episode


training_thread = threading.Thread(target=run_training_in_background, daemon=True)
training_thread.start()
```

`threading.Lock()` is the key safety mechanism here: without it, the training thread could be in the middle of appending to `episode_rewards` at the exact moment a Dash callback tries to read it, risking a race condition (reading a half-updated, inconsistent state). `with state_lock:` ensures only one thread touches `training_state` at a time — a genuinely important pattern any time two parts of a program share mutable data across threads, not just specific to Dash.

---

## 5. Complete runnable file — a full live dashboard with simulated training

Save as `lesson_17_practice.py` and run with `python lesson_17_practice.py`, then open `http://127.0.0.1:8050`. This uses simulated training data (Section 4's placeholder) so the dashboard mechanics can be verified quickly, without waiting on a real multi-minute CartPole run — swapping in Lesson 9's actual training loop instead of the placeholder is Challenge 1 below.

```python
"""
Lesson 17 Practice: A live-updating Dash dashboard for RL training.
Run with: python lesson_17_practice.py, then open http://127.0.0.1:8050
(Requires: pip install dash)
"""
import threading
import time

from dash import Dash, html, dcc, Output, Input
import plotly.graph_objects as go

training_state = {
    "episode_rewards": [],
    "current_epsilon": 1.0,
    "current_episode": 0,
    "total_episodes": 150
}
state_lock = threading.Lock()


def run_training_in_background():
    """Placeholder training loop - swap this for Lesson 9's real run_dqn_training() (Challenge 1)."""
    epsilon = 1.0
    for episode in range(training_state["total_episodes"]):
        fake_reward = min(200, episode * 1.3 + (episode % 7) * 5)
        epsilon = max(0.05, epsilon * 0.98)

        with state_lock:
            training_state["episode_rewards"].append(fake_reward)
            training_state["current_epsilon"] = epsilon
            training_state["current_episode"] = episode + 1

        time.sleep(0.3)


app = Dash(__name__)

app.layout = html.Div([
    html.H1("RL Training Dashboard"),
    html.Div(id="status-text"),
    dcc.Graph(id="reward-graph"),
    dcc.Graph(id="epsilon-graph"),
    dcc.Interval(id="update-timer", interval=500, n_intervals=0)
])


@app.callback(
    Output("status-text", "children"),
    Output("reward-graph", "figure"),
    Output("epsilon-graph", "figure"),
    Input("update-timer", "n_intervals")
)
def update_dashboard(n_intervals):
    with state_lock:
        rewards = list(training_state["episode_rewards"])
        epsilon = training_state["current_epsilon"]
        episode = training_state["current_episode"]
        total = training_state["total_episodes"]

    status_text = f"Episode {episode} / {total} | Current epsilon: {epsilon:.3f}"

    reward_figure = go.Figure()
    reward_figure.add_trace(go.Scatter(y=rewards, mode="lines", name="Reward"))
    if len(rewards) >= 10:
        rolling_avg = [
            sum(rewards[max(0, i - 9):i + 1]) / len(rewards[max(0, i - 9):i + 1])
            for i in range(len(rewards))
        ]
        reward_figure.add_trace(go.Scatter(y=rolling_avg, mode="lines", name="Rolling avg (10)"))
    reward_figure.update_layout(title="Reward per Episode (live)", xaxis_title="Episode", yaxis_title="Reward")

    epsilon_figure = go.Figure()
    epsilon_figure.add_trace(go.Scatter(y=[epsilon], mode="markers",
                                          marker=dict(size=20), name="Current epsilon"))
    epsilon_figure.update_layout(title="Current Epsilon", yaxis=dict(range=[0, 1]))

    return status_text, reward_figure, epsilon_figure


if __name__ == "__main__":
    training_thread = threading.Thread(target=run_training_in_background, daemon=True)
    training_thread.start()

    app.run(debug=True, use_reloader=False)   # use_reloader=False avoids double-starting the training thread
```

**A note on `use_reloader=False`:** Dash's `debug=True` normally restarts the app automatically on code changes, which would also restart (and duplicate) the background training thread. Disabling the reloader avoids that specific conflict — worth knowing since it's a genuinely common gotcha when combining Dash with a background thread, not obvious from the error messages alone if you hit it unprepared.

---

## 6. Challenges before the final capstone

1. Replace `run_training_in_background`'s placeholder loop with Lesson 9's actual `run_dqn_training` logic (or Lesson 12/13's improved versions), updating `training_state` after each episode instead of returning a list at the end. Watch a real CartPole DQN agent train live in the dashboard.
2. Add a third `dcc.Graph` showing steps-survived-per-episode alongside reward — you'll need `run_training_in_background` to also track and share that value through `training_state`.
3. Change `dcc.Interval(interval=500, ...)` to `interval=5000` (5 seconds instead of 500ms) and observe the difference. What's the tradeoff between a very short interval (frequent updates) and a longer one, both in terms of visual smoothness and in terms of load on the browser/server?
4. `training_state` and `state_lock` are plain global variables here — fine for a single local dashboard, but explain in your own words why this specific approach (shared mutable global state with a lock) wouldn't scale cleanly to a dashboard meant to be viewed by multiple people on different machines simultaneously.

---

## What's next

The final capstone pulls everything from all 8 weeks together: a harder environment than CartPole (LunarLander), a real DQN or A2C agent (your choice, using any of the variants from Weeks 6-7), visualized live through this lesson's Dash dashboard. Say the word when you're ready.
