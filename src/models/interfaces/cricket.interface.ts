import type { DartThrow } from './dart-throw.interface'

export interface CricketOptions {
  crazy: boolean
  cutThroat: boolean
}

export interface RoundResultCricket {
  validThrows: DartThrow[]
  winner: boolean
  pointsToAdd: number
}
