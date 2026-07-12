---
series: vue-fundamentals
level: 2
title: Components, Props, and Emits
lang: javascript
---

# Components, Props, and Emits

Vue applications are built from components that communicate with each other. Parent components pass data to children via **props** (downward). Children communicate changes back to parents via **emits** (events upward). This one-way data flow makes the application predictable: you always know where data comes from and where changes originate.

This lesson covers how to define props with validation, how to emit typed events with defineEmits, the v-model pattern for form components, and how to build a component tree with clear communication patterns.

## Props: data flowing down

```html
<!-- ProductCard.vue -->
<template>
  <div class="product-card" :class="{ 'out-of-stock': !product.inStock }">
    <img :src="product.imageUrl" :alt="product.name">
    <h3>{{ product.name }}</h3>
    <p class="price">${{ product.price.toFixed(2) }}</p>
    <p v-if="!product.inStock" class="badge">Out of stock</p>
    <button
      :disabled="!product.inStock || isAddingToCart"
      @click="$emit('addToCart', product)"
    >
      {{ isAddingToCart ? 'Adding...' : 'Add to cart' }}
    </button>
  </div>
</template>

<script setup>
// defineProps: declares what props this component accepts
const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator: (p) => p.id && p.name && typeof p.price === 'number'
  },
  isAddingToCart: {
    type: Boolean,
    default: false
  }
})
</script>
```

```text
PROP VALIDATION:
  Vue validates props at runtime (development mode only):
  
  type:     Object, String, Number, Boolean, Array, Function, Date, Symbol
            Can be an array for multiple accepted types: [String, Number]
  required: if true, Vue warns if the prop is not passed
  default:  the value used when the prop is not passed
  validator: a function that returns true if the prop value is valid
  
  WHY VALIDATION MATTERS:
    A validator catches "product is missing the price field" immediately,
    at the point where the prop is passed, rather than deep inside the
    component when it tries to call product.price.toFixed(2) and crashes.
    
  PROP IMMUTABILITY:
    Props must never be mutated by the child:
    ✗ props.product.price = 0    — mutating a prop
    ✓ emit('updatePrice', 0)     — tell the parent to change it
    ✓ const localPrice = ref(props.product.price)  — copy for local state
```

## Emits: events flowing up

```html
<!-- SearchBar.vue -->
<template>
  <div class="search-bar">
    <input
      type="search"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.enter="$emit('search', modelValue)"
      placeholder="Search products..."
    >
    <button @click="$emit('search', modelValue)">Search</button>
    <button v-if="modelValue" @click="$emit('update:modelValue', '')">Clear</button>
  </div>
</template>

<script setup>
// defineEmits: declares what events this component emits
// TypeScript-style: tuples define the payload type
const emit = defineEmits({
  // 'update:modelValue' is the Vue convention for v-model
  'update:modelValue': (value) => typeof value === 'string',  // validator
  'search': (query) => typeof query === 'string',
})

defineProps({
  modelValue: { type: String, default: '' }
})
</script>
```

```html
<!-- PARENT USING SearchBar -->
<template>
  <div>
    <!-- v-model on a component = :modelValue + @update:modelValue -->
    <SearchBar v-model="query" @search="handleSearch" />
    <p>Current query: {{ query }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const query = ref('')

function handleSearch(q) {
  console.log('Searching for:', q)
}
</script>
```

```text
v-model ON COMPONENTS:
  On native inputs: v-model = :value + @input
  On Vue components: v-model = :modelValue + @update:modelValue
  
  <SearchBar v-model="query"> compiles to:
    <SearchBar :modelValue="query" @update:modelValue="query = $event">
  
  This is the standard contract for form components:
    Prop:  modelValue (the current value)
    Event: update:modelValue (emitted when value should change)
  
  MULTIPLE v-models (Vue 3):
    <UserEditor v-model:name="name" v-model:email="email">
    ↓ compiles to:
    <UserEditor :name="name" @update:name="name=$event"
                :email="email" @update:email="email=$event">
```

**CS lens:** The `emit` + `v-model` pattern is an implementation of **bidirectional data binding through events**. The parent owns the state. The child displays it (via `modelValue` prop) and signals intent to change it (via `update:modelValue` emit). The parent decides whether to accept the change by updating its state. This is the same pattern as callback functions in React (`onChange={handler}`) and the Observer pattern (child is the subject; parent is the observer). The naming convention (`update:propName`) is a Vue-specific contract that enables the `v-model` shorthand.

