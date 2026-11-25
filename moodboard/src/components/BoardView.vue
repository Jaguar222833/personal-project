<script setup>
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { toPng } from 'html-to-image'
import { VueDraggable } from 'vue-draggable-plus'
import { LayoutGrid, Sparkles, Trash2 } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { usePhotos } from '@/composables/usePhotos'
import { useBoard } from '@/composables/useBoard'
import { useBoardPalette } from '@/composables/useBoardPalette'
import { useFilters } from '@/composables/useFilters'
import { useSimilar } from '@/composables/useSimilar'
import { plural } from '@/utils/format'
import BoardItem from './BoardItem.vue'
import EmptyState from './EmptyState.vue'
import PaletteBar from './PaletteBar.vue'
import PaletteDetails from './PaletteDetails.vue'
import ExportPanel from './ExportPanel.vue'
import MoodPoster from './MoodPoster.vue'
import PresetSummary from './PresetSummary.vue'
import PurchaseDialog from './PurchaseDialog.vue'

const emit = defineEmits(['change-view'])

const { photos } = usePhotos()
const { board, count, add, increment, decrement, remove, clear } = useBoard()

const { boardPalette } = useBoardPalette()
const { rank } = useSimilar()
const filters = useFilters()

// [ДОДАТКОВО] «Доповнити схожими»: 3 кадри, найближчі до палітри всього мудборду
function addSimilar() {
  const ids = board.value.map((item) => item.id)
  const found = rank(boardPalette.value, ids).slice(0, 3).map((r) => r.photo)
  found.forEach((p) => add(p.id))
  toast.success(found.length ? `Додано: ${found.map((p) => p.title).join(', ')}` : 'Схожих кадрів більше немає')
}

// клік по кольору палітри — перейти в галерею з фільтром за цим кольором
function findByColor(hex) {
  filters.reset()
  filters.color.value = hex
  emit('change-view', 'gallery')
}

const photosById = computed(() => Object.fromEntries(photos.value.map((p) => [p.id, p])))

// кадри мудборду разом з вагою — для постера
const items = computed(() =>
  board.value
    .map((item) => ({ photo: photosById.value[item.id], weight: item.weight }))
    .filter((item) => item.photo),
)

// [ДОДАТКОВО] покупка пресетів: вікно з формою і сума, з якою його відкрили
const purchase = ref({ open: false, total: 0, count: 0 })
function openPurchase({ total, count }) {
  purchase.value = { open: true, total, count }
}

// [ДОДАТКОВО] PNG мудборду: бібліотека html-to-image «фотографує» компонент MoodPoster
const exporting = ref(false)
const poster = useTemplateRef('poster')

async function downloadPng() {
  exporting.value = true
  await nextTick()                                   // постер з'явився в DOM
  const node = poster.value.$el
  try {
    // дочекатися, поки всі фото постера завантажаться
    await Promise.all([...node.querySelectorAll('img')].map((img) => img.decode().catch(() => {})))
    // постер схований за межами екрана, тому для знімка повертаємо його на місце
    const dataUrl = await toPng(node, { pixelRatio: 1, style: { position: 'static', left: '0' } })
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'moodboard.png'
    link.click()
    toast.success('PNG збережено')
  } catch {
    toast.error('Не вдалося зробити PNG')
  } finally {
    exporting.value = false
  }
}

// [ДОДАТКОВО] «Очистити» з підтвердженням усередині сторінки (без confirm())
const confirmClear = ref(false)
function doClear() {
  clear()
  confirmClear.value = false
}
</script>

