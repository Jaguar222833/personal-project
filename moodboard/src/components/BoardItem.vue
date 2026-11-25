<script setup>
// [ЗАВДАННЯ] вимога 4: другий власний компонент — плитка на мудборді (аналог CartItem).
// props: кадр і його вага; emit: increment / decrement / remove.
// Сам компонент нічого не змінює — лише повідомляє батька, що натиснули.
import { computed } from 'vue'
import { GripVertical, Minus, Plus, X } from '@lucide/vue'
import { imageUrl } from '@/composables/usePhotos'
import { MAX_WEIGHT, MIN_WEIGHT } from '@/composables/useBoard'

const props = defineProps({
  photo: { type: Object, required: true },
  weight: { type: Number, required: true },
})

const emit = defineEmits(['increment', 'decrement', 'remove'])

// вага → розмір плитки: 1 — звичайна, 2 — широка, 3 — велика 2×2
const sizeClass = computed(() => `tile--w${props.weight}`)
</script>

<template>
  <figure class="tile" :class="sizeClass">
    <img
      :src="imageUrl(weight > 1 ? photo.image.large : photo.image.small)"
      :alt="photo.alt"
      :width="photo.width"
      :height="photo.height"
      draggable="false"
    >

    <!-- ручка для перетягування і кнопка «прибрати» — у верхніх кутах -->
    <span class="tile__handle" title="Перетягніть, щоб змінити порядок" aria-hidden="true">
      <GripVertical />
    </span>
    <button
      type="button"
      class="tile__btn tile__btn--remove"
      :aria-label="`Прибрати «${photo.title}» з мудборду`"
      @click="emit('remove', photo.id)"
    >
      <X aria-hidden="true" />
    </button>

    <figcaption class="tile__bar">
      <span class="tile__title">{{ photo.title }}</span>

      <span class="tile__controls">
        <button
          type="button"
          class="tile__btn"
          :disabled="weight <= MIN_WEIGHT"
          :aria-label="`Зменшити «${photo.title}»`"
          @click="emit('decrement', photo.id)"
        >
          <Minus aria-hidden="true" />
        </button>
        <output class="tile__weight" :aria-label="`Вага ${weight} з ${MAX_WEIGHT}`">{{ weight }}</output>
        <button
          type="button"
          class="tile__btn"
          :disabled="weight >= MAX_WEIGHT"
          :aria-label="`Збільшити «${photo.title}»`"
          @click="emit('increment', photo.id)"
        >
          <Plus aria-hidden="true" />
        </button>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.tile {
  position: relative;
  /* [ДОДАТКОВО] плитка — контейнер: її вміст підлаштовується під ширину самої плитки, а не екрана */
  container-type: inline-size;
  margin: 0;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface-2);
  transition: box-shadow .25s;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .6s var(--ease-out);
  }

  &:hover img { transform: scale(1.03); }
}

/* [1] вага 2 — плитка на дві колонки, [2] вага 3 — 2 × 2.
   Сітка в батька має grid-auto-flow: dense, тому дірки заповнюються меншими плитками */
.tile--w2 { grid-column: span 2; }                       /* [1] */
.tile--w3 { grid-column: span 2; grid-row: span 2; }     /* [2] */

.tile__bar {
  position: absolute;
  inset: auto 0 0;
  display: flex;
  align-items: center;
  gap: .25rem;
  padding: .35rem;
  background: linear-gradient(transparent, rgb(0 0 0 / .75));
  color: #fff;
}

.tile__handle {
  position: absolute;
  top: .35rem;
  left: .35rem;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgb(0 0 0 / .45);
  color: #fff;
  cursor: grab;
  touch-action: none;
  backdrop-filter: blur(6px);
  & svg { width: 1rem; height: 1rem; }
}

.tile__title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: .8rem;
  font-weight: 600;
}

.tile__controls {
  display: flex;
  align-items: center;
  gap: .15rem;
}

.tile__btn {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / .18);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background .2s, transform .4s var(--spring);

  &:hover { background: rgb(255 255 255 / .32); }
  &:active { transform: scale(.88); }
  &:disabled { opacity: .35; cursor: not-allowed; }
  & svg { width: .95rem; height: .95rem; }
}

.tile__btn--remove {
  position: absolute;
  top: .35rem;
  right: .35rem;
  background: rgb(0 0 0 / .45);

  &:hover { background: rgb(248 113 113 / .8); }
}

/* [3] вузька плитка (менше 11rem) — назву ховаємо, кнопки + / − по центру */
@container (width < 11rem) {
  .tile__title { display: none; }
  .tile__bar { justify-content: center; }
}

.tile__weight {
  min-width: 1.1rem;
  font-weight: 700;
  font-size: .85rem;
  text-align: center;
}
</style>
