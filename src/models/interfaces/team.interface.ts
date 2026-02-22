import type { Player } from './player.interface'

export interface Team {
  players: Player[]
  points: number
  color: string
}
