<script setup>
// Панель фільтрів. Стан фільтрів живе в батька, а тут — лише поля.
// defineModel() — це props + emit('update:…') в одному рядку (Vue 3.4+):
// батько пише v-model:category="…", і зміна в полі одразу повертається йому.
import { Search } from '@lucide/vue'

defineProps({
  categories: { type: Array, required: true },   // [{ id, label }]
  counts: { type: Object, default: () => ({}) },  // скільки фото в кожній категорії
  sortOptions: { type: Array, required: true },   // [{ value, label, disabled? }]
})

const category = defineModel('category', { type: String, default: 'all' })
const search = defineModel('search', { type: String, default: '' })
const sort = defineModel('sort', { type: String, default: 'default' })
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <label class="field field--search">
        <span class="visually-hidden">Пошук за назвою</span>
        <Search class="field__icon" aria-hidden="true" />
        <!-- [ЗАВДАННЯ] вимога 2: пошук за назвою через v-model → computed у батька -->
        <input
          v-model.trim="search"
          class="input"
          type="search"
          placeholder="Пошук: міст, Porsche, тюльпан…"
          autocomplete="off"
        >
      </label>

      <label class="field field--sort">
        <span class="visually-hidden">Сортування</span>
        <select v-model="sort" class="input">
          <option
            v-for="opt in sortOptions"
            :key="opt.value"
            :value="opt.value"
            :disabled="opt.disabled"
          >
            {{ opt.label }}
          </option>
        </select>
      </label>
    </div>

    <!-- [ЗАВДАННЯ] вимога 2: фільтр за категорією -->
    <div class="chips" role="group" aria-label="Категорія">
      <button
        type="button"
        class="chip"
        :aria-pressed="category === 'all'"
        @click="category = 'all'"
      >
        Усі <span class="chip__count">{{ counts.all ?? 0 }}</span>
      </button>
      <button
        v-for="c in categories"
        :key="c.id"
        type="button"
        class="chip"
        :aria-pressed="category === c.id"
        @click="category = c.id"
      >
        {{ c.label }} <span class="chip__count">{{ counts[c.id] ?? 0 }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  gap: .75rem;
  margin-bottom: 1.25rem;
}

/* [ЗАВДАННЯ] Flexbox з переносом: на телефоні пошук і сортування одне під одним */
.filters__row {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}

.field {
  position: relative;
  display: block;
}

.field--search { flex: 1 1 16rem; }
.field--sort { flex: 1 1 12rem; }

.field--search .input { padding-left: 2.5rem; }

.field__icon {
  position: absolute;
  top: 50%;
  left: .85rem;
  width: 1.1rem;
  height: 1.1rem;
  color: var(--muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  min-height: 2.5rem;
  padding: .25rem .9rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  font-weight: 600;
  font-size: .875rem;
  cursor: pointer;
  transition: border-color .2s, background .2s, transform .4s var(--spring);

  &:hover { border-color: var(--accent); }
  &:active { transform: scale(.95); }

  &[aria-pressed="true"] {
    border-color: transparent;
    background: var(--accent);
    color: var(--on-accent);
  }
}

.chip__count {
  font-size: .75rem;
  opacity: .7;
}
</style>
