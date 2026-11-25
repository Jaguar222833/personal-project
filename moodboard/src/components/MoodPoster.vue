<script setup>
// [ДОДАТКОВО] «Постер» для PNG: кадри мудборду + смуга палітри з кодами кольорів.
// На екрані його не видно — він з'являється на мить, поки html-to-image робить знімок.
import { imageUrl } from '@/composables/usePhotos'
import { formatShare } from '@/utils/format'

defineProps({
  items: { type: Array, required: true },     // [{ photo, weight }]
  colors: { type: Array, required: true },
})
</script>

<template>
  <div class="poster">
    <div class="poster__grid">
      <img
        v-for="{ photo, weight } in items"
        :key="photo.id"
        :class="`w${weight}`"
        :src="imageUrl(photo.image.large)"
        :alt="photo.alt"
      >
    </div>

    <div class="poster__palette">
      <div
        v-for="c in colors"
        :key="c.hex"
        class="poster__color"
        :style="{ flexGrow: c.share, background: c.hex }"
      >
        <span>{{ c.hex.toUpperCase() }} · {{ formatShare(c.share) }}</span>
      </div>
    </div>

    <p class="poster__caption">Мудборд · artem.kestrel-nrg.com/moodboard</p>
  </div>
</template>

<style scoped>
.poster {
  width: 1200px;
  padding: 40px;
  background: #0b0c10;
  color: #f2f0ec;
  font-family: var(--font-body);
}

.poster__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 170px;
  grid-auto-flow: dense;
  gap: 10px;

  & img {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    object-fit: cover;
  }

  & .w2 { grid-column: span 2; }
  & .w3 { grid-column: span 2; grid-row: span 2; }
}

.poster__palette {
  display: flex;
  height: 120px;
  margin-top: 24px;
  overflow: hidden;
  border-radius: 12px;
}

.poster__color {
  flex-basis: 0;
  display: flex;
  align-items: flex-end;
  padding: 10px;
  min-width: 0;

  & span {
    padding: 2px 6px;
    border-radius: 4px;
    background: rgb(0 0 0 / .5);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
  }
}

.poster__caption {
  margin: 16px 0 0;
  color: #a3a9b6;
  font-size: 14px;
}
</style>
