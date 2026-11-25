<script setup>
import { computed } from 'vue'
import { usePhotos } from '@/composables/usePhotos'
import PhotoCard from './PhotoCard.vue'

const { photos, categories, loading, error, reload } = usePhotos()

// id категорії → підпис українською
const categoryLabels = computed(() =>
  Object.fromEntries(categories.value.map((c) => [c.id, c.label])),
)
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

    <ul v-else class="grid">
      <li v-for="photo in photos" :key="photo.id">
        <PhotoCard :photo="photo" :category-label="categoryLabels[photo.category]" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.intro {
  max-width: 65ch;
  margin-bottom: 1.5rem;
}

/* [ЗАВДАННЯ] вимога 7 + прийом з КП № 1: сітка без медіазапитів.
   auto-fill + minmax(min(17rem, 100%), 1fr): на телефоні 1 колонка, далі скільки вміститься.
   min(…, 100%) не дає картці бути ширшою за екран 320 px */
.grid {
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
