---
series: vue-fundamentals
level: 0
title: What Vue Is and the Options API
lang: javascript
---

# What Vue Is and the Options API

Vue is a JavaScript framework for building user interfaces. Like React, Vue makes the UI a function of data. Unlike React, Vue's reactivity is automatic: you don't call a setter function to update state. Instead, Vue tracks which data properties your template reads, and automatically re-renders the relevant parts when those properties change.

Vue was created by Evan You in 2014 after working at Google with Angular. Its design goal was to take the best parts of Angular (directives, two-way binding) and React (component-based, virtual DOM) while being easier to learn progressively. By the end of this lesson you will understand Vue's reactivity system, the Options API structure, and how Vue differs from React in its approach to keeping UI in sync with data.

## Vue's reactivity model

The core difference between Vue and React is how state changes trigger UI updates.

```javascript
// REACT: you control state explicitly
// (tiny stand-in for React's real useState, so this comparison can run standalone)
function useState(initial) { let value = initial; return [value, next => { value = next }] }

const [count, setCount] = useState(0)
setCount(count + 1)   // you call the setter; React re-renders

// VUE: you mutate data; Vue detects the change automatically
export default {
  data() {
    return { count: 0 }  // count is a reactive property
  },
  methods: {
    increment() {
      this.count++   // Vue detects this mutation and re-renders
      // No setter needed — Vue's reactivity system intercepts the assignment
    }
  }
}
```

```text
HOW VUE'S REACTIVITY WORKS (Vue 3 — Proxy-based):

  When Vue sees your data() return value, it wraps it in a JavaScript Proxy.
  A Proxy intercepts property gets and sets.
  
  When your template runs:
    <p>{{ count }}</p>
    → Vue reads count (intercepted by Proxy's "get" trap)
    → Vue records: "this component's template depends on count"
  
  When you run this.count++:
    → Vue's Proxy intercepts the assignment (Proxy "set" trap)
    → Vue knows count changed
    → Vue knows this component's template depends on count
    → Vue schedules a re-render of this component

  This is the OBSERVER pattern: Vue observes your data,
  and when it changes, it notifies the template (the observer).

REACT vs VUE REACTIVITY:
  React: PULL model — you explicitly push state changes via setCount()
         React only knows about changes you tell it about.
  
  Vue:   PUSH model — Vue tracks dependencies during render
         Vue detects any mutation to reactive data automatically.
         
  Trade-off:
    React: more explicit, easier to understand what causes re-renders
    Vue:   less boilerplate, but mutations can trigger unexpected re-renders
```

**CS lens:** Vue 3's reactivity is built on JavaScript `Proxy`, a built-in metaprogramming feature. A Proxy wraps an object and intercepts fundamental operations: `get`, `set`, `has`, `delete`. Vue's Proxy intercepts `get` to track which component is reading which property (dependency tracking), and intercepts `set` to trigger re-renders when a property changes (dependency notification). This is an implementation of the **Observer pattern** at the language runtime level — the same pattern used in spreadsheets (changing one cell updates all formulas that reference it), in reactive programming libraries (RxJS), and in MobX.

## The Options API

Vue components can be written in two styles: the Options API (Vue 2 style, still fully supported in Vue 3) and the Composition API (introduced in Vue 3). The Options API organises code by option type (data, methods, computed, lifecycle hooks).

```javascript
export default {
  name: 'UserCard',          // the component's name (for debugging)
  
  props: {                   // data passed in from the parent
    user: {
      type: Object,
      required: true
    }
  },
  
  data() {                   // reactive state owned by this component
    return {
      isExpanded: false,     // initially collapsed
      editedName: '',
    }
  },
  
  computed: {                // derived values — automatically cached and updated
    displayName() {
      return this.user.name.trim() || 'Anonymous'
    },
    initials() {
      return this.user.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
    }
  },
  
  methods: {                 // functions that the template calls
    toggleExpand() {
      this.isExpanded = !this.isExpanded
    },
    beginEdit() {
      this.editedName = this.user.name
    }
  },
  
  mounted() {                // lifecycle hook: runs after the component is in the DOM
    console.log('UserCard mounted for user:', this.user.id)
  },
  
  template: `
    <div class="user-card">
      <div class="user-header" @click="toggleExpand">
        <span class="initials">{{ initials }}</span>
        <h3>{{ displayName }}</h3>
      </div>
      <div v-if="isExpanded" class="user-details">
        <p>{{ user.email }}</p>
        <button @click="beginEdit">Edit</button>
      </div>
    </div>
  `
}
```

```text
OPTIONS API SECTIONS:
  data()     → reactive state. Must be a function (so each instance gets its own copy).
  computed   → derived data. Cached: only recalculates when dependencies change.
  methods    → functions (event handlers, actions). Not cached.
  props      → data received from parent. Read-only in the child.
  watch      → react to data changes with custom logic (side effects).
  mounted/   → lifecycle hooks (see below).
  unmounted

COMPUTED vs METHODS:
  // computed: cached
  computed: { fullName() { return firstName + ' ' + lastName } }
  // → fullName is recalculated ONLY when firstName or lastName changes.
  // → Multiple reads of fullName in the same render: cached value returned.

  // method: not cached
  methods: { getFullName() { return firstName + ' ' + lastName } }
  // → Called every time it appears in the template.
  // → No caching — runs on every render.

  USE COMPUTED: for derived values that depend on reactive data.
  USE METHODS:  for event handlers and functions with side effects.
```

