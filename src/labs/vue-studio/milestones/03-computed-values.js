export default {
  id: 'computed-values',
  number: 3,
  title: 'Computed Values',
  objective: 'Derive new data from existing state automatically with computed().',
  concepts: [
    { id: 'computed',    label: 'computed() — cached derived state' },
    { id: 'deps',        label: 'dependency tracking — Vue detects what you read' },
    { id: 'readOnly',    label: 'computed is read-only — never .value = something' },
  ],
  files: {
    'src/App.vue':
`<script setup lang="ts">
import { ref, computed } from 'vue'

const price = ref(29.99)
const quantity = ref(1)

const subtotal = computed(() => price.value * quantity.value)
const hasDiscount = computed(() => quantity.value >= 3)
const total = computed(() =>
  hasDiscount.value ? subtotal.value * 0.9 : subtotal.value
)

function increase() { quantity.value++ }
function decrease() { if (quantity.value > 1) quantity.value-- }
</script>

<template>
  <div class="cart">
    <h2>Shopping Cart</h2>
    <div class="row">
      <span>Unit price</span>
      <span>\${{ price.toFixed(2) }}</span>
    </div>
    <div class="row">
      <span>Quantity</span>
      <div class="stepper">
        <button @click="decrease">−</button>
        <span>{{ quantity }}</span>
        <button @click="increase">+</button>
      </div>
    </div>
    <div v-if="hasDiscount" class="badge">10% bulk discount applied (3+)</div>
    <div class="total">Total: \${{ total.toFixed(2) }}</div>
  </div>
</template>

<style scoped>
.cart { font-family: system-ui, sans-serif; max-width: 340px; margin: 40px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; }
.row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.stepper { display: flex; align-items: center; gap: 12px; }
.stepper button { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #cbd5e1; background: none; cursor: pointer; font-size: 16px; }
.badge { margin-top: 12px; padding: 6px 12px; background: #dcfce7; color: #166534; border-radius: 6px; font-size: 13px; }
.total { margin-top: 16px; font-size: 18px; font-weight: 700; color: #41b883; text-align: right; }
</style>`,

    'src/main.ts':
`import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  why: {
    'src/App.vue': `## Why computed() exists

Every time \`quantity\` changes, \`total\` needs to update. You could update it manually inside \`increase()\` and \`decrease()\`. But as the computation grows, you will forget somewhere — a new place that changes \`quantity\` that does not update \`total\`.

\`computed()\` eliminates this class of bug. Vue tracks the dependencies automatically. When \`quantity\` changes, \`total\` updates — everywhere, always, with no manual wiring.

**The CS concept:** Reactive derivation — also called a derived observable or a spreadsheet formula. Excel does this with cell formulas. Vue does it with \`computed\`.`,
  },
}
