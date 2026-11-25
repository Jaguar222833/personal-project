<script setup>
// [ЗАВДАННЯ] вимога 4: маленький компонент «зразок кольору».
// props: колір; emit('pick') — батько сам вирішує, що робити (фільтр, копіювання…)
defineProps({
  color: { type: Object, required: true },        // { hex, share }
  size: { type: String, default: 'md' },          // sm — у картці, md — у палітрі
  active: { type: Boolean, default: false },
  titlePrefix: { type: String, default: 'Колір' },
})

const emit = defineEmits(['pick'])
</script>

<template>
  <button
    type="button"
    class="swatch"
    :class="[`swatch--${size}`, { 'swatch--active': active }]"
    :style="{ '--swatch': color.hex }"
    :title="`${titlePrefix} ${color.hex}`"
    :aria-label="`${titlePrefix} ${color.hex}`"
    :aria-pressed="active"
    @click="emit('pick', color.hex)"
  />
</template>

<style scoped>
.swatch {
  flex: 1 1 0;
  min-width: 1.5rem;
  padding: 0;
  border: 1px solid rgb(127 127 127 / .35);
  border-radius: .4rem;
  background: var(--swatch);
  cursor: pointer;
  transition: transform .4s var(--spring), box-shadow .2s;

  &:hover { transform: translateY(-2px) scale(1.06); }
}

.swatch--sm { height: 1.75rem; }
.swatch--md { height: 2.75rem; }

.swatch--active {
  box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
}
</style>
