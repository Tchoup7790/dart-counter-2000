export interface DartThrow {
  sector: number
  multiplier: 1 | 2 | 3
  value: number
  x: number
  y: number
}

export interface PlacedDart {
  throw: DartThrow
  teamIndex: number
  playerColor: string
}
