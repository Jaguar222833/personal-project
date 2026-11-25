<script setup>
import { computed, nextTick, useTemplateRef } from 'vue'
import { ScanSearch, SearchX, X } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { usePhotos } from '@/composables/usePhotos'
import { useFilters } from '@/composables/useFilters'
import { useBoard } from '@/composables/useBoard'
import { usePalettes } from '@/composables/usePalettes'
import { useBoardPalette } from '@/composables/useBoardPalette'
import { useSimilar } from '@/composables/useSimilar'
import { hasColor, lightness, paletteDistance, warmth } from '@/utils/color'
import { plural } from '@/utils/format'
import EmptyState from './EmptyState.vue'
import FilterBar from './FilterBar.vue'
import PhotoCard from './PhotoCard.vue'
import BoardTray from './BoardTray.vue'

const emit = defineEmits(['change-view'])

const { photos, categories, loading, error, reload } = usePhotos()
const { category, search, sort, color, similarTo, reset } = useFilters()
const board = useBoard()
const { palettes, pending, analysing } = usePalettes()
const { boardPalette } = useBoardPalette()
const { nearestTo } = useSimilar()

const top = useTemplateRef('top')

// id категорії → підпис українською
const categoryLabels = computed(() =>
  Object.fromEntries(categories.value.map((c) => [c.id, c.label])),
)

const photosById = computed(() => Object.fromEntries(photos.value.map((p) => [p.id, p])))

// кількість фото в кожній категорії — для цифр на кнопках фільтра
const counts = computed(() => {
  const result = { all: photos.value.length }
  for (const p of photos.value) result[p.category] = (result[p.category] ?? 0) + 1
  return result
})

// варіанти сортування; «схожі на мудборд» доступне лише коли на дошці щось є
const sortOptions = computed(() => [
  { value: 'default', label: 'Порядок автора' },
  { value: 'title', label: 'За назвою А → Я' },
  { value: 'price-asc', label: 'Пресет: дешевші спершу' },
  { value: 'price-desc', label: 'Пресет: дорожчі спершу' },
  { value: 'light', label: 'Світлі кадри спершу' },
  { value: 'dark', label: 'Темні кадри спершу' },
  { value: 'warm', label: 'Теплі кадри спершу' },
  { value: 'cool', label: 'Холодні кадри спершу' },
  { value: 'board', label: 'Схожі на мій мудборд', disabled: !boardPalette.value.length },
])

// сортування за числом, яке рахується з палітри кадру; кадри без палітри — в кінці
function byPalette(list, score) {
  const value = (p) => (palettes.value[p.id]?.length ? score(palettes.value[p.id]) : Infinity)
  return list.sort((a, b) => value(a) - value(b))
}

// id кадрів, у яких є обраний колір
const matches = computed(() => {
  if (!color.value) return new Set()
  return new Set(
    photos.value
      .filter((p) => palettes.value[p.id] && hasColor(palettes.value[p.id], color.value))
      .map((p) => p.id),
  )
})

// [ЗАВДАННЯ] вимога 2: фільтр і пошук — computed.
// Vue сам стежить, від чого залежить ця функція (photos, category, search, sort, color…),
// і перераховує список лише коли щось із цього змінилось. Жодного ручного DOM.
const visiblePhotos = computed(() => {
  const query = search.value.toLowerCase()

  let list = photos.value.filter((p) => {
    const inCategory = category.value === 'all' || p.category === category.value
    const matches = !query
      || p.title.toLowerCase().includes(query)
      || p.place.toLowerCase().includes(query)
    return inCategory && matches
  })

  // [ДОДАТКОВО] пошук за кольором: кадри з цим кольором — нагору, решту не ховаємо,
  // а показуємо сірими (див. matches і клас card--dim у PhotoCard)
  if (color.value) {
    list = [...list.filter((p) => matches.value.has(p.id)), ...list.filter((p) => !matches.value.has(p.id))]
  }

  // [ДОДАТКОВО] «Схожі»: найсхожіші на обраний кадр — нагорі (сам кадр перший, відстань 0)
  const reference = palettes.value[similarTo.value]
  if (similarTo.value && reference) {
    return byPalette(list, (pal) => paletteDistance(reference, pal))
  }

  // filter() уже повернув новий масив, тому sort() тут не псує photos
  switch (sort.value) {
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title, 'uk'))
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'light':
      return byPalette(list, (pal) => -lightness(pal))
    case 'dark':
      return byPalette(list, (pal) => lightness(pal))
    case 'warm':
      return byPalette(list, (pal) => -warmth(pal))
    case 'cool':
      return byPalette(list, (pal) => warmth(pal))
    case 'board':
      return boardPalette.value.length
        ? byPalette(list, (pal) => paletteDistance(boardPalette.value, pal))
        : list
    default:
      return list
  }
})

// текст для «нічого не знайдено» залежить від того, що саме відфільтрувало все
const emptyText = computed(() => {
  if (search.value) return `За запитом «${search.value}» кадрів немає. Спробуйте інше слово або всі категорії.`
  return 'У цій категорії кадрів немає.'
})

