# CSS 0 to Mastery Course: A Problem-First Approach

We will build a comprehensive 25-lesson CSS course using the new `WebLessonPlayer`. This course takes a fundamentally different approach: **the problem comes first**. We will never explain "here is what `display: flex` does" without first establishing the layout constraint that forces you to reach for it.

## Proposed Changes

We will introduce a new `css-mastery` module structured into 5 chapters. 

### 1. Directory Structure & Architecture

### Core Architecture Updates

#### [MODIFY] `src/components/learn/WebLessonPlayer.jsx`
Instead of using hidden HTML files or locking the editor to a single language, we will build a **Multi-Tab Editor** directly into the `WebLessonPlayer`. 
- You will see tabs for `HTML`, `CSS`, and `JavaScript` (or `React`).
- This allows you to fluidly switch between writing markup, styling it, and adding logic—perfectly mirroring real-world web development.
- The player will intelligently stitch all three tabs together when you click **Run**.
- This powerful upgrade will dramatically improve both the upcoming CSS course and any future React/JavaScript lessons!

- **`src/content/css-mastery/index.js`**: The curriculum registry that stitches all 25 lessons into chapters and exports them to the main platform.
- **`src/content/courses.js`**: We will add the CSS Mastery course metadata to the global registry so it appears on the dashboard.
- **`src/content/index.js`**: We will export the new curriculum alongside existing courses.

### 2. The 25-Lesson Curriculum
We will create 25 individual `.js` lesson files (e.g. `css-01-normal-flow.js`) that utilize the `WebLessonPlayer` interactive HTML/CSS environment. 

**Progressive Learning:** We will strictly follow the "piece-by-piece" philosophy. We won't dump a full CSS file on you at once. Instead, we will use the Player's `checkpoints` system so that each lesson introduces CSS properties one line at a time, allowing you to see the exact visual impact of each new rule.

#### Chapter 1 — How does a browser decide where things go?
1. **Normal Flow**: You put two divs next to each other and they stack vertically. (Block vs Inline, Box Model)
2. **Box-Sizing**: You add padding and the element gets bigger and breaks your layout. (Margin collapse, universal reset)
3. **Centering**: You want something in the exact centre and nothing works. (The five ways to centre)
4. **Stacking Contexts**: Something is covering something else and `z-index` isn't fixing it. (Tooltips, modals)
5. **Overflow**: Your layout breaks when content is too long or short. (Min/max width, defensive layouts)

#### Chapter 2 — How do you arrange things next to each other?
6. **Flex Direction**: You need items in a row that wrap when there's no room. (Collapsible Navbars)
7. **Flex Alignment**: Items in a row are different heights and nothing lines up. (Pricing cards)
8. **Flex Sizing**: One item needs to grow, others stay fixed. (Sidebar + Main content)
9. **Grid Tracks**: You need items to snap to a strict grid. (Magazine-style layout)
10. **Grid Areas**: Items need to span multiple columns or rows. (Dashboard layouts)
11. **Grid vs Flexbox**: Your grid and flex layouts don't talk to each other. (Full page composite layouts)

#### Chapter 3 — How do you make it work on every screen?
12. **The Viewport**: Your layout looks fine on your screen but breaks on mobile. (Device pixels, mobile-first constraint)
13. **Media Queries**: You're writing slightly different values for every breakpoint. (The 3 golden breakpoints)
14. **Fluid Typography**: Text is too big on mobile and too small on desktop. (`clamp()`, viewport units)
15. **Responsive Images**: Images break containers or look squashed. (`object-fit`, `aspect-ratio`)
16. **Container Queries**: Your component breaks when moved to a smaller sidebar. (Component vs Viewport relativity)

#### Chapter 4 — How do you make it move?
17. **Transitions**: You add a transition and it jumps instead of animating. (The compositor, hardware acceleration)
18. **Animations**: Your animation runs once and stops. (`@keyframes`, iteration, fill-modes)
19. **Performance**: Your animation causes the page to stutter. (Paint, layout, composite pipeline)
20. **Scroll-Driven**: You want one element to animate in relation to scrolling. (`animation-timeline`)

#### Chapter 5 — How do you stop fighting your own CSS?
21. **Specificity**: A style is being overridden and you can't find where. (The Cascade, inheritance)
22. **Variables**: You're copy-pasting the same hex codes everywhere. (Custom properties, scoping)
23. **Cascade Layers**: Your CSS is 2000 lines and brittle. (`@layer`, controlling specificity deliberately)
24. **Selector Scope**: The same component leaks styles elsewhere. (`:is()`, `:where()`, zero specificity)
25. **Native HTML**: You're recreating things browsers already know how to do. (Default styles, accessibility wins)

#### Chapter 6 — How does CSS talk to JavaScript?
26. **Class Toggling**: You want a menu to open when a button is clicked. (DOM `classList.toggle()`, state classes `.is-active`)
27. **Inline Styles via JS**: You need an element to follow the mouse cursor dynamically. (Reading/writing `element.style` vs CSS transitions)
28. **Variables & JS**: You want a slider to change the entire app's theme color in real-time. (Updating `--custom-properties` via `setProperty()`)
29. **Scroll Observers**: You want elements to fade in exactly when they scroll into view. (Triggering CSS animations via `IntersectionObserver`)

## Execution Strategy
Creating 25 highly polished, interactive code lessons will take some time. 
1. I will wire up the routing and course indices first.
2. I will write a custom script or subagent to efficiently bulk-generate the scaffold for all 25 lesson files with their unique IDs, titles, and routing.
3. I will then fill in the content, checkpoints, and interactive code examples for the chapters, focusing heavily on problem-first demonstrations.

> [!IMPORTANT]
> Since this is a massive addition (25 distinct interactive lessons), I will tackle this in phases. Once you approve this plan, I will scaffold the architecture and build out Chapter 1 & 2 to ensure the flow is perfect. Let me know if you are ready to begin!
