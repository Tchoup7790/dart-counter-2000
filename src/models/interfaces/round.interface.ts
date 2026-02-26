import type { DartThrow } from './dart-throw.interface'

export interface Round {
  teamIndex: number
  playerIndex: number
  throws: DartThrow[]
  isBust: boolean
  isWinner: boolean
  score: number
}
