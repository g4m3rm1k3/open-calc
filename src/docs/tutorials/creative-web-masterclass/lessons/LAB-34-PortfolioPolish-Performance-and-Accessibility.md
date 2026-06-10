# Creative Web Masterclass — LAB 34 — Portfolio Polish: Performance and Accessibility

**Prerequisites:** LAB-33 (all portfolio sections complete).

**What this lab adds:**
- A real Contact section with a styled form
- `prefers-reduced-motion` media query — stops animations for users who need it
- Keyboard focus styles everywhere (`:focus-visible`)
- `aria-label` and semantic HTML audit
- Performance: pausing Three.js and canvas loops when they're off-screen
- A skip-to-content link for screen readers

**Time:** 45–60 minutes

---

## What You Will Build

The visual output of this lab is subtle — a polished contact form, and invisible but
critical improvements to accessibility and performance. These are the things that
separate a portfolio that looks professional from one that just looks good.

```
 ┌──────────────────────────────────────────────────────┐
 │  Contact                                             │
 │  ─────────────                                       │
 │  Let's work together                                 │
 │                                                      │
 │  [ Name __________________ ]                         │
 │  [ Email _________________ ]                         │
 │  [ Message                 ]                         │
 │  [          ]              ]                         │
 │  [  Send Message  ]                                  │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. `@media (prefers-reduced-motion: reduce)` targets users who have asked the OS to
>    reduce animations. Should you disable animations entirely, or just make them subtler?
> 2. `:focus` fires on any focus event — including mouse clicks. `:focus-visible` only
>    fires when focus came from the keyboard. Why does this distinction matter for styling?
> 3. Running `requestAnimationFrame` loops while a canvas is off-screen wastes CPU.
>    What API lets you know when an element leaves the viewport?
>
> *(Answers at the end)*

---

## Concept: `prefers-reduced-motion`

**What it is:** A CSS media query that reads the user's OS-level "Reduce Motion"
setting (macOS System Preferences, Windows Ease of Access, mobile accessibility settings).
Users with vestibular disorders, epilepsy, or motion sensitivity can be harmed by
large animations.

```css
@media (prefers-reduced-motion: reduce) {
  /* Override all transitions and animations */
  *, *::before, *::after {
    animation-duration:   0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration:  0.01ms !important;
  }
}
```

`0.01ms` rather than `0s` — some screen readers and test tools check for
`animation-duration: 0s` specifically and behave differently. Using `0.01ms` keeps
animations technically "running" but imperceptibly fast.

In JavaScript, you can read the same preference:

```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) {
  // only start particle animations if motion is OK
  animate();
}
```

---

## Concept: `:focus-visible` vs `:focus`

**What it is:** Before `:focus-visible`, developers removed focus rings with
`outline: none` because the ring appeared on every mouse click. That breaks keyboard
navigation. `:focus-visible` solves this cleanly:

```css
/* Remove outline for mouse users (it looks ugly on click) */
:focus { outline: none; }

/* Restore a visible ring for keyboard users */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}
```

Now mouse clicks get no ring. Tab key navigation gets a clear blue ring. Both groups
get a good experience.

---

## Concept: Pausing Off-Screen Animations

**What it is:** Three.js and canvas `requestAnimationFrame` loops run at 60fps whether
or not the element is visible. When the user is on the Work section, the hero Three.js
loop and the canvas particle loop are running in the background, consuming CPU and
battery.

```js
let heroVisible = true;

const visibilityObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    heroVisible = entry.isIntersecting;
  });
});

visibilityObserver.observe(heroSection);

function animate() {
  if (heroVisible) {
    // ... render ...
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);  // always reschedule so it resumes when visible
}
```

We keep calling `requestAnimationFrame` even when not visible — this keeps the loop
alive so it automatically resumes when the element scrolls back into view. We just
skip the expensive render work when the canvas is off-screen.

---

## Step 1 — Update index.html (Contact Section + Skip Link)

Replace the contact section placeholder and add a skip link before `<nav>`:

```html
<!-- Skip link: screen reader users can jump past the nav -->
<a href="#main-content" class="skip-link">Skip to content</a>

<!-- (nav stays the same) -->
<nav class="ribbon-nav" ...>
  ...
</nav>

