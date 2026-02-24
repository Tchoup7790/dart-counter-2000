import type { DartThrow } from './dart-throw.interface'

export interface CricketOptions {
  crazy: boolean
  cutThroat: boolean
}

export interface RoundResultCricket {
  validThrows: DartThrow[]
  pointDeltas: { teamIndex: number; delta: number }[]
  winner: boolean
  pointsToAdd: number
}
