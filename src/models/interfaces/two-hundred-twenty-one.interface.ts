import type { DartThrow } from './dart-throw.interface'

export interface TwoHundredTwentyOneOptions {
  doubleOut: boolean
}

export interface RoundResult221 {
  validThrows: DartThrow[]
  bust: boolean
  resetToZero: number[]
  winner: boolean
  pointsToAdd: number
}
