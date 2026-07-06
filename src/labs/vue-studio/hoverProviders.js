// Monaco hover providers for Vue 3 Composition API primitives.
// Registered once on Monaco mount — purely additive, never changes student code.
// Each entry: title (concept name), body (CS explanation), seeAlso (related APIs).

const VUE_CONCEPTS = {
  ref: {
    title: 'Reactive State — `ref()`',
    body: `Creates a reactive container for a single value. Reading \`.value\` anywhere in \`<script setup>\` registers a dependency; assigning \`.value\` triggers Vue to re-render every component that read it.

**The CS concept:** An observable — a value that notifies subscribers when it changes. Vue's reactivity system is built on JavaScript Proxies: objects that intercept reads and writes at the engine level.

\`\`\`typescript
const count = ref(0)
count.value++ // triggers re-render
\`\`\`

In \`<template>\`, Vue automatically unwraps \`ref\` — write \`{{ count }}\`, not \`{{ count.value }}\`.`,
    seeAlso: ['reactive', 'computed', 'watch'],
  },

  reactive: {
    title: 'Reactive Object — `reactive()`',
    body: `Makes a plain object deeply reactive. Every property — including nested objects — is tracked. Access the properties directly; no \`.value\` needed.

\`\`\`typescript
const state = reactive({ count: 0, name: 'Alice' })
state.count++ // tracked — triggers re-render
\`\`\`

**When to use \`reactive\` vs \`ref\`:** Use \`ref\` for primitives (numbers, strings, booleans) and single values. Use \`reactive\` when you have a group of related values that naturally belong together as an object.`,
    seeAlso: ['ref', 'computed', 'toRefs'],
  },

  computed: {
    title: 'Derived State — `computed()`',
    body: `Creates a reactive value derived from other reactive values. Vue caches the result and only recomputes when a dependency changes.

\`\`\`typescript
const count = ref(3)
const doubled = computed(() => count.value * 2)
// doubled.value === 6; updates automatically when count changes
\`\`\`

**The CS concept:** Memoized derivation. The getter function runs once; the result is cached. The cache is invalidated only when a reactive dependency changes — not on every render. This is the same idea as a spreadsheet formula: \`=A1*2\` recomputes only when A1 changes.

**Why not use a method?** A method called in the template reruns on every render, even if its inputs have not changed. A \`computed\` value does not.`,
    seeAlso: ['ref', 'watch', 'watchEffect'],
  },

  watch: {
    title: 'Side Effect — `watch()`',
    body: `Runs a callback whenever a reactive value changes. Used for side effects: API calls, localStorage writes, logging — anything that should happen *because* data changed, but is not part of rendering.

\`\`\`typescript
const query = ref('')
watch(query, (newValue, oldValue) => {
  fetchResults(newValue) // called every time query changes
})
\`\`\`

**The CS concept:** A reactive subscription — the callback is registered as a subscriber to the source. When the source emits a new value, the subscriber is called with the old and new values.

**vs \`watchEffect\`:** \`watch\` is explicit — you name the source. \`watchEffect\` is implicit — it tracks whatever reactive values the callback reads.`,
    seeAlso: ['watchEffect', 'computed', 'ref'],
  },

  watchEffect: {
    title: 'Implicit Side Effect — `watchEffect()`',
    body: `Runs a callback immediately and again whenever any reactive value it reads changes. Tracks dependencies automatically.

\`\`\`typescript
const url = ref('/api/posts')
watchEffect(() => {
  // Runs once immediately, then whenever url.value changes
  fetch(url.value).then(r => r.json()).then(data => ...)
})
\`\`\`

**vs \`watch\`:** \`watchEffect\` does not give you the old value. Use it when you do not need the previous value and want implicit dependency tracking. Use \`watch\` when you need to compare old and new, or want the callback to run only *after* the value changes (not immediately).`,
    seeAlso: ['watch', 'computed'],
  },

  defineProps: {
    title: 'Component Input — `defineProps()`',
    body: `Declares the props a component accepts from its parent. Props are the component's public interface — the values the parent passes in.

\`\`\`typescript
// In Counter.vue
const props = defineProps<{ label: string; initialCount: number }>()
\`\`\`

\`\`\`html
<!-- In the parent template -->
<Counter label="Score" :initialCount="0" />
\`\`\`

**The SE principle:** Explicit interface. A component that accepts arbitrary data through props without declaring them is a black box. \`defineProps\` makes the contract explicit: this component needs exactly these values, of these types, to render correctly.

**Data flows downward:** Props flow from parent to child — never in the other direction. To send data upward, use \`emit\`.`,
    seeAlso: ['defineEmits', 'ref', 'reactive'],
  },

  defineEmits: {
    title: 'Component Output — `defineEmits()`',
    body: `Declares the events a component can send to its parent. The complement of \`defineProps\` — props go down, emits go up.

\`\`\`typescript
// In Counter.vue
const emit = defineEmits<{ change: [count: number] }>()

function increment() {
  count.value++
  emit('change', count.value) // tells the parent what happened
}
\`\`\`

\`\`\`html
<!-- In the parent template -->
<Counter @change="handleCountChange" />
\`\`\`

**The CS concept:** Event-driven communication. The child component does not know anything about its parent — it just fires an event. The parent decides what to do with it. This decoupling is what makes components reusable: \`Counter\` works the same way regardless of which parent uses it.`,
    seeAlso: ['defineProps'],
  },

  onMounted: {
    title: 'Lifecycle Hook — `onMounted()`',
    body: `Runs a callback after the component has been mounted — after its template has been rendered and added to the DOM for the first time.

\`\`\`typescript
onMounted(() => {
  // Safe to access the DOM here
  // Safe to start fetching data here
})
\`\`\`

**Why not fetch data at the top level of \`<script setup>\`?** Code at the top level runs during setup, before the component is in the DOM. For most reactive state, this is fine. But for side effects that depend on the DOM (reading element dimensions, initialising a canvas, starting an animation), you need to wait until after mounting.

**The CS concept:** A lifecycle hook is a callback registered at a specific phase of an object's lifetime. Components have a lifecycle: created → mounted → updated (on each re-render) → unmounted. \`onMounted\` is the hook for the "just appeared in the DOM" phase.`,
    seeAlso: ['onUnmounted', 'watchEffect', 'ref'],
  },

  onUnmounted: {
    title: 'Lifecycle Hook — `onUnmounted()`',
    body: `Runs a callback when the component is removed from the DOM. Used for cleanup: cancelling timers, removing event listeners, closing WebSocket connections.

\`\`\`typescript
onMounted(() => {
  const timer = setInterval(tick, 1000)
  onUnmounted(() => clearInterval(timer)) // cleanup runs on unmount
})
\`\`\`

**Why cleanup matters:** A component that registers a \`setInterval\` and never cancels it continues consuming CPU after it is removed from the page. Over time, in a single-page application where components mount and unmount repeatedly, this accumulates into a memory and CPU leak. \`onUnmounted\` is where you reverse every side effect \`onMounted\` started.`,
    seeAlso: ['onMounted'],
  },

  provide: {
    title: 'Dependency Injection — `provide()`',
    body: `Makes a value available to all descendant components, no matter how deeply nested, without passing it through every intermediate component as a prop.

\`\`\`typescript
// In a parent (or App.vue)
const theme = ref('dark')
provide('theme', theme)
\`\`\`

**The CS concept:** Dependency injection — a component declares what it needs, and the environment provides it. The consumer does not know or care who the provider is.

**When to use it:** Avoid using \`provide\`/\`inject\` for data that changes frequently — it makes data flow harder to trace. It is best for stable app-wide values: the current user, the active theme, a feature flag store.`,
    seeAlso: ['inject'],
  },

  inject: {
    title: 'Dependency Injection — `inject()`',
    body: `Receives a value provided by an ancestor component using \`provide()\`.

\`\`\`typescript
// In a deeply nested child
const theme = inject('theme') // receives the ref provided by the parent
\`\`\`

**The relationship:** \`inject\` is the consumer side of \`provide\`/\`inject\`. The component does not know which ancestor provided the value — it just asks for it by key. This makes the component independent of its position in the tree.`,
    seeAlso: ['provide'],
  },

  createApp: {
    title: 'Application Bootstrap — `createApp()`',
    body: `Creates a Vue application instance. Takes the root component as its argument — the component at the top of your entire component tree.

\`\`\`typescript
const app = createApp(App)
app.mount('#app')
\`\`\`

**The CS concept:** This is the bootstrapping sequence — the minimal setup needed to start the runtime. \`createApp\` creates the application context (plugin registry, global config, error handlers). \`.mount('#app')\` connects it to the DOM and triggers the first render.

**Why a function call, not a class?** Vue 3 uses a factory function rather than \`new App()\` so that multiple independent Vue applications can coexist on the same page without sharing global state.`,
    seeAlso: ['onMounted', 'provide'],
  },
}

/**
 * Register Monaco hover providers for Vue primitives.
 * Call once in CodePanel after Monaco is loaded.
 * Works for both 'javascript' and 'typescript' language modes in .vue files
 * (Monaco treats the <script> block content as TS/JS).
 */
export function registerVueHoverProviders(monaco) {
  const provideHover = (model, position) => {
    const word = model.getWordAtPosition(position)
    if (!word) return null
    const concept = VUE_CONCEPTS[word.word]
    if (!concept) return null

    const seeAlso = concept.seeAlso?.length
      ? `\n\n---\n**See also:** ${concept.seeAlso.map(s => `\`${s}()\``).join(' · ')}`
      : ''

    return {
      range: new monaco.Range(
        position.lineNumber, word.startColumn,
        position.lineNumber, word.endColumn,
      ),
      contents: [
        { value: `### ${concept.title}` },
        { value: concept.body + seeAlso },
      ],
    }
  }

  const disposables = [
    monaco.languages.registerHoverProvider('javascript', { provideHover }),
    monaco.languages.registerHoverProvider('typescript', { provideHover }),
  ]

  // Return disposables so the caller can clean up if needed
  return disposables
}

export { VUE_CONCEPTS }
