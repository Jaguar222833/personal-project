import { ref } from 'vue'

// [ЗАВДАННЯ] вимога 1: дані каталогу — JSON-файл, який завантажується через fetch.
// Файл лежить у public/, тому Vite віддає його як є: /moodboard/photos.json.
// BASE_URL — це base з vite.config.js, щоб шлях працював і локально, і на сервері.
const BASE = import.meta.env.BASE_URL

// стан спільний для всього застосунку (оголошений поза функцією),
// тому файл завантажується один раз, хоч би скільки компонентів викликали usePhotos()
const photos = ref([])
const categories = ref([])
const loading = ref(false)
const error = ref('')

// шлях до картинки з JSON → повна адреса з урахуванням base
export function imageUrl(path) {
  return BASE + path
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`${BASE}photos.json`)
    // fetch не кидає помилку на 404/500 — перевіряємо статус самі
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    categories.value = data.categories
    photos.value = data.photos
  } catch (e) {
    error.value = `Не вдалося завантажити фото (${e.message}).`
  } finally {
    loading.value = false
  }
}

export function usePhotos() {
  // перший виклик запускає завантаження, наступні просто отримують той самий стан
  if (!photos.value.length && !loading.value) load()
  return { photos, categories, loading, error, reload: load }
}
