export interface DartThrow {
  sector: number
  multiplier: 1 | 2 | 3
  value: number
}

export interface PlacedDart {
  throw: DartThrow
  teamIndex: number
  playerColor: string
}
