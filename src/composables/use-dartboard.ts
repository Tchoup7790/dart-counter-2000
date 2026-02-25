import type { BoardHitEvent } from '@/models/interfaces/board.interface'
import type {
  DartThrow,
  PlacedDart,
} from '@/models/interfaces/dart-throw.interface'

const BOARD_SECTORS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9,
  12, 5,
]

const BOARD_RINGS = {
  doubleBull: 6.35,
  singleBull: 16,
  thinSingle: 99,
  treble: 107,
  fatSingle: 162,
  double: 170,
  outerEdge: 225,
}

export function useDartboard(maxThrowsPerRound: number = 3) {
  let placedDarts: PlacedDart[] = []
  let currentThrows: DartThrow[] = []

  function isRoundComplete(): boolean {
    return currentThrows.length >= maxThrowsPerRound
  }

  function hitToThrow(hit: BoardHitEvent): DartThrow {
    return {
      sector: hit.sector,
      multiplier: hit.multiplier,
      value: hit.sector * hit.multiplier,
      x: hit.x,
      y: hit.y,
    }
  }

  function onBoardHit(
    event: CustomEvent<BoardHitEvent>,
  ): DartThrow | null {
    if (isRoundComplete()) return null

    const dart = hitToThrow(event.detail)
    currentThrows.push(dart)
    return dart
  }

  function commitRound(): DartThrow[] {
    const throws = [...currentThrows]
    currentThrows = []
    return throws
  }

  function undoLastThrow(): DartThrow | undefined {
    return currentThrows.pop()
  }

  function resetBoard() {
    placedDarts = []
    currentThrows = []
  }

  function addPlacedDarts(
    throws: DartThrow[],
    teamIndex: number,
    color: string,
  ) {
    throws.forEach((t) => {
      placedDarts.push({
        throw: t,
        teamIndex,
        playerColor: color,
      })
    })
  }

  function addThrow(dart: DartThrow): boolean {
    if (currentThrows.length >= maxThrowsPerRound) return false
    currentThrows.push(dart)
    return true
  }

  function clearPlacedDarts() {
    placedDarts = []
  }

  function normalizedToPixel(
    nx: number,
    ny: number,
    size: number,
  ) {
    return {
      px: ((nx + 1) / 2) * size,
      py: ((1 - ny) / 2) * size,
    }
  }

  return {
    placedDarts,
    currentThrows,
    isRoundComplete,
    addThrow,
    commitRound,
    undoLastThrow,
    resetBoard,
    addPlacedDarts,
    clearPlacedDarts,
    normalizedToPixel,
    hitToThrow,
  }
}