<main class="portfolio" id="main-content">

  <!-- hero, work, canvas, terminal sections stay the same -->

  <section id="contact" class="port-section section-contact">
    <div class="section-inner">

      <div class="section-header">
        <p class="section-eyebrow">Get in touch</p>
        <h2 class="section-title">Contact</h2>
      </div>

      <div class="contact-layout">
        <div class="contact-intro">
          <p class="contact-tagline">Let's work together</p>
          <p class="contact-body">
            I'm currently available for freelance projects and full-time roles.
            Drop me a message and I'll get back within 24 hours.
          </p>
          <ul class="contact-list" aria-label="Contact links">
            <li><a href="mailto:alex@example.com" class="contact-link">alex@example.com</a></li>
            <li><a href="https://github.com" class="contact-link" target="_blank" rel="noopener">GitHub</a></li>
            <li><a href="https://linkedin.com" class="contact-link" target="_blank" rel="noopener">LinkedIn</a></li>
          </ul>
        </div>

        <form class="contact-form" aria-label="Contact form" novalidate>
          <div class="form-group">
            <label class="form-label" for="name">Name</label>
            <input class="form-input" type="text" id="name" name="name" autocomplete="name" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input class="form-input" type="email" id="email" name="email" autocomplete="email" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="message">Message</label>
            <textarea class="form-input form-textarea" id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Send Message</button>
        </form>
      </div>

    </div>
  </section>

</main>
```

Key accessibility decisions in this HTML:

- `<a href="#main-content" class="skip-link">` lets keyboard/screen reader users jump
  past the 60px ribbon nav without tabbing through every nav link first.
- `id="main-content"` on `<main>` is the target for the skip link.
- Every `<input>` and `<textarea>` has a matching `<label for="...">`. The `for` attribute
  must match the input's `id`. Without it, screen readers do not announce what the field is.
- `autocomplete="name"` and `autocomplete="email"` let browsers pre-fill from saved data,
  reducing friction for users.
- `novalidate` on `<form>` disables the browser's default validation popup so you can
  style it yourself (we'll add JS validation in the challenge).
- `rel="noopener"` on external links prevents the new tab from accessing `window.opener`.

---

## Step 2 — Styles

Add these to `styles.css`:

```css
/* ---- Skip link (visually hidden until focused) ---- */
.skip-link {
  position: absolute;
  top: -100px;          /* off-screen by default */
  left: 16px;
  z-index: 9999;
  background: var(--color-primary);
  color: white;
  padding: 10px 20px;
  border-radius: 0 0 8px 8px;
  font-weight: 600;
  text-decoration: none;
  transition: top 0.2s ease;
}

/* When a keyboard user presses Tab, the skip link gets focus and slides down */
.skip-link:focus { top: 0; }

/* ---- Global focus ring ---- */
:focus { outline: none; }
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
  border-radius: 3px;
}

/* ---- Contact section ---- */
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 64px;
  align-items: start;
}

.contact-tagline {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
}

.contact-body { color: var(--color-muted); line-height: 1.7; margin: 0 0 28px 0; }

.contact-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }

.contact-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: opacity 0.15s ease;
}

.contact-link:hover { opacity: 0.75; }

/* ---- Form ---- */
.contact-form { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-label { font-size: 0.82rem; font-weight: 600; color: var(--color-muted); letter-spacing: 0.05em; }

.form-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--color-text);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

/* Focus ring for form inputs — replace browser default with our own */
.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px hsla(244, 95%, 65%, 0.2);
}

.form-textarea { resize: vertical; min-height: 120px; }

/* ---- Reduced motion ---- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1      !important;
    transition-duration:       0.01ms !important;
  }
}

/* Responsive */
@media (max-width: 700px) {
  .contact-layout { grid-template-columns: 1fr; gap: 40px; }
}
```

Read through each block as you type it:

- `.skip-link { top: -100px }` — the element is in the DOM but above the visible area.
  `.skip-link:focus { top: 0 }` slides it into view when tabbed to. `position: absolute`
  is required so `top` takes effect.
- `:focus { outline: none }` removes all default rings. `:focus-visible` adds them back
  only when the browser determines the focus came from a keyboard (not a click).
- `.form-input:focus` sets `outline: none` on inputs specifically, then replaces it with
  `border-color` and `box-shadow` — giving a custom glow ring that matches the design.

---

> **CSS AND SEE**
>
> **You should see:** The contact section with the two-column layout (intro left, form right).
> Tab through the page — every interactive element gets a visible blue ring. Click and
> the rings disappear on mouse elements. Press Tab from the top of the page — the skip
> link slides down from behind the top of the viewport.

---

## Step 3 — JavaScript: Pause Off-Screen Loops + Form Feedback

Append this block to `main.js`:

```js
// ---- Pause Three.js hero loop when hero is off-screen ----
// The render itself is skipped, but requestAnimationFrame keeps going so
// the loop resumes automatically when the user scrolls back.
let heroVisible = true;
const heroVisibilityObserver = new IntersectionObserver(function (entries) {
  heroVisible = entries[0].isIntersecting;
});
heroVisibilityObserver.observe(heroSection);

