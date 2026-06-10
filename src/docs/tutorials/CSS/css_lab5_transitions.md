# CSS Masterclass — Lab 5
## Transitions and Animations: Making UI Feel Alive

---

**What this lab is about.**

A UI without transitions feels like a light switch — binary, abrupt, cheap.
A UI with the right transitions feels like a physical object — things open,
close, appear, and respond with weight and intention.

The wrong transitions make it feel sluggish and annoying. The right ones
are almost invisible — you only notice them when they're gone.

This lab teaches you both: how to write transitions and animations, and more
importantly, the judgment of when to use them and how long they should be.

Create `transitions.html`. Build it up through the lab.

---

## Part 1 — The HTML first, no styles

Type this. Save. Open in the browser and look at it unstyled.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Transitions and Animations</title>
</head>
<body>

  <h1>Transitions and Animations</h1>

  <!-- Experiment 1: Basic transition -->
  <section id="exp-1">
    <h2>Experiment 1 — The basic transition</h2>
    <div class="btn-row">
      <button class="btn-no-transition">No transition</button>
      <button class="btn-with-transition">With transition</button>
    </div>
  </section>

  <!-- Experiment 2: What you can transition -->
  <section id="exp-2">
    <h2>Experiment 2 — Transitionable properties</h2>
    <div class="prop-demos">
      <button class="demo-color">Color</button>
      <button class="demo-bg">Background</button>
      <button class="demo-size">Size</button>
      <button class="demo-border">Border</button>
      <button class="demo-shadow">Shadow</button>
      <button class="demo-transform">Transform</button>
      <button class="demo-opacity">Opacity</button>
    </div>
  </section>

  <!-- Experiment 3: Timing functions -->
  <section id="exp-3">
    <h2>Experiment 3 — Timing functions (the feel)</h2>
    <div class="timing-demos">
      <div class="timing-row">
        <span class="timing-label">linear</span>
        <div class="timing-track">
          <div class="timing-ball" id="ball-linear"></div>
        </div>
      </div>
      <div class="timing-row">
        <span class="timing-label">ease (default)</span>
        <div class="timing-track">
          <div class="timing-ball" id="ball-ease"></div>
        </div>
      </div>
      <div class="timing-row">
        <span class="timing-label">ease-in</span>
        <div class="timing-track">
          <div class="timing-ball" id="ball-ease-in"></div>
        </div>
      </div>
      <div class="timing-row">
        <span class="timing-label">ease-out</span>
        <div class="timing-track">
          <div class="timing-ball" id="ball-ease-out"></div>
        </div>
      </div>
      <div class="timing-row">
        <span class="timing-label">ease-in-out</span>
        <div class="timing-track">
          <div class="timing-ball" id="ball-ease-in-out"></div>
        </div>
      </div>
      <div class="timing-row">
        <span class="timing-label">cubic-bezier</span>
        <div class="timing-track">
          <div class="timing-ball" id="ball-cubic"></div>
        </div>
      </div>
    </div>
    <button id="run-timing">Run all</button>
  </section>

  <!-- Experiment 4: Panel slide open -->
  <section id="exp-4">
    <h2>Experiment 4 — Panel that slides open</h2>
    <button id="toggle-panel">Toggle Panel</button>
    <div class="slide-panel" id="slide-panel">
      <div class="slide-panel-inner">
        <p>This panel slides open and closed.</p>
        <p>The height animates from 0 to its natural height.</p>
        <p>This is how collapsible sections work.</p>
      </div>
    </div>
  </section>

  <!-- Experiment 5: Toolbar button states -->
  <section id="exp-5">
    <h2>Experiment 5 — Toolbar button states</h2>
    <div class="toolbar-demo">
      <button class="tool-btn" title="Select">V</button>
      <button class="tool-btn" title="Line">L</button>
      <button class="tool-btn active" title="Arc">A</button>
      <button class="tool-btn" title="Circle">C</button>
      <div class="tool-sep"></div>
      <button class="tool-btn" title="Measure">M</button>
    </div>
  </section>

  <!-- Experiment 6: Loading spinner -->
  <section id="exp-6">
    <h2>Experiment 6 — Loading spinner (CSS keyframe animation)</h2>
    <div class="spinner-row">
      <div class="spinner"></div>
      <span>Generating toolpath...</span>
    </div>
  </section>

  <!-- Experiment 7: Notification toast -->
  <section id="exp-7">
    <h2>Experiment 7 — Toast notification slides in</h2>
    <button id="show-toast">Show notification</button>
    <div class="toast" id="toast">
      <span class="toast-icon">✓</span>
      G-code generated — 847 lines
    </div>
  </section>

  <!-- Experiment 8: The active/pressed feel -->
  <section id="exp-8">
    <h2>Experiment 8 — Button press feel</h2>
    <div class="btn-row">
      <button class="press-btn">Click me</button>
      <button class="press-btn accent">Generate G-code</button>
    </div>
  </section>

