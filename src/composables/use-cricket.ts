import { CRICKET_VARIANTS } from '@/models/enums/cricket-variants.enum'
import type {
  CricketOptions,
  CricketRoundResult,
} from '@/models/interfaces/cricket.interface'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'

type HitsMap = Record<number, Record<number, number>>

const DEFAULT_CRICKET_VARIANTS = [
  CRICKET_VARIANTS.FIFTEEN,
  CRICKET_VARIANTS.SIXTEEN,
  CRICKET_VARIANTS.SEVENTEEN,
  CRICKET_VARIANTS.EIGHTEEN,
  CRICKET_VARIANTS.NINETEEN,
  CRICKET_VARIANTS.TWENTY,
  CRICKET_VARIANTS.TWENTY_FIVE,
]

export function useCricket(
  options: CricketOptions,
  teamCount: number,
) {
  let activeSectors: number[] = DEFAULT_CRICKET_VARIANTS
  let hitsMap: HitsMap = {}
  let bonusPoints: number[] = []

  // Init
  function init() {
    // Crazy
    if (options.crazy) {
      const pool = [
        ...Array.from({ length: 20 }, (_, i) => i + 1),
        25,
      ]

      activeSectors = pool
        .sort(() => Math.random() - 0.5)
        .slice(0, 7)
        .sort((a, b) => a - b)
    } else {
      activeSectors = DEFAULT_CRICKET_VARIANTS
    }

    // reset hits
    const h: HitsMap = {}
    for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
      h[teamIndex] = {}
      for (const s of activeSectors) h[teamIndex]![s] = 0
    }
    hitsMap = h

    // reset bonus
    bonusPoints = Array.from({ length: teamCount }, () => 0)
  }

  // process Round
  function processRound(
    teamIndex: number,
    throws: DartThrow[],
  ): CricketRoundResult {
    const deltas: Record<number, number> = {}

    function addDelta(teamIndex: number, value: number) {
      deltas[teamIndex] = (deltas[teamIndex] ?? 0) + value
    }

    for (const dart of throws) {
      const sector = dart.sector === 50 ? 25 : dart.sector

      if (!activeSectors.includes(sector)) continue

      const hitsToAdd = dart.multiplier
      const currentHits = getHits(teamIndex, sector)
      const newHits = currentHits + hitsToAdd

      const hitsToClose = Math.max(0, 3 - currentHits)
      const overHits = Math.max(0, hitsToAdd - hitsToClose)

      hitsMap[teamIndex]![sector] = Math.min(3, newHits)

      if (overHits > 0 && !isSectorComplete(sector)) {
        const bonusValue = overHits * sector

        if (!options.cutThroat) {
          const anyOpponentOpen = Array.from(
            { length: teamCount },
            (_, i) => i,
          ).some((i) => i !== teamIndex && !hasClosed(i, sector))

          if (anyOpponentOpen) {
            bonusPoints[teamIndex] =
              (bonusPoints[teamIndex] ?? 0) + bonusValue

            addDelta(teamIndex, bonusValue)
          }
        } else {
          for (let i = 0; i < teamCount; i++) {
            if (i !== teamIndex && hasClosed(i, sector)) {
              bonusPoints[i] = (bonusPoints[i] ?? 0) + bonusValue
              addDelta(i, bonusValue)
            }
          }
        }
      }
    }

    const pointDeltas = Object.entries(deltas)
      .map(([ti, delta]) => ({ teamIndex: Number(ti), delta }))
      .filter((d) => d.delta !== 0)

    // Check isWinner
    let winner: number | undefined
    for (let teamInde = 0; teamIndex < teamCount; teamIndex++) {
      if (isWinner(teamIndex)) {
        winner = teamIndex
        break
      }
    }

    return { pointDeltas, winner }
  }

  // Helpers

  function getHits(teamIndex: number, sector: number): number {
    return hitsMap[teamIndex]?.[sector] ?? 0
  }

  function hasClosed(
    teamIndex: number,
    sector: number,
  ): boolean {
    return getHits(teamIndex, sector) >= 3
  }

  function hasClosedAll(teamIndex: number): boolean {
    return activeSectors.every((sector) =>
      hasClosed(teamIndex, sector),
    )
  }

  function isSectorComplete(sector: number): boolean {
    for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
      if (!hasClosed(teamIndex, sector)) return false
    }
    return true
  }

  function isWinner(teamIndex: number): boolean {
    if (!hasClosedAll(teamIndex)) return false

    const myBonus = bonusPoints[teamIndex] ?? 0

    for (let i = 0; i < teamIndex; i++) {
      if (i !== teamIndex && (bonusPoints[i] ?? 0) > myBonus)
        return false
    }

    return true
  }

  return {
    // État réactif (readonly en dehors du composable)
    activeSectors,
    bonusPoints,

    // Helpers de lecture
    getHits,
    hasClosed,
    hasClosedAll,
    isSectorComplete,

    // Cycle de vie
    init,
    processRound,
  }
}
