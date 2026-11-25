<script setup>
// [ДОДАТКОВО] Пропорційна смуга палітри: ширина кольору = його частка.
// Коли змінюється вага кадру, частки перераховуються (computed у батька),
// а flex-grow плавно «перетікає» завдяки transition.
import { formatShare } from '@/utils/format'

defineProps({
  colors: { type: Array, required: true },     // [{ hex, share }]
  height: { type: String, default: '3rem' },
  labels: { type: Boolean, default: false },   // показувати відсотки на смузі
})
const emit = defineEmits(['pick'])
</script>

<template>
  <div class="bar" :style="{ height }" role="list" aria-label="Палітра">
    <!-- ключ — позиція, а не hex: колір усередині смуги змінюється плавно, а не перестворюється -->
    <button
      v-for="(color, i) in colors"
      :key="i"
      type="button"
      role="listitem"
      class="bar__part"
      :style="{ flexGrow: color.share, background: color.hex }"
      :title="`${color.hex} · ${formatShare(color.share)}`"
      :aria-label="`${color.hex}, ${formatShare(color.share)}`"
      @click="emit('pick', color.hex)"
    >
      <span v-if="labels && color.share >= 0.08" class="bar__label">{{ formatShare(color.share) }}</span>
    </button>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  overflow: hidden;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.bar__part {
  flex-basis: 0;
  min-width: 0;
  display: grid;
  place-items: end start;
  padding: 0;
  border: 0;
  cursor: pointer;
  transition: flex-grow .6s var(--spring), background-color .6s var(--ease-out);

  &:hover { filter: brightness(1.1); }
}

.bar__label {
  margin: .35rem .5rem;
  padding: 0 .35rem;
  border-radius: .3rem;
  background: rgb(0 0 0 / .45);
  color: #fff;
  font-size: .7rem;
  font-weight: 700;
}
</style>