</body>
</html>
```

Save and open. Plain unstyled HTML. Buttons, text, empty divs. You know the
drill — this is the baseline before any CSS touches it.

---

## Part 2 — Base styles

Add `<style>` in the `<head>`. Add each group, save, and refresh.

**Step 1 — Reset and body. Save.**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0d0d1a;
  color: #c0c0d8;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  padding: 40px;
}
```

**Step 2 — Headings and sections. Save.**

```css
h1 {
  font-size: 20px;
  color: #8899cc;
  margin-bottom: 40px;
}

h2 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #445566;
  margin-bottom: 16px;
}

section {
  margin-bottom: 60px;
}
```

**Step 3 — Button base. Save.**

```css
button {
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}

.btn-row {
  display: flex;
  gap: 12px;
}
```

---

## Part 3 — The basic transition

A transition tells an element how to change smoothly between two states.
Without a transition, any CSS change is instant. With a transition, it
animates over a duration you define.

Add the two comparison buttons. Save after each step.

**Step 1 — Style both buttons the same. Save.**

```css
.btn-no-transition,
.btn-with-transition {
  padding: 10px 24px;
  background: #1a1a3e;
  border: 1px solid rgba(51, 119, 255, 0.3);
  border-radius: 5px;
  color: #6688cc;
}

.btn-no-transition:hover,
.btn-with-transition:hover {
  background: #2a2a5e;
  border-color: rgba(51, 119, 255, 0.7);
  color: #aabbee;
}
```

Hover over both buttons. The change is identical and instant — abrupt, snapping
immediately from one state to the other.

**Step 2 — Add a transition to one of them. Save.**

```css
.btn-with-transition {
  transition: background 160ms ease,
              border-color 160ms ease,
              color 160ms ease;
}
```

Now hover over both. The left button still snaps. The right one fades smoothly
over 160 milliseconds. The transition makes it feel like a physical response
instead of a Boolean flip.

The `transition` property takes a list of:
`property  duration  timing-function  delay`

You can transition multiple properties by separating them with commas. Or use
`transition: all 160ms ease` to transition everything — but avoid that in
practice. Transitioning `all` can cause unexpected animation of properties
you did not intend to animate (like `width` when content changes).

---

## Part 4 — Duration: the most important decision

The duration you choose changes the character of the UI entirely.

A common mistake: making transitions too long. Long transitions feel sluggish.
The user clicked something — they want a response, not a slow reveal.

**Guidelines for application UI:**

- `80ms` — instant feedback, barely perceptible. Use for button press responses.
- `160ms` — the sweet spot for hover effects. Fast but visible.
- `240ms` — noticeable, feels deliberate. Use for panels expanding.
- `320–400ms` — slow, dramatic. Use sparingly for overlays and modals.
- Anything over `400ms` — feels broken in a tool application. Do not use.

Compare by adding three buttons temporarily:

```html
<!-- Add inside exp-1 section temporarily -->
<div class="btn-row" style="margin-top: 12px;">
  <button class="dur-80">80ms</button>
  <button class="dur-160">160ms</button>
  <button class="dur-400">400ms</button>
  <button class="dur-1000">1000ms — too slow</button>
</div>
```

```css
.dur-80, .dur-160, .dur-400, .dur-1000 {
  padding: 10px 20px;
  background: #1a1a3e;
  border: 1px solid rgba(51,119,255,0.3);
  border-radius: 5px;
  color: #6688cc;
}

.dur-80:hover    { background: #3377ff; color: white; }
.dur-160:hover   { background: #3377ff; color: white; }
.dur-400:hover   { background: #3377ff; color: white; }
.dur-1000:hover  { background: #3377ff; color: white; }

.dur-80    { transition: background 80ms ease,   color 80ms ease; }
.dur-160   { transition: background 160ms ease,  color 160ms ease; }
.dur-400   { transition: background 400ms ease,  color 400ms ease; }
.dur-1000  { transition: background 1000ms ease, color 1000ms ease; }
```

