import type { GameMode } from '../enum/game-mode.enum'
import type { Round } from './round.interface'
import type { Team } from './team.interface'

export interface GameState {
  teams: Team[]
  gameHistory: Round[]
  teamWinner: number | undefined
  currentRound: Round
  gameMode: GameMode
}
