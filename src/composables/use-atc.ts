import type {
  AtcOptions,
  AtcRoundResult,
} from '@/models/interfaces/arround-the-clock.interface'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'

export const ATC_SEQUENCE: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 25,
]

export function useAtc(options: AtcOptions) {
  let progress: number[] = []

  // init
  function init(teamCount: number) {
    progress = Array.from({ length: teamCount }, () => 0)
  }

  // process Round
  function processRound(
    teamIndex: number,
    throws: DartThrow[],
  ): AtcRoundResult {
    for (const dart of throws) {
      if (hasFinished(teamIndex)) break

      const target = nextTarget(teamIndex)
      const isBullStep = target === 25

      if (isBullStep) {
        const isBull = dart.sector === 25 || dart.sector === 50
        const isDoubleBull = dart.sector === 50

        if (!isBull) continue
        if (options.mustDouble && !isDoubleBull) continue

        // if bull
        progress[teamIndex] = Math.min(
          (progress[teamIndex] ?? 0) + 1,
          ATC_SEQUENCE.length,
        )
      } else {
        if (dart.sector !== target) continue

        progress[teamIndex] = Math.min(
          (progress[teamIndex] ?? 0) + dart.multiplier,
          ATC_SEQUENCE.length,
        )
      }

      if (hasFinished(teamIndex)) {
        return { winner: teamIndex }
      }
    }
    return { winner: undefined }
  }

  // helpers
  function hasFinished(teamIndex: number): boolean {
    return (progress[teamIndex] ?? 0) >= ATC_SEQUENCE.length
  }

  function nextTarget(teamIndex: number): number {
    const index = progress[teamIndex] ?? 0
    return ATC_SEQUENCE[index] ?? 25
  }

  return {
    progress,
    nextTarget,
    hasFinished,
    ATC_SEQUENCE,
    init,
    processRound,
  }
}
