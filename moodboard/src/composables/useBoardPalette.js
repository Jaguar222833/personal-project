import { computed } from 'vue'
import { useBoard } from './useBoard'
import { usePalettes } from './usePalettes'
import { mergePalettes } from '@/utils/color'

// [ДОДАТКОВО] Палітра всього мудборду — це «загальна сума» нашого кошика.
// computed від двох джерел: що на дошці (і з якою вагою) + кольори кожного кадру.
// Змінилась вага — Vue сам перерахує палітру, а смуга й список кольорів оновляться.
export function useBoardPalette() {
  const { board } = useBoard()
  const { palettes } = usePalettes()

  const boardPalette = computed(() =>
    mergePalettes(
      board.value
        .filter((item) => palettes.value[item.id]?.length)
        .map((item) => ({ palette: palettes.value[item.id], weight: item.weight })),
    ),
  )

  return { boardPalette }
}