## Provide / Inject: avoiding prop drilling

When data needs to reach a deeply nested component, passing it through every intermediate component as props (prop drilling) is tedious and couples the intermediate components to data they don't use.

```javascript
// PROBLEM: 5 levels of prop drilling just to pass the user to a deeply nested component
// App → Layout → Page → Section → UserBadge
// Layout, Page, and Section all have to accept and pass the user prop

// SOLUTION: provide at the ancestor, inject at the descendant
// App.vue
import { provide, ref } from 'vue'
const currentUser = ref(null)
provide('currentUser', currentUser)   // makes it available to all descendants

// UserBadge.vue (5 levels deep — doesn't need intermediate components to pass it)
import { inject } from 'vue'
const currentUser = inject('currentUser')  // receives the ref from the ancestor
// <span>{{ currentUser?.name }}</span>
```

```text
PROVIDE / INJECT vs PROPS:
  Props: explicit, discoverable, type-checked by defineProps
         Use for direct parent → child communication
         Use for component APIs (what data a component needs to function)
  
  Provide/Inject: implicit (not visible in component signature)
                  Use for cross-cutting concerns: auth, theme, i18n, router
                  Use when passing through 3+ levels
  
  OVERUSE OF PROVIDE/INJECT creates:
    → Hidden dependencies: components that "just work" only in certain contexts
    → Hard to test: must mock the provide context in tests
    
  Prefer props for specific data.
  Use provide/inject for app-level concerns (current user, theme, configuration).
```

**SE lens:** `provide`/`inject` is Vue's equivalent of React's Context API. Both solve the same problem — sharing data without prop drilling — using the same mechanism: an ancestor injects a value into the component tree, descendants consume it without needing intermediaries. The tradeoff is the same: reduced boilerplate vs reduced explicitness. This pattern appears in dependency injection frameworks (Angular's DI, Spring's IoC) and in service locator patterns. The principle: some values are "environment" (available everywhere, like the current user) vs "data" (passed explicitly, like a product's price).

**Common mistakes:**
- Emitting events that the parent doesn't listen to — `$emit('updateUser', user)` does nothing if the parent doesn't have `@updateUser`. Vue doesn't warn about this. Always verify the parent is listening. Vue DevTools shows which events are emitted.
- Mutating injected values from the inject side — if a child injects a reactive value and mutates it, it mutates the ancestor's state directly without going through a controlled update path. Provide both the value and an update function: `provide('user', { value: user, update: setUser })`.
- Using `provide`/`inject` for component-level state — if only two sibling components need to share state, don't use provide/inject. Lift the state to their common parent and pass it via props.

**Debug tip:** Vue DevTools shows the component's injected values in the Components panel. If a component doesn't receive a provided value, check that provide is in an ancestor (not a sibling), and that the key string matches exactly (strings are case-sensitive). Vue warns in development mode when `inject('key')` is called but no ancestor provides 'key'.

## Challenge: buildComponentCommunication

Implement parent-child communication without a framework.

```challenge
function createComponentSystem() {
  // Simulates Vue's parent-child communication pattern.
  //
  // createParent(initialState)
  //   Returns a parent "component" with:
  //     .state: reactive object with the current state
  //     .provideToChild(key, value): makes a value available to children
  //     .createChild(childDef): creates a child component with access to parent
  //
  // createChild(props, parentProvisions)
  //   Returns a child "component" with:
  //     .props: the props object
  //     .emit(eventName, ...args): emits an event
  //     .inject(key): returns a value provided by the parent (or null)
  //     .onEmit(eventName, handler): registers an event listener (on parent's side)
}
```

```test
const system = createComponentSystem()

// Parent setup
const parent = system.createParent({ count: 0 })
parent.provideToChild('theme', 'dark')

const childDef = {
  props: { label: 'Counter' },
}
const child = parent.createChild(childDef)

// Child accesses props
assert child.props.label === 'Counter'

// Child injects from parent
assert child.inject('theme') === 'dark'
assert child.inject('nonexistent') === null

// Child emits, parent listens
const emitted = []
parent.onEmit('increment', (value) => {
  parent.state.count += value
  emitted.push(value)
})

child.emit('increment', 1)
assert parent.state.count === 1
assert emitted[0] === 1

child.emit('increment', 5)
assert parent.state.count === 6
assert emitted.length === 2
```
