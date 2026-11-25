// ціна у гривнях за українськими правилами: «1 240 грн»
const price = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'UAH',
  maximumFractionDigits: 0,
})

export function formatPrice(value) {
  return price.format(value)
}

// частка 0…1 → «32 %»
export function formatShare(share) {
  return `${Math.round(share * 100)} %`
}

// правильне закінчення: 1 фото, 2 фото… працює для будь-якого слова з трьома формами
const rules = new Intl.PluralRules('uk-UA')
export function plural(n, forms) {
  const { one, few, many } = forms
  const kind = rules.select(n)
  return `${n} ${kind === 'one' ? one : kind === 'few' ? few : many}`
}
