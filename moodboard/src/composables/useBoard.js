import { computed, ref, watch } from 'vue'

// Мудборд — це «кошик» застосунку: список кадрів і вага кожного (1–3).
// Елемент: { id, weight }. Порядок у масиві = порядок на дошці.

const STORAGE_KEY = 'moodboard:board'
export const MIN_WEIGHT = 1
export const MAX_WEIGHT = 3

// localStorage може бути недоступним (приватний режим) або містити сміття — тоді порожній мудборд
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved)
      ? saved.filter((item) => typeof item?.id === 'string' && Number.isInteger(item.weight))
      : []
  } catch {
    return []
  }
}

// [ЗАВДАННЯ] вимога 5: після оновлення сторінки мудборд береться з localStorage
const board = ref(load())

// [ЗАВДАННЯ] вимога 5: watch стежить за мудбордом і зберігає кожну зміну.
// deep: true — реагувати не лише на заміну масиву, а й на зміну ваги всередині елемента.
watch(
  board,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // місця немає або сховище заборонене — мудборд просто живе до закриття вкладки
    }
  },
  { deep: true },
)

const find = (id) => board.value.find((item) => item.id === id)

function has(id) {
  return board.value.some((item) => item.id === id)
}

function add(id) {
  if (!has(id)) board.value.push({ id, weight: MIN_WEIGHT })
}

// [ДОДАТКОВО] кілька кадрів одразу («Зібрати мудборд»); повертає, скільки додано нових
function addMany(ids) {
  const fresh = ids.filter((id) => !has(id))
  board.value.push(...fresh.map((id) => ({ id, weight: MIN_WEIGHT })))
  return fresh.length
}

function remove(id) {
  board.value = board.value.filter((item) => item.id !== id)
}

// [ЗАВДАННЯ] вимога 3: + / − змінюють «кількість» — тут це вага кадру на дошці
function increment(id) {
  const item = find(id)
  if (item && item.weight < MAX_WEIGHT) item.weight++
}

function decrement(id) {
  const item = find(id)
  if (item && item.weight > MIN_WEIGHT) item.weight--
}

function clear() {
  board.value = []
}

// прибрати кадри, яких більше немає в JSON (наприклад, фото видалили з каталогу)
function keepOnly(ids) {
  const known = new Set(ids)
  if (board.value.some((item) => !known.has(item.id))) {
    board.value = board.value.filter((item) => known.has(item.id))
  }
}

// [ЗАВДАННЯ] вимога 3: лічильник для шапки — computed, оновлюється сам
const count = computed(() => board.value.length)
const totalWeight = computed(() => board.value.reduce((sum, item) => sum + item.weight, 0))

export function useBoard() {
  return {
    board,
    count,
    totalWeight,
    has,
    add,
    addMany,
    remove,
    increment,
    decrement,
    clear,
    keepOnly,
  }
}