function scrollToTop() {
  nextTick(() => top.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

// клік по кольору: увімкнути фільтр, повторний клік по тому самому — вимкнути
function pickColor(hex) {
  color.value = color.value === hex ? '' : hex
  scrollToTop()
}

function showSimilar(id) {
  similarTo.value = id
  scrollToTop()
}

// [ДОДАТКОВО] «Зібрати мудборд»: кадр + 5 найсхожіших за кольором
function collect(id) {
  const ids = [id, ...nearestTo(id, 5).map((p) => p.id)]
  const added = board.addMany(ids)
  toast.success(
    added
      ? `Додано ${plural(added, { one: 'кадр', few: 'кадри', many: 'кадрів' })} у мудборд`
      : 'Ці кадри вже на мудборді',
    { action: { label: 'Відкрити', onClick: () => emit('change-view', 'board') } },
  )
}

// для нижньої панелі — кадри мудборду
const boardPhotos = computed(() =>
  board.board.value.map((item) => photosById.value[item.id]).filter(Boolean),
)
</script>

<template>
  <section class="container" aria-labelledby="gallery-title">
    <div class="intro">
      <h1 id="gallery-title">Зберіть мудборд з моїх фото</h1>
      <p class="muted">
        Додавайте кадри — палітра збереться сама. Натисніть колір, щоб знайти кадри з ним,
        або <ScanSearch class="inline-icon" aria-label="«Схожі»" /> — щоб побачити схожі.
        Кожен кадр має пресет Lightroom з його обробкою.
      </p>
    </div>

    <p v-if="loading" class="state">Завантажую фото…</p>
    <div v-else-if="error" class="state state--error" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="btn" @click="reload">Спробувати ще раз</button>
    </div>

    <template v-else>
      <div ref="top" class="anchor" />
      <FilterBar
        v-model:category="category"
        v-model:search="search"
        v-model:sort="sort"
        :categories="categories"
        :counts="counts"
        :sort-options="sortOptions"
      />

      <!-- активні «кольорові» фільтри — плашки з хрестиком -->
      <div v-if="color || similarTo" class="active-filters">
        <button v-if="color" type="button" class="pill" @click="color = ''">
          <span class="pill__dot" :style="{ background: color }" />
          Колір {{ color }}
          <X aria-label="прибрати фільтр" />
        </button>
        <button v-if="similarTo && photosById[similarTo]" type="button" class="pill" @click="similarTo = ''">
          <ScanSearch aria-hidden="true" />
          Схожі на «{{ photosById[similarTo].title }}»
          <X aria-label="прибрати" />
        </button>
      </div>

      <p class="summary muted" aria-live="polite">
        Знайдено {{ plural(visiblePhotos.length, { one: 'кадр', few: 'кадри', many: 'кадрів' }) }}
        <span v-if="color"> · з кольором {{ color }} — {{ visiblePhotos.filter((p) => matches.has(p.id)).length || 'жодного' }}</span>
        <span v-if="analysing"> · рахую кольори, залишилось {{ pending }}</span>
      </p>

      <!-- [ЗАВДАННЯ] вимога 6: окреме повідомлення «нічого не знайдено» -->
      <EmptyState v-if="!visiblePhotos.length" title="Нічого не знайдено" :text="emptyText">
        <template #icon><SearchX /></template>
        <button type="button" class="btn btn--primary" @click="reset">Скинути фільтри</button>
      </EmptyState>

      <!-- [ДОДАТКОВО] TransitionGroup анімує появу, зникнення й переставляння карток -->
      <TransitionGroup v-else tag="ul" name="list" class="grid">
        <li v-for="photo in visiblePhotos" :key="photo.id">
          <PhotoCard
            :photo="photo"
            :category-label="categoryLabels[photo.category]"
            :palette="palettes[photo.id] ?? null"
            :in-board="board.has(photo.id)"
            :active-color="color"
            :match="color ? matches.has(photo.id) : null"
            @add="board.add"
            @remove="board.remove"
            @pick-color="pickColor"
            @similar="showSimilar"
            @collect="collect"
          />
        </li>
      </TransitionGroup>
    </template>

    <BoardTray
      v-if="board.count.value"
      :photos="boardPhotos"
      :count="board.count.value"
      :palette="boardPalette"
      @open="emit('change-view', 'board')"
      @pick-color="pickColor"
    />
  </section>
</template>

<style scoped>
/* місце під нижню панель, щоб вона не закривала останній ряд карток */
section:has(.tray) { padding-bottom: 4.5rem; }

.intro {
  max-width: 65ch;
  margin-bottom: 1.5rem;
}

.inline-icon {
  width: 1em;
  height: 1em;
  vertical-align: -.15em;
}

.anchor { scroll-margin-top: calc(var(--header-h) + 1rem); }

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin-bottom: .75rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  max-width: 100%;
  min-height: 2.5rem;
  padding: .25rem .5rem .25rem .75rem;
  border: 1px solid var(--accent);
  border-radius: 999px;
  background: var(--glow-soft);
  font-weight: 600;
  font-size: .875rem;
  text-align: left;
  cursor: pointer;

  & svg { flex-shrink: 0; width: 1rem; height: 1rem; }
  &:hover { background: var(--glow); }
}

.pill__dot {
  flex-shrink: 0;
  width: 1.1rem;
  height: 1.1rem;
  border: 1px solid rgb(127 127 127 / .5);
  border-radius: 50%;
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
