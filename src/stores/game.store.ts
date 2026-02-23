import type { GameMode } from '@/models/enums/game-mode.enum'
import { STATUS } from '@/models/enums/status.enum'
import type { TwoHundredTwentyOneOptions } from '@/models/interfaces/two-hundred-twenty-one.interface'
import type { AtcOptions } from '@/models/interfaces/arround-the-clock.interface'
import type { CricketOptions } from '@/models/interfaces/cricket.interface'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type { Player } from '@/models/interfaces/player.interface'
import type { Round } from '@/models/interfaces/round.interface'
import type { Team } from '@/models/interfaces/team.interface'
import type { X01Options } from '@/models/interfaces/x01.interface'
import { defineStore } from 'pinia'

export interface GameState {
  gameMode: GameMode | undefined
  options:
    | undefined
    | X01Options
    | CricketOptions
    | TwoHundredTwentyOneOptions
    | AtcOptions
  status: STATUS

  teams: Team[]
  gameHistory: Round[]
  teamWinner: number | undefined

  activeTeamIndex: number
  activePlayerIndex: number
  roundNumber: number

  currentThrows: DartThrow[]
}

export const useGameStore = defineStore('game', {
  state: () =>
    ({
      gameMode: undefined,
      options: undefined,
      status: STATUS.SETUP,

      teams: [],
      gameHistory: [],
      teamWinner: undefined,

      activeTeamIndex: 0,
      activePlayerIndex: 0,
      roundNumber: 1,

      currentThrows: [],
    }) as GameState,

  getters: {
    activeTeamPlayers(): Player[] {
      return this.teams[this.activeTeamIndex]?.players ?? []
    },
    activePlayer(): Player | undefined {
      return (
        this.activeTeamPlayers[this.activePlayerIndex] ??
        undefined
      )
    },

    isPlaying(): boolean {
      return this.status === STATUS.PLAYING
    },
    isFinished(): boolean {
      return this.status === STATUS.FINISHED
    },

    teamHistory: (state) => {
      return (teamIndex: number): Round[] => {
        return state.gameHistory.filter(
          (r) => r.team === teamIndex,
        )
      }
    },
  },

  actions: {
    initGame(payload: {
      mode: GameMode
      options:
        | X01Options
        | CricketOptions
        | TwoHundredTwentyOneOptions
        | AtcOptions
      teams: Team[]
    }) {
      this.gameMode = payload.mode
      this.options = payload.options
      this.teams = payload.teams
      this.gameHistory = []
      this.teamWinner = undefined
      this.activeTeamIndex = 0
      this.activePlayerIndex = 0
      this.roundNumber = 1
      this.currentThrows = []
      this.status = STATUS.PLAYING
    },

    registerThrow(dart: DartThrow): boolean {
      if (this.currentThrows.length >= 3) return false

      this.currentThrows.push(dart)
      return true
    },

    undoLastThrow(): DartThrow | undefined {
      return this.currentThrows.pop()
    },

    commitRound(throws: DartThrow[]) {
      const round: Round = {
        team: this.activeTeamIndex,
        throws,
      }
      this.gameHistory.push(round)
      this.currentThrows = []

      // Check if winner
      if (this.teamWinner !== undefined) {
        this.status = STATUS.FINISHED
        return
      }

      this.activePlayerIndex =
        (this.activePlayerIndex + 1) %
        this.activeTeamPlayers.length

      if (this.activeTeamIndex === this.teams.length - 1) {
        this.roundNumber++
      }
      this.activeTeamIndex =
        (this.activeTeamIndex + 1) % this.teams.length
    },

    setWinner(teamIndex: number) {
      this.teamWinner = teamIndex
    },

    resetPlayerPoints() {
      this.teams.forEach((team: Team) => {
        team.players.forEach((player: Player) => {
          player.points = 0
        })
      })
    },

    subtractPoints(teamIndex: number, amount: number) {
      this.teams[teamIndex]!.points -= amount
    },

    addPoints(teamIndex: number, amount: number) {
      this.teams[teamIndex]!.points += amount
    },

    restorePoints(teamIndex: number, value: number) {
      this.teams[teamIndex]!.points = value
    },

    reset() {
      this.gameMode = undefined
      this.teams = []
      this.gameHistory = []
      this.teamWinner = undefined
      this.activeTeamIndex = 0
      this.activePlayerIndex = 0
      this.roundNumber = 1
      this.currentThrows = []
      this.status = STATUS.SETUP
    },
  },
})
