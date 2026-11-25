<script setup>
// [ДОДАТКОВО] Експорт палітри: готові CSS-змінні (копіюються одним кліком) і PNG мудборду.
// PNG малює батько (бібліотека html-to-image), тут лише кнопка, яка про це просить — emit.
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { Copy, Download } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { formatShare } from '@/utils/format'

const props = defineProps({
  colors: { type: Array, required: true },
  busy: { type: Boolean, default: false },   // PNG ще готується
})
const emit = defineEmits(['download-png'])

// текст CSS теж computed: змінилась палітра — змінився й код
const css = computed(() => {
  const lines = props.colors.map((c, i) => `  --mood-${i + 1}: ${c.hex}; /* ${formatShare(c.share)} */`)
  return `:root {\n${lines.join('\n')}\n}`
})

const { copy } = useClipboard({ legacy: true })
async function copyCss() {
  await copy(css.value)
  toast.success('CSS-змінні скопійовано')
}
</script>

<template>
  <div class="export">
    <pre class="export__code"><code>{{ css }}</code></pre>
    <div class="export__actions">
      <button type="button" class="btn btn--small" @click="copyCss">
        <Copy aria-hidden="true" /> Скопіювати CSS
      </button>
      <button type="button" class="btn btn--small" :disabled="busy" @click="emit('download-png')">
        <Download aria-hidden="true" /> {{ busy ? 'Готую PNG…' : 'Завантажити PNG' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.export {
  display: grid;
  gap: .75rem;
}

/* [ЗАВДАННЯ] вимога 7: довгий код прокручується всередині блоку, а не розширює сторінку */
.export__code {
  margin: 0;
  padding: .75rem 1rem;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  font-size: .78rem;
  line-height: 1.5;
}

.export__actions {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}
</style>
