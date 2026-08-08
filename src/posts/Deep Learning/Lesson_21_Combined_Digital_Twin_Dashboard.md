# Lesson 21 — A Combined Digital-Twin Dashboard

**Track:** RL/Keras Mastery Arc — Manufacturing Application (closing lesson)
**Depth:** Integration — no new concepts, combining Lesson 17's Dash skills with Lessons 19 and 20's trained models into one operational view
**Goal by end of lesson:** A single live dashboard simulating a CNC operation, showing the trained DQN agent's real-time parameter decisions alongside the predictive maintenance classifier's live health assessment — the kind of combined operational picture a real shop-floor monitoring tool would aim for.

---

## 0. What this lesson is integrating, and why side by side

Lessons 19 and 20 solved genuinely different problems — one control (what parameters to choose), one classification (is this reading healthy) — using genuinely different techniques (DQN vs. supervised classification). A real manufacturing monitoring system would very plausibly want both views at once: what the optimization agent is currently doing, *and* an independent health signal cross-checking whether things still look normal. Putting them in one dashboard isn't just a UI exercise — it's modeling a real, sensible system architecture: two independently-trained models, each doing the job they're actually suited for (Lesson 20, Section 0's lesson, applied at the system-design level now instead of just the algorithm-choice level).

---

## 1. The simulation loop — driving both models together

This dashboard needs a background thread (Lesson 17, Section 4) that steps the CNC environment forward using the trained DQN agent, and at each step, also derives simulated sensor readings from the environment's internal state to feed the classifier — connecting Lesson 18's environment internals to Lesson 20's sensor-based model.

```python
def derive_simulated_sensors_from_environment(environment):
    """
    Bridges Lesson 18's environment state to Lesson 20's classifier input.
    In a real system, this would be actual sensor hardware; here, we derive
    plausible readings from the environment's own cutting_force/wear state,
    reusing the same relationships Lesson 20's simulated data was built around.
    """
    wear_progression = environment.accumulated_tool_wear   # already in [0, 1]-ish range
    vibration = 0.5 + 2.0 * wear_progression
    spindle_load = 0.4 + 1.5 * wear_progression
    temperature = 20 + 40 * wear_progression
    sound_frequency = 1000 + 500 * wear_progression
    return np.array([[vibration, spindle_load, temperature, sound_frequency]])
```

This function is the actual integration point of the whole lesson — everything else is Dash/threading mechanics you've already built in Lesson 17.

---

## 2. Complete runnable file — the combined dashboard

Save as `lesson_21_dashboard.py`, in the same directory as `cnc_environment.py`, `cnc_dqn_model.keras` (from Lesson 19), and make sure Lesson 20's classifier training code is available to import or re-run for a fresh model. This example retrains a small classifier at startup for simplicity, so it's self-contained.

