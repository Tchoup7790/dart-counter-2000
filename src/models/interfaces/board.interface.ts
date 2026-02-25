import type { DartThrow } from './dart-throw.interface'

export type Multiplier = 1 | 2 | 3

export interface BoardHitEvent {
  sector: number
  multiplier: Multiplier
  x: number
  y: number
}

export interface PlacedDart {
  throw: DartThrow
  teamIndex: number
  playerColor: string
}

export interface DartboardClickDetail {
  sector: number
  ring: number
  point: { x: number; y: number }
}