Hover over each one. Feel the difference. The 80ms one feels snappy and
responsive. The 160ms one feels smooth. The 400ms one starts to feel like
you are waiting. The 1000ms one feels broken.

For the CAM application, almost every transition is 80ms or 160ms. The only
exceptions are modals (which use 200–250ms) and panels sliding open (240ms).

---

## Part 5 — Timing functions: the feel of motion

The duration controls how long a transition takes. The timing function controls
how it accelerates through that duration. This is the difference between motion
that feels mechanical and motion that feels natural.

**The main timing functions:**

`linear` — constant speed throughout. Feels robotic. Rarely used for UI.

`ease` — fast start, slow end (the default). Feels natural for most things.

`ease-in` — slow start, fast end. Feels like something accelerating from rest.
Good for elements leaving the screen (they accelerate away).

`ease-out` — fast start, slow end. Feels like something decelerating to a stop.
Good for elements entering the screen (they arrive and settle).

`ease-in-out` — slow start, fast middle, slow end. Smooth and considered.
Good for elements moving from one place to another.

`cubic-bezier(x1, y1, x2, y2)` — custom curve. You define the exact shape.
Use a tool like cubic-bezier.com to create custom curves.

Add CSS for Experiment 3. Save after each step.

**Step 1 — The timing demo layout. Save.**

```css
.timing-demos {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.timing-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.timing-label {
  width: 130px;
  font-size: 11px;
  color: #556688;
  font-family: 'Consolas', monospace;
  flex-shrink: 0;
}

.timing-track {
  flex: 1;
  height: 28px;
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
}
```

**Step 2 — The ball that moves across the track. Save.**

```css
.timing-ball {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3377ff;
}
```

Six small balls appear at the left of their tracks.

**Step 3 — Add the transitions, each with a different timing function. Save.**

```css
.timing-ball {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3377ff;
  transition: left 800ms linear;
}

#ball-linear     { transition-timing-function: linear; }
#ball-ease       { transition-timing-function: ease; }
#ball-ease-in    { transition-timing-function: ease-in; }
#ball-ease-out   { transition-timing-function: ease-out; }
#ball-ease-in-out{ transition-timing-function: ease-in-out; }
#ball-cubic      { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
```

The cubic-bezier curve here (0.34, 1.56, 0.64, 1) creates a slight overshoot —
the ball goes slightly past the end point and bounces back. This is called a
spring or bounce curve. It makes motion feel physical.

**Step 4 — The button that triggers the animation. Save.**

```css
#run-timing {
  padding: 8px 20px;
  background: #1a1a3e;
  border: 1px solid rgba(51,119,255,0.3);
  border-radius: 4px;
  color: #6688cc;
  font-size: 12px;
  transition: background 160ms ease;
}

#run-timing:hover {
  background: #252550;
}
```

**Step 5 — Add the JavaScript to trigger the animation. Save.**

Add this before `</body>`:

```html
<script>
  const btn = document.getElementById('run-timing');
  const balls = document.querySelectorAll('.timing-ball');
  let moved = false;

  btn.addEventListener('click', function() {
    balls.forEach(ball => {
      const track = ball.parentElement;
      const endPos = track.offsetWidth - ball.offsetWidth - 4;
      ball.style.left = moved ? '4px' : endPos + 'px';
    });
    moved = !moved;
  });
</script>
```

Click "Run all". All six balls move to the right simultaneously but with
different curves. Watch them carefully. Click again — they return to the start.

The linear ball moves at constant speed — robotic.
The ease ball starts fast and decelerates — natural.
The ease-in ball starts slow and accelerates — like it is being pulled.
The ease-out ball starts fast and settles gently — like it arrives and stops.
The ease-in-out ball has a graceful arc — symmetric acceleration and deceleration.
The cubic-bezier ball overshoots and springs back — physical, bouncy.

For application UI: use `ease` or `ease-out` for almost everything. Use
cubic-bezier spring curves for things that should feel playful or physical.
Never use linear for visible transitions — it always feels mechanical.

---

## Part 6 — What can and cannot be transitioned