```python
"""
Lesson 21: Combined digital-twin dashboard - DQN agent status + predictive maintenance classifier, live.
Run with: python lesson_21_dashboard.py, then open http://127.0.0.1:8050
(Requires: pip install dash; cnc_dqn_model.keras must exist from Lesson 19)
"""
import threading
import time

import numpy as np
from tensorflow import keras
from tensorflow.keras import layers
from dash import Dash, html, dcc, Output, Input
import plotly.graph_objects as go

from cnc_environment import CNCCuttingEnv, FEED_RATE_OPTIONS, SPINDLE_SPEED_OPTIONS

STEP_DELAY_SECONDS = 0.5   # slows the simulation down so it's actually watchable live

dashboard_state = {
    "step_count": 0,
    "remaining_length": 1.0,
    "tool_wear": 0.0,
    "cutting_force": 0.0,
    "feed_rate": 1.0,
    "spindle_speed": 1.0,
    "failure_probability": 0.0,
    "episode_count": 0,
    "wear_history": [],
    "failure_prob_history": []
}
state_lock = threading.Lock()


def build_and_train_quick_classifier():
    """Lesson 20, condensed - a fast retrain at startup so this file is self-contained."""
    rng = np.random.default_rng(42)
    num_samples = 1000
    wear_progression = rng.uniform(0, 1, size=num_samples)

    vibration = 0.5 + 2.0 * wear_progression + rng.normal(0, 0.3, size=num_samples)
    spindle_load = 0.4 + 1.5 * wear_progression + rng.normal(0, 0.25, size=num_samples)
    temperature = 20 + 40 * wear_progression + rng.normal(0, 5, size=num_samples)
    sound_frequency = 1000 + 500 * wear_progression + rng.normal(0, 80, size=num_samples)
    labels = (wear_progression > 0.7).astype(int)

    features = np.column_stack([vibration, spindle_load, temperature, sound_frequency])
    feature_mean = np.mean(features, axis=0)
    feature_std = np.std(features, axis=0)
    features_std = (features - feature_mean) / (feature_std + 1e-8)

    model = keras.Sequential([
        layers.Dense(16, activation="relu", input_shape=(4,)),
        layers.Dense(8, activation="relu"),
        layers.Dense(1, activation="sigmoid")
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy")
    model.fit(features_std, labels, epochs=20, batch_size=32, verbose=0)

    return model, feature_mean, feature_std


def derive_simulated_sensors_from_environment(environment):
    """Section 1 - bridges environment state to classifier input."""
    wear_progression = environment.accumulated_tool_wear
    vibration = 0.5 + 2.0 * wear_progression
    spindle_load = 0.4 + 1.5 * wear_progression
    temperature = 20 + 40 * wear_progression
    sound_frequency = 1000 + 500 * wear_progression
    return np.array([[vibration, spindle_load, temperature, sound_frequency]])


def run_simulation_in_background():
    environment = CNCCuttingEnv()
    dqn_agent = keras.models.load_model("cnc_dqn_model.keras")
    classifier, feature_mean, feature_std = build_and_train_quick_classifier()

    while True:
        state, info = environment.reset()
        with state_lock:
            dashboard_state["episode_count"] += 1
            dashboard_state["wear_history"] = []
            dashboard_state["failure_prob_history"] = []

        done = False
        while not done:
            q_values = dqn_agent.predict(state.reshape(1, -1), verbose=0)[0]
            action = int(np.argmax(q_values))

            feed_index = action // len(SPINDLE_SPEED_OPTIONS)
            speed_index = action % len(SPINDLE_SPEED_OPTIONS)

            next_state, reward, terminated, truncated, info = environment.step(action)
            done = terminated or truncated

            raw_sensors = derive_simulated_sensors_from_environment(environment)
            standardized_sensors = (raw_sensors - feature_mean) / (feature_std + 1e-8)
            failure_probability = float(classifier.predict(standardized_sensors, verbose=0)[0][0])

            with state_lock:
                dashboard_state["step_count"] += 1
                dashboard_state["remaining_length"] = environment.remaining_length
                dashboard_state["tool_wear"] = environment.accumulated_tool_wear
                dashboard_state["cutting_force"] = environment.current_cutting_force
                dashboard_state["feed_rate"] = FEED_RATE_OPTIONS[feed_index]
                dashboard_state["spindle_speed"] = SPINDLE_SPEED_OPTIONS[speed_index]
                dashboard_state["failure_probability"] = failure_probability
                dashboard_state["wear_history"].append(environment.accumulated_tool_wear)
                dashboard_state["failure_prob_history"].append(failure_probability)

            state = next_state
            time.sleep(STEP_DELAY_SECONDS)


app = Dash(__name__)

app.layout = html.Div([
    html.H1("CNC Digital Twin — Live Monitoring"),
    html.Div(id="status-summary", style={"fontSize": "18px", "marginBottom": "20px"}),
    html.Div([
        html.Div([dcc.Graph(id="wear-graph")], style={"width": "48%", "display": "inline-block"}),
        html.Div([dcc.Graph(id="failure-prob-graph")], style={"width": "48%", "display": "inline-block"}),
    ]),
    dcc.Interval(id="update-timer", interval=500, n_intervals=0)
])


@app.callback(
    Output("status-summary", "children"),
    Output("wear-graph", "figure"),
    Output("failure-prob-graph", "figure"),
    Input("update-timer", "n_intervals")
)
def update_dashboard(n_intervals):
    with state_lock:
        snapshot = dict(dashboard_state)

    status_lines = [
        f"Episode: {snapshot['episode_count']} | Step: {snapshot['step_count']}",
        f"Feed rate: {snapshot['feed_rate']:.2f}x | Spindle speed: {snapshot['spindle_speed']:.2f}x",
        f"Remaining pass length: {snapshot['remaining_length']:.2%} | "
        f"Cutting force: {snapshot['cutting_force']:.2f}",
        f"Predicted failure probability: {snapshot['failure_probability']:.1%}"
    ]
    status_text = html.Div([html.P(line) for line in status_lines])

    wear_figure = go.Figure()
    wear_figure.add_trace(go.Scatter(y=snapshot["wear_history"], mode="lines", name="Tool wear"))
    wear_figure.update_layout(title="Accumulated Tool Wear (this episode)",
                                xaxis_title="Step", yaxis_title="Wear", yaxis=dict(range=[0, 1.2]))

    failure_prob_figure = go.Figure()
    failure_prob_figure.add_trace(go.Scatter(y=snapshot["failure_prob_history"], mode="lines",
                                                name="Failure probability", line=dict(color="red")))
    failure_prob_figure.update_layout(title="Classifier: Failure Probability (this episode)",
                                        xaxis_title="Step", yaxis_title="Probability",
                                        yaxis=dict(range=[0, 1]))

    return status_text, wear_figure, failure_prob_figure


if __name__ == "__main__":
    simulation_thread = threading.Thread(target=run_simulation_in_background, daemon=True)
    simulation_thread.start()

    app.run(debug=True, use_reloader=False)
```

