<script setup>
// [ЗАВДАННЯ] вимога 6: окреме повідомлення для порожнього стану.
// Один компонент і для «нічого не знайдено», і для порожнього мудборду:
// текст — через props, кнопки дій — через слот.
defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
})
</script>

<template>
  <div class="empty" role="status">
    <div class="empty__icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <h2 class="empty__title">{{ title }}</h2>
    <p v-if="text" class="muted">{{ text }}</p>
    <div class="empty__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: grid;
  justify-items: center;
  gap: .25rem;
  padding: 3rem 1rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  text-align: center;

  & p { max-width: 45ch; }
}

.empty__icon {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: .5rem;
  border-radius: 50%;
  background: var(--glow-soft);
  color: var(--accent-hi);

  &:empty { display: none; }
  & :deep(svg) { width: 1.75rem; height: 1.75rem; }
}

.empty__title { font-size: 1.15rem; }

.empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .5rem;
}
</style>
