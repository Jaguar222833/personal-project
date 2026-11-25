<script setup>
// [ДОДАТКОВО] Число, що «перекочується» барабаном, а не стрибає.
// Анімацію робить бібліотека NumberFlow (@number-flow/vue); якщо користувач просить
// менше руху (prefers-reduced-motion), вона сама показує нове число одразу.
import { computed } from 'vue'
import NumberFlow from '@number-flow/vue'

const props = defineProps({
  value: { type: Number, required: true },
  kind: { type: String, default: 'int' },   // int — ціле, price — гривні, percent — частка 0…1
})

const format = computed(() => {
  if (props.kind === 'price') return { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }
  if (props.kind === 'percent') return { style: 'percent', maximumFractionDigits: 0 }
  return {}
})
</script>

<template>
  <NumberFlow :value="value" :format="format" locales="uk-UA" />
</template>
