import type { DartThrow } from './dart-throw.interface'

export interface PlacedDart {
  throw: DartThrow
  teamIndex: number
  playerColor: string
}
