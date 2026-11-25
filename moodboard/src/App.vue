<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import GalleryView from './components/GalleryView.vue'

// який розділ відкрито; без роутера — для двох екранів вистачає однієї змінної
const view = ref('gallery')
</script>

<template>
  <AppHeader :view="view" :count="0" @change-view="view = $event" />

  <main class="main">
    <GalleryView v-if="view === 'gallery'" />
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
