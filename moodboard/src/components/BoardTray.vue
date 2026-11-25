<script setup>
// [ДОДАТКОВО] Панель унизу галереї: мініатюри й палітра мудборду наживо.
// Додали кадр у галереї — смуга кольорів тут одразу змінилась, не перемикаючи вкладку.
import { ArrowRight } from '@lucide/vue'
import { imageUrl } from '@/composables/usePhotos'
import { plural } from '@/utils/format'
import PaletteBar from './PaletteBar.vue'

defineProps({
  photos: { type: Array, required: true },     // кадри мудборду (останні кілька)
  count: { type: Number, required: true },
  palette: { type: Array, required: true },
})
const emit = defineEmits(['open', 'pick-color'])
</script>

<template>
  <aside class="tray" aria-label="Мудборд коротко">
    <div class="container tray__inner">
      <ul class="tray__thumbs" aria-hidden="true">
        <li v-for="p in photos.slice(-4)" :key="p.id">
          <img :src="imageUrl(p.image.small)" alt="" width="48" height="48">
        </li>
      </ul>

      <PaletteBar
        v-if="palette.length"
        class="tray__palette"
        :colors="palette"
        height="2.5rem"
        @pick="emit('pick-color', $event)"
      />
      <span v-else class="tray__palette muted">Рахую кольори…</span>

      <button type="button" class="btn btn--primary btn--small" @click="emit('open')">
        {{ plural(count, { one: 'кадр', few: 'кадри', many: 'кадрів' }) }}
        <ArrowRight aria-hidden="true" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.tray {
  position: fixed;
  inset: auto 0 0;
  z-index: 15;
  padding-block: .6rem calc(.6rem + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
}

.tray__inner {
  display: flex;
  align-items: center;
  gap: .75rem;
}

.tray__thumbs {
  display: none;
  margin: 0;
  padding: 0;
  list-style: none;

  & li + li { margin-left: -.75rem; }

  & img {
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid var(--bg);
    border-radius: 50%;
    object-fit: cover;
  }
}

.tray__palette {
  flex: 1 1 auto;
  min-width: 0;
  font-size: .875rem;
}

/* [1] мініатюри — від 40rem, на телефоні місця лише на палітру й кнопку */
@media (width >= 40rem) {
  .tray__thumbs { display: flex; }
}
</style>
