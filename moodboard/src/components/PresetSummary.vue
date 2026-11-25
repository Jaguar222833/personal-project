<script setup>
// [ДОДАТКОВО] Пресети Lightroom з кадрів мудборду — це «ціна» кожної позиції каталогу.
// Список, знижка за набір і загальна сума — усе computed: прибрали кадр — сума одразу менша.
import { computed } from 'vue'
import { ShoppingBag } from '@lucide/vue'
import { formatPrice, plural } from '@/utils/format'

const props = defineProps({
  photos: { type: Array, required: true },   // кадри мудборду
})
const emit = defineEmits(['buy'])

const BUNDLE_FROM = 3       // від скількох пресетів діє знижка
const BUNDLE_DISCOUNT = 0.2 // −20 %

const subtotal = computed(() => props.photos.reduce((sum, p) => sum + p.price, 0))
const discount = computed(() =>
  props.photos.length >= BUNDLE_FROM ? Math.round(subtotal.value * BUNDLE_DISCOUNT) : 0,
)
// [ЗАВДАННЯ] вимога 3: загальна сума оновлюється одразу
const total = computed(() => subtotal.value - discount.value)
const left = computed(() => BUNDLE_FROM - props.photos.length)
</script>

<template>
  <div class="presets">
    <ul class="presets__list">
      <li v-for="p in photos" :key="p.id">
        <span class="presets__name">«{{ p.title }}»</span>
        <span class="presets__price">{{ formatPrice(p.price) }}</span>
      </li>
    </ul>

    <dl class="presets__sum">
      <template v-if="discount">
        <dt>Знижка за набір −{{ BUNDLE_DISCOUNT * 100 }} %</dt>
        <dd>−{{ formatPrice(discount) }}</dd>
      </template>
      <dt class="presets__total">Разом</dt>
      <dd class="presets__total">{{ formatPrice(total) }}</dd>
    </dl>

    <p v-if="left > 0" class="muted presets__hint">
      Ще {{ plural(left, { one: 'пресет', few: 'пресети', many: 'пресетів' }) }} — і знижка −{{ BUNDLE_DISCOUNT * 100 }} %
    </p>

    <button type="button" class="btn btn--primary" @click="emit('buy', { total, count: photos.length })">
      <ShoppingBag aria-hidden="true" /> Придбати {{ plural(photos.length, { one: 'пресет', few: 'пресети', many: 'пресетів' }) }}
    </button>
  </div>
</template>

<style scoped>
.presets {
  display: grid;
  gap: .75rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.presets__list {
  display: grid;
  gap: .3rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: .875rem;

  & li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
}

.presets__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.presets__price { flex-shrink: 0; color: var(--muted); }

.presets__sum {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: .25rem 1rem;
  margin: 0;
  padding-top: .75rem;
  border-top: 1px solid var(--border);
  font-size: .875rem;

  & dd { margin: 0; text-align: right; }
}

.presets__total {
  font-size: 1.1rem;
  font-weight: 700;
}

.presets__hint {
  margin: 0;
  font-size: .8rem;
}
</style>
