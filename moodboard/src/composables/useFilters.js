import { ref } from 'vue'

// Стан фільтрів галереї. Оголошений поза функцією, тому спільний:
// клік по кольору в палітрі мудборду вмикає фільтр у галереї.
const category = ref('all')
const search = ref('')
const sort = ref('default')
const color = ref('')        // [ДОДАТКОВО] показати лише кадри з цим кольором (hex)
const similarTo = ref('')    // [ДОДАТКОВО] id кадру: впорядкувати галерею за схожістю на нього

function reset() {
  category.value = 'all'
  search.value = ''
  sort.value = 'default'
  color.value = ''
  similarTo.value = ''
}

export function useFilters() {
  return { category, search, sort, color, similarTo, reset }
}