<template>
  <section class="container" aria-labelledby="board-title">
    <div class="head">
      <div>
        <h1 id="board-title">Мій мудборд</h1>
        <p class="muted">
          {{ count ? plural(count, { one: 'кадр', few: 'кадри', many: 'кадрів' }) : 'Поки порожньо' }}
          · кнопки + / − змінюють вагу кадру, плитки можна перетягувати
        </p>
      </div>

      <div v-if="count" class="head__actions">
        <template v-if="!confirmClear">
          <button
            type="button"
            class="btn btn--small"
            :disabled="!boardPalette.length"
            @click="addSimilar"
          >
            <Sparkles aria-hidden="true" /> Доповнити схожими
          </button>
          <button type="button" class="btn btn--ghost btn--small" @click="confirmClear = true">
            <Trash2 aria-hidden="true" /> Очистити
          </button>
        </template>
        <template v-else>
          <span class="muted">Прибрати всі кадри?</span>
          <button type="button" class="btn btn--small btn--danger" @click="doClear">Так, очистити</button>
          <button type="button" class="btn btn--ghost btn--small" @click="confirmClear = false">Ні</button>
        </template>
      </div>
    </div>

    <!-- [ЗАВДАННЯ] вимога 6: окреме повідомлення для порожнього мудборду -->
    <EmptyState
      v-if="!count"
      title="Мудборд порожній"
      text="Додайте кадри в галереї — тут з'явиться дошка і палітра з їхніх кольорів."
    >
      <template #icon><LayoutGrid /></template>
      <button type="button" class="btn btn--primary" @click="emit('change-view', 'gallery')">
        До галереї
      </button>
    </EmptyState>

    <p v-else-if="!photos.length" class="muted">Завантажую кадри…</p>

    <div v-else class="layout">
      <!-- [ДОДАТКОВО] перетягування плиток — бібліотека vue-draggable-plus (SortableJS).
           v-model="board": після перетягування бібліотека сама переставляє масив, а watch зберігає -->
      <VueDraggable
        v-model="board"
        class="board"
        :animation="250"
        handle=".tile__handle"
        ghost-class="tile--ghost"
      >
        <BoardItem
          v-for="item in board"
          :key="item.id"
          :photo="photosById[item.id]"
          :weight="item.weight"
          @increment="increment"
          @decrement="decrement"
          @remove="remove"
        />
      </VueDraggable>

      <!-- палітра — «загальна сума» мудборду: перераховується при кожній зміні -->
      <aside class="side" aria-labelledby="palette-title">
        <h2 id="palette-title" class="side__title">Палітра</h2>
        <PaletteBar
          v-if="boardPalette.length"
          :colors="boardPalette"
          height="4.5rem"
          labels
          @pick="findByColor"
        />
        <p v-else class="muted">Рахую кольори…</p>

        <template v-if="boardPalette.length">
          <PaletteDetails :colors="boardPalette" @find="findByColor" />
          <h2 class="side__title">Пресети Lightroom</h2>
          <PresetSummary :photos="items.map((i) => i.photo)" @buy="openPurchase" />
          <h2 class="side__title">Експорт</h2>
          <ExportPanel :colors="boardPalette" :busy="exporting" @download-png="downloadPng" />
        </template>
      </aside>
    </div>

    <PurchaseDialog
      :open="purchase.open"
      :total="purchase.total"
      :count="purchase.count"
      @close="purchase.open = false"
      @done="purchase.open = false"
    />

    <!-- постер для PNG рендериться лише на час знімка -->
    <MoodPoster v-if="exporting" ref="poster" class="offscreen" :items="items" :colors="boardPalette" />
  </section>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: .75rem 1.5rem;
  margin-bottom: 1.25rem;

  & p { margin: 0; }
}

.head__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .5rem;
}

.btn--danger {
  border-color: transparent;
  background: var(--danger);
  color: #fff;
}

/* [ЗАВДАННЯ] вимога 7: дошка без медіазапитів.
   [1] колонки по 8rem — на телефоні 2, на ноутбуці 6–8;
   [2] рядки фіксованої висоти, щоб плитка 2×2 була рівно вдвічі більшою;
   [3] dense — менші плитки заповнюють дірки після великих */
.board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));   /* [1] */
  grid-auto-rows: 8rem;                                           /* [2] */
  grid-auto-flow: dense;                                          /* [3] */
  gap: .5rem;
}

/* [1] телефон: дошка, під нею палітра.
   [2] від 64rem — дві колонки: дошка і бічна панель, що «липне» під час прокрутки */
.layout {
  display: grid;
  gap: 1.5rem;
}

.side {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.side__title { margin: 0; }

@media (width >= 64rem) {
  .layout { grid-template-columns: minmax(0, 1fr) 22rem; }       /* [2] */
  .side {
    position: sticky;
    top: calc(var(--header-h) + 1rem);
  }
}

.offscreen {
  position: fixed;
  top: 0;
  left: -99999px;
}

/* плитка, яку зараз тягнуть, — напівпрозора */
.board :deep(.tile--ghost) { opacity: .35; }

/* [1] від 48rem плитки більші */
@media (width >= 48rem) {
  .board {
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    grid-auto-rows: 10rem;
  }
}
</style>
