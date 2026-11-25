// Робота з кольорами. Уся математика — бібліотека culori, тут лише «склеювання».
//
// Чому OKLab: у звичному RGB відстань між кольорами не збігається з тим,
// як різницю бачить око (два зелені можуть бути «далі», ніж зелений і сірий).
// OKLab — колірний простір, де відстань ≈ видима різниця. Тому порівнюємо кольори саме там.
import {
  converter,
  differenceEuclidean,
  formatHex,
  formatHsl,
  formatRgb,
  wcagContrast,
} from 'culori'

const toOklab = converter('oklab')
const distance = differenceEuclidean('oklab')   // 0 — той самий колір, ~1 — чорний проти білого

// Палітра у застосунку — масив { hex, share }, де share — частка кольору (сума = 1).

// результат extract-colors → наша палітра: найбільші кольори, частки нормовані до 1
export function normalizePalette(colors, max = 6) {
  const top = [...colors].sort((a, b) => b.area - a.area).slice(0, max)
  const total = top.reduce((sum, c) => sum + c.area, 0) || 1
  return top.map((c) => ({ hex: c.hex, share: c.area / total }))
}

// [ДОДАТКОВО] спільна палітра мудборду.
// entries — [{ palette, weight }]: палітри кадрів і їхня вага (+/− у мудборді).
// Схожі кольори різних кадрів зливаються в один (середнє в OKLab), вага кольору = частка × вага кадру.
export function mergePalettes(entries, { max = 8, threshold = 0.09 } = {}) {
  const flat = entries.flatMap(({ palette, weight }) =>
    palette.map((c) => ({ lab: toOklab(c.hex), w: c.share * weight })),
  )
  flat.sort((a, b) => b.w - a.w)              // спершу найвагоміші — вони стають «центрами» груп

  const groups = []
  for (const c of flat) {
    const group = groups.find((g) => distance(g.lab, c.lab) < threshold)
    if (group) {
      // зважене середнє: новий колір трохи зсуває центр групи
      const w = group.w + c.w
      group.lab = {
        mode: 'oklab',
        l: (group.lab.l * group.w + c.lab.l * c.w) / w,
        a: (group.lab.a * group.w + c.lab.a * c.w) / w,
        b: (group.lab.b * group.w + c.lab.b * c.w) / w,
      }
      group.w = w
    } else {
      groups.push({ lab: c.lab, w: c.w })
    }
  }

  const top = groups.sort((a, b) => b.w - a.w).slice(0, max)
  const total = top.reduce((sum, g) => sum + g.w, 0) || 1
  return top.map((g) => ({ hex: formatHex(g.lab), share: g.w / total }))
}

// [ДОДАТКОВО] наскільки дві палітри схожі: для кожного кольору A шукаємо найближчий у B,
// беремо середнє з урахуванням часток — і навпаки. Менше число = схожіші кадри.
function oneWay(a, b) {
  return a.reduce((sum, c) => sum + c.share * Math.min(...b.map((d) => distance(c.hex, d.hex))), 0)
}

export function paletteDistance(a, b) {
  if (!a?.length || !b?.length) return Infinity
  return (oneWay(a, b) + oneWay(b, a)) / 2
}

// чи є в палітрі колір, близький до заданого (пошук фото за кольором)
export function hasColor(palette, hex, threshold = 0.1) {
  return palette.some((c) => c.share >= 0.04 && distance(c.hex, hex) < threshold)
}

// середня світлість кадру: 0 — чорний, 1 — білий
export function lightness(palette) {
  return palette.reduce((sum, c) => sum + c.share * toOklab(c.hex).l, 0)
}

// «теплота»: у OKLab вісь b — від синього (−) до жовтого (+), вісь a — від зеленого до червоного
export function warmth(palette) {
  return palette.reduce((sum, c) => {
    const { a, b } = toOklab(c.hex)
    return sum + c.share * (b + a * 0.5)
  }, 0)
}

// усе, що показуємо про колір у палітрі: формати і контраст тексту (WCAG)
export function describeColor(hex) {
  const onWhite = wcagContrast(hex, '#ffffff')
  const onBlack = wcagContrast(hex, '#000000')
  return {
    hex,
    rgb: formatRgb(hex),
    hsl: formatHsl(hex),
    onWhite,
    onBlack,
    // яким текстом писати поверх цього кольору, щоб читалось
    text: onWhite >= onBlack ? '#ffffff' : '#000000',
  }
}

// рівень WCAG для звичайного тексту: AAA ≥ 7, AA ≥ 4.5
export function wcagLevel(ratio) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA великий'
  return 'низький'
}
