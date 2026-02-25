import type {
  AtcOptions,
  RoundResultAtc,
} from '@/models/interfaces/arround-the-clock.interface'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import { defineStore } from 'pinia'

export interface AtcState {
  options: AtcOptions
  currentTeamIndex: number | undefined
  currentPlayerIndex: number | undefined
  currentScore: number | undefined
  currentDartThrow: number
  currentValidThrows: DartThrow[]
}

export const useAtcStore = defineStore('Atc', {
  state: () =>
    ({
      options: {
        mustDouble: false,
      },
      currentTeamIndex: undefined,
      currentPlayerIndex: undefined,
      currentScore: undefined,
      currentDartThrow: 0,
      currentValidThrows: [],
    }) as AtcState,

  actions: {
    // Initialisation du jeu
    init(options: AtcOptions) {
      this.reset()
      this.options = options
    },

    // Initialisation d'un Round
    initRound(
      teamIndex: number,
      playerIndex: number,
      score: number,
    ) {
      this.resetRound()

      // Vérification d'un nouveau joueur / équipe
      if (
        this.currentTeamIndex === teamIndex &&
        this.currentPlayerIndex === playerIndex
      ) {
        throw new Error(
          'initRound: PlayerIndex And TeamIndex already set',
        )
      }

      this.currentTeamIndex = teamIndex
      this.currentPlayerIndex = playerIndex
      this.currentScore = score
    },

    // Processus d'un lancer
    processRound(dart: DartThrow): RoundResultAtc {
      this.checkIfPlayerExist()

      if (this.currentDartThrow >= 3) {
        throw new Error(
          'processRound: déjà trois fléchettes de lancées',
        )
      }

      // incrément du nombre de fléchette jouer
      this.currentDartThrow++

      this.currentScore = this.nextScore(dart)
      this.currentValidThrows.push(dart)

      // Vérification de la Victoire
      // * score === 25 | 50
      // * si mustDouble ? score === 50
      if (!this.options.mustDouble && this.currentScore === 25) {
        return {
          validThrows: this.currentValidThrows,
          winner: true,
          score: this.currentScore ?? 0,
        }
      }

      return {
        validThrows: this.currentValidThrows,
        winner: false,
        score: this.currentScore,
      }
    },

    // recupération du prochain score
    nextScore(dart: DartThrow): number {
      if (
        !this.options.mustDouble &&
        this.currentScore === 20 &&
        (dart.sector === 25 || dart.sector === 50)
      ) {
        return dart.sector
      } else if (this.currentScore! + 1 === dart.sector) {
        return dart.sector
      } else if (
        this.options.mustDouble &&
        this.currentScore === 20 &&
        dart.sector === 50
      ) {
        return dart.sector
      } else {
        return this.currentScore ?? 0
      }
    },

    // recupération du dernier score
    previousScore(): number {
      if (this.currentScore === 50 || this.currentScore === 25) {
        return 20
      } else if (this.currentScore! > 0) {
        return this.currentScore! - 1
      } else {
        return this.currentScore ?? 0
      }
    },

    // annuler le dernier le lancer
    cancelThrow(): RoundResultAtc {
      this.currentScore = this.previousScore()

      this.currentDartThrow--
      this.currentValidThrows.pop()

      return {
        validThrows: this.currentValidThrows,
        winner: false,
        score: this.currentScore ?? 0,
      }
    },

    // Check si l'index de joueur existe
    checkIfPlayerExist() {
      if (
        !this.currentTeamIndex === undefined ||
        !this.currentPlayerIndex === undefined ||
        !this.currentScore === undefined
      ) {
        throw new Error('processRound: Team or Player not Setup')
      }
    },

    // reset du state
    reset() {
      this.options = {
        mustDouble: false,
      }
      this.resetRound()
    },

    // reset round
    resetRound() {
      this.currentTeamIndex = undefined
      this.currentPlayerIndex = undefined
      this.currentScore = undefined
      this.currentDartThrow = 0
      this.currentValidThrows = []
    },
  },
})
