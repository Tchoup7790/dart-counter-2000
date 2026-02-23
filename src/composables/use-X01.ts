import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type { X01Options } from '@/models/interfaces/x01.interface'

interface RoundResult {
  validThrows: DartThrow[]
  bust: boolean
  winner: boolean
  pointsToSubstract: number
}

type HasStarted = boolean[][]

export function useX01(options: X01Options) {
  const hasStarted: HasStarted = []

  function initHasStarted(
    teamCount: number,
    playersPerTeam: number[],
  ) {
    const needsIn: boolean = options.doubleIn || options.masterIn
    hasStarted.length = 0

    for (let i = 0; i < teamCount; i++) {
      hasStarted[i] = Array(playersPerTeam[i]).fill(!needsIn)
    }
  }

  function processRound(
    teamIndex: number,
    playerIndex: number,
    currentScore: number,
    throws: DartThrow[],
  ): RoundResult | void {
    let score = currentScore
    const validThrows: DartThrow[] = []

    // check init
    if (
      !hasStarted[teamIndex] ||
      hasStarted[teamIndex].length <= 0
    ) {
      console.error('Game not setup')
      return
    }

    for (const dart of throws) {
      // Vérification ouverture
      if (!hasStarted[teamIndex]?.[playerIndex]) {
        if (!isValidOpeningDart(dart)) continue
        hasStarted[teamIndex][playerIndex] = true
      }

      const nextScore = score - dart.value

      // Check bust
      if (nextScore < 0 || (nextScore === 1 && needsOut())) {
        return {
          validThrows,
          bust: true,
          winner: false,
          pointsToSubstract: 0,
        }
      }

      validThrows.push(dart)

      // Victoire
      if (nextScore === 0) {
        if (!isValidClosingDart(dart)) {
          return {
            validThrows: validThrows.slice(0, -1),
            bust: true,
            winner: false,
            pointsToSubstract: 0,
          }
        }
        return {
          validThrows,
          bust: false,
          winner: true,
          pointsToSubstract: currentScore - nextScore,
        }
      }

      score = nextScore
    }

    return {
      validThrows,
      bust: false,
      winner: false,
      pointsToSubstract: currentScore - score,
    }
  }

  function needsOut(): boolean {
    return options.doubleOut || options.masterOut
  }

  function isValidOpeningDart(dart: DartThrow): boolean {
    if (!options.doubleIn && !options.masterIn) return true
    if (options.masterIn) return dart.multiplier >= 2
    return dart.multiplier === 2 || dart.sector === 50
  }

  function isValidClosingDart(dart: DartThrow): boolean {
    if (!options.doubleOut && !options.masterOut) return true
    if (options.masterOut) return dart.multiplier >= 2
    return dart.multiplier === 2 || dart.sector === 50
  }
  return { initHasStarted, processRound }
}
