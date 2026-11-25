<script setup>
// [ЗАВДАННЯ] вимога 4: власний компонент.
// Дані приходять ЛИШЕ через props, а про дії картка лише «повідомляє» батька подіями (emit) —
// сама вона мудборд не змінює. Так одну й ту саму картку можна вставити будь-де.
import { computed } from 'vue'
import { Check, Plus, ScanSearch, WandSparkles } from '@lucide/vue'
import { imageUrl } from '@/composables/usePhotos'
import { formatPrice } from '@/utils/format'
import ColorSwatch from './ColorSwatch.vue'

const props = defineProps({
  photo: { type: Object, required: true },        // { id, title, place, category, image, price… }
  categoryLabel: { type: String, default: '' },
  palette: { type: Array, default: null },        // кольори кадру; null — ще рахуються
  inBoard: { type: Boolean, default: false },     // чи кадр уже на мудборді
  activeColor: { type: String, default: '' },     // колір, за яким зараз фільтр
  match: { type: Boolean, default: null },        // [ДОДАТКОВО] чи є в кадрі обраний колір; null — колір не обрано
})

const emit = defineEmits(['add', 'remove', 'similar', 'collect', 'pick-color'])

const src = computed(() => imageUrl(props.photo.image.large))
const srcset = computed(
  () => `${imageUrl(props.photo.image.small)} 480w, ${imageUrl(props.photo.image.large)} 960w`,
)
</script>

<template>
  <article
    class="card"
    :class="{ 'card--in-board': inBoard, 'card--match': match === true, 'card--dim': match === false }"
  >
    <div class="card__media">
      <!-- [ЗАВДАННЯ] адаптивне зображення з КП № 1: srcset + sizes, lazy, розміри від JSON -->
      <img
        :src="src"
        :srcset="srcset"
        sizes="(width >= 64rem) 20rem, (width >= 40rem) 50vw, 100vw"
        :width="photo.width"
        :height="photo.height"
        :alt="photo.alt"
        loading="lazy"
        decoding="async"
        :style="{ viewTransitionName: inBoard ? `photo-${photo.id}` : 'none' }"
      >
      <span v-if="categoryLabel" class="card__tag">{{ categoryLabel }}</span>
      <!-- кадр збігся з обраним кольором — кольорова мітка в куті -->
      <span v-if="match" class="card__match" :style="{ '--dot': activeColor }" aria-hidden="true" />

      <!-- [ДОДАТКОВО] «фарбні пластинки»: при наведенні кольори кадру розкриваються віялом з HEX.
           Лише для миші (hover) — на сенсорних екранах лишається смужка кольорів під фото -->
      <div v-if="palette?.length" class="chips" aria-hidden="true">
        <button
          v-for="(color, i) in palette"
          :key="color.hex"
          type="button"
          tabindex="-1"
          class="chip"
          :style="{ '--chip': color.hex, '--i': i, '--n': palette.length }"
          @click="emit('pick-color', color.hex)"
        >
          <span class="chip__hex">{{ color.hex.toUpperCase() }}</span>
        </button>
      </div>
    </div>

    <div class="card__body">
      <h3 class="card__title">{{ photo.title }}</h3>
      <p class="card__place muted">{{ photo.place }}</p>

      <!-- [ДОДАТКОВО] кольори кадру; клік — показати фото з цим кольором -->
      <div v-if="palette" class="card__palette" role="group" :aria-label="`Кольори кадру «${photo.title}»`">
        <ColorSwatch
          v-for="color in palette"
          :key="color.hex"
          :color="color"
          :active="color.hex === activeColor"
          size="sm"
          title-prefix="Знайти фото з кольором"
          @pick="emit('pick-color', $event)"
        />
      </div>
      <div v-else class="card__palette card__palette--loading" aria-hidden="true" />

      <p class="card__price">
        Пресет Lightroom · <strong>{{ formatPrice(photo.price) }}</strong>
      </p>

      <div class="card__actions">
        <button
          v-if="!inBoard"
          type="button"
          class="btn btn--primary btn--small"
          @click="emit('add', photo.id)"
        >
          <Plus aria-hidden="true" /> У мудборд
        </button>
        <button
          v-else
          type="button"
          class="btn btn--small"
          :aria-label="`Прибрати «${photo.title}» з мудборду`"
          @click="emit('remove', photo.id)"
        >
          <Check aria-hidden="true" /> На дошці
        </button>

        <button
          type="button"
          class="icon-btn"
          :disabled="!palette"
          :title="`Схожі на «${photo.title}»`"
          :aria-label="`Показати фото, схожі на «${photo.title}»`"
          @click="emit('similar', photo.id)"
        >
          <ScanSearch aria-hidden="true" />
        </button>
        <button
          type="button"
          class="icon-btn"
          :disabled="!palette"
          title="Зібрати мудборд з цього кадру"
          :aria-label="`Зібрати мудборд з «${photo.title}» і схожих кадрів`"
          @click="emit('collect', photo.id)"
        >
          <WandSparkles aria-hidden="true" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
  transition: border-color .25s, box-shadow .25s, transform .5s var(--spring);

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
    transform: translateY(-2px);
  }
}

