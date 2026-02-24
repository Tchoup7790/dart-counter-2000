import { X01_VARIANTS } from '@/models/enums/x01-variants.enum'
import type { DartThrow } from '@/models/interfaces/dart-throw.interface'
import type {
  RoundResultX01,
  X01Options,
} from '@/models/interfaces/x01.interface'
import { defineStore } from 'pinia'

export interface X01State {
  hasStarted: boolean[][]
  options: X01Options
  currentTeamIndex: number | undefined
  currentPlayerIndex: number | undefined
  currentScore: number | undefined
  currentDartThrow: number
  currentValidThrows: DartThrow[]
}

export const useX01Store = defineStore('X01', {
  state: () =>
    ({
      hasStarted: [],
      options: {
        startingPoints: X01_VARIANTS.X301,
        doubleIn: false,
        doubleOut: false,
        masterIn: false,
        masterOut: false,
      },
      currentTeamIndex: undefined,
      currentPlayerIndex: undefined,
      currentScore: undefined,
      currentDartThrow: 0,
      currentValidThrows: [],
    }) as X01State,

  actions: {
    // Initialisation du jeu
    init(
      options: X01Options,
      teamCount: number,
      playersPerTeam: number[],
    ) {
      this.reset()
      this.options = options

      const needsIn: boolean =
        this.options.doubleIn || this.options.masterIn

      for (let i = 0; i < teamCount; i++) {
        this.hasStarted[i] = Array(playersPerTeam[i]).fill(
          !needsIn,
        )
      }
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
    processRound(dart: DartThrow): RoundResultX01 {
      this.checkIfPlayerExist()

      // incrément du nombre de fléchette jouer
      this.currentDartThrow++

      if (this.currentDartThrow >= 3) {
        throw new Error(
          'processRound: déjà trois fléchettes de lancées',
        )
      }

      if (!this.checkIfPlayerCanPlay(dart)) {
        return {
          validThrows: this.currentValidThrows,
          bust: false,
          winner: false,
          pointsToSubstract: 0,
        }
      }

      const nextScore = this.currentScore! - dart.value

      // Vérification d'un bust
      // * score négative
      // * score à 1 alors que besoin d'un double
      // * score à <25 alors que besoin d'une bull
      // * score à <50 alors que besoin d'une double bull
      if (
        nextScore < 0 ||
        (nextScore === 1 && this.options.doubleOut) ||
        (nextScore < 25 && this.options.masterOut) ||
        (nextScore < 50 &&
          this.options.masterOut &&
          this.options.doubleOut)
      ) {
        return {
          validThrows: this.currentValidThrows,
          bust: true,
          winner: false,
          pointsToSubstract: 0,
        }
      }

      this.currentValidThrows.push(dart)

      // Vérification de la Victoire
      // * score === 0
      // * cf. Vérification Bust
      if (nextScore === 0 && this.isValidClosingDart(dart)) {
        return {
          validThrows: this.currentValidThrows,
          bust: false,
          winner: true,
          pointsToSubstract: this.currentScore! - nextScore,
        }
      }

      this.currentScore = nextScore

      return {
        validThrows: this.currentValidThrows,
        bust: false,
        winner: false,
        pointsToSubstract: this.currentScore,
      }
    },

    // annuler le dernier le lancer
    cancelThrow(): RoundResultX01 {
      this.currentScore! -=
        this.currentValidThrows[
          this.currentDartThrow! - 1
        ]!.value

      this.currentDartThrow--
      this.currentValidThrows.pop()

      return {
        validThrows: this.currentValidThrows,
        bust: false,
        winner: false,
        pointsToSubstract: this.currentScore ?? 0,
      }
    },

    // Check si l'index de joueur existe
    checkIfPlayerExist() {
      if (
        !this.currentTeamIndex ||
        !this.currentPlayerIndex ||
        !this.currentScore ||
        !this.hasStarted[this.currentTeamIndex] ||
        this.hasStarted[this.currentTeamIndex]!.length <= 0 ||
        !this.hasStarted[this.currentTeamIndex]![
          this.currentPlayerIndex
        ]
      ) {
        throw new Error('processRound: Team or Player not Setup')
      }
    },

    // Check si le joueur à réussi son démarrage
    checkIfPlayerCanPlay(dart: DartThrow): boolean {
      // Si le joueur peut déjà jouer
      if (
        this.hasStarted[this.currentTeamIndex!]![
          this.currentPlayerIndex!
        ]
      ) {
        return true
      }

      // si ouverture valide
      if (this.isValidOpeningDart(dart)) {
        this.hasStarted[this.currentTeamIndex!]![
          this.currentPlayerIndex!
        ] = true
        return true
      }

      return false
    },

    // Vérification de si le lancer est valid pour l'ouverture
    isValidOpeningDart(dart: DartThrow): boolean {
      if (!this.options.doubleIn && !this.options.masterIn) {
        return true
      } else if (this.options.masterIn) {
        return dart.multiplier >= 2
      } else {
        return dart.multiplier === 2 || dart.sector === 50
      }
    },

    // Vérification de si le lancer est valid pour la fermeture
    isValidClosingDart(dart: DartThrow): boolean {
      if (this.options.doubleOut && this.options.masterOut) {
        return dart.sector === 50
      } else if (this.options.masterOut) {
        return dart.sector === 25 || dart.sector === 50
      } else if (this.options.doubleOut) {
        return dart.multiplier === 2 || dart.sector === 50
      } else {
        return true
      }
    },

    // reset du state
    reset() {
      this.hasStarted = []
      this.options = {
        startingPoints: X01_VARIANTS.X301,
        doubleIn: false,
        doubleOut: false,
        masterIn: false,
        masterOut: false,
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
