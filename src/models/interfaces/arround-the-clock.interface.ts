import type { DartThrow } from './dart-throw.interface'

export interface AtcOptions {
  mustDouble: boolean
}

export interface RoundResultAtc {
  winner: boolean
  validThrows: DartThrow[]
  score: number
}
