<script setup>
// Шапка: назва, перемикач «Галерея / Мудборд» з лічильником і кнопка теми.
import { ArrowLeft, Images, LayoutGrid, Moon, Sun } from '@lucide/vue'
import { useColorMode } from '@vueuse/core'

defineProps({
  view: { type: String, required: true },     // 'gallery' | 'board'
  count: { type: Number, default: 0 },        // скільки кадрів на мудборді
})
const emit = defineEmits(['change-view'])

// [ДОДАТКОВО] тема через бібліотеку VueUse: ставить data-theme на <html> і пам'ятає вибір
// під тим самим ключем 'theme', що й головний сайт, — тема спільна для обох
const mode = useColorMode({
  attribute: 'data-theme',
  storageKey: 'theme',
  initialValue: 'dark',
})
function toggleTheme() {
  mode.value = mode.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <a href="/" class="header__back" title="На головний сайт">
        <ArrowLeft aria-hidden="true" />
        <span class="header__back-text">Сайт</span>
      </a>

      <span class="header__logo">Мудборд</span>

      <nav class="tabs" aria-label="Розділи">
        <button
          type="button"
          class="tab"
          :aria-current="view === 'gallery' ? 'page' : undefined"
          @click="emit('change-view', 'gallery')"
        >
          <Images aria-hidden="true" />
          <span class="tab__text">Галерея</span>
        </button>
        <button
          type="button"
          class="tab"
          :aria-current="view === 'board' ? 'page' : undefined"
          @click="emit('change-view', 'board')"
        >
          <LayoutGrid aria-hidden="true" />
          <span class="tab__text">Мудборд</span>
          <!-- [ЗАВДАННЯ] вимога 3: лічильник у шапці оновлюється одразу -->
          <span class="badge" :class="{ 'badge--empty': !count }" aria-label="кадрів на мудборді">
            {{ count }}
          </span>
        </button>
      </nav>

      <button
        type="button"
        class="icon-btn"
        :aria-label="mode === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'"
        @click="toggleTheme"
      >
        <Sun v-if="mode !== 'light'" aria-hidden="true" />
        <Moon v-else aria-hidden="true" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  backdrop-filter: blur(12px);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: .5rem;
  min-height: var(--header-h);
}

.header__back {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  min-height: 2.75rem;
  padding-inline: .25rem;
  color: var(--muted);
  text-decoration: none;
  font-size: .875rem;

  &:hover { color: var(--text); }
  & svg { width: 1.1rem; height: 1.1rem; }
}

.header__back-text { display: none; }

.header__logo {
  margin-right: auto;
  font-family: var(--font-heading);
  font-weight: 600;
  background: linear-gradient(90deg, var(--text), var(--accent-hi));
  background-clip: text;
  color: transparent;
}

.tabs {
  display: flex;
  gap: .25rem;
  padding: .25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  min-height: 2.5rem;
  padding: .25rem .75rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, color .2s;

  & svg { width: 1.1rem; height: 1.1rem; }

  &[aria-current="page"] {
    background: var(--surface-2);
    color: var(--text);
  }
}

.tab__text { display: none; }

.badge {
  min-width: 1.5rem;
  padding: 0 .4rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: .75rem;
  line-height: 1.5rem;
  text-align: center;
  /* [ДОДАТКОВО] число «підстрибує», коли змінюється (див. :key у шаблоні не потрібен — анімує transition) */
  transition: transform .4s var(--spring), background .2s;
}

.badge--empty {
  background: var(--surface-2);
  color: var(--muted);
}

/* [1] від 30rem (480px) з'являються підписи вкладок і посилання «Сайт» */
@media (width >= 30rem) {
  .tab__text,
  .header__back-text { display: inline; }
}
</style>
