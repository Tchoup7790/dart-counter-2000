import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type {
  RoundResult221,
  TwoHundredTwentyOneOptions,
} from '@/models/interfaces/two-hundred-twenty-one.interface'
import type { RoundResultX01 } from '@/models/interfaces/x01.interface'

const TARGET = 221

export function use221(options: TwoHundredTwentyOneOptions) {
  function processRound(
    teamIndex: number,
    currentScore: number,
    allScores: number[],
    throws: DartThrow[],
  ): RoundResult221 {
    let score = currentScore
    const validThrows: DartThrow[] = []
    let winner = false

    for (const dart of throws) {
      const nextScore = score + dart.value

      if (nextScore > TARGET) continue

      if (nextScore === TARGET) {
        const isDouble =
          dart.multiplier === 2 || dart.sector === 50

        if (options.doubleOut && !isDouble) continue

        validThrows.push(dart)
        score = TARGET
        winner = true
        break
      }

      validThrows.push(dart)
      score = nextScore
    }

    const pointsToAdd: number = score - currentScore

    const resetToZero =
      !winner &&
      score > 0 &&
      allScores.some(
        (s, index) => index !== teamIndex && s === score,
      )
    return {
      validThrows,
      pointsToAdd,
      resetToZero,
      winner,
    }
  }

  return { processRound }
}