## Vue template syntax

Vue templates are HTML with special directives (attributes prefixed with `v-`) and interpolation (`{{ }}`).

```html
<!-- INTERPOLATION: display reactive data -->
<p>{{ message }}</p>
<p>{{ user.name.toUpperCase() }}</p>
<p>{{ count > 0 ? count + ' items' : 'empty' }}</p>

<!-- v-bind: bind an attribute to reactive data -->
<img :src="user.avatar" :alt="user.name">
<button :disabled="isLoading">Submit</button>
<!-- :attr is shorthand for v-bind:attr -->

<!-- v-on: attach event handlers -->
<button @click="handleClick">Click me</button>
<input @input="handleInput" @keydown.enter="handleEnter">
<!-- @event is shorthand for v-on:event -->
<!-- .enter is a key modifier: only fires on Enter key -->

<!-- v-if / v-else-if / v-else: conditional rendering -->
<div v-if="isLoading">Loading...</div>
<div v-else-if="error">Error: {{ error }}</div>
<div v-else>{{ content }}</div>

<!-- v-show: toggles CSS display (keeps DOM element; v-if removes it) -->
<div v-show="isVisible">Always in DOM, sometimes hidden</div>

<!-- v-for: list rendering (always include :key) -->
<ul>
  <li v-for="item in items" :key="item.id">
    {{ item.name }} — {{ item.price }}
  </li>
</ul>

<!-- v-model: two-way binding (input ↔ data) -->
<input v-model="searchQuery" placeholder="Search...">
<p>You typed: {{ searchQuery }}</p>
<!-- v-model = :value="searchQuery" @input="searchQuery = $event.target.value" -->
```

```text
v-if vs v-show:
  v-if:   adds/removes the element from the DOM. Higher toggle cost.
          Use when: the element is rarely shown, or has expensive setup (data fetch).
  v-show: only toggles CSS display:none. Lower toggle cost.
          Use when: the element is toggled frequently.
          
v-model:
  Two-way binding: changes in the input update the data property,
  changes in the data property update the input.
  This is the equivalent of React's controlled input pattern (value + onChange),
  but in a single directive instead of two props.
```

**SE lens:** Vue's template syntax is a **domain-specific language (DSL)** embedded in HTML. By extending HTML with directives (`v-if`, `v-for`, `v-model`), Vue lets developers write declarative UI logic in the template itself. React takes the opposite approach: extend JavaScript with JSX (HTML embedded in JavaScript). Vue's approach keeps HTML familiar and readable; React's approach gives full JavaScript power in templates. The choice reflects a fundamental trade-off: **HTML-centric** (Vue) vs **JavaScript-centric** (React). Neither is universally better; Vue's templates are often easier for designers, React's JSX is often easier for JavaScript developers.

**Common mistakes:**
- Mutating props directly — `this.user.name = 'Alice'` inside a child component violates Vue's one-way data flow. Props flow from parent to child and should only be changed by the parent. If the child needs to change something, it emits an event to the parent: `this.$emit('update:user', { ...this.user, name: 'Alice' })`.
- Using methods where computed should be used — calling a method in the template (`{{ getFullName() }}`) is called on every render. A computed property (`{{ fullName }}`) is cached and only recalculates when its dependencies change. Use computed for derived data.
- Forgetting `key` in `v-for` — same issue as React's list rendering: without keys, Vue can't track which list item corresponds to which DOM element, causing incorrect updates when items reorder.

**Debug tip:** Vue DevTools is a browser extension for Chrome and Firefox. Install it, open DevTools → Vue tab. You can inspect the component tree, see current data and computed values, and track which data properties triggered the last re-render. When a template shows wrong data, use Vue DevTools to check if the data() values are what you expect. If the template shows stale data, the value may not be reactive (e.g., added to an object after initialization — Vue can't track properties added after the reactive object is created).

## Challenge: vueOptionsConceptCheck

Verify understanding of Vue's Options API model.

```challenge
function vueConceptCheck(question) {
  // Returns the correct answer for each Vue Options API question.
  //
  // 'how-does-vue-detect-changes'
  //   → 'proxy'   (Vue 3 uses a Proxy to intercept reads and writes)
  //
  // 'computed-vs-method'
  //   → 'cached'  (computed values are cached; methods run on every render)
  //
  // 'v-model-is-shorthand-for'
  //   → 'bind-and-event'  (:value + @input event — two-way binding shorthand)
  //
  // 'when-to-use-v-show-over-v-if'
  //   → 'frequent-toggle'  (v-show for frequently toggled elements; v-if removes from DOM)
  //
  // 'data-must-be-a-function-because'
  //   → 'per-instance'  (each component instance needs its own reactive copy of data)
}
```

```test
assert vueConceptCheck('how-does-vue-detect-changes') === 'proxy'
assert vueConceptCheck('computed-vs-method') === 'cached'
assert vueConceptCheck('v-model-is-shorthand-for') === 'bind-and-event'
assert vueConceptCheck('when-to-use-v-show-over-v-if') === 'frequent-toggle'
assert vueConceptCheck('data-must-be-a-function-because') === 'per-instance'
```
