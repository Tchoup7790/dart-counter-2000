import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type {
  RoundResultX01,
  X01Options,
} from '@/models/interfaces/x01.interface'

type HasStarted = boolean[][]

export function useX01(options: X01Options) {
  const hasStarted: HasStarted = []

  function init(teamCount: number, playersPerTeam: number[]) {
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
  ): RoundResultX01 | void {
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

  function suggestCheckout(score: number): string | undefined {
    return CHECKOUTS[score]
  }

  return { init, suggestCheckout, processRound }
}

const CHECKOUTS: Record<number, string> = {
  170: 'T20 T20 Bull',
  167: 'T20 T19 Bull',
  164: 'T20 T18 Bull',
  161: 'T20 T17 Bull',
  160: 'T20 T20 D20',
  158: 'T20 T20 D19',
  157: 'T20 T19 D20',
  156: 'T20 T20 D18',
  155: 'T20 T19 D19',
  154: 'T20 T18 D20',
  153: 'T20 T19 D18',
  152: 'T20 T20 D16',
  151: 'T20 T17 D20',
  150: 'T20 T18 D18',
  149: 'T20 T19 D16',
  148: 'T20 T16 D20',
  147: 'T20 T17 D18',
  146: 'T20 T18 D16',
  145: 'T20 T15 D20',
  144: 'T20 T20 D12',
  143: 'T20 T17 D16',
  142: 'T20 T14 D20',
  141: 'T20 T15 D18',
  140: 'T20 T20 D10',
  139: 'T20 T13 D20',
  138: 'T20 T18 D12',
  137: 'T20 T15 D16',
  136: 'T20 T20 D8',
  135: 'T20 T17 D12',
  134: 'T20 T14 D16',
  133: 'T20 T19 D8',
  132: 'T20 T16 D12',
  131: 'T20 T13 D16',
  130: 'T20 T18 D8',
  129: 'T19 T16 D12',
  128: 'T20 T16 D10',
  127: 'T20 T17 D8',
  126: 'T19 T19 D6',
  125: 'Bull Bull D25',
  124: 'T20 T16 D8',
  123: 'T19 T16 D9',
  122: 'T18 T18 D7',
  121: 'T20 T11 D14',
  120: 'T20 S20 D20',
  119: 'T19 T12 D13',
  118: 'T20 S18 D20',
  117: 'T20 S17 D20',
  116: 'T20 S16 D20',
  115: 'T20 S15 D20',
  114: 'T20 S14 D20',
  113: 'T20 S13 D20',
  112: 'T20 S12 D20',
  111: 'T20 S11 D20',
  110: 'T20 S10 D20',
  109: 'T20 S9 D20',
  108: 'T20 S8 D20',
  107: 'T19 S10 D20',
  106: 'T20 S6 D20',
  105: 'T20 S5 D20',
  104: 'T20 S4 D20',
  103: 'T20 S3 D20',
  102: 'T20 S2 D20',
  101: 'T20 S1 D20',
  100: 'T20 D20',
  99: 'T19 S10 D16',
  98: 'T20 D19',
  97: 'T19 D20',
  96: 'T20 D18',
  95: 'T19 D19',
  94: 'T18 D20',
  93: 'T19 D18',
  92: 'T20 D16',
  91: 'T17 D20',
  90: 'T18 D18',
  89: 'T19 D16',
  88: 'T20 D14',
  87: 'T17 D18',
  86: 'T18 D16',
  85: 'T15 D20',
  84: 'T20 D12',
  83: 'T17 D16',
  82: 'Bull D16',
  81: 'T19 D12',
  80: 'T20 D10',
  79: 'T13 D20',
  78: 'T18 D12',
  77: 'T19 D10',
  76: 'T20 D8',
  75: 'T17 D12',
  74: 'T14 D16',
  73: 'T19 D8',
  72: 'T16 D12',
  71: 'T13 D16',
  70: 'T18 D8',
  69: 'T19 D6',
  68: 'T20 D4',
  67: 'T17 D8',
  66: 'T10 D18',
  65: 'T19 D4',
  64: 'T16 D8',
  63: 'T13 D12',
  62: 'T10 D16',
  61: 'T15 D8',
  60: 'S20 D20',
  59: 'S19 D20',
  58: 'S18 D20',
  57: 'S17 D20',
  56: 'T16 D4',
  55: 'S15 D20',
  54: 'S14 D20',
  53: 'S13 D20',
  52: 'S12 D20',
  51: 'S11 D20',
  50: 'Bull',
  40: 'D20',
  36: 'D18',
  32: 'D16',
  24: 'D12',
  20: 'D10',
  16: 'D8',
  8: 'D4',
  4: 'D2',
  2: 'D1',
}
