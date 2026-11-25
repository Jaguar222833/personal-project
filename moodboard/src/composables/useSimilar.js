import { usePhotos } from './usePhotos'
import { usePalettes } from './usePalettes'
import { paletteDistance } from '@/utils/color'

// [ДОДАТКОВО] Підбір схожих кадрів за кольором.
// Відстань між палітрами рахує utils/color.js (OKLab), тут — лише сортування.
export function useSimilar() {
  const { photos } = usePhotos()
  const { palettes } = usePalettes()

  // кадри, впорядковані від найсхожіших на палітру reference; exclude — id, які пропустити
  function rank(reference, exclude = []) {
    const skip = new Set(exclude)
    return photos.value
      .filter((p) => !skip.has(p.id) && palettes.value[p.id]?.length)
      .map((p) => ({ photo: p, distance: paletteDistance(reference, palettes.value[p.id]) }))
      .sort((a, b) => a.distance - b.distance)
  }

  // n найсхожіших на кадр id (сам кадр не входить)
  function nearestTo(id, n, exclude = []) {
    const reference = palettes.value[id]
    if (!reference?.length) return []
    return rank(reference, [id, ...exclude]).slice(0, n).map((r) => r.photo)
  }

  return { rank, nearestTo }
}