CSS can transition any property that has a numeric middle ground between two
values. You can transition from `opacity: 0` to `opacity: 1` because every
value between 0 and 1 is valid. You cannot transition `display: none` to
`display: block` because there is no middle state.

Add CSS for Experiment 2. Save after each group.

**Step 1 — Base button style. Save.**

```css
.prop-demos {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.prop-demos button {
  padding: 10px 18px;
  border-radius: 5px;
  font-size: 13px;
  font-family: 'Consolas', monospace;
}
```

**Step 2 — Each button demonstrates one transitionable property. Save.**

```css
/* Color transition */
.demo-color {
  background: #1a1a3e;
  border: 1px solid #333;
  color: #6688cc;
  transition: color 200ms ease;
}
.demo-color:hover { color: #ff8844; }

/* Background transition */
.demo-bg {
  background: #1a1a3e;
  border: 1px solid #333;
  color: #c0c0d8;
  transition: background 200ms ease;
}
.demo-bg:hover { background: #3377ff; }

/* Size transition (width/height) */
.demo-size {
  background: #1a1a3e;
  border: 1px solid #333;
  color: #c0c0d8;
  transition: padding 200ms ease;
}
.demo-size:hover { padding: 10px 32px; }

/* Border transition */
.demo-border {
  background: #1a1a3e;
  border: 1px solid rgba(51,119,255,0.2);
  color: #c0c0d8;
  transition: border-color 200ms ease, border-width 200ms ease;
}
.demo-border:hover {
  border-color: rgba(51,119,255,0.9);
  border-width: 2px;
}

/* Box shadow transition */
.demo-shadow {
  background: #1a1a3e;
  border: 1px solid #333;
  color: #c0c0d8;
  box-shadow: 0 0 0 rgba(51,119,255,0);
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.demo-shadow:hover {
  box-shadow: 0 4px 20px rgba(51,119,255,0.4);
  transform: translateY(-2px);
}

/* Transform transition */
.demo-transform {
  background: #1a1a3e;
  border: 1px solid #333;
  color: #c0c0d8;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.demo-transform:hover { transform: scale(1.1) rotate(3deg); }

/* Opacity transition */
.demo-opacity {
  background: #3377ff;
  border: 1px solid #3377ff;
  color: white;
  opacity: 1;
  transition: opacity 200ms ease;
}
.demo-opacity:hover { opacity: 0.5; }
```

Hover over each button. Each one demonstrates a different transitional property.

The `transform` button uses the spring cubic-bezier — feel the slight overshoot
on the scale. The shadow button rises slightly with `translateY(-2px)`. These
tiny details make buttons feel tactile.

**What cannot be transitioned:**
- `display` (none/block/flex — no middle state)
- `visibility` (hidden/visible — technically transitions but instantly)
- `position` (static/relative/absolute — no middle state)
- `font-family` (different fonts — no middle state)
- `z-index` (integer — steps, does not interpolate smoothly)

The workaround for `display: none`: use `opacity` + `pointer-events` together.
When you want something to "disappear" with a fade, set `opacity: 0` (visible
but transparent) and `pointer-events: none` (invisible to mouse). The fade
plays and then you set `display: none`. Or use the `visibility` property
which can be paired with opacity transitions.

---

## Part 7 — The panel slide open

Sliding panels are one of the most common UI animations. There is a trick
to it because `height: auto` cannot be transitioned — CSS does not know
how to interpolate between a number and "whatever the content needs."

The solution: use `max-height` instead. Transition from `max-height: 0`
to `max-height: 500px` (or any value larger than the content will ever be).

Add CSS for Experiment 4. Save after each step.

**Step 1 — Style the trigger button. Save.**

```css
#toggle-panel {
  padding: 8px 20px;
  background: #1a1a3e;
  border: 1px solid rgba(51,119,255,0.3);
  border-radius: 4px;
  color: #6688cc;
  font-size: 12px;
  margin-bottom: 12px;
  transition: background 160ms ease;
}

#toggle-panel:hover { background: #252550; }
```

**Step 2 — Style the panel in its closed state. Save.**

```css
.slide-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 240ms ease-out;
}
```

The panel is invisible — `max-height: 0` clips it to nothing. `overflow: hidden`
hides any content that would poke out. `transition: max-height 240ms ease-out`
means any change to `max-height` will animate over 240ms.

**Step 3 — Style the panel in its open state. Save.**

