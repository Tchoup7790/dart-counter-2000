export interface Team {
  id: string
  name: string
  color: string
  points: number
  players: Player[]
}

export interface Player {
  id: string
  name: string
}

export interface SoloPlayer {
  id: string
  name: string
  color: string
}
