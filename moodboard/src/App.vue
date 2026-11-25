<script setup>
import { ref, watch } from 'vue'
import { usePhotos } from './composables/usePhotos'
import { useBoard } from './composables/useBoard'
import AppHeader from './components/AppHeader.vue'
import BoardView from './components/BoardView.vue'
import GalleryView from './components/GalleryView.vue'

// який розділ відкрито; без роутера — для двох екранів вистачає однієї змінної
const view = ref('gallery')
function changeView(next) {
  view.value = next
  window.scrollTo({ top: 0 })
}

const { photos } = usePhotos()
const { count, keepOnly } = useBoard()

// коли каталог завантажився — прибрати з мудборду кадри, яких у ньому вже немає
watch(photos, (list) => {
  if (list.length) keepOnly(list.map((p) => p.id))
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
