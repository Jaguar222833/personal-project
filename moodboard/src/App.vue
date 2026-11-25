<script setup>
import { nextTick, ref, watch } from 'vue'
import { Toaster } from 'vue-sonner'
import { useColorMode, usePreferredReducedMotion } from '@vueuse/core'
import { usePhotos } from './composables/usePhotos'
import { useBoard } from './composables/useBoard'
import { usePalettes } from './composables/usePalettes'
import { useBoardPalette } from './composables/useBoardPalette'
import { vividColors } from './utils/color'
import AppHeader from './components/AppHeader.vue'
import BoardView from './components/BoardView.vue'
import GalleryView from './components/GalleryView.vue'

// який розділ відкрито; без роутера — для двох екранів вистачає однієї змінної
const view = ref('gallery')
const motion = usePreferredReducedMotion()

// [ДОДАТКОВО] перемикання з View Transitions API: браузер «фотографує» сторінку до і після,
// а кадри з однаковою view-transition-name (картка в галереї ↔ плитка на дошці) перетікають одне в одне
function changeView(next) {
  if (next === view.value) return
  const swap = async () => {
    view.value = next
    await nextTick()                 // дочекатися, поки Vue оновить DOM — це і є стан «після»
    window.scrollTo({ top: 0 })
  }
  if (!document.startViewTransition || motion.value === 'reduce') swap()   // старий браузер — просто перемкнути
  else document.startViewTransition(swap)
}

const { photos } = usePhotos()
const { count, keepOnly } = useBoard()
const { ensure } = usePalettes()

// [ДОДАТКОВО] фон сторінки м'яко світиться кольорами мудборду.
// watch кладе три найнасиченіші кольори в CSS-змінні на <html>, а CSS плавно їх перетікає
const { boardPalette } = useBoardPalette()
watch(
  boardPalette,
  (palette) => {
    const colors = vividColors(palette)
    const root = document.documentElement.style
    ;['--ambient-1', '--ambient-2', '--ambient-3'].forEach((name, i) => {
      if (colors[i]) root.setProperty(name, colors[i])
      else root.removeProperty(name)          // немає кольору — повертається фіолетовий за замовчуванням
    })
  },
  { immediate: true },
)

// тема для сповіщень — та сама, що в шапці (VueUse синхронізує обидва виклики через localStorage)
const mode = useColorMode({ attribute: 'data-theme', storageKey: 'theme', initialValue: 'dark' })

// коли каталог завантажився: прибрати з мудборду кадри, яких у ньому вже немає,
// і почати рахувати кольори кадрів (у фоні, сторінка тим часом працює)
watch(photos, (list) => {
  if (!list.length) return
  keepOnly(list.map((p) => p.id))
  ensure(list)
})
</script>

<template>
  <AppHeader :view="view" :count="count" @change-view="changeView" />

  <main class="main">
    <!-- KeepAlive зберігає прокрутку й стан компонентів при перемиканні вкладок -->
    <KeepAlive>
      <GalleryView v-if="view === 'gallery'" @change-view="changeView" />
      <BoardView v-else @change-view="changeView" />
    </KeepAlive>
  </main>

  <!-- [ДОДАТКОВО] спливні сповіщення — бібліотека vue-sonner -->
  <Toaster position="top-center" :theme="mode === 'light' ? 'light' : 'dark'" rich-colors close-button />

  <footer class="footer">
    <div class="container">
      <p class="muted">© 2026 Artem Arsentiev · фото — власні · <a href="/">головний сайт</a></p>
    </div>
  </footer>
</template>

<style scoped>
.main {
  flex-grow: 1;
  padding-block: 1.5rem 3rem;
}

.footer {
  border-top: 1px solid var(--border);
  padding-block: 1.25rem .25rem;
  font-size: .875rem;
}
</style>
