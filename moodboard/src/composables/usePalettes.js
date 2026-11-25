import { computed, ref } from 'vue'
import { extractColors } from 'extract-colors'
import { imageUrl } from './usePhotos'
import { normalizePalette } from '@/utils/color'

// [ДОДАТКОВО] Кольори кожного кадру рахуються просто в браузері.
// Бібліотека extract-colors малює зменшене фото на <canvas>, читає пікселі
// й групує схожі — повертає основні кольори з їхньою площею (area).
// Результат кешуємо в localStorage, щоб наступного разу не рахувати знову.

const CACHE_KEY = 'moodboard:palettes:v1'   // v1 — якщо зміню налаштування, зміню й ключ
const OPTIONS = {
  pixels: 16000,      // фото зменшується приблизно до 150 × 100 — швидко і достатньо точно
  distance: 0.2,      // наскільки різними мають бути кольори, щоб не злитись в один
}

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(palettes.value))
  } catch {
    // немає місця — нічого страшного, перерахуємо наступного разу
  }
}

// { [id кадру]: [{ hex, share }] } — спільне для всього застосунку
const palettes = ref(loadCache())
const pending = ref(0)          // скільки кадрів ще в черзі
let running = false

async function analyse(photo) {
  try {
    const colors = await extractColors(imageUrl(photo.image.small), OPTIONS)
    palettes.value[photo.id] = normalizePalette(colors)
  } catch {
    palettes.value[photo.id] = []     // не вдалося — порожня палітра, щоб не пробувати безкінечно
  }
}

// порахувати кольори для всіх кадрів, яких ще немає в кеші, — по 4 одночасно
async function ensure(photos) {
  if (running) return
  const todo = photos.filter((p) => !palettes.value[p.id])
  if (!todo.length) return

  running = true
  pending.value = todo.length
  const queue = [...todo]
  const worker = async () => {
    while (queue.length) {
      await analyse(queue.shift())
      pending.value--
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()])
  running = false
  saveCache()
}

const analysing = computed(() => pending.value > 0)

export function usePalettes() {
  return { palettes, pending, analysing, ensure }
}
