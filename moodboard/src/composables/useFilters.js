import { ref } from 'vue'

// Стан фільтрів галереї. Оголошений поза функцією, тому спільний:
// клік по кольору в палітрі мудборду може ввімкнути фільтр у галереї.
const category = ref('all')
const search = ref('')
const sort = ref('default')

function reset() {
  category.value = 'all'
  search.value = ''
  sort.value = 'default'
}

export function useFilters() {
  return { category, search, sort, reset }
}