/* [ДОДАТКОВО] обрано колір: кадри з ним піднімаються, решта «тоне» в сірому */
.card--match {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 10px 30px var(--glow-soft);
}

.card--dim {
  opacity: .45;
  transform: scale(.97);
  filter: grayscale(1);

  &:hover { opacity: .8; filter: grayscale(.4); }
}

.card__match {
  position: absolute;
  top: .6rem;
  right: .6rem;
  width: 1.4rem;
  height: 1.4rem;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--dot);
  box-shadow: 0 2px 8px rgb(0 0 0 / .4);
  animation: pop .5s var(--spring);
}

@keyframes pop {
  from { transform: scale(0); }
}

/* «фарбні пластинки»: складені стопкою в лівому нижньому куті фото, при наведенні — віяло */
.chips {
  position: absolute;
  left: .75rem;
  bottom: .6rem;
  width: 2.6rem;
  height: 5rem;
  pointer-events: none;
}

.chip {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 0 .3rem;
  border: 2px solid #fff;
  border-radius: .35rem;
  background: var(--chip);
  box-shadow: 0 4px 12px rgb(0 0 0 / .35);
  cursor: pointer;
  opacity: 0;
  transform-origin: 50% 110%;
  transform: translateY(1rem) rotate(0);
  transition: transform .55s var(--spring), opacity .25s;
  transition-delay: calc(var(--i) * 25ms);
}

.chip__hex {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  padding: .2rem 0;
  border-radius: .2rem;
  background: rgb(0 0 0 / .45);
  color: #fff;
  font-family: ui-monospace, Consolas, monospace;
  font-size: .55rem;
  font-weight: 700;
  letter-spacing: .02em;
}

@media (hover: hover) {
  .card:hover .chips { pointer-events: auto; }

  .card:hover .chip {
    opacity: 1;
    /* кожна наступна пластинка зсувається вправо й повертається — виходить віяло */
    transform: translateX(calc(var(--i) * 1.9rem)) rotate(calc((var(--i) - (var(--n) - 1) / 2) * 7deg));
  }

  .chip:hover {
    z-index: 2;
    translate: 0 -.5rem;
  }
}

/* кадр уже на мудборді — фіолетова рамка */
.card--in-board {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--glow-soft);
}

.card__media {
  position: relative;

  & img {
    width: 100%;
    /* [ЗАВДАННЯ] фото різних пропорцій в однакових рамках (КП № 1) */
    aspect-ratio: 3 / 2;
    object-fit: cover;
    background: var(--surface-2);
  }
}

.card__tag {
  position: absolute;
  top: .6rem;
  left: .6rem;
  padding: .15rem .6rem;
  border-radius: 999px;
  background: rgb(0 0 0 / .6);
  color: #fff;
  font-size: .75rem;
  font-weight: 600;
  backdrop-filter: blur(6px);
}

.card__body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: .35rem;
  padding: .9rem 1rem 1rem;
}

.card__title {
  margin: 0;
  font-size: 1rem;
}

.card__place {
  margin: 0;
  font-size: .875rem;
}

.card__palette {
  display: flex;
  gap: .3rem;
  min-height: 1.75rem;
  margin-block: .25rem;
}

/* поки кольори рахуються — «скелет» зі змінним блиском */
.card__palette--loading {
  border-radius: .4rem;
  background: linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}

.card__price {
  margin: 0;
  font-size: .875rem;
  color: var(--muted);

  & strong { color: var(--text); }
}

.card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .5rem;
  margin-top: auto;
  padding-top: .5rem;

  & .btn { flex-grow: 1; }
}
</style>
