import type { Player } from './player.interface'

export interface Team {
  players: Player[]
  name: string
  points: number
}
