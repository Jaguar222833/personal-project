<script setup>
import { computed } from 'vue'
import { SearchX } from '@lucide/vue'
import { usePhotos } from '@/composables/usePhotos'
import { useFilters } from '@/composables/useFilters'
import { plural } from '@/utils/format'
import EmptyState from './EmptyState.vue'
import FilterBar from './FilterBar.vue'
import PhotoCard from './PhotoCard.vue'

const { photos, categories, loading, error, reload } = usePhotos()
const { category, search, sort, reset } = useFilters()

// id категорії → підпис українською
const categoryLabels = computed(() =>
  Object.fromEntries(categories.value.map((c) => [c.id, c.label])),
)

// кількість фото в кожній категорії — для цифр на кнопках фільтра
const counts = computed(() => {
  const result = { all: photos.value.length }
  for (const p of photos.value) result[p.category] = (result[p.category] ?? 0) + 1
  return result
})

const sortOptions = [
  { value: 'default', label: 'Порядок автора' },
  { value: 'title', label: 'За назвою А → Я' },
  { value: 'price-asc', label: 'Пресет: дешевші спершу' },
  { value: 'price-desc', label: 'Пресет: дорожчі спершу' },
]

// [ЗАВДАННЯ] вимога 2: фільтр і пошук — computed.
// Vue сам стежить, від чого залежить ця функція (photos, category, search, sort),
// і перераховує список лише коли щось із цього змінилось. Жодного ручного DOM.
const visiblePhotos = computed(() => {
  const query = search.value.toLowerCase()

  const list = photos.value.filter((p) => {
    const inCategory = category.value === 'all' || p.category === category.value
    const matches = !query
      || p.title.toLowerCase().includes(query)
      || p.place.toLowerCase().includes(query)
    return inCategory && matches
  })

  // sort змінює масив на місці, тому сортуємо копію — список вище вже новий
  switch (sort.value) {
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title, 'uk'))
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    default:
      return list
  }
})
</script>

<template>
  <section class="container" aria-labelledby="gallery-title">
    <div class="intro">
      <h1 id="gallery-title">Зберіть мудборд з моїх фото</h1>
      <p class="muted">
        Додавайте кадри — палітра збереться сама. Кожен кадр має пресет Lightroom з його обробкою.
      </p>
    </div>

    <p v-if="loading" class="state">Завантажую фото…</p>
    <div v-else-if="error" class="state state--error" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="btn" @click="reload">Спробувати ще раз</button>
    </div>

    <template v-else>
      <FilterBar
        v-model:category="category"
        v-model:search="search"
        v-model:sort="sort"
        :categories="categories"
        :counts="counts"
        :sort-options="sortOptions"
      />

      <p class="summary muted" aria-live="polite">
        Знайдено {{ plural(visiblePhotos.length, { one: 'кадр', few: 'кадри', many: 'кадрів' }) }}
      </p>

      <!-- [ЗАВДАННЯ] вимога 6: окреме повідомлення «нічого не знайдено» -->
      <EmptyState
        v-if="!visiblePhotos.length"
        title="Нічого не знайдено"
        :text="`За запитом «${search}» у цій категорії кадрів немає. Спробуйте інше слово або всі категорії.`"
      >
        <template #icon><SearchX /></template>
        <button type="button" class="btn btn--primary" @click="reset">Скинути фільтри</button>
      </EmptyState>

      <!-- [ДОДАТКОВО] TransitionGroup анімує появу, зникнення й переставляння карток -->
      <TransitionGroup v-else tag="ul" name="list" class="grid">
        <li v-for="photo in visiblePhotos" :key="photo.id">
          <PhotoCard :photo="photo" :category-label="categoryLabels[photo.category]" />
        </li>
      </TransitionGroup>
    </template>
  </section>
</template>

<style scoped>
.intro {
  max-width: 65ch;
  margin-bottom: 1.5rem;
}

.summary {
  margin-bottom: .75rem;
  font-size: .875rem;
}

/* [ЗАВДАННЯ] вимога 7 + прийом з КП № 1: сітка без медіазапитів.
   auto-fill + minmax(min(17rem, 100%), 1fr): на телефоні 1 колонка, далі скільки вміститься.
   min(…, 100%) не дає картці бути ширшою за екран 320 px */
.grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--muted);
}

.state--error { color: var(--danger); }
</style>