**What to watch for:** the two right-hand-side graphs should track each other reasonably closely — tool wear climbing should correspond to the classifier's failure probability climbing too, since Section 1's sensor-derivation function was deliberately built from the same relationships Lesson 20's classifier was trained on. **This tight correlation is itself worth noticing as a limitation**, not just a success: because both signals are derived from the same simplified `accumulated_tool_wear` variable, this dashboard can't currently demonstrate a case where the two views *disagree* — which is exactly the scenario a real independent-sensor cross-check would be most valuable for catching (e.g., a sensor malfunction, or a wear pattern the RL environment's simplified physics doesn't capture but a real vibration sensor would). Worth sitting with as an honest limitation of the simulation rather than glossing over it.

---

## 3. Final challenges for the manufacturing arc

1. Modify `derive_simulated_sensors_from_environment` to occasionally inject a burst of anomalous sensor noise, independent of `accumulated_tool_wear` (e.g., a random spike in vibration unrelated to actual wear). Watch how the two graphs diverge when this happens — this is the "disagreement" scenario Section 2's limitation note described, made concrete.
2. Add a third graph or status line showing the DQN agent's *chosen* action's Q-value versus the *average* Q-value across all 25 actions (Lesson 12's Dueling architecture makes both values easy to extract) — a rough live indicator of how confident the agent is in its current choice, versus how close the alternatives are.
3. Reflect honestly, referencing Lesson 18's process-model caveats and Lesson 20's simulated-data caveats: what specifically would need to be true — in terms of real data, validated physics, and testing — before a system built this way could reasonably be trusted anywhere near an actual running machine? This isn't a coding exercise; it's the professional judgment question that actually matters most for any of this work eventually leaving a simulation.

---

## Manufacturing arc complete

Four lessons — a custom environment built from your own domain knowledge, a control agent trained on it, an independent classifier solving a genuinely different kind of problem, and both combined into one live monitoring view. Every piece traces back through the full 21-lesson series: the vectors from Lesson 1, the Bellman equation from Lesson 6, the Dueling architecture from Lesson 12, the Dash callbacks from Lesson 17 — applied, finally, to something adjacent to your actual work rather than a textbook game.

The honest note to close on, echoing Challenge 3 above: everything here is a simulation built on deliberately simplified models, and that gap between "working simulation" and "trustworthy real-world system" is real, non-trivial, and worth respecting — but it's also exactly the kind of gap that real ML engineering work spends most of its time closing, and you're now positioned to actually do that work rather than just read about it.
