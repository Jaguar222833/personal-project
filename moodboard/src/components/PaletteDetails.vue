<script setup>
// [ДОДАТКОВО] Кольори палітри докладно: HEX / RGB / HSL, частка і контраст тексту за WCAG.
// Клік по коду копіює його (useClipboard з VueUse), кнопка-лупа — шукає кадри з цим кольором.
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Search } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { describeColor, wcagLevel } from '@/utils/color'
import { formatShare } from '@/utils/format'

const props = defineProps({
  colors: { type: Array, required: true },   // [{ hex, share }]
})
const emit = defineEmits(['find'])

const { copy, isSupported } = useClipboard({ legacy: true })

// до кожного кольору — формати й контраст; перераховується разом із палітрою
const rows = computed(() => props.colors.map((c) => ({ ...describeColor(c.hex), share: c.share })))

async function copyValue(value) {
  if (!isSupported.value) return
  await copy(value)
  toast(`Скопійовано ${value}`)
}
</script>

<template>
  <ul class="colors">
    <li v-for="row in rows" :key="row.hex" class="color">
      <div class="color__chip" :style="{ background: row.hex, color: row.text }">
        <span class="color__share">{{ formatShare(row.share) }}</span>
        <span class="color__sample">Aa</span>
      </div>

      <div class="color__info">
        <button type="button" class="code code--main" title="Скопіювати" @click="copyValue(row.hex)">
          {{ row.hex.toUpperCase() }}
        </button>
        <button type="button" class="code" title="Скопіювати" @click="copyValue(row.rgb)">{{ row.rgb }}</button>
        <button type="button" class="code" title="Скопіювати" @click="copyValue(row.hsl)">{{ row.hsl }}</button>

        <!-- контраст: наскільки читається білий і чорний текст на цьому кольорі -->
        <p class="contrast">
          <span :class="{ ok: row.onWhite >= 4.5 }">
            білий {{ row.onWhite.toFixed(1) }} · {{ wcagLevel(row.onWhite) }}
          </span>
          <span :class="{ ok: row.onBlack >= 4.5 }">
            чорний {{ row.onBlack.toFixed(1) }} · {{ wcagLevel(row.onBlack) }}
          </span>
        </p>
      </div>

      <button
        type="button"
        class="icon-btn"
        :aria-label="`Знайти кадри з кольором ${row.hex}`"
        title="Знайти кадри з цим кольором"
        @click="emit('find', row.hex)"
      >
        <Search aria-hidden="true" />
      </button>
    </li>
  </ul>
</template>

<style scoped>
.colors {
  display: grid;
  gap: .5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.color {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr) auto;
  align-items: center;
  gap: .75rem;
  padding: .5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.color__chip {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 4rem;
  padding: .3rem .4rem;
  border-radius: calc(var(--radius) - .25rem);
  font-weight: 700;
  transition: background-color .6s var(--ease-out);
}

.color__share { font-size: .7rem; }
.color__sample { font-size: 1.1rem; line-height: 1; }

.color__info {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 .6rem;
  min-width: 0;
}

.code {
  padding: 0;
  border: 0;
  background: none;
  color: var(--muted);
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  font-size: .75rem;
  cursor: copy;

  &:hover { color: var(--text); text-decoration: underline; }
}

.code--main {
  flex-basis: 100%;
  text-align: left;
  color: var(--text);
  font-size: .95rem;
  font-weight: 700;
}

.contrast {
  display: flex;
  flex-wrap: wrap;
  gap: 0 .6rem;
  margin: .2rem 0 0;
  color: var(--muted);
  font-size: .72rem;

  & .ok { color: var(--accent-2); }
}
</style>