```css
.slide-panel.open {
  max-height: 300px;
}
```

Nothing changes visually yet — the panel still starts closed. The `.open` class
will be added by JavaScript.

**Step 4 — Style the panel content. Save.**

```css
.slide-panel-inner {
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 16px;
  font-size: 13px;
  color: #8899aa;
  line-height: 1.7;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

**Step 5 — Add JavaScript to toggle the open class. Save.**

```html
<script>
  document.getElementById('toggle-panel').addEventListener('click', function() {
    document.getElementById('slide-panel').classList.toggle('open');
  });
</script>
```

Click "Toggle Panel". It slides open. Click again — it slides closed.
The `ease-out` timing function makes it feel like the panel decelerates as
it reaches its full height — like a physical drawer opening.

The `max-height` trick has one nuance: the closing animation feels slightly
faster than the opening animation when the content is much shorter than the
`max-height` value. If your panel is 100px of content but `max-height: 300px`,
the opening transition takes the full 240ms but the closing transition looks
like it takes less time because it starts at 100px of actual height and
animates down. For typical panel content this is not noticeable.

---

## Part 8 — Toolbar button states

Add CSS for Experiment 5. This is the complete set of states a tool button
needs. Save after each step.

**Step 1 — The toolbar container. Save.**

```css
.toolbar-demo {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #0f0f1e;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 6px;
  padding: 6px;
  width: fit-content;
}

