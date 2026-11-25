<script setup>
import { computed, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { LayoutGrid, Trash2 } from '@lucide/vue'
import { usePhotos } from '@/composables/usePhotos'
import { useBoard } from '@/composables/useBoard'
import { plural } from '@/utils/format'
import BoardItem from './BoardItem.vue'
import EmptyState from './EmptyState.vue'

const emit = defineEmits(['change-view'])

const { photos } = usePhotos()
const { board, count, increment, decrement, remove, clear } = useBoard()

const photosById = computed(() => Object.fromEntries(photos.value.map((p) => [p.id, p])))

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

    <!-- [ДОДАТКОВО] перетягування плиток — бібліотека vue-draggable-plus (SortableJS).
         v-model="board": після перетягування бібліотека сама переставляє масив, а watch зберігає -->
    <p v-else-if="!photos.length" class="muted">Завантажую кадри…</p>
    <VueDraggable
      v-else
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
