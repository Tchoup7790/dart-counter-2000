import { ref } from 'vue'
import type {
  DartThrow,
  PlacedDart,
} from '@/models/interfaces/dart-throw.interface'
import type { DartboardClickDetail } from '@/models/interfaces/board.interface'
import { BOARD_SECTORS } from '@/utils/constantes'

// Convertit un DartboardClickDetail en DartThrow typé.
// * Retourne null si le clic est un miss (ring 0).
export function clickDetailToDart(
  detail: DartboardClickDetail,
): DartThrow | null {
  const { sector, ring, point } = detail

  // miss
  if (ring === undefined) return null

  let realSector: number
  let multiplier: 1 | 2 | 3

  if (ring === 1) {
    realSector = 25
    multiplier = 1
  } else if (ring === 0) {
    realSector = 50
    multiplier = 1
  } else {
    realSector = BOARD_SECTORS[sector] ?? 0
    multiplier = ring === 3 ? 3 : ring === 5 ? 2 : 1
  }

  return {
    sector: realSector,
    multiplier,
    value: realSector * multiplier,
    x: point.x,
    y: point.y,
  }
}

// Composable
export function useDartboard(maxThrowsPerRound: number = 3) {
  const currentThrows = ref<DartThrow[]>([])
  const placedDarts = ref<PlacedDart[]>([])

  function isRoundComplete(): boolean {
    return currentThrows.value.length >= maxThrowsPerRound
  }

  // Ajoute une fléchette à la volée en cours.
  // Retourne false si la volée est déjà pleine.
  function addThrow(dart: DartThrow): boolean {
    if (isRoundComplete()) return false
    currentThrows.value.push(dart)
    return true
  }

  // Annule le dernier lancer.
  function undoLastThrow(): DartThrow | undefined {
    return currentThrows.value.pop()
  }

  // Valide la volée
  function commitRound(): DartThrow[] {
    const throws = [...currentThrows.value]
    currentThrows.value = []
    return throws
  }

  // Ajoute des fléchettes à l'overlay historique (volée précédente).
  function addPlacedDarts(
    throws: DartThrow[],
    teamIndex: number,
    color: string,
  ) {
    for (const t of throws) {
      placedDarts.value.push({
        throw: t,
        teamIndex,
        playerColor: color,
      })
    }
  }

  function clearPlacedDarts() {
    placedDarts.value = []
  }

  function resetBoard() {
    currentThrows.value = []
    placedDarts.value = []
  }

  return {
    // State réactif
    currentThrows,
    placedDarts,

    // Helpers
    isRoundComplete,
    addThrow,
    undoLastThrow,
    commitRound,
    addPlacedDarts,
    clearPlacedDarts,
    resetBoard,
  }
}
