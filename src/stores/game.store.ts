import type { GameMode } from '@/models/enums/game-mode.enum'
import { STATUS } from '@/models/enums/status.enum'
import type { TwoHundredTwentyOneOptions } from '@/models/interfaces/two-hundred-twenty-one.interface'
import type { AtcOptions } from '@/models/interfaces/arround-the-clock.interface'
import type { CricketOptions } from '@/models/interfaces/cricket.interface'
import type { Team } from '@/models/interfaces/player.interface'
import type { Round } from '@/models/interfaces/round.interface'
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
    }) as GameState,

  persist: {
    key: 'game-store',
    pick: [
      'gameMode',
      'options',
      'status',
      'teams',
      'gameHistory',
      'teamWinner',
    ],
  },

  getters: {
    isPlaying(): boolean {
      return this.status === STATUS.PLAYING
    },
    isFinished(): boolean {
      return this.status === STATUS.FINISHED
    },
    // Donnes le nombre de round joué
    roundNumber(): number {
      return (
        Math.floor(this.gameHistory.length / this.teams.length) +
        1
      )
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
      this.status = STATUS.PLAYING
    },

    commitRound(round: Round) {
      this.gameHistory.unshift(round)
    },

    setWinner(teamIndex: number) {
      this.teamWinner = teamIndex
    },

    unsetWinner() {
      this.teamWinner = undefined
    },

    resetPlayerPoints() {
      this.teams.forEach((team: Team) => {
        team.score = 0
      })
    },

    setPoints(teamIndex: number, value: number) {
      this.teams[teamIndex]!.score = value
    },

    reset() {
      this.gameMode = undefined
      this.gameHistory = []
      this.teamWinner = undefined
      this.status = STATUS.SETUP
      this.options = undefined
    },

    restart() {
      this.gameHistory = []
      this.teamWinner = undefined
      this.status = STATUS.SETUP
    },
  },
})