.tool-sep {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,0.08);
  margin: 0 4px;
}
```

**Step 2 — The resting state. Save.**

```css
.tool-btn {
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: #556688;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Consolas', monospace;
  cursor: pointer;
}
```

Buttons appear but nothing looks interactive yet.

**Step 3 — Add the transition first, before the hover state. Save.**

```css
.tool-btn {
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: #556688;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Consolas', monospace;
  cursor: pointer;
  transition: background 80ms ease,
              border-color 80ms ease,
              color 80ms ease;
}
```

Nothing visible yet. But the transition is in place — it will apply to every
state change from here on.

**Step 4 — The hover state. Save.**

```css
.tool-btn:hover {
  background: rgba(255,255,255,0.06);
  color: #c0c0d8;
}
```

Hover over the buttons. They fade in a subtle highlight. 80ms is fast enough
to feel instant and responsive without being abrupt.

**Step 5 — The active (tool selected) state. Save.**

```css
.tool-btn.active {
  background: rgba(51, 119, 255, 0.15);
  border-color: rgba(51, 119, 255, 0.5);
  color: #6699ff;
}
```

The "A" button is highlighted in blue — it has the `.active` class in the HTML.

**Step 6 — The pressed state (mousedown). Save.**

```css
.tool-btn:active {
  background: rgba(51, 119, 255, 0.1);
  transform: scale(0.94);
}
```

Click and hold a button. It shrinks slightly — `scale(0.94)` — giving a
physical press sensation. This is 80ms on the transform too. Release and it
snaps back.

The three states (hover → active-class → :active) together make the buttons
feel completely responsive. This is the pattern for every button in the
application.

---

## Part 9 — Keyframe animations

Transitions animate between two states. Keyframe animations loop or play once
through a defined sequence of states. Use them for: loading spinners, progress
indicators, pulsing indicators, entrance animations.

Add CSS for Experiment 6 — the loading spinner.

**Step 1 — Define the keyframe. Save.**

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

This defines an animation called `spin` that rotates from 0 to 360 degrees.
Nothing happens yet — no element is using it.

**Step 2 — Apply it. Save.**

```css
.spinner-row {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #667788;
  font-size: 13px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(51, 119, 255, 0.2);
  border-top-color: #3377ff;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}
```

A small spinner appears and rotates. The CSS trick: a circle with a transparent
border except one edge. When you rotate it, the single colored edge appears to
spin around the circle.

`animation: spin 700ms linear infinite`:
- `spin` — the name of the `@keyframes` rule to use
- `700ms` — one rotation takes 700ms
- `linear` — constant speed (unlike UI transitions, constant speed looks right
  for spinners — `ease` would look like it stutters)
- `infinite` — loops forever

**More complex keyframes:**

```css
@keyframes pulse {
  0%   { opacity: 1; transform: scale(1); }
  50%  { opacity: 0.5; transform: scale(0.97); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

## Part 10 — Toast notification

A toast slides in from the side, stays visible, then fades out. This combines
a keyframe animation for the entrance with a class toggle for the exit.

Add CSS for Experiment 7. Save after each step.

**Step 1 — Define the slide-in animation. Save.**

```css
@keyframes slide-in {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}
```

**Step 2 — Style the toast in its hidden state. Save.**

```css
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #111128;
  border: 1px solid rgba(51, 187, 119, 0.3);
  border-left: 3px solid #33bb77;
  border-radius: 6px;
  font-size: 13px;
  color: #c0c0d8;
  margin-top: 16px;
  max-width: 360px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5);

  /* Hidden by default */
  opacity: 0;
  transform: translateX(120%);
  pointer-events: none;
}

.toast-icon {
  color: #33bb77;
  font-size: 16px;
  font-weight: bold;
}
```

**Step 3 — The visible state. Save.**

```css
.toast.visible {
  animation: slide-in 300ms ease-out forwards;
  pointer-events: auto;
}

.toast.hiding {
  animation: slide-out 250ms ease-in forwards;
}
```

`forwards` in the animation shorthand means "keep the final state after the
animation ends." Without it, the element snaps back to its original state
when the animation finishes.

**Step 4 — Wire it with JavaScript. Save.**

```html
<script>
  const showBtn = document.getElementById('show-toast');
  const toast   = document.getElementById('toast');
  let timer;

  showBtn.addEventListener('click', function() {
    clearTimeout(timer);
    toast.classList.remove('hiding');
    toast.classList.add('visible');

    timer = setTimeout(function() {
      toast.classList.remove('visible');
      toast.classList.add('hiding');
    }, 3000);
  });
</script>
```

Click "Show notification". The toast slides in from the right. After 3 seconds
it slides out. Click again while it's visible — it resets and shows for another
3 seconds.

---

## Part 11 — The button press feel

This is the one animation that every button in a professional UI needs. It
makes clicking feel like pressing a physical button.

Add CSS for Experiment 8. Save after each step.

**Step 1 — Base button style. Save.**

```css
.press-btn {
  padding: 10px 24px;
  background: #1a1a3e;
  border: 1px solid rgba(51, 119, 255, 0.3);
  border-radius: 5px;
  color: #6688cc;
  font-size: 13px;
}
```

**Step 2 — Add all transitions first, before any state. Save.**

```css
.press-btn {
  padding: 10px 24px;
  background: #1a1a3e;
  border: 1px solid rgba(51, 119, 255, 0.3);
  border-radius: 5px;
  color: #6688cc;
  font-size: 13px;
  transition: background 80ms ease,
              border-color 80ms ease,
              color 80ms ease,
              transform 80ms ease,
              box-shadow 80ms ease;
}
```

**Step 3 — The hover: lift the button. Save.**

```css
.press-btn:hover {
  background: #252550;
  border-color: rgba(51, 119, 255, 0.6);
  color: #99aadd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}
```

The button rises by 1 pixel on hover with a shadow. Subtle — 1px is enough.
It creates a sense of depth and indicates "this is clickable."

**Step 4 — The press: push the button down. Save.**

```css
.press-btn:active {
  background: #111130;
  border-color: rgba(51, 119, 255, 0.4);
  color: #6688cc;
  box-shadow: none;
  transform: translateY(1px);
}
```

On click the button moves down by 1px and loses its shadow — like pressing
something into a surface. Combined with the hover raising it 1px, the full
movement is 2px which is very satisfying.

**Step 5 — The accent button variant. Save.**

```css
.press-btn.accent {
  background: rgba(51, 119, 255, 0.15);
  border-color: rgba(51, 119, 255, 0.5);
  color: #7799ff;
}

.press-btn.accent:hover {
  background: rgba(51, 119, 255, 0.25);
  border-color: rgba(51, 119, 255, 0.8);
  color: #aabbff;
  box-shadow: 0 4px 16px rgba(51, 119, 255, 0.2);
  transform: translateY(-1px);
}

.press-btn.accent:active {
  background: rgba(51, 119, 255, 0.1);
  transform: translateY(1px);
  box-shadow: none;
}
```

The accent button gets a blue-tinted glow on hover. Click both buttons and feel
the difference between the normal and accent styles.

---

## Part 12 — The rules: when to animate and when not to

These are the judgments that separate professional UI from amateur UI.

**Animate:**
- State changes the user triggers directly (hover, click, toggle)
- Things entering the screen (slide in, fade in)
- Things leaving the screen (slide out, fade out)
- Loading and progress indicators

**Do not animate:**
- Things that change without user input (data updates, live coordinates)
- Layout changes caused by content (don't animate width/height as content
  reflows — it's jarring)
- Anything the user does repeatedly in quick succession (transitions on
  the cursor position, real-time coordinate display, etc.)
- Error states — errors should be instant and clear, not animated

**Duration guidelines (repeat from Part 4):**
- `80ms` — button hover, button press, instant feedback
- `160ms` — dropdown open, tooltip appear
- `240ms` — panel slide, collapsible section
- `300ms` — modal enter, toast slide in
- Never more than `400ms` in a tool application

**The `prefers-reduced-motion` media query:**

Some users have vestibular disorders that make motion on screen cause physical
discomfort. Always respect their system preference:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Add this to the end of your CSS in every project. It instantly disables all
transitions and animations for users who have requested it. The `!important`
overrides even inline styles.

---

## Part 13 — Apply to camtool.html

Open `camtool.html`. You are going to add transitions to every interactive
element.

**Step 1 — Add the reduced motion rule at the very end of your CSS. Save.**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Step 2 — Add transitions to `.tool-btn`. Save.**

Find `.tool-btn` in your CSS. Add the transition property:

```css
.tool-btn {
  /* existing rules... */
  transition: background 80ms ease,
              border-color 80ms ease,
              color 80ms ease,
              transform 80ms ease;
}
```

Then add the active state:

```css
.tool-btn:active {
  transform: scale(0.92);
}
```

**Step 3 — Add transitions to `.tbtn`. Save.**

```css
.tbtn {
  /* existing rules... */
  transition: background 80ms ease,
              border-color 80ms ease,
              color 80ms ease,
              transform 80ms ease;
}

.tbtn:active {
  transform: translateY(1px);
}
```

**Step 4 — Add transitions to `.menu-item`. Save.**

```css
.menu-item {
  /* existing rules... */
  transition: background 80ms ease, color 80ms ease;
}
```

**Step 5 — Add transitions to `.form-input` focus. Save.**

```css
.form-input {
  /* existing rules... */
  transition: border-color 160ms ease;
}
```

**Step 6 — Add the section collapse animation. Save.**

The collapsible sections in the properties panel should slide instead of
jumping. Find the `<details>` and `<summary>` CSS and add:

```css
.section-body {
  /* existing rules... */
  overflow: hidden;
  transition: max-height 200ms ease-out;
}
```

The full animated section requires a small JavaScript toggle instead of the
native `<details>` element (because `height: auto` cannot be transitioned).
That is a Lab 8 task. For now, the transition is in place for when you wire it.

Save and refresh. Now interact with every button in the application. Each one
responds with a smooth 80ms transition. The difference between before and after
this step is what separates "feels like a website" from "feels like software."

---

## What you learned in this lab

- `transition: property duration timing-function` animates CSS changes smoothly
- Duration matters more than anything: 80ms for instant feedback, 160ms for
  hover, 240ms for panels, never over 400ms in tool applications
- Timing functions control acceleration: `ease-out` for things entering,
  `ease-in` for things leaving, `ease` for most hover states
- `cubic-bezier()` creates custom curves — use the spring curve
  `cubic-bezier(0.34, 1.56, 0.64, 1)` for a physical bounce feel
- `@keyframes` defines multi-step animations. `animation:` applies them.
- `forwards` keeps the final state after the animation ends
- Sliding panels use `max-height: 0` → `max-height: Npx` because
  `height: auto` cannot be transitioned
- The lift-and-press pattern: `translateY(-1px)` on hover, `translateY(1px)`
  on active, makes buttons feel physical
- Always add `prefers-reduced-motion` to respect user accessibility settings
- Do not animate data updates, live readouts, or things triggered without
  user input

## What comes in Lab 6

Lab 6 is Pseudo-classes and Pseudo-elements — `:hover`, `:focus`, `:nth-child`,
`::before`, `::after`. These are the CSS tools that respond to state and let
you add visual elements without touching the HTML. After Lab 6, every component
in your UI will have complete, correct state styling and you will know how to
build decorative elements (arrows, indicators, underlines, badges) entirely in
CSS without adding HTML.