// ---- Pause canvas particle loop when canvas section is off-screen ----
let canvasVisible = true;
const canvasVisibilityObserver = new IntersectionObserver(function (entries) {
  canvasVisible = entries[0].isIntersecting;
});
canvasVisibilityObserver.observe(canvasSection);
```

Now edit the `animateHero` function to check `heroVisible` before rendering:

```js
function animateHero() {
  if (heroVisible) {
    const t = clock.getElapsedTime();
    heroParticles.rotation.y  =  t * 0.04;
    heroParticles.rotation.x  =  t * 0.015;
    heroParticles2.rotation.y = -t * 0.03;
    heroParticles2.rotation.z =  t * 0.02;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animateHero);
}
```

And edit `animateCanvas` to check `canvasVisible` before doing any work:

```js
function animateCanvas() {
  if (canvasVisible) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ... rest of draw code ...
  }
  requestAnimationFrame(animateCanvas);
}
```

Then add the contact form handler:

```js
// ---- Contact form ----
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();   // stop the browser from navigating

    const nameVal  = document.getElementById('name').value.trim();
    const emailVal = document.getElementById('email').value.trim();
    const msgVal   = document.getElementById('message').value.trim();

    // Basic presence check — real projects send to a backend here
    if (!nameVal || !emailVal || !msgVal) {
      alert('Please fill in all fields.');
      return;
    }

    // Replace the form with a success message
    contactForm.innerHTML =
      '<p style="color: var(--color-primary); font-size: 1.1rem; font-weight: 600;">' +
      'Thanks, ' + nameVal + '! I\'ll be in touch soon.</p>';
  });
}
```

Walk through the submit handler:

- `event.preventDefault()` stops the form from doing its default action (navigate to
  `action=""` URL or reload the page). Without this, the page refreshes on submit.
- `.value.trim()` strips leading/trailing spaces before checking if the field is empty.
  A field with only spaces would pass `!value` but should still be considered empty.
- After validation passes, we replace `contactForm.innerHTML` with a success message.
  In a real project, you'd `fetch()` a backend endpoint here before showing the message.

---

> **SAVE AND TRY**
>
> **You should see:** Scroll through the full portfolio — all five sections work. Tab
> through the page — skip link appears, every interactive element gets a focus ring.
> Submit the contact form — success message replaces the form. Open DevTools Performance
> and record while scrolling — the Three.js and canvas loops pause when their sections
> are off screen.

---

## 🎯 Challenge: Validate Email Format

**You know:** Regular expressions, `.test()`, JavaScript string methods.

**Task:** Before showing the success message, check that the email field looks like an
email address:

```js
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailPattern.test(emailVal)) {
  alert('Please enter a valid email address.');
  return;
}
```

`/^[^\s@]+@[^\s@]+\.[^\s@]+$/` reads as: start of string (`^`), one or more characters
that are not whitespace or `@` (`[^\s@]+`), a literal `@`, one or more non-whitespace-or-`@`
characters, a literal `.`, one or more non-whitespace-or-`@` characters, end of string (`$`).
This is intentionally loose — it catches obvious mistakes like missing `@` or `.` without
rejecting unusual-but-valid email formats.

---

## Final Check

| Feature | How to verify |
|---|---|
| Contact form renders | Scroll to Contact — form shows two-column layout |
| Skip link | Press Tab from top — "Skip to content" slides in |
| Keyboard focus rings | Tab through page — every element shows blue ring |
| Mouse clicks no ring | Click a button with mouse — no focus ring |
| Reduced motion | Enable OS "Reduce Motion" — hero text jumps in instantly |
| Off-screen pause | DevTools Performance — loops pause when sections not visible |
| Form submit | Fill form, submit — success message appears |

---

## Quick Check Answers

**1. Should `prefers-reduced-motion` disable animations or make them subtler?**
The WCAG guidance is: honour the user's preference. For users who have enabled this setting,
most animations should either be removed or reduced to simple opacity fades (no translate,
scale, or rotate — those are the motions that cause vestibular issues). A snap-to-visible
opacity fade is acceptable. A translateY slide-up is not. When in doubt, cut the animation
entirely.

**2. Why does `:focus` vs `:focus-visible` matter for styling?**
If you remove `:focus { outline: none }` without `:focus-visible`, every click on a
button or link shows a focus ring — which looks like a bug to mouse users. If you add
only `outline: none`, keyboard users have no visible indicator of what is focused —
which breaks accessibility (WCAG 2.4.7). `:focus-visible` threads the needle: mouse
users don't see rings, keyboard users do.

**3. What API tells you when an element leaves the viewport?**
`IntersectionObserver`. `entry.isIntersecting` is `true` when the element enters the
viewport and `false` when it leaves. This is the same observer used for scroll-reveal
animations — it can do double duty for pausing loops.
